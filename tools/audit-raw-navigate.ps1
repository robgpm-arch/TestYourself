param(
  [string]$Root = "src",
  [bool]$FailOnFindings = $true
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $Root)) { throw "Root not found: $Root" }

# Regex: find navigate(...) not preceded by navigateSafe(
$navigateCall = [regex]'(?<!navigateSafe\s*\()\bnavigate\s*\(\s*(?<target>[^,)\r\n]+)'

$files = Get-ChildItem -Path $Root -Recurse -Include *.ts,*.tsx |
  Where-Object { $_.FullName -notmatch '(?:^|[\\/])lib[\\/]+nav\.ts$' }

$findings = @()

foreach ($f in $files) {
  $i = 0
  Get-Content -LiteralPath $f.FullName | ForEach-Object {
    $i++
    $line = $_
    if ($line -match $navigateCall) {
      $target = ''
      if ($Matches -and $Matches.ContainsKey('target')) { $target = $Matches['target'] }
      $target = $target.Trim()

      # Ignore imports and type declarations
      if ($line -match '^\s*import\s+' -or $line -match '^\s*(type|interface)\s+') { return }

      # Classify target
      $kind = switch -regex ($target) {
        '^(''|"|`)\/' { 'literal' }
        '^(''|"|`)'    { 'literal-non-root' }
        '^\w+'         { 'identifier' }
        default         { 'dynamic' }
      }

      # Belt and suspenders: skip if line already contains navigateSafe(
      if ($line -match 'navigateSafe\s*\(') { return }

      $findings += [pscustomobject]@{
        File    = $f.FullName
        Line    = $i
        Kind    = $kind
        Target  = $target
        Snippet = $line.Trim()
      }
    }
  }
}

if ($findings.Count -eq 0) {
  Write-Host "✅ No raw navigate(...) calls found." -ForegroundColor Green
  exit 0
}

Write-Host "`n⚠️  Raw navigate(...) calls found:`n" -ForegroundColor Yellow
$findings |
  Select-Object File, Line, Kind, Target, Snippet |
  Sort-Object File, Line |
  Format-Table -AutoSize

$report = "tools/audit-raw-navigate-report.csv"
$findings | Export-Csv -Path $report -NoTypeInformation -Encoding UTF8
Write-Host "`nReport written: $report"

if ($FailOnFindings) {
  Write-Host "`nExit 1 due to findings (use -FailOnFindings:`$false to suppress in local runs)." -ForegroundColor Yellow
  exit 1
} else {
  exit 0
}
