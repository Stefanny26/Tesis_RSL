# 🏗️ ANÁLISIS DE ARQUITECTURA: Sistema RSL como Red Definida en Software

## 📌 Resumen Ejecutivo

Este documento analiza cómo el **Sistema de Revisión Sistemática de Literatura (RSL)** implementa principios y conceptos de **Redes Definidas por Software (SDN)**, demostrando la aplicación práctica de los contenidos del programa de asignatura.

---

## 🎯 Objetivos del Análisis

1. Identificar elementos arquitectónicos SDN en el sistema RSL
2. Mapear componentes del código a conceptos teóricos del curso
3. Demostrar aplicación de patrones de diseño de redes definidas
4. Validar implementación de políticas y control centralizado

---

## 1️⃣ ARQUITECTURA DE REDES DEFINIDAS EN SOFTWARE

### 1.1 Separación de Planos (Control vs Datos)

En SDN tradicional:
- **Plano de Datos**: Dispositivos que ejecutan acciones
- **Plano de Control**: Lógica que decide qué hacer
- **Plano de Aplicación**: Interfaces hacia usuarios/sistemas

En nuestro Sistema RSL:

```
┌─────────────────────────────────────────────────────────────┐
│                    PLANO DE APLICACIÓN                       │
│  (Frontend Next.js + API REST - Northbound Interface)       │
│                                                              │
│  • Dashboard de visualización                                │
│  • Gestión de proyectos                                      │
│  • Análisis de referencias                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ (JSON sobre HTTPS)
┌──────────────────────▼──────────────────────────────────────┐
│                     PLANO DE CONTROL                         │
│          (Backend Express.js - Controlador SDN)              │
│                                                              │
│  • Use Cases (Lógica de negocio)                            │
│  • Controllers (Manejo de peticiones)                        │
│  • Middlewares (Políticas de seguridad)                     │
│  • Autenticación y autorización                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL/Pool Connections
                       │ (Protocolo PostgreSQL)
┌──────────────────────▼──────────────────────────────────────┐
│                     PLANO DE DATOS                           │
│     (PostgreSQL + Repositories - Southbound Interface)       │
│                                                              │
│  • Almacenamiento persistente                               │
│  • Ejecución de queries                                     │
│  • Gestión de transacciones                                 │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Implementación en Código

#### **Plano de Aplicación (Northbound API)**

```javascript
// frontend/lib/api-client.ts
export const apiClient = {
  // Interfaz unificada hacia el plano de control
  async getProjects() {
    return fetch(`${API_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  
  async createProject(data) {
    return fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
```

#### **Plano de Control (Controlador Central)**

```javascript
// backend/src/api/controllers/project.controller.js
class ProjectController {
  // Punto de entrada desde Northbound API
  async create(req, res) {
    const useCase = new CreateProjectUseCase(projectRepository);
    const result = await useCase.execute(req.body, req.user.id);
    return res.status(201).json(result);
  }
  
  // Lógica de control centralizada
  async list(req, res) {
    const projects = await projectRepository.findByOwnerId(req.user.id);
    return res.json(projects);
  }
}
```

#### **Plano de Datos (Southbound Interface)**

```javascript
// backend/src/infrastructure/repositories/project.repository.js
class ProjectRepository {
  // Interfaz hacia la base de datos (infraestructura)
  async create(projectData) {
    const query = `
      INSERT INTO projects (title, description, owner_id)
      VALUES ($1, $2, $3) RETURNING *
    `;
    const result = await database.query(query, values);
    return new Project(result.rows[0]);
  }
  
  async findByOwnerId(ownerId) {
    const query = 'SELECT * FROM projects WHERE owner_id = $1';
    const result = await database.query(query, [ownerId]);
    return result.rows.map(row => new Project(row));
  }
}
```

---

## 2️⃣ ARQUITECTURA DE REFERENCIA DE UNA RED DEFINIDA

### 2.1 Componentes Principales

```
┌───────────────────────────────────────────────────────────────┐
│                    APLICACIONES FINALES                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Dashboard │  │Projects  │  │Screening │  │Analytics │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
└───────┼─────────────┼─────────────┼─────────────┼───────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
        ┌─────────────▼─────────────────────────────────────┐
        │         NORTHBOUND API (REST)                     │
        │  /api/projects  /api/protocols  /api/screening   │
        │  /api/auth      /api/references  /api/ai         │
        └─────────────┬─────────────────────────────────────┘
                      │
        ┌─────────────▼─────────────────────────────────────┐
        │         CONTROLADOR SDN (Backend)                 │
        │  ┌─────────────────────────────────────────┐     │
        │  │   Capa de Control (Use Cases)           │     │
        │  │  • CreateProjectUseCase                 │     │
        │  │  • ScreeningUseCase                     │     │
        │  │  • GenerateCriteriaUseCase              │     │
        │  └─────────────────────────────────────────┘     │
        │  ┌─────────────────────────────────────────┐     │
        │  │   Capa de Políticas (Middlewares)       │     │
        │  │  • authMiddleware (JWT)                 │     │
        │  │  • validationMiddleware                 │     │
        │  │  • errorHandler                         │     │
        │  └─────────────────────────────────────────┘     │
        └─────────────┬─────────────────────────────────────┘
                      │
        ┌─────────────▼─────────────────────────────────────┐
        │      SOUTHBOUND INTERFACE (Repositories)          │
        │  • ProjectRepository                              │
        │  • ReferenceRepository                            │
        │  • ProtocolRepository                             │
        └─────────────┬─────────────────────────────────────┘
                      │
        ┌─────────────▼─────────────────────────────────────┐
        │         INFRAESTRUCTURA (PostgreSQL)              │
        │  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
        │  │ users   │  │projects │  │protocols│          │
        │  │table    │  │table    │  │table    │          │
        │  └─────────┘  └─────────┘  └─────────┘          │
        └───────────────────────────────────────────────────┘
```

### 2.2 Flujo de Datos en el Sistema

**Ejemplo: Crear un Proyecto**

```
Usuario (Frontend)
    │
    │ 1. POST /api/projects
    │    { title: "Nueva RSL", description: "..." }
    ▼
┌─────────────────────────────────────────┐
│  API REST (Northbound Interface)        │
│  • Recibe petición HTTP                 │
│  • Extrae datos del body                │
└──────────────┬──────────────────────────┘
               │ 2. Pasa a router
               ▼
┌─────────────────────────────────────────┐
│  Router (project.routes.js)             │
│  • Aplica middleware de auth            │
│  • Valida campos requeridos             │
└──────────────┬──────────────────────────┘
               │ 3. Ejecuta controller
               ▼
┌─────────────────────────────────────────┐
│  Controller (project.controller.js)     │
│  • Extrae userId del token              │
│  • Invoca Use Case                      │
└──────────────┬──────────────────────────┘
               │ 4. Ejecuta lógica de negocio
               ▼
┌─────────────────────────────────────────┐
│  Use Case (create-project.use-case.js)  │
│  • Valida reglas de negocio             │
│  • Crea modelo de dominio               │
│  • Llama al Repository                  │
└──────────────┬──────────────────────────┘
               │ 5. Accede a datos
               ▼
┌─────────────────────────────────────────┐
│  Repository (project.repository.js)     │
│  • Construye query SQL                  │
│  • Ejecuta en PostgreSQL                │
└──────────────┬──────────────────────────┘
               │ 6. INSERT INTO projects
               ▼
┌─────────────────────────────────────────┐
│  Database (PostgreSQL)                  │
│  • Almacena registro                    │
│  • Retorna fila insertada               │
└──────────────┬──────────────────────────┘
               │ 7. Retorna resultado
               ▼
     (Respuesta sube por la misma ruta)
               │
               ▼
Usuario recibe: { id: "uuid", title: "...", status: 201 }
```

---

## 3️⃣ PROCESO DE DISEÑO DE LA ARQUITECTURA

### 3.1 Patrones de Diseño Implementados

#### **1. Repository Pattern (Abstracción de Datos)**

```javascript
// backend/src/infrastructure/repositories/project.repository.js
class ProjectRepository {
  // Abstrae el acceso a datos
  // Permite cambiar PostgreSQL por otro DB sin afectar lógica
  
  async findById(id) {
    // Implementación específica para PostgreSQL
    const query = 'SELECT * FROM projects WHERE id = $1';
    const result = await database.query(query, [id]);
    return result.rows[0] ? new Project(result.rows[0]) : null;
  }
  
  async create(projectData) {
    // Encapsula la complejidad del SQL
    const query = `INSERT INTO projects ...`;
    return await database.query(query, values);
  }
}
```

**Beneficios:**
- ✅ Separa lógica de negocio del almacenamiento
- ✅ Facilita testing (mock repositories)
- ✅ Permite cambiar base de datos sin afectar código superior

#### **2. Use Case Pattern (Lógica de Negocio)**

```javascript
// backend/src/domain/use-cases/create-project.use-case.js
class CreateProjectUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }
  
  async execute(projectData, userId) {
    // Lógica de negocio centralizada
    
    // 1. Validar permisos
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // 2. Crear modelo de dominio
    const project = new Project({
      ...projectData,
      owner_id: userId,
      status: 'draft'
    });
    
    // 3. Validar reglas de negocio
    project.validate();
    
    // 4. Persistir
    return await this.projectRepository.create(project);
  }
}
```

**Beneficios:**
- ✅ Lógica de negocio reutilizable
- ✅ Fácil de testear aisladamente
- ✅ Un caso de uso = Una funcionalidad específica

#### **3. Domain Model Pattern**

```javascript
// backend/src/domain/models/project.model.js
class Project {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.status = data.status || 'draft';
  }
  
  // Estados válidos (constraint del dominio)
  static get VALID_STATUSES() {
    return ['draft', 'in-progress', 'screening', 'analysis', 'completed'];
  }
  
  // Reglas de negocio del dominio
  validate() {
    if (!this.title || this.title.length === 0) {
      throw new Error('El título es requerido');
    }
    if (this.title.length > 500) {
      throw new Error('El título no puede exceder 500 caracteres');
    }
    if (!Project.VALID_STATUSES.includes(this.status)) {
      throw new Error(`Estado inválido: ${this.status}`);
    }
  }
  
  // Métodos de dominio
  canBeDeleted() {
    return this.status === 'draft';
  }
  
  isCompleted() {
    return this.status === 'completed';
  }
}
```

### 3.2 Arquitectura en Capas (Layered Architecture)

```
┌──────────────────────────────────────────────────────┐
│  CAPA DE PRESENTACIÓN (Frontend)                     │
│  • React Components                                  │
│  • State Management                                  │
│  • UI/UX                                            │
└────────────────────┬─────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼─────────────────────────────────┐
│  CAPA DE API (Backend Routes + Controllers)          │
│  • Manejo de peticiones HTTP                         │
│  • Validación de entrada                             │
│  • Serialización JSON                                │
└────────────────────┬─────────────────────────────────┘
                     │ Function Calls
┌────────────────────▼─────────────────────────────────┐
│  CAPA DE DOMINIO (Use Cases + Models)                │
│  • Lógica de negocio                                 │
│  • Reglas de validación                              │
│  • Entidades del dominio                             │
└────────────────────┬─────────────────────────────────┘
                     │ Repository Interface
┌────────────────────▼─────────────────────────────────┐
│  CAPA DE INFRAESTRUCTURA (Repositories)              │
│  • Acceso a base de datos                            │
│  • Servicios externos (APIs)                         │
│  • File system                                       │
└────────────────────┬─────────────────────────────────┘
                     │ SQL/Protocol
┌────────────────────▼─────────────────────────────────┐
│  CAPA DE DATOS (PostgreSQL)                          │
│  • Almacenamiento persistente                        │
│  • Gestión de transacciones                          │
│  • Integridad referencial                            │
└──────────────────────────────────────────────────────┘
```

**Código de ejemplo de cada capa:**

```javascript
// 1. CAPA DE PRESENTACIÓN (Frontend)
// frontend/app/projects/page.tsx
export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    apiClient.getProjects().then(setProjects);
  }, []);
  
  return <ProjectList projects={projects} />;
}

// 2. CAPA DE API (Backend Router)
// backend/src/api/routes/project.routes.js
router.get('/', 
  authMiddleware,           // Middleware de autenticación
  projectController.list    // Controller
);

// 3. CAPA DE API (Controller)
// backend/src/api/controllers/project.controller.js
async list(req, res) {
  const useCase = new GetUserProjectsUseCase(projectRepository);
  const projects = await useCase.execute(req.user.id);
  return res.json(projects);
}

// 4. CAPA DE DOMINIO (Use Case)
// backend/src/domain/use-cases/get-user-projects.use-case.js
class GetUserProjectsUseCase {
  async execute(userId) {
    // Validar permisos
    if (!userId) throw new Error('Unauthorized');
    
    // Obtener proyectos
    const projects = await this.projectRepository.findByOwnerId(userId);
    
    // Aplicar lógica de dominio
    return projects.map(p => p.toJSON());
  }
}

// 5. CAPA DE INFRAESTRUCTURA (Repository)
// backend/src/infrastructure/repositories/project.repository.js
async findByOwnerId(ownerId) {
  const query = 'SELECT * FROM projects WHERE owner_id = $1';
  const result = await database.query(query, [ownerId]);
  return result.rows.map(row => new Project(row));
}

// 6. CAPA DE DATOS (Database)
// PostgreSQL ejecuta: SELECT * FROM projects WHERE owner_id = 'uuid';
```

---

## 4️⃣ VISUALIZACIÓN DE FUNCIONES DE RED

### 4.1 Dashboard de Monitoreo

El sistema implementa visualización similar a un controlador SDN:

```javascript
// frontend/app/dashboard/page.tsx
export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalReferences: 0,
    screenedReferences: 0
  });
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatsCard 
        title="Total Proyectos" 
        value={stats.totalProjects}
        icon={<ProjectIcon />}
      />
      <StatsCard 
        title="Proyectos Activos" 
        value={stats.activeProjects}
        icon={<ActiveIcon />}
      />
      {/* Más métricas */}
    </div>
  );
}
```

**Métricas visualizadas:**

```
┌────────────────────────────────────────────────────────┐
│              DASHBOARD - MÉTRICAS DEL SISTEMA          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📊 Total Proyectos: 15                                │
│  ✅ Proyectos Activos: 8                               │
│  📚 Referencias Totales: 1,245                         │
│  🔍 Referencias Cribadas: 892 (71.6%)                  │
│                                                        │
│  ┌──────────────────────────────────────────┐         │
│  │  Estado de Proyectos                     │         │
│  │  ■■■■■■ Draft (6)                        │         │
│  │  ■■■■■ In Progress (5)                   │         │
│  │  ■■■ Screening (3)                       │         │
│  │  ■ Completed (1)                         │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  ┌──────────────────────────────────────────┐         │
│  │  Actividad Reciente                      │         │
│  │  • Proyecto "COVID-19 RSL" creado        │         │
│  │  • 50 referencias importadas             │         │
│  │  • Screening automático completado       │         │
│  └──────────────────────────────────────────┘         │
└────────────────────────────────────────────────────────┘
```

### 4.2 Activity Log (Registro de Eventos)

```sql
-- scripts/08-create-activity-log-table.sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  action_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_project ON activity_log(project_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
```

**Eventos registrados:**
- ✅ Creación de proyectos
- ✅ Modificación de protocolos
- ✅ Importación de referencias
- ✅ Ejecución de screening
- ✅ Cambios de estado

### 4.3 Métricas de Rendimiento

```javascript
// backend/src/domain/models/project.model.js
class Project {
  // Métricas calculadas automáticamente
  get completionPercentage() {
    if (this.totalReferences === 0) return 0;
    return (this.screenedReferences / this.totalReferences) * 100;
  }
  
  get prismaComplianceScore() {
    // Calcular cumplimiento PRISMA
    return this.prismaCompliancePercentage;
  }
  
  toJSON() {
    return {
      ...this,
      // Métricas de rendimiento
      completionPercentage: this.completionPercentage,
      screeningProgress: {
        total: this.totalReferences,
        screened: this.screenedReferences,
        included: this.includedReferences,
        excluded: this.excludedReferences
      }
    };
  }
}
```

---

## 5️⃣ APLICACIONES DE LAS REDES DEFINIDAS EN SOFTWARE

### 5.1 Gestión Centralizada

**Controlador Central (Backend Server):**

```javascript
// backend/src/server.js
class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    
    // Configuración centralizada
    this.initializeMiddlewares();
    this.initializePassport();
    this.initializeRoutes();
    this.initializeErrorHandlers();
  }
  
  initializeRoutes() {
    // Punto central de registro de rutas
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/projects', projectRoutes);
    this.app.use('/api/protocols', protocolRoutes);
    this.app.use('/api/ai', aiRoutes);
    this.app.use('/api/references', referenceRoutes);
    this.app.use('/api/screening', screeningRoutes);
    this.app.use('/api/usage', usageRoutes);
    this.app.use('/api/admin', adminRoutes);
  }
  
  async start() {
    // Inicialización controlada
    await this.connectDatabase();
    this.app.listen(this.port);
    console.log(`🚀 Servidor iniciado en puerto ${this.port}`);
  }
}
```

### 5.2 Políticas de Seguridad y Control de Acceso

#### **Política 1: Autenticación JWT**

```javascript
// backend/src/infrastructure/middlewares/auth.middleware.js
const authMiddleware = async (req, res, next) => {
  try {
    // Extraer token del header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token no proporcionado' 
      });
    }
    
    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener usuario de la base de datos
    const user = await userRepository.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado' 
      });
    }
    
    // Adjuntar usuario al request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado' 
    });
  }
};
```

#### **Política 2: Row Level Security (PostgreSQL)**

```sql
-- scripts/01-create-users-table.sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven sus propios datos
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- scripts/02-create-projects-table.sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo acceden a sus proyectos
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (owner_id = auth.uid());
```

#### **Política 3: Validación de Entrada**

```javascript
// backend/src/api/routes/project.routes.js
router.post(
  '/',
  [
    // Política de validación centralizada
    body('title')
      .notEmpty().withMessage('Título es requerido')
      .isLength({ max: 500 }).withMessage('Título muy largo')
      .trim()
      .escape(), // Sanitización XSS
    
    body('description')
      .optional()
      .isLength({ max: 5000 }).withMessage('Descripción muy larga')
      .trim(),
    
    body('deadline')
      .optional()
      .isISO8601().withMessage('Fecha inválida')
      .custom((value) => {
        // Validación de negocio: fecha futura
        if (new Date(value) < new Date()) {
          throw new Error('La fecha debe ser futura');
        }
        return true;
      }),
    
    validateRequest // Middleware que verifica errores
  ],
  projectController.create
);
```

### 5.3 APIs Públicas para Consumidores

**Documentación de Endpoints (REST API):**

```javascript
/**
 * API REST - Interfaz Pública del Sistema
 * Base URL: http://localhost:3001/api
 */

// ============================================
// AUTENTICACIÓN
// ============================================
POST   /api/auth/register
  Body: { email, full_name, password }
  Response: { token, user }

POST   /api/auth/login
  Body: { email, password }
  Response: { token, user }

GET    /api/auth/google
  Redirect: Google OAuth

GET    /api/auth/me
  Headers: Authorization: Bearer <token>
  Response: { user }

// ============================================
// PROYECTOS
// ============================================
GET    /api/projects
  Headers: Authorization: Bearer <token>
  Response: [{ id, title, status, ... }]

GET    /api/projects/:id
  Headers: Authorization: Bearer <token>
  Response: { id, title, description, ... }

POST   /api/projects
  Headers: Authorization: Bearer <token>
  Body: { title, description, deadline }
  Response: { id, title, status, ... }

PUT    /api/projects/:id
  Headers: Authorization: Bearer <token>
  Body: { title, description, status }
  Response: { id, title, ... }

DELETE /api/projects/:id
  Headers: Authorization: Bearer <token>
  Response: { message: "Deleted" }

// ============================================
// PROTOCOLOS
// ============================================
GET    /api/projects/:projectId/protocol
POST   /api/projects/:projectId/protocol
PUT    /api/projects/:projectId/protocol

// ============================================
// REFERENCIAS
// ============================================
GET    /api/references/:projectId
POST   /api/references/:projectId/import
PUT    /api/references/:id
DELETE /api/references/:id

// ============================================
// SCREENING (IA)
// ============================================
POST   /api/screening/:projectId/run
GET    /api/screening/:projectId/results
POST   /api/screening/:projectId/validate

// ============================================
// INTELIGENCIA ARTIFICIAL
// ============================================
POST   /api/ai/generate-criteria
  Body: { research_question, context }
  Response: { criteria: [...] }

POST   /api/ai/generate-search-terms
  Body: { research_question, inclusion_criteria }
  Response: { terms: [...] }

POST   /api/ai/analyze-screening
  Body: { projectId }
  Response: { analysis: {...} }
```

### 5.4 Funciones de Red como Servicios (Network Functions)

En SDN, las funciones de red se implementan como servicios modulares. En nuestro sistema:

```javascript
// backend/src/domain/use-cases/

// Servicio 1: Detección de Duplicados
class DetectDuplicatesUseCase {
  async execute(projectId) {
    // Algoritmo de similitud entre referencias
    // Similar a un firewall que detecta paquetes duplicados
  }
}

// Servicio 2: Screening Automático (IA)
class RunProjectScreeningUseCase {
  async execute(projectId) {
    // Clasificación automática de referencias
    // Similar a un sistema de QoS que clasifica tráfico
  }
}

// Servicio 3: Generación de Criterios (IA)
class GenerateInclusionExclusionCriteriaUseCase {
  async execute(researchQuestion) {
    // Generación automática con OpenAI/Gemini
    // Similar a un sistema de configuración automática
  }
}

// Servicio 4: Búsqueda en Bases Académicas
class ScopusSearchUseCase {
  async execute(searchString) {
    // Integración con API externa (Scopus)
    // Similar a un gateway que conecta redes diferentes
  }
}

// Servicio 5: Análisis de Resultados
class AnalyzeScreeningResultsUseCase {
  async execute(projectId) {
    // Genera reportes y estadísticas
    // Similar a un sistema de telemetría de red
  }
}
```

---

## 6️⃣ DESPLIEGUE DE LA RED DEFINIDA EN SOFTWARE

### 6.1 Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET                             │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  VERCEL (CDN)    │    │  RAILWAY         │
│  ┌────────────┐  │    │  ┌────────────┐  │
│  │  Frontend  │  │    │  │  Backend   │  │
│  │  Next.js   │  │    │  │  Express   │  │
│  │            │  │    │  │            │  │
│  │ React 18   │  │    │  │ Node.js    │  │
│  └────────────┘  │    │  └──────┬─────┘  │
│                  │    │         │        │
│  Edge Locations  │    │         │        │
│  - us-east-1     │    │         ▼        │
│  - eu-west-1     │    │  ┌────────────┐  │
│  - asia-south-1  │    │  │PostgreSQL  │  │
└──────────────────┘    │  │  + pgvector│  │
                        │  └────────────┘  │
   HTTPS/SSL            │                  │
   Cert Auto-Renew      │   Private Network│
                        └──────────────────┘
```

### 6.2 Configuración de Despliegue

#### **Backend - Railway**

```json
// backend/railway.json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

```javascript
// backend/Procfile
web: npm start
```

```bash
# backend/migrate.sh - Script de migración de BD
#!/bin/bash
DATABASE_URL=$1

scripts=(
  "01-create-users-table.sql"
  "02-create-projects-table.sql"
  "03-create-project-members-table.sql"
  # ... 16 scripts en total
)

for script in "${scripts[@]}"; do
  echo "Ejecutando: $script"
  psql $DATABASE_URL -f "scripts/$script"
done
```

#### **Frontend - Vercel**

```json
// frontend/vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXTAUTH_URL": "@frontend-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 6.3 Variables de Entorno por Plataforma

#### **Backend (Railway)**

```bash
# Configuración de producción
NODE_ENV=production
PORT=3001

# Base de datos (Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:****@railway.internal:5432/railway

# Seguridad
JWT_SECRET=<generado con crypto.randomBytes(32).toString('hex')>
SESSION_SECRET=<generado con crypto.randomBytes(32).toString('hex')>

# URLs
FRONTEND_URL=https://tu-app.vercel.app

# OAuth
GOOGLE_CLIENT_ID=*****.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-*****
GOOGLE_CALLBACK_URL=https://tu-backend.railway.app/api/auth/google/callback

# APIs Externas
OPENAI_API_KEY=sk-proj-*****
GEMINI_API_KEY=AIzaSy*****
SCOPUS_API_KEY=*****
```

#### **Frontend (Vercel)**

```bash
# API Backend
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app

# NextAuth
NEXTAUTH_URL=https://tu-app.vercel.app
NEXTAUTH_SECRET=<generado>

# Google OAuth (mismo que backend)
GOOGLE_CLIENT_ID=*****.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-*****
```

### 6.4 Proceso de Despliegue Automatizado

```
┌─────────────────────────────────────────────────────────┐
│  PASO 1: Desarrollo Local                               │
│  • git commit -m "feature: nueva funcionalidad"         │
│  • git push origin main                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 2: GitHub Repository                              │
│  • Código fuente actualizado                            │
│  • Webhooks a Vercel y Railway                          │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│  PASO 3a: Vercel │  │ PASO 3b: Railway │
│  Build Frontend  │  │ Build Backend    │
│  • npm install   │  │ • npm install    │
│  • npm run build │  │ • npm start      │
│  • Deploy to CDN │  │ • Health check   │
└──────┬───────────┘  └─────┬────────────┘
       │                    │
       │                    ▼
       │          ┌──────────────────┐
       │          │ PASO 3c: Railway │
       │          │ PostgreSQL       │
       │          │ • Run migrations │
       │          │ • Verify tables  │
       │          └─────┬────────────┘
       │                │
       └────────┬───────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 4: Verificación Automática                        │
│  • Health checks (GET /health)                          │
│  • Smoke tests                                          │
│  • Rollback automático si falla                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 5: Aplicación en Producción                       │
│  ✅ Frontend: https://tu-app.vercel.app                 │
│  ✅ Backend: https://tu-backend.railway.app             │
│  ✅ DB: railway.internal:5432                           │
└─────────────────────────────────────────────────────────┘
```

### 6.5 Monitoreo y Logging

```javascript
// backend/src/server.js
class Server {
  initializeMiddlewares() {
    // Logging de todas las peticiones
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${req.method} ${req.path}`);
      
      // Medir tiempo de respuesta
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
      });
      
      next();
    });
  }
}
```

**Logs de producción (Railway):**

```bash
# Ver logs en tiempo real
railway logs --tail

# Ejemplo de output:
[2025-12-11T18:30:15.234Z] GET /api/projects
[2025-12-11T18:30:15.456Z] GET /api/projects - 200 (222ms)
[2025-12-11T18:30:20.123Z] POST /api/projects
[2025-12-11T18:30:20.567Z] POST /api/projects - 201 (444ms)
```

---

## 7️⃣ PROTOCOLO PARA DEFINICIÓN DE POLÍTICAS

### 7.1 Políticas de Seguridad Implementadas

#### **Política 1: Rate Limiting**

```javascript
// backend/src/infrastructure/middlewares/rate-limit.middleware.js
const rateLimit = require('express-rate-limit');

// Límite global: 100 peticiones por 15 minutos
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite para login: 5 intentos por 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login, intenta en 15 minutos',
  skipSuccessfulRequests: true,
});

// Aplicar en rutas
app.use('/api/', globalLimiter);
app.use('/api/auth/login', loginLimiter);
```

#### **Política 2: CORS (Cross-Origin Resource Sharing)**

```javascript
// backend/src/server.js
this.app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 horas
}));
```

#### **Política 3: Validación de Datos**

```javascript
// backend/src/api/validators/validators.js
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validación fallida',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};
```

#### **Política 4: Sanitización de Entrada**

```javascript
// backend/src/api/routes/project.routes.js
router.post(
  '/',
  [
    body('title')
      .trim()                    // Eliminar espacios
      .escape()                  // Escapar HTML
      .blacklist('<>&"\''),      // Remover caracteres peligrosos
    
    body('description')
      .trim()
      .escape(),
    
    validateRequest
  ],
  projectController.create
);
```

### 7.2 Políticas de Acceso a Nivel de Base de Datos

```sql
-- Row Level Security (RLS) - PostgreSQL

-- POLÍTICA: Usuarios solo ven sus propios proyectos
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_access_policy" ON projects
  FOR ALL
  USING (owner_id = current_setting('app.user_id')::uuid);

-- POLÍTICA: Referencias solo accesibles por miembros del proyecto
ALTER TABLE references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reference_access_policy" ON references
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = current_setting('app.user_id')::uuid
    )
  );

-- POLÍTICA: Miembros del proyecto pueden colaborar
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_access_policy" ON project_members
  FOR ALL
  USING (
    user_id = current_setting('app.user_id')::uuid
    OR
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = current_setting('app.user_id')::uuid
    )
  );
```

### 7.3 Políticas de API Usage (Control de Consumo)

```javascript
// backend/src/domain/use-cases/check-api-usage.use-case.js
class CheckApiUsageUseCase {
  async execute(userId, provider) {
    // Obtener límites configurados
    const limits = {
      openai: { daily: 100, monthly: 3000 },
      gemini: { daily: 50, monthly: 1500 }
    };
    
    // Verificar uso actual
    const usage = await apiUsageRepository.getUsageStats(userId, provider);
    
    // Aplicar política de límites
    if (usage.daily >= limits[provider].daily) {
      throw new Error(`Límite diario excedido para ${provider}`);
    }
    
    if (usage.monthly >= limits[provider].monthly) {
      throw new Error(`Límite mensual excedido para ${provider}`);
    }
    
    return { allowed: true, remaining: limits[provider].daily - usage.daily };
  }
}
```

---

## 8️⃣ INSTRUMENTOS DE VALIDACIÓN

### 8.1 Testing Automatizado

```javascript
// backend/tests/unit/project.repository.test.js
describe('ProjectRepository', () => {
  let repository;
  let mockDatabase;
  
  beforeEach(() => {
    mockDatabase = {
      query: jest.fn()
    };
    repository = new ProjectRepository(mockDatabase);
  });
  
  describe('findById', () => {
    it('debe retornar un proyecto cuando existe', async () => {
      // Arrange
      const mockProject = {
        id: 'uuid',
        title: 'Test Project',
        owner_id: 'user-uuid'
      };
      mockDatabase.query.mockResolvedValue({ rows: [mockProject] });
      
      // Act
      const result = await repository.findById('uuid');
      
      // Assert
      expect(result).toBeInstanceOf(Project);
      expect(result.title).toBe('Test Project');
      expect(mockDatabase.query).toHaveBeenCalledWith(
        'SELECT * FROM projects WHERE id = $1',
        ['uuid']
      );
    });
    
    it('debe retornar null cuando no existe', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [] });
      const result = await repository.findById('uuid');
      expect(result).toBeNull();
    });
  });
});
```

### 8.2 Validación de API

```javascript
// backend/tests/integration/project.api.test.js
describe('POST /api/projects', () => {
  it('debe crear un proyecto con datos válidos', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: 'Nuevo Proyecto RSL',
        description: 'Descripción del proyecto'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Nuevo Proyecto RSL');
  });
  
  it('debe rechazar sin autenticación', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({ title: 'Test' });
    
    expect(response.status).toBe(401);
  });
  
  it('debe rechazar título vacío', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: '' });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validación fallida');
  });
});
```

### 8.3 Health Checks

```javascript
// backend/src/server.js
this.app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a BD
    await database.query('SELECT 1');
    
    // Verificar APIs externas (opcional)
    const checks = {
      database: 'healthy',
      server: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(checks);
  } catch (error) {
    res.status(503).json({
      database: 'unhealthy',
      error: error.message
    });
  }
});
```

### 8.4 Validación de Datos de Entrada

```javascript
// backend/src/api/routes/project.routes.js
const projectValidationRules = {
  create: [
    body('title')
      .notEmpty().withMessage('Título requerido')
      .isLength({ min: 3, max: 500 }).withMessage('Longitud inválida')
      .matches(/^[a-zA-Z0-9\s\-_:]+$/).withMessage('Caracteres inválidos'),
    
    body('description')
      .optional()
      .isLength({ max: 5000 }).withMessage('Descripción muy larga'),
    
    body('deadline')
      .optional()
      .isISO8601().withMessage('Fecha inválida')
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error('Fecha debe ser futura');
        }
        return true;
      })
  ],
  
  update: [
    param('id').isUUID().withMessage('ID inválido'),
    body('status')
      .optional()
      .isIn(['draft', 'in-progress', 'screening', 'analysis', 'completed'])
      .withMessage('Estado inválido')
  ]
};

router.post('/', projectValidationRules.create, validateRequest, projectController.create);
router.put('/:id', projectValidationRules.update, validateRequest, projectController.update);
```

---

## 9️⃣ COMPARACIÓN: SDN vs SISTEMA RSL

| Aspecto | SDN Tradicional | Sistema RSL |
|---------|----------------|-------------|
| **Plano de Control** | Controlador SDN (OpenFlow) | Backend Express.js |
| **Plano de Datos** | Switches/Routers | PostgreSQL Database |
| **Northbound API** | REST/RESTCONF | REST API (Express) |
| **Southbound Interface** | OpenFlow Protocol | SQL Protocol (pg) |
| **Aplicaciones** | Traffic Engineering, Firewall | Dashboard, Screening, AI |
| **Políticas** | Flow Rules, QoS | Auth, Validation, RLS |
| **Centralización** | Controlador único | Server.js centralizado |
| **Visualización** | Network Topology | Dashboard UI |
| **Despliegue** | Physical/Virtual Switches | Railway + Vercel |
| **Programabilidad** | Python/Java SDN Apps | JavaScript/TypeScript |

---

## 🔟 CONCLUSIONES

### Aplicación de Conceptos SDN en el Sistema RSL

1. ✅ **Separación de Planos**: El sistema implementa clara separación entre control (backend), datos (PostgreSQL) y aplicación (frontend)

2. ✅ **Arquitectura de Referencia**: Sigue el modelo SDN con Northbound API (REST), Controlador Central (Express), y Southbound Interface (Repositories)

3. ✅ **Control Centralizado**: Toda la lógica de negocio está centralizada en el backend, similar al controlador SDN

4. ✅ **Políticas Programáticas**: Implementa políticas de seguridad, acceso y validación mediante código

5. ✅ **API Pública**: Proporciona una API REST bien definida para consumo de aplicaciones

6. ✅ **Visualización**: Dashboard para monitoreo de estado y métricas del sistema

7. ✅ **Despliegue Modular**: Componentes desplegables independientemente (Railway/Vercel)

### Valor Académico

Este proyecto demuestra la **aplicación práctica de principios de arquitectura de redes** en un contexto de software moderno, evidenciando que los conceptos de SDN trascienden las redes tradicionales y son aplicables a sistemas distribuidos.

---

## 📚 Referencias

- **Código Fuente**: https://github.com/Stefanny26/Tesis_RSL
- **Documentación**: `backend/README.md`, `docs/`
- **Guías de Despliegue**: `QUICKSTART-DEPLOY.md`, `DEPLOYMENT.md`
- **Scripts de Migración**: `scripts/*.sql`

---

## 📧 Contacto

- **Repositorio**: Stefanny26/Tesis_RSL
- **Tecnologías**: Next.js 14, Express.js, PostgreSQL 16, OpenAI, Google Gemini
- **Despliegue**: Vercel (Frontend) + Railway (Backend + DB)

---

*Documento generado para presentación académica*  
*Fecha: Diciembre 2025*
