#!/bin/bash
# Script para ejecutar todas las migraciones en Railway
# Ejecutar desde Railway CLI o manualmente

echo "🚀 Iniciando migraciones de base de datos..."

# Lista de scripts en orden
scripts=(
  "01-create-users-table.sql"
  "02-create-projects-table.sql"
  "03-create-project-members-table.sql"
  "04-create-protocols-table.sql"
  "05-create-references-table.sql"
  "06-create-prisma-items-table.sql"
  "07-create-article-versions-table.sql"
  "08-create-activity-log-table.sql"
  "09-create-functions-and-triggers.sql"
  "10-add-protocol-ai-fields.sql"
  "11-add-google-id-column.sql"
  "11-create-api-usage-table.sql"
  "11-enhance-references-screening.sql"
  "12-add-exclusion-reason.sql"
  "14-create-screening-records-table.sql"
  "15-add-phase3-columns.sql"
)

# Ejecutar cada script
for script in "${scripts[@]}"
do
  echo "📝 Ejecutando: $script"
  psql $DATABASE_URL -f "../scripts/$script"
  
  if [ $? -eq 0 ]; then
    echo "✅ $script completado"
  else
    echo "❌ Error en $script"
    exit 1
  fi
done

echo "🎉 ¡Todas las migraciones completadas!"
