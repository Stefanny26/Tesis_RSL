# 🏗️ Nueva Estructura - Clean Architecture Completa

## 📁 Estructura Propuesta

```
src/
├── core/                           # Núcleo de la aplicación
│   ├── config/                     # Configuraciones globales
│   ├── constants/                  # Constantes de la app
│   ├── types/                      # Tipos globales
│   └── utils/                      # Utilidades compartidas
│
├── shared/                         # Código compartido entre features
│   ├── domain/                     # Entidades/interfaces compartidas
│   ├── infrastructure/             # Servicios compartidos (Prisma, HTTP)
│   ├── presentation/               # Componentes UI reutilizables
│   │   ├── components/             # Componentes base (Button, Card, etc.)
│   │   ├── layouts/                # Layouts (MainLayout, AuthLayout, etc.)
│   │   └── hooks/                  # Custom hooks compartidos
│   └── application/                # Lógica compartida
│
├── features/                       # Features/Módulos de la aplicación
│   ├── auth/                       # Feature: Autenticación
│   │   ├── domain/                 # Entidades: User, Session
│   │   ├── application/            # Use Cases: Login, Register, Logout
│   │   ├── infrastructure/         # Repositories: AuthRepo
│   │   └── presentation/           # UI: LoginForm, RegisterForm
│   │
│   ├── projects/                   # Feature: Proyectos RSL
│   │   ├── domain/                 # Entidades: Project, Protocol
│   │   ├── application/            # Use Cases: Create, Update, Delete
│   │   ├── infrastructure/         # Repositories: ProjectRepo
│   │   └── presentation/           # UI: ProjectCard, ProjectForm
│   │
│   ├── references/                 # Feature: Referencias
│   │   ├── domain/                 # Entidades: Reference
│   │   ├── application/            # Use Cases: Import, Screen, Export
│   │   ├── infrastructure/         # Repositories: ReferenceRepo
│   │   └── presentation/           # UI: ReferenceTable, ReferenceFilter
│   │
│   ├── screening/                  # Feature: Screening
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── prisma/                     # Feature: PRISMA Compliance
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   └── articles/                   # Feature: Generación de Artículos
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── presentation/
│
└── app/                            # Next.js App Router (solo routing)
    ├── (auth)/                     # Grupo de rutas autenticación
    │   ├── login/
    │   └── register/
    │
    ├── (dashboard)/                # Grupo de rutas dashboard
    │   ├── dashboard/
    │   ├── projects/
    │   ├── screening/
    │   └── settings/
    │
    ├── layout.tsx                  # Root layout
    └── page.tsx                    # Home page
```

## 🎯 Ventajas de Esta Estructura

1. **Modular por Features** - Cada feature es independiente
2. **Escalable** - Fácil agregar nuevas features
3. **Mantenible** - Código organizado y fácil de encontrar
4. **Testeable** - Cada feature puede testearse por separado
5. **Clean Architecture** - Respeta las capas y dependencias

## 🔄 Migración

Cada feature tendrá:
- ✅ Su propio dominio (entidades)
- ✅ Sus propios casos de uso
- ✅ Sus propios repositorios
- ✅ Sus propios componentes UI
- ✅ Sus propios tests

---

**Implementando en 3... 2... 1...** 🚀
