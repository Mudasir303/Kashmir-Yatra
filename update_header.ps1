$ErrorActionPreference = "Stop"
$projectRoot = "c:\Users\hp\Desktop\workspace\kashmir yatra\frontend"
$indexFile = Join-Path $projectRoot "index.html"
$startMarker = "<!-- Preloader Start -->"
$endMarker = "</header>"

Write-Host "Reading $indexFile..."
$content = Get-Content -Path $indexFile -Raw -Encoding utf8
# PowerShell regex escape might differ, but [regex]::Escape is safe.
# We need to construct the regex pattern for dotall matching.
$pattern = "(?s)" + [regex]::Escape($startMarker) + ".*?" + [regex]::Escape($endMarker)

if ($content -match $pattern) {
    $masterBlock = $matches[0]
    Write-Host "Master block found. Length: $($masterBlock.Length)"
} else {
    Write-Error "Could not find master block in index.html"
}

$files = @(
    "about.html",
    "contact.html",
    "tour.html",
    "404.html",
    "checkout.html",
    "faq.html",
    "destination-details.html",
    "destination.html",
    "destination-page-2.html",
    "destination-page-3.html",
    "index-2.html",
    "index-3.html",
    "news-details.html",
    "news.html",
    "shop-cart.html",
    "shop-details.html",
    "shop.html",
    "team-details.html",
    "team.html",
    "tour-2.html",
    "tour-details.html",
    "tour-list.html"
)

foreach ($file in $files) {
    $path = Join-Path $projectRoot $file
    if (Test-Path $path) {
        try {
            $fileContent = Get-Content -Path $path -Raw -Encoding utf8
            if ($fileContent -match $pattern) {
                # Check if change is needed
                if ($matches[0] -eq $masterBlock) {
                    Write-Host "  No changes needed for $file"
                } else {
                    $newContent = $fileContent -replace $pattern, $masterBlock
                    Set-Content -Path $path -Value $newContent -Encoding utf8
                    Write-Host "  SUCCESS: Updated $file"
                }
            } else {
                Write-Host "WARNING: Pattern not found in $file"
            }
        } catch {
            Write-Host "ERROR updating $file : $_"
        }
    } else {
        Write-Host "WARNING: File not found: $file"
    }
}
