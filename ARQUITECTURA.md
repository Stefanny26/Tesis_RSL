  # 🏗️ Arquitectura del Sistema - Thesis RSL

**Sistema de Revisión Sistemática de Literatura**  
**Fecha:** 27 de noviembre de 2025  
**Versión:** 1.0

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Arquitectura del Backend](#arquitectura-del-backend)
5. [Arquitectura del Frontend](#arquitectura-del-frontend)
6. [Base de Datos](#base-de-datos)
7. [Integraciones Externas](#integraciones-externas)
8. [Flujo de Datos](#flujo-de-datos)
9. [Seguridad](#seguridad)
10. [Despliegue](#despliegue)

---

## 🎯 Visión General

**Thesis RSL** es un sistema web completo para gestionar Revisiones Sistemáticas de Literatura (RSL) que implementa la metodología PRISMA/Cochrane. El sistema automatiza la generación de protocolos, búsqueda en bases de datos académicas, cribado de referencias y redacción del artículo final.

### Componentes Principales:

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                              │
│                     (Navegador Web)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   FRONTEND (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Wizard     │  │   Dashboard  │  │   Screening  │       │
│  │   (7 steps)  │  │   Projects   │  │   References │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API (JSON)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   BACKEND (Node.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Controllers │  │  Use Cases   │  │ Repositories │       │
│  │  (Routes)    │  │  (Business)  │  │   (Data)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │  APIs AI     │  │ APIs Acad.   │
│   Database   │  │ Gemini/GPT   │  │ Scopus/IEEE  │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🏛️ Arquitectura de Alto Nivel

### Patrón Arquitectónico: **Layered Architecture + Clean Architecture**

```
┌───────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (React 19 + TypeScript)               │  │
│  │  - Pages (App Router)                                   │  │
│  │  - Components (Shadcn UI)                               │  │
│  │  - State Management (Context API)                       │  │
│  │  - API Client (Fetch)                                   │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              │
┌───────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Express.js Server (Node.js 20)                         │  │
│  │  - Routes (Routing)                                     │  │
│  │  - Controllers (Request/Response)                       │  │
│  │  - Middlewares (Auth, Validation, CORS)                 │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                              │
                              │
┌───────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Use Cases (Business Logic)                             │  │
│  │  - Generate Protocol                                    │  │
│  │  - Search Query Generator                               │  │
│  │  - Screen References                                    │  │
│  │  - Create Project                                       │  │
│  │                                                         │  │
│  │  Models (Domain Entities)                               │  │
│  │  - User, Project, Protocol, Reference                   │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                              │
                              │
┌───────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Repositories (Data Access)                             │  │
│  │  - UserRepository                                       │  │
│  │  - ProjectRepository                                    │  │
│  │  - ReferenceRepository                                  │  │
│  │                                                         │  │
│  │  External Services                                      │  │
│  │  - Gemini AI (Google)                                   │  │
│  │  - Scopus API (Elsevier)                                │  │
│  │  - Database (PostgreSQL)                                │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## 💻 Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.2.x | Framework React con SSR/SSG |
| **React** | 19.x | Librería UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 3.x | Estilos utility-first |
| **Shadcn UI** | - | Componentes UI |
| **Lucide React** | - | Iconos |
| **React Hook Form** | - | Manejo de formularios |
| **Zod** | - | Validación de esquemas |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20.x | Runtime JavaScript |
| **Express.js** | 4.x | Framework web |
| **PostgreSQL** | 15.x | Base de datos relacional |
| **pg** | 8.x | Driver PostgreSQL |
| **JWT** | - | Autenticación |
| **Passport** | - | Estrategias auth |
| **bcrypt** | - | Hash de contraseñas |
| **dotenv** | - | Variables de entorno |

### Integraciones AI

| Servicio | SDK | Propósito |
|----------|-----|-----------|
| **Google Gemini** | @google/generative-ai | Generación de protocolo, búsquedas |
| **OpenAI** (opcional) | openai | Fallback AI |

### APIs Académicas

| API | Propósito |
|-----|-----------|
| **Scopus** | Búsqueda y conteo de artículos |
| **IEEE Xplore** | Búsqueda en ingeniería (futuro) |
| **PubMed** | Búsqueda en medicina (futuro) |

---

## 🔧 Arquitectura del Backend

### Estructura de Directorios

```
backend/
├── src/
│   ├── server.js                    # Punto de entrada
│   ├── api/                         # Capa de API
│   │   ├── controllers/             # Controladores (manejo de requests)
│   │   │   ├── ai.controller.js     # Endpoints de IA
│   │   │   ├── auth.controller.js   # Autenticación
│   │   │   ├── project.controller.js# Proyectos
│   │   │   ├── reference.controller.js # Referencias
│   │   │   └── protocol.controller.js  # Protocolos
│   │   ├── routes/                  # Definición de rutas
│   │   │   ├── ai.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── project.routes.js
│   │   │   └── reference.routes.js
│   │   └── validators/              # Validaciones de entrada
│   │       └── validators.js
│   ├── config/                      # Configuraciones
│   │   ├── database.js              # Conexión PostgreSQL
│   │   ├── passport-setup.js        # Config auth
│   │   └── academic-databases.js    # Config bases académicas
│   ├── domain/                      # Lógica de negocio
│   │   ├── models/                  # Modelos de dominio
│   │   │   ├── user.model.js
│   │   │   ├── project.model.js
│   │   │   ├── protocol.model.js
│   │   │   └── reference.model.js
│   │   └── use-cases/               # Casos de uso
│   │       ├── search-query-generator.use-case.js
│   │       ├── generate-protocol-analysis.use-case.js
│   │       ├── screen-references-with-ai.use-case.js
│   │       └── create-project.use-case.js
│   └── infrastructure/              # Infraestructura
│       ├── middlewares/             # Middlewares
│       │   └── auth.middleware.js
│       └── repositories/            # Acceso a datos
│           ├── user.repository.js
│           ├── project.repository.js
│           ├── protocol.repository.js
│           └── reference.repository.js
├── .env                             # Variables de entorno
└── package.json                     # Dependencias
```

### Flujo de una Request

```
1. Cliente (Frontend)
   │
   │ HTTP Request
   │ POST /api/ai/generate-search-strategies
   ▼
2. Express Server
   │
   │ Middleware Stack:
   │ - CORS
   │ - Body Parser (JSON)
   │ - Auth Middleware (JWT)
   │ - Logging
   ▼
3. Router (ai.routes.js)
   │
   │ Match route → /generate-search-strategies
   ▼
4. Controller (ai.controller.js)
   │
   │ - Extraer parámetros del body
   │ - Validar entrada
   │ - Llamar Use Case
   ▼
5. Use Case (search-query-generator.use-case.js)
   │
   │ Business Logic:
   │ - Obtener config de bases de datos
   │ - Construir prompts específicos
   │ - Llamar Gemini AI
   │ - Parsear respuesta
   │ - Retornar queries estructuradas
   ▼
6. Controller (response)
   │
   │ - Formatear respuesta
   │ - Enviar JSON
   ▼
7. Cliente (Frontend)
   │
   │ Recibe y procesa respuesta
```

### Conexión con Base de Datos

```javascript
// config/database.js

class Database {
  constructor() {
    this.pool = null; // Connection Pool
  }

  async connect() {
    // Configuración PostgreSQL
    const config = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20, // Pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    };

    this.pool = new Pool(config);
    
    // Test connection
    await this.pool.connect();
    
    // Crear extensiones
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
  }

  async query(text, params) {
    return await this.pool.query(text, params);
  }
}
```

### Conexión con APIs Externas

#### 1. Google Gemini AI

```javascript
// use-cases/search-query-generator.use-case.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

class SearchQueryGenerator {
  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generate({ databases, picoData, matrixData, researchArea }) {
    const model = this.gemini.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp' 
    });

    for (const databaseName of databases) {
      const prompt = this._buildPrompt(databaseName, picoData);
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      // Procesar respuesta...
    }
  }
}
```

#### 2. Scopus API

```javascript
// use-cases/scopus-search.use-case.js

class ScopusSearchUseCase {
  async count(query) {
    const apiKey = process.env.SCOPUS_API_KEY;
    const url = `https://api.elsevier.com/content/search/scopus`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-ELS-APIKey': apiKey,
        'Accept': 'application/json'
      },
      params: {
        query: query,
        count: 0 // Solo contar
      }
    });

    const data = await response.json();
    return data['search-results']['opensearch:totalResults'];
  }
}
```

---

## 🎨 Arquitectura del Frontend

### Estructura de Directorios

```
frontend/
├── app/                             # App Router (Next.js 14)
│   ├── layout.tsx                   # Layout raíz
│   ├── page.tsx                     # Página principal
│   ├── globals.css                  # Estilos globales
│   ├── dashboard/                   # Dashboard
│   │   └── page.tsx
│   ├── login/                       # Login
│   │   └── page.tsx
│   ├── new-project/                 # Wizard de proyecto
│   │   └── page.tsx
│   └── projects/[id]/               # Detalle de proyecto
│       ├── page.tsx
│       ├── screening/               # Cribado
│       └── article/                 # Redacción
├── components/                      # Componentes React
│   ├── ui/                          # Componentes base (Shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── project-wizard/              # Wizard de 7 pasos
│   │   ├── wizard-context.tsx       # Context API
│   │   ├── wizard-header.tsx
│   │   ├── wizard-navigation.tsx
│   │   └── steps/
│   │       ├── 1-proposal-step.tsx
│   │       ├── 2-analysis-step.tsx
│   │       ├── 3-definition-step.tsx
│   │       ├── 4-criteria-step.tsx
│   │       ├── 5-pico-step.tsx
│   │       ├── 6-search-plan-step.tsx
│   │       └── 7-prisma-check-step.tsx
│   ├── screening/                   # Cribado de referencias
│   │   ├── reference-table.tsx
│   │   ├── ai-screening-panel.tsx
│   │   ├── import-references-button.tsx
│   │   └── academic-search-dialog.tsx
│   └── article/                     # Editor de artículo
│       ├── article-editor.tsx
│       └── ai-generator-panel.tsx
├── lib/                             # Utilidades
│   ├── api-client.ts                # Cliente API
│   ├── auth-context.tsx             # Context de auth
│   ├── types.ts                     # Tipos TypeScript
│   └── utils.ts                     # Helpers
├── hooks/                           # Custom hooks
│   ├── use-toast.ts
│   └── use-mobile.ts
└── public/                          # Assets estáticos
```

### State Management: Context API

```typescript
// components/project-wizard/wizard-context.tsx

interface WizardData {
  // Paso 1: Propuesta
  selectedTitle: string;
  projectDescription: string;
  researchArea: string;

  // Paso 2: Análisis (Marco PICO)
  pico: {
    population: string;
    intervention: string;
    comparison: string;
    outcome: string;
  };

  // Paso 3: Definición (Términos del protocolo)
  protocolDefinition: {
    technologies: string[];
    applicationDomain: string[];
    studyType: string[];
    thematicFocus: string[];
  };

  // Paso 4: Criterios
  inclusionCriteria: string[];
  exclusionCriteria: string[];

  // Paso 5: Matriz Es/No Es
  matrixIsNot: {
    is: string[];
    isNot: string[];
  };

  // Paso 6: Plan de Búsqueda
  searchPlan: {
    databases: string[];
    searchQueries: Query[];
  };

  // Paso 7: PRISMA Check
  prismaChecklist: PrismaItem[];
  
  projectId?: number;
}

export function WizardProvider({ children }) {
  const [data, setData] = useState<WizardData>(initialData);

  const updateData = (newData: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  return (
    <WizardContext.Provider value={{ data, updateData }}>
      {children}
    </WizardContext.Provider>
  );
}
```

### API Client

```typescript
// lib/api-client.ts

class ApiClient {
  private baseUrl: string = 'http://localhost:3001';
  private token: string | null = null;

  constructor() {
    // Cargar token de localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Agregar token si existe
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  // Métodos específicos
  async generateSearchQueries(protocolTerms, picoData, databases, researchArea) {
    return await this.request('/api/ai/generate-search-strategies', {
      method: 'POST',
      body: JSON.stringify({ 
        protocolTerms, 
        picoData, 
        databases, 
        researchArea 
      }),
    });
  }

  async createProject(projectData) {
    return await this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }
}

export const apiClient = new ApiClient();
```

---

## 🗄️ Base de Datos

### Esquema PostgreSQL

```sql
-- Tabla: users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  research_area VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: protocols
CREATE TABLE protocols (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  proposed_title VARCHAR(500),
  
  -- Marco PICO
  population TEXT,
  intervention TEXT,
  comparison TEXT,
  outcomes TEXT,
  
  -- Términos del protocolo
  key_terms JSONB,
  
  -- Matriz Es/No Es
  is_matrix TEXT[],
  is_not_matrix TEXT[],
  
  -- Criterios
  inclusion_criteria TEXT[],
  exclusion_criteria TEXT[],
  
  -- Búsqueda
  databases TEXT[],
  search_string TEXT,
  temporal_range VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: references
CREATE TABLE references (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Metadatos
  title TEXT NOT NULL,
  authors TEXT[],
  year INTEGER,
  journal VARCHAR(500),
  doi VARCHAR(255),
  abstract TEXT,
  keywords TEXT[],
  url TEXT,
  
  -- Origen
  database VARCHAR(100),
  import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Cribado
  screening_status VARCHAR(50) DEFAULT 'pending',
  screening_decision VARCHAR(50),
  screening_reason TEXT,
  screened_at TIMESTAMP,
  screened_by INTEGER REFERENCES users(id),
  
  -- AI Scoring
  ai_score FLOAT,
  ai_reasoning TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: prisma_items (Checklist PRISMA)
CREATE TABLE prisma_items (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  item_number INTEGER NOT NULL,
  complies BOOLEAN,
  evidence TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: article_versions (Versiones del artículo)
CREATE TABLE article_versions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  section VARCHAR(100) NOT NULL,
  content TEXT,
  word_count INTEGER,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: api_usage (Control de uso de APIs)
CREATE TABLE api_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  service_name VARCHAR(100),
  endpoint VARCHAR(255),
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 4),
  request_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_references_project_id ON references(project_id);
CREATE INDEX idx_references_screening_status ON references(screening_status);
CREATE INDEX idx_protocols_project_id ON protocols(project_id);
```

### Diagrama ER

```
┌─────────────┐
│    users    │
│─────────────│
│ id (PK)     │──┐
│ email       │  │
│ password    │  │
│ name        │  │
│ google_id   │  │
└─────────────┘  │
                 │
                 │ 1:N
                 │
┌────────────────▼────────┐
│      projects           │
│─────────────────────────│
│ id (PK)                 │──┐
│ user_id (FK)            │  │
│ title                   │  │
│ description             │  │
│ status                  │  │
│ research_area           │  │
└─────────────────────────┘  │
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            │ 1:1            │ 1:N            │ 1:N
            │                │                │
┌───────────▼────┐  ┌────────▼─────┐  ┌──────▼────────┐
│   protocols    │  │  references  │  │ prisma_items  │
│────────────────│  │──────────────│  │───────────────│
│ id (PK)        │  │ id (PK)      │  │ id (PK)       │
│ project_id(FK) │  │ project_id   │  │ project_id    │
│ population     │  │ title        │  │ item_number   │
│ intervention   │  │ authors      │  │ complies      │
│ pico...        │  │ abstract     │  │ evidence      │
│ key_terms      │  │ screening... │  └───────────────┘
│ criteria...    │  └──────────────┘
└────────────────┘
```

---

## 🔌 Integraciones Externas

### 1. Google Gemini AI

**Propósito:** Generación de contenido con IA

**Endpoints utilizados:**
- Modelo: `gemini-2.0-flash-exp`
- API: `https://generativelanguage.googleapis.com/`

**Casos de uso:**
- Generar análisis de protocolo (PICO, criterios)
- Generar cadenas de búsqueda específicas por base de datos
- Cribado automático de referencias (scoring)
- Generar secciones del artículo

**Configuración:**
```env
GEMINI_API_KEY=AIzaSy...
```

**Flujo:**
```
Frontend                  Backend                   Gemini AI
   │                         │                         │
   │ POST /generate-search   │                         │
   ├────────────────────────>│                         │
   │                         │ Build Prompt            │
   │                         │ (database-specific)     │
   │                         │                         │
   │                         │ generateContent()       │
   │                         ├────────────────────────>│
   │                         │                         │
   │                         │ <JSON Response>         │
   │                         │<────────────────────────│
   │                         │                         │
   │                         │ Parse & Format          │
   │ <Structured Queries>    │                         │
   │<────────────────────────│                         │
```

### 2. Scopus API (Elsevier)

**Propósito:** Búsqueda y obtención de artículos académicos

**Endpoints utilizados:**
- Search: `https://api.elsevier.com/content/search/scopus`
- Abstract: `https://api.elsevier.com/content/abstract/scopus_id/{id}`

**Casos de uso:**
- Contar resultados de búsqueda
- Obtener artículos completos
- Extraer metadatos (título, autores, abstract, DOI)

**Configuración:**
```env
SCOPUS_API_KEY=1234567890abcdef
```

**Flujo:**
```
Frontend                Backend                 Scopus API
   │                       │                        │
   │ Click "Contar"        │                        │
   ├──────────────────────>│                        │
   │                       │ GET /search?query=...  │
   │                       ├───────────────────────>│
   │                       │                        │
   │                       │ <Results Count>        │
   │                       │<───────────────────────│
   │ Display: 1,245 arts   │                        │
   │<──────────────────────│                        │
```

### 3. IEEE Xplore API (Futuro)

**Propósito:** Búsqueda en ingeniería y tecnología

**Estado:** Planificado

### 4. PubMed API (Futuro)

**Propósito:** Búsqueda en medicina y salud

**Estado:** Planificado

---

## 🔄 Flujo de Datos

### Flujo Completo: Crear Proyecto y Generar Búsquedas

```
┌────────┐
│ PASO 1 │ Usuario completa wizard (7 pasos)
└───┬────┘
    │
    ▼
┌────────────────────────────────────────────────────────────┐
│ WIZARD STATE (Context API)                                 │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ - selectedTitle                                      │   │
│ │ - researchArea: "ingenieria-tecnologia"              │   │
│ │ - pico: { population, intervention, ... }            │   │
│ │ - protocolTerms: { technology, domain, ... }         │   │
│ │ - inclusionCriteria, exclusionCriteria               │   │
│ │ - matrixIsNot: { is[], isNot[] }                     │   │
│ │ - searchPlan: { databases[], searchQueries[] }       │   │
│ │ - prismaChecklist                                    │   │
│ └──────────────────────────────────────────────────────┘   │
└───┬────────────────────────────────────────────────────────┘
    │
    ▼
┌────────┐
│ PASO 2 │ Frontend detecta área de investigación
└───┬────┘
    │
    │ POST /api/ai/detect-research-area
    │ { researchArea: "ingenieria-tecnologia", description: "..." }
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ BACKEND: detectArea()                                   │
│ - Lee academic-databases.js                             │
│ - Filtra bases de datos por área                        │
│ - Retorna: [IEEE, ACM, Scopus, ScienceDirect, ...]      │
└───┬─────────────────────────────────────────────────────┘
    │
    ▼
┌────────┐
│ PASO 3 │ Usuario selecciona bases de datos
└───┬────┘
    │
    │ Click "Generar Cadenas"
    │
    ▼
┌────────┐
│ PASO 4 │ POST /api/ai/generate-search-strategies
└───┬────┘
    │ Body: {
    │   databases: ["scopus", "ieee", "acm"],
    │   picoData: {...},
    │   matrixData: {...},
    │   researchArea: "ingenieria-tecnologia",
    │   protocolTerms: {...}
    │ }
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ BACKEND: SearchQueryGenerator.generate()                 │
│                                                          │
│ Para cada base de datos:                                 │
│   1. Obtener config específica (academic-databases.js)   │
│   2. Construir prompt con:                               │
│      - Contexto del estudio (PICO, términos)             │
│      - Sintaxis específica de la BD                      │
│      - Ejemplo real de query                             │
│      - Reglas de compliance                              │
│   3. Llamar Gemini AI                                    │
│   4. Parsear respuesta JSON                              │
│   5. Validar sintaxis                                    │
│                                                          │
│ Retorna:                                                 │
│   queries: [                                             │
│     {                                                    │
│       databaseName: "Scopus",                            │
│       query: "TITLE-ABS-KEY((...) AND (...))",           │
│       explanation: "...",                                │
│       terms: { population: [...], intervention: [...] }, │
│       filters: { year: "2019-2025" },                    │
│       estimatedResults: "100-500"                        │
│     },                                                   │
│     {...}                                                │
│   ]                                                      │
└───┬──────────────────────────────────────────────────────┘
    │
    ▼
┌────────┐
│ PASO 5 │ Frontend muestra tabla con queries
└───┬────┘
    │
    ┌─────────────────────────────────────────────────┐
    │ Tabla: BDD | Cadena | # Artículos | Subir CSV   │
    │ ─────────────────────────────────────────────── │
    │ Scopus | TITLE... | [Contar] | [📤]            │
    │ IEEE   | "Docum.. | [Contar] | [📤]            │
    └─────────────────────────────────────────────────┘
    │
    │ Usuario click "Contar" (Scopus)
    │
    ▼
┌────────┐
│ PASO 6 │ POST /api/ai/scopus-count
└───┬────┘
    │ Body: { query: "TITLE-ABS-KEY(...)" }
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ BACKEND: scopusCount()                                   │
│ - Llama Scopus API                                       │
│ - Extrae totalResults                                    │
│ - Retorna: { count: 1245 }                               │
└───┬──────────────────────────────────────────────────────┘
    │
    ▼
┌────────┐
│ PASO 7 │ Mostrar resultado: "1,245 artículos"
└───┬────┘
    │
    │ Usuario click "Subir CSV"
    │
    ▼
┌────────┐
│ PASO 8 │ Importar referencias desde archivo
└───┬────┘
    │ POST /api/references/import
    │ FormData: { file: referencias.csv, projectId: 123 }
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ BACKEND: ImportReferencesUseCase                         │
│ 1. Parsear archivo (CSV/RIS/BibTeX)                     │
│ 2. Extraer metadatos: title, authors, year, abstract    │
│ 3. Insertar en tabla `references`:                      │
│    INSERT INTO references                               │
│    (project_id, title, authors, year, abstract,         │
│     database, screening_status)                         │
│    VALUES (...)                                          │
│ 4. Retornar: { count: 50, importedIds: [...] }          │
└───┬──────────────────────────────────────────────────────┘
    │
    ▼
┌────────┐
│ PASO 9 │ Referencias guardadas en BD
└───┬────┘
    │
    │ Navegar a /projects/123/screening
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ PÁGINA DE CRIBADO                                        │
│ - Cargar referencias desde BD                            │
│ - Mostrar tabla con filtros                              │
│ - Permitir cribado manual o con IA                       │
└──────────────────────────────────────────────────────────┘
```

---

## 🔐 Seguridad

### Autenticación y Autorización

#### 1. JWT (JSON Web Tokens)

```javascript
// Backend: auth.controller.js
const jwt = require('jsonwebtoken');

function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d' // Token válido por 7 días
  });
}

// Middleware de autenticación
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
```

#### 2. OAuth 2.0 (Google)

```javascript
// Backend: passport-setup.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    // Buscar o crear usuario
    const user = await findOrCreateUser(profile);
    done(null, user);
  }
));
```

### Protección de Endpoints

```javascript
// Rutas protegidas
router.post('/api/projects', authMiddleware, createProject);
router.get('/api/projects/:id', authMiddleware, getProject);
router.post('/api/ai/generate-search-strategies', authMiddleware, generateSearchStrategies);
```

### Variables de Entorno

```env
# Backend (.env)
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=thesis_rsl
DB_USER=postgres
DB_PASSWORD=***

# Auth
JWT_SECRET=***
GOOGLE_CLIENT_ID=***
GOOGLE_CLIENT_SECRET=***

# APIs
GEMINI_API_KEY=***
OPENAI_API_KEY=***
SCOPUS_API_KEY=***

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=***
```

### Validación de Entrada

```javascript
// validators/validators.js
const Joi = require('joi');

const projectSchema = Joi.object({
  title: Joi.string().min(10).max(500).required(),
  description: Joi.string().min(20).max(2000).required(),
  researchArea: Joi.string().valid(
    'ingenieria-tecnologia',
    'medicina-salud',
    'ciencias-sociales',
    'arquitectura-diseño'
  ).required()
});

function validateProject(req, res, next) {
  const { error } = projectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}
```

### CORS

```javascript
// server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 🚀 Despliegue

### Desarrollo Local

```bash
# Backend
cd backend
npm install
npm run dev     # Puerto 3001

# Frontend
cd frontend
npm install
npm run dev     # Puerto 3000
```

### Producción

#### Opción 1: VPS (DigitalOcean, AWS EC2, etc.)

```bash
# Backend
cd backend
npm install --production
npm start       # PM2 para mantener el proceso

# Frontend
cd frontend
npm install
npm run build
npm start       # Next.js standalone
```

#### Opción 2: Vercel (Frontend) + Railway (Backend)

**Frontend en Vercel:**
- Conectar repositorio GitHub
- Auto-deploy en cada push
- Variables de entorno configuradas en dashboard

**Backend en Railway:**
- Conectar repositorio
- Agregar PostgreSQL addon
- Variables de entorno configuradas
- Auto-deploy

#### Opción 3: Docker

```dockerfile
# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3001
CMD ["node", "src/server.js"]

# Frontend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: thesis_rsl
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: thesis_rsl
      DB_USER: postgres
      DB_PASSWORD: postgres
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      SCOPUS_API_KEY: ${SCOPUS_API_KEY}
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 📊 Diagrama de Arquitectura Completo

```
┌───────────────────────────────────────────────────────────────────────┐
│                         CAPA DE PRESENTACIÓN                          │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    Next.js Frontend (Port 3000)                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │ │
│  │  │   Wizard     │  │   Dashboard  │  │   Screening  │          │ │
│  │  │  (7 Steps)   │  │   Projects   │  │  References  │          │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │ │
│  │                                                                  │ │
│  │  Context API (State) │ API Client (HTTP) │ Auth Context        │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                │ REST API (JSON)
                                │ Authorization: Bearer JWT
                                │
┌───────────────────────────────▼───────────────────────────────────────┐
│                       CAPA DE APLICACIÓN                              │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │              Express.js Server (Port 3001)                       │ │
│  │  ┌──────────────────────────────────────────────────────────┐   │ │
│  │  │  Middlewares: CORS | Body Parser | Auth | Logging       │   │ │
│  │  └──────────────────────────────────────────────────────────┘   │ │
│  │                                                                  │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │ │
│  │  │   AI Routes    │  │ Project Routes │  │  Auth Routes   │   │ │
│  │  │   /api/ai/*    │  │ /api/projects/*│  │  /api/auth/*   │   │ │
│  │  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘   │ │
│  │           │                   │                   │            │ │
│  │           ▼                   ▼                   ▼            │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │ │
│  │  │ AI Controller  │  │ Project Ctrl   │  │  Auth Ctrl     │   │ │
│  │  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘   │ │
│  └───────────┼──────────────────────┼──────────────────┼──────────┘ │
└──────────────┼──────────────────────┼──────────────────┼────────────┘
               │                      │                  │
┌──────────────▼──────────────────────▼──────────────────▼────────────┐
│                         CAPA DE DOMINIO                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                        Use Cases                                │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │ │
│  │  │ Search Query Gen │  │ Protocol Analysis│  │ Screen Refs  │ │ │
│  │  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘ │ │
│  │           │                      │                    │         │ │
│  │  ┌────────▼────────┐  ┌─────────▼────────┐  ┌────────▼──────┐ │ │
│  │  │ Create Project  │  │ Import References│  │  AI Screening │ │ │
│  │  └─────────────────┘  └──────────────────┘  └───────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     Domain Models                               │ │
│  │   User │ Project │ Protocol │ Reference │ PrismaItem            │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                    CAPA DE INFRAESTRUCTURA                           │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      Repositories                               │ │
│  │  UserRepo │ ProjectRepo │ ProtocolRepo │ ReferenceRepo         │ │
│  └───────────────────────┬──────────────────────────────────────┬─┘ │
│                          │                                       │   │
│  ┌───────────────────────▼────────┐  ┌──────────────────────────▼┐ │
│  │     PostgreSQL Database        │  │   External Services       │ │
│  │  ┌──────────┐  ┌────────────┐  │  │  ┌────────────────────┐  │ │
│  │  │  users   │  │  projects  │  │  │  │  Google Gemini AI  │  │ │
│  │  │protocols │  │ references │  │  │  │  Scopus API        │  │ │
│  │  │ prisma   │  │  articles  │  │  │  │  IEEE API (future) │  │ │
│  │  └──────────┘  └────────────┘  │  │  └────────────────────┘  │ │
│  └─────────────────────────────────┘  └───────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Notas Finales

### Convenciones de Código

- **Backend:** JavaScript (Node.js) con CommonJS
- **Frontend:** TypeScript con módulos ES6
- **Estilo:** ESLint + Prettier
- **Commits:** Conventional Commits

### Performance

- Connection pooling en PostgreSQL (max 20 conexiones)
- Lazy loading de componentes React
- Caching de queries frecuentes
- Paginación en listados grandes

### Escalabilidad

- Arquitectura modular permite escalar horizontalmente
- Repositorios abstraen acceso a datos
- Use cases independientes facilitan testing
- API RESTful permite múltiples clientes

### Monitoreo

- Logs estructurados con timestamps
- Tracking de uso de APIs (tabla `api_usage`)
- Error tracking (Sentry recomendado)
- Performance monitoring (New Relic recomendado)

---

## ✅ Checklist de Implementación

- [x] Backend con Express.js
- [x] Frontend con Next.js 14
- [x] Base de datos PostgreSQL
- [x] Autenticación JWT + OAuth
- [x] Integración Gemini AI
- [x] Integración Scopus API
- [x] Wizard de 7 pasos
- [x] Sistema de cribado
- [x] Filtrado por área académica
- [x] Generación de queries específicas
- [ ] APIs IEEE y PubMed
- [ ] Editor de artículo avanzado
- [ ] Exportación a PDF
- [ ] Tests automatizados
- [ ] CI/CD pipeline
- [ ] Documentación API (Swagger)

---

**Documento actualizado:** 27 de noviembre de 2025  
**Autor:** Thesis RSL Team  
**Licencia:** MIT
