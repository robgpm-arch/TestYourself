<#!
.SYNOPSIS
Re-run failed/cancelled GitHub Actions runs for a PR and wait.

.DESCRIPTION
Given a pull request number, this script:
- Detects the `owner/repo` (or uses `-Repo`) and PR head SHA.
- Finds all GitHub Actions workflow runs for that head SHA.
- Re-runs runs with conclusion = failed/cancelled/timed_out.
- Polls until all runs for the head SHA complete successfully (or time out).
- Optionally enables auto-merge (GraphQL) or merges the PR directly when possible.

Requires an access token with `repo` scope. Provide via `-Token` or `GH_PAT` env var.

.PARAMETER PrNum
Pull request number.

.PARAMETER Repo
`owner/repo`. If omitted, attempts to infer from `git remote get-url origin`.

.PARAMETER Token
GitHub token. Defaults to `$env:GH_PAT`.

.PARAMETER PollSeconds
Polling interval in seconds. Default: 15.

.PARAMETER TimeoutMinutes
Overall timeout in minutes while waiting for runs. Default: 90.

.PARAMETER EnableAutoMerge
If set, attempts to enable auto-merge via GraphQL after verifying runs are green. If merging is already possible, merges immediately.

.PARAMETER MergeMethod
Merge method to use when merging or enabling auto-merge. One of: merge, squash, rebase. Default: squash.

.EXAMPLE
$env:GH_PAT = 'ghp_xxx'
pwsh tools/retry-ci.ps1 -PrNum 1

.EXAMPLE
pwsh tools/retry-ci.ps1 -PrNum 1 -EnableAutoMerge

#>

param(
  [Parameter(Mandatory=$true)]
  [int]$PrNum,

  [string]$Repo,

  [string]$Token = $env:GH_PAT,

  [ValidateRange(5,300)]
  [int]$PollSeconds = 15,

  [ValidateRange(1,720)]
  [int]$TimeoutMinutes = 90,

  [switch]$EnableAutoMerge,

  [ValidateSet('merge','squash','rebase')]
  [string]$MergeMethod = 'squash'
)

$ErrorActionPreference = 'Stop'

function Write-Info($Message) {
  Write-Host "[INFO] $Message"
}
function Write-Warn($Message) {
  Write-Host "[WARN] $Message" -ForegroundColor Yellow
}
function Write-ErrMsg($Message) {
  Write-Host "[ERROR] $Message" -ForegroundColor Red
}

if (-not $Token) {
  Write-ErrMsg "GitHub token not provided. Set -Token or GH_PAT env var."
  exit 2
}

function Resolve-Repo([string]$Repo) {
  if ($Repo) {
    if ($Repo -match '^[^/]+/[^/]+$') { return $Repo }
    Write-ErrMsg "Invalid -Repo format. Use 'owner/repo'."
    exit 2
  }
  try {
    $origin = (git remote get-url origin 2>$null)
    if (-not $origin) { throw "No git origin configured" }
    # Supports https and SSH forms
    if ($origin -match 'github.com[/:]([^/]+)/([^/.]+)') {
      return "$($matches[1])/$($matches[2])"
    }
    throw "Cannot parse owner/repo from origin: $origin"
  } catch {
    Write-ErrMsg "Failed to infer repo. Pass -Repo 'owner/repo'. Details: $($_.Exception.Message)"
    exit 2
  }
}

$repoFull = Resolve-Repo -Repo $Repo
$owner, $repo = $repoFull.Split('/')
Write-Info "Repository: $repoFull | PR #$PrNum"

$ghHeaders = @{ 
  'Accept' = 'application/vnd.github+json'
  'Authorization' = "Bearer $Token"
  'X-GitHub-Api-Version' = '2022-11-28'
  'User-Agent' = 'retry-ci.ps1'
}

function Invoke-GitHubRest {
  param(
    [Parameter(Mandatory=$true)][ValidateSet('GET','POST','PUT','PATCH','DELETE')][string]$Method,
    [Parameter(Mandatory=$true)][string]$Path, # e.g. /repos/{owner}/{repo}/pulls/1
    [object]$Body
  )
  $uri = "https://api.github.com$Path"
  $args = @{ Method = $Method; Uri = $uri; Headers = $ghHeaders }
  if ($PSBoundParameters.ContainsKey('Body')) {
    $json = $Body | ConvertTo-Json -Depth 10
    $args['Body'] = $json
    $args['ContentType'] = 'application/json'
  }
  return Invoke-RestMethod @args
}

function Invoke-GitHubGraphQL {
  param(
    [Parameter(Mandatory=$true)][string]$Query,
    [hashtable]$Variables
  )
  $body = @{ query = $Query }
  if ($Variables) { $body['variables'] = $Variables }
  $uri = 'https://api.github.com/graphql'
  $headers = $ghHeaders.Clone()
  $headers['Accept'] = 'application/json'
  return Invoke-RestMethod -Method POST -Uri $uri -Headers $headers -Body ($body | ConvertTo-Json -Depth 10) -ContentType 'application/json'
}

function Get-PrInfo {
  return Invoke-GitHubRest -Method GET -Path "/repos/$owner/$repo/pulls/$PrNum"
}

function Get-WorkflowRunsForHeadSha([string]$HeadSha) {
  # Prefer head_sha filter to focus only the target commit
  $resp = Invoke-GitHubRest -Method GET -Path "/repos/$owner/$repo/actions/runs?head_sha=$HeadSha&per_page=100"
  return $resp.workflow_runs
}

function Rerun-Run([int64]$RunId) {
  Write-Info "Triggering rerun for run $RunId"
  try {
    [void](Invoke-GitHubRest -Method POST -Path "/repos/$owner/$repo/actions/runs/$RunId/rerun")
  } catch {
    Write-Warn "Failed to trigger rerun for $RunId: $($_.Exception.Message)"
  }
}

function All-Runs-Green($Runs) {
  # Consider a run OK if completed with success or skipped
  foreach ($r in $Runs) {
    if ($r.status -ne 'completed') { return $false }
    $okConclusions = @('success','skipped')
    if ($okConclusions -notcontains $r.conclusion) { return $false }
  }
  return $true
}

function Any-Runs-Red($Runs) {
  $bad = @('failure','cancelled','timed_out','startup_failure')
  foreach ($r in $Runs) {
    if ($r.status -eq 'completed' -and ($bad -contains $r.conclusion)) { return $true }
  }
  return $false
}

function Enable-AutoMergeOrMerge([string]$PrNodeId, [string]$MergeMethod) {
  # Attempt to enable auto-merge; if not supported, attempt direct merge when possible
  $methodMap = @{ 'merge'='MERGE'; 'squash'='SQUASH'; 'rebase'='REBASE' }
  $mm = $methodMap[$MergeMethod]
  $mutation = @"
mutation(
  	$`prId: ID!,
    $`mergeMethod: PullRequestMergeMethod!
) {
  enablePullRequestAutoMerge(input: { pullRequestId: $`prId, mergeMethod: $`mergeMethod }) {
    pullRequest { number autoMergeRequest { enabledAt } }
  }
}
"@
  try {
    $resp = Invoke-GitHubGraphQL -Query $mutation -Variables @{ prId = $PrNodeId; mergeMethod = $mm }
    if ($resp.errors) {
      $errMsg = ($resp.errors | ConvertTo-Json -Depth 10)
      Write-Warn "GraphQL auto-merge enable returned errors: $errMsg"
    } else {
      Write-Info "Auto-merge enabled for PR #$PrNum"
      return
    }
  } catch {
    Write-Warn "Failed to enable auto-merge via GraphQL: $($_.Exception.Message)"
  }

  # Fallback: try to merge directly if possible
  try {
    $mergeBody = @{ merge_method = $MergeMethod }
    $mergeResp = Invoke-GitHubRest -Method PUT -Path "/repos/$owner/$repo/pulls/$PrNum/merge" -Body $mergeBody
    if ($mergeResp.merged -eq $true) {
      Write-Info "PR merged via $MergeMethod. SHA: $($mergeResp.sha)"
      return
    }
    Write-Warn "Merge not completed: $($mergeResp.message)"
  } catch {
    Write-Warn "Direct merge failed: $($_.Exception.Message)"
  }
}

# --- Main flow ---

$pr = Get-PrInfo
if (-not $pr) { Write-ErrMsg "PR #$PrNum not found."; exit 3 }
$headSha = $pr.head.sha
$headRef = $pr.head.ref
Write-Info "PR head: $headRef @ $headSha"

# Get current runs for the head SHA
$runs = Get-WorkflowRunsForHeadSha -HeadSha $headSha
if (-not $runs) { Write-Warn "No workflow runs found for head SHA $headSha" }
else { Write-Info ("Found {0} runs for head SHA" -f $runs.Count) }

# Trigger reruns for failed/cancelled runs
$needRerun = @()
foreach ($r in $runs) {
  if ($r.status -eq 'completed' -and @('failure','cancelled','timed_out','startup_failure') -contains $r.conclusion) {
    $needRerun += $r
  }
}

if ($needRerun.Count -gt 0) {
  Write-Info ("Re-running {0} failed/cancelled runs" -f $needRerun.Count)
  foreach ($r in $needRerun) { Rerun-Run -RunId $r.id }
} else {
  Write-Info "No failed/cancelled runs to re-run. Will verify status."
}

# Poll until all runs are green or timeout
$deadline = (Get-Date).AddMinutes($TimeoutMinutes)
do {
  Start-Sleep -Seconds $PollSeconds
  $runs = Get-WorkflowRunsForHeadSha -HeadSha $headSha

  $total = $runs.Count
  $completed = ($runs | Where-Object { $_.status -eq 'completed' }).Count
  $success = ($runs | Where-Object { $_.status -eq 'completed' -and $_.conclusion -eq 'success' }).Count
  $failed = ($runs | Where-Object { $_.status -eq 'completed' -and @('failure','cancelled','timed_out','startup_failure') -contains $_.conclusion }).Count
  Write-Host "Status: total=$total, completed=$completed, success=$success, failed=$failed"

  if (All-Runs-Green $runs) { break }
  if (Any-Runs-Red $runs -and $needRerun.Count -eq 0) {
    # If we didn't rerun anything earlier but see red, try one rerun attempt for those runs
    foreach ($r in $runs) {
      if ($r.status -eq 'completed' -and @('failure','cancelled','timed_out','startup_failure') -contains $r.conclusion) {
        Rerun-Run -RunId $r.id
      }
    }
    # avoid spamming reruns; set a guard
    $needRerun = @('done')
  }
} while ((Get-Date) -lt $deadline)

if (-not (All-Runs-Green $runs)) {
  Write-ErrMsg "CI did not reach all-success before timeout. Investigate failing runs in GitHub."
  exit 4
}

Write-Info "All workflow runs for head SHA succeeded."

if ($EnableAutoMerge) {
  $pr = Get-PrInfo
  $nodeId = $pr.node_id
  if (-not $nodeId) {
    Write-Warn "PR node_id missing; cannot enable auto-merge via GraphQL."
  } else {
    Enable-AutoMergeOrMerge -PrNodeId $nodeId -MergeMethod $MergeMethod
  }
}

Write-Info "Done."
