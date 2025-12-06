# 🔐 Generador de Secrets Seguros
# Ejecutar en PowerShell

Write-Host "`n🔐 Generando secrets seguros para producción...`n" -ForegroundColor Cyan
Write-Host ("═" * 60) -ForegroundColor Gray

# Generar JWT Secret
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "`n📝 JWT_SECRET:" -ForegroundColor Yellow
Write-Host $jwtSecret -ForegroundColor White

# Generar Session Secret
$sessionSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "`n📝 SESSION_SECRET:" -ForegroundColor Yellow
Write-Host $sessionSecret -ForegroundColor White

Write-Host ("`n" + ("═" * 60)) -ForegroundColor Gray
Write-Host "`n✅ Secrets generados exitosamente!" -ForegroundColor Green
Write-Host "`n📋 Copia estos valores a Railway Dashboard:" -ForegroundColor Cyan
Write-Host "   Variables → Add Variable`n" -ForegroundColor Gray

Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Red
Write-Host "   - NO compartas estos valores" -ForegroundColor Gray
Write-Host "   - NO los subas a GitHub" -ForegroundColor Gray
Write-Host "   - Guárdalos en un lugar seguro`n" -ForegroundColor Gray

# Pausar para que el usuario pueda copiar
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
