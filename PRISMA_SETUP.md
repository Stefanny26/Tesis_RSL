# 🗄️ Configuración de PostgreSQL + Prisma ORM

## ✅ ¿Qué se implementó?

- ✅ **Prisma ORM** - ORM moderno para TypeScript
- ✅ **Esquema completo** - 8 modelos (User, Project, Protocol, Reference, etc.)
- ✅ **Repositorios Prisma** - `PrismaAuthRepository` y `PrismaProjectRepository`
- ✅ **Clean Architecture** - Integración completa

---

## 📦 Paso 1: Instalar Dependencias

```bash
cd "c:\Users\tefit\OneDrive\Escritorio\Tesis3\thesis-rsl-system (3)"

# Instalar Prisma y bcrypt
npm install --legacy-peer-deps prisma @prisma/client bcryptjs
npm install --legacy-peer-deps -D @types/bcryptjs
```

---

## 🐘 Paso 2: Configurar PostgreSQL

### Opción A: PostgreSQL Local

#### Descargar e Instalar PostgreSQL
1. Descarga desde: https://www.postgresql.org/download/windows/
2. Instala PostgreSQL 15 o superior
3. Durante instalación, configura:
   - Usuario: `postgres`
   - Contraseña: `postgres` (o la que prefieras)
   - Puerto: `5432` (default)

#### Crear Base de Datos
```bash
# Abrir PowerShell
psql -U postgres

# En el prompt de PostgreSQL:
CREATE DATABASE rsl_system;
\q
```

### Opción B: PostgreSQL con Docker (Recomendado)

```bash
# Crear contenedor PostgreSQL
docker run --name rsl-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=rsl_system `
  -p 5432:5432 `
  -d postgres:15

# Verificar que está corriendo
docker ps
```

### Opción C: Supabase (Cloud - Gratis)

1. Ve a https://supabase.com
2. Crea nuevo proyecto
3. Copia el "Connection string" en Settings > Database
4. Usa esa URL en tu `.env.local`

---

## ⚙️ Paso 3: Configurar Variables de Entorno

Crea el archivo `.env.local`:

```bash
# Copiar desde .env.example
copy .env.example .env.local
```

Edita `.env.local` y configura tu conexión:

### Para PostgreSQL Local:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rsl_system?schema=public"
```

### Para Docker:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rsl_system?schema=public"
```

### Para Supabase:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
```

---

## 🚀 Paso 4: Inicializar Prisma

```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear las tablas en la base de datos
npx prisma db push

# O usar migraciones (recomendado para producción)
npx prisma migrate dev --name init
```

---

## 📊 Paso 5: Poblar con Datos de Prueba (Opcional)

Crea el archivo `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Crear usuarios
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@espe.edu.ec' },
    update: {},
    create: {
      email: 'admin@espe.edu.ec',
      fullName: 'Administrador Sistema',
      passwordHash: adminPassword,
      role: 'Administrador',
      institution: 'Universidad de las Fuerzas Armadas ESPE',
    },
  })

  const researcher = await prisma.user.upsert({
    where: { email: 'investigador@espe.edu.ec' },
    update: {},
    create: {
      email: 'investigador@espe.edu.ec',
      fullName: 'Juan Pérez',
      passwordHash: userPassword,
      role: 'Investigador',
      institution: 'Universidad de las Fuerzas Armadas ESPE',
    },
  })

  // Crear proyecto de ejemplo
  const project = await prisma.project.create({
    data: {
      title: 'Inteligencia Artificial en Educación Superior',
      description: 'Revisión sistemática sobre el impacto de la IA',
      status: 'EnProgreso',
      ownerId: researcher.id,
      totalReferences: 245,
      screenedReferences: 180,
      includedReferences: 45,
      excludedReferences: 135,
      prismaCompliancePercentage: 78.5,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log({ admin, researcher, project })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Agregar al `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Ejecutar seed:
```bash
npm install --legacy-peer-deps -D ts-node
npx prisma db seed
```

---

## 🔄 Paso 6: Actualizar DI Container

Edita `src/di-container.ts`:

```typescript
import { PrismaAuthRepository } from "@infrastructure/repositories/PrismaAuthRepository"
import { PrismaProjectRepository } from "@infrastructure/repositories/PrismaProjectRepository"

// Comentar o eliminar LocalStorage/InMemory
// export const authRepository = new LocalStorageAuthRepository()
// export const projectRepository = new InMemoryProjectRepository()

// Usar Prisma
export const authRepository = new PrismaAuthRepository()
export const projectRepository = new PrismaProjectRepository()

// El resto permanece igual...
```

---

## 🧪 Paso 7: Probar la Conexión

Crea `test-db.ts` en la raíz:

```typescript
import prisma from './lib/prisma'

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    const userCount = await prisma.user.count()
    console.log(`✅ Connected! Users in database: ${userCount}`)
    
    const users = await prisma.user.findMany()
    console.log('Users:', users)
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
```

Ejecutar:
```bash
npx tsx test-db.ts
```

---

## 🛠️ Comandos Útiles de Prisma

```bash
# Ver el esquema en Prisma Studio (interfaz gráfica)
npx prisma studio

# Generar cliente después de cambiar schema.prisma
npx prisma generate

# Aplicar cambios al schema (desarrollo)
npx prisma db push

# Crear migración (producción)
npx prisma migrate dev --name nombre_de_migracion

# Ver estado de migraciones
npx prisma migrate status

# Resetear base de datos (¡cuidado!)
npx prisma migrate reset

# Formatear schema.prisma
npx prisma format
```

---

## 📁 Estructura de Archivos

```
thesis-rsl-system/
├── prisma/
│   ├── schema.prisma                     ✅ Esquema de base de datos
│   └── seed.ts                          ✅ Datos de prueba
│
├── lib/
│   └── prisma.ts                        ✅ Cliente singleton
│
├── src/infrastructure/repositories/
│   ├── PrismaAuthRepository.ts          ✅ Repositorio Auth
│   └── PrismaProjectRepository.ts       ✅ Repositorio Projects
│
├── .env.local                           ✅ Variables de entorno
└── .env.example                         ✅ Template actualizado
```

---

## 🎯 Modelos Implementados

| Modelo | Descripción | Relaciones |
|--------|-------------|------------|
| `User` | Usuarios del sistema | → Projects, References |
| `Project` | Proyectos RSL | → Owner, Members, Protocol, References |
| `ProjectMember` | Colaboradores | → Project, User |
| `Protocol` | Protocolo investigación | → Project |
| `Reference` | Referencias bibliográficas | → Project, Reviewer |
| `PrismaItem` | Checklist PRISMA | → Project |
| `ArticleVersion` | Versiones del artículo | → Project, Author |
| `ActivityLog` | Log de actividades | → Project, User |

---

## 🔐 Seguridad

### Passwords
- ✅ Hasheados con `bcryptjs`
- ✅ Nunca se almacenan en texto plano
- ✅ Salt rounds: 10

### Conexiones
- ✅ Variables de entorno (`.env.local`)
- ✅ No commit de credenciales
- ✅ `.env.local` en `.gitignore`

---

## 🐛 Solución de Problemas

### Error: "Can't reach database server"
```bash
# Verificar que PostgreSQL está corriendo
# Windows:
services.msc  # Buscar "postgresql"

# Docker:
docker ps
docker start rsl-postgres
```

### Error: "Schema engine error"
```bash
# Regenerar cliente
npx prisma generate

# Reiniciar servidor Next.js
# Ctrl+C y luego npm run dev
```

### Error: "Module not found: @prisma/client"
```bash
npm install --legacy-peer-deps @prisma/client
npx prisma generate
```

### Ver logs de Prisma
Edita `lib/prisma.ts`:
```typescript
new PrismaClient({
  log: ['query', 'error', 'warn'],  // Ver todas las queries
})
```

---

## 📚 Recursos

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Prisma + Next.js**: https://www.prisma.io/nextjs
- **Clean Architecture + Prisma**: https://www.prisma.io/blog/clean-architecture

---

## ✅ Checklist de Configuración

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `rsl_system` creada
- [ ] `.env.local` configurado
- [ ] Prisma instalado
- [ ] `npx prisma generate` ejecutado
- [ ] `npx prisma db push` ejecutado
- [ ] `test-db.ts` funciona correctamente
- [ ] `npx prisma studio` abre correctamente
- [ ] DI Container actualizado a Prisma
- [ ] Servidor Next.js corriendo sin errores

---

**¡PostgreSQL + Prisma configurado exitosamente!** 🎉
