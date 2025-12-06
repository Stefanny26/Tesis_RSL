# 🌐 Configuración de Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio (ej: `thesis-rsl.com`) en lugar de las URLs de Vercel/Railway.

---

## 📋 Requisitos

- Dominio registrado (ej: Namecheap, GoDaddy, Google Domains)
- Costo: ~$10-15/año por el dominio
- Tiempo: ~15-30 minutos

---

## ▲ Configurar Dominio en Vercel (Frontend)

### Paso 1: Agregar Dominio en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Domains
3. Click "Add Domain"
4. Ingresa tu dominio: `thesis-rsl.com` o `www.thesis-rsl.com`
5. Vercel te mostrará los registros DNS necesarios

### Paso 2: Configurar DNS en tu Proveedor

**Opción A: Dominio principal (thesis-rsl.com)**
```
Tipo: A
Nombre: @
Valor: 76.76.21.21
TTL: 3600
```

**Opción B: Subdominio (www.thesis-rsl.com)**
```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
TTL: 3600
```

### Paso 3: Esperar Propagación

- DNS tarda 5-48 horas en propagarse
- Vercel agregará automáticamente SSL (HTTPS)
- Puedes verificar en: https://dnschecker.org

### Paso 4: Configurar Redirección (Opcional)

Para redirigir `thesis-rsl.com` → `www.thesis-rsl.com`:

1. Vercel → Settings → Domains
2. Click en "Edit" del dominio sin www
3. Marcar "Redirect to www.thesis-rsl.com"

---

## 🚂 Configurar Dominio en Railway (Backend)

### Paso 1: Agregar Dominio Personalizado

1. Railway Dashboard → Tu servicio Backend
2. Settings → Networking
3. Click "Custom Domain"
4. Ingresa: `api.thesis-rsl.com`

### Paso 2: Configurar DNS

Railway te mostrará el registro CNAME:

```
Tipo: CNAME
Nombre: api
Valor: xxx.up.railway.app
TTL: 3600
```

### Paso 3: Verificar

Railway verificará automáticamente y configurará SSL.

---

## 🔧 Actualizar Variables de Entorno

Después de configurar los dominios:

### Backend (Railway)

```env
FRONTEND_URL=https://thesis-rsl.com
GOOGLE_CALLBACK_URL=https://api.thesis-rsl.com/api/auth/google/callback
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://api.thesis-rsl.com
```

---

## 🔐 Actualizar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edita tu OAuth 2.0 Client ID
3. Authorized JavaScript origins:
   ```
   https://thesis-rsl.com
   https://www.thesis-rsl.com
   ```
4. Authorized redirect URIs:
   ```
   https://api.thesis-rsl.com/api/auth/google/callback
   https://thesis-rsl.com/auth/callback
   https://www.thesis-rsl.com/auth/callback
   ```

---

## 📧 Configurar Email Personalizado (Opcional)

### Usando Gmail con tu dominio

1. Google Workspace (antes G Suite): $6/usuario/mes
2. Configurar en [admin.google.com](https://admin.google.com)
3. Verificar dominio con TXT record

### Usando Zoho Mail (Gratis para 1 usuario)

1. Registrar en [Zoho Mail](https://www.zoho.com/mail/)
2. Plan gratuito: 1 usuario, 5GB
3. Configurar registros MX:

```
Prioridad 10: mx.zoho.com
Prioridad 20: mx2.zoho.com
```

---

## 🎨 Ejemplos de Configuración

### Setup Completo Recomendado

```
Frontend: https://thesis-rsl.com
         https://www.thesis-rsl.com (redirige a principal)
Backend:  https://api.thesis-rsl.com
Email:    contacto@thesis-rsl.com
```

### Setup Alternativo (Subdominio para todo)

```
Frontend: https://app.thesis-rsl.com
Backend:  https://api.thesis-rsl.com
Landing:  https://thesis-rsl.com (página estática)
```

---

## 📊 Subdominios Útiles

### Ambiente de Staging

```
Frontend Staging: https://staging.thesis-rsl.com
Backend Staging:  https://api-staging.thesis-rsl.com
```

Configurar en Vercel/Railway:
1. Crear nuevo proyecto/servicio
2. Conectar rama `staging` de GitHub
3. Configurar dominio personalizado

### Documentación

```
Docs: https://docs.thesis-rsl.com
```

Opciones:
- GitHub Pages
- GitBook
- Docusaurus en Vercel

---

## 🔍 Verificar Configuración

### DNS Checker
```
https://dnschecker.org
```

Verificar que tu dominio apunte correctamente.

### SSL Checker
```
https://www.sslshopper.com/ssl-checker.html
```

Verificar que HTTPS funcione correctamente.

### Test de Velocidad
```
https://pagespeed.web.dev
```

Verificar performance del sitio.

---

## 💰 Costos Estimados

### Solo Hosting (Sin dominio)
- Vercel: $0/mes
- Railway: $5-10/mes
- **Total: $5-10/mes**

### Con Dominio Personalizado
- Dominio .com: $10-15/año (~$1.25/mes)
- Vercel: $0/mes
- Railway: $5-10/mes
- **Total: $6-11/mes**

### Con Email Personalizado
- Google Workspace: +$6/mes
- O Zoho Mail: +$0/mes (plan gratuito)

---

## ⚠️ Consideraciones

### Tiempo de Propagación DNS
- Mínimo: 5-10 minutos
- Promedio: 1-2 horas
- Máximo: 48 horas

### Redirección HTTPS
- Vercel y Railway la configuran automáticamente
- No necesitas certificado SSL manual

### Renovación de Dominio
- Configurar auto-renovación en tu proveedor
- Recibir notificaciones 30 días antes

---

## 🎯 Checklist de Configuración

- [ ] Dominio registrado
- [ ] Registros DNS configurados
- [ ] Dominios agregados en Vercel
- [ ] Dominio backend agregado en Railway
- [ ] Variables de entorno actualizadas
- [ ] Google OAuth actualizado con nuevas URLs
- [ ] SSL verificado (HTTPS funciona)
- [ ] Frontend accesible desde dominio
- [ ] Backend accesible desde api.dominio
- [ ] Login funciona correctamente
- [ ] No hay errores de CORS

---

## 🆘 Troubleshooting

### "DNS_PROBE_FINISHED_NXDOMAIN"
- Verifica que los registros DNS estén correctos
- Espera más tiempo (hasta 48h)
- Limpia caché DNS: `ipconfig /flushdns` (Windows)

### "SSL_ERROR_BAD_CERT_DOMAIN"
- Espera a que Vercel/Railway genere el certificado
- Puede tardar hasta 24h después de configurar DNS

### "Mixed Content" (HTTP/HTTPS)
- Verifica que todas las URLs usen HTTPS
- Actualiza `NEXT_PUBLIC_API_URL` con https://

---

## 📚 Recursos

### Proveedores de Dominios Recomendados
- **Namecheap**: https://www.namecheap.com (recomendado)
- **Google Domains**: https://domains.google
- **Cloudflare**: https://www.cloudflare.com/products/registrar/

### Guías Oficiales
- Vercel Domains: https://vercel.com/docs/concepts/projects/domains
- Railway Custom Domains: https://docs.railway.app/deploy/custom-domains

---

**💡 Tip**: No es obligatorio tener dominio personalizado. Las URLs de Vercel/Railway funcionan perfectamente para proyectos de tesis!
