# 🏥 La Clinique du Code — Installation (Windows / PowerShell)
# Prend rendez-vous : installe les praticiens et la commande /checkup dans opencode.

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$opencodeConfig = Join-Path $env:USERPROFILE ".config\opencode"
$skillsTarget = Join-Path $opencodeConfig "skills"
$commandsTarget = Join-Path $opencodeConfig "commands"

Write-Host "`n🏥  La Clinique du Code — Installation`n" -ForegroundColor Cyan

if (-not (Test-Path -LiteralPath $opencodeConfig)) {
    Write-Host "  Création du dossier de configuration opencode : $opencodeConfig"
    New-Item -ItemType Directory -Path $opencodeConfig -Force | Out-Null
}

Write-Host "  ➜ Installation des praticiens (skills)..."
New-Item -ItemType Directory -Path $skillsTarget -Force | Out-Null
Get-ChildItem -LiteralPath (Join-Path $repoRoot "skills") -Directory | ForEach-Object {
    Write-Host "    - $($_.Name)"
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $skillsTarget $_.Name) -Recurse -Force
}

Write-Host "  ➜ Installation de la commande /checkup..."
New-Item -ItemType Directory -Path $commandsTarget -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $repoRoot "commands\checkup.md") -Destination (Join-Path $commandsTarget "checkup.md") -Force

Write-Host "`n  ✅ Installation terminée. Les praticiens sont prêts à recevoir vos patients.`n" -ForegroundColor Green

Write-Host "  📋 Dernière étape — le système prompt de la clinique`n" -ForegroundColor Yellow
Write-Host "  Pour que votre assistant propose naturellement des checkups, ajoutez le bloc" -ForegroundColor Yellow
Write-Host "  suivant à votre AGENTS.md (global ou par projet) :`n" -ForegroundColor Yellow
Write-Host "  -------------------------------------------------------------------------" -ForegroundColor DarkGray
Get-Content -LiteralPath (Join-Path $repoRoot "templates\AGENTS.md.clinic") -Encoding UTF8 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
Write-Host "  -------------------------------------------------------------------------`n" -ForegroundColor DarkGray

Write-Host "  🚀 Redémarrez opencode pour que la Clinique prenne effet.`n" -ForegroundColor Cyan
