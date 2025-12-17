# Evaluación de Scripts Utilitarios

## ✅ Scripts Útiles (Mantener)

### test-apis.js
- **Propósito**: Verificar que las API keys de Gemini y ChatGPT funcionan
- **Uso**: Desarrollo y troubleshooting
- **Mantener**: SÍ - Útil para debugging cuando las APIs fallan

### check-duplicates.js
- **Propósito**: Detectar proyectos duplicados en la BD
- **Uso**: Mantenimiento y limpieza
- **Mantener**: SÍ - Útil para auditorías

### remove-duplicates.js
- **Propósito**: Eliminar proyectos duplicados (mantiene el más reciente)
- **Uso**: Mantenimiento ocasional
- **Mantener**: SÍ - Útil para limpieza de datos

### generate-secrets.js
- **Propósito**: Generar JWT_SECRET y SESSION_SECRET seguros
- **Uso**: Setup inicial y producción
- **Mantener**: SÍ - Necesario para deployment

### create-screening-table.js
- **Propósito**: Crear tabla screening_records si no existe
- **Uso**: Migración legacy
- **Mantener**: CONDICIONAL - Solo si no está en scripts SQL principales

## ⚠️ Scripts de Testing/Desarrollo (Revisar)

### check-api-usage.js
- **Propósito**: Ver registros de uso de API en la BD
- **Uso**: Debugging durante desarrollo
- **Mantener**: OPCIONAL - Solo útil si monitoreas uso de API manualmente
- **Alternativa**: Crear endpoint `/api/admin/api-usage` en vez de script

### get-user-id.js
- **Propósito**: Listar usuarios y sus IDs
- **Uso**: Debugging durante desarrollo
- **Mantener**: OPCIONAL - Útil solo en desarrollo
- **Alternativa**: Crear endpoint `/api/admin/users` en vez de script

### seed-api-usage.js
- **Propósito**: Crear datos de prueba de API usage
- **Uso**: Solo testing/desarrollo
- **Mantener**: NO - Solo contamina la BD con datos falsos
- **Acción**: ELIMINAR o mover a carpeta `dev-only/`

### clear-api-usage.js
- **Propósito**: Borrar todos los registros de api_usage
- **Uso**: Limpiar datos de prueba
- **Mantener**: NO - Peligroso en producción
- **Acción**: ELIMINAR o mover a carpeta `dev-only/`

## 📊 Recomendaciones

### Estructura Sugerida

```
scripts/
├── utils/
│   ├── test-apis.js              # ✅ Mantener
│   ├── check-duplicates.js       # ✅ Mantener
│   ├── remove-duplicates.js      # ✅ Mantener
│   ├── generate-secrets.js       # ✅ Mantener
│   └── README.md
├── dev-only/                      # Scripts solo para desarrollo
│   ├── seed-api-usage.js         # ⚠️ Mover aquí
│   ├── clear-api-usage.js        # ⚠️ Mover aquí
│   ├── check-api-usage.js        # ⚠️ Mover aquí
│   ├── get-user-id.js            # ⚠️ Mover aquí
│   └── README.md                 # Advertencia: solo desarrollo
└── deployment/
    ├── Procfile
    ├── railway.json
    └── migrate.*
```

### Alternativas Mejores

En lugar de scripts sueltos, considera:

1. **Crear endpoints administrativos**:
   ```javascript
   GET /api/admin/api-usage        // En vez de check-api-usage.js
   GET /api/admin/users            // En vez de get-user-id.js
   GET /api/admin/duplicates       // En vez de check-duplicates.js
   DELETE /api/admin/duplicates    // En vez de remove-duplicates.js
   ```

2. **Agregar al CLI**:
   ```json
   "scripts": {
     "test:apis": "node scripts/utils/test-apis.js",
     "clean:duplicates": "node scripts/utils/remove-duplicates.js",
     "generate:secrets": "node scripts/utils/generate-secrets.js"
   }
   ```

3. **Dashboard de Admin en Frontend**:
   - Página `/admin/monitoring` que muestre uso de API
   - Página `/admin/maintenance` para limpiar duplicados
