Param(
    [string]$BackendUrl = $(if ($env:BACKEND_URL) { $env:BACKEND_URL } else { 'http://localhost:5000' }),
    [string]$AiUrl = $(if ($env:AI_ENGINE_URL) { $env:AI_ENGINE_URL } else { 'http://127.0.0.1:8000' })
)

Write-Host "Smoke test starting..."

function Test-Get($url) {
    try {
        $r = Invoke-RestMethod -Method Get -Uri $url -TimeoutSec 10
        Write-Host "OK:" $url
        return $true
    } catch {
        Write-Host "FAIL:" $url -ForegroundColor Red
        Write-Host $_.Exception.Message
        return $false
    }
}

$allGood = $true

Write-Host "Checking AI Engine health: $AiUrl/health"
$allGood = $(Test-Get "$AiUrl/health") -and $allGood

Write-Host "Checking Backend root: $BackendUrl/"
$allGood = $(Test-Get "$BackendUrl/") -and $allGood

Write-Host "Checking Backend -> AI Engine health proxy: $BackendUrl/api/health/ai-engine"
$allGood = $(Test-Get "$BackendUrl/api/health/ai-engine") -and $allGood

if ($allGood) {
    Write-Host "Smoke test PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Smoke test FAILED" -ForegroundColor Red
    exit 2
}
