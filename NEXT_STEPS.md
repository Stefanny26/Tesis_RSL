# 🎯 Próximos Pasos - Migración Completa

## 📋 Resumen del Estado Actual

✅ **Fase 1 Completada**: Estructura base de Clean Architecture implementada
- Core, Shared, y 3 Features (Auth, Projects, References) funcionando
- Sistema de navegación completo con Sidebar, TopBar, Breadcrumbs
- Layouts reutilizables (MainLayout, ProjectLayout)
- Servidor compilando sin errores

## 🚀 Fase 2: Migrar Páginas Existentes

### 1. Dashboard Principal

**Archivo**: `app/dashboard/page.tsx`

```typescript
// ACTUALIZAR ESTE ARCHIVO
import { MainLayout } from '@/src/shared/presentation/layouts/main-layout';

export default function DashboardPage() {
  return (
    <MainLayout>
      {/* Mover el contenido actual aquí */}
    </MainLayout>
  );
}
```

**Archivos a actualizar**:
- `app/dashboard/page.tsx` ⏳
- `app/dashboard/layout.tsx` ⏳ (Simplificar)

### 2. Páginas de Proyectos

**Archivos**: `app/projects/[id]/*`

```typescript
// app/projects/[id]/page.tsx
import { ProjectLayout } from '@/src/shared/presentation/layouts/project-layout';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProjectLayout projectId={params.id}>
      {/* Contenido */}
    </ProjectLayout>
  );
}
```

**Archivos a actualizar**:
- `app/projects/page.tsx` ⏳
- `app/projects/[id]/page.tsx` ⏳
- `app/projects/[id]/protocol/page.tsx` ⏳
- `app/projects/[id]/references/page.tsx` ⏳
- `app/projects/[id]/screening/page.tsx` ⏳
- `app/projects/[id]/prisma/page.tsx` ⏳
- `app/projects/[id]/articles/page.tsx` ⏳

## 🏗️ Fase 3: Crear Features Faltantes

### Feature: Screening

```bash
# Estructura a crear
src/features/screening/
├── domain/
│   ├── entities/
│   │   ├── ScreeningDecision.ts
│   │   └── index.ts
│   └── repositories/
│       ├── IScreeningRepository.ts
│       └── index.ts
├── application/
│   └── use-cases/
│       ├── ScreenReferenceUseCase.ts
│       ├── GetScreeningProgressUseCase.ts
│       └── index.ts
├── infrastructure/
│   └── repositories/
│       ├── PrismaScreeningRepository.ts
│       └── index.ts
└── index.ts
```

**Componentes a migrar**:
- `components/screening/*` → `src/features/screening/presentation/components/`

### Feature: PRISMA

```bash
src/features/prisma/
├── domain/
│   ├── entities/
│   │   ├── PrismaFlow.ts
│   │   └── index.ts
│   └── repositories/
│       ├── IPrismaRepository.ts
│       └── index.ts
├── application/
│   └── use-cases/
│       ├── GeneratePrismaFlowUseCase.ts
│       └── index.ts
├── infrastructure/
│   └── repositories/
│       └── PrismaPrismaRepository.ts
└── index.ts
```

**Componentes a migrar**:
- `components/prisma/*` → `src/features/prisma/presentation/components/`

### Feature: Protocol

```bash
src/features/protocol/
├── domain/
│   ├── entities/
│   │   ├── Protocol.ts
│   │   ├── ResearchQuestion.ts
│   │   ├── InclusionCriteria.ts
│   │   └── index.ts
│   └── repositories/
│       ├── IProtocolRepository.ts
│       └── index.ts
├── application/
│   └── use-cases/
│       ├── CreateProtocolUseCase.ts
│       ├── UpdateProtocolUseCase.ts
│       └── index.ts
└── index.ts
```

### Feature: Articles

```bash
src/features/articles/
├── domain/
│   ├── entities/
│   │   ├── Article.ts
│   │   ├── ArticleSection.ts
│   │   └── index.ts
│   └── repositories/
│       ├── IArticleRepository.ts
│       └── index.ts
├── application/
│   └── use-cases/
│       ├── GenerateArticleUseCase.ts
│       ├── ExportArticleUseCase.ts
│       └── index.ts
└── index.ts
```

### Feature: Dashboard

```bash
src/features/dashboard/
├── domain/
│   ├── entities/
│   │   ├── DashboardStats.ts
│   │   └── index.ts
│   └── repositories/
│       ├── IDashboardRepository.ts
│       └── index.ts
├── application/
│   └── use-cases/
│       ├── GetDashboardStatsUseCase.ts
│       └── index.ts
├── presentation/
│   └── components/
│       ├── stats-card.tsx
│       ├── recent-projects.tsx
│       └── activity-feed.tsx
└── index.ts
```

**Componentes a migrar**:
- `components/dashboard/*` → `src/features/dashboard/presentation/components/`

## 🔄 Fase 4: Actualizar DI Container

Después de crear cada feature, actualizar `src/di-container.ts`:

```typescript
// Agregar imports
import { IScreeningRepository } from './features/screening/domain/repositories/IScreeningRepository';
import { PrismaScreeningRepository } from './features/screening/infrastructure/repositories/PrismaScreeningRepository';
import { ScreenReferenceUseCase } from './features/screening/application/use-cases';

// Instanciar repositorio
export const screeningRepository: IScreeningRepository = new PrismaScreeningRepository();

// Instanciar use cases
export const screenReferenceUseCase = new ScreenReferenceUseCase(screeningRepository);
```

## 🧹 Fase 5: Limpieza

Una vez todo migrado:

### 1. Eliminar carpetas antiguas
```bash
# Cuando esté todo migrado
rm -rf src/domain/       # Ya no se usa
rm -rf src/application/  # Ya no se usa
rm -rf src/infrastructure/  # Ya no se usa
rm -rf components/auth/  # Migrado a features
rm -rf components/dashboard/  # Migrado a features
# etc.
```

### 2. Actualizar imports obsoletos
Buscar y reemplazar en todo el proyecto:
- `@domain/*` → Rutas específicas de features
- `@application/*` → Rutas específicas de features
- `@infrastructure/*` → Rutas específicas de features

### 3. Eliminar código no usado
- Componentes duplicados
- Hooks antiguos
- Utilidades obsoletas

## 📝 Checklist de Migración

### Features
- [ ] Screening feature completo
- [ ] PRISMA feature completo
- [ ] Protocol feature completo
- [ ] Articles feature completo
- [ ] Dashboard feature completo

### Páginas
- [ ] `/dashboard` usando MainLayout
- [ ] `/projects` usando MainLayout
- [ ] `/projects/[id]` usando ProjectLayout
- [ ] `/projects/[id]/protocol` usando ProjectLayout
- [ ] `/projects/[id]/references` usando ProjectLayout
- [ ] `/projects/[id]/screening` usando ProjectLayout
- [ ] `/projects/[id]/prisma` usando ProjectLayout
- [ ] `/projects/[id]/articles` usando ProjectLayout
- [ ] `/settings` usando MainLayout

### Componentes
- [ ] Migrar `components/dashboard/*`
- [ ] Migrar `components/screening/*`
- [ ] Migrar `components/prisma/*`
- [ ] Migrar `components/protocol/*`
- [ ] Migrar `components/references/*`
- [ ] Migrar `components/articles/*`

### Limpieza
- [ ] Eliminar `src/domain/` antiguo
- [ ] Eliminar `src/application/` antiguo
- [ ] Eliminar `src/infrastructure/` antiguo
- [ ] Eliminar `components/` antiguo
- [ ] Actualizar todos los imports
- [ ] Verificar que no hay código duplicado

### Testing
- [ ] Todos los use cases tienen tests
- [ ] Componentes principales tienen tests
- [ ] Layouts tienen tests
- [ ] E2E tests actualizados

### Documentación
- [ ] Actualizar README.md
- [ ] Documentar cada feature
- [ ] Ejemplos de uso
- [ ] Guía de contribución

## 🎯 Orden Recomendado

1. **Semana 1**: Dashboard Feature + Migrar página dashboard
2. **Semana 2**: Screening Feature + Migrar páginas screening
3. **Semana 3**: Protocol Feature + Migrar páginas protocol
4. **Semana 4**: PRISMA Feature + Migrar páginas PRISMA
5. **Semana 5**: Articles Feature + Migrar páginas articles
6. **Semana 6**: Limpieza final + Testing + Documentación

## 💡 Tips

1. **Migra de a uno**: No intentes migrar todo a la vez
2. **Testea cada paso**: Verifica que el servidor compile después de cada cambio
3. **Mantén compatibilidad**: No rompas funcionalidad existente
4. **Documenta**: Actualiza docs mientras migras
5. **Usa Git**: Commits pequeños y frecuentes

## 🆘 Si Algo Sale Mal

1. **Servidor no compila**:
   ```bash
   npm run build
   # Ver errores específicos
   ```

2. **Imports no se resuelven**:
   - Verificar `tsconfig.json` paths
   - Verificar rutas relativas
   - Reiniciar VS Code

3. **Components no se encuentran**:
   - Verificar barrel exports (index.ts)
   - Verificar nombres de archivos
   - Verificar mayúsculas/minúsculas

## 📚 Recursos

- **CLEAN_ARCHITECTURE_GUIDE.md** - Guía de uso
- **IMPLEMENTATION_COMPLETE.md** - Estado actual
- **Ejemplo funcional**: `app/dashboard-example/page.tsx`

---

**¡Éxito con la migración!** 🚀

Si tienes dudas sobre algún paso, consulta los archivos de ejemplo o la documentación.
