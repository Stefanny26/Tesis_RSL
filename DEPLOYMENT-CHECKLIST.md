# ✅ Checklist de Despliegue

Marca cada item cuando lo completes:

## 📦 Pre-Despliegue

- [ ] Código funciona localmente
- [ ] Variables `.env` configuradas correctamente
- [ ] Base de datos local tiene todas las tablas
- [ ] Frontend conecta con Backend local

## 🗂️ GitHub

- [ ] Repositorio creado en GitHub
- [ ] Código subido (`git push`)
- [ ] `.gitignore` configurado correctamente
- [ ] README.md actualizado con info del proyecto

## 🚂 Railway - Backend

- [ ] Cuenta creada en Railway
- [ ] Proyecto creado desde GitHub
- [ ] Root Directory configurado: `backend`
- [ ] PostgreSQL database agregada
- [ ] Variables de entorno configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL=https://...`
  - [ ] `DATABASE_URL` (automática)
  - [ ] `JWT_SECRET` (nuevo generado)
  - [ ] `SESSION_SECRET` (nuevo generado)
  - [ ] `OPENAI_API_KEY`
  - [ ] `GEMINI_API_KEY`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `GOOGLE_CALLBACK_URL`
- [ ] Migraciones SQL ejecutadas (todos los scripts)
- [ ] Backend desplegado exitosamente
- [ ] URL del backend copiada: `_______________________`

## ▲ Vercel - Frontend

- [ ] Cuenta creada en Vercel
- [ ] Proyecto importado desde GitHub
- [ ] Root Directory configurado: `frontend`
- [ ] Variable de entorno configurada:
  - [ ] `NEXT_PUBLIC_API_URL=https://tu-backend.railway.app`
- [ ] Frontend desplegado exitosamente
- [ ] URL del frontend copiada: `_______________________`

## 🔄 Actualizar URLs Cruzadas

- [ ] Railway: `FRONTEND_URL` actualizada con URL de Vercel
- [ ] Railway redesplegado automáticamente

## 🔐 Google OAuth

- [ ] Google Cloud Console abierto
- [ ] OAuth 2.0 Client ID editado
- [ ] Authorized JavaScript origins agregadas:
  - [ ] `https://tu-app.vercel.app`
- [ ] Authorized redirect URIs agregadas:
  - [ ] `https://tu-backend.railway.app/api/auth/google/callback`
  - [ ] `https://tu-app.vercel.app/auth/callback`

## ✅ Verificación

- [ ] Backend responde: `https://tu-backend.railway.app/api/...`
- [ ] Frontend carga: `https://tu-app.vercel.app`
- [ ] Login funciona correctamente
- [ ] Google OAuth funciona
- [ ] Crear proyecto funciona
- [ ] Generar criterios con IA funciona
- [ ] Importar referencias funciona
- [ ] No hay errores de CORS en consola

## 📊 Post-Despliegue

- [ ] Logs de Railway revisados (sin errores)
- [ ] Logs de Vercel revisados (sin errores)
- [ ] Analytics de Vercel configurado
- [ ] Monitoreo activado
- [ ] Backup de base de datos configurado (Railway Dashboard)

## 📝 Documentación

- [ ] URLs de producción guardadas
- [ ] Credenciales guardadas en lugar seguro
- [ ] Equipo notificado de las nuevas URLs
- [ ] Documentación de usuario actualizada

## 🎉 ¡Completado!

- [ ] Aplicación funcionando en producción
- [ ] Usuarios pueden acceder
- [ ] Todo probado y verificado

---

**URLs Finales:**

- Frontend: `_______________________________________`
- Backend: `_______________________________________`
- Database: `Railway Dashboard`

**Fecha de despliegue:** `_______________________`

**Notas adicionales:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 🆘 Si algo falla:

1. Revisar logs en Railway y Vercel
2. Verificar variables de entorno
3. Consultar `DEPLOYMENT.md` sección Troubleshooting
4. Revisar CORS (URLs deben coincidir exactamente)
