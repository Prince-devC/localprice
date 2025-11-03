param(
  [string]$Dir
)

if ([string]::IsNullOrWhiteSpace($Dir)) {
  $Dir = Join-Path $PSScriptRoot 'export'
}

Write-Host ("Deleting CSVs in {0}" -f $Dir) -ForegroundColor Cyan

if (-not (Test-Path $Dir)) {
  Write-Host ("Directory not found: {0}" -f $Dir) -ForegroundColor Yellow
  exit 0
}

$files = Get-ChildItem -Path $Dir -Filter '*.csv' -File -ErrorAction SilentlyContinue
$initial = ($files | Measure-Object).Count

foreach ($f in $files) {
  try {
    Remove-Item -Path $f.FullName -Force -ErrorAction Stop
  } catch {
    Write-Host ("Failed to delete {0}: {1}" -f $f.Name, $_) -ForegroundColor Yellow
  }
}

$remaining = ((Get-ChildItem -Path $Dir -Filter '*.csv' -File -ErrorAction SilentlyContinue) | Measure-Object).Count
Write-Host ("Deleted {0} CSVs. Remaining={1}" -f $initial, $remaining) -ForegroundColor Green