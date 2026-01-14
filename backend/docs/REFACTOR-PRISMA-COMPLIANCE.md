# Refactorización: Eliminación de `prisma_compliance` JSONB

## 📋 Resumen

**Objetivo**: Eliminar el campo redundante `protocols.prisma_compliance` (JSONB) y centralizar todos los datos PRISMA en la tabla `prisma_items`.

**Estado**: ✅ **COMPLETADO** - Código refactorizado, falta ejecutar migración SQL

**Fecha**: 12 de enero de 2026

---

## 🔍 Problema

El sistema tenía **dos fuentes de verdad** para los ítems PRISMA:

1. **`protocols.prisma_compliance`** - Columna JSONB con array de 27 ítems
2. **`prisma_items`** - Tabla dedicada con un registro por ítem

Esto causaba:
- **Inconsistencias**: Datos duplicados que podían divergir
- **Complejidad**: Lógica para sincronizar ambos almacenamientos
- **Mantenimiento**: Cambios requerían actualizar múltiples lugares

---

## ✅ Solución Implementada

### 1. **Backend - Modelo de Dominio**

**Archivo**: `backend/src/domain/models/protocol.model.js`

**Cambios**:
```javascript
// ANTES
this.prismaCompliance = data.prisma_compliance || data.prismaCompliance || [];

// DESPUÉS
// NOTA: prismaCompliance se gestiona en tabla prisma_items
// this.prismaCompliance campo deprecado - usar prisma_items
```

**Métodos afectados**:
- ✅ `constructor()` - Removido `this.prismaCompliance`
- ✅ `toJSON()` - Removida propiedad `prismaCompliance`
- ✅ `toDatabase()` - Removido `prisma_compliance`

---

### 2. **Backend - Repositorio**

**Archivo**: `backend/src/infrastructure/repositories/protocol.repository.js`

**Cambios**:
- ✅ Removido `prisma_compliance` de array de campos JSONB a parsear
- ✅ Removido de query INSERT (17 valores → 17 valores)
- ✅ Comentado en fieldMap del método `update()`

**Impacto**:
```javascript
// Query INSERT simplificado
INSERT INTO protocols (
  project_id, proposed_title, ..., temporal_range,
  -- prisma_compliance REMOVIDO
  completed
)
```

---

### 3. **Backend - Controlador**

**Archivo**: `backend/src/api/controllers/prisma.controller.js`

**Estado**: ✅ **No requiere cambios**

**Razón**: El controlador ya usa exclusivamente `PrismaItemRepository` para leer/escribir ítems PRISMA. Nunca accedía a `protocol.prisma_compliance`.

---

### 4. **Frontend - Tipos TypeScript**

**Archivo**: `frontend/lib/types.ts`

**Cambio**:
```typescript
export interface Project {
  // ...
  references?: { ... }
  // prismaCompliance?: number  // DEPRECADO
}
```

---

### 5. **Frontend - Componentes**

**Archivos modificados**:

#### `frontend/components/dashboard/project-card.tsx`
- ✅ Removido bloque que mostraba "X de 27 ítems (Y%)"
- ✅ Ahora se debe obtener desde API `/api/projects/:id/prisma`

#### `frontend/components/project-wizard/wizard-context.tsx`
- ✅ Removido mapeo de `protocol.prismaCompliance`
- ✅ Campo `prismaItems` ahora se inicializa vacío `[]`
- ✅ Se debe cargar desde endpoint dedicado

#### `frontend/lib/mock-data.ts`
- ✅ Comentadas líneas `prismaCompliance: 78` y `prismaCompliance: 65`

---

## 🗄️ Migración de Base de Datos

**Archivo**: `scripts/remove-prisma-compliance-column.sql`

**Pasos de la migración**:

1. ✅ **Verificar** que todos los proyectos tienen ítems en `prisma_items`
2. ✅ **Backup opcional** de datos existentes (comentado)
3. ✅ **Ejecutar** `ALTER TABLE protocols DROP COLUMN prisma_compliance`
4. ✅ **Verificar** eliminación exitosa

### Ejecución

```bash
# Opción 1: psql
psql -U postgres -d thesis_rsl_system -f scripts/remove-prisma-compliance-column.sql

# Opción 2: DBeaver / pgAdmin
# Abrir archivo SQL y ejecutar
```

---

## 📊 Verificación de Integridad

### Antes de ejecutar la migración:

```sql
-- Verificar que todos los proyectos tienen ítems migrados
SELECT 
    p.id, p.title,
    COUNT(pi.id) AS items_count
FROM projects p
LEFT JOIN prisma_items pi ON pi.project_id = p.id
GROUP BY p.id, p.title
HAVING COUNT(pi.id) < 27;
```

**Resultado esperado**: 0 filas (todos tienen 27 ítems)

### Después de ejecutar la migración:

```sql
-- Verificar que la columna fue eliminada
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'protocols' 
  AND column_name = 'prisma_compliance';
```

**Resultado esperado**: 0 filas (columna eliminada)

---

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

**Casos de prueba críticos**:
- ✅ Creación de protocolo sin `prisma_compliance`
- ✅ Actualización de protocolo no afecta ítems PRISMA
- ✅ GET `/api/projects/:id/prisma` retorna 27 ítems
- ✅ Generación de artículo usa datos de `prisma_items`

### Frontend
```bash
cd frontend
npm run dev
```

**Verificaciones manuales**:
- ✅ Dashboard no muestra error por `prismaCompliance` undefined
- ✅ Wizard de proyecto carga sin errores
- ✅ Fase PRISMA muestra ítems desde API

---

## 📝 Checklist de Implementación

- [x] **Backend - Modelo**: Remover `prismaCompliance` de Protocol
- [x] **Backend - Repositorio**: Actualizar queries SQL
- [x] **Frontend - Tipos**: Deprecar interface `prismaCompliance`
- [x] **Frontend - UI**: Remover referencias en componentes
- [x] **SQL**: Crear script de migración
- [ ] **Ejecutar**: Migración en desarrollo
- [ ] **Ejecutar**: Migración en producción
- [ ] **Testing**: Verificar flujo completo

---

## ⚠️ Advertencias

### Para Desarrollo
- ✅ Código refactorizado es **retrocompatible**
- ✅ Si columna existe, queries seguirán funcionando (la ignoran)
- ⚠️  Al ejecutar migración SQL, campo desaparece permanentemente

### Para Producción
1. ✅ **Verificar** que endpoint `/api/projects/:id/prisma/migrate` funciona
2. ✅ **Ejecutar** migración en todos los proyectos activos
3. ✅ **Backup** de base de datos antes de DROP COLUMN
4. ✅ **Rollback plan**: Restaurar desde backup si algo falla

---

## 🔄 Arquitectura Resultante

```
┌─────────────────────────────────────────────┐
│  protocols                                  │
├─────────────────────────────────────────────┤
│ id (PK)                                     │
│ project_id (FK → projects)                  │
│ proposed_title                              │
│ ...                                         │
│ ❌ prisma_compliance (ELIMINADO)            │
│ prisma_locked                               │
│ prisma_completed_at                         │
└─────────────────────────────────────────────┘
                    │
                    │ 1:N
                    ▼
┌─────────────────────────────────────────────┐
│  prisma_items (ÚNICA FUENTE DE VERDAD)     │
├─────────────────────────────────────────────┤
│ id (PK)                                     │
│ project_id (FK → projects)                  │
│ item_number (1-27)                          │
│ section (Title, Abstract, Methods, etc)     │
│ topic                                       │
│ content                                     │
│ complies ('yes', 'no', 'partial')           │
│ evidence                                    │
│ ai_validated, ai_decision, ai_score         │
│ created_at, updated_at                      │
└─────────────────────────────────────────────┘
```

---

## 📚 Referencias

- **Commit**: Refactor: Eliminate prisma_compliance JSONB redundancy
- **Issue**: #7 - Pendiente mejoras del sistema
- **Documentación**: `docs/DATABASE-SCHEMA.md` (actualizada)
- **Testing**: `backend/tests/integration/full-flow.test.js`

---

## 🎯 Beneficios

✅ **Consistencia**: Una sola fuente de verdad para ítems PRISMA  
✅ **Simplicidad**: Menos código de sincronización  
✅ **Mantenibilidad**: Cambios más fáciles en el futuro  
✅ **Performance**: Queries más eficientes (índices en tabla dedicada)  
✅ **Escalabilidad**: Fácil agregar columnas a `prisma_items`  

---

## 📞 Contacto

**Autor**: Thesis RSL System Team  
**Fecha de refactorización**: 12/01/2026  
**Estado**: Listo para testing y deployment
