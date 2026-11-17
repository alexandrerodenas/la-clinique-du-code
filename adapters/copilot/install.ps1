# 🏥 La Clinique du Code — install of the GitHub Copilot adapter into a project.
# Thin wrapper around the cross-platform installer: node scripts/install.mjs copilot --project <dir>
param(
    [string]$ProjectRoot = (Get-Location).Path,
    [Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments
)
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
& node (Join-Path $repoRoot "scripts/install.mjs") copilot --project $ProjectRoot @Arguments
exit $LASTEXITCODE
