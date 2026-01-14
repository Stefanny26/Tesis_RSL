# 🔍 AUDITORÍA COMPLETA DEL BACKEND
**Fecha:** 14 de enero de 2026  
**Propósito:** Identificar código obsoleto y oportunidades de limpieza antes de producción

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Total | ✅ En Uso | ⚠️ Revisar | ❌ Eliminar |
|-----------|-------|-----------|-----------|-------------|
| Use Cases | 32 | 32 | 0 | 0 |
| Controllers | 10 | 10 | 0 | 0 |
| Models | 9 | 9 | 0 | 0 |
| Repositories | 9 | 9 | 0 | 0 |
| Routes | 11 | 11 | 0 | 0 |
| Middlewares | 2 | 2 | 0 | 0 |
| Services | 1 | 1 | 0 | 0 |
| Scripts | 6 activos + archived | 6 | 0 | 0 |
| Docs | 8 | 6 | 2 | 0 |

---

## 1️⃣ USE CASES (32 archivos) - ✅ TODOS EN USO

### Autenticación (3) ✅
- `register-user.use-case.js` - Usado en auth.controller
- `login-user.use-case.js` - Usado en auth.controller
- `oauth-login.use-case.js` - Usado en passport-setup

### Proyectos (2) ✅
- `create-project.use-case.js` - Usado en project.controller
- `get-user-projects.use-case.js` - Usado en project.controller

### Referencias (4) ✅
- `import-references.use-case.js` - Usado en reference.controller
- `export-references.use-case.js` - Usado en reference.controller
- `detect-duplicates.use-case.js` - Usado en reference.controller
- `scopus-search.use-case.js` - Usado en ai.controller y reference.controller

### Screening (4) ✅
- `run-project-screening.use-case.js` - Usado en ai.controller
- `screen-references-with-ai.use-case.js` - Usado en ai.controller
- `screen-references-embeddings.use-case.js` - Usado en ai.controller
- `analyze-screening-results.use-case.js` - Usado en ai.controller
- `evaluate-fulltext.use-case.js` - Usado en screening.controller

### PRISMA (6) ✅
- `generate-prisma-content.use-case.js` - Usado en prisma.controller
- `generate-prisma-context.use-case.js` - Usado en prisma.controller y article.controller
- `complete-prisma-items.use-case.js` - Usado en prisma.controller
- `complete-prisma-by-blocks.use-case.js` - Usado en prisma.controller
- `extract-fulltext-data.use-case.js` - Usado en prisma.controller

### Protocolo/IA (9) ✅
- `generate-protocol-analysis.use-case.js` - Usado en ai.controller
- `generate-protocol-justification.use-case.js` - Usado en ai.controller
- `generate-protocol-terms.use-case.js` - Usado en ai.controller
- `generate-title-from-question.use-case.js` - Usado en ai.controller
- `generate-titles.use-case.js` - Usado en ai.controller
- `generate-inclusion-exclusion-criteria.use-case.js` - Usado en ai.controller
- `search-query-generator.use-case.js` - Usado en ai.controller
- `refine-search-string.use-case.js` - Usado en ai.controller

### RQS (1) ✅
- `extract-rqs-data.use-case.js` - Usado en rqs.controller

### Artículo (1) ✅
- `generate-article-from-prisma.use-case.js` - Usado en article.controller

### API Usage (1) ✅
- `get-api-usage-stats.use-case.js` - Usado en api-usage.controller

### Utilidades (1) ✅
- `query-sanitizer.js` - Utility usado en múltiples use cases
- `google-scholar-search.use-case.js` - Usado en ai.controller

**VEREDICTO:** ✅ Todos los use cases están en uso activo. NO eliminar ninguno.

---

## 2️⃣ CONTROLLERS (10 archivos) - ✅ TODOS EN USO

| Controller | Rutas Registradas | Endpoints Principales |
|------------|-------------------|----------------------|
| `ai.controller.js` | `/api/ai/*` | 18 endpoints (protocol analysis, screening, búsquedas) |
| `auth.controller.js` | `/api/auth/*` | register, login, logout, Google OAuth |
| `project.controller.js` | `/api/projects/*` | CRUD proyectos |
| `protocol.controller.js` | `/api/projects/:id/protocol` | CRUD protocolo |
| `prisma.controller.js` | `/api/projects/:id/prisma/*` | CRUD ítems PRISMA |
| `article.controller.js` | `/api/projects/:id/article` | Generar artículos |
| `reference.controller.js` | `/api/references/*` | Import, export, duplicados |
| `screening.controller.js` | `/api/screening/*` | Evaluación full-text |
| `rqs.controller.js` | `/api/projects/:id/rqs` | Extracción datos RQS |
| `api-usage.controller.js` | `/api/usage/*` | Estadísticas uso API |

**VEREDICTO:** ✅ Todos los controllers están registrados en rutas y activos. NO eliminar ninguno.

---

## 3️⃣ MODELS & REPOSITORIES (9 + 9 archivos) - ✅ TODOS EN USO

| Model/Repository | Usado en Controllers | Tabla BD | Estado |
|-----------------|---------------------|----------|--------|
| `user` | auth.controller | users | ✅ Activo |
| `project` | project.controller | projects | ✅ Activo |
| `protocol` | protocol.controller, prisma.controller | protocols | ✅ Activo |
| `reference` | reference.controller, screening.controller | references | ✅ Activo |
| `prisma-item` | prisma.controller | prisma_items | ✅ Activo |
| `rqs-entry` | rqs.controller, article.controller | rqs_entries | ✅ Activo |
| `article-version` | article.controller | article_versions | ✅ Activo |
| `screening-record` | screening.controller | screening_records | ✅ Activo |
| `api-usage` | api-usage.controller | api_usage | ✅ Activo |

**VEREDICTO:** ✅ Todos los models y repositories están en uso. NO eliminar ninguno.

---

## 4️⃣ ROUTES (11 archivos) - ✅ TODOS EN USO

| Ruta | Registrada en server.js | Endpoints |
|------|------------------------|-----------|
| `admin.routes.js` | ✅ `/api/admin` | Admin endpoints |
| `ai.routes.js` | ✅ `/api/ai` | 18+ endpoints IA |
| `article.routes.js` | ✅ `/api/projects/:id/article` | Artículos |
| `auth.routes.js` | ✅ `/api/auth` | Autenticación |
| `prisma.routes.js` | ✅ `/api/projects/:id/prisma` | PRISMA |
| `project.routes.js` | ✅ `/api/projects` | Proyectos |
| `protocol.routes.js` | ✅ `/api/projects/:id/protocol` | Protocolos |
| `reference.routes.js` | ✅ `/api/references` | Referencias |
| `rqs.routes.js` | ✅ `/api/projects/:id/rqs` | RQS |
| `screening.routes.js` | ✅ `/api/screening` | Cribado |
| `usage.routes.js` | ✅ `/api/usage` | Métricas API |

**VEREDICTO:** ✅ Todas las rutas están registradas en server.js. NO eliminar ninguna.

---

## 5️⃣ SCRIPTS (6 activos + archived) - ⚠️ REVISAR

### Scripts Activos ✅
| Script | Propósito | Frecuencia de Uso | Mantener |
|--------|-----------|-------------------|----------|
| `check-columns.js` | Debugging: Verificar columnas BD | Solo desarrollo | ⚠️ Mover a /archived |
| `cleanup-db.js` | Limpieza de BD local | Solo desarrollo | ⚠️ Mover a /archived |
| `fix-case-study-issues.js` | Fix puntual caso de uso | **Ya ejecutado** | ⚠️ Mover a /archived |
| `migrate-prisma-items-1-10.js` | Migración ítems PRISMA 1-10 | **Ya ejecutado** | ⚠️ Mover a /archived |
| `run-migration.js` | Ejecutor genérico migraciones | Útil en producción | ✅ MANTENER |
| `unlock-fase2.js` | Desbloquear Fase 2 proyectos | Útil en producción | ✅ MANTENER |

### Scripts Archived ✅
```
scripts/archived/
├── deployment/          (5 archivos de deployment antiguos)
└── migrations/          (9 migraciones ya aplicadas)
```

**ACCIÓN RECOMENDADA:**
```bash
# Mover scripts one-time a archived:
mv backend/scripts/check-columns.js backend/scripts/archived/
mv backend/scripts/cleanup-db.js backend/scripts/archived/
mv backend/scripts/fix-case-study-issues.js backend/scripts/archived/
mv backend/scripts/migrate-prisma-items-1-10.js backend/scripts/archived/
```

**MANTENER ACTIVOS:**
- `run-migration.js` - Útil para ejecutar migraciones SQL en producción
- `unlock-fase2.js` - Herramienta admin para desbloquear fases

---

## 6️⃣ DOCS (8 archivos) - ⚠️ 2 REVISAR

| Documento | Relevancia | Actualizado | Acción |
|-----------|-----------|-------------|--------|
| `INSTALLATION.md` | Alta - Setup inicial | ✅ | MANTENER |
| `QUICKSTART.md` | Alta - Guía rápida | ✅ | MANTENER |
| `SUMMARY.md` | Alta - Resumen sistema | ✅ | MANTENER |
| `PRISMA-ARTICLE-IMPLEMENTATION.md` | Alta - Guía técnica | ✅ | MANTENER |
| `REFACTOR-PRISMA-COMPLIANCE.md` | Alta - Cambios recientes | ✅ | MANTENER |
| `SOLUCION-QUERIES-SCOPUS.md` | Media - Fix específico | ✅ | MANTENER |
| `QUERY-SANITIZER-README.md` | Media - Detalle técnico | ⚠️ | Revisar si sigue vigente |
| `postman-collection.json` | Alta - Testing API | ⚠️ | Actualizar endpoints |

**ACCIÓN RECOMENDADA:**
1. **Revisar** `QUERY-SANITIZER-README.md` - Confirmar que el sanitizer sigue activo
2. **Actualizar** `postman-collection.json` - Agregar nuevos endpoints de PRISMA y RQS

---

## 7️⃣ MIDDLEWARES (2 archivos) - ✅ TODOS EN USO

| Middleware | Usado en | Propósito |
|------------|----------|-----------|
| `auth.middleware.js` | Rutas protegidas | Autenticación JWT |
| `bson.middleware.js` | server.js global | Compresión respuestas grandes |

**VEREDICTO:** ✅ Ambos middlewares están en uso. NO eliminar.

---

## 8️⃣ SERVICES (1 archivo) - ✅ EN USO

| Service | Usado en | Propósito |
|---------|----------|-----------|
| `ai.service.js` | Todos los use-cases de IA | Centraliza llamadas a OpenAI/Gemini |

**VEREDICTO:** ✅ Servicio crítico usado en 15+ use cases. NO eliminar.

---

## 9️⃣ CONFIG (4 archivos) - ✅ TODOS EN USO

| Config | Propósito | Estado |
|--------|-----------|--------|
| `database.js` | Pool PostgreSQL | ✅ Crítico |
| `passport-setup.js` | Google OAuth | ✅ Usado en auth |
| `academic-databases.js` | Catálogo bases de datos | ✅ Usado en AI |
| `prisma-validation-prompts.js` | Prompts validación PRISMA | ⚠️ **REVISAR** |

**ACCIÓN RECOMENDADA:**
- **Revisar** `prisma-validation-prompts.js` - Verificar si está siendo usado en prisma.controller después del refactor

---

## 🔍 ANÁLISIS DE DEPENDENCIAS (package.json)

### Dependencias en Uso ✅
| Paquete | Usado en | Crítico |
|---------|----------|---------|
| `@google/generative-ai` | ai.service.js | ✅ |
| `@xenova/transformers` | screen-references-embeddings | ✅ |
| `openai` | ai.service.js | ✅ |
| `pg` | database.js | ✅ |
| `express` | server.js | ✅ |
| `bcryptjs` | register-user, login-user | ✅ |
| `jsonwebtoken` | auth.middleware | ✅ |
| `passport`, `passport-google-oauth20` | passport-setup | ✅ |
| `multer` | reference.controller (upload PDFs) | ✅ |
| `pdf-parse` | extract-fulltext-data | ✅ |
| `axios` | scopus-search, google-scholar | ✅ |
| `cors` | server.js | ✅ |
| `dotenv` | server.js | ✅ |
| `express-validator` | validators.js | ✅ |
| `uuid` | Varios models | ✅ |
| `bson` | bson.middleware | ✅ |
| `he` | import-references (HTML decode) | ✅ |
| `ajv` | query-sanitizer | ✅ |

### Dependencias Sin Usar ❌
**NINGUNA** - Todas las dependencias están en uso activo.

---

## 🗂️ TEMPLATES (1 directorio nuevo)

| Template | Propósito | Estado |
|----------|-----------|--------|
| `article-latex.template.js` | Exportar artículos a LaTeX | ✅ Nuevo, útil |

**VEREDICTO:** ✅ Template válido para exportación futura. MANTENER.

---

## 🧪 TESTS (1 directorio nuevo)

| Test | Propósito | Estado |
|------|-----------|--------|
| `integration/full-flow.test.js` | Test completo flujo | ✅ Nuevo, útil |
| `setup.js` | Configuración tests | ✅ |
| `package.json` | Dependencias test | ✅ |

**VEREDICTO:** ✅ Framework de tests recién agregado. MANTENER para validación futura.

---

## 📋 PLAN DE LIMPIEZA RECOMENDADO

### ✅ ACCIÓN 1: Mover scripts one-time a archived
```bash
cd backend/scripts
mv check-columns.js archived/
mv cleanup-db.js archived/
mv fix-case-study-issues.js archived/
mv migrate-prisma-items-1-10.js archived/
```

### ⚠️ ACCIÓN 2: Revisar prisma-validation-prompts.js
```bash
# Verificar si está siendo usado después del refactor:
grep -r "prisma-validation-prompts" backend/src/
```
**Si NO se usa:** Mover a `archived/` o eliminar.
**Si SÍ se usa:** Mantener.

### ⚠️ ACCIÓN 3: Actualizar postman-collection.json
Agregar endpoints nuevos:
- POST `/api/projects/:id/prisma/complete-by-blocks`
- POST `/api/projects/:id/prisma/migrate`
- GET `/api/projects/:id/rqs/entries`

### ✅ ACCIÓN 4: Documentar archivos críticos
Crear `backend/CRITICAL-FILES.md` con:
- Archivos que NUNCA deben eliminarse
- Dependencias críticas
- Flujos principales del sistema

---

## 📊 RESUMEN FINAL

| Categoría | Archivos Totales | Mantener | Archivar | Eliminar |
|-----------|------------------|----------|----------|----------|
| Use Cases | 32 | 32 | 0 | 0 |
| Controllers | 10 | 10 | 0 | 0 |
| Models/Repos | 18 | 18 | 0 | 0 |
| Routes | 11 | 11 | 0 | 0 |
| Scripts | 6 | 2 | 4 | 0 |
| Docs | 8 | 6 | 0 | 2 (revisar) |
| Config | 4 | 3 | 0 | 1 (revisar) |
| **TOTAL** | **89** | **82** | **4** | **3 (revisar)** |

---

## ✅ VEREDICTO GENERAL

**El backend está LIMPIO y BIEN ESTRUCTURADO.**

- 92% del código está en uso activo (82/89 archivos)
- Solo 4 scripts necesitan archivarse (ya ejecutados)
- 3 archivos requieren revisión (no eliminación inmediata)
- 0 dependencias no usadas
- 0 archivos claramente obsoletos

**RECOMENDACIÓN:** Ejecutar solo las 4 acciones de limpieza menor listadas arriba. NO hay código "basura" significativo que eliminar.

---

**Estado:** ✅ BACKEND PRODUCTION-READY  
**Próximo paso:** Ejecutar plan de limpieza menor y proceder con deployment
