Param(
  [string]$DbPath = "database\lokali.db",
  [string]$OutDir = "scripts\export"
)

# Assure le dossier de sortie
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# Liste des tables à exporter (ajustez si nécessaire)
$tables = @(
  "product_categories","products","units","languages","regions","localities",
  "prices",
  "stores","product_prices",
  "filter_period_options","costs",
  "suppliers","supplier_prices","supplier_product_availability","supplier_product_availability_history",
  "offers","subscriptions","roles","user_roles",
  "contribution_requests","user_preferences","audit_logs",
  "users"
)

Write-Host "Database: $DbPath"
Write-Host "Output dir: $OutDir"
Write-Host "Tables: $($tables -join ', ')"

foreach ($t in $tables) {
  $out = Join-Path $OutDir ("$t.csv")
  Write-Host "Exporting $t -> $out"

  # Nécessite sqlite3 CLI dans le PATH
  # Si non installé: winget install SQLite.SQLite (ou choco install sqlite)
  sqlite3 $DbPath ".headers on" ".mode csv" ".once $out" "SELECT * FROM $t;"

  if ($LASTEXITCODE -ne 0) {
    Write-Warning "Échec d'export pour la table $t (code: $LASTEXITCODE)"
  }
}

Write-Host "Export terminé. Fichiers disponibles dans: $OutDir"