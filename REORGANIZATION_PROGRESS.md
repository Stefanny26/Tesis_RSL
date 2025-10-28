# 🚀 Progreso de Reorganización - Clean Architecture

## ✅ Completado

### Core & Shared
- ✅ `src/core/constants/routes.ts` - Rutas centralizadas
- ✅ `src/core/constants/app.ts` - Constantes de aplicación
- ✅ `src/core/types/common.ts` - Tipos compartidos
- ✅ `src/core/config/index.ts` - Configuración central
- ✅ `src/core/config/navigation.ts` - Configuración de navegación

### Componentes Compartidos (Shared/Presentation)
- ✅ `src/shared/presentation/components/sidebar/sidebar.tsx` - Sidebar principal
- ✅ `src/shared/presentation/components/sidebar/sidebar-item.tsx` - Items del sidebar
- ✅ `src/shared/presentation/components/breadcrumbs.tsx` - Breadcrumbs de navegación
- ✅ `src/shared/presentation/components/top-bar.tsx` - Barra superior con usuario

### Layouts
- ✅ `src/shared/presentation/layouts/main-layout.tsx` - Layout principal
- ✅ `src/shared/presentation/layouts/project-layout.tsx` - Layout de proyecto

### Features Creados

#### 🔐 Auth Feature
```
src/features/auth/
├── domain/
│   ├── entities/
│   │   ├── User.ts ✅
│   │   └── index.ts ✅
│   └── repositories/
│       ├── IAuthRepository.ts ✅
│       └── index.ts ✅
├── application/
│   └── use-cases/
│       ├── LoginUseCase.ts ✅
│       ├── RegisterUseCase.ts ✅
│       ├── LogoutUseCase.ts ✅
│       ├── LoginWithGoogleUseCase.ts ✅
│       ├── GetCurrentUserUseCase.ts ✅
│       └── index.ts ✅
├── infrastructure/
│   └── repositories/
│       ├── LocalStorageAuthRepository.ts ✅
│       ├── PrismaAuthRepository.ts ✅
│       └── index.ts ✅
├── presentation/
│   └── components/
│       ├── login-form.tsx ✅
│       └── register-form.tsx ✅
└── index.ts ✅ (Barrel export)
```

#### 📁 Projects Feature
```
src/features/projects/
├── domain/
│   ├── entities/
│   │   ├── Project.ts ✅
│   │   └── index.ts ✅
│   └── repositories/
│       ├── IProjectRepository.ts ✅
│       └── index.ts ✅
├── application/
│   └── use-cases/
│       ├── CreateProjectUseCase.ts ✅
│       ├── GetProjectsUseCase.ts ✅
│       ├── GetProjectByIdUseCase.ts ✅
│       └── index.ts ❌ (Falta crear)
├── infrastructure/
│   └── repositories/
│       ├── InMemoryProjectRepository.ts ✅
│       ├── PrismaProjectRepository.ts ✅
│       └── index.ts ✅
└── index.ts ✅ (Barrel export)
```

#### 📚 References Feature
```
src/features/references/
├── domain/
│   ├── entities/
│   │   ├── Reference.ts ✅
│   │   └── index.ts ✅
│   └── repositories/
│       ├── IReferenceRepository.ts ✅
│       └── index.ts ✅
└── index.ts ✅ (Barrel export)
```

### Configuración
- ✅ `tsconfig.json` actualizado con nuevos path aliases:
  - `@core/*`
  - `@shared/*`
  - `@features/*`

## ⚠️ Problemas Detectados

### TypeScript Errors
1. **Imports duplicados**: Los use cases y repositorios en `src/features/` están importando de `@domain/*` en lugar de usar las entidades locales del feature.
   
2. **Conflicto de tipos**: Hay dos copias de cada entidad (en `src/domain/` y en `src/features/*/domain/`), causando errores de compatibilidad de tipos.

### Solución Requerida
1. Actualizar imports en:
   - `src/features/auth/application/use-cases/*` → usar `@features/auth/domain/entities`
   - `src/features/auth/infrastructure/repositories/*` → usar `@features/auth/domain/entities`
   - `src/features/projects/application/use-cases/*` → usar `@features/projects/domain/entities`
   - `src/features/projects/infrastructure/repositories/*` → usar `@features/projects/domain/entities`

2. Actualizar `src/di-container.ts` para usar imports de features

3. Actualizar `lib/auth-context.tsx` para usar imports de features

## 📋 Pendientes

### Features por Crear
- ⏳ `src/features/screening/` - Feature de screening
- ⏳ `src/features/prisma/` - Feature de PRISMA compliance
- ⏳ `src/features/protocol/` - Feature de protocolo
- ⏳ `src/features/articles/` - Feature de generación de artículos
- ⏳ `src/features/dashboard/` - Feature de dashboard

### Componentes por Migrar
- ⏳ `components/dashboard/*` → `src/features/dashboard/presentation/components/`
- ⏳ `components/screening/*` → `src/features/screening/presentation/components/`
- ⏳ `components/prisma/*` → `src/features/prisma/presentation/components/`

### Actualizar Imports
- ⏳ Actualizar `app/*` para usar nuevos layouts
- ⏳ Actualizar referencias en todos los archivos

## 🎯 Siguiente Paso

**PRIORIDAD 1**: Arreglar imports en features existentes para eliminar conflictos de tipos:
1. Actualizar imports en use cases de auth
2. Actualizar imports en repositorios de auth
3. Actualizar imports en use cases de projects
4. Actualizar imports en repositorios de projects
5. Crear barrel export faltante en projects/application/use-cases
6. Testear que el servidor compile sin errores

---

**Última actualización**: Reorganización en progreso
**Estado**: 3 features básicos creados, pendientes ajustes de imports
