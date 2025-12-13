# 📊 DIAGRAMAS DE ARQUITECTURA - Sistema RSL

Este documento contiene diagramas visuales de la arquitectura del sistema usando Mermaid.

---

## 1. Arquitectura General (3 Capas SDN)

```mermaid
graph TB
    subgraph "PLANO DE APLICACIÓN"
        A[Frontend Next.js]
        B[Dashboard UI]
        C[Project Management]
        D[Screening Interface]
    end
    
    subgraph "PLANO DE CONTROL"
        E[Express Server]
        F[Use Cases]
        G[Controllers]
        H[Middlewares]
    end
    
    subgraph "PLANO DE DATOS"
        I[PostgreSQL]
        J[Repositories]
        K[Database Pool]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    
    E --> F
    E --> G
    E --> H
    
    F --> J
    G --> J
    
    J --> K
    K --> I
    
    style A fill:#e1f5ff
    style E fill:#fff4e1
    style I fill:#ffe1e1
```

---

## 2. Flujo de Petición HTTP (Request Flow)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant A as API Gateway
    participant M as Middleware
    participant C as Controller
    participant UC as Use Case
    participant R as Repository
    participant DB as PostgreSQL

    U->>F: Click "Crear Proyecto"
    F->>A: POST /api/projects
    A->>M: Validar Token JWT
    M->>M: Verificar permisos
    M->>C: Request autorizado
    C->>UC: execute(projectData, userId)
    UC->>UC: Validar reglas de negocio
    UC->>R: create(project)
    R->>DB: INSERT INTO projects
    DB-->>R: Row insertada
    R-->>UC: Project model
    UC-->>C: Project creado
    C-->>A: 201 Created
    A-->>F: JSON response
    F-->>U: Mostrar proyecto
```

---

## 3. Arquitectura de Capas (Layered Architecture)

```mermaid
graph TD
    subgraph "Capa de Presentación"
        A1[React Components]
        A2[State Management]
        A3[UI/UX]
    end
    
    subgraph "Capa de API"
        B1[Routes]
        B2[Controllers]
        B3[Validators]
    end
    
    subgraph "Capa de Dominio"
        C1[Use Cases]
        C2[Models]
        C3[Business Logic]
    end
    
    subgraph "Capa de Infraestructura"
        D1[Repositories]
        D2[External APIs]
        D3[File System]
    end
    
    subgraph "Capa de Datos"
        E1[(PostgreSQL)]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    
    B1 --> B2
    B2 --> C1
    B3 --> B2
    
    C1 --> C2
    C1 --> D1
    C2 --> D1
    
    D1 --> E1
    D2 --> E1
    
    style A1 fill:#e3f2fd
    style B1 fill:#fff9c4
    style C1 fill:#f3e5f5
    style D1 fill:#e8f5e9
    style E1 fill:#ffebee
```

---

## 4. Componentes del Sistema

```mermaid
graph LR
    subgraph "Backend"
        A[server.js]
        B[Routes]
        C[Controllers]
        D[Use Cases]
        E[Repositories]
        F[Models]
    end
    
    subgraph "Database"
        G[(PostgreSQL)]
        H[Users Table]
        I[Projects Table]
        J[References Table]
    end
    
    subgraph "External Services"
        K[OpenAI API]
        L[Google Gemini]
        M[Scopus API]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    E --> G
    
    G --> H
    G --> I
    G --> J
    
    D --> K
    D --> L
    D --> M
```

---

## 5. Patrón Repository

```mermaid
classDiagram
    class ProjectController {
        +create(req, res)
        +list(req, res)
        +getById(req, res)
        +update(req, res)
        +delete(req, res)
    }
    
    class CreateProjectUseCase {
        -projectRepository
        +execute(projectData, userId)
    }
    
    class ProjectRepository {
        -database
        +findById(id)
        +findByOwnerId(ownerId)
        +create(projectData)
        +update(id, projectData)
        +delete(id)
    }
    
    class Project {
        +id
        +title
        +description
        +status
        +ownerId
        +validate()
        +toJSON()
    }
    
    class Database {
        -pool
        +query(sql, params)
        +connect()
    }
    
    ProjectController --> CreateProjectUseCase
    CreateProjectUseCase --> ProjectRepository
    ProjectRepository --> Database
    ProjectRepository --> Project
```

---

## 6. Políticas de Seguridad

```mermaid
graph TD
    A[HTTP Request] --> B{Tiene Token?}
    B -->|No| C[401 Unauthorized]
    B -->|Sí| D{Token Válido?}
    D -->|No| E[401 Invalid Token]
    D -->|Sí| F{Usuario Existe?}
    F -->|No| G[404 User Not Found]
    F -->|Sí| H{Tiene Permisos?}
    H -->|No| I[403 Forbidden]
    H -->|Sí| J{Validación de Datos?}
    J -->|Falla| K[400 Bad Request]
    J -->|OK| L{Rate Limit OK?}
    L -->|No| M[429 Too Many Requests]
    L -->|Sí| N[Procesar Request]
    
    style C fill:#ffcdd2
    style E fill:#ffcdd2
    style G fill:#ffcdd2
    style I fill:#ffcdd2
    style K fill:#ffcdd2
    style M fill:#ffcdd2
    style N fill:#c8e6c9
```

---

## 7. Arquitectura de Despliegue

```mermaid
graph TB
    subgraph "Internet"
        U[Usuarios]
    end
    
    subgraph "Vercel CDN"
        V1[Edge - US East]
        V2[Edge - Europe]
        V3[Edge - Asia]
        F[Frontend Next.js]
    end
    
    subgraph "Railway"
        B[Backend Express]
        DB[(PostgreSQL)]
    end
    
    subgraph "External APIs"
        E1[OpenAI]
        E2[Google Gemini]
        E3[Scopus]
    end
    
    U --> V1
    U --> V2
    U --> V3
    
    V1 --> F
    V2 --> F
    V3 --> F
    
    F -->|HTTPS REST API| B
    B --> DB
    B --> E1
    B --> E2
    B --> E3
    
    style U fill:#e1f5fe
    style F fill:#fff9c4
    style B fill:#f3e5f5
    style DB fill:#ffebee
```

---

## 8. Flujo de Autenticación OAuth

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant G as Google OAuth
    participant DB as Database

    U->>F: Click "Login con Google"
    F->>B: GET /api/auth/google
    B->>G: Redirect a Google
    G->>U: Mostrar pantalla de login
    U->>G: Ingresa credenciales
    G->>B: GET /callback?code=xyz
    B->>G: POST /token (exchange code)
    G-->>B: access_token + profile
    B->>DB: Buscar o crear usuario
    DB-->>B: User data
    B->>B: Generar JWT token
    B->>F: Redirect con token
    F->>F: Guardar token en localStorage
    F->>U: Mostrar Dashboard
```

---

## 9. Ciclo de Vida de un Proyecto RSL

```mermaid
stateDiagram-v2
    [*] --> Draft: Usuario crea proyecto
    Draft --> InProgress: Completa protocolo
    InProgress --> Screening: Importa referencias
    Screening --> Analysis: Completa cribado
    Analysis --> Completed: Genera reporte
    Completed --> [*]
    
    Draft --> [*]: Eliminado
    InProgress --> Draft: Modificar protocolo
    Screening --> InProgress: Importar más referencias
    Analysis --> Screening: Re-evaluar
```

---

## 10. Modelo de Datos (ERD Simplificado)

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : owns
    USERS ||--o{ PROJECT_MEMBERS : participates
    PROJECTS ||--o{ PROJECT_MEMBERS : has
    PROJECTS ||--|| PROTOCOLS : has
    PROJECTS ||--o{ REFERENCES : contains
    PROJECTS ||--o{ ACTIVITY_LOG : tracks
    REFERENCES ||--o{ SCREENING_RECORDS : evaluated
    
    USERS {
        uuid id PK
        string email
        string full_name
        string avatar_url
        timestamp created_at
    }
    
    PROJECTS {
        uuid id PK
        string title
        text description
        enum status
        uuid owner_id FK
        int total_references
        int screened_references
        timestamp created_at
    }
    
    PROTOCOLS {
        uuid id PK
        uuid project_id FK
        text research_question
        jsonb inclusion_criteria
        jsonb exclusion_criteria
        jsonb search_terms
        text search_string
    }
    
    REFERENCES {
        uuid id PK
        uuid project_id FK
        string title
        string authors
        int year
        string doi
        enum screening_status
        text ai_classification
    }
    
    SCREENING_RECORDS {
        uuid id PK
        uuid reference_id FK
        uuid reviewer_id FK
        enum decision
        text exclusion_reason
        int score
        timestamp created_at
    }
```

---

## 11. Flujo de Screening Automático (IA)

```mermaid
graph TD
    A[Usuario inicia screening] --> B[Obtener criterios del protocolo]
    B --> C[Cargar referencias sin cribar]
    C --> D{Hay referencias?}
    D -->|No| E[Fin: Sin referencias]
    D -->|Sí| F[Por cada referencia]
    
    F --> G[Construir prompt con criterios]
    G --> H{Usar qué modelo?}
    
    H -->|OpenAI| I[Llamar GPT-4o-mini]
    H -->|Gemini| J[Llamar Gemini 2.0]
    
    I --> K[Parsear respuesta JSON]
    J --> K
    
    K --> L{Decisión válida?}
    L -->|No| M[Marcar como error]
    L -->|Sí| N[Guardar clasificación]
    
    M --> O[Siguiente referencia]
    N --> O
    
    O --> P{Más referencias?}
    P -->|Sí| F
    P -->|No| Q[Calcular estadísticas]
    Q --> R[Retornar resultados]
    
    style E fill:#ffcdd2
    style M fill:#fff9c4
    style R fill:#c8e6c9
```

---

## 12. API Endpoints (REST)

```mermaid
graph LR
    subgraph "Auth Endpoints"
        A1[POST /auth/register]
        A2[POST /auth/login]
        A3[GET /auth/google]
        A4[GET /auth/me]
    end
    
    subgraph "Project Endpoints"
        B1[GET /projects]
        B2[POST /projects]
        B3[GET /projects/:id]
        B4[PUT /projects/:id]
        B5[DELETE /projects/:id]
    end
    
    subgraph "Protocol Endpoints"
        C1[GET /projects/:id/protocol]
        C2[POST /projects/:id/protocol]
        C3[PUT /projects/:id/protocol]
    end
    
    subgraph "Reference Endpoints"
        D1[GET /references/:projectId]
        D2[POST /references/:projectId/import]
        D3[PUT /references/:id]
        D4[DELETE /references/:id]
    end
    
    subgraph "AI Endpoints"
        E1[POST /ai/generate-criteria]
        E2[POST /ai/generate-terms]
        E3[POST /ai/analyze-screening]
    end
    
    subgraph "Screening Endpoints"
        F1[POST /screening/:projectId/run]
        F2[GET /screening/:projectId/results]
        F3[POST /screening/:projectId/validate]
    end
```

---

## 13. Middleware Pipeline

```mermaid
graph LR
    A[HTTP Request] --> B[CORS Middleware]
    B --> C[Body Parser]
    C --> D[BSON Middleware]
    D --> E[Logger Middleware]
    E --> F[Auth Middleware]
    F --> G[Validation Middleware]
    G --> H[Rate Limiter]
    H --> I[Router]
    I --> J[Controller]
    J --> K[Use Case]
    K --> L[Response]
    
    style A fill:#e1f5fe
    style L fill:#c8e6c9
```

---

## 14. Arquitectura de Microservicios (Conceptual)

```mermaid
graph TB
    subgraph "API Gateway"
        GW[Express Server :3001]
    end
    
    subgraph "Servicios de Dominio"
        S1[Project Service]
        S2[Protocol Service]
        S3[Reference Service]
        S4[Screening Service]
        S5[AI Service]
    end
    
    subgraph "Servicios Externos"
        E1[OpenAI API]
        E2[Gemini API]
        E3[Scopus API]
    end
    
    subgraph "Storage"
        DB[(PostgreSQL)]
        FS[File System]
    end
    
    GW --> S1
    GW --> S2
    GW --> S3
    GW --> S4
    GW --> S5
    
    S1 --> DB
    S2 --> DB
    S3 --> DB
    S4 --> DB
    S3 --> FS
    
    S5 --> E1
    S5 --> E2
    S3 --> E3
```

---

## 15. Comparación SDN vs Sistema RSL

```mermaid
graph TB
    subgraph "SDN Tradicional"
        A1[Applications]
        A2[Northbound API]
        A3[SDN Controller]
        A4[Southbound API]
        A5[Network Devices]
    end
    
    subgraph "Sistema RSL"
        B1[Frontend/Dashboard]
        B2[REST API]
        B3[Backend Express]
        B4[SQL Protocol]
        B5[PostgreSQL]
    end
    
    A1 -.->|Similar| B1
    A2 -.->|Similar| B2
    A3 -.->|Similar| B3
    A4 -.->|Similar| B4
    A5 -.->|Similar| B5
    
    style A1 fill:#e3f2fd
    style A3 fill:#fff9c4
    style A5 fill:#ffebee
    style B1 fill:#e3f2fd
    style B3 fill:#fff9c4
    style B5 fill:#ffebee
```

---

## 16. Proceso de CI/CD

```mermaid
graph LR
    A[git push] --> B[GitHub]
    B --> C{Webhooks}
    
    C -->|Frontend| D[Vercel Build]
    C -->|Backend| E[Railway Build]
    
    D --> F[npm install]
    F --> G[npm run build]
    G --> H[Deploy to CDN]
    
    E --> I[npm install]
    I --> J[npm start]
    J --> K[Health Check]
    K -->|OK| L[Deploy Success]
    K -->|Fail| M[Rollback]
    
    style L fill:#c8e6c9
    style M fill:#ffcdd2
```

---

## 17. Sistema de Caché (Futuro)

```mermaid
graph TB
    A[Request] --> B{Cache Hit?}
    B -->|Sí| C[Retornar desde Cache]
    B -->|No| D[Query Database]
    D --> E[Almacenar en Cache]
    E --> F[Retornar Resultado]
    
    G[TTL Expiration] --> H[Invalidar Cache]
    I[Update Operation] --> H
    
    style C fill:#c8e6c9
    style H fill:#fff9c4
```

---

## 18. Monitoreo y Logging

```mermaid
graph TD
    subgraph "Aplicación"
        A[Express Server]
        B[Logger Middleware]
    end
    
    subgraph "Logs"
        C[Console Logs]
        D[Railway Logs]
        E[Error Logs]
    end
    
    subgraph "Métricas"
        F[Request Count]
        G[Response Time]
        H[Error Rate]
        I[Active Users]
    end
    
    A --> B
    B --> C
    B --> D
    B --> E
    
    B --> F
    B --> G
    B --> H
    B --> I
```

---

## 19. Gestión de Errores

```mermaid
graph TD
    A[Error Occurs] --> B{Error Type?}
    
    B -->|Validation| C[400 Bad Request]
    B -->|Authentication| D[401 Unauthorized]
    B -->|Permission| E[403 Forbidden]
    B -->|Not Found| F[404 Not Found]
    B -->|Rate Limit| G[429 Too Many Requests]
    B -->|Server Error| H[500 Internal Server Error]
    
    C --> I[Error Handler Middleware]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J[Log Error]
    J --> K[Send JSON Response]
    
    style C fill:#fff9c4
    style D fill:#ffcdd2
    style E fill:#ffcdd2
    style F fill:#ffe0b2
    style G fill:#fff9c4
    style H fill:#ffcdd2
```

---

## 20. Modelo de Negocio (Use Cases)

```mermaid
graph TD
    subgraph "User Management"
        A1[Register User]
        A2[Login User]
        A3[OAuth Login]
    end
    
    subgraph "Project Management"
        B1[Create Project]
        B2[Update Project]
        B3[Delete Project]
        B4[List Projects]
    end
    
    subgraph "Protocol Management"
        C1[Define Research Question]
        C2[Generate Criteria AI]
        C3[Generate Search Terms]
        C4[Build Search String]
    end
    
    subgraph "Reference Management"
        D1[Import References]
        D2[Detect Duplicates]
        D3[Search External DBs]
        D4[Export References]
    end
    
    subgraph "Screening"
        E1[Run Automated Screening]
        E2[Manual Review]
        E3[Resolve Conflicts]
        E4[Generate Report]
    end
```

---

*Todos los diagramas están en formato Mermaid y son renderizables en GitHub, VS Code, y herramientas compatibles*
