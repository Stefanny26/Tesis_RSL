# Guía: Fase 3 - Evaluación de Texto Completo

## 📋 ¿Qué es la Fase 3?

La **Fase 3** es la evaluación final donde revisas el **PDF completo** de cada artículo que fue **INCLUIDO** en la Fase 2 (Cribado Híbrido). 

En esta fase determines si el artículo realmente cumple con los criterios de inclusión leyendo el documento completo.

---

## 🎯 Objetivo

Evaluar en profundidad los artículos que pasaron el cribado automático, usando un **sistema de 7 criterios** con puntaje de 0-12 puntos.

---

## 📝 Flujo de Trabajo

### Paso 1: Cargar PDF
1. Ve a la pestaña **"Fase 3: Evaluación Texto Completo"**
2. Verás la lista de referencias **INCLUIDAS** en Fase 2
3. Para cada referencia, haz click en **"Cargar PDF"**
4. Selecciona el archivo PDF del artículo
5. El PDF se sube al servidor y queda guardado permanentemente

### Paso 2: Ver PDF
- Una vez cargado, aparecerá el botón **"Ver PDF"**
- Click en "Ver PDF" abre el documento en una nueva pestaña
- Lee el artículo completo para evaluarlo

### Paso 3: Evaluar Artículo
1. Después de leer el PDF, haz click en **"Evaluar"**
2. Se abre un formulario con **7 criterios de evaluación**:
   - **Relevancia** (0-2 puntos)
   - **Intervención presente** (0-2 puntos)
   - **Validez metodológica** (0-2 puntos)
   - **Datos reportados** (0-2 puntos)
   - **Texto accesible** (0-1 punto)
   - **Rango de fecha** (0-1 punto)
   - **Calidad metodológica** (0-2 puntos)

3. **Mueve los sliders** para asignar puntajes según tu evaluación
4. El sistema calcula automáticamente:
   - **Puntaje total**: Suma de todos los criterios
   - **Decisión**: 
     - ✅ **INCLUIR** si puntaje ≥ 7
     - ❌ **EXCLUIR** si puntaje < 7

5. Opcionalmente, agrega **comentarios** explicando tu decisión
6. Click en **"Guardar Evaluación"**

---

## 📊 Sistema de Puntaje

| Puntaje Total | Decisión | Acción |
|--------------|----------|---------|
| 7-12 puntos  | ✅ INCLUIR | Artículo pasa a la lista final |
| 0-6 puntos   | ❌ EXCLUIR | Artículo se descarta con motivo |

**Umbral por defecto**: 7 puntos (puedes ajustarlo si necesitas)

---

## 🔍 Criterios de Evaluación Detallados

### 1. Relevancia (0-2 puntos)
- **2**: Altamente relevante para la pregunta de investigación
- **1**: Parcialmente relevante
- **0**: No relevante

### 2. Intervención Presente (0-2 puntos)
- **2**: La intervención IoT está claramente descrita
- **1**: La intervención es mencionada pero no detallada
- **0**: No hay intervención o no es IoT

### 3. Validez Metodológica (0-2 puntos)
- **2**: Metodología rigurosa y bien descrita
- **1**: Metodología aceptable con algunas limitaciones
- **0**: Metodología débil o no descrita

### 4. Datos Reportados (0-2 puntos)
- **2**: Resultados completos y bien documentados
- **1**: Resultados parciales
- **0**: Resultados insuficientes o no reportados

### 5. Texto Accesible (0-1 punto)
- **1**: Texto completo disponible y legible
- **0**: Texto incompleto o inaccesible

### 6. Rango de Fecha (0-1 punto)
- **1**: Publicado en el rango de fechas definido (ej: 2018-2024)
- **0**: Fuera del rango

### 7. Calidad Metodológica (0-2 puntos)
- **2**: Alta calidad (diseño experimental, validación, etc.)
- **1**: Calidad media
- **0**: Baja calidad

---

## 📈 Seguimiento de Progreso

### Panel de Progreso
Muestra cuántos artículos has evaluado:
```
Progreso de Carga de PDFs
8 de 61 artículos con PDF (13%)
```

### Estados de Referencias
- 🟢 **PDF Cargado**: Tiene PDF y está listo para evaluar
- ⚪ **Sin PDF**: Aún no se ha subido el PDF
- ✅ **Incluido**: Evaluado y aprobado (≥7 puntos)
- ❌ **Excluido**: Evaluado y rechazado (<7 puntos)

---

## 🗂️ Resultados

### Tabla de Motivos de Exclusión
En la pestaña **"Tabla de Motivos de Exclusión"** verás:
- Referencias **excluidas** en cualquier fase
- Filtros por **Fase**:
  - **Fase 1: Embeddings** - Excluidos por IA (baja similitud)
  - **Fase 2: ChatGPT** - Excluidos por análisis LLM
  - **Fase 3: Texto Completo** - Excluidos por evaluación manual
- Motivos de exclusión específicos
- Puntajes obtenidos

### Diagrama PRISMA
El diagrama se actualiza automáticamente mostrando:
- Total de referencias procesadas
- Excluidas por fase
- Incluidas en revisión final

---

## ✅ Checklist de Fase 3

- [ ] Cargar PDFs de todas las referencias incluidas
- [ ] Leer cada PDF completo
- [ ] Evaluar cada artículo con los 7 criterios
- [ ] Revisar la tabla de exclusiones
- [ ] Verificar el diagrama PRISMA final

---

## 💡 Consejos

1. **Lee el PDF antes de evaluar** - No asignes puntajes sin leer
2. **Sé consistente** - Usa los mismos estándares para todos
3. **Documenta** - Agrega comentarios para justificar decisiones dudosas
4. **Guarda frecuentemente** - No pierdas tu trabajo
5. **Revisa duplicados** - Si dos PDFs parecen iguales, verifica

---

## ❓ Preguntas Frecuentes

**Q: ¿Puedo cambiar la evaluación de un artículo?**
A: Sí, puedes re-evaluar haciendo click nuevamente en "Evaluar"

**Q: ¿Los PDFs se guardan permanentemente?**
A: Sí, se almacenan en el servidor en `backend/uploads/pdfs/`

**Q: ¿Qué pasa si no tengo el PDF de un artículo?**
A: Puedes excluirlo por "Texto no accesible" (puntaje 0 en ese criterio)

**Q: ¿Puedo ajustar el umbral de 7 puntos?**
A: Sí, pero debe ser consistente con tu protocolo de investigación

**Q: ¿Cuántos artículos debo incluir al final?**
A: Depende de tu pregunta de investigación. No hay un número fijo.

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del backend (terminal)
2. Revisa la consola del navegador (F12)
3. Verifica que el PDF sea válido (formato correcto)
4. Asegúrate que el servidor esté corriendo
