Param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]] $Args
)

# Windows-friendly commit helper: skip detect-secrets locally.
# CI (GitHub Actions) still runs the Linux Secret Scan workflow and blocks leaks.
$env:SKIP = "detect-secrets"
try {
  git commit @Args
} finally {
  Remove-Item Env:SKIP -ErrorAction SilentlyContinue
}

