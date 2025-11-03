Param(
  [string]$SupabaseUrl = $env:SUPABASE_URL,
  [string]$ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY,
  [switch]$DryRun
)

Write-Host "Supabase REST import: starting" -ForegroundColor Cyan

if ([string]::IsNullOrWhiteSpace($SupabaseUrl)) {
  Write-Host "Missing Supabase URL. Provide -SupabaseUrl or set SUPABASE_URL env var." -ForegroundColor Red
  Write-Host "Example: https://zqtflfrbxtsxfipurnpf.supabase.co" -ForegroundColor DarkGray
  exit 1
}

if ([string]::IsNullOrWhiteSpace($ServiceRoleKey)) {
  Write-Host "Missing service_role key. Provide -ServiceRoleKey or set SUPABASE_SERVICE_ROLE_KEY env var." -ForegroundColor Red
  Write-Host "This key is required to bypass RLS and use Auth Admin API." -ForegroundColor DarkGray
  exit 1
}

$baseUrl = $SupabaseUrl.Trim()
$baseUrlNoSlash = $baseUrl.TrimEnd('/')
$restBase = "$baseUrlNoSlash/rest/v1"
$authAdminBase = "$baseUrlNoSlash/auth/v1/admin"
Write-Host ("REST base: {0}" -f $restBase) -ForegroundColor DarkGray
Write-Host ("Auth admin base: {0}" -f $authAdminBase) -ForegroundColor DarkGray

$headers = @{
  "apikey" = $ServiceRoleKey
  "Authorization" = "Bearer $ServiceRoleKey"
  "Content-Type" = "application/json"
  "Prefer" = "resolution=ignore-duplicates,return=minimal"
}

function Get-FileIfNotEmpty([string]$relativePath) {
  $full = Join-Path $PSScriptRoot $relativePath
  if (-not (Test-Path $full)) { return $null }
  $info = Get-Item $full
  if ($info.Length -le 0) { return $null }
  return $full
}

function Read-CsvSafe([string]$path) {
  if (-not $path) { return @() }
  try {
    return Import-Csv -Path $path
  } catch {
    Write-Host "Failed to read CSV: $path. $_" -ForegroundColor Red
    return @()
  }
}

function NormalizeEmptyStrings([object[]]$rows) {
  $out = @()
  foreach ($r in $rows) {
    $obj = $r.PSObject.Copy()
    foreach ($prop in $obj.PSObject.Properties) {
      if ($prop.Value -is [string] -and [string]::IsNullOrWhiteSpace([string]$prop.Value)) {
        $prop.Value = $null
      }
    }
    $out += ,$obj
  }
  return $out
}

function RemoveColumnFromRows([object[]]$rows, [string]$columnName) {
  if (-not $rows -or [string]::IsNullOrWhiteSpace($columnName)) { return $rows }
  $out = @()
  foreach ($r in $rows) {
    $obj = $r.PSObject.Copy()
    $prop = $obj.PSObject.Properties[$columnName]
    if ($prop) { $obj.PSObject.Properties.Remove($columnName) }
    $out += ,$obj
  }
  return $out
}

function IsUuid([string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) { return $false }
  return ($value -match '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
}

function Chunk([object[]]$items, [int]$size) {
  $chunks = @()
  for ($i = 0; $i -lt $items.Count; $i += $size) {
    $chunks += ,($items[$i..([Math]::Min($i + $size - 1, $items.Count - 1))])
  }
  return $chunks
}

function PostRows([string]$table, [object[]]$rows, [string]$onConflictColumns = $null) {
  if (-not $rows -or $rows.Count -eq 0) { return }
  $uri = "$restBase/$table"
  if ($onConflictColumns) { $uri = "$( $uri )?on_conflict=$onConflictColumns" }
  $chunks = Chunk $rows 500
  foreach ($chunk in $chunks) {
    Write-Host ("Chunk type: {0}, count: {1}" -f $chunk.GetType().FullName, ($chunk.Count)) -ForegroundColor DarkGray
    $chunkToSend = if ($chunk -is [System.Management.Automation.PSCustomObject]) { @($chunk) } else { $chunk }
    $attempt = 1
    while ($attempt -le 5) {
      $body = ($chunkToSend | ConvertTo-Json -Depth 6)
      if ($DryRun) {
        Write-Host "DRY-RUN: would POST $table ($($chunk.Count) rows)" -ForegroundColor Yellow
        break
      }
      try {
        Write-Host ("POST {0} -> {1}" -f $table, $uri) -ForegroundColor DarkGray
        $bodyPreviewLen = [Math]::Min($body.Length, 200)
        Write-Host ("Body length: {0}, preview: {1}" -f $body.Length, $body.Substring(0, $bodyPreviewLen)) -ForegroundColor DarkGray
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
        Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -ContentType 'application/json' -Body $bodyBytes | Out-Null
        break
      } catch {
        Write-Host ("POST failed for {0}: {1}" -f $table, $_) -ForegroundColor Red
        $respText = $null
        try {
          if ($_.Exception.Response) {
            $respStream = $_.Exception.Response.GetResponseStream()
            if ($respStream) {
              $reader = New-Object System.IO.StreamReader($respStream)
              $respText = $reader.ReadToEnd()
              Write-Host ("Response body: {0}" -f $respText) -ForegroundColor Red
            }
          }
        } catch {}
        if ($respText -and ($respText -match "Could not find the '([^']+)' column")) {
          $missingCol = $Matches[1]
          Write-Host ("Detected missing column '{0}' in table '{1}'. Will drop it and retry." -f $missingCol, $table) -ForegroundColor Yellow
          $chunkToSend = RemoveColumnFromRows $chunkToSend $missingCol
          $attempt++
          continue
        }
        throw
      }
    }
  }
}

function GetAuthEmailToIdMap() {
  $map = @{}
  $page = 1
  $perPage = 200
  while ($true) {
    $url = "$( $authAdminBase )/users?page=$page&per_page=$perPage"
    try {
      $resp = Invoke-RestMethod -Method Get -Uri $url -Headers $headers
    } catch {
      Write-Host ("Failed to list Auth users (page {0}): {1}" -f $page, $_) -ForegroundColor Red
      break
    }
    $usersList = $null
    if ($resp -is [System.Collections.IEnumerable]) { $usersList = $resp }
    elseif ($resp.users) { $usersList = $resp.users }
    elseif ($resp.data) { $usersList = $resp.data }
    else { $usersList = @() }
    foreach ($u in $usersList) {
      if ($u.email -and $u.id) {
        $map[[string]$u.email.ToLower()] = [string]$u.id
      }
    }
    if (($usersList | Measure-Object).Count -lt $perPage) { break }
    $page++
  }
  return $map
}

function BuildUsersCsvMaps([object[]]$usersCsvRows) {
  $idToEmail = @{}
  $emailToRow = @{}
  foreach ($r in $usersCsvRows) {
    $email = [string]$r.email
    $origId = [string]$r.id
    if ($email) { $emailToRow[$email.ToLower()] = $r }
    if ($origId) { $idToEmail[$origId] = $email }
  }
  return @{ idToEmail = $idToEmail; emailToRow = $emailToRow }
}

function MapUserRowToAuth([object]$row, $emailToAuthIdMap) {
  $email = [string]$row.email
  $authId = $null
  if ($email) { $authId = $emailToAuthIdMap[$email.ToLower()] }
  if (-not $authId) {
    Write-Host "WARN: No Auth user found for email '$email'. Skipping user row." -ForegroundColor Yellow
    return $null
  }
  return [pscustomobject]@{
    id = $authId
    username = $row.username
    email = $row.email
    password_hash = $row.password_hash
    email_verified = if ([string]::IsNullOrWhiteSpace($row.email_verified)) { $false } else { [bool]$row.email_verified }
    email_verification_token = $row.email_verification_token
    email_verification_expires = if ([string]::IsNullOrWhiteSpace($row.email_verification_expires)) { $null } else { [long]$row.email_verification_expires }
    created_at = $row.created_at
    updated_at = $row.updated_at
  }
}

function ConvertUserId([string]$value, $idToEmailMap, $emailToAuthIdMap) {
  if ([string]::IsNullOrWhiteSpace($value)) { return $null }
  if ($value -eq 'seed') { return $null }
  if (-not (IsUuid $value)) { return $null }
  $email = $idToEmailMap[$value]
  if (-not $email) { return $null }
  $authId = $emailToAuthIdMap[$email.ToLower()]
  return $authId
}

function MapRowsUserIds([object[]]$rows, [string[]]$uuidColumns, [string[]]$requiredColumns, $idToEmailMap, $emailToAuthIdMap) {
  $out = @()
  foreach ($r in $rows) {
    $obj = $r.PSObject.Copy()
    $missingRequired = $false
    foreach ($col in $uuidColumns) {
      $old = [string]$obj.$col
      $new = ConvertUserId $old $idToEmailMap $emailToAuthIdMap
      if ($new) { $obj.$col = $new } else { $obj.$col = $null }
      if ($requiredColumns -contains $col -and -not $new) { $missingRequired = $true }
    }
    if (-not $missingRequired) { $out += ,$obj } else {
      Write-Host "WARN: Skipping row due to missing required user mapping." -ForegroundColor Yellow
    }
  }
  return $out
}

# 1) Base dimension tables
$productCategories = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/product_categories.csv'))
$units = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/units.csv'))
$languages = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/languages.csv'))
$regions = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/regions.csv'))
$stores = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/stores.csv'))
$offers = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/offers.csv'))
$roles = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/roles.csv'))
$filterPeriodOptions = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/filter_period_options.csv'))
$costs = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/costs.csv'))

PostRows 'product_categories' $productCategories 'id'
PostRows 'units' $units 'id'
PostRows 'languages' $languages 'id'
PostRows 'regions' $regions 'id'
PostRows 'stores' $stores 'id'
PostRows 'offers' $offers 'id'
PostRows 'roles' $roles 'id'
PostRows 'filter_period_options' $filterPeriodOptions 'id'
PostRows 'costs' $costs 'id'

# 2) Dependent dimensions
$products = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/products.csv'))
$localities = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/localities.csv'))
$suppliers = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/suppliers.csv'))

PostRows 'products' $products 'id'
PostRows 'localities' $localities 'id'
PostRows 'suppliers' $suppliers 'id'

# 3) Users staging & mapping via Auth Admin
$usersCsv = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/users.csv'))
$maps = BuildUsersCsvMaps $usersCsv
$idToEmailMap = $maps.idToEmail
$emailToAuthIdMap = GetAuthEmailToIdMap

$mappedUsers = @()
foreach ($u in $usersCsv) {
  $mu = MapUserRowToAuth $u $emailToAuthIdMap
  if ($mu) { $mappedUsers += ,$mu }
}

PostRows 'users' $mappedUsers 'id'

# 4) Facts and relationships referencing users
$userRoles = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/user_roles.csv'))
$userPreferences = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/user_preferences.csv'))
$contribRequests = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/contribution_requests.csv'))

$mappedUserRoles = MapRowsUserIds $userRoles @('user_id') @('user_id') $idToEmailMap $emailToAuthIdMap
$mappedUserPreferences = MapRowsUserIds $userPreferences @('user_id') @('user_id') $idToEmailMap $emailToAuthIdMap
$mappedContribRequests = MapRowsUserIds $contribRequests @('user_id','reviewed_by') @('user_id') $idToEmailMap $emailToAuthIdMap

PostRows 'user_roles' $mappedUserRoles 'user_id,role_id'
PostRows 'user_preferences' $mappedUserPreferences 'user_id'
PostRows 'contribution_requests' $mappedContribRequests 'id'

# 5) Facts without user FK (and with optional user FKs)
$prices = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/prices.csv'))
$productPrices = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/product_prices.csv'))
$supplierProductAvailability = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/supplier_product_availability.csv'))
$supplierProductAvailabilityHistory = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/supplier_product_availability_history.csv'))
$supplierPrices = NormalizeEmptyStrings (Read-CsvSafe (Get-FileIfNotEmpty 'export/supplier_prices.csv'))

# Normalize submitted_by / validated_by in prices (map to Auth UUID or null)
if ($prices.Count -gt 0) {
  $normalizedPrices = @()
  foreach ($p in $prices) {
    $obj = $p.PSObject.Copy()
    $obj.submitted_by = ConvertUserId ([string]$p.submitted_by) $idToEmailMap $emailToAuthIdMap
    $obj.validated_by = ConvertUserId ([string]$p.validated_by) $idToEmailMap $emailToAuthIdMap
    $normalizedPrices += ,$obj
  }
  PostRows 'prices' $normalizedPrices 'id'
}

# Build a set of valid store IDs to avoid FK violations in product_prices
$storeIdSet = @{}
foreach ($s in $stores) { $sid = [string]$s.id; if ($sid) { $storeIdSet[$sid] = $true } }

# Filter product_prices to only those with existing store_id
$productPricesFiltered = @()
foreach ($pp in $productPrices) {
  $sid = [string]$pp.store_id
  if ($sid -and $storeIdSet[$sid]) {
    $productPricesFiltered += ,$pp
  } else {
    Write-Host ("WARN: Skipping product_prices id={0} due to missing store_id={1}" -f $pp.id, $sid) -ForegroundColor Yellow
  }
}

PostRows 'product_prices' $productPricesFiltered 'id'
PostRows 'supplier_product_availability' $supplierProductAvailability 'id'
PostRows 'supplier_product_availability_history' $supplierProductAvailabilityHistory 'id'
PostRows 'supplier_prices' $supplierPrices 'id'

Write-Host "Supabase REST import completed." -ForegroundColor Green