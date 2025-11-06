# Script simple para probar el backend
Write-Host "🧪 Probando backend..." -ForegroundColor Cyan

# Test Health
Write-Host "`n1️⃣ Probando Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
    $healthData = $health.Content | ConvertFrom-Json
    Write-Host "✅ Servidor funcionando!" -ForegroundColor Green
    Write-Host "   Status: $($health.StatusCode)" -ForegroundColor Gray
    Write-Host "   Mensaje: $($healthData.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "⚠️  Asegúrate de que el servidor esté corriendo (npm run dev)" -ForegroundColor Yellow
    exit
}

# Test Registro
Write-Host "`n2️⃣ Probando Registro de usuario..." -ForegroundColor Yellow
$body = @{
    email = "prueba$(Get-Random)@example.com"
    fullName = "Usuario Prueba"
    password = "test123456"
} | ConvertTo-Json

try {
    $register = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $registerData = $register.Content | ConvertFrom-Json
    Write-Host "✅ Usuario registrado!" -ForegroundColor Green
    Write-Host "   Email: $($registerData.data.user.email)" -ForegroundColor Gray
    Write-Host "   Nombre: $($registerData.data.user.fullName)" -ForegroundColor Gray
    
    $global:token = $registerData.data.token
    Write-Host "   Token: $($global:token.Substring(0,30))..." -ForegroundColor Gray
    
} catch {
    Write-Host "⚠️  $($_.Exception.Message)" -ForegroundColor Yellow
    exit
}

# Test Usuario Actual
Write-Host "`n3️⃣ Probando autenticación JWT..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $global:token"
    }
    $me = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/me" `
        -Headers $headers `
        -UseBasicParsing
    
    $meData = $me.Content | ConvertFrom-Json
    Write-Host "✅ Autenticación exitosa!" -ForegroundColor Green
    Write-Host "   Usuario: $($meData.data.user.fullName)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test Crear Proyecto
Write-Host "`n4️⃣ Probando creación de proyecto..." -ForegroundColor Yellow
$projectBody = @{
    title = "Revisión Sistemática de Prueba"
    description = "Proyecto creado desde script de prueba"
} | ConvertTo-Json

try {
    $headers = @{
        'Authorization' = "Bearer $global:token"
    }
    $project = Invoke-WebRequest -Uri "http://localhost:3001/api/projects" `
        -Method POST `
        -Body $projectBody `
        -ContentType "application/json" `
        -Headers $headers `
        -UseBasicParsing
    
    $projectData = $project.Content | ConvertFrom-Json
    Write-Host "✅ Proyecto creado!" -ForegroundColor Green
    Write-Host "   Título: $($projectData.data.project.title)" -ForegroundColor Gray
    Write-Host "   Estado: $($projectData.data.project.status)" -ForegroundColor Gray
    Write-Host "   ID: $($projectData.data.project.id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host "`n✨ ¡Todas las pruebas pasaron exitosamente!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "El backend está funcionando correctamente" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
