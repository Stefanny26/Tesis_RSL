# 🏗️ ARQUITECTURA DEL SISTEMA RSL

## Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "CAPA DE PRESENTACIÓN"
        FE[Frontend Next.js<br/>TypeScript + React<br/>Tailwind CSS]
        VERCEL[Vercel<br/>Hosting & CDN]
    end

    subgraph "CAPA DE APLICACIÓN - Backend Node.js/Express (Render)"
        subgraph "Controllers"
            CTRL_AUTH[Auth Controller]
            CTRL_PROJ[Project Controller]
            CTRL_PROT[Protocol Controller]
            CTRL_REF[Reference Controller]
            CTRL_SCREEN[Screening Controller]
            CTRL_PRISMA[PRISMA Controller]
            CTRL_RQS[RQS Controller]
            CTRL_ARTICLE[Article Controller]
        end

        subgraph "Use Cases"
            UC_SCREEN[Screening Use Cases<br/>- embeddings<br/>- hybrid screening]
            UC_PRISMA[PRISMA Use Cases<br/>- extract PDFs<br/>- generate context<br/>- complete items<br/>- gatekeeper validation]
            UC_RQS[RQS Use Cases<br/>- extract data<br/>- sanitize enums<br/>- validate entries]
            UC_ARTICLE[Article Use Cases<br/>- generate draft]
        end

        subgraph "Domain Models"
            MODEL_USER[User]
            MODEL_PROJ[Project]
            MODEL_PROT[Protocol]
            MODEL_REF[Reference]
            MODEL_PRISMA[PRISMA Item]
            MODEL_RQS[RQS Entry]
        end

        subgraph "Repositories"
            REPO_USER[User Repository]
            REPO_PROJ[Project Repository]
            REPO_PROT[Protocol Repository]
            REPO_REF[Reference Repository]
        end

        subgraph "Base de Datos Integrada"
            DB[(PostgreSQL<br/>Database)]
        end
    end

    subgraph "SERVICIOS EXTERNOS"
        subgraph "APIs de Inteligencia Artificial"
            OPENAI[OpenAI API<br/>- Embeddings<br/>- ChatGPT]
            GEMINI[Google Gemini API<br/>- Análisis contextual]
        end

        subgraph "APIs Académicas"
            SCOPUS[Scopus API<br/>Búsqueda bibliográfica]
            IEEE[IEEE Xplore API<br/>Búsqueda bibliográfica]
            PUBMED[PubMed API<br/>Búsqueda bibliográfica]
        end
    end

    %% Flujo Frontend → Backend
    FE -->|HTTPS Request| VERCEL
    VERCEL -->|API Call| CTRL_AUTH
    VERCEL -->|API Call| CTRL_PROJ
    VERCEL -->|API Call| CTRL_PROT
    VERCEL -->|API Call| CTRL_REF
    VERCEL -->|API Call| CTRL_SCREEN
    VERCEL -->|API Call| CTRL_PRISMA
    VERCEL -->|API Call| CTRL_RQS
    VERCEL -->|API Call| CTRL_ARTICLE

    %% Flujo Controllers → Use Cases
    CTRL_SCREEN -->|Call| UC_SCREEN
    CTRL_PRISMA -->|Call| UC_PRISMA
    CTRL_RQS -->|Call| UC_RQS
    CTRL_ARTICLE -->|Call| UC_ARTICLE

    %% Flujo Use Cases → Repositories
    UC_SCREEN -->|Access| REPO_REF
    UC_SCREEN -->|Access| REPO_PROT
    UC_PRISMA -->|Access| REPO_REF
    UC_PRISMA -->|Access| REPO_PROT
    UC_RQS -->|Access| REPO_REF
    UC_RQS -->|Access| REPO_PROT
    UC_ARTICLE -->|Access| REPO_PROT

    %% Flujo Repositories → Database
    REPO_USER -->|Query| DB
    REPO_PROJ -->|Query| DB
    REPO_PROT -->|Query| DB
    REPO_REF -->|Query| DB

    %% Flujo hacia Servicios Externos
    UC_SCREEN -.->|API Call| OPENAI
    UC_SCREEN -.->|API Call| GEMINI
    UC_PRISMA -.->|API Call| OPENAI
    UC_PRISMA -.->|API Call| GEMINI
    UC_RQS -.->|API Call| OPENAI
    UC_RQS -.->|API Call| GEMINI
    CTRL_REF -.->|API Call| SCOPUS
    CTRL_REF -.->|API Call| IEEE
    CTRL_REF -.->|API Call| PUBMED

    %% Estilos
    classDef frontend fill:#60a5fa,stroke:#2563eb,stroke-width:2px,color:#fff
    classDef backend fill:#34d399,stroke:#059669,stroke-width:2px,color:#fff
    classDef database fill:#fbbf24,stroke:#f59e0b,stroke-width:2px,color:#000
    classDef external fill:#f87171,stroke:#dc2626,stroke-width:2px,color:#fff

    class FE,VERCEL frontend
    class CTRL_AUTH,CTRL_PROJ,CTRL_PROT,CTRL_REF,CTRL_SCREEN,CTRL_PRISMA,CTRL_RQS,CTRL_ARTICLE backend
    class UC_SCREEN,UC_PRISMA,UC_RQS,UC_ARTICLE backend
    class MODEL_USER,MODEL_PROJ,MODEL_PROT,MODEL_REF,MODEL_PRISMA,MODEL_RQS backend
    class REPO_USER,REPO_PROJ,REPO_PROT,REPO_REF backend
    class DB database
    class OPENAI,GEMINI,SCOPUS,IEEE,PUBMED external
```

---

## Diagrama de Flujo: CRIBADO → PRISMA → ARTÍCULO

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend<br/>(Next.js)
    participant API as API Gateway
    participant BE as Backend<br/>(Lambda/Express)
    participant DB as PostgreSQL
    participant AI as APIs IA<br/>(OpenAI/Gemini)
    participant ACM as APIs Académicas<br/>(Scopus/IEEE)

    %% FASE 1: PROTOCOLO Y BÚSQUEDA
    rect rgb(240, 248, 255)
        Note over User,ACM: FASE 1: PROTOCOLO Y BÚSQUEDA
        User->>FE: Crear protocolo PICO
        FE->>API: POST /api/protocols
        API->>BE: Ejecutar función
        BE->>AI: Generar criterios con IA
        AI-->>BE: Criterios optimizados
        BE->>DB: Guardar protocolo
        DB-->>BE: Protocolo guardado
        BE-->>API: Respuesta
        API-->>FE: Protocolo creado
        FE-->>User: Mostrar protocolo

        User->>FE: Buscar referencias
        FE->>API: POST /api/references/search
        API->>BE: Ejecutar búsqueda
        BE->>ACM: Query a Scopus/IEEE
        ACM-->>BE: Referencias JSON
        BE->>DB: Guardar referencias
        DB-->>BE: 42 referencias guardadas
        BE-->>API: Respuesta
        API-->>FE: Referencias importadas
        FE-->>User: 42 referencias cargadas
    end

    %% FASE 2: CRIBADO HÍBRIDO
    rect rgb(240, 255, 240)
        Note over User,ACM: FASE 2: CRIBADO HÍBRIDO
        User->>FE: Ejecutar cribado
        FE->>API: POST /api/screening/hybrid
        API->>BE: Ejecutar cribado híbrido
        
        BE->>AI: Generar embeddings
        AI-->>BE: Vectores semánticos
        
        BE->>AI: Analizar zona gris con ChatGPT
        AI-->>BE: Clasificaciones
        
        BE->>DB: Guardar screeningResults
        DB-->>BE: Resultados guardados
        BE-->>API: 33 incluidas, 9 excluidas
        API-->>FE: Cribado completado
        FE-->>User: Resultados mostrados
        
        User->>FE: Revisión manual
        FE->>API: PUT /api/protocols
        API->>BE: Actualizar fase2_unlocked
        BE->>DB: fase2_unlocked = true
        DB-->>BE: Actualizado
        BE-->>API: Fase 2 desbloqueada
        API-->>FE: Revisión manual habilitada
        FE-->>User: Fase 2 disponible
    end

    %% FASE 3: PRISMA
    rect rgb(255, 250, 240)
        Note over User,ACM: FASE 3: COMPLETAR PRISMA
        User->>FE: Analizar PDFs completos
        FE->>API: POST /api/prisma/extract-pdfs
        API->>BE: Extraer datos de PDFs
        
        loop Por cada PDF (33 estudios)
            BE->>AI: Extraer datos estructurados
            AI-->>BE: Tipo estudio, metodología, hallazgos
        end
        
        BE->>DB: Guardar full_text_data
        DB-->>BE: Datos guardados
        BE-->>API: 33 PDFs analizados
        API-->>FE: Extracción completa
        FE-->>User: PDFs procesados
        
        User->>FE: Completar PRISMA automáticamente
        FE->>API: POST /api/prisma/complete-items
        API->>BE: Generar ítems PRISMA
        
        BE->>DB: Obtener protocolo + screening + PDFs
        DB-->>BE: PRISMAContext completo
        
        BE->>AI: Validar con Gatekeeper (27 prompts)
        AI-->>BE: Validaciones pasadas
        
        BE->>AI: Generar ítems 16,17,23,24,26,27
        AI-->>BE: Texto académico generado
        
        BE->>DB: Guardar prismaCompliance
        BE->>DB: prismaLocked = true (27/27)
        DB-->>BE: PRISMA bloqueado
        BE-->>API: 6 ítems generados
        API-->>FE: PRISMA completado
        FE-->>User: 🎉 PRISMA bloqueado (27/27)
    end

    %% FASE 3.5: RQS EXTRACTION
    rect rgb(245, 255, 250)
        Note over User,ACM: FASE 3.5: EXTRACCIÓN RQS
        User->>FE: Extraer datos RQS
        FE->>API: POST /api/projects/:id/rqs/extract
        API->>BE: Extraer RQS de incluidas
        
        loop Por cada referencia incluida (33)
            BE->>AI: Extraer RQS (studyType, context, etc.)
            AI-->>BE: Datos estructurados JSON
            BE->>BE: Sanitizar enums (prevenir constraints)
            BE->>DB: Guardar rqs_entry
        end
        
        DB-->>BE: 33 entradas RQS guardadas
        BE-->>API: Extracción completada
        API-->>FE: RQS listo
        FE-->>User: Datos RQS disponibles
        
        User->>FE: Ver estadísticas RQS
        FE->>API: GET /api/projects/:id/rqs/stats
        API->>BE: Calcular estadísticas
        BE->>DB: Agrupar por studyType, context, etc.
        DB-->>BE: Estadísticas agregadas
        BE-->>API: Estadísticas calculadas
        API-->>FE: Datos analíticos
        FE-->>User: Visualizaciones RQS
    end

    %% FASE 4: ARTÍCULO
    rect rgb(255, 240, 245)
        Note over User,ACM: FASE 4: GENERAR ARTÍCULO
        User->>FE: Generar borrador artículo
        FE->>API: POST /api/article/generate-draft
        API->>BE: Generar artículo completo
        
        BE->>DB: Obtener PRISMAContext
        DB-->>BE: Contexto completo
        
        BE->>AI: Generar secciones del artículo
        AI-->>BE: Métodos, Resultados, Discusión
        
        BE->>DB: Guardar borrador artículo
        DB-->>BE: Artículo guardado
        BE-->>API: Artículo generado
        API-->>FE: Borrador completo
        FE-->>User: Manuscrito listo para revisar
    end
```

---

## Descripción de Componentes

### 🎨 CAPA DE PRESENTACIÓN

#### **Frontend (Next.js + TypeScript)**
- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Estado**: React Hooks (useState, useEffect)
- **Routing**: File-based routing de Next.js
- **Hosting**: Vercel con CDN global

**Componentes principales**:
- `ProjectWizard` - Creación de proyectos
- `ProtocolForm` - Formulario PICO
- `ScreeningPanel` - Interface de cribado
- `PrismaChecklist` - Checklist PRISMA 2020
- `ArticleEditor` - Editor de manuscrito

---

---

### ⚙️ CAPA DE APLICACIÓN (Backend)

#### **Stack Tecnológico**
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Hosting**: Render.com (production) / Local (development)
- **Arquitectura**: Clean Architecture / DDD
- **Autenticación**: JWT + Passport.js
- **Validación**: express-validator
- **ORM**: Consultas SQL nativas (sin ORM)
- **Deployment**: Auto-deploy desde GitHub (main branch)

#### **Estructura por Capas**

**1. Controllers** (Capa de presentación)
- Manejan requests HTTP
- Validación de entrada
- Respuestas HTTP estandarizadas
- Gestión de errores

**2. Use Cases** (Capa de aplicación)
- Lógica de negocio
- Orquestación de operaciones
- Validaciones de dominio
- Llamadas a servicios externos

**3. Domain Models** (Capa de dominio)
- Entidades de negocio
- Reglas de validación
- Métodos toJSON() / toDatabase()
- Lógica de dominio pura

**4. Repositories** (Capa de infraestructura)
- Acceso a base de datos
- Queries SQL optimizadas
- Mapeo de datos
- Transacciones

---

### 🗄️ BASE DE DATOS (PostgreSQL)

#### **Ubicación**: Integrada en el backend
- **Versión**: PostgreSQL 14+
- **Hosting**: Render.com (producción) / Local (desarrollo)
- **Conexión**: Pool de conexiones (pg)
- **Características**:
  - JSONB para datos complejos
  - Índices GIN para búsqueda en JSON
  - Índices B-tree para campos relacionales
  - Transacciones ACID

#### **Tablas Principales**

**users**
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `name` (VARCHAR)
- `google_id` (VARCHAR)
- `created_at` (TIMESTAMP)

**projects**
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `name` (VARCHAR)
- `status` (VARCHAR)
- `deadline` (TIMESTAMP)

**protocols**
- `id` (UUID, PK)
- `project_id` (UUID, FK)
- `population`, `intervention`, `comparison`, `outcomes` (TEXT)
- `inclusion_criteria`, `exclusion_criteria` (JSONB)
- `databases`, `search_queries` (JSONB)
- `prisma_compliance` (JSONB) - 27 ítems
- **screening_results** (JSONB) - Resultados del cribado
- **prisma_locked** (BOOLEAN) - Bloqueo de PRISMA ✨
- **prisma_completed_at** (TIMESTAMP) ✨
- **fase2_unlocked** (BOOLEAN) - Revisión manual habilitada

**references**
- `id` (UUID, PK)
- `project_id` (UUID, FK)
- `title`, `authors`, `year`, `journal`, `doi`, `abstract` (TEXT/VARCHAR)
- `screening_status` (VARCHAR) - included/excluded
- `ai_classification`, `ai_confidence_score`, `screening_score` (VARCHAR/NUMERIC)
- **full_text_data** (JSONB) - Datos extraídos de PDFs ✨
- **full_text_extracted** (BOOLEAN) ✨
- **full_text_extracted_at** (TIMESTAMP) ✨
- `pdf_path` (VARCHAR) - Ruta del PDF

**screening_records**
- `id` (UUID, PK)
- `reference_id` (UUID, FK)
- `project_id` (UUID, FK)
- `stage` (VARCHAR) - title_abstract / fulltext
- `scores` (JSONB) - Puntajes de criterios
- `decision` (VARCHAR) - include/exclude

**rqs_entries** ✨ (Research Question Schema)
- `id` (SERIAL, PK)
- `project_id` (UUID, FK)
- `reference_id` (UUID, FK)
- `author`, `year`, `title`, `source` (VARCHAR/TEXT)
- `study_type` (VARCHAR) - empirical/case_study/experiment/simulation/review/other
- `technology` (VARCHAR) - Tecnología evaluada
- `context` (VARCHAR) - industrial/enterprise/academic/experimental/mixed/other
- `key_evidence` (TEXT) - Hallazgos principales
- `metrics` (JSONB) - Métricas reportadas
- `rq1_relation`, `rq2_relation`, `rq3_relation` (VARCHAR) - yes/no/partial
- `rq_notes` (TEXT) - Justificación de relaciones con RQs
- `limitations` (TEXT)
- `quality_score` (VARCHAR) - high/medium/low
- `extraction_method` (VARCHAR) - ai_assisted/manual/hybrid
- `extracted_by`, `validated_by` (UUID, FK)
- `extracted_at`, `validated_at` (TIMESTAMP)
- `validated` (BOOLEAN)

---

### 🌐 SERVICIOS EXTERNOS

#### **APIs de Inteligencia Artificial**

**OpenAI API**
- **Embeddings**: `text-embedding-3-small`
  - Dimensiones: 1536
  - Uso: Similitud semántica en cribado
  - Costo: $0.02 / 1M tokens

- **ChatGPT**: `gpt-4-turbo-preview`
  - Uso: Análisis contextual zona gris
  - Uso: Extracción de datos de PDFs
  - Uso: Generación de ítems PRISMA
  - Costo: $0.01 / 1K tokens (input)

**Google Gemini API**
- **Modelo**: `gemini-1.5-flash`
- Uso alternativo a ChatGPT
- Más rápido, menor costo
- Multimodal (texto + PDFs)

#### **APIs Académicas**

**Scopus API**
- Búsqueda bibliográfica
- Metadata completa
- Acceso institucional requerido

**IEEE Xplore API**
- Publicaciones IEEE
- Búsqueda avanzada
- Rate limit: 200 req/día

**PubMed API**
- Literatura biomédica
- Acceso público
- Sin límite de requests

---

## Flujo de Datos por Fase

### 📊 FASE 1: PROTOCOLO (13 ítems PRISMA)

```
Usuario → Formulario PICO → IA genera criterios → 
DB guarda protocolo → Búsqueda en APIs → 
42 referencias importadas
```

**Ítems PRISMA completados automáticamente**:
1. Título
2. Resumen estructurado
3. Justificación
4. Objetivos (PICO)
5. Criterios de elegibilidad
6. Fuentes de información
7. Estrategia de búsqueda
10. Elementos de datos

---

### 🔍 FASE 2: CRIBADO (Datos para PRISMA)

```
42 referencias → Embeddings (similitud) → 
Zona gris → ChatGPT (análisis) → 
33 incluidas + 9 excluidas → 
screeningResults guardado en protocol
```

**Datos generados**:
- Números PRISMA (identificados, excluidos, incluidos)
- Método de cribado (híbrido)
- Umbrales de similitud
- Decisiones trazables

---

### 📋 FASE 3: PRISMA (14 ítems adicionales)

#### **3.1 Análisis de PDFs**

```
33 PDFs → Extracción con IA → 
Datos estructurados (JSONB) → 
full_text_data guardado
```

**Datos extraídos por PDF**:
- Tipo de estudio
- Contexto de investigación
- Metodología aplicada
- Variables medidas
- Métricas usadas
- Hallazgos principales
- Limitaciones

#### **3.2 Gatekeeper PRISMA** ✨

```
27 prompts de validación →
Verificar cada ítem PRISMA →
IA evalúa criterios →
Aprobación/rechazo automático
```

**Archivo**: `backend/src/config/prisma-validation-prompts.js`
- 1,701 líneas de configuración
- 27 prompts de validación (1 por ítem PRISMA)
- Criterios específicos por ítem
- Ejemplos de aprobación/rechazo
- Integración con `prisma.controller.js`

#### **3.3 Generación de PRISMA**

```
PRISMAContext (protocolo + cribado + PDFs) → 
IA genera ítems 16,17,23,24,26,27 → 
prismaCompliance actualizado → 
27/27 → prismaLocked = true
```

**Ítems generados**:
- **16**: Selección de estudios (números)
- **17**: Características de estudios
- **23**: Discusión del proceso
- **24**: Registro (declaración)
- **26**: Conflictos de interés
- **27**: Uso de IA y disponibilidad de datos

---

### 📊 FASE 3.5: RQS (Research Question Schema) ✨

```
33 referencias incluidas → 
IA extrae RQS por estudio →
Sanitización de enums →
rqs_entries guardado
```

**Datos extraídos por referencia**:
- **author**: Autores principales
- **year**: Año de publicación
- **studyType**: empirical/case_study/experiment/simulation/review/other
- **technology**: Tecnología evaluada (ej: "5G", "Blockchain", "SDN")
- **context**: industrial/enterprise/academic/experimental/mixed/other
- **keyEvidence**: Hallazgos principales (texto narrativo)
- **metrics**: Métricas reportadas (JSONB: latency, throughput, efficiency)
- **rq1Relation/rq2Relation/rq3Relation**: yes/no/partial (relación con RQs)
- **rqNotes**: Justificación de relaciones
- **limitations**: Limitaciones declaradas
- **qualityScore**: high/medium/low

**Funcionalidad de sanitización** (hotfix aplicado):
- Mapea valores de IA → enums permitidos
- Previene violaciones de CHECK constraints
- Fuzzy matching para valores similares
- Fallback a 'other' si no matchea
- Logging de transformaciones

**Endpoints disponibles**:
- `POST /api/projects/:id/rqs/extract` - Extracción masiva
- `POST /api/projects/:id/rqs/extract/:refId` - Extracción individual
- `GET /api/projects/:id/rqs` - Listar entradas RQS
- `GET /api/projects/:id/rqs/stats` - Estadísticas agregadas
- `PUT /api/projects/:id/rqs/:rqsId` - Validación manual
- `GET /api/projects/:id/rqs/export/csv` - Exportar a CSV

---

### 📄 FASE 4: ARTÍCULO (Borrador completo)

```
PRISMAContext completo → 
IA genera secciones → 
Artículo guardado
```

**Secciones generadas**:
- **Título**: Desde protocolo
- **Resumen**: Objetivo + método + resultados
- **Introducción**: Justificación + objetivos
- **Métodos**: Estrategia + selección + extracción
- **Resultados**: Selección + características + síntesis
- **Discusión**: Interpretación metodológica
- **Referencias**: 33 estudios incluidos

---

## Tecnologías por Capa

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Express.js, Node.js 18, Passport.js, express-validator |
| **Hosting Backend** | Render.com (PostgreSQL + Node.js) |
| **Hosting Frontend** | Vercel (CDN global) |
| **Base de Datos** | PostgreSQL 14+, pg (node-postgres), JSONB |
| **IA** | OpenAI API (Embeddings + GPT-4), Google Gemini |
| **APIs Académicas** | Scopus API, IEEE Xplore API, PubMed API |
| **Storage** | Sistema de archivos (PDFs en uploads/) |
| **Auth** | JWT, Google OAuth 2.0, bcrypt |
| **Deployment** | Auto-deploy desde GitHub (main branch) |

---

## Características de Seguridad

### 🔐 Autenticación y Autorización
- JWT con expiración de 7 días
- Google OAuth 2.0 para login social
- Middleware de autenticación en todas las rutas protegidas
- Validación de propiedad de recursos (isOwner checks)

### 🛡️ Validación de Datos
- express-validator en todos los endpoints
- Sanitización de queries SQL (prevención de SQL injection)
- Validación de tipos en models
- Límites de tamaño en uploads (PDFs máx 10MB)

### 🔒 Protección de Datos
- Contraseñas hasheadas con bcrypt
- API Keys en variables de entorno
- CORS configurado por dominio
- Rate limiting en API Gateway
- HTTPS obligatorio en producción

---

## Escalabilidad y Rendimiento

### ⚡ Optimizaciones Implementadas
- **Frontend**: 
  - Server-side rendering (SSR) con Next.js
  - Code splitting automático
  - Lazy loading de componentes pesados
  - CDN de Vercel para assets estáticos

- **Backend**:
  - Pool de conexiones PostgreSQL (max: 20)
  - Índices en columnas frecuentemente consultadas
  - Paginación en listados (limit/offset)
  - Caching de embeddings (evita recalcular)

- **Base de Datos**:
  - Índices GIN para búsqueda en JSONB
  - Índices B-tree para foreign keys
  - Consultas optimizadas con EXPLAIN ANALYZE

- **IA**:
  - Procesamiento por lotes (batch screening)
  - Delay entre llamadas (evitar rate limits)
  - Truncamiento de texto (6000 chars por PDF)
  - Modelo más ligero para embeddings

---

## Monitoreo y Logging

### 📊 Métricas Rastreadas
- Requests por endpoint (API Gateway)
- Tiempo de respuesta promedio
- Errores por tipo (4xx, 5xx)
- Uso de tokens de IA (costos)
- Referencias procesadas por proyecto
- Tiempo de cribado promedio

### 📝 Logs Implementados
- Console logs con emojis descriptivos (✅ ❌ 🔄 📊)
- Timestamps en todas las operaciones
- User ID en operaciones sensibles
- Errores con stack traces completos

---

## Limitaciones Conocidas

### ⚠️ Técnicas
- Procesamiento secuencial de PDFs (1 por segundo)
- Límite de 6000 caracteres por PDF enviado a IA
- Rate limits de APIs externas
- Sin procesamiento en paralelo de múltiples proyectos
- Sanitización de enums RQS (puede perder precisión en clasificaciones)

### 🔮 Futuras Mejoras
- [ ] Queue system para procesamiento asíncrono (Redis/SQS)
- [ ] Caching de resultados de IA (Redis)
- [ ] Procesamiento paralelo de PDFs
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Exportación de artículo a LaTeX/Word
- [ ] Sistema de templates de artículos por revista
- [ ] Collaborative editing (múltiples revisores)
- [ ] Integración con Zotero/Mendeley
- [ ] Dashboard analítico de RQS con visualizaciones avanzadas
- [ ] Validación manual de RQS con interfaz gráfica

---

## Costos Estimados (Proyecto típico)

| Recurso | Cantidad | Costo Unitario | Costo Total |
|---------|----------|----------------|-------------|
| **OpenAI Embeddings** | 42 refs × 500 tokens | $0.02/1M tokens | $0.0004 |
| **ChatGPT-4** | 33 refs × 2000 tokens | $0.01/1K tokens | $0.66 |
| **Extracción PDFs** | 33 PDFs × 6K tokens | $0.01/1K tokens | $1.98 |
| **RQS Extraction** | 33 refs × 1K tokens | $0.01/1K tokens | $0.33 |
| **PRISMA Generation** | 6 ítems × 1K tokens | $0.01/1K tokens | $0.06 |
| **Gatekeeper Validation** | 27 validaciones × 500 tokens | $0.01/1K tokens | $0.14 |
| **Vercel** | Hobby plan | Gratis | $0.00 |
| **Render** | Starter plan | $7/mes | $7.00 |
| **PostgreSQL** | Render incluido | Incluido | $0.00 |
| **Total por proyecto** | | | **~$3.17** |
| **Total mensual** | 10 proyectos | | **~$31.70** |

---

## Diagrama de Despliegue

```mermaid
graph LR
    subgraph "GitHub"
        REPO[Repositorio Git<br/>main branch]
    end

    subgraph "Vercel Cloud"
        VERCEL_BUILD[Build Process<br/>Next.js]
        VERCEL_CDN[Edge CDN<br/>Global Distribution]
        VERCEL_PROD[Production<br/>thesis-rsl.vercel.app]
    end

    subgraph "Render Cloud"
        RENDER_BUILD[Build Process<br/>npm install]
        RENDER_DB[(PostgreSQL 14<br/>Managed)]
        RENDER_APP[Node.js App<br/>Express Server]
        RENDER_LOGS[Logs Dashboard]
    end

    %% Flujo de deployment Frontend
    REPO -->|Push to main| VERCEL_BUILD
    VERCEL_BUILD -->|Deploy| VERCEL_CDN
    VERCEL_CDN -->|Serve| VERCEL_PROD

    %% Flujo de deployment Backend
    REPO -->|Push to main| RENDER_BUILD
    RENDER_BUILD -->|Deploy| RENDER_APP
    RENDER_APP -->|Connect| RENDER_DB
    RENDER_APP -->|Logs| RENDER_LOGS

    %% Flujo runtime
    VERCEL_PROD -->|HTTPS API Calls| RENDER_APP
    RENDER_APP -->|Query| RENDER_DB

    classDef github fill:#24292e,stroke:#fff,stroke-width:2px,color:#fff
    classDef vercel fill:#000,stroke:#fff,stroke-width:2px,color:#fff
    classDef render fill:#46e3b7,stroke:#0e1e27,stroke-width:2px,color:#000

    class REPO github
    class VERCEL_BUILD,VERCEL_CDN,VERCEL_PROD vercel
    class RENDER_BUILD,RENDER_DB,RENDER_APP,RENDER_LOGS render
```

---

## Variables de Entorno

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.thesis-rsl.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Auth
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# AI APIs
OPENAI_API_KEY=sk-xxx
GEMINI_API_KEY=xxx

# Academic APIs
SCOPUS_API_KEY=xxx
IEEE_API_KEY=xxx

# Config
PORT=3000
NODE_ENV=production
```

---

## Conclusión

Esta arquitectura implementa un sistema completo de **Revisión Sistemática de Literatura** siguiendo los estándares **PRISMA 2020**, con las siguientes características clave:

✅ **Separación clara de responsabilidades** (Frontend Vercel, Backend Render, Database PostgreSQL)  
✅ **PostgreSQL integrado en el backend** (hosting unificado en Render)  
✅ **Servicios externos limitados a IA y APIs académicas**  
✅ **Arquitectura limpia** (Controllers → Use Cases → Repositories)  
✅ **Flujo metodológico completo** (Protocolo → Cribado → PRISMA → RQS → Artículo)  
✅ **Gatekeeper PRISMA** con 27 prompts de validación automática  
✅ **Extracción RQS** con sanitización de enums y prevención de errores  
✅ **Trazabilidad y bloqueo** para preservar integridad académica  
✅ **Escalable y económica** (~$31.70/mes para 10 proyectos)  
✅ **Auto-deployment** desde GitHub (CI/CD automático)  

---

**Versión**: 2.0  
**Última actualización**: Enero 2026  
**Autores**: Sistema RSL - Tesis de Grado
