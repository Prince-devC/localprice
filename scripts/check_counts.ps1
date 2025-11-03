Param(
  [string]$SupabaseUrl,
  [string]$ServiceRoleKey,
  [string[]]$Tables = @('prices','product_prices','suppliers','products','stores','users')
)

if ([string]::IsNullOrWhiteSpace($SupabaseUrl) -or [string]::IsNullOrWhiteSpace($ServiceRoleKey)) {
  Write-Host "Usage: powershell -File scripts\\check_counts.ps1 -SupabaseUrl <url> -ServiceRoleKey <key>" -ForegroundColor Yellow
  exit 1
}

$base = $SupabaseUrl.Trim().TrimEnd('/')
$headers = @{
  apikey = $ServiceRoleKey
  Authorization = "Bearer $ServiceRoleKey"
  Prefer = 'count=exact'
  Accept = 'application/json'
  'Accept-Profile' = 'public'
}

foreach ($t in $Tables) {
  $csvPath = Join-Path $PSScriptRoot ("export/" + $t + ".csv")
  $csvCount = 0
  if (Test-Path $csvPath) {
    try { $csvCount = ((Import-Csv $csvPath) | Measure-Object).Count } catch {}
  }
  $uri = "$base/rest/v1/$($t)?select=id&limit=20000"
  $rows = @()
  try {
    $rows = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -ErrorAction Stop
  } catch {
    Write-Output ("{0}: REST fetch failed: {1}" -f $t, $_)
    continue
  }
  $restCount = (@($rows) | Measure-Object).Count
  $dupes = @($rows) | Group-Object -Property id | Where-Object { $_.Count -gt 1 }
  $dupeCount = (@($dupes) | Measure-Object).Count
  Write-Output ("{0}: CSV={1} REST={2} dup_ids={3}" -f $t, $csvCount, $restCount, $dupeCount)
}