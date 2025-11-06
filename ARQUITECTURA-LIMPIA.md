# 🏗️ Arquitectura del Proyecto - Thesis RSL System

## 📁 Estructura de Directorios

```
thesis-rsl-system/
│
├── 📂 backend/                      # API Backend (Node.js + Express)
│   ├── src/
│   │   ├── api/                     # Capa de API (Controllers + Routes)
│   │   │   ├── controllers/         # Controladores HTTP
│   │   │   ├── routes/              # Definición de rutas
│   │   │   └── validators/          # Validaciones de entrada
│   │   │
│   │   ├── domain/                  # Capa de Dominio (Lógica de Negocio)
│   │   │   ├── models/              # Entidades del dominio
│   │   │   └── use-cases/           # Casos de uso (lógica de negocio)
│   │   │
│   │   ├── infrastructure/          # Capa de Infraestructura
│   │   │   ├── middlewares/         # Middlewares (auth, error handling)
│   │   │   └── repositories/        # Acceso a datos (PostgreSQL)
│   │   │
│   │   ├── config/                  # Configuraciones
│   │   │   ├── database.js          # Conexión PostgreSQL
│   │   │   └── passport-setup.js    # OAuth Google
│   │   │
│   │   └── server.js                # Punto de entrada del servidor
│   │
│   ├── package.json
│   └── .env                         # Variables de entorno
│
├── 📂 frontend/                     # Aplicación Frontend (Next.js 14)
│   ├── app/                         # App Router de Next.js 14
│   │   ├── (auth)/                  # Rutas de autenticación
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── dashboard/               # Dashboard principal
│   │   ├── projects/                # Gestión de proyectos RSL
│   │   │   └── [id]/                # Proyecto específico
│   │   │       ├── protocol/        # Protocolo con IA
│   │   │       ├── screening/       # Cribado de artículos
│   │   │       ├── prisma/          # Diagrama PRISMA
│   │   │       └── article/         # Vista de artículo
│   │   │
│   │   ├── auth/                    # OAuth callback
│   │   ├── page.tsx                 # Landing page
│   │   └── layout.tsx               # Layout principal
│   │
│   ├── components/                  # Componentes reutilizables
│   │   ├── ui/                      # Componentes base (shadcn/ui)
│   │   ├── dashboard/               # Componentes del dashboard
│   │   ├── protocol/                # Componentes de protocolo
│   │   └── screening/               # Componentes de cribado
│   │
│   ├── lib/                         # Utilidades y configuración
│   │   ├── api-client.ts            # Cliente API (fetch wrapper)
│   │   ├── auth-context.tsx         # Context de autenticación
│   │   ├── types.ts                 # Tipos TypeScript
│   │   └── utils.ts                 # Funciones auxiliares
│   │
│   ├── hooks/                       # Custom React Hooks
│   ├── styles/                      # Estilos globales
│   ├── public/                      # Archivos estáticos
│   │
│   ├── middleware.ts                # Middleware de Next.js (protección de rutas)
│   ├── package.json
│   └── .env.local                   # Variables de entorno
│
├── 📂 docs/                         # Documentación del proyecto
│   ├── 01-requerimientos.md
│   ├── 02-epicas.md
│   └── ...
│
├── 📂 scripts/                      # Scripts SQL de base de datos
│   ├── 01-create-users-table.sql
│   ├── 02-create-projects-table.sql
│   └── ...
│
├── start-dev.ps1                    # Script para iniciar todo el proyecto
├── cleanup-duplicates.ps1           # Script de limpieza
└── README.md

```

---

## 🏛️ Principios de Arquitectura Limpia

### Backend (Clean Architecture + DDD)

#### 1. **Capa de API** (`src/api/`)
- **Responsabilidad**: Manejo de HTTP, validación de entrada, serialización
- **No contiene**: Lógica de negocio
- **Depende de**: Casos de uso (domain layer)

```javascript
// ✅ BIEN: Controller delgado
async createProject(req, res) {
  try {
    const createProjectUseCase = new CreateProjectUseCase();
    const result = await createProjectUseCase.execute(req.body, req.userId);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// ❌ MAL: Lógica de negocio en el controller
async createProject(req, res) {
  const project = { ...req.body, userId: req.userId };
  // Lógica compleja aquí ❌
  const result = await db.query('INSERT INTO...');
}
```

#### 2. **Capa de Dominio** (`src/domain/`)
- **Responsabilidad**: Lógica de negocio pura, reglas del dominio
- **No depende de**: Base de datos, HTTP, frameworks externos
- **Contiene**: Entidades (models) y Casos de Uso (use-cases)

```javascript
// ✅ BIEN: Caso de uso con lógica de negocio
class GenerateProtocolAnalysisUseCase {
  async execute(protocolId, userProposal) {
    // 1. Validar protocolo existe
    // 2. Generar análisis con IA
    // 3. Validar cumplimiento PRISMA
    // 4. Guardar resultados
    return analysisResult;
  }
}
```

#### 3. **Capa de Infraestructura** (`src/infrastructure/`)
- **Responsabilidad**: Implementaciones técnicas (DB, APIs externas)
- **Depende de**: Dominio (implementa interfaces del dominio)

```javascript
// ✅ BIEN: Repository con queries SQL aislados
class UserRepository {
  async findById(id) {
    const result = await database.query('SELECT * FROM users WHERE id = $1', [id]);
    return new User(result.rows[0]); // Devuelve entidad de dominio
  }
}
```

---

### Frontend (Component-Based Architecture)

#### 1. **Separación de Responsabilidades**

```typescript
// ✅ BIEN: Componente de presentación puro
export function ProjectCard({ project, onDelete }) {
  return (
    <Card>
      <CardTitle>{project.title}</CardTitle>
      <Button onClick={() => onDelete(project.id)}>Eliminar</Button>
    </Card>
  )
}

// ✅ BIEN: Lógica en página/container
export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  
  const handleDelete = async (id) => {
    await apiClient.deleteProject(id)
    setProjects(projects.filter(p => p.id !== id))
  }
  
  return <ProjectCard project={project} onDelete={handleDelete} />
}
```

#### 2. **Custom Hooks para Lógica Reutilizable**

```typescript
// ✅ BIEN: Hook personalizado
export function useProjects() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadProjects()
  }, [])
  
  const loadProjects = async () => {
    const data = await apiClient.getProjects()
    setProjects(data.projects)
    setIsLoading(false)
  }
  
  return { projects, isLoading, reload: loadProjects }
}
```

#### 3. **Context para Estado Global**

```typescript
// ✅ BIEN: Auth context para autenticación
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  
  const login = async (email, password) => {
    const result = await apiClient.login(email, password)
    setUser(result.user)
  }
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

## 🔄 Flujo de Datos

### Request Flow (Backend)
```
HTTP Request
    ↓
Route (auth.routes.js)
    ↓
Middleware (auth.middleware.js) → Validación
    ↓
Controller (auth.controller.js) → HTTP handling
    ↓
Use Case (oauth-login.use-case.js) → Lógica de negocio
    ↓
Repository (user.repository.js) → Acceso a datos
    ↓
Database (PostgreSQL)
    ↓
← Respuesta inversa →
HTTP Response
```

### Component Flow (Frontend)
```
User Action
    ↓
Component Event Handler
    ↓
API Client (lib/api-client.ts)
    ↓
Backend API
    ↓
← Response →
    ↓
State Update (useState/Context)
    ↓
Component Re-render
```

---

## ✅ Buenas Prácticas Aplicadas

### 1. **Separation of Concerns**
- ✅ Lógica de negocio separada de infraestructura
- ✅ Componentes de UI separados de lógica de estado
- ✅ Rutas protegidas con middleware

### 2. **Dependency Injection**
```javascript
// ✅ BIEN: Inyección de dependencias
class CreateProjectUseCase {
  constructor(projectRepository = new ProjectRepository()) {
    this.projectRepository = projectRepository;
  }
}
```

### 3. **Error Handling Centralizado**
```javascript
// Backend: middleware/error-handler.js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});
```

### 4. **Validación de Datos**
```javascript
// ✅ BIEN: Validación en capa de API
router.post('/register', 
  validators.validateRegistration, // Middleware de validación
  authController.register
);
```

### 5. **TypeScript para Type Safety**
```typescript
// ✅ BIEN: Tipos bien definidos
export interface Project {
  id: string
  title: string
  status: 'draft' | 'in-progress' | 'completed'
  userId: string
  createdAt: string
}
```

---

## 🚀 Comandos de Desarrollo

### Iniciar todo el proyecto
```powershell
.\start-dev.ps1
```

### Iniciar solo backend
```powershell
cd backend
npm run dev
```

### Iniciar solo frontend
```powershell
cd frontend
npm run dev
```

---

## 📚 Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.18
- **Database**: PostgreSQL 14+
- **ORM**: Native SQL (Clean Architecture)
- **Auth**: JWT + Google OAuth 2.0 (Passport.js)
- **AI**: Google Gemini API

### Frontend
- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Fetch API (wrapper personalizado)

---

## 🔐 Seguridad

1. **JWT Tokens** con expiración de 7 días
2. **OAuth 2.0** con Google (flujo seguro)
3. **Middleware de autenticación** en rutas protegidas
4. **Validación de entrada** en todos los endpoints
5. **Variables de entorno** para secretos (.env)
6. **CORS configurado** solo para frontend autorizado

---

## 📈 Escalabilidad

### Backend
- ✅ Repositorios permiten cambiar fácilmente de BD
- ✅ Casos de uso desacoplados de framework
- ✅ Fácil agregar nuevos endpoints/features

### Frontend
- ✅ Componentes reutilizables
- ✅ API client centralizado
- ✅ Context API para estado global
- ✅ Code splitting automático (Next.js)

---

## 🧪 Testing (Recomendado)

```javascript
// Backend: use-cases testing
describe('CreateProjectUseCase', () => {
  it('should create project with valid data', async () => {
    const useCase = new CreateProjectUseCase(mockRepository);
    const result = await useCase.execute({ title: 'Test' }, userId);
    expect(result.title).toBe('Test');
  });
});

// Frontend: component testing
describe('ProjectCard', () => {
  it('renders project title', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });
});
```

---

## 📖 Referencias

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
