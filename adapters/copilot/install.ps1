param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
$adapterRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent (Split-Path -Parent $adapterRoot)
$githubRoot = Join-Path $ProjectRoot ".github"

if (-not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
    throw "Le projet cible n'existe pas : $ProjectRoot"
}

Write-Host "`n🏥 La Clinique du Code — Adaptateur GitHub Copilot`n" -ForegroundColor Cyan

$skillsTarget = Join-Path $githubRoot "skills"
$agentsTarget = Join-Path $githubRoot "agents"
$promptsTarget = Join-Path $githubRoot "prompts"
New-Item -ItemType Directory -Path $skillsTarget, $agentsTarget, $promptsTarget -Force | Out-Null

Write-Host "  ➜ Installation des protocoles comme skills..."
Get-ChildItem -LiteralPath (Join-Path $repoRoot "core\protocols") -File -Filter "*.md" | ForEach-Object {
    $skillTarget = Join-Path $skillsTarget $_.BaseName
    New-Item -ItemType Directory -Path $skillTarget -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $skillTarget "SKILL.md") -Force
    Write-Host "    - $($_.BaseName)"
}
$analyzerTarget = Join-Path $skillsTarget "zone-of-pain\zone-of-pain-analyzer.js"
Copy-Item -LiteralPath (Join-Path $repoRoot "core\tools\zone-of-pain-analyzer.js") -Destination $analyzerTarget -Force

Write-Host "  ➜ Installation des agents..."
Get-ChildItem -LiteralPath (Join-Path $adapterRoot "agents") -File -Filter "*.agent.md" | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $agentsTarget $_.Name) -Force
    Write-Host "    - $($_.BaseName)"
}

Copy-Item -LiteralPath (Join-Path $adapterRoot "prompts\checkup.prompt.md") -Destination (Join-Path $promptsTarget "checkup.prompt.md") -Force
Copy-Item -LiteralPath (Join-Path $adapterRoot "templates\copilot-instructions.md") -Destination (Join-Path $githubRoot "copilot-instructions.md") -Force

Write-Host "`n  ✅ Installation terminée. Utilisez le prompt /checkup ou un agent de la Clinique.`n" -ForegroundColor Green
