# 🧪 Guía de Pruebas - Sistema de Cribado con Embeddings

## ✅ Estado Actual

- ✅ **Backend:** Corriendo en http://localhost:3001
- ✅ **Dependencias:** Instaladas (@xenova/transformers)
- ✅ **API Key:** Actualizada
- ✅ **Rutas:** Registradas
- ⏳ **Frontend:** Pendiente de prueba

## 🔍 Verificaciones Iniciales

### 1. Verificar Backend

```bash
# En PowerShell
cd backend
npm run dev
```

**Salida esperada:**
```
✅ OpenAI inicializado correctamente
✅ Gemini inicializado correctamente
✅ Conectado a PostgreSQL exitosamente
🚀 Servidor iniciado exitosamente
📍 URL: http://localhost:3001
```

### 2. Verificar Frontend

```bash
# En otra terminal PowerShell
cd frontend
npm run dev
```

**Salida esperada:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## 🧪 Pruebas del Sistema

### Prueba 1: Interfaz de Cribado

**Pasos:**
1. Abre http://localhost:3000
2. Inicia sesión (OAuth Google)
3. Ve a un proyecto existente
4. Haz clic en "Cribado de Referencias"

**Verificar:**
- [ ] Se muestra el panel "Cribado Automático con IA"
- [ ] Se ven dos tabs: "Embeddings" y "LLM (Gemini)"
- [ ] El slider de umbral funciona (50% - 95%)
- [ ] Se muestran las estadísticas (Total, Pendientes)

### Prueba 2: Cambio de Método

**Pasos:**
1. Haz clic en el tab "Embeddings"
2. Lee la descripción del método
3. Haz clic en el tab "LLM (Gemini)"
4. Lee la descripción del método

**Verificar:**
- [ ] Las descripciones son diferentes
- [ ] Se muestra info de velocidad, costo, reproducibilidad
- [ ] El icono cambia (BarChart3 vs Sparkles)

### Prueba 3: Cribado con Embeddings (Sin Referencias)

**Pasos:**
1. Selecciona tab "Embeddings"
2. Ajusta umbral a 70%
3. Haz clic en "Ejecutar Cribado con Embeddings"

**Resultado esperado si NO hay referencias:**
- [ ] Toast: "Sin referencias pendientes"
- [ ] Botón deshabilitado

### Prueba 4: Importar Referencias de Prueba

**Pasos:**
1. En la página de Cribado, haz clic en "Buscar en Bases de Datos"
2. Ingresa una búsqueda de prueba, por ejemplo: "machine learning healthcare"
3. Selecciona algunas referencias
4. Haz clic en "Agregar Seleccionadas"

**Verificar:**
- [ ] Las referencias se agregan a la tabla
- [ ] Estado: "pending"
- [ ] El contador de "Pendientes" aumenta

### Prueba 5: Cribado con Embeddings (Con Referencias)

**⚠️ IMPORTANTE:** Esta es la prueba principal del sistema

**Pre-requisitos:**
- Tener al menos 5-10 referencias en estado "pending"
- Tener protocolo PICO definido en el proyecto

**Pasos:**
1. Selecciona tab "Embeddings"
2. Ajusta umbral a 70%
3. Haz clic en "Ejecutar Cribado con Embeddings"
4. Espera a que se complete (barra de progreso)

**Verificar en Backend (Consola):**
```
🔄 Procesando 10 referencias con embeddings...
🔄 Inicializando modelo de embeddings: Xenova/all-MiniLM-L6-v2
✅ Modelo de embeddings cargado correctamente
✅ Procesamiento completado: { total: 10, toInclude: 3, toExclude: 7, ... }
```

**Verificar en Frontend:**
- [ ] Barra de progreso llega a 100%
- [ ] Toast: "Cribado completado" con resumen
- [ ] Referencias actualizadas:
  - [ ] Algunas marcan "included" (verde)
  - [ ] Otras marcan "excluded" (rojo)
  - [ ] Cada referencia tiene un score (%)
- [ ] Stats actualizadas:
  - [ ] "Pendientes" disminuye
  - [ ] "Incluidas" aumenta
  - [ ] "Excluidas" aumenta

**Primera Ejecución (Descarga del Modelo):**
- Puede tardar 2-5 minutos (descarga ~100MB)
- Verás en consola: "Downloading model..."
- Ejecuciones posteriores serán rápidas (modelo en cache)

### Prueba 6: Comparar con Método LLM

**Pasos:**
1. Restablece algunas referencias a "pending" (manualmente)
2. Selecciona tab "LLM (Gemini)"
3. Ajusta umbral a 70%
4. Haz clic en "Ejecutar Cribado con LLM"

**Verificar:**
- [ ] Procesamiento más lento que embeddings
- [ ] Referencias clasificadas con explicación (aiReasoning)
- [ ] Resultados similares pero con mayor detalle

### Prueba 7: Diferentes Umbrales

**Experimento:**
1. Restablece referencias a "pending"
2. Ejecuta cribado con umbral 50%
3. Anota cuántas se incluyen

4. Restablece referencias a "pending"
5. Ejecuta cribado con umbral 80%
6. Anota cuántas se incluyen

**Resultado esperado:**
- Umbral 50%: Más referencias incluidas (liberal)
- Umbral 80%: Menos referencias incluidas (conservador)

## 🐛 Problemas Comunes

### Error 1: "No se pudo inicializar el modelo"

**Síntoma:** Error en consola del backend al intentar cribado

**Causas posibles:**
1. Sin conexión a internet (primera vez)
2. Espacio insuficiente en disco
3. Permisos de escritura en directorio cache

**Solución:**
```bash
# Verificar espacio en disco
Get-PSDrive C

# Verificar conexión
Test-NetConnection huggingface.co

# Limpiar cache (si es necesario)
Remove-Item -Recurse -Force $env:USERPROFILE\.cache\huggingface
```

### Error 2: "Protocol is required"

**Síntoma:** Error 400 al ejecutar cribado

**Causa:** El proyecto no tiene protocolo PICO definido

**Solución:**
1. Ve a la sección "Protocolo" del proyecto
2. Completa el wizard hasta el paso 2 (PICO)
3. Guarda el protocolo
4. Vuelve a intentar el cribado

### Error 3: Referencias no se actualizan

**Síntoma:** El cribado se ejecuta pero las referencias no cambian de estado

**Causa:** Problemas con la actualización del estado

**Solución:**
1. Abre DevTools (F12)
2. Ve a Console
3. Busca errores de JavaScript
4. Revisa la respuesta de la API en Network

### Error 4: Proceso muy lento

**Síntoma:** El cribado tarda más de 5 minutos para 100 referencias

**Causas posibles:**
1. Primera ejecución (descargando modelo)
2. CPU lenta
3. Muchas referencias (>1000)

**Solución:**
```javascript
// Opción 1: Procesar en lotes más pequeños
// En backend/src/domain/use-cases/screen-references-embeddings.use-case.js
// Línea ~197
const batchSize = 100 // Reducir si es necesario

// Opción 2: Habilitar logs de progreso
console.log(`Procesando referencia ${i + 1}/${references.length}`)
```

## 📊 Resultados Esperados

### Métricas de Rendimiento

**Embeddings (all-MiniLM-L6-v2):**
- Primera ejecución: 2-5 min (descarga)
- 10 referencias: ~5 segundos
- 100 referencias: ~30 segundos
- 1000 referencias: ~3 minutos

**LLM (Gemini):**
- 10 referencias: ~30 segundos
- 100 referencias: ~5 minutos
- 1000 referencias: ~50 minutos

### Distribución Típica (Umbral 70%)

Para un protocolo bien definido:
- **A Incluir (≥70%):** 20-40%
- **A Revisar (60-70%):** 15-25%
- **A Excluir (<60%):** 40-65%

## 🎯 Prueba de Integración Completa

### Escenario: Cribado de 50 Referencias Reales

**Paso 1: Preparación**
```bash
# Asegúrate de tener:
- Proyecto con protocolo PICO completo
- 50+ referencias importadas en estado "pending"
- Backend corriendo sin errores
- Frontend corriendo sin errores
```

**Paso 2: Ejecución**
1. Ve a Cribado
2. Verifica: 50 referencias pendientes
3. Selecciona "Embeddings"
4. Umbral: 70%
5. Ejecuta cribado
6. **Cronometra el tiempo**

**Paso 3: Validación**
- [ ] Tiempo total < 1 minuto (después de primera descarga)
- [ ] Todas las referencias procesadas (50/50)
- [ ] Stats correctas: pendientes=0, incluidas+excluidas=50
- [ ] Scores entre 0-100%
- [ ] Sin errores en consola

**Paso 4: Revisión Manual**
1. Ordena por score descendente
2. Revisa las 5 referencias con mayor score
3. Revisa las 5 referencias con menor score

**Validar:**
- [ ] Referencias con alto score son relevantes al protocolo
- [ ] Referencias con bajo score no son relevantes
- [ ] La clasificación tiene sentido

## 📝 Checklist Final

### Backend
- [ ] Servidor inicia sin errores
- [ ] @xenova/transformers instalado
- [ ] Rutas de embeddings disponibles
- [ ] Logs de procesamiento aparecen
- [ ] Modelo se descarga correctamente

### Frontend
- [ ] Tabs de método funcionan
- [ ] Slider de umbral funciona
- [ ] Botón ejecuta cribado
- [ ] Barra de progreso se muestra
- [ ] Toast con resultados aparece
- [ ] Referencias se actualizan
- [ ] Stats se actualizan

### Funcionalidad
- [ ] Embeddings se generan sin error
- [ ] Similitud se calcula correctamente
- [ ] Clasificación según umbral funciona
- [ ] Batch processing completa todas
- [ ] Resultados son consistentes

### Rendimiento
- [ ] Primera ejecución descarga modelo
- [ ] Ejecuciones posteriores son rápidas
- [ ] 100 refs < 1 minuto
- [ ] Sin crashes ni timeouts

## 🎓 Próximos Pasos

Una vez que todas las pruebas pasen:

1. **Probar con datos reales de tu tesis**
2. **Comparar resultados Embeddings vs LLM**
3. **Ajustar umbral óptimo para tu caso**
4. **Documentar decisiones de cribado**
5. **Exportar resultados finales**

## 📞 Soporte

Si alguna prueba falla:
1. Revisa los logs del backend
2. Revisa DevTools del frontend
3. Consulta `docs/EMBEDDINGS-SCREENING.md`
4. Consulta `docs/IMPLEMENTATION-EMBEDDINGS.md`

---

**¡Buena suerte con las pruebas!** 🚀
