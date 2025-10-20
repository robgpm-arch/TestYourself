Param(
  [string] $Owner = 'robgpm-arch',
  [string] $Repo  = 'TestYourself',
  [string] $Branch = 'ci/protect-main-workflow',
  [int]    $PrNum = 1,
  [string] $WorkflowName = 'Secret Scan (detect-secrets)',
  [int]    $PollEverySec = 10,
  [int]    $MaxMinutes   = 20
)

$ErrorActionPreference = 'Stop'

function Get-Json($url, $Headers)    { Invoke-RestMethod -Method Get -Uri $url -Headers $Headers }
function Post-Json($url, $b, $Headers){ Invoke-RestMethod -Method Post -Uri $url -Headers $Headers -Body ($b | ConvertTo-Json -Depth 10) }
function Post-Empty($url, $Headers)  { Invoke-RestMethod -Method Post -Uri $url -Headers $Headers -Body '{}' }

if (-not (git rev-parse --is-inside-work-tree 2>$null)) {
  throw 'Run this from inside the repository root.'
}

$Token = $env:GH_PAT
if (-not $Token) {
  throw 'GH_PAT not set. Create a repo-scoped token and set $env:GH_PAT.'
}
$Headers = @{ Authorization = "Bearer $Token"; 'User-Agent'='codex-script'; Accept='application/vnd.github+json' }

# 1) Find workflow id
$wfs = Get-Json "https://api.github.com/repos/$Owner/$Repo/actions/workflows" $Headers
$wf = $wfs.workflows | Where-Object { $_.name -eq $WorkflowName } | Select-Object -First 1
if (-not $wf) { throw "Workflow '$WorkflowName' not found." }
$wfId = $wf.id
Write-Host "✓ Found workflow '$WorkflowName' (id=$wfId)" -ForegroundColor Green

# 2) Rerun or dispatch
$runs = Get-Json "https://api.github.com/repos/$Owner/$Repo/actions/workflows/$wfId/runs?branch=$Branch&per_page=5" $Headers
$run  = $runs.workflow_runs | Sort-Object created_at -Descending | Select-Object -First 1
if ($run) {
  $runId = $run.id
  $runUrl = $run.html_url
  Write-Host "↻ Requesting rerun of run $runId" -ForegroundColor Yellow
  Post-Empty "https://api.github.com/repos/$Owner/$Repo/actions/runs/$runId/rerun" $Headers | Out-Null
} else {
  Write-Host "Dispatching workflow on '$Branch'..." -ForegroundColor Yellow
  Post-Json "https://api.github.com/repos/$Owner/$Repo/actions/workflows/$wfId/dispatches" @{ ref = $Branch } $Headers | Out-Null
  Start-Sleep -Seconds 5
  $runs = Get-Json "https://api.github.com/repos/$Owner/$Repo/actions/workflows/$wfId/runs?branch=$Branch&per_page=5" $Headers
  $run  = $runs.workflow_runs | Sort-Object created_at -Descending | Select-Object -First 1
  if (-not $run) { throw 'Could not find a workflow run after dispatch.' }
  $runId = $run.id
  $runUrl = $run.html_url
}
Write-Host "🔗 Run URL: $runUrl"

# 3) Poll until success/failure/timeout
$deadline = (Get-Date).AddMinutes($MaxMinutes)
$lastStatus = ''
do {
  $r = Get-Json "https://api.github.com/repos/$Owner/$Repo/actions/runs/$runId" $Headers
  $status = "$($r.status)/$($r.conclusion)"
  if ($status -ne $lastStatus) { Write-Host "• Status: $status" -ForegroundColor Cyan; $lastStatus = $status }
  if ($r.status -eq 'completed') { break }
  Start-Sleep -Seconds $PollEverySec
} while ((Get-Date) -lt $deadline)

if ($r.status -ne 'completed') { throw "Timeout waiting. See $runUrl" }
if ($r.conclusion -ne 'success') { throw "Workflow finished with '$($r.conclusion)'. See $runUrl" }
Write-Host '✓ Secret Scan succeeded.' -ForegroundColor Green

# 4) Enable auto-merge (squash) via GraphQL
$GraphUrl = 'https://api.github.com/graphql'
$RepoQ = @"
query PRId(
  \$owner:String!, \$name:String!, \$num:Int!
) {
  repository(owner:\$owner, name:\$name) {
    pullRequest(number:\$num) { id, url, autoMergeRequest { enabledAt } }
  }
}
"@

$body = @{ query=$RepoQ; variables=@{ owner=$Owner; name=$Repo; num=$PrNum } } | ConvertTo-Json -Depth 10
$resp = Invoke-RestMethod -Method Post -Uri $GraphUrl -Headers $Headers -Body $body
$prId = $resp.data.repository.pullRequest.id
$prUrl = $resp.data.repository.pullRequest.url
if (-not $prId) { throw 'Could not retrieve GraphQL PR id.' }

$EnableAuto = @"
mutation Enable(\$pr:ID!) {
  enablePullRequestAutoMerge(input:{ pullRequestId:\$pr, mergeMethod:SQUASH }) {
    pullRequest { url, autoMergeRequest { enabledAt } }
  }
}
"@

$body2 = @{ query=$EnableAuto; variables=@{ pr=$prId } } | ConvertTo-Json -Depth 10
$resp2 = Invoke-RestMethod -Method Post -Uri $GraphUrl -Headers $Headers -Body $body2

Write-Host "✓ Auto-merge (Squash) enabled for $prUrl" -ForegroundColor Green
Write-Host 'It will merge automatically when protections & checks pass.'

