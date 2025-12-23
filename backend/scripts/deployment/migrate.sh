#!/bin/bash
# Script de migración rápida para Railway - Nueva versión con Node.js
echo "🚀 Ejecutando migración de producción..."

# Ejecutar el script de migración de Node.js
node scripts/deployment/migrate-production.js

# Verificar el resultado
if [ $? -eq 0 ]; then
    echo "✅ Migración completada exitosamente"
    echo "🚀 Listo para iniciar servidor"
    exit 0
else
    echo "❌ Error en la migración"
    exit 1
fi
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
