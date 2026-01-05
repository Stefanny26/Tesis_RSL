# 🧹 ANÁLISIS Y LIMPIEZA DE SCRIPTS - Backend

**Fecha:** 4 de enero de 2026  
**Objetivo:** Eliminar scripts obsoletos y organizar los necesarios

---

## 📊 CLASIFICACIÓN DE SCRIPTS

### 🗑️ CATEGORÍA 1: ELIMINAR - Scripts de Migración Única (Ya ejecutados)

Estos scripts agregaron columnas a la base de datos y **ya fueron ejecutados**. No son necesarios porque:
- Las columnas ya existen en tu BD
- No se volverán a ejecutar
- Ocupan espacio innecesariamente

**Scripts a eliminar:**

1. ✅ `add-ai-columns.js` - Agregó columnas AI a references (ya ejecutado)
2. ✅ `add-fase2-column.js` - Agregó fase2_unlocked a protocols (ya ejecutado)
3. ✅ `add-fulltext-data-columns.js` - Agregó full_text_data a references (ya ejecutado)
4. ✅ `add-prisma-locked-column.js` - Agregó prisma_locked a protocols (ya ejecutado)
5. ✅ `add-screening-results-column.js` - Agregó screening_results (ya ejecutado)
6. ✅ `add-search-queries-column.js` - Agregó search_queries (ya ejecutado)
7. ✅ `migrate-prisma-content-type.js` - Agregó content_type a prisma_items (ya ejecutado)
8. ✅ `remove-unused-fields.js` - Eliminó campos deprecated (ya ejecutado)
9. ✅ `drop-unused-tables.js` - Eliminó tablas no usadas (ya ejecutado)

**Razón:** Las migraciones deben estar en scripts SQL versionados, no en archivos JS sueltos.

---

### 🗑️ CATEGORÍA 2: ELIMINAR - Scripts de Desarrollo/Testing

Scripts que solo sirven para debugging puntual y no aportan valor al proyecto:

10. ✅ `dev-only/check-api-usage.js` - Ver uso de API (innecesario, existe endpoint)
11. ✅ `dev-only/clear-api-usage.js` - Limpiar API usage (peligroso)
12. ✅ `dev-only/get-user-id.js` - Listar usuarios (puede hacerse con pgAdmin)
13. ✅ `dev-only/seed-api-usage.js` - Datos de prueba (contamina BD)
14. ✅ `verificar-items-prisma.js` - Verificar PRISMA (ya existe en controller)
15. ✅ `show-protocol-details.js` - Mostrar protocolo (puede hacerse con GET endpoint)
16. ✅ `update-user-name.sql` - SQL manual (mejor hacerlo desde pgAdmin)

---

### 🗑️ CATEGORÍA 3: ARCHIVAR - Scripts de Deployment (No usados actualmente)

Scripts de deployment que preparaste pero no usas actualmente:

17. ⚠️ `deployment/generate-secrets.ps1` - Generar secrets en PowerShell (duplicado)
18. ⚠️ `deployment/migrate-production.js` - Migrar a producción (no usado)
19. ⚠️ `deployment/migrate.ps1` - Migrar en PowerShell (no usado)
20. ⚠️ `deployment/migrate.sh` - Migrar en Bash (no usado)
21. ⚠️ `deployment/Procfile` - Heroku/Railway config (duplicado con raíz)
22. ⚠️ `deployment/railway.json` - Railway config (duplicado con raíz)

**Acción:** Mover a `scripts/archived/deployment/` (por si los necesitas después)

---

### 🗑️ CATEGORÍA 4: CONSOLIDAR - Scripts Utils Redundantes

Scripts en `utils/` que están duplicados o son innecesarios:

23. ✅ `utils/create-screening-table.js` - Crear tabla (ya existe en BD)
24. ⚠️ `utils/check-duplicates.js` - **MANTENER** (útil para auditoría)
25. ⚠️ `utils/remove-duplicates.js` - **MANTENER** (útil para limpieza)
26. ⚠️ `utils/generate-secrets.js` - **MANTENER** (útil para setup)
27. ⚠️ `utils/test-apis.js` - **MANTENER** (útil para verificar API keys)
28. ✅ `utils/UTILITY-ASSESSMENT.md` - **ELIMINAR** (este análisis reemplaza ese doc)
29. ✅ `utils/README.md` - **CONSOLIDAR** con documentación principal

---

### ✅ CATEGORÍA 5: MANTENER - Scripts Útiles

Scripts que SÍ se usan regularmente o son importantes:

30. ✅ `cleanup-db.js` - **MANTENER** - Limpieza general de BD
31. ✅ `verify-data.js` - **MANTENER** - Verificar integridad de datos
32. ✅ `unlock-fase2.js` - **MANTENER** - Desbloquear fase 2 (útil en desarrollo)

---

## 🎯 PLAN DE ACCIÓN

### Paso 1: Crear carpeta de archivo
```powershell
# Crear carpeta para archivos obsoletos
mkdir backend\scripts\archived
mkdir backend\scripts\archived\migrations
mkdir backend\scripts\archived\deployment
mkdir backend\scripts\archived\dev-testing
```

### Paso 2: Mover scripts de migración (Categoría 1)
Mover a `scripts/archived/migrations/`:
- add-ai-columns.js
- add-fase2-column.js
- add-fulltext-data-columns.js
- add-prisma-locked-column.js
- add-screening-results-column.js
- add-search-queries-column.js
- migrate-prisma-content-type.js
- remove-unused-fields.js
- drop-unused-tables.js

### Paso 3: Eliminar scripts de desarrollo (Categoría 2)
```powershell
# Eliminar toda la carpeta dev-only
Remove-Item -Recurse backend\scripts\dev-only

# Eliminar scripts de verificación redundantes
Remove-Item backend\scripts\verificar-items-prisma.js
Remove-Item backend\scripts\show-protocol-details.js
Remove-Item backend\scripts\update-user-name.sql
```

### Paso 4: Archivar deployment (Categoría 3)
Mover carpeta completa:
```powershell
Move-Item backend\scripts\deployment backend\scripts\archived\deployment
```

### Paso 5: Limpiar utils (Categoría 4)
```powershell
# Eliminar scripts redundantes
Remove-Item backend\scripts\utils\create-screening-table.js
Remove-Item backend\scripts\utils\UTILITY-ASSESSMENT.md
Remove-Item backend\scripts\utils\README.md
```

### Paso 6: Estructura Final
```
backend/scripts/
├── cleanup-db.js                    ✅ MANTENER
├── verify-data.js                   ✅ MANTENER
├── unlock-fase2.js                  ✅ MANTENER
├── utils/
│   ├── check-duplicates.js          ✅ MANTENER
│   ├── remove-duplicates.js         ✅ MANTENER
│   ├── generate-secrets.js          ✅ MANTENER
│   └── test-apis.js                 ✅ MANTENER
└── archived/                        📦 ARCHIVO
    ├── migrations/                  (9 scripts)
    ├── deployment/                  (6 archivos)
    └── dev-testing/                 (scripts eliminados)
```

---

## 📝 SCRIPTS FINALES (7 archivos útiles)

### En raíz de scripts/

1. **cleanup-db.js**
   - **Propósito:** Limpieza general de base de datos
   - **Cuándo usar:** Mantenimiento mensual o cuando hay problemas
   - **Comandos:** `node scripts/cleanup-db.js`

2. **verify-data.js**
   - **Propósito:** Verificar integridad de datos
   - **Cuándo usar:** Después de migraciones o imports grandes
   - **Comandos:** `node scripts/verify-data.js`

3. **unlock-fase2.js**
   - **Propósito:** Desbloquear fase 2 manualmente (útil en desarrollo)
   - **Cuándo usar:** Cuando necesitas testear fase 2 sin completar fase 1
   - **Comandos:** `node scripts/unlock-fase2.js <project-id>`

### En scripts/utils/

4. **check-duplicates.js**
   - **Propósito:** Detectar proyectos duplicados
   - **Cuándo usar:** Auditorías de datos
   - **Comandos:** `node scripts/utils/check-duplicates.js`

5. **remove-duplicates.js**
   - **Propósito:** Eliminar proyectos duplicados (mantiene el más reciente)
   - **Cuándo usar:** Después de detectar duplicados
   - **Comandos:** `node scripts/utils/remove-duplicates.js`

6. **generate-secrets.js**
   - **Propósito:** Generar JWT_SECRET y SESSION_SECRET seguros
   - **Cuándo usar:** Setup inicial o renovación de secrets
   - **Comandos:** `node scripts/utils/generate-secrets.js`

7. **test-apis.js**
   - **Propósito:** Verificar que API keys de Gemini/ChatGPT funcionan
   - **Cuándo usar:** Después de renovar API keys
   - **Comandos:** `node scripts/utils/test-apis.js`

---

## ⚡ EJECUCIÓN RÁPIDA

Puedo ejecutar automáticamente la limpieza completa si me confirmas. Los comandos serían:

```powershell
# 1. Crear carpetas de archivo
New-Item -ItemType Directory -Force -Path "backend\scripts\archived\migrations"
New-Item -ItemType Directory -Force -Path "backend\scripts\archived\deployment"

# 2. Mover scripts de migración
Move-Item backend\scripts\add-*.js backend\scripts\archived\migrations\
Move-Item backend\scripts\migrate-prisma-content-type.js backend\scripts\archived\migrations\
Move-Item backend\scripts\remove-unused-fields.js backend\scripts\archived\migrations\
Move-Item backend\scripts\drop-unused-tables.js backend\scripts\archived\migrations\

# 3. Eliminar scripts de desarrollo
Remove-Item -Recurse backend\scripts\dev-only
Remove-Item backend\scripts\verificar-items-prisma.js
Remove-Item backend\scripts\show-protocol-details.js
Remove-Item backend\scripts\update-user-name.sql

# 4. Mover deployment
Move-Item backend\scripts\deployment backend\scripts\archived\deployment

# 5. Limpiar utils
Remove-Item backend\scripts\utils\create-screening-table.js
Remove-Item backend\scripts\utils\UTILITY-ASSESSMENT.md
Remove-Item backend\scripts\utils\README.md
```

---

## 📊 RESUMEN

| Categoría | Cantidad | Acción |
|-----------|----------|--------|
| **Scripts de Migración** | 9 | Archivar |
| **Scripts de Dev/Testing** | 7 | Eliminar |
| **Scripts de Deployment** | 6 | Archivar |
| **Scripts Utils Redundantes** | 3 | Eliminar |
| **Scripts Útiles** | 7 | Mantener |
| **TOTAL** | 32 → 7 | **78% reducción** |

**Espacio liberado:** ~150 KB de código innecesario  
**Claridad ganada:** De 32 archivos confusos a 7 scripts claros y útiles

---

## ✅ PRÓXIMOS PASOS

1. **Revisar este análisis** ¿Estás de acuerdo con las categorías?
2. **Confirmar ejecución** ¿Ejecuto los comandos de limpieza?
3. **Actualizar documentación** Crear `scripts/README.md` con los 7 scripts finales
4. **Commit changes** Mensaje: "chore: clean up backend scripts (32→7 files, 78% reduction)"

**¿Procedo con la limpieza?**
