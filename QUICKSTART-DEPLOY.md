# 🚀 Inicio Rápido - Despliegue

## ✅ Paso a Paso Simplificado

### 1️⃣ Subir a GitHub (5 minutos)

```bash
cd c:\Users\tefit\Downloads\thesis-rsl-system
git init
git add .
git commit -m "Preparado para producción"

# Crear repo en GitHub y luego:
git remote add origin https://github.com/TU_USUARIO/thesis-rsl-system.git
git push -u origin main
```

### 2️⃣ Desplegar Backend en Railway (10 minutos)

1. **Crear cuenta**: https://railway.app
2. **New Project** → Deploy from GitHub → Seleccionar repo
3. **Configurar Root Directory**: `backend`
4. **Add Database** → PostgreSQL
5. **Variables de entorno** (copiar de `.env.production`):
   ```env
   NODE_ENV=production
   FRONTEND_URL=https://tu-app.vercel.app
   JWT_SECRET=(generar nuevo)
   SESSION_SECRET=(generar nuevo)
   OPENAI_API_KEY=sk-proj-TU_KEY_AQUI
   GEMINI_API_KEY=TU_KEY_AQUI
   GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
   GOOGLE_CLIENT_SECRET=TU_SECRET_AQUI
   ```

**Generar secrets seguros:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. **Ejecutar migraciones**: Ver `DEPLOYMENT.md` sección 2.5
7. **Copiar URL del backend**: `https://xxx.up.railway.app`

### 3️⃣ Desplegar Frontend en Vercel (5 minutos)

1. **Crear cuenta**: https://vercel.com
2. **Add New Project** → Import desde GitHub
3. **Root Directory**: `frontend`
4. **Environment Variable**:
   ```env
   NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
   ```
5. **Deploy** → Esperar 2-3 minutos
6. **Copiar URL**: `https://xxx.vercel.app`

### 4️⃣ Actualizar URLs Cruzadas (3 minutos)

**En Railway (Backend):**
- Actualizar variable `FRONTEND_URL` con la URL de Vercel

**En Google Cloud Console:**
- Agregar URLs autorizadas (ver `DEPLOYMENT.md` sección 2.7 y 3.6)

### 5️⃣ ¡Listo! 🎉

Tu app está en vivo:
- **Frontend**: https://tu-app.vercel.app
- **Backend**: https://tu-backend.railway.app

---

## 📚 Documentación Completa

Ver `DEPLOYMENT.md` para guía detallada con screenshots y troubleshooting.

## 🆘 Problemas Comunes

**Error de CORS**: Verifica que las URLs en `FRONTEND_URL` y `NEXT_PUBLIC_API_URL` coincidan exactamente.

**Error de BD**: Ejecuta las migraciones SQL (ver `migrate.ps1` o `migrate.sh`)

**Error OAuth**: Actualiza las URLs autorizadas en Google Cloud Console

---

## 💰 Costo: ~$5-10/mes

- Vercel: Gratis
- Railway: $5/mes (después de crédito inicial)
