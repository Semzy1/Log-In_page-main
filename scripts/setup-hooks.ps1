# Configure the repository to use the tracked `.githooks` folder for git hooks (Windows PowerShell)
Set-Location -Path $PSScriptRoot\.. | Out-Null
git config core.hooksPath .githooks
Write-Host "Configured core.hooksPath to .githooks"
