# 📊 ESQUEMA DE BASE DE DATOS
## Sistema Web de Gestión de RSL

**Última actualización:** 12 de enero de 2026  
**Motor de BD:** PostgreSQL 14+

---

## 📐 DIAGRAMA ENTIDAD-RELACIÓN

```
┌─────────────────┐
│     USERS       │
│─────────────────│
│ id (PK)         │◄───┐
│ email           │    │
│ name            │    │
│ password_hash   │    │
│ role            │    │
│ created_at      │    │
└─────────────────┘    │
                       │ user_id (FK)
┌─────────────────┐    │
│    PROJECTS     │◄───┘
│─────────────────│
│ id (PK)         │◄───┬───┐
│ user_id (FK)    │    │   │
│ title           │    │   │
│ description     │    │   │
│ status          │    │   │
│ created_at      │    │   │
└─────────────────┘    │   │
                       │   │
┌─────────────────┐    │   │ project_id (FK)
│   PROTOCOLS     │◄───┘   │
│─────────────────│        │
│ id (PK)         │        │
│ project_id (FK) │        │
│ refined_question│        │
│ population      │        │
│ intervention    │        │
│ comparison      │        │
│ outcomes        │        │
│ research_        │        │
│  questions[]    │        │
│ inclusion_      │        │
│  criteria[]     │        │
│ exclusion_      │        │
│  criteria[]     │        │
│ databases       │        │
│ search_queries  │        │
│ screening_      │        │
│  results (JSON) │        │
│ fase2_unlocked  │        │
│ created_at      │        │
└─────────────────┘        │
                           │
┌─────────────────┐        │
│   REFERENCES    │◄───────┤
│─────────────────│        │
│ id (PK)         │◄───┐   │
│ project_id (FK) │    │   │
│ doi             │    │   │
│ title           │    │   │
│ authors         │    │   │
│ year            │    │   │
│ abstract        │    │   │
│ journal         │    │   │
│ screening_      │    │   │
│  status         │    │   │
│ screening_      │    │   │
│  reason         │    │   │
│ similarity_     │    │   │
│  score          │    │   │
│ pdf_path        │    │   │
│ created_at      │    │   │
└─────────────────┘    │   │
                       │   │
┌─────────────────┐    │   │
│   RQS_ENTRIES   │◄───┘   │ reference_id (FK)
│─────────────────│        │
│ id (PK)         │        │
│ project_id (FK) │◄───────┘
│ reference_id FK │
│ author          │
│ year            │
│ title           │
│ study_type      │
│ technology      │
│ context         │
│ key_evidence    │
│ metrics (JSON)  │
│ rq1_relation    │
│ rq2_relation    │
│ rq3_relation    │
│ rq_notes        │
│ limitations     │
│ quality_score   │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│  PRISMA_ITEMS   │◄───────┐ project_id (FK)
│─────────────────│        │
│ id (PK)         │        │
│ project_id (FK) │        │
│ item_number     │        │
│ title           │        │
│ content         │        │
│ is_completed    │        │
│ validation_     │        │
│  score          │        │
│ validation_     │        │
│  feedback (JSON)│        │
│ updated_at      │        │
└─────────────────┘        │
                           │
┌─────────────────┐        │
│ ARTICLE_VERSIONS│◄───────┘
│─────────────────│
│ id (PK)         │
│ project_id (FK) │
│ version_number  │
│ title           │
│ abstract        │
│ introduction    │
│ methods         │
│ results         │
│ discussion      │
│ conclusions     │
│ references_     │
│  section        │
│ declarations    │
│ word_count      │
│ generated_by_ai │
│ created_by      │
│ created_at      │
└─────────────────┘
```

---

## 📋 TABLAS PRINCIPALES

### 1. `users`
**Descripción:** Usuarios del sistema  
**Relaciones:** 1:N con projects

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email del usuario |
| `name` | VARCHAR(255) | NOT NULL | Nombre completo |
| `password_hash` | VARCHAR(255) | NOT NULL | Hash de contraseña (bcrypt) |
| `role` | VARCHAR(50) | DEFAULT 'researcher' | Rol: 'researcher', 'admin' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de registro |

---

### 2. `projects`
**Descripción:** Proyectos de RSL  
**Relaciones:** N:1 con users, 1:1 con protocols, 1:N con references

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| `user_id` | UUID | NOT NULL, FK → users(id) | Propietario del proyecto |
| `title` | VARCHAR(500) | NOT NULL | Título del proyecto RSL |
| `description` | TEXT | | Descripción breve |
| `status` | VARCHAR(50) | DEFAULT 'planning' | Estado: 'planning', 'screening', 'data_extraction', 'writing', 'completed' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
- `idx_projects_user_id` en `user_id`
- `idx_projects_status` en `status`

---

### 3. `protocols`
**Descripción:** Protocolos PICO de cada proyecto  
**Relaciones:** 1:1 con projects

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| `project_id` | UUID | NOT NULL, UNIQUE, FK → projects(id) | Proyecto asociado |
| `refined_question` | TEXT | | Pregunta de investigación refinada |
| `population` | TEXT | | Componente P de PICO |
| `intervention` | TEXT | | Componente I de PICO |
| `comparison` | TEXT | | Componente C de PICO |
| `outcomes` | TEXT | | Componente O de PICO |
| `research_questions` | JSONB | DEFAULT '[]' | Array de preguntas RQ1, RQ2, RQ3 |
| `inclusion_criteria` | JSONB | DEFAULT '[]' | Criterios de inclusión |
| `exclusion_criteria` | JSONB | DEFAULT '[]' | Criterios de exclusión |
| `databases` | JSONB | DEFAULT '[]' | Bases de datos consultadas |
| `search_queries` | JSONB | DEFAULT '[]' | Cadenas de búsqueda por BD |
| `screening_results` | JSONB | | Resultados del cribado híbrido |
| `fase2_unlocked` | BOOLEAN | DEFAULT FALSE | Si Fase 2 (PRISMA) está desbloqueada |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
- `idx_protocols_project_id` en `project_id`

---

### 4. `references`
**Descripción:** Referencias bibliográficas importadas  
**Relaciones:** N:1 con projects, 1:1 con rqs_entries

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| `project_id` | UUID | NOT NULL, FK → projects(id) | Proyecto asociado |
| `doi` | VARCHAR(255) | | Digital Object Identifier |
| `title` | TEXT | NOT NULL | Título del artículo |
| `authors` | TEXT | | Autores (separados por coma) |
| `year` | INTEGER | | Año de publicación |
| `abstract` | TEXT | | Resumen del artículo |
| `journal` | VARCHAR(500) | | Nombre de la revista/conferencia |
| `volume` | VARCHAR(50) | | Volumen |
| `issue` | VARCHAR(50) | | Número/Issue |
| `pages` | VARCHAR(50) | | Páginas |
| `url` | TEXT | | URL de acceso |
| `screening_status` | VARCHAR(50) | DEFAULT 'pending' | Estado: 'pending', 'included', 'excluded', 'fulltext_included', 'fulltext_excluded' |
| `screening_reason` | TEXT | | Razón de inclusión/exclusión |
| `similarity_score` | FLOAT | | Score de similitud (embeddings) |
| `pdf_path` | TEXT | | Ruta al PDF almacenado |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de importación |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
- `idx_references_project_id` en `project_id`
- `idx_references_screening_status` en `screening_status`
- `idx_references_doi` en `doi`

---

### 5. `rqs_entries`
**Descripción:** Datos RQS extraídos de estudios incluidos  
**Relaciones:** N:1 con projects, N:1 con references

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| `project_id` | UUID | NOT NULL, FK → projects(id) | Proyecto asociado |
| `reference_id` | UUID | NOT NULL, FK → references(id) | Referencia asociada |
| `author` | VARCHAR(255) | | Autor principal |
| `year` | INTEGER | | Año del estudio |
| `title` | TEXT | | Título del estudio |
| `source` | VARCHAR(500) | | Fuente de publicación |
| `study_type` | VARCHAR(100) | | Tipo: 'empirical', 'case_study', 'experiment', 'simulation', 'review', 'other' |
| `technology` | VARCHAR(255) | | Tecnología principal estudiada |
| `context` | VARCHAR(100) | | Contexto: 'industrial', 'enterprise', 'academic', 'experimental', 'mixed' |
| `key_evidence` | TEXT | | Hallazgos principales |
| `metrics` | JSONB | DEFAULT '{}' | Métricas reportadas (latency, efficiency, etc.) |
| `rq1_relation` | VARCHAR(20) | | Relación con RQ1: 'yes', 'no', 'partial' |
| `rq2_relation` | VARCHAR(20) | | Relación con RQ2: 'yes', 'no', 'partial' |
| `rq3_relation` | VARCHAR(20) | | Relación con RQ3: 'yes', 'no', 'partial' |
| `rq_notes` | TEXT | | Notas sobre relación con RQs |
| `limitations` | TEXT | | Limitaciones del estudio |
| `quality_score` | VARCHAR(50) | | Calidad: 'high', 'medium', 'low' |
| `extraction_method` | VARCHAR(100) | DEFAULT 'ai_assisted' | Método de extracción |
| `extracted_by` | UUID | FK → users(id) | Usuario que extrajo |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de extracción |

**Índices:**
- `idx_rqs_entries_project_id` en `project_id`
- `idx_rqs_entries_reference_id` en `reference_id`

---

### 6. `prisma_items`
**Descripción:** 27 ítems del checklist PRISMA 2020  
**Relaciones:** N:1 con projects

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| `project_id` | UUID | NOT NULL, FK → projects(id) | Proyecto asociado |
| `item_number` | INTEGER | NOT NULL, CHECK (1-27) | Número de ítem PRISMA |
| `title` | VARCHAR(255) | | Título del ítem |
| `content` | TEXT | | Contenido del ítem |
| `is_completed` | BOOLEAN | DEFAULT FALSE | Si está completado |
| `validation_score` | INTEGER | | Score de validación IA (0-100) |
| `validation_feedback` | JSONB | | Feedback de IA (reasoning, issues, suggestions) |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |

**Restricción única:** `UNIQUE(project_id, item_number)`  
**Índices:**
- `idx_prisma_items_project_id` en `project_id`
- `idx_prisma_items_completed` en `is_completed`

---

### 7. `article_versions`
**Descripción:** Versiones de artículos científicos generados  
**Relaciones:** N:1 con projects

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| `project_id` | UUID | NOT NULL, FK → projects(id) | Proyecto asociado |
| `version_number` | INTEGER | NOT NULL | Número de versión (1, 2, 3...) |
| `title` | TEXT | | Título del artículo |
| `abstract` | TEXT | | Resumen estructurado |
| `introduction` | TEXT | | Sección Introducción |
| `methods` | TEXT | | Sección Métodos |
| `results` | TEXT | | Sección Resultados |
| `discussion` | TEXT | | Sección Discusión |
| `conclusions` | TEXT | | Sección Conclusiones |
| `references_section` | TEXT | | Sección Referencias |
| `declarations` | TEXT | | Sección Declaraciones |
| `word_count` | INTEGER | | Total de palabras |
| `generated_by_ai` | BOOLEAN | DEFAULT TRUE | Si fue generado por IA |
| `created_by` | UUID | FK → users(id) | Usuario que creó |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de generación |

**Restricción única:** `UNIQUE(project_id, version_number)`  
**Índices:**
- `idx_article_versions_project_id` en `project_id`
- `idx_article_versions_version` en `version_number`

---

## 🔐 RELACIONES CLAVE

### Cascadas de eliminación

```sql
-- Eliminar proyecto elimina TODO:
projects → protocols (CASCADE)
projects → references (CASCADE)
projects → rqs_entries (CASCADE)
projects → prisma_items (CASCADE)
projects → article_versions (CASCADE)

-- Eliminar referencia elimina RQS:
references → rqs_entries (CASCADE)

-- Eliminar usuario NO elimina proyectos:
users → projects (SET NULL o RESTRICT según política)
```

---

## 📊 CONSULTAS ÚTILES

### Referencias por estado de cribado
```sql
SELECT 
  screening_status, 
  COUNT(*) as count 
FROM references 
WHERE project_id = 'xxx'
GROUP BY screening_status;
```

### Progreso PRISMA
```sql
SELECT 
  COUNT(CASE WHEN is_completed THEN 1 END) as completed,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(CASE WHEN is_completed THEN 1 END) / COUNT(*), 2) as percentage
FROM prisma_items
WHERE project_id = 'xxx';
```

### Estadísticas RQS
```sql
SELECT 
  study_type,
  COUNT(*) as count
FROM rqs_entries
WHERE project_id = 'xxx'
GROUP BY study_type
ORDER BY count DESC;
```

---

## 🔄 MIGRACIONES IMPORTANTES

### ✅ Refactorización: Eliminación de prisma_compliance (Ene 2026)

**Estado**: Código refactorizado, migración SQL pendiente

**Razón**: Campo `protocols.prisma_compliance` (JSONB) era redundante. La tabla `prisma_items` es la única fuente de verdad.

**Script SQL**: `scripts/remove-prisma-compliance-column.sql`

**Documentación completa**: `backend/docs/REFACTOR-PRISMA-COMPLIANCE.md`

```sql
-- Verificar que todos los proyectos tienen 27 ítems
SELECT p.id, COUNT(pi.id) AS items
FROM projects p
LEFT JOIN prisma_items pi ON pi.project_id = p.id
GROUP BY p.id
HAVING COUNT(pi.id) < 27;

-- Ejecutar migración
ALTER TABLE protocols DROP COLUMN IF EXISTS prisma_compliance;
```

**Endpoint de migración**: `POST /api/projects/:id/prisma/migrate`

---

**Última revisión:** 12 de enero de 2026  
**Mantenido por:** Hernández Buenaño Stefanny Mishel, González Orellana Adriana Pamela
