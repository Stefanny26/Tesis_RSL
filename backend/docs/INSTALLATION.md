# Guía de Instalación y Configuración

## 📋 Prerrequisitos

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm o pnpm

## 🔧 Instalación Paso a Paso

### 1. Instalar PostgreSQL

**Windows:**
- Descarga desde [postgresql.org](https://www.postgresql.org/download/windows/)
- Instala y configura el password del usuario `postgres`

**Verificar instalación:**
```powershell
psql --version
```

### 2. Crear la Base de Datos

```powershell
# Conectar a PostgreSQL
psql -U postgres

# En el prompt de PostgreSQL:
CREATE DATABASE thesis_rsl;
\q
```

### 3. Ejecutar Scripts SQL

Desde el directorio raíz del proyecto:

```powershell
# Script 1: Tabla de usuarios
psql -U postgres -d thesis_rsl -f scripts/01-create-users-table.sql

# Script 2: Tabla de proyectos
psql -U postgres -d thesis_rsl -f scripts/02-create-projects-table.sql

# Script 3: Tabla de miembros
psql -U postgres -d thesis_rsl -f scripts/03-create-project-members-table.sql

# Script 4: Tabla de protocolos
psql -U postgres -d thesis_rsl -f scripts/04-create-protocols-table.sql

# Script 5: Tabla de referencias
psql -U postgres -d thesis_rsl -f scripts/05-create-references-table.sql

# Script 6: Tabla de ítems PRISMA
psql -U postgres -d thesis_rsl -f scripts/06-create-prisma-items-table.sql

# Script 7: Tabla de versiones de artículos
psql -U postgres -d thesis_rsl -f scripts/07-create-article-versions-table.sql

# Script 8: Tabla de log de actividades
psql -U postgres -d thesis_rsl -f scripts/08-create-activity-log-table.sql

# Script 9: Funciones y triggers
psql -U postgres -d thesis_rsl -f scripts/09-create-functions-and-triggers.sql

# Script 10: Datos de prueba (opcional)
psql -U postgres -d thesis_rsl -f scripts/10-seed-data.sql
```

### 4. Instalar Dependencias del Backend

```powershell
cd backend
npm install
```

### 5. Configurar Variables de Entorno

```powershell
# Copiar el archivo de ejemplo
copy .env.example .env

# Editar .env con tus valores
notepad .env
```

Configuración mínima necesaria:

```env
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/thesis_rsl
JWT_SECRET=genera_un_secreto_aleatorio_aqui
SESSION_SECRET=otro_secreto_aleatorio
```

### 6. Configurar Google OAuth (Opcional)

Si quieres habilitar login con Google:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita **Google+ API**
4. Ve a **Credenciales** → **Crear credenciales** → **ID de cliente OAuth**
5. Tipo de aplicación: **Aplicación web**
6. URIs de redirección autorizadas:
   - `http://localhost:3001/api/auth/google/callback`
7. Copia el **Client ID** y **Client Secret** a tu `.env`:

```env
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### 7. Iniciar el Backend

**Modo desarrollo (con auto-reload):**
```powershell
npm run dev
```

**Modo producción:**
```powershell
npm start
```

El servidor debería iniciar en `http://localhost:3001`

### 8. Instalar y Ejecutar el Frontend

En otra terminal:

```powershell
cd frontend
pnpm install
pnpm dev
```

El frontend debería iniciar en `http://localhost:3000`

## ✅ Verificar la Instalación

### 1. Probar el Health Check

```powershell
curl http://localhost:3001/health
```

Debería responder:
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2025-11-01T...",
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. Probar Registro de Usuario

```powershell
curl -X POST http://localhost:3001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"fullName\":\"Test User\",\"password\":\"password123\"}'
```

### 3. Verificar Base de Datos

```powershell
psql -U postgres -d thesis_rsl -c "SELECT * FROM users;"
```

## 🐛 Solución de Problemas

### Error: "database does not exist"
```powershell
# Crear la base de datos manualmente
psql -U postgres -c "CREATE DATABASE thesis_rsl;"
```

### Error: "password authentication failed"
- Verifica que el password en `.env` coincida con el de PostgreSQL
- Prueba conectarte manualmente: `psql -U postgres -d thesis_rsl`

### Error: "Cannot find module"
```powershell
cd backend
rm -r node_modules
npm install
```

### Puerto ya en uso
```powershell
# Cambiar el puerto en .env
PORT=3002
```

### Google OAuth no funciona
- Verifica que las URIs de redirección estén correctas en Google Cloud Console
- Asegúrate de que `FRONTEND_URL` en `.env` sea correcto
- Revisa que las credenciales no tengan espacios adicionales

## 📚 Próximos Pasos

1. Lee la [documentación de la API](./API.md)
2. Importa la colección de Postman
3. Revisa los ejemplos de uso en el frontend
4. Consulta la [arquitectura del proyecto](./README.md)

## 🔒 Seguridad

- **NUNCA** subas el archivo `.env` al repositorio
- Genera secretos fuertes para `JWT_SECRET` y `SESSION_SECRET`
- En producción, usa HTTPS
- Configura CORS solo para tu dominio

## 📞 Soporte

Si tienes problemas, verifica:
1. Los logs del servidor backend
2. Los logs de PostgreSQL
3. La consola del navegador (frontend)
