# Scripts Utilitarios del Backend

Scripts de mantenimiento, verificación y deployment para el backend.

## 📋 Scripts Disponibles

### 🧪 Testing y Verificación

#### `test-apis.js`
Verifica el estado de las API keys de Gemini y ChatGPT.
```bash
node scripts/utils/test-apis.js
```
- ✅ Prueba ambas APIs con requests reales
- 📊 Muestra estado y mensajes de error
- 💡 Sugiere soluciones si hay problemas
- **Usar cuando**: Las APIs no responden o hay errores de quota

### 🔧 Mantenimiento de Base de Datos

#### `check-duplicates.js`
Busca proyectos duplicados en la base de datos.
```bash
node scripts/utils/check-duplicates.js
```
- Identifica duplicados por título y owner
- Muestra estadísticas de proyectos
- **No modifica datos** (solo lectura)

#### `remove-duplicates.js`
Elimina proyectos duplicados (mantiene el más reciente).
```bash
node scripts/utils/remove-duplicates.js
```
- ⚠️ **OPERACIÓN DESTRUCTIVA**
- Elimina versiones antiguas de proyectos duplicados
- Elimina referencias y protocolos asociados
- **Recomendación**: Hacer backup antes de ejecutar

#### `create-screening-table.js`
Crea la tabla `screening_records` en la base de datos.
```bash
node scripts/utils/create-screening-table.js
```
- Ejecuta el script SQL correspondiente
- Verifica que la tabla se creó correctamente
- **Usar cuando**: Migración manual o tabla faltante

### 🔒 Setup y Seguridad

#### `generate-secrets.js`
Genera secrets seguros para JWT y sesiones.
```bash
node scripts/utils/generate-secrets.js
```
- Crea valores aleatorios criptográficamente seguros
- Para uso en producción (Railway, Heroku, etc.)
- **Usar cuando**: Setup inicial o rotación de secrets

---

## 🔧 Scripts de Desarrollo

Los scripts solo para desarrollo/testing están en [`../dev-only/`](../dev-only/README.md):
- `seed-api-usage.js` - Crear datos de prueba
- `clear-api-usage.js` - Limpiar tabla api_usage
- `check-api-usage.js` - Ver estadísticas de uso
- `get-user-id.js` - Listar usuarios

**⚠️ Estos NO deben usarse en producción.**

---

## ⚙️ Configuración

Todos los scripts requieren:
- Variables de entorno en `.env`
- Conexión a PostgreSQL configurada
- Credenciales válidas de API (para test-apis.js)

## 💡 Comandos NPM Sugeridos

Puedes agregar estos alias a `package.json`:

```json
"scripts": {
  "test:apis": "node scripts/utils/test-apis.js",
  "db:check-duplicates": "node scripts/utils/check-duplicates.js",
  "db:remove-duplicates": "node scripts/utils/remove-duplicates.js",
  "secrets:generate": "node scripts/utils/generate-secrets.js"
}
```

Luego ejecutar con:
```bash
npm run test:apis
npm run db:check-duplicates
```

## 🔒 Seguridad

- ❌ NO ejecutar scripts destructivos en producción sin backup
- ❌ NO commitear archivos con datos sensibles
- ✅ Verificar dos veces antes de ejecutar `remove-duplicates.js`
- ✅ Usar variables de entorno para credenciales
