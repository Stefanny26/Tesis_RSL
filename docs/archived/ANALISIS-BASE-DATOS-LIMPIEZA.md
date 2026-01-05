# Análisis Completo de Base de Datos y Plan de Limpieza

## 📊 RESUMEN EJECUTIVO

**Hallazgo Principal**: El código ESTÁ CORRECTO ✅. Los campos `search_string`, `databases` y `temporal_range` aparecen vacíos en tus 5 protocolos existentes porque fueron creados antes de alguna corrección anterior.

**Código Actual**:
- ✅ Frontend envía correctamente los datos (protocol-wizard.tsx líneas 149-151)
- ✅ Backend mapea correctamente los campos (protocol.repository.js líneas 107-109)
- ✅ Modelo serializa correctamente (protocol.model.js líneas 111-113)

**Acción Requerida**: 
1. Eliminar 2 tablas no usadas (`project_members`, `screening_overview`)
2. Probar con un nuevo protocolo que los datos SÍ se guardan ahora
3. Opcionalmente, actualizar manualmente los 5 protocolos existentes

---

## 1. TABLAS EXISTENTES EN LA BASE DE DATOS

### ✅ TABLAS ACTIVAMENTE USADAS (Mantener)

1. **users** - Gestión de usuarios
   - Uso: Autenticación, perfiles, Google OAuth
   - Estado: ✅ CRÍTICA - EN USO

2. **projects** - Proyectos de revisión sistemática
   - Uso: Core del sistema, todos los proyectos
   - Estado: ✅ CRÍTICA - EN USO

3. **protocols** - Protocolos de investigación
   - Uso: Almacena PICO, criterios, búsqueda
   - Estado: ✅ CRÍTICA - EN USO (CON PROBLEMAS)

4. **screening_records** - Referencias y cribado
   - Uso: Importación, cribado, clasificación
   - Estado: ✅ CRÍTICA - EN USO

5. **prisma_items** - Checklist PRISMA
   - Uso: Cumplimiento PRISMA
   - Estado: ✅ EN USO

6. **api_usage** - Uso de APIs (Gemini)
   - Uso: Control de costos, telemetría
   - Estado: ✅ EN USO

7. **article_versions** - Versiones de artículos
   - Uso: Futuro (generación de artículos)
   - Estado: ⚠️ PREPARADA PARA USO FUTURO

### ❌ TABLAS NO USADAS (Eliminar)

1. **project_members** 
   - Búsqueda en código: ❌ NO ENCONTRADA
   - Recomendación: **ELIMINAR**
   - Razón: No hay colaboración multi-usuario implementada

2. **screening_overview**
   - Búsqueda en código: ❌ NO ENCONTRADA
   - Recomendación: **ELIMINAR**
   - Razón: Las estadísticas se calculan dinámicamente

---

## 2. PROBLEMA CRÍTICO: Datos No Se Guardan

### 2.1 Campos Afectados en `protocols`

```csv
Campo            | CSV Muestra                | Estado
-----------------|----------------------------|--------
search_string    | (vacío)                    | ❌ NO SE GUARDA
databases        | []                         | ❌ NO SE GUARDA
temporal_range   | {}, null                   | ❌ INCONSISTENTE
```

### 2.2 Análisis del Flujo de Datos

**Frontend → Backend**
```typescript
// protocol-wizard.tsx línea 149-151
{
  databases: data.searchStrategy.databases,      // ✅ Se envía
  searchString: data.searchStrategy.searchString, // ✅ Se envía
  temporalRange: data.searchStrategy.temporalRange // ✅ Se envía
}
```

**Backend Repository**
```javascript
// protocol.repository.js línea 36-64
const values = [
  ...
  db.databases,        // ⚠️ Intenta insertar
  db.search_string,    // ⚠️ Intenta insertar
  db.temporal_range,   // ⚠️ Intenta insertar
  ...
];
```

**Modelo de Dominio**
```javascript
// protocol.model.js línea 39-44
this.databases = data.databases || [];
this.searchString = data.search_string || data.searchString;
this.temporalRange = data.temporal_range || data.temporalRange || {};
```

### 2.3 Problema Identificado

El modelo `toDatabase()` probablemente NO está serializando correctamente estos campos. Necesitamos verificar:

```javascript
// protocol.model.js - método toDatabase()
toDatabase() {
  return {
    databases: JSON.stringify(this.databases),        // ⚠️ DEBE ser JSON
    search_string: this.searchString,                 // ⚠️ DEBE existir
    temporal_range: JSON.stringify(this.temporalRange) // ⚠️ DEBE ser JSON
  }
}
```

---

## 3. COLUMNAS DUPLICADAS O PROBLEMÁTICAS

### En tabla `protocols`:

1. **Campos de fecha duplicados**:
   - `date_range_start` (LEGACY)
   - `date_range_end` (LEGACY)  
   - `temporal_range` (NUEVO - JSON con start, end, justification)
   
   **Acción**: Mantener solo `temporal_range`, marcar legacy como deprecated

2. **Campos de estrategia de búsqueda**:
   - Modelo actual tiene AMBOS:
     - `searchStrategy` (objeto anidado)
     - `databases`, `searchString`, `temporalRange` (campos planos)
   
   **Acción**: Eliminar anidación, usar solo campos planos

---

## 4. PLAN DE LIMPIEZA

### 4.1 Scripts SQL a Ejecutar

```sql
-- 1. Eliminar tablas no usadas
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS screening_overview CASCADE;

-- 2. Verificar datos actuales en protocols
SELECT 
  id, 
  search_string, 
  databases,
  temporal_range
FROM protocols
WHERE project_id = '9cf035c4-9efd-4ef1-ad93-5234af5ca4b5';

-- 3. Agregar índices faltantes
CREATE INDEX IF NOT EXISTS idx_protocols_project_id ON protocols(project_id);
CREATE INDEX IF NOT EXISTS idx_screening_records_project_id ON screening_records(project_id);
CREATE INDEX IF NOT EXISTS idx_prisma_items_project_id ON prisma_items(project_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
```

### 4.2 Correcciones en el Código

**A. Corregir protocol.model.js**
```javascript
toDatabase() {
  return {
    // ... otros campos ...
    databases: JSON.stringify(this.databases || []),
    search_string: this.searchString || null,
    temporal_range: JSON.stringify(this.temporalRange || {}),
    // ... resto ...
  }
}
```

**B. Simplificar protocolo frontend**
- Eliminar anidación `searchStrategy`
- Usar campos planos directamente

---

## 5. ACCIONES INMEDIATAS

### Paso 1: Verificar estado actual
```bash
cd backend
node -e "
const db = require('./src/config/database');
(async () => {
  const result = await db.query(
    'SELECT search_string, databases, temporal_range FROM protocols WHERE project_id = $1',
    ['9cf035c4-9efd-4ef1-ad93-5234af5ca4b5']
  );
  console.log(JSON.stringify(result.rows[0], null, 2));
  process.exit(0);
})()
"
```

### Paso 2: Corregir modelo
1. Revisar `protocol.model.js` método `toDatabase()`
2. Asegurar serialización JSON correcta
3. Verificar que todos los campos se mapean

### Paso 3: Probar guardado
1. Crear nuevo proyecto de prueba
2. Llenar wizard completo
3. Verificar en BD que todo se guardó

### Paso 4: Limpieza
1. Ejecutar DROP TABLE para tablas no usadas
2. Crear backup antes de borrar
3. Verificar que no rompe nada

---

## 6. ESTRUCTURA FINAL RECOMENDADA

### Tablas Core (7 tablas)
```
users
projects
protocols
screening_records
prisma_items
api_usage
article_versions (reservada)
```

### Eliminadas (2 tablas)
```
project_members ❌
screening_overview ❌
```

---

## 7. NEXT STEPS

1. ✅ **Ahora**: Revisar `protocol.model.js`
2. ⏳ **Hoy**: Corregir serialización de datos
3. ⏳ **Hoy**: Probar guardado completo
4. ⏳ **Mañana**: Ejecutar limpieza de BD
5. ⏳ **Futuro**: Documentar esquema final

---

## 8. RIESGOS

⚠️ **ALTO**: Si no se corrige el modelo, los datos seguirán sin guardarse
⚠️ **MEDIO**: Eliminar tablas sin backup puede causar pérdida de datos
⚠️ **BAJO**: Los cambios pueden requerir migración de datos existentes

---

**Última actualización**: 2025-12-16
**Responsable**: Análisis automático del sistema
