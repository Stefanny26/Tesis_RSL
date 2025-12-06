# 🔐 Configuración de Credenciales

## ⚠️ IMPORTANTE: Seguridad

**NUNCA subas credenciales reales a GitHub**. GitHub bloqueará el push si detecta secrets.

---

## 📝 Dónde Guardar tus Credenciales Reales

### Para Desarrollo Local

1. **Backend**: Copia `backend/.env.example` a `backend/.env`
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edita** `backend/.env` con tus credenciales reales:
   - Google OAuth Client ID y Secret
   - OpenAI API Key
   - Gemini API Key
   - Etc.

3. **Verifica** que `.env` esté en `.gitignore` ✅

### Para Producción (Railway/Vercel)

Las credenciales se configuran en los **dashboards** de cada plataforma, **NO** en archivos:

#### Railway (Backend)
1. Dashboard → Tu proyecto → Variables
2. Agregar cada variable individualmente
3. Railway las encripta automáticamente

#### Vercel (Frontend)
1. Dashboard → Tu proyecto → Settings → Environment Variables
2. Agregar `NEXT_PUBLIC_API_URL`
3. Vercel las encripta automáticamente

---

## 🔑 Dónde Obtener las Credenciales

### Google OAuth
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Crea OAuth 2.0 Client ID (si no existe)
3. Copia:
   - Client ID: `XXXX.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-XXXX`

### OpenAI API
1. Ve a: https://platform.openai.com/api-keys
2. Crea nueva API Key
3. Copia: `sk-proj-XXXX`
4. ⚠️ Solo se muestra una vez

### Google Gemini API
1. Ve a: https://aistudio.google.com/app/apikey
2. Crea API Key
3. Copia el valor

### Scopus API (Opcional)
1. Registrarse en: https://dev.elsevier.com/
2. Crear aplicación
3. Obtener API Key

### IEEE API (Opcional)
1. Registrarse en: https://developer.ieee.org/
2. Solicitar API Key

---

## 🛡️ Buenas Prácticas

### ✅ HACER
- Usar `.env` para desarrollo local
- Configurar variables en dashboards de producción
- Generar nuevos secrets para producción
- Rotar credenciales periódicamente

### ❌ NO HACER
- Subir `.env` a GitHub
- Compartir credenciales por email/chat
- Usar las mismas credenciales para dev y prod
- Hardcodear credenciales en el código

---

## 🔄 Si Accidentalmente Subiste Credenciales

1. **Revocar inmediatamente** las credenciales en la plataforma origen
2. **Generar nuevas** credenciales
3. **Reescribir el historial** de Git (avanzado):
   ```bash
   # Usar BFG Repo-Cleaner
   https://rtyley.github.io/bfg-repo-cleaner/
   ```

4. **O crear un nuevo repo** desde cero (más simple)

---

## 📞 Más Información

- GitHub Secret Scanning: https://docs.github.com/code-security/secret-scanning
- Push Protection: https://docs.github.com/code-security/secret-scanning/working-with-secret-scanning-and-push-protection

---

**💡 Tip**: Usa herramientas como `git-secrets` para prevenir commits accidentales con credenciales.
