[CmdletBinding()]
param(
  [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

Write-Host '=== DONELVIT OS Harness Initialization ==='

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'Node.js is required. Install Node.js 20 LTS or newer, then retry.'
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'npm is required. Install a supported Node.js distribution, then retry.'
}

if (-not $SkipInstall -and -not (Test-Path 'node_modules')) {
  Write-Host '=== npm ci (node_modules is absent) ==='
  npm ci
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host '=== npm run typecheck ==='
npm run typecheck
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host '=== npm run build ==='
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host '=== Verification Complete ==='
Write-Host 'Record the command result in feature_list.json and progress.md before declaring a feature complete.'
