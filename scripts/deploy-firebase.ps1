<#
Simple helper to build and deploy to Firebase Hosting using FIREBASE_TOKEN
Usage:
  # interactive login
  firebase login
  .\scripts\deploy-firebase.ps1

  # CI or token usage (recommended for automation)
  $env:FIREBASE_TOKEN = '<token>'
  .\scripts\deploy-firebase.ps1
#>

if (-not (Test-Path -Path "./node_modules")) {
  Write-Output "Installing dependencies..."
  npm ci
}

Write-Output "Building project..."
npm run build

if (-not $env:FIREBASE_TOKEN) {
  Write-Output "No FIREBASE_TOKEN provided — attempting interactive login if firebase CLI installed."
  Write-Output "If this is CI, set FIREBASE_TOKEN environment variable and re-run."
} else {
  Write-Output "Using FIREBASE_TOKEN from environment (will not be saved)."
}

Write-Output "Deploying to Firebase Hosting..."
# If FIREBASE_TOKEN is set, the firebase CLI will pick it up. If not, it will try interactive login.
firebase deploy --only hosting

Write-Output "Done."
