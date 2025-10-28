# 📚 Sistema RSL - Revisión Sistemática de Literatura con IA

> Sistema web completo para gestionar revisiones sistemáticas de literatura siguiendo la metodología PRISMA, potenciado con inteligencia artificial y autenticación OAuth.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-OAuth-purple)](https://next-auth.js.org/)

## 🎯 Descripción

Este proyecto es un **Sistema de Gestión de Revisiones Sistemáticas de Literatura (RSL)** desarrollado como tesis de grado para la Universidad de las Fuerzas Armadas ESPE. El sistema permite a investigadores crear, gestionar y ejecutar revisiones sistemáticas siguiendo los estándares PRISMA, con el apoyo de inteligencia artificial para optimizar el proceso.

## ✨ Características Principales

### 🔐 **Autenticación Avanzada**
- ✅ **Login tradicional** con email y contraseña
- ✅ **Google OAuth** integrado con NextAuth.js
- ✅ **Registro seguro** con validaciones
- ✅ **Gestión de sesiones** persistente
- ✅ **Middleware de protección** de rutas

### 📊 **Dashboard Investigador**
- ✅ **Vista general** de todos los proyectos RSL
- ✅ **Estadísticas en tiempo real** (proyectos activos, completados, referencias)
- ✅ **Creación rápida** de nuevos proyectos
- ✅ **Navegación intuitiva** con sidebar responsivo

### 🔬 **Gestión de Proyectos RSL**
- ✅ **CRUD completo** de proyectos
- ✅ **Estados del proyecto** (planificación, en progreso, completado)
- ✅ **Colaboración** entre investigadores
- ✅ **Seguimiento temporal** de avances

### 📋 **Protocolo de Investigación**
- 🚧 **Preguntas de investigación** estructuradas
- 🚧 **Marco PICO** (Población, Intervención, Comparación, Resultado)
- 🚧 **Criterios de inclusión/exclusión** detallados
- 🚧 **Estrategias de búsqueda** en bases de datos

### 📚 **Gestión de Referencias**
- 🚧 **Importación masiva** desde bases de datos académicas
- 🚧 **Screening automatizado** con IA
- 🚧 **Detección de duplicados** inteligente
- 🚧 **Clasificación automática** por relevancia

### ✅ **PRISMA Compliance**
- 🚧 **Checklist PRISMA** interactivo
- 🚧 **Validación automática** con IA
- 🚧 **Diagrama de flujo** generado automáticamente
- 🚧 **Reportes de cumplimiento**

### 📝 **Generación de Artículos**
- 🚧 **Editor científico** avanzado
- 🚧 **Generación de secciones** con IA (GPT-4)
- 🚧 **Control de versiones** integrado
- 🚧 **Exportación** a Word/LaTeX/PDF

## 🏗️ Arquitectura Técnica

Este proyecto implementa **Clean Architecture** para garantizar:

- ✅ **Mantenibilidad**: Código organizado en capas bien definidas
- ✅ **Testabilidad**: Lógica de negocio independiente de frameworks
- ✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades
- ✅ **Flexibilidad**: Intercambiar tecnologías sin afectar el core

### 📁 Estructura del Proyecto

```
thesis-rsl-system/
├── 🎯 src/                          # Clean Architecture
│   ├── domain/                      # Entidades y reglas de negocio
│   │   ├── entities/                # User, Project, Reference
│   │   └── repositories/            # Contratos de repositorios
│   │
│   ├── application/                 # Casos de uso (lógica de aplicación)
│   │   └── use-cases/
│   │       ├── auth/                # LoginUseCase, RegisterUseCase
│   │       ├── projects/            # CreateProjectUseCase, GetProjectsUseCase
│   │       └── references/          # ImportReferencesUseCase
│   │
│   ├── infrastructure/              # Implementaciones concretas
│   │   ├── repositories/            # LocalStorage, Supabase, Prisma
│   │   └── services/                # OpenAI API, Google Scholar API
│   │
│   └── presentation/                # Componentes y providers
│       └── providers/               # React Context con Clean Architecture
│
├── 🌐 app/                          # Next.js App Router
│   ├── dashboard/                   # Dashboard principal
│   ├── login/                       # Páginas de autenticación
│   ├── projects/[id]/               # Detalle de proyecto dinámico
│   │   ├── protocol/                # Configuración del protocolo
│   │   ├── screening/               # Screening de referencias
│   │   ├── prisma/                  # Cumplimiento PRISMA
│   │   └── article/                 # Editor de artículo
│   └── api/auth/[...nextauth]/      # API de NextAuth.js
│
├── 🎨 components/                   # Componentes React reutilizables
│   ├── auth/                        # LoginForm, RegisterForm
│   ├── dashboard/                   # DashboardNav, StatsCard, ProjectCard
│   ├── screening/                   # ReferenceTable, AIScreeningPanel
│   ├── prisma/                      # PrismaChecklist, FlowDiagram
│   ├── article/                     # ArticleEditor, VersionHistory
│   └── ui/                          # Componentes base (shadcn/ui)
│
├── 📚 lib/                          # Utilidades y configuraciones
│   ├── auth-context.tsx             # Contexto de autenticación híbrido
│   ├── prisma.ts                    # Cliente de Prisma ORM
│   ├── supabase.ts                  # Cliente de Supabase
│   └── utils.ts                     # Funciones utilitarias
│
├── 🗄️ prisma/                       # Base de datos
│   └── schema.prisma                # Esquema de la base de datos
│
├── 📄 scripts/                      # Scripts SQL y utilidades
│   ├── setup-database.ts            # Configuración inicial de BD
│   └── *.sql                        # Scripts de migración
│
└── 📖 docs/                         # Documentación completa
    ├── requerimientos.md             # Análisis de requerimientos
    ├── historias-usuario.md          # User stories detalladas
    └── product-backlog.md            # Backlog priorizado
```

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos

```bash
# Versiones requeridas
Node.js >= 18.0.0
npm >= 8.0.0 (o pnpm >= 7.0.0)
Git >= 2.34.0
```

### ⚡ Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/Stefanny26/Tesis_RSL.git
cd Tesis_RSL

# 2. Instalar dependencias
npm install
# o si prefieres pnpm (más rápido)
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Configurar base de datos (opcional para desarrollo local)
npm run db:setup

# 5. Ejecutar en modo desarrollo
npm run dev
```

🌐 **La aplicación estará disponible en:** [http://localhost:3000](http://localhost:3000)

### ⚙️ Variables de Entorno

Crear archivo `.env.local` con las siguientes variables:

```env
# 🗄️ Base de Datos (Supabase)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# 🔐 NextAuth.js (Autenticación)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-clave-secreta-super-segura"

# 🔵 Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# 🤖 Inteligencia Artificial (Opcional)
OPENAI_API_KEY="tu-openai-api-key"
ANTHROPIC_API_KEY="tu-anthropic-api-key"

# 🚀 Supabase (Opcional)
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-supabase-anon-key"
```

## 🛠️ Stack Tecnológico

### 🎨 **Frontend**
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.2.25 | Framework React con App Router |
| **React** | 18+ | Biblioteca de interfaz de usuario |
| **TypeScript** | 5+ | Tipado estático y mejor DX |
| **Tailwind CSS** | 3+ | Framework CSS utilitario |
| **shadcn/ui** | Latest | Componentes de UI accesibles |
| **React Hook Form** | 7+ | Manejo eficiente de formularios |
| **Zod** | 3+ | Validación de esquemas TypeScript |

### 🔧 **Backend & Database**
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Supabase** | Latest | Backend como servicio (PostgreSQL) |
| **Prisma** | 6+ | ORM moderno para TypeScript |
| **NextAuth.js** | 4+ | Autenticación completa |
| **PostgreSQL** | 14+ | Base de datos relacional |

### 🤖 **Inteligencia Artificial**
| Servicio | Propósito |
|----------|-----------|
| **OpenAI GPT-4** | Screening de referencias, generación de texto |
| **Anthropic Claude** | Análisis de artículos científicos |
| **Custom NLP Models** | Clasificación de relevancia |

### 🧪 **Testing & Quality**
| Herramienta | Propósito |
|-------------|-----------|
| **Vitest** | Test runner rápido |
| **Testing Library** | Tests de componentes React |
| **Playwright** | Tests end-to-end |
| **ESLint** | Linting de código |
| **Prettier** | Formateo automático |

## 📊 Funcionalidades por Módulo

### 🏠 **Dashboard**
```typescript
// Estadísticas en tiempo real
interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalReferences: number
  pendingScreening: number
  aiAnalysisCompleted: number
}
```

### 🔐 **Autenticación**
```typescript
// Tipos de usuario soportados
type AuthProvider = 'credentials' | 'google' | 'github'
type UserRole = 'investigator' // Solo investigadores (sin roles complejos)

interface User {
  id: string
  email: string
  name: string
  image?: string
  institution?: string
  createdAt: Date
}
```

### 📋 **Proyectos RSL**
```typescript
// Estados del proyecto
type ProjectStatus = 
  | 'planning'     // Planificación inicial
  | 'protocol'     // Desarrollo del protocolo
  | 'screening'    // Screening de referencias
  | 'analysis'     // Análisis y síntesis
  | 'writing'      // Redacción del artículo
  | 'completed'    // Finalizado

interface Project {
  id: string
  title: string
  description: string
  status: ProjectStatus
  methodology: 'PRISMA' | 'COCHRANE'
  collaborators: User[]
  createdAt: Date
  updatedAt: Date
}
```

## 🎨 Capturas de Pantalla

### 🏠 Dashboard Principal
```
┌─────────────────────────────────────────────────────────────┐
│ RSL Manager                                    [👤 Avatar ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Bienvenido, [Nombre del Usuario]                           │
│ Gestiona tus revisiones sistemáticas de literatura con IA  │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│ │📚 Proyectos │ │⚡ Activos   │ │✅ Completos │ │📄 Refs  │ │
│ │     3       │ │     2       │ │     0       │ │   401   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
│                                                             │
│ 📊 Proyectos Activos                          [+ Nuevo]    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔬 Estudio IA en Educación           📅 Hace 2 días    │ │
│ │ 📋 Screening • 45/120 referencias                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 🔐 Pantalla de Login
```
┌─────────────────────────────────────────────────────────────┐
│                Sistema de Gestión RSL                      │
│            Universidad de las Fuerzas Armadas ESPE         │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                 Iniciar Sesión                          │ │
│ │                                                         │ │
│ │ [🔵 Continuar con Google                              ] │ │
│ │                                                         │ │
│ │ ─────────────── O continúa con ───────────────          │ │
│ │                                                         │ │
│ │ Email: [_________________________________]              │ │
│ │ Contraseña: [____________________________]              │ │
│ │                                                         │ │
│ │ [        Iniciar Sesión        ]                       │ │
│ │                                                         │ │
│ │ ¿No tienes cuenta? Regístrate aquí                     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🧪 Testing

### 🚀 Ejecutar Tests

```bash
# Tests unitarios
npm run test
npm run test:watch     # Modo watch
npm run test:coverage  # Con cobertura

# Tests de integración
npm run test:integration

# Tests end-to-end
npm run test:e2e
npm run test:e2e:ui    # Con interfaz visual

# Linting y formato
npm run lint
npm run lint:fix
npm run format
```

### 📊 Cobertura de Tests

```bash
# Generar reporte de cobertura
npm run test:coverage

# Ver reporte en navegador
open coverage/index.html
```

## 🚀 Despliegue

### 🌐 Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login y deploy
vercel login
vercel --prod

# 3. Configurar variables de entorno en Vercel Dashboard
```

### 🐳 Docker

```bash
# Build de la imagen
docker build -t rsl-system .

# Ejecutar contenedor
docker run -p 3000:3000 rsl-system
```

### 🔧 Variables de Producción

```env
# Ejemplo para producción
NEXTAUTH_URL="https://tu-dominio.com"
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 📈 Roadmap del Proyecto

### ✅ **Fase 1: Fundación (Completada)**
- [x] Arquitectura Clean Architecture
- [x] Autenticación con Google OAuth
- [x] Dashboard básico
- [x] CRUD de proyectos
- [x] Sistema de navegación

### 🚧 **Fase 2: Core RSL (En Desarrollo)**
- [ ] Protocolo de investigación
- [ ] Importación de referencias
- [ ] Screening manual
- [ ] Detección de duplicados

### 🔮 **Fase 3: IA Integration**
- [ ] Screening automatizado con GPT-4
- [ ] Clasificación por relevancia
- [ ] Extracción de datos
- [ ] Generación de síntesis

### 🎯 **Fase 4: PRISMA Compliance**
- [ ] Checklist interactivo
- [ ] Validación automática
- [ ] Diagrama de flujo
- [ ] Reportes de calidad

### 📝 **Fase 5: Generación de Artículos**
- [ ] Editor científico
- [ ] Templates de artículo
- [ ] Generación con IA
- [ ] Exportación multi-formato

## 🤝 Contribución

### 🔄 Flujo de Trabajo

1. **Fork** del repositorio
2. **Crear rama** feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** cambios: `git commit -am 'feat: Add nueva funcionalidad'`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. **Crear** Pull Request

### 📝 Convenciones

#### Commits (Conventional Commits)
```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

#### Código
- **TypeScript**: Usar tipos explícitos
- **Nombres**: camelCase para variables, PascalCase para componentes
- **Clean Architecture**: Respetar las capas y dependencias
- **Testing**: Escribir tests para nuevas funcionalidades

## 📞 Soporte y Contacto

### 🐛 Reportar Bugs

Para reportar bugs, usar [GitHub Issues](https://github.com/Stefanny26/Tesis_RSL/issues):

1. **Título descriptivo**: Resume el problema
2. **Pasos para reproducir**: Lista detallada
3. **Comportamiento esperado vs actual**
4. **Screenshots** si aplica
5. **Entorno**: OS, navegador, versión

### 💬 Discusiones

Para preguntas y discusiones: [GitHub Discussions](https://github.com/Stefanny26/Tesis_RSL/discussions)

### 📧 Contacto Académico

- **Universidad**: Universidad de las Fuerzas Armadas ESPE
- **Facultad**: Ingeniería en Sistemas
- **Email**: [tu-email@espe.edu.ec]

## 🏆 Reconocimientos

### 👥 Equipo de Desarrollo
- **Desarrollador Principal**: Stefanny Mishel Hernández Buenaño
- **Director de Tesis**: [Nombre del Director]
- **Revisor Técnico**: [Nombre del Revisor]

### 🎓 Institución
- **Universidad de las Fuerzas Armadas ESPE**
- **Departamento de Ciencias de la Computación**
- **Carrera de Ingeniería en Sistemas**

### 🛠️ Tecnologías y Comunidades
- [Next.js](https://nextjs.org/) - Framework React de producción
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI reutilizables
- [Prisma](https://www.prisma.io/) - ORM moderno para TypeScript
- [Supabase](https://supabase.com/) - Backend como servicio
- [Vercel](https://vercel.com/) - Plataforma de despliegue

## 📄 Licencia

Este proyecto está desarrollado como **trabajo de tesis** para la Universidad de las Fuerzas Armadas ESPE. 

### Uso Académico
- ✅ Permitido para **investigación académica**
- ✅ Permitido para **fines educativos**
- ✅ Permitido **citar y referenciar**

### Uso Comercial
- ❌ **No permitido** sin autorización expresa
- ❌ **No redistribuir** sin permisos
- ⚠️ **Contactar** para uso comercial

---

<<<<<<< HEAD
<div align="center">

### 🌟 ¡Dale una estrella si este proyecto te ayuda!

</div>

[![Universidad ESPE](https://img.shields.io/badge/Universidad-ESPE-red)](https://www.espe.edu.ec/)
[![Tesis de Grado](https://img.shields.io/badge/Proyecto-Tesis%20de%20Grado-blue)](https://github.com/Stefanny26/Tesis_RSL)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-green)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### 🌟 ¡Dale una estrella si este proyecto te ayuda!

</div>
#   T e s i s _ R S L 
 
 
=======
**Desarrollado con ❤️ usando Clean Architecture y Next.js**
#   T e s i s _ R S L 
 
 
>>>>>>> 1797e3abe785ab5606883e4c65289bb9221e9e53
