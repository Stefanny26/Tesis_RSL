# 🔍 Script de Verificación de Estructura

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Clean Architecture - Verificación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$basePath = "src"
$errors = @()
$warnings = @()
$success = @()

# Función para verificar existencia
function Test-Structure {
    param([string]$path, [string]$name)
    
    if (Test-Path $path) {
        $script:success += "✅ $name"
        return $true
    } else {
        $script:errors += "❌ $name - No encontrado: $path"
        return $false
    }
}

# Función para verificar archivo
function Test-File {
    param([string]$path, [string]$name)
    
    if (Test-Path $path) {
        $script:success += "✅ $name"
        return $true
    } else {
        $script:warnings += "⚠️  $name - Falta: $path"
        return $false
    }
}

Write-Host "Verificando estructura Core..." -ForegroundColor Yellow
Test-Structure "$basePath/core" "Core"
Test-File "$basePath/core/config/index.ts" "Core Config"
Test-File "$basePath/core/config/navigation.ts" "Core Navigation"
Test-File "$basePath/core/constants/app.ts" "Core Constants - App"
Test-File "$basePath/core/constants/routes.ts" "Core Constants - Routes"
Test-File "$basePath/core/types/common.ts" "Core Types"
Write-Host ""

Write-Host "Verificando estructura Shared..." -ForegroundColor Yellow
Test-Structure "$basePath/shared/presentation" "Shared Presentation"
Test-File "$basePath/shared/presentation/components/sidebar/sidebar.tsx" "Sidebar"
Test-File "$basePath/shared/presentation/components/sidebar/sidebar-item.tsx" "Sidebar Item"
Test-File "$basePath/shared/presentation/components/top-bar.tsx" "TopBar"
Test-File "$basePath/shared/presentation/components/breadcrumbs.tsx" "Breadcrumbs"
Test-File "$basePath/shared/presentation/layouts/main-layout.tsx" "MainLayout"
Test-File "$basePath/shared/presentation/layouts/project-layout.tsx" "ProjectLayout"
Write-Host ""

Write-Host "Verificando Features..." -ForegroundColor Yellow

# Auth Feature
Write-Host "  🔐 Auth Feature:" -ForegroundColor Cyan
Test-Structure "$basePath/features/auth/domain/entities" "Auth - Domain Entities"
Test-Structure "$basePath/features/auth/domain/repositories" "Auth - Domain Repositories"
Test-Structure "$basePath/features/auth/application/use-cases" "Auth - Use Cases"
Test-Structure "$basePath/features/auth/infrastructure/repositories" "Auth - Infrastructure"
Test-Structure "$basePath/features/auth/presentation/components" "Auth - Components"
Test-File "$basePath/features/auth/index.ts" "Auth - Barrel Export"

# Projects Feature
Write-Host "  📁 Projects Feature:" -ForegroundColor Cyan
Test-Structure "$basePath/features/projects/domain/entities" "Projects - Domain Entities"
Test-Structure "$basePath/features/projects/domain/repositories" "Projects - Domain Repositories"
Test-Structure "$basePath/features/projects/application/use-cases" "Projects - Use Cases"
Test-Structure "$basePath/features/projects/infrastructure/repositories" "Projects - Infrastructure"
Test-File "$basePath/features/projects/index.ts" "Projects - Barrel Export"

# References Feature
Write-Host "  📚 References Feature:" -ForegroundColor Cyan
Test-Structure "$basePath/features/references/domain/entities" "References - Domain Entities"
Test-Structure "$basePath/features/references/domain/repositories" "References - Domain Repositories"
Test-File "$basePath/features/references/index.ts" "References - Barrel Export"

Write-Host ""

Write-Host "Verificando archivos principales..." -ForegroundColor Yellow
Test-File "$basePath/di-container.ts" "DI Container"
Test-File "tsconfig.json" "TypeScript Config"
Test-File "prisma/schema.prisma" "Prisma Schema"
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resumen de Verificación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Exitosos: $($success.Count)" -ForegroundColor Green
Write-Host "⚠️  Advertencias: $($warnings.Count)" -ForegroundColor Yellow
Write-Host "❌ Errores: $($errors.Count)" -ForegroundColor Red
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 ¡Estructura perfecta! Todo está en su lugar." -ForegroundColor Green
} elseif ($errors.Count -eq 0) {
    Write-Host "✅ Estructura correcta con algunas advertencias." -ForegroundColor Yellow
} else {
    Write-Host "❌ Hay errores críticos en la estructura." -ForegroundColor Red
    Write-Host ""
    Write-Host "Errores encontrados:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "Advertencias:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
}

Write-Host ""
Write-Host "Para más información, consulta:" -ForegroundColor Cyan
Write-Host "  - CLEAN_ARCHITECTURE_GUIDE.md" -ForegroundColor White
Write-Host "  - IMPLEMENTATION_COMPLETE.md" -ForegroundColor White
Write-Host "  - README_VISUAL.md" -ForegroundColor White
Write-Host ""
