# 📚 RSL Manager - Sistema de Revisión Sistemática de Literatura con IA

Sistema completo para gestionar revisiones sistemáticas de literatura (RSL) con asistencia de inteligencia artificial (ChatGPT y Gemini).

## ✨ Características Principales

### 🤖 Generación Automática de Protocolos con IA
- Análisis y evaluación automática de propuestas de investigación
- Generación de protocolos PRISMA/Cochrane completos
- Integración con ChatGPT y Google Gemini
- Evaluación de viabilidad y delimitación del alcance

### 📊 Marco PICO y Estructuración
- Framework PICO (Población, Intervención, Comparación, Outcomes)
- Matriz "Es/No Es" para delimitar alcance
- Preguntas de investigación refinadas
- Términos clave identificados automáticamente

### 🔍 Sistema de Cribado (Screening)
- Gestión de referencias bibliográficas
- Filtrado por estado (pendiente, incluido, excluido)
- Estadísticas en tiempo real
- Acciones masivas sobre referencias
- Revisión manual de abstracts

### 📈 Dashboard Completo
- Vista general de todos los proyectos
- Estadísticas de referencias y progreso
- Estado de cumplimiento PRISMA
- Gestión de proyectos activos y completados

### 🔐 Autenticación
- Login con email/password
- OAuth con Google
- Sistema de roles y permisos

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express** 4.18.2
- **PostgreSQL** (Base de datos)
- **Google Gemini 2.5 Flash** (IA)
- **Passport.js** (OAuth)
- Arquitectura limpia (Clean Architecture)

### Frontend
- **Next.js** 14.2.25 (App Router)
- **React** 18
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (Componentes UI)

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- API Key de Google Gemini (opcional: ChatGPT)

### 1. Clonar el repositorio
```bash
git clone https://github.com/Stefanny26/Tesis_RSL.git
cd Tesis_RSL
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Tesis_RSL
DB_USER=postgres
DB_PASSWORD=tu_password

JWT_SECRET=tu_jwt_secret_aqui
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

GEMINI_API_KEY=tu_api_key_de_gemini
OPENAI_API_KEY=tu_api_key_de_openai (opcional)
```

Ejecutar migraciones de base de datos:
```bash
# En PostgreSQL, ejecutar los scripts en orden:
psql -U postgres -d Tesis_RSL -f ../scripts/01-create-users-table.sql
psql -U postgres -d Tesis_RSL -f ../scripts/02-create-projects-table.sql
# ... y así sucesivamente
```

Iniciar servidor backend:
```bash
npm run dev
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Iniciar servidor frontend:
```bash
npm run dev
```

Acceder a: `http://localhost:3000`

## 📚 Estructura del Proyecto

```
thesis-rsl-system/
├── backend/
│   ├── src/
│   │   ├── api/              # Controllers y Routes
│   │   ├── domain/           # Models y Use Cases
│   │   ├── infrastructure/   # Repositories y Middlewares
│   │   └── config/           # Configuración (DB, Passport)
│   └── package.json
├── frontend/
│   ├── app/                  # Páginas (Next.js App Router)
│   ├── components/           # Componentes React
│   ├── lib/                  # Utilidades y tipos
│   └── package.json
├── docs/                     # Documentación
└── scripts/                  # Scripts SQL de migración
```

## 🚀 Uso

### 1. Crear un Proyecto
1. Accede al Dashboard
2. Haz clic en "Nuevo Proyecto"
3. Completa el título y descripción

### 2. Generar Protocolo con IA
1. Abre el proyecto
2. Ve a la sección "Protocolo"
3. Haz clic en "Analizar y Generar Protocolo Completo"
4. Selecciona el proveedor de IA (Gemini o ChatGPT)
5. Espera 30-60 segundos

### 3. Agregar Referencias
1. Ve a la sección "Cribado"
2. Importa referencias desde CSV o agrégalas manualmente
3. Revisa y filtra las referencias

### 4. Realizar Cribado
1. En la página de Cribado, revisa cada referencia
2. Marca como "Incluido", "Excluido" o "Pendiente"
3. Las estadísticas se actualizan automáticamente

## 📊 Características del Sistema

### ✅ Implementado
- [x] Autenticación (Local + OAuth Google)
- [x] Gestión de proyectos
- [x] Generación de protocolos con IA
- [x] Marco PICO completo
- [x] Sistema de cribado manual
- [x] Dashboard con estadísticas
- [x] Referencias bibliográficas
- [x] Filtros y búsqueda

### 🔜 Próximamente
- [ ] Importación CSV de referencias
- [ ] Cribado automático con IA
- [ ] Exportación de reportes PRISMA
- [ ] Generación de artículos
- [ ] Análisis de duplicados

## 🤝 Contribuir

Este es un proyecto de tesis. Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es parte de una tesis de grado. Todos los derechos reservados.

## 👥 Autores

- **Stefanny Hernandez** - Desarrollo e Investigación
- **Universidad ESPE** - Institución Educativa

## 📧 Contacto

- Email: smhernandez2@espe.edu.ec
- GitHub: [@Stefanny26](https://github.com/Stefanny26)

---

⭐ Si este proyecto te fue útil, no olvides darle una estrella en GitHub!
