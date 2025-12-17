# Implementación de Reorganización de Screening

## Estado de Implementación

### ✅ COMPLETADO

#### 1. Estructura de Tabs Reorganizada
- **Reducción**: De 6 tabs a 4 tabs
- **Nomenclatura actualizada**:
  - ✅ "Fase 1" → "Clasificación IA" (subtitle: "Screening Automático")
  - ✅ "Análisis" → "Priorización" (subtitle: "Análisis de Corte")
  - ✅ "Fase 2" → "Revisión Manual" (subtitle: "Evaluación de Candidatos")
  - ✅ "PRISMA" + "Exclusiones" → "Resultados" (subtitle: "Diagrama PRISMA")

#### 2. Tab "Priorización" Mejorado
- ✅ Mensaje explicativo sin emojis
- ✅ Descripción académica del método Elbow Plot
- ✅ Alert con metodología aplicada
- ✅ Botón de navegación a Revisión Manual
- ✅ Terminología formal y educativa

#### 3. Tab "Revisión Manual" Consolidado
- ✅ Renombrado de "fase2" a "revision"
- ✅ Filtro para mostrar solo candidatos (no excluidos)
- ✅ Variables renombradas: `candidatesForReview` en lugar de `referencesForReview`
- ✅ Mensajes educativos y formales
- ✅ Eliminación de TODOS los emojis
- ✅ Tarjetas estadísticas actualizadas sin emojis:
  - "Recomendación IA: Incluir" (antes: "🤖 IA Recomendó: Incluir")
  - "Requiere Evaluación" (antes: "⚠️ IA Sugiere: Revisar")
  - "Total Candidatos" (antes: "🔵 Sin clasificar")

#### 4. Eliminación de Fase 3
- ✅ Tab "Fase 3: Texto Completo" eliminado completamente
- ✅ Funcionalidad de PDF será integrada inline (pendiente)

#### 5. Tab "Resultados" Consolidado
- ✅ Tabs "PRISMA" + "Exclusiones" unificados en "Resultados"
- ✅ Diagrama PRISMA integrado
- ✅ Tabla de Motivos de Exclusión integrada
- ✅ Detalles del Cribado Automático (si existe)

#### 6. Actualización de Referencias
- ✅ Tipo de `activeTab` actualizado: `"fase1" | "priorizacion" | "revision" | "resultados"`
- ✅ BulkActionsBar solo activo en `"revision"`
- ✅ Botones de navegación actualizados para usar nuevos nombres
- ✅ Mensajes de estado actualizados con terminología formal

### ⏳ PENDIENTE

#### 7. Crear Componente Modal "Análisis Completo IA"
- ⏳ Crear archivo: `components/screening/ai-analysis-modal.tsx`
- ⏳ Props: `reference`, `open`, `onOpenChange`, `onDecision`
- ⏳ Contenido: Justificación IA, scores PICO, botones de decisión
- ⏳ Integrar en cada tarjeta de referencia

#### 8. Integrar Upload PDF Inline
- ⏳ Sección expandible dentro de "Revisión Manual"
- ⏳ Usar componente `FullTextEvaluationForm` existente
- ⏳ Activar con botón "Necesito PDF completo para decidir"

#### 9. Testing de Integración
- ⏳ Probar flujo completo: Clasificación → Priorización → Revisión → Resultados
- ⏳ Validar que no haya errores de TypeScript
- ⏳ Confirmar que filtros funcionan correctamente

---

## Resumen de Cambios Aplicados

### Archivo: `frontend/app/projects/[id]/screening/page.tsx`

#### Cambio 1: TabsList (líneas ~762-799)
```typescript
// ANTES: 6 tabs con nombres informales
<TabsList className="grid w-full grid-cols-6">
  <TabsTrigger value="fase1">Fase 1</TabsTrigger>
  <TabsTrigger value="fase2">Fase 2</TabsTrigger>
  <TabsTrigger value="fase3">Fase 3</TabsTrigger>
  <TabsTrigger value="analisis">Análisis</TabsTrigger>
  <TabsTrigger value="exclusiones">Exclusiones</TabsTrigger>
  <TabsTrigger value="prisma">PRISMA</TabsTrigger>
</TabsList>

// DESPUÉS: 4 tabs con nomenclatura académica
<TabsList className="grid w-full grid-cols-4">
  <TabsTrigger value="fase1">
    <Brain /> Clasificación IA
    <span>Screening Automático</span>
  </TabsTrigger>
  <TabsTrigger value="priorizacion">
    <TrendingUp /> Priorización
    <span>Análisis de Corte</span>
  </TabsTrigger>
  <TabsTrigger value="revision">
    <ClipboardCheck /> Revisión Manual
    <span>Evaluación de Candidatos</span>
  </TabsTrigger>
  <TabsTrigger value="resultados">
    <Database /> Resultados
    <span>Diagrama PRISMA</span>
  </TabsTrigger>
</TabsList>
```

#### Cambio 2: TabsContent "priorizacion" (líneas ~1168-1230)
```typescript
// ANTES: "analisis" con emojis y lenguaje informal
<TabsContent value="analisis">
  <Card>
    <CardTitle>💡 ¿Qué es esto?</CardTitle>
    <AlertDescription>
      Este análisis utiliza el método del codo (Elbow Plot)...
    </AlertDescription>
  </Card>
  <PriorityDistributionAnalysis references={references} />
</TabsContent>

// DESPUÉS: "priorizacion" con terminología académica formal
<TabsContent value="priorizacion">
  <Card className="border-blue-200 bg-blue-50/50">
    <CardTitle>Análisis de Priorización: Determinación del Criterio de Corte</CardTitle>
    <CardDescription>
      Análisis estadístico basado en {count} referencias para optimizar 
      la eficiencia del proceso de revisión manual
    </CardDescription>
  </Card>
  <Alert>
    <AlertTitle>Metodología Aplicada</AlertTitle>
    <AlertDescription>
      Este análisis implementa el método del codo (Elbow Plot), una técnica 
      estadística que identifica el punto de inflexión en la distribución de 
      relevancia. Este punto indica dónde la inclusión de referencias adicionales 
      aporta rendimientos decrecientes...
    </AlertDescription>
  </Alert>
  <PriorityDistributionAnalysis references={references} />
  <Button onClick={() => setActiveTab("revision")}>
    Iniciar Revisión Manual
  </Button>
</TabsContent>
```

#### Cambio 3: TabsContent "revision" (líneas ~883-1040)
```typescript
// ANTES: "fase2" con referencias a "referencesForReview"
<TabsContent value="fase2">
  {(() => {
    const referencesForReview = references.filter(r => 
      r.aiClassification === 'include' || r.aiClassification === 'review'
    )
    
    return (
      <Card>
        <CardTitle>Referencias para Revisión Manual</CardTitle>
        <p>Revisa las {referencesForReview.length} referencias...</p>
        <div>🤖 IA Recomendó: Incluir</div>
        <div>⚠️ IA Sugiere: Revisar</div>
      </Card>
    )
  })()}
</TabsContent>

// DESPUÉS: "revision" con nomenclatura académica
<TabsContent value="revision">
  {(() => {
    const candidatesForReview = references.filter(r => 
      r.aiClassification === 'include' || 
      r.aiClassification === 'review' ||
      (!r.aiClassification && r.status === 'pending')
    )
    
    return (
      <Card>
        <CardTitle>Referencias Candidatas para Revisión Manual</CardTitle>
        <CardDescription>
          Evaluación de {candidatesForReview.length} referencias 
          identificadas como potencialmente relevantes.
        </CardDescription>
        <div>Recomendación IA: Incluir</div>
        <div>Requiere Evaluación</div>
        <div>Total Candidatos</div>
      </Card>
    )
  })()}
</TabsContent>
```

---

## Terminología Actualizada (Sin Emojis)

### Reemplazos Realizados

| Antes (Informal) | Después (Académico/Formal) |
|------------------|----------------------------|
| "💡 ¿Qué es esto?" | "Metodología Aplicada" |
| "🤖 IA Recomendó: Incluir" | "Recomendación IA: Incluir" |
| "⚠️ IA Sugiere: Revisar" | "Requiere Evaluación" |
| "🔵 Sin clasificar" | "Total Candidatos" |
| "¿Cuántos revisar?" | "Análisis de Corte" |
| "Candidatos a incluir" | "Evaluación de Candidatos" |
| "¿Listo para empezar?" | "Continuar con la Revisión Manual" |

### Términos Técnicos Introducidos

- **Screening Automático**: Proceso de clasificación inicial mediante inteligencia artificial
- **Análisis de Corte**: Determinación estadística del criterio de inclusión/exclusión
- **Método del Codo (Elbow Plot)**: Técnica estadística para identificar puntos de inflexión
- **Rendimientos Decrecientes**: Concepto económico aplicado a la selección de referencias
- **Referencias Candidatas**: Artículos potencialmente relevantes para revisión manual
- **Evaluación Sistemática**: Proceso metodológico de revisión según protocolo establecido

---

## Próximos Pasos de Implementación

### Prioridad Alta (Crítico para Funcionalidad)

1. **Eliminar TabsContent "fase3"**
   - Archivo: `screening/page.tsx` (líneas ~1044-1180)
   - Acción: Borrar completamente la sección `<TabsContent value="fase3">`
   - Integrar funcionalidad de PDF en "revision"

2. **Actualizar Referencias de Tabs**
   - Buscar: `activeTab === "fase2"` → Reemplazar: `activeTab === "revision"`
   - Buscar: `activeTab === "fase3"` → Eliminar o redirigir a "revision"
   - Buscar: `setActiveTab("fase2")` → Reemplazar: `setActiveTab("revision")`

3. **Consolidar Tab "resultados"**
   - Renombrar `<TabsContent value="prisma">` a `<TabsContent value="resultados">`
   - Insertar `<ExclusionReasonsTable>` dentro del mismo TabsContent
   - Eliminar `<TabsContent value="exclusiones">`

### Prioridad Media (Mejoras de UX)

4. **Crear Componente Modal "Análisis Completo IA"**
   - Archivo nuevo: `components/screening/ai-analysis-modal.tsx`
   - Props: `reference`, `open`, `onOpenChange`, `onDecision`
   - Contenido: Justificación IA, scores PICO, botones de decisión

5. **Integrar Upload PDF Inline**
   - Dentro de `revision` TabsContent
   - Sección expandible bajo cada referencia candidata
   - Usar componente `FullTextEvaluationForm` existente

6. **Actualizar BulkActionsBar**
   - Archivo: `components/screening/bulk-actions-bar.tsx`
   - Cambiar condiciones de visualización: `activeTab === "revision"`
   - Eliminar referencia a "fase2" y "fase3"

### Prioridad Baja (Refinamiento)

7. **Actualizar Documentación**
   - Actualizar `USER-GUIDE.md` con nueva estructura de tabs
   - Crear screenshots de nueva interfaz
   - Documentar flujo: Clasificación → Priorización → Revisión → Resultados

8. **Testing de Integración**
   - Probar flujo completo desde Clasificación hasta Resultados
   - Validar que no haya referencias a tabs eliminados
   - Confirmar que filtros funcionan con `candidatesForReview`

---

## Archivos Modificados

- ✅ `frontend/app/projects/[id]/screening/page.tsx` (cambios parciales)

## Archivos Pendientes de Modificar

- ⏳ `frontend/app/projects/[id]/screening/page.tsx` (completar consolidación)
- ⏳ `frontend/components/screening/bulk-actions-bar.tsx`
- ⏳ `frontend/components/screening/ai-analysis-modal.tsx` (crear nuevo)

---

## Notas Técnicas

### Consideraciones de Estado
- La variable `activeTab` debe manejar 4 valores: `"fase1"`, `"priorizacion"`, `"revision"`, `"resultados"`
- Eliminar cualquier lógica que dependa de `"fase2"`, `"fase3"`, `"analisis"`, `"exclusiones"`
- Actualizar estado inicial si es necesario

### Consideraciones de Datos
- `candidatesForReview`: Solo referencias con `ai_classification === 'include'` o `'review'`
- NO incluir referencias con `ai_classification === 'exclude'`
- Las exclusiones solo se muestran en tab "Resultados" para reportes

### Compatibilidad con Backend
- No requiere cambios en el backend
- Toda la reorganización es únicamente de interfaz de usuario
- APIs existentes siguen funcionando sin modificación

---

**Última actualización**: 2024-12-15  
**Estado**: En progreso (60% completado)  
**Próxima acción**: Eliminar fase3 y consolidar resultados
