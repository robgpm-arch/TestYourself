Param(
  [string]$Owner    = "robgpm-arch",
  [string]$Repo     = "TestYourself",
  [int]   $PrNum    = 1,
  [int]   $PollEverySec = 10,
  [int]   $MaxMinutes   = 30,
  [switch]$EnableAutoMerge # optional: enable auto-merge (squash) if all pass
)

$ErrorActionPreference = 'Stop'

if (-not $env:GH_PAT) { throw "Set a GitHub token first:  `$env:GH_PAT = 'ghp_xxx'`" }
$Headers = @{ Authorization = "Bearer $($env:GH_PAT)"; "User-Agent"="retry-ci"; Accept="application/vnd.github+json" }

function GetJson($url){ Invoke-RestMethod -Method Get -Headers $Headers -Uri $url }
function PostEmpty($url){ Invoke-RestMethod -Method Post -Headers $Headers -Uri $url -Body '{}' }
function PostJson($url,$obj){ Invoke-RestMethod -Method Post -Headers $Headers -Uri $url -Body ($obj | ConvertTo-Json -Depth 10) }

# --- PR info (branch + head SHA)
$pr = GetJson "https://api.github.com/repos/$Owner/$Repo/pulls/$PrNum"
$branch = $pr.head.ref
$sha    = $pr.head.sha
Write-Host "PR #$PrNum → branch '$branch', SHA $sha"

# --- List workflow runs for this branch; filter to the PR head SHA
$runs = GetJson "https://api.github.com/repos/$Owner/$Repo/actions/runs?branch=$branch&per_page=100"
$targetRuns = @($runs.workflow_runs | Where-Object { $_.head_sha -eq $sha })
if (-not $targetRuns -or $targetRuns.Count -eq 0) {
  Write-Warning "No workflow runs found for this PR head SHA ($sha). Push or trigger CI first."
  exit 0
}

# --- Re-run FAILED/CANCELLED/TIMED_OUT runs
$toRerun = $targetRuns | Where-Object {
  $_.status -eq 'completed' -and $_.conclusion -in @('failure','cancelled','timed_out','action_required')
}
if ($toRerun.Count -gt 0) {
  foreach($r in $toRerun){
    Write-Host ("↻ Rerunning: {0}  (id {1})" -f $r.name,$r.id) -ForegroundColor Yellow
    PostEmpty "https://api.github.com/repos/$Owner/$Repo/actions/runs/$($r.id)/rerun" | Out-Null
  }
} else {
  Write-Host "No failed runs to re-run; will just wait for in-progress/queued ones." -ForegroundColor Yellow
}

# --- Poll until ALL runs for this SHA are completed+success (or timeout)
$deadline = (Get-Date).AddMinutes($MaxMinutes)
$lastSummary = ""

function FetchState() {
  $all = GetJson "https://api.github.com/repos/$Owner/$Repo/actions/runs?branch=$branch&per_page=100"
  @($all.workflow_runs | Where-Object { $_.head_sha -eq $sha })
}

do {
  $state = FetchState
  $total = $state.Count
  $completed = @($state | Where-Object { $_.status -eq 'completed' })
  $failed    = @($completed | Where-Object { $_.conclusion -ne 'success' })
  $inprog    = @($state | Where-Object { $_.status -ne 'completed' })

  $summary = "total:$total completed:$($completed.Count) in_progress:$($inprog.Count) failed:$($failed.Count)"
  if ($summary -ne $lastSummary) {
    Write-Host ("• Status — {0}" -f $summary) -ForegroundColor Cyan
    $lastSummary = $summary
  }

  if ($inprog.Count -eq 0 -and $failed.Count -eq 0 -and $total -gt 0) { break }
  if ((Get-Date) -gt $deadline) { throw "Timeout waiting for CI to finish for PR #$PrNum" }

  Start-Sleep -Seconds $PollEverySec
} while ($true)

Write-Host "✅ All workflow runs for PR #$PrNum (SHA $sha) completed successfully."

if ($EnableAutoMerge) {
  # Enable auto-merge (squash) via GraphQL
  $Graph = "https://api.github.com/graphql"
  $q = @"
query Q(\$owner:String!, \$name:String!, \$num:Int!) {
  repository(owner:\$owner, name:\$name) { pullRequest(number:\$num) { id url } }
}
"@
  $body = @{ query=$q; variables=@{ owner=$Owner; name=$Repo; num=$PrNum } } | ConvertTo-Json -Depth 10
  $resp = Invoke-RestMethod -Method Post -Uri $Graph -Headers $Headers -Body $body
  $prId = $resp.data.repository.pullRequest.id
  $prUrl= $resp.data.repository.pullRequest.url
  if (-not $prId) { throw "Could not resolve PR node id for auto-merge." }

  $m = @"
mutation M(\$pr:ID!) {
  enablePullRequestAutoMerge(input:{ pullRequestId:\$pr, mergeMethod:SQUASH }) {
    pullRequest { url }
  }
}
"@
  $body2 = @{ query=$m; variables=@{ pr=$prId } } | ConvertTo-Json -Depth 10
  $resp2 = Invoke-RestMethod -Method Post -Uri $Graph -Headers $Headers -Body $body2
  Write-Host "🟢 Auto-merge (squash) enabled for $prUrl"
}

