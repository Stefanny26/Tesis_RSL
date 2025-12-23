# Implementación de Progreso en Tiempo Real con Server-Sent Events (SSE)

## Problema Identificado

El frontend mostraba un progreso simulado durante el cribado automático, sin reflejar el estado real del backend:
- **Frontend**: Mostraba "16% - Fase 1: Calculando similitudes"
- **Backend**: Ya estaba en Fase 2 o 3 procesando con ChatGPT/Gemini

Esto creaba confusión para el usuario, quien no sabía el estado real del proceso.

## Solución Implementada

### 1. Nuevo Endpoint SSE (Backend)

**Archivo**: `backend/src/api/controllers/ai.controller.js`

- **Endpoint**: `GET /api/ai/run-project-screening-stream`
- **Método**: Server-Sent Events (SSE) para streaming en tiempo real
- **Autenticación**: Token JWT pasado como query parameter (EventSource no soporta headers personalizados)

```javascript
const runProjectScreeningStream = async (req, res) => {
  // Configurar SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Callback para enviar eventos de progreso
  const progressCallback = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // Ejecutar cribado con callback
  await runProjectScreeningUseCase.executeHybrid({
    projectId,
    protocol,
    embeddingThreshold,
    aiProvider,
    progressCallback // ← Envía eventos en tiempo real
  });
}
```

### 2. Modificación del Use Case (Backend)

**Archivo**: `backend/src/domain/use-cases/run-project-screening.use-case.js`

Agregado parámetro `progressCallback` que emite eventos durante las 3 fases:

#### Fase 1: Embeddings (10-30%)
```javascript
emitProgress({
  type: 'phase',
  phase: 1,
  message: `Fase 1: Calculando similitudes con Embeddings (${references.length} referencias)`,
  progress: 10,
  total: references.length
});
```

#### Fase 2: ChatGPT/Gemini (35-90%)
```javascript
// Después de cada referencia procesada
emitProgress({
  type: 'progress',
  phase: 2,
  message: `Procesando referencia ${i + 1} de ${greyZone.length}`,
  progress: 35 + Math.floor(((i + 1) / greyZone.length) * 55),
  current: i + 1,
  total: greyZone.length
});
```

#### Fase 3: Guardando resultados (90-100%)
```javascript
emitProgress({
  type: 'phase',
  phase: 3,
  message: 'Fase 3: Guardando resultados en la base de datos',
  progress: 90
});
```

### 3. Actualización del Frontend

**Archivo**: `frontend/components/screening/ai-screening-panel.tsx`

Reemplazado progreso simulado con `setInterval` por conexión SSE real:

```typescript
// Construir URL con token
const token = localStorage.getItem('token');
const eventSourceUrl = `${baseUrl}/api/ai/run-project-screening-stream?projectId=${projectId}&threshold=${threshold[0]}&aiProvider=${aiProvider}&token=${token}`;

// Crear EventSource
const eventSource = new EventSource(eventSourceUrl);

// Escuchar eventos
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'phase':
      setCurrentPhase(data.message);
      setProgress(data.progress);
      break;
      
    case 'progress':
      setCurrentPhase(data.message);
      setProgress(data.progress);
      setProcessedCount(data.current);
      break;
      
    case 'complete':
      setProgress(100);
      eventSource.close();
      window.location.reload(); // Refrescar datos
      break;
      
    case 'error':
      console.error('Error:', data.message);
      eventSource.close();
      break;
  }
};
```

## Tipos de Eventos SSE

| Tipo | Descripción | Campos |
|------|-------------|--------|
| `phase` | Cambio de fase (1→2→3) | `phase`, `message`, `progress`, `total?` |
| `progress` | Progreso incremental dentro de una fase | `phase`, `message`, `progress`, `current`, `total` |
| `complete` | Proceso finalizado exitosamente | `data` (resultado completo) |
| `error` | Error durante el proceso | `message` |

## Flujo de Progreso

```
[0%]    Inicio
[2%]    Analizando similitudes con Elbow Method...
[5%]    Análisis completado
[10%]   Fase 1: Calculando similitudes con Embeddings
[30%]   Fase 1 completada
[35%]   Fase 2: Analizando zona gris con ChatGPT/Gemini
[35-90%] Procesando referencia X de Y (incremental)
[90%]   Fase 3: Guardando resultados
[100%]  ✅ Cribado completado exitosamente
```

## Beneficios

1. **Feedback en Tiempo Real**: El usuario ve exactamente qué está haciendo el sistema
2. **Progreso Preciso**: No más simulaciones - el progreso refleja el trabajo real
3. **Transparencia**: Muestra cuántas referencias se están procesando en cada fase
4. **Mejor UX**: Usuario informado = usuario tranquilo

## Testing

Para probar:

1. Ir a un proyecto con referencias pendientes
2. Hacer clic en "Ejecutar Cribado Automático"
3. Observar progreso en tiempo real:
   - Fase 1: Embeddings (rápido, ~2-5s)
   - Fase 2: ChatGPT (lento, ~2-3s por referencia)
   - Fase 3: Guardado (rápido, ~1-2s)

## Archivos Modificados

- ✅ `backend/src/api/controllers/ai.controller.js` - Nuevo endpoint SSE
- ✅ `backend/src/api/routes/ai.routes.js` - Nueva ruta GET
- ✅ `backend/src/domain/use-cases/run-project-screening.use-case.js` - Callback de progreso
- ✅ `frontend/components/screening/ai-screening-panel.tsx` - EventSource cliente

## Notas Técnicas

- **EventSource no soporta headers personalizados**: Token JWT se pasa como query parameter
- **Validación manual de JWT**: Backend valida token en el query sin middleware
- **SSE vs WebSocket**: SSE es unidireccional (servidor → cliente), ideal para progreso
- **Refresco automático**: Al completar, se refresca la página para ver nuevos resultados
