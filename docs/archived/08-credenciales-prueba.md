# 🔐 Credenciales de Prueba

## Usuario de Prueba

Para probar el sistema, puedes usar estas credenciales:

**Email:** `test@example.com`  
**Password:** `Test123!`

---

## Crear un Nuevo Usuario

### Opción 1: Desde el Frontend

1. Ve a http://localhost:3000/login
2. No hay botón de registro todavía, usa Opción 2

### Opción 2: Usando PowerShell/Terminal

```powershell
$body = @{
    email = 'tunombre@example.com'
    fullName = 'Tu Nombre Completo'
    password = 'TuPassword123!'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3002/api/auth/register' `
    -Method Post `
    -Body $body `
    -ContentType 'application/json'
```

### Opción 3: Usando Postman o Thunder Client

**POST** `http://localhost:3002/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "tunombre@example.com",
  "fullName": "Tu Nombre Completo",
  "password": "TuPassword123!"
}
```

---

## Login con Google OAuth

1. Ve a http://localhost:3000/login
2. Click en "Continuar con Google"
3. Autoriza la aplicación
4. Serás redirigido al dashboard

**Nota:** Debes tener configuradas las credenciales de Google OAuth en el archivo `.env` del backend:

```env
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3002/api/auth/google/callback
```

---

## Troubleshooting

### Error: "No se puede conectar al servidor"

✅ **Solución:** Verifica que ambos servidores estén corriendo:

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3002

```powershell
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

### Error: "Credenciales inválidas"

✅ **Solución:** Verifica que el usuario exista en la base de datos:

```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

### Error: "Failed to fetch"

✅ **Solución:** Verifica que el `NEXT_PUBLIC_API_URL` en `frontend/.env.local` apunte al puerto correcto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

Reinicia el frontend después de cambiar variables de entorno:

```powershell
cd frontend
Remove-Item -Path .next -Recurse -Force
npm run dev
```

### El login funciona pero no me redirige

✅ **Solución:** Verifica la consola del navegador (F12). El problema puede estar en:

1. El token no se está guardando correctamente en localStorage
2. El middleware está bloqueando la ruta
3. Hay un error en el `auth-context`

Revisa en **Application → Local Storage → http://localhost:3000**:
- Debe haber un item `token` con un JWT

Revisa en **Application → Cookies → http://localhost:3000**:
- Debe haber una cookie `authToken`

---

## Verificar el Token JWT

Si tienes un token, puedes verificar su contenido en https://jwt.io/

El payload debe contener:
```json
{
  "id": "uuid-del-usuario",
  "email": "test@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Comandos Útiles

### Ver usuarios en la base de datos

```sql
SELECT id, email, full_name, created_at FROM users;
```

### Eliminar un usuario

```sql
DELETE FROM users WHERE email = 'test@example.com';
```

### Crear usuario manualmente en PostgreSQL

```sql
INSERT INTO users (email, full_name, password_hash)
VALUES (
  'test@example.com',
  'Usuario Test',
  '$2b$10$abcdefghijklmnopqrstuvwxyz123456789'
);
```

**Nota:** El password hash debe ser generado con bcrypt. Es mejor usar el endpoint `/api/auth/register`.

---

## Estado de los Servicios

### ✅ Servicios Corriendo

```
Frontend:  http://localhost:3000
Backend:   http://localhost:3002
Database:  PostgreSQL localhost:5432
```

### 🔍 Health Check

```powershell
Invoke-RestMethod -Uri 'http://localhost:3002/health'
```

Debe retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-11-27T..."
}
```

---

## 📞 Soporte

Si sigues teniendo problemas:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Network**
3. Intenta hacer login
4. Busca la petición a `/api/auth/login`
5. Copia el error completo
6. Comparte el error para ayuda adicional

