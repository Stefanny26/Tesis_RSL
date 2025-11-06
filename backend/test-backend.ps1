# Script de pruebas para el backend
# Ejecutar: .\test-backend.ps1

$baseUrl = "http://localhost:3001"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🧪 PRUEBAS DEL BACKEND - THESIS RSL" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "📡 Test 1: Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Health Check OK" -ForegroundColor Green
    Write-Host "   Respuesta: $($response.message)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Error en Health Check" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Registro de usuario
Write-Host "👤 Test 2: Registro de usuario..." -ForegroundColor Yellow
$registerData = @{
    email = "test@example.com"
    fullName = "Usuario de Prueba"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registro exitoso" -ForegroundColor Green
    Write-Host "   Usuario: $($registerResponse.data.user.fullName)" -ForegroundColor Gray
    Write-Host "   Email: $($registerResponse.data.user.email)" -ForegroundColor Gray
    $token = $registerResponse.data.token
    Write-Host "   Token generado: $($token.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️  Usuario ya existe (esto es normal si ya corriste las pruebas)" -ForegroundColor Yellow
        Write-Host "   Intentando login en su lugar..." -ForegroundColor Gray
        Write-Host ""
        
        # Intentar login
        $loginData = @{
            email = "test@example.com"
            password = "password123"
        } | ConvertTo-Json
        
        try {
            $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
            Write-Host "✅ Login exitoso" -ForegroundColor Green
            $token = $loginResponse.data.token
            Write-Host "   Token generado: $($token.Substring(0, 50))..." -ForegroundColor Gray
            Write-Host ""
        } catch {
            Write-Host "❌ Error en Login" -ForegroundColor Red
            Write-Host "   Error: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Error en Registro" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        exit 1
    }
}

# Test 3: Obtener usuario actual
Write-Host "🔐 Test 3: Obtener usuario actual (con JWT)..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
    Write-Host "✅ Usuario autenticado correctamente" -ForegroundColor Green
    Write-Host "   Usuario: $($meResponse.data.user.fullName)" -ForegroundColor Gray
    Write-Host "   Email: $($meResponse.data.user.email)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Error obteniendo usuario" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Crear proyecto
Write-Host "📊 Test 4: Crear proyecto..." -ForegroundColor Yellow
$projectData = @{
    title = "Mi Primera Revisión Sistemática"
    description = "Proyecto de prueba para verificar el backend"
    deadline = "2025-12-31"
} | ConvertTo-Json

try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $projectResponse = Invoke-RestMethod -Uri "$baseUrl/api/projects" -Method Post -Body $projectData -ContentType "application/json" -Headers $headers
    Write-Host "✅ Proyecto creado exitosamente" -ForegroundColor Green
    Write-Host "   ID: $($projectResponse.data.project.id)" -ForegroundColor Gray
    Write-Host "   Título: $($projectResponse.data.project.title)" -ForegroundColor Gray
    Write-Host "   Estado: $($projectResponse.data.project.status)" -ForegroundColor Gray
    $projectId = $projectResponse.data.project.id
    Write-Host ""
} catch {
    Write-Host "❌ Error creando proyecto" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

# Test 5: Listar proyectos
Write-Host "📋 Test 5: Listar proyectos del usuario..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $projectsResponse = Invoke-RestMethod -Uri "$baseUrl/api/projects" -Method Get -Headers $headers
    Write-Host "✅ Proyectos listados correctamente" -ForegroundColor Green
    Write-Host "   Total de proyectos: $($projectsResponse.data.pagination.total)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Error listando proyectos" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

# Test 6: Obtener protocolo
Write-Host "📝 Test 6: Obtener protocolo del proyecto..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $protocolResponse = Invoke-RestMethod -Uri "$baseUrl/api/projects/$projectId/protocol" -Method Get -Headers $headers
    Write-Host "✅ Protocolo obtenido correctamente" -ForegroundColor Green
    Write-Host "   Completado: $($protocolResponse.data.protocol.completed)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Error obteniendo protocolo" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

# Resumen
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ TODAS LAS PRUEBAS PASARON" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📊 Resumen:" -ForegroundColor White
Write-Host "   • Health Check: ✅" -ForegroundColor Gray
Write-Host "   • Registro/Login: ✅" -ForegroundColor Gray
Write-Host "   • Autenticación JWT: ✅" -ForegroundColor Gray
Write-Host "   • Crear Proyecto: ✅" -ForegroundColor Gray
Write-Host "   • Listar Proyectos: ✅" -ForegroundColor Gray
Write-Host "   • Obtener Protocolo: ✅" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 ¡El backend está funcionando perfectamente!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Conecta el frontend (lee FRONTEND-INTEGRATION.md)" -ForegroundColor Gray
Write-Host "   2. Importa postman-collection.json en Postman" -ForegroundColor Gray
Write-Host "   3. Explora los endpoints disponibles" -ForegroundColor Gray
Write-Host ""
