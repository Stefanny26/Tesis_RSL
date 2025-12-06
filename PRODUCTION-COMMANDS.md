# 🛠️ Comandos Útiles para Producción

## 🚂 Railway CLI

### Instalación
```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# macOS/Linux
npm i -g @railway/cli
```

### Comandos Básicos
```bash
# Login
railway login

# Ver logs en tiempo real
railway logs

# Conectar a la base de datos
railway connect postgres

# Ejecutar comando en el servidor
railway run node -v

# Ver variables de entorno
railway variables

# Ejecutar migraciones
railway run psql $DATABASE_URL -f scripts/01-create-users-table.sql
```

---

## ▲ Vercel CLI

### Instalación
```bash
npm i -g vercel
```

### Comandos Básicos
```bash
# Login
vercel login

# Deploy manual
vercel

# Ver logs
vercel logs

# Ver dominios
vercel domains ls

# Ver variables de entorno
vercel env ls
```

---

## 🐘 PostgreSQL - Conexión Remota

### Desde Railway Dashboard
1. Click en PostgreSQL service
2. Click en "Connect"
3. Copiar comando de conexión

### Usando pgAdmin
```
Host: containers-us-west-XXX.railway.app
Port: 5432
Database: railway
Username: postgres
Password: (ver Railway dashboard)
```

### Usando CLI
```bash
psql postgresql://postgres:PASSWORD@HOST:PORT/railway
```

---

## 🔍 Debugging

### Ver logs de Backend
```bash
# Railway CLI
railway logs --service=backend

# O en Dashboard
# Railway → Tu proyecto → Backend → View Logs
```

### Ver logs de Frontend
```bash
# Vercel CLI
vercel logs

# O en Dashboard
# Vercel → Tu proyecto → Logs
```

### Ver métricas
```bash
# Railway
railway status

# Vercel (desde dashboard)
# Analytics → Real-time
```

---

## 🗄️ Backup de Base de Datos

### Exportar (Backup)
```bash
# Desde Railway CLI
railway run pg_dump $DATABASE_URL > backup.sql

# O manualmente
pg_dump postgresql://USER:PASS@HOST:PORT/DB > backup.sql
```

### Importar (Restore)
```bash
# Desde Railway CLI
railway run psql $DATABASE_URL < backup.sql

# O manualmente
psql postgresql://USER:PASS@HOST:PORT/DB < backup.sql
```

### Backup Automático
Railway hace backups automáticos, ver:
- Dashboard → PostgreSQL → Backups

---

## 🔄 Rollback (Volver a versión anterior)

### Frontend (Vercel)
```bash
# Ver deployments
vercel ls

# Promover deployment anterior
vercel promote DEPLOYMENT_URL
```

### Backend (Railway)
1. Dashboard → Backend service
2. Deployments tab
3. Click en deployment anterior
4. Click "Redeploy"

---

## 🧪 Testing en Producción

### Health Check
```bash
# Backend
curl https://tu-backend.railway.app/api/health

# Frontend
curl https://tu-app.vercel.app
```

### Test de API
```bash
# Login
curl -X POST https://tu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Ver proyectos
curl https://tu-backend.railway.app/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Monitoreo

### Métricas de Railway
```bash
railway status
```

Muestra:
- CPU usage
- Memory usage
- Network I/O
- Database connections

### Métricas de Vercel
En Dashboard:
- Speed Insights
- Web Vitals
- Error rate
- Response time

---

## 🔐 Rotar Secrets

### Generar nuevos
```bash
cd backend
node generate-secrets.js
```

### Actualizar en Railway
```bash
# Opción 1: CLI
railway variables set JWT_SECRET=nuevo_valor

# Opción 2: Dashboard
# Variables → Edit → Save
```

### Actualizar en Vercel
```bash
# Opción 1: CLI
vercel env add NEXT_PUBLIC_API_URL production

# Opción 2: Dashboard
# Settings → Environment Variables → Edit
```

---

## 🚨 Troubleshooting Rápido

### Error: Cannot connect to database
```bash
# Verificar DATABASE_URL
railway variables | grep DATABASE_URL

# Verificar conexión
railway run psql $DATABASE_URL -c "SELECT 1;"
```

### Error: CORS
```bash
# Verificar FRONTEND_URL en backend
railway variables | grep FRONTEND_URL

# Debe coincidir exactamente con URL de Vercel
```

### Error: Module not found
```bash
# Limpiar caché y reinstalar
railway run npm ci

# O forzar rebuild
railway up --detach
```

### Error: Out of memory
```bash
# Ver uso actual
railway status

# Upgrade plan en Railway si es necesario
```

---

## 📝 Variables de Entorno

### Listar todas (Railway)
```bash
railway variables
```

### Agregar nueva (Railway)
```bash
railway variables set NUEVA_VAR=valor
```

### Eliminar (Railway)
```bash
railway variables delete NOMBRE_VAR
```

### Listar todas (Vercel)
```bash
vercel env ls
```

### Agregar nueva (Vercel)
```bash
vercel env add NOMBRE_VAR production
# Te pedirá el valor
```

---

## 🔄 Redeploy Manual

### Backend (Railway)
```bash
railway up
```

### Frontend (Vercel)
```bash
vercel --prod
```

---

## 💡 Tips de Optimización

### Reducir tamaño de build
```bash
# Frontend - Analizar bundle
cd frontend
npm run build
npx @next/bundle-analyzer
```

### Optimizar imágenes
```bash
# Next.js optimiza automáticamente
# Usar <Image> component en lugar de <img>
```

### Cachear respuestas
```javascript
// En Next.js
export const revalidate = 3600; // 1 hora
```

---

## 📞 Soporte

### Railway
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Support: https://railway.app/help

### Vercel
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

---

**💡 Tip**: Guarda estos comandos en un lugar accesible para debugging rápido!
