# 📋 PLAN DE IMPLEMENTACIÓN: CRIBADO → PRISMA → ARTÍCULO

## 🎯 OBJETIVO GENERAL
Implementar el flujo completo desde el cribado finalizado hasta la generación automatizada del artículo final, pasando por la completación del checklist PRISMA 2020.

---

## 📊 ESTADO ACTUAL (Fase completada)

### ✅ Backend Implementado
- **3 Use Cases creados**:
  1. `extract-fulltext-data.use-case.js` - Extrae datos estructurados de PDFs
  2. `generate-prisma-context.use-case.js` - Construye PRISMAContext Object
  3. `complete-prisma-items.use-case.js` - Completa ítems PRISMA automáticamente

- **3 Endpoints nuevos** (en `prisma.controller.js`):
  1. `POST /api/projects/:id/prisma/extract-pdfs` - Procesar PDFs
  2. `POST /api/projects/:id/prisma/generate-context` - Generar contexto
  3. `POST /api/projects/:id/prisma/complete-items` - Completar ítems

- **Modelo actualizado**: `reference.model.js` con 3 nuevos campos:
  - `fullTextData` (JSONB)
  - `fullTextExtracted` (BOOLEAN)
  - `fullTextExtractedAt` (TIMESTAMP)

---

## 🚀 PASOS DE IMPLEMENTACIÓN

### ✅ PASO 1: Preparar Base de Datos Local (COMPLETADO)

**Script creado**: `backend/scripts/add-fulltext-data-columns.js`

**Ejecutar ahora**:
```powershell
cd backend
node scripts/add-fulltext-data-columns.js
```

**Qué hace**:
- Agrega columna `full_text_data` (JSONB)
- Agrega columna `full_text_extracted` (BOOLEAN)
- Agrega columna `full_text_extracted_at` (TIMESTAMP)
- Crea índices: `idx_references_full_text_extracted` e `idx_references_full_text_data_gin`

---

### 📝 PASO 2: Actualizar Frontend PRISMA (PENDIENTE)

**Archivo**: `frontend/app/projects/[id]/prisma/page.tsx`

**Cambios necesarios**:

#### 2.1 Agregar nuevo estado para procesamiento de PDFs
```typescript
const [isExtractingPDFs, setIsExtractingPDFs] = useState(false);
const [extractionResult, setExtractionResult] = useState<any>(null);
```

#### 2.2 Agregar función para procesar PDFs
```typescript
async function handleExtractPDFs() {
  try {
    setIsExtractingPDFs(true);
    
    const response = await apiClient.post(
      `/projects/${params.id}/prisma/extract-pdfs`
    );
    
    setExtractionResult(response.data);
    
    toast({
      title: "PDFs procesados",
      description: `${response.data.processed} PDFs analizados exitosamente`
    });
  } catch (error) {
    console.error('Error procesando PDFs:', error);
    toast({
      title: "Error",
      description: "No se pudieron procesar los PDFs",
      variant: "destructive"
    });
  } finally {
    setIsExtractingPDFs(false);
  }
}
```

#### 2.3 Agregar función para completar PRISMA automáticamente
```typescript
async function handleCompletePrisma() {
  try {
    setIsGenerating(true);
    
    const response = await apiClient.post(
      `/projects/${params.id}/prisma/complete-items`
    );
    
    // Recargar datos
    await loadProjectAndPrismaData();
    
    toast({
      title: "PRISMA completado",
      description: response.data.message
    });
  } catch (error) {
    console.error('Error completando PRISMA:', error);
    toast({
      title: "Error",
      description: "No se pudieron completar los ítems PRISMA",
      variant: "destructive"
    });
  } finally {
    setIsGenerating(false);
  }
}
```

#### 2.4 Agregar botones en la UI
```tsx
{/* Botón para procesar PDFs */}
<Button
  onClick={handleExtractPDFs}
  disabled={isExtractingPDFs}
  variant="outline"
>
  {isExtractingPDFs ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Analizando PDFs...
    </>
  ) : (
    <>
      <FileDown className="mr-2 h-4 w-4" />
      Analizar PDFs Completos
    </>
  )}
</Button>

{/* Botón para completar PRISMA */}
<Button
  onClick={handleCompletePrisma}
  disabled={isGenerating || !protocol?.fase2_unlocked}
  variant="default"
>
  {isGenerating ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Generando...
    </>
  ) : (
    <>
      <Sparkles className="mr-2 h-4 w-4" />
      Completar PRISMA Automáticamente
    </>
  )}
</Button>
```

---

### 🔒 PASO 3: Implementar Bloqueo de PRISMA (PENDIENTE)

**Archivo**: `frontend/app/projects/[id]/prisma/page.tsx`

**Lógica**:
```typescript
// Verificar si PRISMA está completo
const isPrismaComplete = stats?.completed === 27;

// Bloquear edición si está completo
{isPrismaComplete && (
  <Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>PRISMA Completado</AlertTitle>
    <AlertDescription>
      Los 27 ítems PRISMA están completos. Esta sección está bloqueada.
      Puedes proceder a la sección de Artículo.
    </AlertDescription>
  </Alert>
)}

// Deshabilitar edición
<Textarea
  value={item.content}
  disabled={isPrismaComplete}
  onChange={...}
/>
```

---

### 📄 PASO 4: Implementar Flujo PRISMA → ARTÍCULO (PENDIENTE)

**Crear nuevo use case**: `backend/src/domain/use-cases/generate-article-draft.use-case.js`

```javascript
class GenerateArticleDraftUseCase {
  async execute(projectId) {
    // 1. Obtener PRISMA Context
    const prismaContext = await this.generatePrismaContextUseCase.execute(projectId);
    
    // 2. Generar secciones del artículo
    const articleDraft = {
      title: prismaContext.protocol.title,
      
      abstract: this.generateAbstract(prismaContext),
      
      introduction: this.generateIntroduction(prismaContext),
      
      methods: this.generateMethods(prismaContext),
      
      results: this.generateResults(prismaContext),
      
      discussion: this.generateDiscussion(prismaContext),
      
      conclusions: this.generateConclusions(prismaContext),
      
      references: await this.getReferences(projectId)
    };
    
    return articleDraft;
  }
  
  generateMethods(context) {
    return `
## Search Strategy
${this.formatSearchStrategy(context.protocol)}

## Selection Process
${this.formatSelectionProcess(context.screening)}

## Data Extraction
${this.formatDataExtraction(context.fullTextAnalysis)}
    `.trim();
  }
  
  generateResults(context) {
    return `
## Study Selection
${this.formatStudySelection(context.screening)}

## Study Characteristics
${this.formatStudyCharacteristics(context.fullTextAnalysis)}
    `.trim();
  }
}
```

---

## 🔄 FLUJO COMPLETO DE USUARIO

```
1. Usuario completa CRIBADO
   ↓
2. Fase 2 desbloqueada (fase2_unlocked = true)
   ↓
3. Usuario navega a PRISMA
   ↓
4. Sistema muestra 13/27 ítems completados (desde protocolo)
   ↓
5. Usuario hace clic en "Analizar PDFs Completos"
   ↓
6. Sistema extrae datos estructurados de 33 PDFs
   ↓
7. Usuario hace clic en "Completar PRISMA Automáticamente"
   ↓
8. Sistema:
   - Genera PRISMAContext
   - Completa ítems 16, 17, 23, 24, 26, 27
   - Actualiza protocolo con prismaCompliance
   ↓
9. Sistema muestra 19/27 ítems completados
   ↓
10. Usuario completa manualmente los 8 ítems restantes
   ↓
11. Sistema detecta 27/27 y bloquea PRISMA
   ↓
12. Sistema habilita sección ARTÍCULO
   ↓
13. Usuario hace clic en "Generar Borrador de Artículo"
   ↓
14. Sistema usa PRISMA Context para generar artículo
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [x] Crear `extract-fulltext-data.use-case.js`
- [x] Crear `generate-prisma-context.use-case.js`
- [x] Crear `complete-prisma-items.use-case.js`
- [x] Actualizar `prisma.controller.js` con 3 nuevos endpoints
- [x] Actualizar `prisma.routes.js` con rutas
- [x] Actualizar `reference.model.js` con nuevos campos
- [x] Actualizar `reference.repository.js` con nuevos campos
- [x] Crear script `add-fulltext-data-columns.js`
- [ ] Ejecutar script en base de datos local
- [ ] Crear `generate-article-draft.use-case.js`
- [ ] Crear endpoint `POST /api/projects/:id/article/generate-draft`

### Frontend
- [ ] Agregar botón "Analizar PDFs Completos" en PRISMA
- [ ] Agregar botón "Completar PRISMA Automáticamente"
- [ ] Implementar estado de carga y errores
- [ ] Implementar lógica de bloqueo cuando PRISMA = 27/27
- [ ] Agregar badge "PRISMA Completo"
- [ ] Habilitar sección Artículo cuando PRISMA esté completo
- [ ] Implementar generación de borrador de artículo

### Base de Datos
- [ ] Ejecutar script en local
- [ ] Ejecutar script en producción (Render)
- [ ] Agregar columna `prisma_locked` en tabla `protocols`
- [ ] Agregar columna `article_draft` en tabla `projects`

---

## 🎓 PRINCIPIOS METODOLÓGICOS CLAVE

### 1. PRISMA NO ejecuta, solo LEE
- ✅ Usa datos congelados del protocolo y cribado
- ✅ Describe procesos ya completados
- ❌ NO toma decisiones metodológicas nuevas

### 2. IA como ASISTENTE, no como DECISOR
- ✅ Extrae información estructurada
- ✅ Redacta texto académico formal
- ❌ NO decide inclusión/exclusión
- ❌ NO modifica criterios establecidos

### 3. Trazabilidad completa
- Todo ítem PRISMA tiene `dataSource` explícito
- Todo cambio tiene timestamp
- Todo proceso asistido por IA está declarado

---

## 🚦 PRÓXIMOS PASOS INMEDIATOS

### AHORA (Local)
1. **Ejecutar script de base de datos**:
   ```bash
   cd backend
   node scripts/add-fulltext-data-columns.js
   ```

2. **Probar endpoints manualmente con Postman/Thunder Client**:
   - POST `/api/projects/:id/prisma/extract-pdfs`
   - POST `/api/projects/:id/prisma/complete-items`

3. **Verificar que los PDFs se procesen correctamente**

### DESPUÉS (Frontend)
1. Implementar los 2 botones en PRISMA page
2. Probar flujo completo end-to-end
3. Implementar lógica de bloqueo

### FINALMENTE (Producción)
1. Ejecutar el script SQL completo en Render:
   - Incluir `add-fulltext-data-columns.sql`
   - Incluir `fix-production-columns.sql` (ya existe)
2. Desplegar cambios de frontend a Vercel
3. Probar en producción

---

## 📝 NOTAS IMPORTANTES

### Dependencia de pdf-parse
El use case `extract-fulltext-data.use-case.js` usa la librería `pdf-parse`.

**Verificar instalación**:
```json
// backend/package.json
{
  "dependencies": {
    "pdf-parse": "^1.1.1"
  }
}
```

**Si no está instalada**:
```bash
cd backend
npm install pdf-parse
```

### Rate Limits de IA
El procesamiento de PDFs tiene un delay de 1 segundo entre llamadas para evitar rate limits:
```javascript
await new Promise(resolve => setTimeout(resolve, 1000));
```

### Tamaño de contexto
Solo se envían los primeros 6000 caracteres de cada PDF a la IA para mantenerse dentro de límites de tokens:
```javascript
const response = await this.aiService.generateText(prompt, pdfText.substring(0, 6000));
```

---

## 🎯 RESULTADO ESPERADO

Al finalizar esta implementación:

✅ Usuario puede completar PRISMA en minutos (no días)
✅ Los 27 ítems PRISMA están completos y validados
✅ PRISMA se bloquea automáticamente cuando está completo
✅ Sistema genera borrador de artículo automáticamente
✅ Trazabilidad completa de todo el proceso
✅ Declaración explícita del uso de IA
✅ Cumplimiento metodológico con PRISMA 2020

---

**Fecha de creación**: Diciembre 2024  
**Autor**: Sistema de Revisión Sistemática de Literatura  
**Versión**: 1.0
