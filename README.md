# 📚 Sistema RSL - Revisión Sistemática de Literatura con IA

Sistema web para gestionar revisiones sistemáticas de literatura siguiendo la metodología PRISMA, potenciado con inteligencia artificial.

## 🏗️ Arquitectura

Este proyecto implementa **Clean Architecture** para garantizar:

- ✅ **Testeable**: Lógica de negocio independiente de frameworks
- ✅ **Mantenible**: Código organizado en capas bien definidas
- ✅ **Flexible**: Fácil cambiar tecnologías (BD, APIs, UI)
- ✅ **Escalable**: Agregar nuevas funcionalidades es directo

### Estructura del Proyecto

```
thesis-rsl-system/
├── src/                          # Clean Architecture
│   ├── domain/                   # Capa de Dominio (Entidades y Contratos)
│   │   ├── entities/             # User, Project, Reference
│   │   └── repositories/         # Interfaces de repositorios
│   │
│   ├── application/              # Capa de Aplicación (Casos de Uso)
│   │   └── use-cases/            # Lógica de negocio
│   │       ├── auth/             # Login, Register, Logout
│   │       ├── projects/         # CRUD de proyectos
│   │       └── references/       # Gestión de referencias
│   │
│   ├── infrastructure/           # Capa de Infraestructura (Implementaciones)
│   │   ├── repositories/         # LocalStorage, Supabase
│   │   └── services/             # APIs externas, AI
│   │
│   └── presentation/             # Capa de Presentación
│       └── providers/            # React Context Providers
│
├── app/                          # Next.js App Router
│   ├── dashboard/                # Dashboard principal
│   ├── login/                    # Autenticación
│   ├── projects/[id]/            # Detalle de proyecto
│   └── ...
│
├── components/                   # Componentes de UI
│   ├── auth/                     # Login, Register
│   ├── dashboard/                # Dashboard components
│   ├── screening/                # Screening de referencias
│   ├── prisma/                   # PRISMA compliance
│   └── ui/                       # Componentes base (shadcn/ui)
│
├── lib/                          # Utilidades y contextos legacy
├── hooks/                        # Custom React hooks
├── docs/                         # Documentación del proyecto
└── scripts/                      # Scripts SQL y utilidades
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd thesis-rsl-system

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🎯 Funcionalidades Principales

### ✅ Implementado

- **Autenticación**
  - Login con email/contraseña
  - Login con Google (OAuth)
  - Registro de usuarios
  - Gestión de sesiones

- **Dashboard**
  - Vista general de proyectos
  - Estadísticas
  - Creación de proyectos

- **Gestión de Proyectos**
  - Crear, editar, eliminar proyectos
  - Colaboradores
  - Estados del proyecto

### 🚧 En Desarrollo

- **Protocolo de Investigación**
  - Preguntas de investigación
  - Marco PICO
  - Criterios de inclusión/exclusión

- **Gestión de Referencias**
  - Importación masiva
  - Screening manual y con IA
  - Detección de duplicados
  - Exportación

- **PRISMA Compliance**
  - Checklist PRISMA
  - Validación con IA
  - Diagrama de flujo

- **Generación de Artículos**
  - Editor de artículo científico
  - Generación de secciones con IA
  - Control de versiones
  - Exportación a Word/LaTeX

## 🛠️ Tecnologías

### Frontend
- **Next.js 14** - React framework con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes de UI
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de schemas

### Backend (Futuro)
- **Supabase** - Base de datos PostgreSQL + Auth
- **Prisma** - ORM (alternativa)

### IA
- **OpenAI API** - GPT-4 para screening y generación
- **Anthropic Claude** - Alternativa para análisis

### Testing
- **Vitest** - Test runner
- **Testing Library** - Tests de componentes
- **Playwright** - Tests E2E

## 📖 Documentación

- [Clean Architecture](./CLEAN_ARCHITECTURE.md) - Explicación de la arquitectura
- [Guía de Migración](./MIGRATION.md) - Cómo migrar código existente
- [Requerimientos](./docs/01-requerimientos-actualizados.md) - Requerimientos del sistema
- [Historias de Usuario](./docs/03-historias-usuario-actualizadas.md) - User stories
- [Product Backlog](./docs/04-product-backlog-actualizado.md) - Backlog priorizado

## 🧪 Testing

```bash
# Ejecutar todos los tests
pnpm test

# Tests en modo watch
pnpm test:watch

# Tests de cobertura
pnpm test:coverage

# Tests E2E
pnpm test:e2e
```

## 🏗️ Build

```bash
# Build de producción
pnpm build

# Ejecutar build de producción
pnpm start

# Verificar tipos TypeScript
pnpm type-check

# Linter
pnpm lint
```

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env.local`:

```env
# Supabase (cuando se implemente)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (opcional, para IA)
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🤝 Contribuir

### Flujo de Trabajo

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Add nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Convenciones de Código

- **TypeScript**: Usar tipos explícitos
- **Nombres**: camelCase para variables, PascalCase para componentes/clases
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **Tests**: Escribir tests para nuevas funcionalidades
- **Clean Architecture**: Respetar las capas y dependencias

### Estructura de Commits

```
feat: Add user authentication
fix: Resolve project creation bug
docs: Update migration guide
test: Add tests for LoginUseCase
refactor: Simplify project repository
style: Format code with prettier
chore: Update dependencies
```

## 📝 Scripts Disponibles

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm start        # Ejecutar producción
pnpm lint         # ESLint
pnpm type-check   # TypeScript check
pnpm test         # Ejecutar tests
pnpm test:watch   # Tests en modo watch
pnpm format       # Formatear código
```

## 🐛 Reporte de Bugs

Para reportar bugs, usa GitHub Issues:

1. **Título claro**: Describe el problema brevemente
2. **Pasos para reproducir**: Lista los pasos exactos
3. **Comportamiento esperado**: Qué debería pasar
4. **Comportamiento actual**: Qué está pasando
5. **Screenshots**: Si aplica
6. **Entorno**: SO, navegador, versión de Node

## 📄 Licencia

Este proyecto es parte de una tesis de grado de la Universidad de las Fuerzas Armadas ESPE.

## 👥 Autores

- **Estudiante** - Universidad de las Fuerzas Armadas ESPE
- **Director de Tesis** - [Nombre]

## 🙏 Agradecimientos

- Universidad de las Fuerzas Armadas ESPE
- Comunidad de Next.js
- Comunidad de Clean Architecture
- shadcn/ui por los componentes

## 📞 Contacto

Para consultas sobre el proyecto: [email]

---

**Desarrollado con ❤️ usando Clean Architecture y Next.js**
#   T e s i s _ R S L  
 