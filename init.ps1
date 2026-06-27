$ErrorActionPreference = "Stop"

Write-Host "=== Harness Initialization ==="

Write-Host "=== npm run lint ==="
npm run lint

Write-Host "=== npm run typecheck ==="
npm run typecheck

Write-Host "=== npm test ==="
npm test

Write-Host "=== npm run build ==="
npm run build

Write-Host "=== Verification Complete ==="
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Read feature_list.json to see current feature state"
Write-Host "2. Pick ONE unfinished feature to work on"
Write-Host "3. Implement only that feature"
Write-Host "4. Re-run verification before claiming done"
