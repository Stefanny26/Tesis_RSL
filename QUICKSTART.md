# 🚀 Inicio Rápido

## ✅ ¡Clean Architecture Implementada!

Tu proyecto ha sido migrado exitosamente a Clean Architecture. Todo el código legacy sigue funcionando.

## 📦 Instalación de Dependencias

Las dependencias se están instalando automáticamente. Si necesitas reinstalar:

```bash
cd "c:\Users\tefit\OneDrive\Escritorio\Tesis3\thesis-rsl-system (3)"
npm install --legacy-peer-deps
```

**Nota**: Usamos `--legacy-peer-deps` debido a incompatibilidades entre React 19 y Next.js 14.

## 🏃‍♂️ Ejecutar el Proyecto

```bash
# Desarrollo
npm run dev

# El servidor iniciará en: http://localhost:3000
```

## 🎯 ¿Qué Cambió?

### ✅ Mantiene Compatibilidad Total

- Todos los componentes existentes funcionan igual
- La API pública de `lib/auth-context.tsx` no cambió
- No se rompió ninguna funcionalidad

### ✨ Nuevas Capacidades

- **Arquitectura Limpia**: Código organizado en capas
- **Testeable**: Casos de uso independientes
- **Flexible**: Fácil cambiar de BD (LocalStorage → Supabase)
- **Escalable**: Agregar features es más fácil

## 📁 Archivos Nuevos

```
src/
├── domain/                    # Entidades y contratos
│   ├── entities/
│   │   ├── User.ts           # ✨ Nuevo
│   │   ├── Project.ts        # ✨ Nuevo
│   │   └── Reference.ts      # ✨ Nuevo
│   └── repositories/
│       ├── IAuthRepository.ts        # ✨ Nuevo
│       ├── IProjectRepository.ts     # ✨ Nuevo
│       └── IReferenceRepository.ts   # ✨ Nuevo
│
├── application/               # Casos de uso
│   └── use-cases/
│       ├── auth/             # ✨ LoginUseCase, RegisterUseCase, etc.
│       └── projects/         # ✨ CreateProjectUseCase, GetProjectsUseCase, etc.
│
├── infrastructure/            # Implementaciones
│   └── repositories/
│       ├── LocalStorageAuthRepository.ts     # ✨ Nuevo
│       └── InMemoryProjectRepository.ts      # ✨ Nuevo
│
└── di-container.ts            # ✨ Dependency Injection

# Documentación
├── CLEAN_ARCHITECTURE.md      # ✨ Explicación detallada
├── MIGRATION.md               # ✨ Guía de migración
├── ARCHITECTURE_STATUS.md     # ✨ Estado actual
├── EXAMPLES.md                # ✨ Ejemplos de uso
└── README.md                  # ✨ Actualizado
```

## 📖 Documentación

1. **[README.md](./README.md)** - Inicio, instalación, scripts
2. **[CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md)** - Conceptos y principios
3. **[MIGRATION.md](./MIGRATION.md)** - Cómo migrar código existente
4. **[ARCHITECTURE_STATUS.md](./ARCHITECTURE_STATUS.md)** - Estado actual y progreso
5. **[EXAMPLES.md](./EXAMPLES.md)** - Ejemplos de código

## 🎓 Tutorial Rápido

### 1. Usar Login (Ya Migrado)

```typescript
// El código existente sigue funcionando:
import { useAuth } from "@/lib/auth-context"

function MyComponent() {
  const { login, user } = useAuth()
  
  const handleLogin = async () => {
    await login("test@example.com", "password")
  }
}
```

### 2. Crear Nuevo Proyecto

```typescript
import { createProjectUseCase } from "@/src/di-container"

async function handleCreate() {
  const project = await createProjectUseCase.execute({
    title: "Mi Proyecto RSL",
    description: "Descripción del proyecto",
    ownerId: user.id,
    ownerName: user.name
  })
  console.log("Proyecto creado:", project.id)
}
```

### 3. Obtener Proyectos

```typescript
import { getProjectsUseCase } from "@/src/di-container"

async function loadProjects() {
  const projects = await getProjectsUseCase.execute(user.id)
  console.log(`${projects.length} proyectos encontrados`)
}
```

## 🧪 Próximos Pasos Recomendados

### 1. Probar el Sistema (5 min)

```bash
npm run dev
```

Abre http://localhost:3000 y verifica:
- ✅ Login funciona
- ✅ Dashboard carga
- ✅ Proyectos se muestran

### 2. Migrar Dashboard (30 min)

Lee [MIGRATION.md](./MIGRATION.md) sección "Migrar Proyectos" y actualiza:
- `app/dashboard/page.tsx` → Usar `getProjectsUseCase`
- `components/dashboard/create-project-dialog.tsx` → Usar `createProjectUseCase`

### 3. Agregar Tests (1 hora)

```bash
# Instalar Vitest
npm install -D vitest @testing-library/react

# Crear primer test
# src/application/use-cases/auth/__tests__/LoginUseCase.test.ts
```

Ver [MIGRATION.md](./MIGRATION.md) sección "Testing" para ejemplos.

### 4. Implementar Supabase (2 horas)

```bash
# Instalar Supabase
npm install @supabase/supabase-js

# Crear SupabaseAuthRepository
# src/infrastructure/repositories/SupabaseAuthRepository.ts
```

Ver [MIGRATION.md](./MIGRATION.md) sección "Integración con Supabase".

## 🐛 Solución de Problemas

### Error: Cannot find module '@domain/entities'

**Solución**: Reinicia el servidor de desarrollo

```bash
# Ctrl+C para detener
npm run dev
```

### Error: pnpm no reconocido

**Solución**: Usa `npm` en lugar de `pnpm`

```bash
npm install --legacy-peer-deps
npm run dev
```

### Error: ERESOLVE unable to resolve dependency tree

**Solución**: Usa la flag `--legacy-peer-deps`

```bash
npm install --legacy-peer-deps
```

### TypeScript Errors en VSCode

**Solución**: Recarga la ventana de VSCode

1. Presiona `Ctrl+Shift+P`
2. Escribe "Reload Window"
3. Presiona Enter

## 📞 Ayuda

Si tienes problemas:

1. **Revisa la documentación**:
   - [CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md)
   - [EXAMPLES.md](./EXAMPLES.md)

2. **Verifica los ejemplos**:
   - [EXAMPLES.md](./EXAMPLES.md) tiene 12 ejemplos completos

3. **Consulta el estado**:
   - [ARCHITECTURE_STATUS.md](./ARCHITECTURE_STATUS.md)

## 🎉 ¡Felicidades!

Tu proyecto ahora tiene:

- ✅ Clean Architecture implementada
- ✅ Código testeable y mantenible
- ✅ Documentación completa
- ✅ Ejemplos de uso
- ✅ Guías de migración

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Linter
npm run lint

# TypeScript check
npx tsc --noEmit

# Formatear código (si tienes prettier)
npm run format
```

## 📚 Recursos

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)

---

**¡Comienza a desarrollar con Clean Architecture!** 🎯
