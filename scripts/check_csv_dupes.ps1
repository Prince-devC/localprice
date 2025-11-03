param(
    [Parameter(Mandatory=$false)][string]$CsvDir = "scripts/export"
)

Write-Host "Checking CSV duplicates in" $CsvDir

$tables = @('prices','product_prices','suppliers','products','stores','users')

foreach ($t in $tables) {
    $path = Join-Path $CsvDir ("$t.csv")
    if (-not (Test-Path $path)) {
        Write-Host ("{0}: CSV not found at {1}" -f $t, $path)
        continue
    }

    try {
        $rows = Import-Csv -Path $path
    } catch {
        Write-Host ("{0}: failed to read CSV: {1}" -f $t, $_.Exception.Message)
        continue
    }

    $count = ($rows | Measure-Object).Count
    $dupeGroups = $rows | Group-Object -Property id | Where-Object { $_.Count -gt 1 }
    $dupeCount = ($dupeGroups | Measure-Object).Count

    Write-Host ("{0}: CSV rows={1}, duplicate id groups={2}" -f $t, $count, $dupeCount)

    if ($dupeCount -gt 0) {
        $examples = $dupeGroups | Select-Object -First 5
        Write-Host "Examples of duplicate ids:" ("[" + ($examples | ForEach-Object { $_.Name }) -join "," + "]")
    }
}

Write-Host "CSV duplicate check completed."