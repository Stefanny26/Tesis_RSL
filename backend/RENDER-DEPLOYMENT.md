# 🚀 Guía Rápida: Configurar Backend en Render

## Paso 1: Crear Web Service en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub/GitLab
4. Configura:
   - **Name:** `thesis-backend` (o el nombre que prefieras)
   - **Environment:** `Node`
   - **Build Command:** `npm install && pip install -r requirements.txt`
   - **Start Command:** `npm start`
   - **Plan:** Free (o el que prefieras)

## Paso 2: Configurar Variables de Entorno

En tu Web Service → **Environment** tab, agrega estas variables:

### ⚠️ Variables CRÍTICAS (sin estas no funcionará):

```bash
# URLs
BACKEND_URL=https://tu-backend.onrender.com
FRONTEND_URL=https://tu-app.vercel.app

# Base de datos
DATABASE_URL=postgresql://usuario:password@host:5432/database

# JWT (generar nuevo)
JWT_SECRET=generar_con_openssl_rand_hex_32
SESSION_SECRET=otro_secreto_diferente
```

### 🔑 Generar secretos seguros:

```bash
# En tu terminal local:
openssl rand -hex 32
```

Usa el resultado para `JWT_SECRET` y genera otro para `SESSION_SECRET`.

### 🤖 APIs y OAuth:

```bash
# OpenAI (obligatorio para IA)
OPENAI_API_KEY=sk-...

# Anthropic (opcional)
ANTHROPIC_API_KEY=sk-ant-...

# Google OAuth
GOOGLE_CLIENT_ID=tu_cliente_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_secreto
GOOGLE_CALLBACK_URL=https://tu-backend.onrender.com/api/auth/google/callback

# Configuración Node
NODE_ENV=production
PORT=3001
JWT_EXPIRES_IN=7d
```

## Paso 3: Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. En tus credenciales OAuth 2.0:
   - **Authorized redirect URIs:** Agrega `https://tu-backend.onrender.com/api/auth/google/callback`
   - Reemplaza con tu URL real de Render

## Paso 4: Base de Datos PostgreSQL

### Opción A: PostgreSQL de Render (Recomendado)

1. En Render Dashboard → **"New +"** → **"PostgreSQL"**
2. Crea la base de datos (Free o Paid)
3. Copia el **Internal Database URL**
4. Pégalo en `DATABASE_URL` del Web Service

### Opción B: Base de Datos Externa

Usa Supabase, Neon, o cualquier PostgreSQL:
```bash
DATABASE_URL=postgresql://usuario:password@host.supabase.co:5432/postgres
```

## Paso 5: Verificar Deployment

Una vez desplegado:

### 1. Health Check
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

### 2. Revisar Logs
En Render Dashboard → tu Web Service → **Logs** tab

Busca errores de:
- ❌ Conexión a base de datos
- ❌ Variables faltantes
- ✅ Servidor escuchando en puerto

## Paso 6: Configurar Frontend en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Tu proyecto → **Settings** → **Environment Variables**
3. Agrega:
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
   ```
4. **Redeploy** el frontend

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que `DATABASE_URL` esté correcta
- Si usas Render PostgreSQL, asegúrate de usar la **Internal URL**

### Error: "Python not found"
- Agrega en Build Command: `npm install && pip install -r requirements.txt`
- O usa Docker con imagen que incluya Node + Python

### Error: Imágenes no cargan (500)
- Verifica que `BACKEND_URL` esté configurada
- Debe ser: `https://tu-backend.onrender.com` (sin `/` al final)

### Error: CORS
- Verifica que `FRONTEND_URL` apunte correctamente a tu app de Vercel
- Formato: `https://tu-app.vercel.app` (sin `/` al final)

### Logs útiles:
```bash
# Ver logs en tiempo real
# En Render Dashboard → Logs (con auto-scroll activado)
```

## 📋 Checklist Final

- [ ] Web Service creado en Render
- [ ] `BACKEND_URL` configurada con URL de Render
- [ ] `FRONTEND_URL` configurada con URL de Vercel
- [ ] `DATABASE_URL` configurada y testeada
- [ ] `JWT_SECRET` y `SESSION_SECRET` generados
- [ ] `OPENAI_API_KEY` agregada
- [ ] Google OAuth configurado con callback correcto
- [ ] Build exitoso (revisar Logs)
- [ ] Health check responde correctamente
- [ ] Frontend conectado al backend

## 🎉 ¡Listo!

Tu backend está configurado. Ahora:
1. Ve a tu app en Vercel
2. Crea un nuevo proyecto
3. Genera un artículo
4. Las imágenes deberían cargar desde `https://tu-backend.onrender.com/uploads/...`

---

**Nota importante sobre Render Free Tier:**
- El servicio gratuito se "duerme" después de 15 minutos sin actividad
- Primera petición después de dormir tarda ~30 segundos en responder
- Considera upgrade a plan pago si necesitas disponibilidad 24/7
