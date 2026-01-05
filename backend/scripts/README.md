# 📁 Scripts de Backend - Guía Rápida

**Última actualización:** 4 de enero de 2026  
**Total de scripts útiles:** 7 archivos

---

## 🎯 Scripts Principales (Raíz)

### `cleanup-db.js`
**Propósito:** Limpieza y mantenimiento general de la base de datos

**Cuándo usar:**
- Mantenimiento mensual de la BD
- Después de imports grandes
- Cuando hay inconsistencias en los datos

**Ejecutar:**
```bash
node scripts/cleanup-db.js
```

---

### `verify-data.js`
**Propósito:** Verificar integridad de datos en todas las tablas

**Cuándo usar:**
- Después de migraciones
- Para auditorías de datos
- Cuando sospechas problemas de integridad

**Ejecutar:**
```bash
node scripts/verify-data.js
```

**Verifica:**
- Integridad referencial
- Campos requeridos no nulos
- Formato de datos (emails, UUIDs, etc.)

---

### `unlock-fase2.js`
**Propósito:** Desbloquear Fase 2 (PRISMA) manualmente sin completar el cribado

**Cuándo usar:**
- Desarrollo y testing
- Necesitas probar la sección PRISMA
- Demo del sistema

**Ejecutar:**
```bash
node scripts/unlock-fase2.js <project-id>
```

**Ejemplo:**
```bash
node scripts/unlock-fase2.js 9cf035c4-9efd-4ef1-ad93-5234af5ca4b5
```

---

## 🛠️ Scripts de Utilidades (utils/)

### `check-duplicates.js`
**Propósito:** Detectar proyectos duplicados en la base de datos

**Cuándo usar:**
- Auditorías periódicas
- Sospecha de duplicados
- Antes de hacer limpieza

**Ejecutar:**
```bash
node scripts/utils/check-duplicates.js
```

**Salida:**
```
Duplicados encontrados: 2
- "Machine Learning in Healthcare" (2 copias)
- "Blockchain Security" (3 copias)
```

---

### `remove-duplicates.js`
**Propósito:** Eliminar proyectos duplicados (mantiene el más reciente)

**⚠️ ADVERTENCIA:** Este script ELIMINA datos. Úsalo con precaución.

**Cuándo usar:**
- Después de ejecutar `check-duplicates.js`
- Con backup de la BD

**Ejecutar:**
```bash
node scripts/utils/remove-duplicates.js
```

**Proceso:**
1. Identifica duplicados por título
2. Mantiene el proyecto más reciente (created_at)
3. Elimina los duplicados más antiguos
4. Muestra resumen de eliminaciones

---

### `generate-secrets.js`
**Propósito:** Generar JWT_SECRET y SESSION_SECRET seguros

**Cuándo usar:**
- Setup inicial del proyecto
- Renovación de secrets por seguridad
- Configuración de nuevo ambiente (staging/production)

**Ejecutar:**
```bash
node scripts/utils/generate-secrets.js
```

**Salida:**
```
Secrets generados:

JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
SESSION_SECRET=x9y8z7a6b5c4d3e2f1g0h9i8j7k6l5m4n3o2p1q0r9s8t7u6v5w4

Copia estos valores a tu archivo .env
```

---

### `test-apis.js`
**Propósito:** Verificar conectividad con APIs externas (Gemini, OpenAI)

**Cuándo usar:**
- Después de actualizar API keys
- Troubleshooting de errores de IA
- Verificar cuotas disponibles

**Ejecutar:**
```bash
node scripts/utils/test-apis.js
```

**Verifica:**
- ✅ Google Gemini API
- ✅ OpenAI ChatGPT API
- ✅ Cuotas disponibles
- ✅ Respuestas válidas

**Salida esperada:**
```
Testing Google Gemini API...
✅ Gemini API funcionando correctamente
   Modelo: gemini-2.0-flash-exp
   Respuesta: OK

Testing OpenAI API...
✅ OpenAI API funcionando correctamente
   Modelo: gpt-4o-mini
   Respuesta: OK
```

---

## 📦 Carpeta Archived

Los scripts archivados se encuentran en `archived/` y están organizados por categoría:

### `archived/migrations/`
Scripts de migración de BD que ya fueron ejecutados:
- add-ai-columns.js
- add-fase2-column.js
- add-fulltext-data-columns.js
- add-prisma-locked-column.js
- add-screening-results-column.js
- add-search-queries-column.js
- migrate-prisma-content-type.js
- remove-unused-fields.js
- drop-unused-tables.js

**Nota:** Estos scripts NO deben ejecutarse de nuevo. Las columnas ya existen en la BD.

### `archived/deployment/`
Scripts de deployment no utilizados actualmente:
- generate-secrets.ps1
- migrate-production.js
- migrate.ps1, migrate.sh
- Procfile, railway.json

---

## 🚀 Workflow Recomendado

### Setup Inicial
```bash
# 1. Generar secrets
node scripts/utils/generate-secrets.js

# 2. Verificar APIs
node scripts/utils/test-apis.js

# 3. Verificar integridad de datos
node scripts/verify-data.js
```

### Mantenimiento Mensual
```bash
# 1. Verificar duplicados
node scripts/utils/check-duplicates.js

# 2. Limpiar duplicados (si existen)
node scripts/utils/remove-duplicates.js

# 3. Limpieza general
node scripts/cleanup-db.js

# 4. Verificar integridad
node scripts/verify-data.js
```

### Desarrollo
```bash
# Desbloquear fase 2 para testing
node scripts/unlock-fase2.js <project-id>
```

---

## 📊 Estructura Final

```
backend/scripts/
├── README.md                        ← Este archivo
├── ANALISIS-LIMPIEZA-SCRIPTS.md     ← Análisis de la limpieza realizada
├── cleanup-db.js                    ← Limpieza de BD
├── verify-data.js                   ← Verificar integridad
├── unlock-fase2.js                  ← Desbloquear fase 2
├── utils/
│   ├── check-duplicates.js          ← Detectar duplicados
│   ├── remove-duplicates.js         ← Eliminar duplicados
│   ├── generate-secrets.js          ← Generar secrets
│   └── test-apis.js                 ← Verificar APIs
└── archived/
    ├── migrations/                  ← 9 scripts de migración (ya ejecutados)
    └── deployment/                  ← 6 archivos de deployment (no usados)
```

---

## ⚠️ Advertencias

1. **Scripts destructivos:** `remove-duplicates.js` y `cleanup-db.js` ELIMINAN datos. Siempre haz backup antes.

2. **Migraciones archivadas:** Los scripts en `archived/migrations/` ya fueron ejecutados. NO los vuelvas a correr o causarás errores.

3. **API Keys:** Asegúrate de tener las variables de entorno correctas:
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY`

4. **Base de datos:** Todos los scripts asumen conexión a PostgreSQL vía `DATABASE_URL`

---

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
cd backend
npm install
```

### Error: "Connection refused"
- Verifica que PostgreSQL esté corriendo
- Verifica el `DATABASE_URL` en `.env`

### Error: "API quota exceeded"
- Renueva las API keys
- Verifica límites en las consolas de Gemini/OpenAI

---

## 📞 Contacto

Para problemas con los scripts, revisar:
- [ANALISIS-LIMPIEZA-SCRIPTS.md](ANALISIS-LIMPIEZA-SCRIPTS.md) - Análisis completo de la limpieza
- Issues del repositorio
- Documentación en `docs/`

---

**Última limpieza:** 4 de enero de 2026  
**Scripts eliminados:** 25 archivos obsoletos  
**Scripts mantenidos:** 7 archivos útiles  
**Reducción:** 78% de archivos innecesarios
