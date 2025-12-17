# ⚡ Inicio Rápido

## 🚀 Configuración en 5 Minutos

### 1. Prerrequisitos
- ✅ Node.js 18+ instalado
- ✅ PostgreSQL instalado y corriendo
- ✅ Git instalado

### 2. Clonar y configurar

```powershell
# Ir al directorio del backend
cd backend

# Instalar dependencias
npm install
```

### 3. Configurar Base de Datos

```powershell
# Crear base de datos
psql -U postgres -c "CREATE DATABASE thesis_rsl;"

# Ejecutar todos los scripts SQL
cd ..
Get-ChildItem scripts\*.sql | ForEach-Object { psql -U postgres -d thesis_rsl -f $_.FullName }
cd backend
```

### 4. Configurar Variables de Entorno

```powershell
# Copiar archivo de ejemplo
copy .env.example .env
```

Editar `.env` con estos valores mínimos:

```env
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/thesis_rsl
JWT_SECRET=mi_secreto_super_seguro_123456
SESSION_SECRET=otro_secreto_diferente_789
FRONTEND_URL=http://localhost:3000
```

### 5. Iniciar el Servidor

```powershell
npm run dev
```

Deberías ver:

```
✅ Conectado a PostgreSQL exitosamente
✅ Extensiones de PostgreSQL verificadas
✅ Passport configurado con Google OAuth

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Servidor iniciado exitosamente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: http://localhost:3001
🌍 Entorno: development
```

## ✅ Verificar que Funciona

### 1. Health Check

```powershell
curl http://localhost:3001/health
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "API funcionando correctamente"
}
```

### 2. Registrar Usuario de Prueba

```powershell
curl -X POST http://localhost:3001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"fullName\":\"Test User\",\"password\":\"password123\"}'
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "fullName": "Test User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Crear Proyecto de Prueba

Primero guarda el token del paso anterior, luego:

```powershell
$token = "tu_token_aqui"

curl -X POST http://localhost:3001/api/projects `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{\"title\":\"Mi Primera RSL\",\"description\":\"Proyecto de prueba\"}'
```

## 🎯 Próximos Pasos

### Opción A: Usar con Postman
1. Descarga Postman
2. Importa la colección (si existe)
3. Configura la variable `baseUrl` a `http://localhost:3001`
4. Empieza a probar endpoints

### Opción B: Conectar con Frontend
1. Ve al directorio `frontend`
2. Sigue las instrucciones en `FRONTEND-INTEGRATION.md`
3. El frontend se conectará automáticamente al backend

### Opción C: Configurar Google OAuth
1. Lee `INSTALLATION.md` sección "Configurar Google OAuth"
2. Obtén credenciales en Google Cloud Console
3. Agrega `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` al `.env`
4. Reinicia el servidor

## 🐛 Problemas Comunes

### "database does not exist"
```powershell
psql -U postgres -c "CREATE DATABASE thesis_rsl;"
```

### "password authentication failed"
- Verifica el password en `.env`
- Prueba: `psql -U postgres` (debe pedir el password correcto)

### "Port 3001 already in use"
```powershell
# Cambiar puerto en .env
PORT=3002
```

### Scripts SQL fallan
```powershell
# Ejecutar uno por uno
psql -U postgres -d thesis_rsl -f ../scripts/01-create-users-table.sql
psql -U postgres -d thesis_rsl -f ../scripts/02-create-projects-table.sql
# etc...
```

## 📖 Más Información

- `README.md` - Documentación completa
- `INSTALLATION.md` - Guía detallada de instalación
- `FRONTEND-INTEGRATION.md` - Conectar con frontend
- `SUMMARY.md` - Resumen del proyecto

## 🎉 ¡Todo Listo!

Si llegaste aquí y todo funcionó, **¡felicidades!** 🎊

Tu backend está corriendo y listo para:
- ✅ Autenticar usuarios
- ✅ Gestionar proyectos
- ✅ Conectarse con el frontend
- ✅ Expandirse con nuevas funcionalidades

**¡A construir cosas increíbles! 🚀**
