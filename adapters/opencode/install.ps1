# 🏥 La Clinique du Code — Adaptateur OpenCode (Windows / PowerShell)
# Installe les protocoles du core dans le format attendu par OpenCode.

$ErrorActionPreference = "Stop"

$adapterRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent (Split-Path -Parent $adapterRoot)
$opencodeConfig = Join-Path $env:USERPROFILE ".config\opencode"
$skillsTarget = Join-Path $opencodeConfig "skills"
$commandsTarget = Join-Path $opencodeConfig "commands"
$agentsTarget = Join-Path $opencodeConfig "agent"

Write-Host "`n🏥  La Clinique du Code — Adaptateur OpenCode`n" -ForegroundColor Cyan

if (-not (Test-Path -LiteralPath $opencodeConfig)) {
    Write-Host "  Création du dossier de configuration OpenCode : $opencodeConfig"
    New-Item -ItemType Directory -Path $opencodeConfig -Force | Out-Null
}

Write-Host "  ➜ Installation des protocoles comme skills..."
New-Item -ItemType Directory -Path $skillsTarget -Force | Out-Null
Get-ChildItem -LiteralPath (Join-Path $repoRoot "core\protocols") -File -Filter "*.md" | ForEach-Object {
    $skillName = $_.BaseName
    $skillTarget = Join-Path $skillsTarget $skillName
    Write-Host "    - $skillName"
    New-Item -ItemType Directory -Path $skillTarget -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $skillTarget "SKILL.md") -Force
}
$analyzerSource = Join-Path $repoRoot "core\tools\zone-of-pain-analyzer.js"
$analyzerTarget = Join-Path $skillsTarget "zone-of-pain\zone-of-pain-analyzer.js"
Copy-Item -LiteralPath $analyzerSource -Destination $analyzerTarget -Force

Write-Host "  ➜ Installation des agents (plan + chirurgien)..."
New-Item -ItemType Directory -Path $agentsTarget -Force | Out-Null
Get-ChildItem -LiteralPath (Join-Path $adapterRoot "agents") -File -Filter "*.md" | ForEach-Object {
    Write-Host "    - $($_.BaseName)"
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $agentsTarget $_.Name) -Force
}

Write-Host "  ➜ Installation de la commande /checkup..."
New-Item -ItemType Directory -Path $commandsTarget -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $adapterRoot "commands\checkup.md") -Destination (Join-Path $commandsTarget "checkup.md") -Force

Write-Host "`n  ✅ Installation terminée. Les praticiens sont prêts à recevoir vos patients.`n" -ForegroundColor Green

Write-Host "  📋 Dernière étape — le système prompt de la clinique`n" -ForegroundColor Yellow
Write-Host "  Pour que votre assistant propose naturellement des checkups, ajoutez le bloc" -ForegroundColor Yellow
Write-Host "  suivant à votre AGENTS.md (global ou par projet) :`n" -ForegroundColor Yellow
Write-Host "  -------------------------------------------------------------------------" -ForegroundColor DarkGray
Get-Content -LiteralPath (Join-Path $adapterRoot "templates\AGENTS.md.clinic") -Encoding UTF8 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
Write-Host "  -------------------------------------------------------------------------`n" -ForegroundColor DarkGray

Write-Host "  🚀 Redémarrez OpenCode pour que la Clinique prenne effet.`n" -ForegroundColor Cyan
