# 🏥 La Clinique du Code — manual install of the Claude Code adapter.
# Thin wrapper around the cross-platform installer: node scripts/install.mjs claude
# Prefer the plugin: claude plugin marketplace add alexandrerodenas/la-clinique-du-code
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
& node (Join-Path $repoRoot "scripts/install.mjs") claude @Arguments
exit $LASTEXITCODE
