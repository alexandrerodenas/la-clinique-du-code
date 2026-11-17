# 🏥 La Clinique du Code — default install (OpenCode adapter), kept for compatibility.
# See docs/installation.md: node scripts/install.mjs <claude|opencode|copilot>
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
& (Join-Path $PSScriptRoot "adapters/opencode/install.ps1") @Arguments
exit $LASTEXITCODE
