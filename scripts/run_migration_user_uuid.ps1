Param(
  [string]$DbUrl = $env:SUPABASE_DB_URL
)

# Fallback sur DATABASE_URL si SUPABASE_DB_URL est absent
if ([string]::IsNullOrWhiteSpace($DbUrl)) {
  $DbUrl = $env:DATABASE_URL
}

# Lecture depuis .env si non fourni via env/param
if ([string]::IsNullOrWhiteSpace($DbUrl)) {
  $envPathCandidates = @(
    (Join-Path $PSScriptRoot "..\.env"),
    (Join-Path (Get-Location) ".env")
  )
  foreach ($envPath in $envPathCandidates) {
    if (Test-Path $envPath) {
      $lines = Get-Content $envPath
      foreach ($line in $lines) {
        if ($line -match '^\s*SUPABASE_DB_URL\s*=\s*(.+)\s*$') {
          $DbUrl = $matches[1].Trim().Trim('"').Trim("'")
          break
        }
      }
      if (-not [string]::IsNullOrWhiteSpace($DbUrl)) { break }
    }
  }
}

if ([string]::IsNullOrWhiteSpace($DbUrl)) {
  Write-Host "ERROR: DbUrl non fourni. Définissez SUPABASE_DB_URL ou DATABASE_URL, ou passez -DbUrl" -ForegroundColor Red
  exit 1
}

function Ensure-PostgresCli {
  $psql = Get-Command psql -ErrorAction SilentlyContinue
  if (-not $psql) {
    Write-Host "psql introuvable. Tentative d'installation via winget..." -ForegroundColor Yellow
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
      winget install --silent --id PostgreSQL.PostgreSQL
      $psql = Get-Command psql -ErrorAction SilentlyContinue
    }
    if (-not $psql) {
      Write-Host "ERROR: psql indisponible. Installez PostgreSQL client et réessayez." -ForegroundColor Red
      exit 1
    }
  }
}

Ensure-PostgresCli

$scriptPath = Join-Path (Get-Location) "scripts\migrate_user_ids_to_uuid.sql"
if (-not (Test-Path $scriptPath)) {
  Write-Host "ERROR: Fichier SQL introuvable: $scriptPath" -ForegroundColor Red
  exit 1
}

Write-Host "Exécution de la migration: $scriptPath" -ForegroundColor Cyan
$env:PGOPTIONS = "-c search_path=public"

# Exécute le script avec arrêt en cas d'erreur
psql "$DbUrl" -f "$scriptPath"

if ($LASTEXITCODE -ne 0) {
  Write-Host "La migration a échoué (code $LASTEXITCODE)." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "Migration terminée avec succès." -ForegroundColor Green