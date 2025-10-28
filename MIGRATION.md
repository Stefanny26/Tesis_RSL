# Guía de Migración a Clean Architecture

## 🎯 Estado Actual

✅ **Completado:**
- Estructura base de Clean Architecture creada
- Entidades del dominio: `User`, `Project`, `Reference`
- Interfaces de repositorios: `IAuthRepository`, `IProjectRepository`, `IReferenceRepository`
- Casos de uso de autenticación implementados
- Repositorios de infraestructura: `LocalStorageAuthRepository`, `InMemoryProjectRepository`
- `lib/auth-context.tsx` migrado a Clean Architecture (sin romper compatibilidad)

⏳ **Pendiente:**
- Migrar gestión de proyectos
- Migrar gestión de referencias
- Migrar screening y PRISMA
- Agregar tests unitarios
- Implementar integración con Supabase
- Agregar value objects para validaciones avanzadas

## 📋 Pasos para Continuar la Migración

### 1. Migrar Proyectos (Alta Prioridad)

#### 1.1 Crear Casos de Uso para Proyectos

Crear en `src/application/use-cases/projects/`:

```typescript
// CreateProjectUseCase.ts
export class CreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}
  
  async execute(data: CreateProjectDTO): Promise<Project> {
    // Validaciones de negocio
    // Llamar al repositorio
  }
}

// GetProjectsUseCase.ts
// GetProjectByIdUseCase.ts
// UpdateProjectUseCase.ts
// DeleteProjectUseCase.ts
// AddCollaboratorUseCase.ts
```

#### 1.2 Actualizar Componentes

- `components/dashboard/create-project-dialog.tsx` → Usar `CreateProjectUseCase`
- `components/dashboard/project-card.tsx` → Mostrar datos de la entidad `Project`
- `app/dashboard/page.tsx` → Usar `GetProjectsUseCase`

### 2. Migrar Referencias (Alta Prioridad)

#### 2.1 Crear Implementación del Repositorio

```typescript
// src/infrastructure/repositories/InMemoryReferenceRepository.ts
export class InMemoryReferenceRepository implements IReferenceRepository {
  // Implementar usando mockReferences de lib/mock-references.ts
}
```

#### 2.2 Crear Casos de Uso

Crear en `src/application/use-cases/references/`:

```typescript
// ImportReferencesUseCase.ts
// GetReferencesByProjectUseCase.ts
// UpdateReferenceStatusUseCase.ts
// SearchReferencesUseCase.ts
// ExportReferencesUseCase.ts
```

#### 2.3 Actualizar Componentes

- `components/screening/reference-table.tsx` → Usar casos de uso
- `components/screening/ai-screening-panel.tsx` → Usar casos de uso

### 3. Migrar Protocolo y PRISMA (Media Prioridad)

#### 3.1 Crear Entidades Adicionales

```typescript
// src/domain/entities/Protocol.ts
// src/domain/entities/PrismaItem.ts
```

#### 3.2 Crear Repositorios e Interfaces

```typescript
// src/domain/repositories/IProtocolRepository.ts
// src/infrastructure/repositories/InMemoryProtocolRepository.ts
```

#### 3.3 Crear Casos de Uso

```typescript
// src/application/use-cases/protocol/CreateProtocolUseCase.ts
// src/application/use-cases/protocol/UpdateProtocolUseCase.ts
// src/application/use-cases/prisma/ValidatePrismaComplianceUseCase.ts
```

### 4. Servicios Externos (Media Prioridad)

#### 4.1 Crear Interfaces de Servicios

```typescript
// src/domain/services/IAIService.ts
export interface IAIService {
  generateScreeningSuggestion(reference: Reference): Promise<string>
  validatePrismaItem(item: PrismaItem): Promise<ValidationResult>
  generateArticleSection(context: ArticleContext): Promise<string>
}
```

#### 4.2 Implementar Adaptadores

```typescript
// src/infrastructure/services/OpenAIService.ts
export class OpenAIService implements IAIService {
  // Implementación con OpenAI API
}

// src/infrastructure/services/MockAIService.ts
export class MockAIService implements IAIService {
  // Implementación mock para desarrollo
}
```

### 5. Integración con Supabase (Alta Prioridad)

#### 5.1 Instalar Dependencias

```bash
pnpm add @supabase/supabase-js
```

#### 5.2 Crear Cliente de Supabase

```typescript
// src/infrastructure/database/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

#### 5.3 Implementar Repositorios con Supabase

```typescript
// src/infrastructure/repositories/SupabaseAuthRepository.ts
export class SupabaseAuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })
    
    if (error) throw error
    
    // Convertir a entidad del dominio
    return this.mapToUser(data.user)
  }
  
  async loginWithGoogle(): Promise<User> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    
    if (error) throw error
    return this.mapToUser(data.user)
  }
  
  // ... otros métodos
}
```

#### 5.4 Actualizar el Provider

```typescript
// lib/auth-context.tsx
// Cambiar de LocalStorageAuthRepository a SupabaseAuthRepository
const authRepository = new SupabaseAuthRepository()
```

### 6. Testing (Alta Prioridad)

#### 6.1 Instalar Dependencias de Testing

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

#### 6.2 Crear Tests para Entidades

```typescript
// src/domain/entities/__tests__/User.test.ts
describe('User Entity', () => {
  it('should create a valid user', () => {
    const user = new User({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'researcher',
    })
    
    expect(user.email).toBe('test@example.com')
    expect(user.canCreateProject()).toBe(true)
  })
  
  it('should throw error for invalid email', () => {
    expect(() => {
      new User({
        id: '1',
        email: 'invalid-email',
        name: 'Test',
        role: 'researcher',
      })
    }).toThrow('Valid email is required')
  })
})
```

#### 6.3 Crear Tests para Casos de Uso

```typescript
// src/application/use-cases/auth/__tests__/LoginUseCase.test.ts
describe('LoginUseCase', () => {
  it('should login user with valid credentials', async () => {
    const mockRepo = new MockAuthRepository()
    const useCase = new LoginUseCase(mockRepo)
    
    const user = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
    })
    
    expect(user.email).toBe('test@example.com')
  })
  
  it('should throw error for empty email', async () => {
    const mockRepo = new MockAuthRepository()
    const useCase = new LoginUseCase(mockRepo)
    
    await expect(
      useCase.execute({ email: '', password: 'pass' })
    ).rejects.toThrow('El email es requerido')
  })
})
```

#### 6.4 Crear Mock Repositories para Testing

```typescript
// src/infrastructure/repositories/__mocks__/MockAuthRepository.ts
export class MockAuthRepository implements IAuthRepository {
  private users: User[] = []
  
  async login(credentials: LoginCredentials): Promise<User> {
    const user = this.users.find(u => u.email === credentials.email)
    if (!user) throw new Error('User not found')
    return user
  }
  
  // ... otros métodos mock
}
```

### 7. Value Objects (Media Prioridad)

Crear objetos de valor para validaciones más robustas:

```typescript
// src/domain/value-objects/Email.ts
export class Email {
  private readonly value: string
  
  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format')
    }
    this.value = email
  }
  
  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
  
  toString(): string {
    return this.value
  }
}

// src/domain/value-objects/Password.ts
export class Password {
  private readonly value: string
  
  constructor(password: string) {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }
    this.value = password
  }
  
  toString(): string {
    return this.value
  }
}
```

## 🔄 Proceso de Migración Recomendado

### Para Cada Feature:

1. **Identificar Dependencias**
   - ¿Qué componentes usa?
   - ¿Qué datos necesita?
   - ¿Qué operaciones realiza?

2. **Crear Entidades del Dominio**
   - Definir propiedades
   - Agregar validaciones
   - Agregar métodos de negocio

3. **Crear Interfaces de Repositorio**
   - Definir operaciones CRUD
   - Definir operaciones de búsqueda

4. **Implementar Repositorio**
   - Empezar con InMemory/LocalStorage
   - Luego migrar a Supabase

5. **Crear Casos de Uso**
   - Un caso de uso por operación
   - Agregar validaciones de negocio
   - Mantener casos de uso simples y enfocados

6. **Actualizar Componentes**
   - Instanciar repositorios y casos de uso
   - Reemplazar lógica directa por llamadas a casos de uso
   - Mantener componentes agnósticos del origen de datos

7. **Escribir Tests**
   - Tests unitarios para entidades
   - Tests unitarios para casos de uso
   - Tests de integración para repositorios

8. **Validar**
   - Verificar que la funcionalidad sigue funcionando
   - Verificar que no hay regresiones
   - Validar con el usuario final

## 📝 Checklist de Migración

### Por Feature:

- [ ] Entidad del dominio creada
- [ ] Interface de repositorio definida
- [ ] Repositorio implementado (mock/real)
- [ ] Casos de uso creados
- [ ] Componentes actualizados
- [ ] Tests escritos
- [ ] Documentación actualizada
- [ ] Code review completado
- [ ] Funcionalidad validada

### Features Pendientes:

#### Gestión de Proyectos
- [ ] CreateProject
- [ ] UpdateProject
- [ ] DeleteProject
- [ ] GetProjects
- [ ] AddCollaborator
- [ ] RemoveCollaborator

#### Gestión de Referencias
- [ ] ImportReferences
- [ ] UpdateReferenceStatus
- [ ] SearchReferences
- [ ] ExportReferences
- [ ] DetectDuplicates

#### Screening
- [ ] ScreenReference
- [ ] BulkScreening
- [ ] AIScreeningSuggestion
- [ ] ApplyFilters

#### Protocolo
- [ ] CreateProtocol
- [ ] UpdateProtocol
- [ ] ValidateProtocol

#### PRISMA
- [ ] UpdatePrismaItem
- [ ] ValidatePrismaCompliance
- [ ] GeneratePrismaReport

#### Exportación
- [ ] ExportArticle
- [ ] ExportReferences
- [ ] GeneratePrismaFlowDiagram
- [ ] GenerateProjectReport

#### Artículo
- [ ] CreateArticle
- [ ] UpdateArticleSection
- [ ] GenerateWithAI
- [ ] ManageVersions

## 🚀 Comandos Útiles

### Desarrollo
```bash
# Iniciar servidor de desarrollo
pnpm dev

# Verificar tipos TypeScript
pnpm tsc --noEmit

# Ejecutar linter
pnpm lint

# Ejecutar tests
pnpm test

# Ejecutar tests en modo watch
pnpm test:watch
```

### Build
```bash
# Build de producción
pnpm build

# Iniciar en producción
pnpm start
```

## 📚 Recursos Adicionales

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Testing Clean Architecture](https://www.jamesshore.com/v2/projects/nullables/testing-without-mocks)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## ❓ Preguntas Frecuentes

### ¿Por qué usar Clean Architecture?

- **Testeable**: Puedes testear la lógica de negocio sin UI o BD
- **Mantenible**: Código organizado y fácil de entender
- **Flexible**: Fácil cambiar de BD, framework o servicio externo
- **Escalable**: Agregar nuevas features es directo

### ¿Cuándo NO usar Clean Architecture?

- Proyectos muy pequeños (< 5 pantallas)
- Prototipos rápidos
- Proyectos con deadline muy ajustado
- Cuando el equipo no está familiarizado (requiere capacitación)

### ¿Cómo convencer al equipo?

- Mostrar tests automatizados funcionando
- Demostrar facilidad de cambiar de BD (LocalStorage → Supabase)
- Mostrar facilidad de agregar nuevas features
- Comparar mantenibilidad con código "legacy"

## 🎯 Próximos Pasos Inmediatos

1. **Terminar migración de Auth** ✅ (Completado)
2. **Migrar gestión de Proyectos** ← Siguiente
3. **Migrar gestión de Referencias**
4. **Agregar tests unitarios básicos**
5. **Implementar Supabase**
6. **Migrar features avanzadas (AI, PRISMA, Export)**

---

**Última actualización**: 27 de Octubre, 2025
**Autor**: Sistema de Migración Clean Architecture
**Versión**: 1.0.0
