# 🏥 La Clinique du Code — install of the OpenCode adapter.
# Thin wrapper around the cross-platform installer: node scripts/install.mjs opencode
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
& node (Join-Path $repoRoot "scripts/install.mjs") opencode @Arguments
exit $LASTEXITCODE
