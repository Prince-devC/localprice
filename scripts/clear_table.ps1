param(
  [Parameter(Mandatory=$true)][string]$SupabaseUrl,
  [Parameter(Mandatory=$true)][string]$ServiceRoleKey,
  [Parameter(Mandatory=$true)][string]$Table,
  [string]$PrimaryKey = 'id'
)

$base = $SupabaseUrl.Trim().TrimEnd('/')
$headers = @{
  apikey = $ServiceRoleKey
  Authorization = "Bearer $ServiceRoleKey"
  Accept = 'application/json'
  Prefer = 'return=minimal'
  'Accept-Profile' = 'public'
}

Write-Host ("Purging table '{0}'" -f $Table) -ForegroundColor Cyan

$listUri = "$base/rest/v1/$($Table)?select=$($PrimaryKey)&limit=20000"
try {
  $rows = Invoke-RestMethod -Method Get -Uri $listUri -Headers $headers -ErrorAction Stop
} catch {
  Write-Host ("Failed to list rows for {0}: {1}" -f $Table, $_) -ForegroundColor Red
  if ($_.Exception.Response) {
    try {
      $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
      Write-Host ("Response body: {0}" -f ($sr.ReadToEnd())) -ForegroundColor Red
    } catch {}
  }
  exit 1
}

$ids = @($rows | ForEach-Object { $_.$PrimaryKey })
Write-Host ("Found {0} rows to delete" -f ($ids | Measure-Object).Count) -ForegroundColor DarkGray

$deleted = 0
foreach ($id in $ids) {
  $delUri = "$base/rest/v1/$($Table)?$($PrimaryKey)=eq.$id"
  try {
    Invoke-RestMethod -Method Delete -Uri $delUri -Headers $headers -ErrorAction Stop | Out-Null
    $deleted++
  } catch {
    Write-Host ("DELETE failed for {0} id={1}: {2}" -f $Table, $id, $_) -ForegroundColor Yellow
    if ($_.Exception.Response) {
      try {
        $sr2 = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host ("Response body: {0}" -f ($sr2.ReadToEnd())) -ForegroundColor Yellow
      } catch {}
    }
  }
}

Write-Host ("Purged {0} rows from {1}" -f $deleted, $Table) -ForegroundColor Green