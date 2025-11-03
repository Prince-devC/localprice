param(
  [Parameter(Mandatory=$true)][string]$SupabaseUrl,
  [Parameter(Mandatory=$true)][string]$ServiceRoleKey,
  [Parameter(Mandatory=$true)][string]$Table,
  [int]$Limit = 10
)

$base = $SupabaseUrl.Trim().TrimEnd('/')
$uri = "$base/rest/v1/$($Table)?select=*&limit=$Limit"
$headers = @{
  apikey = $ServiceRoleKey
  Authorization = "Bearer $ServiceRoleKey"
  Accept = 'application/json'
  'Accept-Profile' = 'public'
}

Write-Host ("GET {0}" -f $uri) -ForegroundColor DarkGray
try {
  $resp = Invoke-RestMethod -Method Get -Uri $uri -Headers $headers -ErrorAction Stop
  $json = $resp | ConvertTo-Json -Depth 6
  Write-Host $json
} catch {
  Write-Host ("GET failed: {0}" -f $_) -ForegroundColor Red
  if ($_.Exception.Response) {
    try {
      $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
      $body = $sr.ReadToEnd()
      Write-Host ("Response body: {0}" -f $body) -ForegroundColor Red
    } catch {}
  }
  exit 1
}