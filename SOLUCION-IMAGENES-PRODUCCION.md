# 🔧 Solución: Imágenes No Cargan en Producción

## Problema Identificado
Las imágenes de gráficos (PRISMA Flow, Scree Plot, Tabla de Búsqueda) no se muestran en producción porque:
1. Python no está ejecutando correctamente el script de generación
2. Las dependencias de Python (matplotlib, pandas) no están instaladas
3. O el comando `python` no se encuentra en el PATH

## ✅ Soluciones (Aplicar en orden)

### Solución 1: Cambiar Build Command en Render (MÁS PROBABLE)

1. Ve a **Render Dashboard** → Tu proyecto backend
2. Click en **Settings** (configuración)
3. Busca **Build Command**
4. Cámbialo a:
   ```bash
   npm install && pip3 install -r requirements.txt
   ```
5. Click en **Save Changes**
6. Haz un **Manual Deploy** para aplicar los cambios

### Solución 2: Cambiar `python` a `python3` en el código

Si Python está instalado como `python3` en lugar de `python`, necesitas actualizar el código:

**Archivo a editar:** `backend/src/infrastructure/services/python-graph.service.js`

**Línea 47**, cambiar:
```javascript
const pythonProcess = spawn('python', [this.scriptPath, '--output-dir', this.outputDir]);
```

Por:
```javascript
const pythonProcess = spawn('python3', [this.scriptPath, '--output-dir', this.outputDir]);
```

### Solución 3: Verificar BACKEND_URL en Variables de Entorno

1. Ve a **Render Dashboard** → Tu proyecto backend
2. Click en **Environment** (variables de entorno)
3. Verifica que exista esta variable:
   ```
   BACKEND_URL=https://tu-backend-url.onrender.com
   ```
   (Reemplaza con tu URL real de Render)
4. **NO pongas** `/` al final de la URL
5. Si la agregaste o modificaste, haz **Manual Deploy**

### Solución 4: Verificar en los Logs

Después de hacer los cambios y deployar:

1. Ve a **Render Dashboard** → Tu backend → **Logs**
2. Genera un nuevo artículo desde el frontend
3. Busca en los logs estas líneas:

✅ **Si funciona correctamente**, verás:
```
📊 Generando gráficos con Python...
🐍 Python output (raw): {"prisma": "prisma_flow.png", ...}
✅ URLs finales de gráficos: {prisma: "https://...", ...}
```

❌ **Si hay error**, verás algo como:
```
❌ Error generando gráficos (código de salida: 1)
❌ STDERR: ModuleNotFoundError: No module named 'matplotlib'
```
O:
```
❌ STDERR: command not found: python
```

## 🔍 Verificación Rápida

Para verificar que las imágenes funcionan:

1. Genera un artículo desde el frontend
2. Abre la consola del navegador (F12)
3. Ve a la pestaña **Network**
4. Busca requests a URLs como:
   ```
   https://tu-backend.onrender.com/uploads/charts/prisma_flow_xxxxx.png
   ```
5. Si ves **404**: Las imágenes no se están generando
6. Si ves **200**: Las imágenes se generaron pero quizás no se muestran correctamente

## 📋 Checklist de Verificación

- [ ] Build Command incluye: `npm install && pip3 install -r requirements.txt`
- [ ] Variable `BACKEND_URL` configurada correctamente en Render
- [ ] El código usa `python3` en lugar de `python` (si es necesario)
- [ ] requirements.txt contiene matplotlib y pandas
- [ ] Hiciste un Manual Deploy después de los cambios
- [ ] Los logs no muestran errores de Python

## 🆘 Si Aún No Funciona

Si después de aplicar todas las soluciones el problema persiste:

1. **Revisa los logs completos** durante el build:
   - Busca mensajes sobre instalación de pip/python
   - Verifica que no haya errores durante `pip3 install`

2. **Considera usar Docker** (más confiable):
   - Crea un `Dockerfile` con Node.js + Python
   - Esto garantiza que ambos estén disponibles

3. **Alternativa temporal**: Deshabilitar gráficos
   - Modifica el código para que no falle si Python no está disponible
   - Ya está implementado (devuelve `{}` en caso de error)

## 📝 Notas Importantes

- Render Free tier puede tener limitaciones con Python
- Los archivos generados en `/uploads/charts` son temporales y se borran en cada deploy
- Si usas Render Disk, necesitas configurarlo para persistencia de archivos
