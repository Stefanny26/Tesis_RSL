# PowerShell Script para ejecutar migraciones manualmente
# Ejecutar después de obtener DATABASE_URL de Railway

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl
)

Write-Host "🚀 Iniciando migraciones de base de datos..." -ForegroundColor Cyan

$scripts = @(
    "01-create-users-table.sql",
    "02-create-projects-table.sql",
    "03-create-project-members-table.sql",
    "04-create-protocols-table.sql",
    "05-create-references-table.sql",
    "06-create-prisma-items-table.sql",
    "07-create-article-versions-table.sql",
    "08-create-activity-log-table.sql",
    "09-create-functions-and-triggers.sql",
    "10-add-protocol-ai-fields.sql",
    "11-add-google-id-column.sql",
    "11-create-api-usage-table.sql",
    "11-enhance-references-screening.sql",
    "12-add-exclusion-reason.sql",
    "14-create-screening-records-table.sql",
    "15-add-phase3-columns.sql"
)

foreach ($script in $scripts) {
    Write-Host "📝 Ejecutando: $script" -ForegroundColor Yellow
    
    $scriptPath = Join-Path "..\scripts" $script
    
    if (Test-Path $scriptPath) {
        psql $DatabaseUrl -f $scriptPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $script completado" -ForegroundColor Green
        } else {
            Write-Host "❌ Error en $script" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "⚠️  Archivo no encontrado: $script" -ForegroundColor Yellow
    }
}

Write-Host "🎉 ¡Todas las migraciones completadas!" -ForegroundColor Green
