# Debugging: Problemas con Generación de Gráficos en Producción

## Síntomas
1. La tabla de búsqueda aparece como HTML en lugar de imagen
2. El gráfico Scree Plot no se genera
3. Las imágenes muestran error 404 o no cargan

## Diagnóstico

### 1. Verificar BACKEND_URL
```bash
# En Render Dashboard → tesis-rsl-backend → Environment
BACKEND_URL=https://tesis-rsl-backend.onrender.com
```

**Sin esta variable**, las imágenes apuntarán al frontend en lugar del backend y darán 404.

### 2. Revisar Logs de Python

Después de generar un artículo, busca en los logs de Render:

```
📊 Generando gráficos con Python...
```

Deberías ver:
```
🐍 Python output (raw): {"prisma": "prisma_flow.png", "scree": "scree_plot.png", "chart1": "chart1_search.png"}
📊 Resultados parseados: {prisma: "prisma_flow.png", ...}
✅ URLs finales de gráficos: {prisma: "https://...", scree: "https://...", chart1: "https://..."}
```

Si ves:
```
❌ Error generando gráficos (código de salida: 1)
❌ STDERR: ModuleNotFoundError: No module named 'matplotlib'
```

**Solución**: Las dependencias de Python no están instaladas.

### 3. Verificar Instalación de Python en Render

#### Opción A: Build Command (Recomendado)
En Render Dashboard → tesis-rsl-backend → Settings → Build Command:

```bash
npm install && pip install -r requirements.txt
```

#### Opción B: postinstall script (Ya configurado)
El `package.json` tiene:
```json
{
  "scripts": {
    "postinstall": "pip install -r requirements.txt || true"
  }
}
```

### 4. Verificar requirements.txt
El archivo debe contener:
```
matplotlib==3.7.1
pandas==2.0.1
```

### 5. Verificar que Python existe en el entorno
En los logs de build de Render, busca:
```
Running postinstall script...
```

Si no aparece o falla, Python no está disponible.

### 6. Verificar permisos de escritura en /uploads/charts
Render debe poder escribir en esta carpeta. El código crea el directorio automáticamente, pero verifica los logs por si hay errores de permisos.

## Soluciones Comunes

### Problema: "ModuleNotFoundError: No module named 'matplotlib'"
**Causa**: Dependencies de Python no instaladas
**Solución**:
1. Ve a Render Dashboard → tesis-rsl-backend
2. Settings → Build Command
3. Cambia a: `npm install && pip install -r requirements.txt`
4. Trigger un manual deploy

### Problema: "command not found: python"
**Causa**: Python no está en el PATH o no está instalado
**Solución**:
1. Render usa Python 3 por defecto, pero el nombre del ejecutable puede ser `python3`
2. Edita `python-graph.service.js` línea 47:
   ```javascript
   const pythonProcess = spawn('python3', [this.scriptPath, '--output-dir', this.outputDir]);
   ```

### Problema: Las URLs apuntan al frontend
**Causa**: BACKEND_URL no configurado
**Solución**:
1. Render Dashboard → tesis-rsl-backend → Environment
2. Agregar: `BACKEND_URL=https://tesis-rsl-backend.onrender.com`
3. Save y redeploy

### Problema: Imágenes generadas pero 404
**Causa**: `express.static` no está sirviendo `/uploads`
**Verificar en `server.js`**:
```javascript
this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

## Testing Local

Para probar localmente que Python funciona:

```bash
cd backend
node -e "
const { spawn } = require('child_process');
const proc = spawn('python', ['scripts/generate_charts.py', '--output-dir', 'uploads/charts']);
proc.stdin.write(JSON.stringify({
  prisma: {identified: 100, duplicates: 20, screened: 80, excluded: 50, retrieved: 30, assessed: 30, included: 25},
  scree: {scores: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]},
  search_strategy: [{name: 'IEEE', hits: 50, searchString: 'test'}]
}));
proc.stdin.end();
proc.stdout.on('data', d => console.log(d.toString()));
proc.stderr.on('data', d => console.error(d.toString()));
"
```

Debería generar 3 archivos en `uploads/charts/`.

## Verificación Final

1. ✅ BACKEND_URL configurado en Render
2. ✅ Python instalado (verificar logs de build)
3. ✅ matplotlib y pandas instalados
4. ✅ Logs muestran "✅ URLs finales de gráficos"
5. ✅ Las URLs apuntan a backend, no frontend
6. ✅ `/uploads` está servido por express.static
7. ✅ Archivos .png existen en `/uploads/charts/`
