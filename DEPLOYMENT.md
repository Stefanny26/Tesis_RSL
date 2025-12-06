# 🚀 Guía de Despliegue - Vercel + Railway

## 📋 Requisitos Previos

- Cuenta en [GitHub](https://github.com) (tu código debe estar en un repositorio)
- Cuenta en [Vercel](https://vercel.com) (gratis)
- Cuenta en [Railway](https://railway.app) (gratis con crédito inicial)
- Las API Keys de OpenAI y Gemini

---

## 🗂️ PARTE 1: Preparar el Repositorio GitHub

### 1.1 Inicializar Git (si no está inicializado)

```bash
cd c:\Users\tefit\Downloads\thesis-rsl-system
git init
git add .
git commit -m "Initial commit - Sistema RSL completo"
```

### 1.2 Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `thesis-rsl-system` (o el que prefieras)
3. Privado o Público (recomiendo Privado)
4. **NO** inicialices con README
5. Click "Create repository"

### 1.3 Conectar y subir código

```bash
git remote add origin https://github.com/TU_USUARIO/thesis-rsl-system.git
git branch -M main
git push -u origin main
```

---

## 🚂 PARTE 2: Desplegar Backend en Railway

### 2.1 Crear cuenta y proyecto

1. Ve a https://railway.app
2. Click "Start a New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway a acceder a tu GitHub
5. Selecciona el repositorio `thesis-rsl-system`

### 2.2 Configurar el servicio Backend

1. Railway detectará automáticamente que es Node.js
2. Click en el servicio creado
3. Ve a **Settings** → **Root Directory**:
   - Cambiar a: `backend`
4. Ve a **Settings** → **Start Command**:
   - Agregar: `npm start`

### 2.3 Agregar PostgreSQL

1. Click "+ New" → "Database" → "Add PostgreSQL"
2. Railway creará automáticamente la base de datos
3. Conectará automáticamente la variable `DATABASE_URL`

### 2.4 Configurar Variables de Entorno

1. Click en tu servicio Backend
2. Ve a **Variables**
3. Agregar las siguientes variables:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://tu-app.vercel.app
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=GENERA_UNO_NUEVO_AQUI
SESSION_SECRET=GENERA_UNO_NUEVO_AQUI
OPENAI_API_KEY=sk-proj-tu-api-key-aqui
GEMINI_API_KEY=tu-gemini-api-key-aqui
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_CALLBACK_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}/api/auth/google/callback
```

**⚠️ IMPORTANTE: Generar nuevos secrets seguros:**

```bash
# En PowerShell o CMD, ejecuta:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ejecuta este comando 2 veces para generar `JWT_SECRET` y `SESSION_SECRET`

### 2.5 Ejecutar Migraciones de Base de Datos

1. Una vez desplegado, ve a tu servicio Backend
2. Click en **Settings** → **Connect**
3. Conecta a la BD usando el DATABASE_URL
4. Ejecuta los scripts SQL de la carpeta `scripts/`:

```bash
# Opción A: Desde Railway CLI
railway run psql $DATABASE_URL -f scripts/01-create-users-table.sql
railway run psql $DATABASE_URL -f scripts/02-create-projects-table.sql
# ... ejecutar todos los scripts en orden

# Opción B: Desde pgAdmin o DBeaver
# Conectar con los datos de Railway y ejecutar cada script
```

### 2.6 Obtener URL del Backend

1. Railway asignará una URL pública tipo: `https://thesis-rsl-backend-production-XXXX.up.railway.app`
2. **Copia esta URL** (la necesitarás para Vercel)

### 2.7 Actualizar Google OAuth Callback

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edita tu OAuth 2.0 Client ID
3. Agregar a "Authorized redirect URIs":
   ```
   https://tu-backend.railway.app/api/auth/google/callback
   ```

---

## ▲ PARTE 3: Desplegar Frontend en Vercel

### 3.1 Crear cuenta y proyecto

1. Ve a https://vercel.com
2. Click "Add New Project"
3. Import desde GitHub
4. Selecciona tu repositorio `thesis-rsl-system`

### 3.2 Configurar el proyecto

1. **Framework Preset**: Next.js (detectado automáticamente)
2. **Root Directory**: Click "Edit" → Seleccionar `frontend`
3. **Build Command**: `npm run build` (por defecto)
4. **Output Directory**: `.next` (por defecto)

### 3.3 Configurar Variables de Entorno

1. Antes de hacer deploy, click en "Environment Variables"
2. Agregar:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
```

Reemplaza `tu-backend.railway.app` con la URL real de Railway (Parte 2.6)

### 3.4 Deploy

1. Click "Deploy"
2. Vercel construirá y desplegará tu app (toma ~2-3 minutos)
3. Te dará una URL tipo: `https://thesis-rsl-system.vercel.app`

### 3.5 Actualizar Backend con URL de Frontend

1. Regresa a Railway
2. Ve a tu servicio Backend → Variables
3. Actualiza `FRONTEND_URL`:
   ```env
   FRONTEND_URL=https://thesis-rsl-system.vercel.app
   ```
4. Railway redesplegará automáticamente

### 3.6 Actualizar Google OAuth con URL de Frontend

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edita tu OAuth 2.0 Client ID
3. Agregar a "Authorized JavaScript origins":
   ```
   https://thesis-rsl-system.vercel.app
   ```
4. Agregar a "Authorized redirect URIs":
   ```
   https://thesis-rsl-system.vercel.app/auth/callback
   ```

---

## ✅ PARTE 4: Verificar Despliegue

### 4.1 Probar Backend

1. Abre tu navegador
2. Ve a: `https://tu-backend.railway.app/api/health` (si tienes endpoint)
3. O prueba: `https://tu-backend.railway.app/api/auth/status`

### 4.2 Probar Frontend

1. Ve a: `https://tu-app.vercel.app`
2. Intenta hacer login
3. Verifica que puedas crear un proyecto

### 4.3 Verificar CORS

Si tienes errores de CORS:
1. Revisa que `FRONTEND_URL` en Railway esté correcta
2. Verifica que `NEXT_PUBLIC_API_URL` en Vercel esté correcta
3. Ambas deben ser URLs HTTPS (no HTTP)

---

## 🔄 PARTE 5: Despliegues Futuros (Automático)

### Git Push Deploy

Cada vez que hagas cambios:

```bash
# Frontend
cd frontend
git add .
git commit -m "Actualizar frontend"
git push origin main
# ✅ Vercel redesplegará automáticamente

# Backend
cd ../backend
git add .
git commit -m "Actualizar backend"
git push origin main
# ✅ Railway redesplegará automáticamente
```

### Rollback (si algo sale mal)

**En Vercel:**
1. Ve a tu proyecto → Deployments
2. Click en el deployment anterior
3. Click "Promote to Production"

**En Railway:**
1. Ve a tu servicio → Deployments
2. Click en el deployment anterior
3. Click "Redeploy"

---

## 📊 Monitoreo

### Railway Dashboard
- **Logs**: Ver errores del backend en tiempo real
- **Metrics**: CPU, memoria, requests
- **Database**: Ver conexiones, queries

### Vercel Dashboard
- **Analytics**: Visitas, performance
- **Logs**: Errores del frontend
- **Speed Insights**: Métricas de rendimiento

---

## 💰 Costos Estimados

### Mes 1-3 (Gratis)
- Vercel: $0 (plan hobby)
- Railway: $0 (crédito inicial de $5)

### Después
- Vercel: $0 (si no pasas los límites)
- Railway: ~$5-10/mes (según uso de BD y backend)

**Total: $5-10/mes**

---

## 🆘 Troubleshooting Común

### Error: "Cannot connect to database"
- Verifica que la variable `DATABASE_URL` esté configurada en Railway
- Asegúrate que las tablas existan (ejecutar scripts SQL)

### Error: "CORS policy error"
- Verifica `FRONTEND_URL` en Railway
- Verifica `NEXT_PUBLIC_API_URL` en Vercel
- Ambas deben coincidir con las URLs reales

### Error: "Google OAuth failed"
- Verifica que las URLs de callback estén en Google Cloud Console
- Verifica `GOOGLE_CALLBACK_URL` en Railway

### Error: "OpenAI API error"
- Verifica que `OPENAI_API_KEY` esté correcta
- Verifica que tengas créditos en tu cuenta OpenAI

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Railway y Vercel
2. Verifica las variables de entorno
3. Asegúrate que las URLs sean HTTPS

---

## ✨ ¡Listo!

Tu aplicación ahora está desplegada en producción. Los usuarios pueden acceder desde cualquier lugar del mundo. 🌍

**URLs Finales:**
- Frontend: `https://tu-app.vercel.app`
- Backend: `https://tu-backend.railway.app`
- Base de datos: Administrada por Railway

¡Éxito con tu tesis! 🎓🚀
