Param(
  [string]$DbUrl = $env:SUPABASE_DB_URL
)

Write-Host "Supabase import: starting" -ForegroundColor Cyan

# Ensure psql is available
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCmd) {
  Write-Host "psql not found. Attempting installation via winget..." -ForegroundColor Yellow
  try {
    winget install PostgreSQL.PostgreSQL --accept-source-agreements --accept-package-agreements --silent
  } catch {
    Write-Host "winget install failed. Please install PostgreSQL client manually and ensure 'psql' is on PATH." -ForegroundColor Red
    exit 1
  }
  $psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
  if (-not $psqlCmd) {
    Write-Host "psql still not found after installation. Restart terminal or add PostgreSQL bin to PATH." -ForegroundColor Red
    exit 1
  }
}

if ([string]::IsNullOrWhiteSpace($DbUrl)) {
  Write-Host "Missing connection string. Provide -DbUrl or set SUPABASE_DB_URL env var." -ForegroundColor Red
  Write-Host "Example: postgres://postgres:password@db.<project>.supabase.co:5432/postgres?sslmode=require" -ForegroundColor DarkGray
  exit 1
}

$sqlFile = Join-Path $PSScriptRoot "import_supabase.sql"
if (-not (Test-Path $sqlFile)) {
  Write-Host "SQL file not found: $sqlFile" -ForegroundColor Red
  exit 1
}

# Run import
Write-Host "Running psql with ON_ERROR_STOP=1..." -ForegroundColor Cyan
& psql "$DbUrl" -v ON_ERROR_STOP=1 -f "$sqlFile"
$exitCode = $LASTEXITCODE
if ($exitCode -ne 0) {
  Write-Host "psql import failed with exit code $exitCode" -ForegroundColor Red
  exit $exitCode
}

Write-Host "Supabase import completed successfully." -ForegroundColor Green