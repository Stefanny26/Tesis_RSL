# Backend - Sistema de Revisión Sistemática de Literatura

Backend Node.js/Express con arquitectura limpia para sistema de revisión sistemática de literatura con integración de IA.

## 🚀 Inicio Rápido

**¿Primera vez aquí? Lee `QUICKSTART.md` para configurar en 5 minutos.**

```powershell
cd backend
npm install
copy .env.example .env
# Editar .env con tus credenciales
npm run dev
```

## 📚 Documentación

- **[QUICKSTART.md](./QUICKSTART.md)** - ⚡ Configuración rápida en 5 minutos
- **[INSTALLATION.md](./INSTALLATION.md)** - 📖 Guía completa de instalación
- **[FRONTEND-INTEGRATION.md](./FRONTEND-INTEGRATION.md)** - 🔗 Cómo conectar con el frontend
- **[SUMMARY.md](./SUMMARY.md)** - 📊 Resumen completo del proyecto
- **[postman-collection.json](./postman-collection.json)** - 📬 Colección de Postman

## 🏗️ Arquitectura

```
backend/
├── src/
│   ├── server.js                    # Punto de entrada
│   ├── config/                      # Configuraciones
│   │   ├── database.js              # Conexión PostgreSQL
│   │   └── passport-setup.js        # Configuración OAuth
│   ├── domain/                      # Capa de dominio (lógica de negocio)
│   │   ├── models/                  # Modelos de dominio
│   │   └── use-cases/               # Casos de uso
│   ├── infrastructure/              # Capa de infraestructura
│   │   ├── repositories/            # Acceso a datos
│   │   └── middlewares/             # Middlewares
│   └── api/                         # Capa de API
│       ├── controllers/             # Controladores
│       ├── routes/                  # Rutas
│       └── validators/              # Validadores
├── package.json
├── .env.example
└── README.md
```

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
copy .env.example .env
```

Edita `.env` con tus credenciales.

### 3. Configurar PostgreSQL

Asegúrate de tener PostgreSQL instalado y ejecuta los scripts SQL en orden:

```bash
# Desde el directorio raíz del proyecto
psql -U tu_usuario -d postgres -f scripts/01-create-users-table.sql
psql -U tu_usuario -d postgres -f scripts/02-create-projects-table.sql
# ... continúa con todos los scripts
```

### 4. Configurar Google OAuth (opcional)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:3001/api/auth/google/callback` como URI de redirección autorizada
6. Copia el Client ID y Client Secret al archivo `.env`

### 5. Ejecutar el servidor

**Desarrollo (con auto-reload):**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:3001`

## 📡 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login con email/password
- `GET /api/auth/google` - Iniciar OAuth con Google
- `GET /api/auth/google/callback` - Callback de Google OAuth
- `GET /api/auth/me` - Obtener usuario actual (requiere JWT)

### Proyectos

- `GET /api/projects` - Listar proyectos del usuario
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/:id` - Obtener proyecto específico
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

### Protocolos

- `GET /api/projects/:projectId/protocol` - Obtener protocolo
- `PUT /api/projects/:projectId/protocol` - Actualizar protocolo

### Referencias

- `GET /api/projects/:projectId/references` - Listar referencias
- `POST /api/projects/:projectId/references` - Agregar referencia
- `PUT /api/references/:id` - Actualizar referencia
- `DELETE /api/references/:id` - Eliminar referencia
- `POST /api/references/:id/screen` - Cribar referencia con IA

### PRISMA Items

- `GET /api/projects/:projectId/prisma-items` - Listar ítems PRISMA
- `PUT /api/prisma-items/:id` - Actualizar ítem PRISMA
- `POST /api/prisma-items/:id/validate` - Validar con IA

### Artículos

- `GET /api/projects/:projectId/articles` - Listar versiones
- `POST /api/projects/:projectId/articles` - Crear versión
- `POST /api/articles/generate` - Generar sección con IA

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación. Después del login, el frontend debe enviar el token en el header:

```
Authorization: Bearer <token>
```

## 🧪 Pruebas con Postman

1. Importa la colección (próximamente)
2. Configura la variable `baseUrl` a `http://localhost:3001`
3. Prueba los endpoints de autenticación primero
4. El token se guardará automáticamente para las demás peticiones

## 🛡️ Seguridad

- **NUNCA** subas el archivo `.env` al repositorio
- Usa contraseñas seguras para JWT_SECRET y SESSION_SECRET
- En producción, configura CORS solo para tu dominio
- Usa HTTPS en producción

## 📝 Notas

- La base de datos usa PostgreSQL con extensión `pgvector` para embeddings de IA
- Los scripts SQL incluyen Row Level Security (RLS) para Supabase
- El sistema está preparado para integración con OpenAI

## 🤝 Contribución

1. Crea una rama para tu feature
2. Haz commit de tus cambios
3. Push a la rama
4. Abre un Pull Request
