# 🏥 La Clinique du Code — Adaptateur Claude Code (Windows / PowerShell)
# Installe les protocoles du core dans le format attendu par Claude Code.

$ErrorActionPreference = "Stop"

$adapterRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent (Split-Path -Parent $adapterRoot)
$claudeConfig = Join-Path $env:USERPROFILE ".claude"
$skillsTarget = Join-Path $claudeConfig "skills"
$commandsTarget = Join-Path $claudeConfig "commands"
$agentsTarget = Join-Path $claudeConfig "agents"

Write-Host "`n🏥  La Clinique du Code — Adaptateur Claude Code`n" -ForegroundColor Cyan

if (-not (Test-Path -LiteralPath $claudeConfig)) {
    Write-Host "  Création du dossier de configuration Claude Code : $claudeConfig"
    New-Item -ItemType Directory -Path $claudeConfig -Force | Out-Null
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

Write-Host "  ➜ Installation des subagents (praticiens + chirurgien)..."
New-Item -ItemType Directory -Path $agentsTarget -Force | Out-Null
Get-ChildItem -LiteralPath (Join-Path $adapterRoot "agents") -File -Filter "*.md" | ForEach-Object {
    Write-Host "    - $($_.BaseName)"
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $agentsTarget $_.Name) -Force
}

Write-Host "  ➜ Installation de la commande /checkup..."
New-Item -ItemType Directory -Path $commandsTarget -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $adapterRoot "commands\checkup.md") -Destination (Join-Path $commandsTarget "checkup.md") -Force
Write-Host "  ➜ Installation de la commande /intensive-care (alias /soins-intensifs)..."
Copy-Item -LiteralPath (Join-Path $adapterRoot "commands\intensive-care.md") -Destination (Join-Path $commandsTarget "intensive-care.md") -Force
Copy-Item -LiteralPath (Join-Path $adapterRoot "commands\intensive-care.md") -Destination (Join-Path $commandsTarget "soins-intensifs.md") -Force

Write-Host "`n  ✅ Installation terminée. Les praticiens sont prêts à recevoir vos patients.`n" -ForegroundColor Green

Write-Host "  📋 Dernière étape — le système prompt de la clinique`n" -ForegroundColor Yellow
Write-Host "  Pour que votre assistant propose naturellement des checkups, ajoutez le bloc" -ForegroundColor Yellow
Write-Host "  suivant à votre CLAUDE.md (global : ~/.claude/CLAUDE.md, ou par projet) :`n" -ForegroundColor Yellow
Write-Host "  -------------------------------------------------------------------------" -ForegroundColor DarkGray
Get-Content -LiteralPath (Join-Path $adapterRoot "templates\CLAUDE.md.clinic") -Encoding UTF8 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
Write-Host "  -------------------------------------------------------------------------`n" -ForegroundColor DarkGray

Write-Host "  🚀 Redémarrez Claude Code pour que la Clinique prenne effet.`n" -ForegroundColor Cyan
