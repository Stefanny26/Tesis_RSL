# 🚀 Configuración de Producción

## Variables de Entorno Importantes

### BACKEND_URL
**CRÍTICO:** Esta variable debe configurarse en Render para que las imágenes y PDFs funcionen correctamente en producción.

#### ¿Por qué es necesaria?
En producción, el frontend (Vercel) y backend (Render) están en dominios diferentes. Cuando el sistema genera artículos con imágenes (gráficos PRISMA, scree plots, etc.), necesita generar URLs absolutas que apunten al servidor backend donde están almacenadas las imágenes.

#### Cómo configurar en Render:

1. **Ir a tu servicio backend en Render Dashboard** (https://dashboard.render.com)
2. **Navegar a tu Web Service → Environment**
3. **Hacer clic en "Add Environment Variable"**
4. **Agregar:**
   ```
   BACKEND_URL=https://tu-backend.onrender.com
   ```
   ⚠️ Reemplaza con tu URL real de Render (sin barra al final)

5. **Agregar también FRONTEND_URL:**
   ```
   FRONTEND_URL=https://tu-app.vercel.app
   ```

6. **Guardar cambios** - Render redesplegará automáticamente

#### Verificación:
Después de configurar (Render redesplegará automáticamente), las URLs en los artículos generados deberían verse así:
- ✅ `https://tu-backend.onrender.com/uploads/charts/scree_plot.png`
- ❌ ~~`/uploads/charts/scree_plot.png`~~ (no funcionará)

## Variables Completas de Producción en Render

```bash
# Servidor
NODE_ENV=production
PORT=3001

# URLs
FRONTEND_URL=https://tu-app.vercel.app
BACKEND_URL=https://tu-backend.onrender.com

# Base de datos PostgreSQL (puedes usar la de Render o externa)
DATABASE_URL=postgresql://usuario:password@host:5432/database

# JWT (generar con: openssl rand -hex 32)
JWT_SECRET=tu_jwt_secret_aqui
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=tu_cliente_id
GOOGLE_CLIENT_SECRET=tu_secreto
GOOGLE_CALLBACK_URL=https://tu-backend.onrender.com/api/auth/google/callback

# Sesiones
SESSION_SECRET=${SESSION_SECRET}

# OpenAI
OPENAI_API_KEY=${OPENAI_API_KEY}

# Anthropic (opcional)
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
```

## Problemas Comunes

### Error 500 al cargar imágenes en producción
**Síntoma:** En consola del navegador aparece:
```
Failed to load resource: the server responded with a status of 500
/uploads/charts/scree_plot.png
```

**Causa:** La variable `BACKEND_URL` no está configurada en Render.

**Solución:** 
1. Ir a Render Dashboard → tu Web Service → Environment
2. Agregar `BACKEND_URL=https://tu-backend.onrender.com`
3. Guardar (Render redesplegará automáticamente)
4. Regenerar el artículo en el frontend

### Imágenes funcionan en local pero no en producción
**Causa:** En local, frontend y backend comparten el mismo dominio (localhost).

**Solución:** Asegurarse de tener `BACKEND_URL` configurada correctamente en Railway.

## Checklist de Despliegue

- [ ] **Render Web Service** creado para el backend
- [ ] `BACKEND_URL` configurada en Render (Environment Variables)
- [ ] `FRONTEND_URL` configurada en Render
- [ ] `DATABASE_URL` configurada (PostgreSQL de Render o externo)
- [ ] `JWT_SECRET` generado y configurado (usar `openssl rand -hex 32`)
- [ ] `SESSION_SECRET` generado y configurado
- [ ] `OPENAI_API_KEY` configurada
- [ ] Credentials de Google OAuth actualizadas con URL de Render
- [ ] CORS configurado con URL correcta del frontend
- [ ] Python instalado en Render (para generar gráficos)
- [ ] Backend desplegado y funcionando en Render
- [ ] Frontend desplegado en Vercel con `NEXT_PUBLIC_API_URL` apuntando a Render

## Verificación de Funcionamiento

### Test 1: Health Check
```bash
curl https://tu-backend.onrender.com/health
```
Debe retornar:
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "environment": "production"
}
```

### Test 2: Archivos Estáticos
```bash
curl -I https://tu-backend.onrender.com/uploads/charts/scree_plot.png
```
Debe retornar `200 OK` si el archivo existe.

### Test 3: CORS
Desde el frontend, verificar que las peticiones al backend no tengan errores CORS en la consola.

## Soporte

Si persisten los problemas:
1. **Revisar logs en Render Dashboard** → tu Web Service → Logs
2. Verificar variables de entorno en Environment tab
3. Confirmar que el directorio `/uploads` tenga permisos de escritura
4. **Verificar que Python esté instalado** en Render:
   - En tu `render.yaml` o Build Command, asegurar que incluya Python
   - Alternativamente, usar Docker con Python pre-instalado
5. Verificar que `requirements.txt` esté presente para instalar matplotlib, pandas

### Configuración de Python en Render

Agrega en tu **Build Command** (Render Dashboard):
```bash
npm install && pip install -r requirements.txt
```

O crea un archivo `render.yaml`:
```yaml
services:
  - type: web
    name: thesis-backend
    env: node
    buildCommand: npm install && pip install -r requirements.txt
    startCommand: npm start
```
