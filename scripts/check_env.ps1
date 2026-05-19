Param(
    [switch]$ShowAll
)

$vars = @(
    'GROQ_API_KEYS','GROQ_API_KEY','GROQ_MODEL_NAME',
    'GEMINI_API_KEYS','GEMINI_API_KEY','GEMINI_MODEL_NAME',
    'AI_ENGINE_URL','MONGO_URI','JWT_SECRET','SESSION_SECRET'
)

Write-Host "Checking important environment variables (presence only):"
foreach ($v in $vars) {
    $val = [Environment]::GetEnvironmentVariable($v)
    if ($val) {
        if ($ShowAll) { Write-Host "$v = SET" } else { Write-Host "$v : SET" }
    } else {
        Write-Host "$v : NOT SET" -ForegroundColor Yellow
    }
}

Write-Host "Note: This script only checks presence, not validity."
