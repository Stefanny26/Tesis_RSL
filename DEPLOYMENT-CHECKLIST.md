# ✅ Checklist de Deployment a Producción
**Fecha:** 14 de enero de 2026
**Commit:** fe924be

---

## 📦 Pre-Deployment (Completado)
- [x] Commit de todos los cambios
- [x] Push a GitHub main branch
- [x] Mensaje de commit descriptivo

---

## 🔧 Cambios Críticos Incluidos

### Backend
1. **RIS Parser Fix** ✅
   - Archivo: `backend/src/domain/use-cases/import-references.use-case.js`
   - Cambio: Split pattern de `/\n\s*\n/` a `/ER\s*-\s*\n?/`
   - Impacto: Ahora importa archivos .ris de Wiley correctamente

2. **Database Premium Indicators** ✅
   - Archivo: `backend/src/config/academic-databases.js`
   - Cambio: Agregadas `requiresPremium` y `premiumNote` a ACM y Web of Science
   - Impacto: Usuarios ven advertencia de bases de datos premium

3. **Refactorización PRISMA** ✅
   - Archivos: `protocol.model.js`, `prisma-item.model.js`, varios repositories
   - Cambio: Eliminada columna `prisma_compliance` redundante
   - Impacto: Arquitectura más limpia (requiere migración SQL)

### Frontend
1. **Font Size Reduction** ✅
   - Archivo: `frontend/app/globals.css` + 20+ componentes
   - Cambio: Reducción global (body: 14px, labels: 13px)
   - Impacto: UI más compacta y profesional

2. **Premium Database UI** ✅
   - Archivo: `frontend/components/project-wizard/steps/6-search-plan-step.tsx`
   - Cambio: Icono 🔐 y nota de premium en tarjetas
   - Impacto: Usuarios ven claramente qué bases requieren cuenta institucional

---

## 🚀 Deployment Automático

### Vercel (Frontend)
- ✅ Push a main dispara build automático
- ⏳ Esperando deployment...
- 📍 URL: https://tu-app.vercel.app (revisar Dashboard)

### Render/Railway (Backend)
- ✅ Push a main dispara build automático
- ⏳ Esperando deployment...
- 📍 URL: https://tu-backend.railway.app (revisar Dashboard)

---

## 🗄️ Migraciones de Base de Datos (CRÍTICO)

### ⚠️ ACCIÓN REQUERIDA: Ejecutar Migraciones SQL

**¿Por qué?** El backend refactorizado espera que la columna `protocols.prisma_compliance` esté eliminada.

**Opción 1: Desde Render/Railway Dashboard**
```bash
# 1. Ir a Dashboard → tu base de datos → Shell
# 2. Copiar y pegar:

-- Verificar que ítems PRISMA están migrados a tabla prisma_items
SELECT COUNT(*) FROM prisma_items WHERE project_id = '343a31e4-1094-4090-a1c9-fedb3c43aea4';

-- Si retorna >= 27, es seguro ejecutar:
ALTER TABLE protocols DROP COLUMN IF EXISTS prisma_compliance;
```

**Opción 2: Desde tu computadora**
```bash
# Obtener DATABASE_URL de Render/Railway Dashboard
psql "tu_DATABASE_URL" -f scripts/remove-prisma-compliance-column.sql
```

**⚠️ IMPORTANTE:** 
- Ejecutar DESPUÉS de que el backend haya deployado exitosamente
- Verificar logs del backend para asegurar que arrancó sin errores
- Si hay error "column does not exist", ejecutar migración inmediatamente

---

## ✅ Verificación Post-Deployment

### Backend Health Check
- [ ] Visitar: `https://tu-backend.railway.app/health`
- [ ] Debe retornar: `{ "success": true, "message": "API funcionando correctamente" }`

### Frontend Health Check
- [ ] Visitar: `https://tu-app.vercel.app`
- [ ] Página de inicio carga correctamente
- [ ] Login funciona
- [ ] Dashboard accesible

### Funcionalidades Críticas
- [ ] **RIS Import:** Probar importar archivo .ris (backend/uploads/pericles_exported_citations.ris)
- [ ] **Database Selection:** Ver bases de datos en Step 6, verificar 🔐 en ACM y Web of Science
- [ ] **Font Sizes:** Verificar que toda la UI tiene fuentes más pequeñas (14px body)
- [ ] **PRISMA:** Verificar que 27 ítems se muestran correctamente

### Logs y Errores
- [ ] Revisar logs del backend en Render/Railway Dashboard
- [ ] Buscar errores de "column does not exist"
- [ ] Verificar que no hay 500 errors en `/api/*` endpoints

---

## 🔑 Variables de Entorno (Verificar)

### Backend (Render/Railway Dashboard)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://... (auto-configurado)
JWT_SECRET=<valor_seguro>
SESSION_SECRET=<valor_seguro>
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=https://tu-app.vercel.app
```

### Frontend (Vercel Dashboard)
```bash
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
```

---

## 📊 Métricas de Deployment

**Tamaño del Cambio:**
- 56 archivos modificados
- 6,477 líneas agregadas
- 397 líneas eliminadas

**Archivos Nuevos:**
- 4 templates LaTeX
- 4 documentos de guía
- 2 scripts SQL
- 3 archivos de tests

**Categorías:**
- ✅ Bug Fixes (RIS parser)
- ✅ Features (Premium indicators)
- ✅ UX Improvements (Font reduction)
- ✅ Refactoring (PRISMA architecture)
- ✅ Documentation

---

## 🆘 Troubleshooting

### Error: "column prisma_compliance does not exist"
**Causa:** Frontend/backend esperan columna eliminada pero migración no ejecutada
**Solución:** Ejecutar script `remove-prisma-compliance-column.sql`

### Error: "RIS import still returns 0 references"
**Causa:** Archivos .ris usan formato diferente
**Solución:** Verificar que el backend tiene commit fe924be con el fix

### Error: "Premium indicators not showing"
**Causa:** Frontend antiguo en caché
**Solución:** Hard refresh (Ctrl+Shift+R) o clear cache

### Error: "Fonts still too large"
**Causa:** CSS no aplicado o caché del navegador
**Solución:** Verificar globals.css deployó, clear cache navegador

---

## 📞 Contactos

**GitHub Repo:** https://github.com/Stefanny26/Tesis_RSL.git
**Frontend (Vercel):** [URL del dashboard]
**Backend (Render/Railway):** [URL del dashboard]
**Database:** [URL del dashboard]

---

## ✅ Checklist Final

- [ ] Backend deployado sin errores
- [ ] Frontend deployado sin errores
- [ ] Migraciones SQL ejecutadas
- [ ] Health checks pasando
- [ ] RIS import funciona
- [ ] Premium indicators visibles
- [ ] Font sizes reducidos
- [ ] No hay errores 500 en logs
- [ ] Variables de entorno correctas
- [ ] OAuth Google funciona (si aplica)

---

**Estado:** 🟡 EN PROGRESO
**Próximo paso:** Revisar dashboards de Vercel y Render/Railway para confirmar deployments exitosos
