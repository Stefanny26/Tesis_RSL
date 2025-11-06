# 🎓 Thesis RSL System - Sistema de Revisión Sistemática de Literatura con IA

Sistema web para gestionar revisiones sistemáticas de literatura (RSL) siguiendo protocolos **PRISMA**, **Cochrane** y **WPOM**, con análisis automático mediante **Inteligencia Artificial** (Google Gemini).

---

## 🌟 Características Principales

### 🤖 Análisis con IA
- **Evaluación automática** de propuestas de investigación
- **Generación de protocolos** siguiendo estándares PRISMA/Cochrane
- **Marco PICO** para preguntas de investigación
- **Matriz Es/No Es** para delimitar alcance
- **Términos clave** y estrategias de búsqueda
- **Análisis de cumplimiento** PRISMA

### 📋 Gestión de Proyectos RSL
- Creación y gestión de proyectos de revisión sistemática
- Protocolo interactivo con 5 pestañas:
  - **Análisis**: Evaluación de la propuesta y título refinado
  - **PICO**: Marco de pregunta de investigación
  - **Es/No Es**: Matriz de delimitación de alcance
  - **Criterios**: Inclusión/exclusión de estudios
  - **Búsqueda**: Estrategias de búsqueda en bases de datos

### 🔐 Autenticación
- **Login local** (email + contraseña)
- **OAuth 2.0 con Google** (inicio de sesión rápido)
- **JWT** para sesiones seguras

### 📊 Dashboard
- Vista general de proyectos
- Estadísticas de progreso
- Gestión de referencias bibliográficas

---

## 🏗️ Arquitectura del Sistema

### Backend
- **Arquitectura Limpia** (Clean Architecture)
- **Domain-Driven Design** (DDD)
- **PostgreSQL** como base de datos
- **Google Gemini AI** para análisis

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** para type safety
- **Tailwind CSS** + **shadcn/ui** para UI moderna
- **React Context** para estado global

📖 Ver documentación completa: [`ARQUITECTURA-LIMPIA.md`](./ARQUITECTURA-LIMPIA.md)

---

## 📁 Estructura del Proyecto

```
thesis-rsl-system/
├── backend/           # API Node.js + Express
│   ├── src/
│   │   ├── api/       # Controllers + Routes
│   │   ├── domain/    # Lógica de negocio
│   │   └── infrastructure/  # DB + Middlewares
│   └── package.json
│
├── frontend/          # Next.js 14 App
│   ├── app/           # Páginas (App Router)
│   ├── components/    # Componentes React
│   ├── lib/           # Utilidades
│   └── package.json
│
├── docs/              # Documentación del proyecto
├── scripts/           # Scripts SQL de BD
└── start-dev.ps1      # Iniciar todo el proyecto
```

---

## 🚀 Instalación y Configuración

### 1️⃣ Pre-requisitos
- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **PostgreSQL** 14+ ([Descargar](https://www.postgresql.org/download/))
- **Git** ([Descargar](https://git-scm.com/))

### 2️⃣ Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd thesis-rsl-system
```

### 3️⃣ Configurar Base de Datos

1. Crear la base de datos:
```sql
CREATE DATABASE "Tesis_RSL";
```

2. Ejecutar scripts de creación de tablas:
```bash
cd scripts
psql -U postgres -d Tesis_RSL -f 01-create-users-table.sql
psql -U postgres -d Tesis_RSL -f 02-create-projects-table.sql
# ... ejecutar todos los scripts en orden
```

### 4️⃣ Configurar Backend

1. Ir a la carpeta del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env`:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=Tesis_RSL
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_contraseña

# JWT
JWT_SECRET=tu_secreto_jwt_muy_largo_y_aleatorio

# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id_de_google
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Google Gemini AI
GEMINI_API_KEY=tu_api_key_de_gemini

# URLs
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### 5️⃣ Configurar Frontend

1. Ir a la carpeta del frontend:
```bash
cd ../frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 6️⃣ Iniciar el Proyecto

**Opción A: Iniciar todo con un comando (Recomendado)**
```powershell
.\start-dev.ps1
```

**Opción B: Iniciar manualmente**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

---

## 🌐 Acceso al Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

---

## 🧹 Limpieza de Archivos Duplicados

Si tienes archivos duplicados en la raíz del proyecto (de versiones anteriores), ejecuta:

```powershell
.\cleanup-duplicates.ps1
```

Este script eliminará:
- `app/`, `components/`, `lib/`, `hooks/` de la raíz
- Archivos de configuración duplicados (`package.json`, `tsconfig.json`, etc.)

**La estructura correcta es:**
```
thesis-rsl-system/
├── backend/    ✅
├── frontend/   ✅
└── docs/       ✅
```

---

## 📚 Documentación

- **[Arquitectura Limpia](./ARQUITECTURA-LIMPIA.md)** - Principios de diseño y estructura del código
- **[Flujo de Datos](./FLUJO-DE-DATOS.md)** - Cómo fluyen los datos en el sistema
- **[Requerimientos](./docs/01-requerimientos.md)** - Requerimientos funcionales y no funcionales
- **[Épicas e Historias de Usuario](./docs/02-epicas.md)** - Funcionalidades del sistema

---

## 🔧 Tecnologías

### Backend
- Node.js 18+
- Express 4.18
- PostgreSQL 14+
- JWT (jsonwebtoken)
- Passport.js (Google OAuth)
- Google Gemini AI API

### Frontend
- Next.js 14.2 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

---

## 🐛 Solución de Problemas

### Error: "No se recibió token de autenticación"
**Solución**: Reinicia el backend después de cambios en el código:
```bash
cd backend
npm run dev
```

### Error: "password_hash column doesn't exist"
**Solución**: Ejecuta el script de migración:
```bash
node add-password-hash-column.js
```

### Error: "role column cannot be null"
**Solución**: Ya corregido en la última versión. Asegúrate de tener el código actualizado.

### Error al hacer logout
**Solución**: Ya corregido. El logout ahora redirige correctamente a la página inicial.

---

## 🧪 Testing (Próximamente)

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 👥 Contribuciones

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 📞 Contacto

**Proyecto de Tesis** - Sistema de Revisión Sistemática de Literatura

Para preguntas o problemas, por favor abre un Issue en el repositorio.

---

## ✅ Checklist de Instalación

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 14+ instalado
- [ ] Base de datos "Tesis_RSL" creada
- [ ] Scripts SQL ejecutados
- [ ] Backend: `npm install` completado
- [ ] Backend: `.env` configurado
- [ ] Frontend: `npm install` completado
- [ ] Frontend: `.env.local` configurado
- [ ] Google OAuth configurado (Client ID + Secret)
- [ ] Google Gemini API Key obtenida
- [ ] Servidor backend corriendo en :3001
- [ ] Servidor frontend corriendo en :3000
- [ ] Login con Google funcionando
- [ ] Generación de protocolo con IA funcionando

---

## 🎯 Roadmap

- [x] Sistema de autenticación (local + OAuth)
- [x] Gestión de proyectos RSL
- [x] Protocolo interactivo con 5 pestañas
- [x] Integración con Google Gemini AI
- [x] Análisis PRISMA/Cochrane/WPOM
- [x] Matriz PICO y Es/No Es
- [ ] Sistema de cribado de artículos
- [ ] Generación de diagramas PRISMA
- [ ] Exportación de protocolos (PDF/Word)
- [ ] Gestión de referencias bibliográficas
- [ ] Sistema de colaboración (múltiples revisores)
- [ ] Dashboard de estadísticas avanzadas

---

**¡Gracias por usar Thesis RSL System!** 🎓✨
