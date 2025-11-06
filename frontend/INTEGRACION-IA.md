# 🤖 Integración de IA - Guía de Uso

## ✅ Estado Actual

### Backend
- ✅ 5 endpoints de IA funcionando en `http://localhost:3001/api/ai/*`
- ✅ ChatGPT y Gemini configurados (Gemini 1.5 Flash activo)
- ⚠️ ChatGPT tiene cuota agotada (error 429)
- ✅ **Usa Gemini para todas las pruebas**

### Frontend
- ✅ Servicio `ai-service.ts` conectado al backend
- ✅ Componentes del wizard actualizados con botones de IA
- ✅ Página de prueba: `http://localhost:3000/test-ai`

## 🎯 Componentes con IA Integrada

### 1. **Matriz Es/No Es** (`is-not-matrix-step.tsx`)
- Botones: "ChatGPT" y "Gemini"
- Genera: Lista de elementos que son y no son parte de la investigación
- **Ubicación**: Paso 1 del wizard

### 2. **Framework PICO** (`pico-framework-step.tsx`)
- Botones: "ChatGPT" y "Gemini"
- Genera: Población, Intervención, Comparación, Outcomes
- **Ubicación**: Paso 2 del wizard

### 3. **Criterios de Inclusión/Exclusión** (`criteria-step.tsx`)
- Botones: "ChatGPT" y "Gemini"
- Genera: Listas completas de criterios para ambas categorías
- **Ubicación**: Paso 4 del wizard

### 4. **Estrategia de Búsqueda** (`search-strategy-step.tsx`)
- Botones: "Optimizar con ChatGPT" y "Optimizar con Gemini"
- Genera: Cadena de búsqueda refinada y optimizada
- **Requisito**: Necesita una cadena de búsqueda inicial y pregunta de investigación
- **Ubicación**: Paso 5 del wizard

## 🚀 Cómo Probar

### Opción 1: Página de Prueba Standalone
```
1. Ve a: http://localhost:3000/test-ai
2. Ya hay un ejemplo cargado
3. Haz clic en "Continuar al Generador de IA"
4. Selecciona "Gemini" (ChatGPT no tiene cuota)
5. Haz clic en "Generar Análisis con IA"
6. Espera 15-30 segundos
7. Revisa los resultados de las 7 fases PRISMA
```

### Opción 2: Wizard de Protocolo
```
1. Ve a un proyecto existente
2. Crea o edita un protocolo
3. En cada paso verás botones "ChatGPT" y "Gemini"
4. **Usa Gemini** (ChatGPT sin cuota)
5. Los resultados se llenan automáticamente en los campos
```

## ⚙️ Solución de Problemas

### Error 429 (ChatGPT sin cuota)
```
❌ Error: You exceeded your current quota
✅ Solución: Usa Gemini en su lugar
```

### Error 404 (Modelo no encontrado)
```
❌ Error: models/gemini-1.5-pro is not found
✅ Solución: Ya corregido a gemini-1.5-flash
```

### Token no válido
```
❌ Error: Unauthorized
✅ Solución: Inicia sesión primero en http://localhost:3000
```

## 📝 Flujo Completo de Trabajo

### Paso a Paso:
1. **Login** → Obtener token JWT
2. **Crear proyecto** → Título y descripción
3. **Crear protocolo** → Usar wizard
4. **Paso 1** → Clic en "Gemini" para matriz Es/No Es
5. **Paso 2** → Clic en "Gemini" para PICO
6. **Paso 3** → Agregar preguntas manualmente
7. **Paso 4** → Clic en "Gemini" para criterios
8. **Paso 5** → Escribir búsqueda inicial, luego "Optimizar con Gemini"
9. **Paso 6** → Revisar y completar

## 🔧 Cambios Realizados

### Backend
```javascript
// generate-protocol-analysis.use-case.js
// Línea 286: Cambiado de "gemini-1.5-pro" a "gemini-1.5-flash"
model: "gemini-1.5-flash"
```

### Frontend
```typescript
// search-strategy-step.tsx
// + Agregado: useState, aiService, useToast
// + Agregada función: handleRefineSearchString()
// + Agregados botones de IA en la sección de búsqueda

// criteria-step.tsx
// + Agregado: useState, aiService, useToast
// + Agregada función: handleAIGeneration()
// + Agregados botones de IA antes de los tabs

// protocol-wizard.tsx
// + Agregadas props: projectTitle y projectDescription
//   a CriteriaStep y SearchStrategyStep
// + Agregada prop: researchQuestion a SearchStrategyStep
```

## 🎨 Interfaz de Usuario

### Botones de IA:
- **Icono**: ✨ Sparkles (generación normal) / 🔄 Loader (cargando)
- **Estilos**: Outline variant, tamaño small
- **Estados**: Normal / Loading / Disabled
- **Colores**: Default (gris) cuando no seleccionado

### Toast Notifications:
```typescript
// Iniciando
toast({ title: "Generando...", description: "Usando Gemini..." })

// Éxito
toast({ title: "¡Generado!", description: "Resultados listos" })

// Error
toast({ title: "Error", variant: "destructive", description: error })
```

## 📊 Endpoints Disponibles

### 1. POST `/api/ai/protocol-analysis`
```json
{
  "title": "Título del proyecto",
  "description": "Descripción",
  "aiProvider": "gemini"
}
```

### 2. POST `/api/ai/generate-title`
```json
{
  "researchQuestion": "¿Cómo...?",
  "aiProvider": "gemini"
}
```

### 3. POST `/api/ai/screen-reference`
```json
{
  "reference": { "title": "...", "abstract": "..." },
  "inclusionCriteria": ["..."],
  "exclusionCriteria": ["..."],
  "researchQuestion": "...",
  "aiProvider": "gemini"
}
```

### 4. POST `/api/ai/screen-references-batch`
```json
{
  "references": [...],
  "inclusionCriteria": ["..."],
  "exclusionCriteria": ["..."],
  "researchQuestion": "...",
  "aiProvider": "gemini"
}
```

### 5. POST `/api/ai/refine-search-string`
```json
{
  "currentSearchString": "...",
  "searchResults": [],
  "researchQuestion": "...",
  "databases": ["IEEE", "ACM"],
  "aiProvider": "gemini"
}
```

## 🔒 Autenticación

Todos los endpoints requieren:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

El token se obtiene automáticamente de `localStorage.getItem('token')`.

## ⏱️ Tiempos de Respuesta

- **Gemini 1.5 Flash**: 15-30 segundos
- **ChatGPT GPT-4o-mini** (cuando tenga cuota): 30-60 segundos

## 📝 Próximos Pasos

1. ✅ Integración básica completada
2. ⏳ Agregar generador de títulos en paso 3
3. ⏳ Panel de screening automático de referencias
4. ⏳ Visualización de estadísticas de IA
5. ⏳ Historial de generaciones

## 💡 Consejos

- **Siempre usa Gemini** hasta que ChatGPT tenga cuota
- **Revisa los resultados** antes de continuar
- **Puedes editar** cualquier resultado generado
- **Guarda frecuentemente** el progreso del protocolo
- **Los botones de IA son opcionales** - puedes llenar manualmente

---

**Última actualización**: 4 de noviembre de 2025
**Estado**: ✅ Funcional con Gemini
