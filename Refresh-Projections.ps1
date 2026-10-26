param(
    [string]$ModelDirectory = "",
    [string]$Python = "",
    [switch]$ExportOnly
)
$ErrorActionPreference = "Stop"
$configPath = Join-Path $PSScriptRoot ".local\settings.json"
$config = if (Test-Path -LiteralPath $configPath) { Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json } else { $null }
if (-not $ModelDirectory) { $ModelDirectory = if ($env:FPL_MODEL_DIR) { $env:FPL_MODEL_DIR } else { $config.ModelDirectory } }
if (-not $ModelDirectory) { throw "Pass -ModelDirectory, set FPL_MODEL_DIR, or configure ignored .local/settings.json." }
if (-not $Python) { $Python = if ($config.RefreshPython) { $config.RefreshPython } else { "python" } }
$previousPythonPath = $env:PYTHONPATH
$previousEncoding = $env:PYTHONIOENCODING
try {
    if ($config.ExtraPythonPath) {
        $env:PYTHONPATH = $config.ExtraPythonPath + [IO.Path]::PathSeparator + $previousPythonPath
    }
    $env:PYTHONIOENCODING = "utf-8"
    $exporter = Join-Path $ModelDirectory "export_web_projections.py"
    $exportArguments = @($exporter, "--sync-to", $PSScriptRoot)
    if (-not $ExportOnly) { $exportArguments += "--refresh-model" }
    & $Python @exportArguments
    if ($LASTEXITCODE -ne 0) { throw "Model refresh/export failed. Check the output above." }
    Write-Host "Local data refreshed. Rebuild/redeploy to update a hosted site."
}
finally {
    $env:PYTHONPATH = $previousPythonPath
    $env:PYTHONIOENCODING = $previousEncoding
}

