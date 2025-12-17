# ⚠️ Scripts de Desarrollo - NO USAR EN PRODUCCIÓN

Estos scripts son **SOLO PARA DESARROLLO Y TESTING LOCAL**.

## 🚫 IMPORTANTE

- ❌ **NO ejecutar en base de datos de producción**
- ❌ **NO usar para datos reales**
- ✅ Solo para testing local y debugging

---

## 📋 Scripts Disponibles

### seed-api-usage.js
```bash
node scripts/dev-only/seed-api-usage.js
```
Crea datos de prueba falsos en la tabla `api_usage`.
- **Propósito**: Probar dashboard de estadísticas
- **Efecto**: Contamina BD con datos ficticios
- **Reversión**: Usa `clear-api-usage.js`

### clear-api-usage.js
```bash
node scripts/dev-only/clear-api-usage.js
```
**DESTRUCTOR**: Elimina TODOS los registros de `api_usage`.
- **Propósito**: Limpiar datos de prueba
- **⚠️ PELIGRO**: Borra todo el historial de uso de API
- **Reversión**: No hay (los datos se pierden permanentemente)

### check-api-usage.js
```bash
node scripts/dev-only/check-api-usage.js
```
Muestra últimos registros de `api_usage` y usuarios.
- **Propósito**: Verificar que se están registrando los requests de IA
- **Alternativa mejor**: Crear endpoint `/api/admin/api-usage`

### get-user-id.js
```bash
node scripts/dev-only/get-user-id.js
```
Lista todos los usuarios con sus IDs.
- **Propósito**: Encontrar user_id para otros scripts
- **Alternativa mejor**: Crear endpoint `/api/admin/users`

---

## 💡 Recomendaciones

### En lugar de estos scripts, considera:

1. **Crear endpoints administrativos** (más seguro):
   ```javascript
   GET  /api/admin/api-usage       // Ver estadísticas
   GET  /api/admin/users           // Listar usuarios
   POST /api/admin/seed-test-data  // Con confirmación
   ```

2. **Agregar comandos npm** (más conveniente):
   ```json
   "scripts": {
     "dev:seed": "node scripts/dev-only/seed-api-usage.js",
     "dev:clean": "node scripts/dev-only/clear-api-usage.js"
   }
   ```

3. **Dashboard de administración** en el frontend:
   - Página `/admin` con autenticación
   - Visualización de estadísticas
   - Botones con confirmación para acciones destructivas

---

## 🔒 Protección en Producción

Si despliegas en producción, **elimina esta carpeta** o agrégala al `.gitignore`:

```gitignore
# En .gitignore
scripts/dev-only/
```

O protégela con variables de entorno:

```javascript
// Al inicio de cada script
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Este script NO debe ejecutarse en producción');
  process.exit(1);
}
```
