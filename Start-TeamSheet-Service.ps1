param(
    [string]$ModelDirectory = "",
    [string]$Python = "",
    [int]$Port = 8765
)
$ErrorActionPreference = "Stop"
$configPath = Join-Path $PSScriptRoot ".local\settings.json"
$config = if (Test-Path -LiteralPath $configPath) { Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json } else { $null }
if (-not $ModelDirectory) { $ModelDirectory = if ($env:FPL_MODEL_DIR) { $env:FPL_MODEL_DIR } else { $config.ModelDirectory } }
if (-not $ModelDirectory) { throw "Pass -ModelDirectory, set FPL_MODEL_DIR, or configure ignored .local/settings.json." }
if (-not $Python) { $Python = if ($config.ServicePython) { $config.ServicePython } else { "python" } }
Write-Host "Starting the local Python Team Sheet + Transfers service. Keep this terminal open."
& $Python (Join-Path $ModelDirectory "web_transfers.py") --projections (Join-Path $PSScriptRoot "public\data\projections.json") --port $Port
if ($LASTEXITCODE -ne 0) { throw "Local service stopped with an error. Check the output above." }

