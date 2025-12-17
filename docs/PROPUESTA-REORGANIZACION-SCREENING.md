# 🔄 Propuesta de Reorganización de Screening

## 📋 Problema Identificado

**Feedback del docente y usuario:**
- Fases 2, 3 y Exclusiones están **duplicadas/redundantes**
- No está claro qué hacer en cada fase
- Sección "Análisis" no explica su propósito
- Demasiada información de referencias excluidas (confunde al usuario)

---

## ✅ Solución Propuesta: De 6 Tabs → 4 Tabs

### **ANTES (Confuso)**
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Fase 1      │ Fase 2      │ Fase 3      │ Análisis    │ Exclusiones │ PRISMA      │
│ Clasif. IA  │ Rev. Manual │ Texto Compl │ Distribuc.  │ Motivos     │ Diagrama    │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
       ↓              ↓              ↓             ↓             ↓            ↓
    ¿Qué es?     ¿Duplicada?   ¿Duplicada?   ¿Para qué?   ¿Por qué?   Solo al final
```

### **DESPUÉS (Claro)**
```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ 1. Clasificación │ 2. Priorización  │ 3. Revisión      │ 4. Resultados    │
│    Automática IA │    ¿Cuántos?     │    Manual        │    PRISMA+Excl.  │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
         ↓                   ↓                   ↓                   ↓
    Ejecutar IA      Elbow Plot: Top 45   Revisar candidatos   Diagrama final
    (embeddings+LLM)   de 181 artículos    + Upload PDF         + Exclusiones
```

---

## 📊 Nueva Estructura Detallada

### **Tab 1: Clasificación Automática IA**
**Antes:** "Fase 1"  
**Después:** "Clasificación IA"  
**Subtitle:** "Fase 1: Automática"

**Contenido:**
- Panel de ejecución de Phase 1 (Embeddings + ChatGPT/Gemini)
- Estadísticas de clasificación (auto-include, grey zone, auto-exclude)
- Tabla de todas las referencias con AI scores
- Botón "Continuar a Priorización →"

**NO CAMBIAR** - Ya funciona bien

---

### **Tab 2: Priorización** ⭐ **NUEVO PROPÓSITO**
**Antes:** "Análisis" (nombre confuso)  
**Después:** "Priorización"  
**Subtitle:** "¿Cuántos revisar?"

**Propósito claro:**
> "No revises los 181 artículos. Este análisis te dice cuántos revisar (ej: top 45)"

**Contenido:**
1. **Tarjeta explicativa** (nueva):
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │ 💡 ¿Qué es esto?                                            │
   │                                                             │
   │ Este análisis utiliza el "método del codo" (Elbow Plot)    │
   │ para identificar el punto donde la relevancia cae.          │
   │ En lugar de revisar TODAS las referencias, puedes          │
   │ enfocarte solo en las más relevantes.                      │
   │                                                             │
   │ Recomendación: Revisa los TOP 45 de 181 artículos         │
   └─────────────────────────────────────────────────────────────┘
   ```

2. **Componente PriorityDistributionAnalysis** (ya existe)
   - Gráfico de distribución
   - Percentiles: Top 10%, Top 25%, Mediana
   - Detección automática del "codo"
   - Recomendaciones: "Revisa hasta el artículo 45"

3. **Botón de acción claro**:
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │ ¿Listo para empezar la revisión?                           │
   │                                                             │
   │ Continúa a la siguiente pestaña para revisar               │
   │ los candidatos recomendados                                 │
   │                                            [Ir a Revisión Manual →] │
   └─────────────────────────────────────────────────────────────┘
   ```

---

### **Tab 3: Revisión Manual** ⭐ **CONSOLIDADA** (Antes: Fase 2 + Fase 3)
**Antes:** "Fase 2" (revisión manual) + "Fase 3" (texto completo)  
**Después:** "Revisión Manual"  
**Subtitle:** "Candidatos a incluir"

**Propósito consolidado:**
> "Revisa SOLO los candidatos recomendados (ej: 45 de 181). No más información de excluidos."

**Contenido:**

1. **Estadísticas solo de candidatos** (sin excluidos):
   ```
   ┌─────────────────┬─────────────────┬─────────────────┐
   │ 🤖 IA Recomienda│ ⚠️ IA Sugiere   │ 📊 Total        │
   │ INCLUIR         │ REVISAR         │ Candidatos      │
   │                 │                 │                 │
   │ 28 artículos    │ 17 artículos    │ 45 artículos    │
   └─────────────────┴─────────────────┴─────────────────┘
   ```

2. **Tabla de candidatos** con columnas:
   - Título + Autores + Año
   - AI Score (0-100%)
   - Botón "👁️ Ver análisis IA" (modal)
   - Botón "📄 Cargar PDF" (inline)
   - Decisión final: [Incluir] [Excluir con motivo]

3. **Modal "Ver análisis completo de IA"** (nuevo):
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │ 🤖 Análisis Completo de IA                                 │
   │                                                             │
   │ Título: "Machine Learning for Medical Diagnosis"           │
   │ Autores: Smith et al., 2023                                 │
   │                                                             │
   │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
   │                                                             │
   │ 📊 Puntaje de Relevancia: 87/100                          │
   │                                                             │
   │ ✅ Recomendación: INCLUIR (Alta relevancia)               │
   │                                                             │
   │ 💭 Justificación de la IA:                                 │
   │ Este artículo cumple los criterios PICO del protocolo:     │
   │ - Población: Adultos con diabetes tipo 2 ✓                │
   │ - Intervención: Machine learning diagnostics ✓            │
   │ - Comparación: Métodos tradicionales ✓                    │
   │ - Resultados: Accuracy, sensitivity, specificity ✓        │
   │                                                             │
   │ 🔬 Tipo de estudio: Randomized Controlled Trial           │
   │ 📈 Tamaño de muestra: n=150 (adecuado)                    │
   │                                                             │
   │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
   │                                                             │
   │ 🧠 Tu decisión manual (revisor):                          │
   │                                                             │
   │ [ ] Estoy de acuerdo con la IA → Incluir                 │
   │ [ ] No cumple criterios → Excluir por: [dropdown]         │
   │ [ ] Necesito el PDF completo para decidir                 │
   │     [📄 Cargar PDF ahora]                                 │
   │                                                             │
   │                      [Guardar decisión]                    │
   └─────────────────────────────────────────────────────────────┘
   ```

4. **Upload de PDF inline** (cuando se selecciona "Necesito PDF"):
   - Se expande una sección debajo de la referencia
   - Upload de PDF → Extracción automática
   - Evaluación de 7 criterios PICO (0-12 puntos)
   - Muestra análisis detallado del PDF
   - Decisión final: Incluir / Excluir

**LO QUE SE ELIMINA:**
- ❌ Ya NO se muestran referencias excluidas automáticamente por IA
- ❌ Ya NO hay pestaña separada "Fase 3: Texto Completo"
- ❌ Ya NO hay confusión entre "revisión manual" vs "texto completo"

---

### **Tab 4: Resultados** (Antes: "PRISMA" + "Exclusiones")
**Antes:** "PRISMA" (tab separado) + "Exclusiones" (otro tab separado)  
**Después:** "Resultados"  
**Subtitle:** "PRISMA + Exclusiones"

**Contenido consolidado:**

1. **Diagrama PRISMA 2020** (arriba):
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │                     PRISMA Flow Diagram                     │
   │                                                             │
   │  Identificación: 181 referencias (PubMed, Scopus, WoS)    │
   │          ↓                                                  │
   │  Cribado: 181 referencias analizadas por IA                │
   │          ↓                                                  │
   │  Elegibilidad: 45 candidatos revisados manualmente         │
   │          ↓                                                  │
   │  Incluidos: 28 artículos finales en RSL                    │
   │                                                             │
   │  Excluidos: 153 referencias (ver tabla abajo)              │
   └─────────────────────────────────────────────────────────────┘
   ```

2. **Tabla de Exclusiones** (abajo):
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │ 📋 Tabla de Motivos de Exclusión                           │
   │                                                             │
   │ Registro detallado de las 153 referencias excluidas        │
   │                                                             │
   │ Distribución por Fase:                                      │
   │ • Fase 1 (IA automática): 136 excluidas                    │
   │ • Fase 2 (Revisión manual): 17 excluidas                   │
   │                                                             │
   │ Motivos de exclusión:                                       │
   │ ─────────────────────────────────────────────────────────  │
   │ No cumple PICO                     │ 89  │ ████████░░ 58% │
   │ No es estudio primario             │ 31  │ ███░░░░░░░ 20% │
   │ Idioma no incluido                 │ 18  │ ██░░░░░░░░ 12% │
   │ Duplicado                          │ 12  │ █░░░░░░░░░  8% │
   │ Texto completo no disponible       │  3  │ ░░░░░░░░░░  2% │
   │                                                             │
   │                              [Exportar tabla completa CSV] │
   └─────────────────────────────────────────────────────────────┘
   ```

---

## 🎯 Flujo de Usuario Mejorado

### **Antes (confuso):**
```
Usuario: "¿Qué hago ahora?"
1. Fase 1 → ¿Clasificó todas? ✓
2. Fase 2 → ¿Revisar manualmente todas? ❌ (confuso: ¿cuáles?)
3. Fase 3 → ¿Subir PDFs de todas? ❌ (no tiene sentido)
4. Análisis → ¿Para qué es esto? ❓ (sin explicación)
5. Exclusiones → ¿Por qué una pestaña entera? ❓
6. PRISMA → OK, diagrama final
```

### **Después (claro):**
```
Usuario: "Voy paso a paso"
1. Clasificación IA → Ejecutar análisis automático ✅
2. Priorización → "Ah, solo debo revisar 45 de 181" ✅
3. Revisión Manual → Revisar los 45 candidatos (ver análisis IA + subir PDF si necesario) ✅
4. Resultados → Ver diagrama PRISMA + tabla de exclusiones ✅
```

---

## 🔄 Cambios en el Código

### Archivo: `frontend/app/projects/[id]/screening/page.tsx`

#### Cambio 1: Tabs (líneas 762-810)
```typescript
// ANTES: 6 tabs
<TabsList className="grid w-full grid-cols-6 h-auto">
  <TabsTrigger value="fase1">Fase 1</TabsTrigger>
  <TabsTrigger value="fase2">Fase 2</TabsTrigger>
  <TabsTrigger value="fase3">Fase 3</TabsTrigger>
  <TabsTrigger value="analisis">Análisis</TabsTrigger>
  <TabsTrigger value="exclusiones">Exclusiones</TabsTrigger>
  <TabsTrigger value="prisma">PRISMA</TabsTrigger>
</TabsList>

// DESPUÉS: 4 tabs
<TabsList className="grid w-full grid-cols-4 h-auto">
  <TabsTrigger value="fase1">
    <Brain /> Clasificación IA
    <span>Fase 1: Automática</span>
  </TabsTrigger>
  <TabsTrigger value="priorizacion">
    <TrendingUp /> Priorización
    <span>¿Cuántos revisar?</span>
  </TabsTrigger>
  <TabsTrigger value="revision">
    <ClipboardCheck /> Revisión Manual
    <span>Candidatos a incluir</span>
  </TabsTrigger>
  <TabsTrigger value="resultados">
    <Database /> Resultados
    <span>PRISMA + Exclusiones</span>
  </TabsTrigger>
</TabsList>
```

#### Cambio 2: Tab "Priorización" (antes "Análisis")
```typescript
<TabsContent value="priorizacion">
  {/* Tarjeta explicativa */}
  <Card className="border-blue-200 bg-blue-50/50">
    <CardHeader>
      <CardTitle>Análisis de Priorización: ¿Cuántos Artículos Revisar?</CardTitle>
      <CardDescription>
        Basado en el análisis de {references.length} referencias, 
        te recomendamos un criterio de corte óptimo.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Alert>
        <AlertCircle />
        <AlertDescription>
          💡 <strong>¿Qué es esto?</strong> Este análisis utiliza el 
          método del codo (Elbow Plot) para identificar automáticamente 
          el punto donde la relevancia cae. En lugar de revisar todas 
          las referencias, puedes enfocarte en las más relevantes.
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>

  {/* Componente de análisis existente */}
  <PriorityDistributionAnalysis references={references} />

  {/* Botón de acción */}
  <Card className="border-green-200">
    <CardContent>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold">¿Listo para empezar la revisión?</h4>
          <p>Continúa a la siguiente pestaña para revisar los candidatos</p>
        </div>
        <Button onClick={() => setActiveTab("revision")}>
          Ir a Revisión Manual →
        </Button>
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

#### Cambio 3: Tab "Revisión Manual" (consolidada: antes Fase 2 + Fase 3)
```typescript
<TabsContent value="revision">
  {/* SOLO candidatos (no excluidos) */}
  {(() => {
    const candidatos = references.filter(r => 
      r.ai_classification === 'include' || 
      r.ai_classification === 'review' ||
      r.status === 'pending'
    )

    return (
      <Card>
        <CardHeader>
          <CardTitle>Referencias Candidatas a Incluir</CardTitle>
          <CardDescription>
            Revisa los {candidatos.length} candidatos recomendados. 
            Las referencias excluidas automáticamente no aparecen aquí.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Estadísticas solo de candidatos */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50">
              <p>🤖 IA Recomienda: INCLUIR</p>
              <p className="text-2xl font-bold">
                {candidatos.filter(r => r.ai_classification === 'include').length}
              </p>
            </div>
            <div className="bg-yellow-50">
              <p>⚠️ IA Sugiere: REVISAR</p>
              <p className="text-2xl font-bold">
                {candidatos.filter(r => r.ai_classification === 'review').length}
              </p>
            </div>
            <div className="bg-blue-50">
              <p>📊 Total Candidatos</p>
              <p className="text-2xl font-bold">{candidatos.length}</p>
            </div>
          </div>

          {/* Tabla de candidatos */}
          <div className="space-y-4">
            {candidatos.map(ref => (
              <Card key={ref.id} className="hover:shadow-md transition">
                <CardContent className="pt-6">
                  {/* Título + Autores */}
                  <h4 className="font-semibold mb-2">{ref.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {ref.authors.join(', ')} • {ref.year}
                  </p>

                  {/* AI Score */}
                  <div className="flex items-center gap-2 my-3">
                    <Badge variant={ref.ai_classification === 'include' ? 'default' : 'secondary'}>
                      AI Score: {(ref.similarity_score * 100).toFixed(0)}%
                    </Badge>
                    <Badge variant="outline">
                      {ref.ai_classification === 'include' ? '✓ Incluir' : '⚠ Revisar'}
                    </Badge>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 mt-4">
                    {/* Botón: Ver análisis completo de IA (modal) */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openAIAnalysisModal(ref)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      👁️ Ver análisis completo de IA
                    </Button>

                    {/* Botón: Cargar PDF */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => togglePdfUpload(ref.id)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      📄 Cargar PDF
                    </Button>

                    {/* Botones de decisión */}
                    <Button 
                      size="sm" 
                      className="bg-green-600"
                      onClick={() => handleDecision(ref.id, 'included')}
                    >
                      ✓ Incluir
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDecision(ref.id, 'excluded')}
                    >
                      ✗ Excluir
                    </Button>
                  </div>

                  {/* PDF Upload expandible */}
                  {pdfUploadOpen[ref.id] && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                      <h5 className="font-semibold mb-3">Cargar y Analizar PDF</h5>
                      <FullTextEvaluationForm 
                        referenceId={ref.id}
                        onComplete={() => setPdfUploadOpen(prev => ({...prev, [ref.id]: false}))}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  })()}
</TabsContent>

{/* Modal: Ver análisis completo de IA */}
<Dialog open={aiAnalysisModalOpen} onOpenChange={setAIAnalysisModalOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Brain className="h-5 w-5" />
        🤖 Análisis Completo de IA
      </DialogTitle>
    </DialogHeader>
    
    {selectedReference && (
      <div className="space-y-4">
        {/* Título + Autores */}
        <div>
          <h3 className="font-semibold text-lg">{selectedReference.title}</h3>
          <p className="text-sm text-muted-foreground">
            {selectedReference.authors.join(', ')} • {selectedReference.year}
          </p>
        </div>

        <Separator />

        {/* Puntaje */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">📊 Puntaje de Relevancia</p>
          <p className="text-3xl font-bold">
            {(selectedReference.similarity_score * 100).toFixed(0)}/100
          </p>
        </div>

        {/* Recomendación */}
        <Alert className={selectedReference.ai_classification === 'include' ? 'bg-green-50' : 'bg-yellow-50'}>
          <AlertCircle />
          <AlertTitle>
            ✅ Recomendación: {selectedReference.ai_classification === 'include' ? 'INCLUIR (Alta relevancia)' : 'REVISAR (Necesita evaluación)'}
          </AlertTitle>
        </Alert>

        {/* Justificación */}
        <div>
          <p className="text-sm font-semibold mb-2">💭 Justificación de la IA:</p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {selectedReference.ai_reasoning || 'No hay justificación disponible'}
          </p>
        </div>

        {/* Análisis PICO (si está disponible) */}
        {selectedReference.pico_analysis && (
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">🔬 Análisis PICO:</p>
            <ul className="space-y-1">
              <li className="text-sm">✓ Población: {selectedReference.pico_analysis.population}</li>
              <li className="text-sm">✓ Intervención: {selectedReference.pico_analysis.intervention}</li>
              <li className="text-sm">✓ Comparación: {selectedReference.pico_analysis.comparison}</li>
              <li className="text-sm">✓ Resultados: {selectedReference.pico_analysis.outcomes}</li>
            </ul>
          </div>
        )}

        <Separator />

        {/* Decisión del revisor */}
        <div>
          <p className="text-sm font-semibold mb-3">🧠 Tu decisión manual (revisor):</p>
          <div className="space-y-2">
            <Button 
              className="w-full bg-green-600" 
              onClick={() => handleModalDecision('included')}
            >
              ✓ Estoy de acuerdo con la IA → Incluir
            </Button>
            <Button 
              className="w-full" 
              variant="destructive"
              onClick={() => handleModalDecision('excluded')}
            >
              ✗ No cumple criterios → Excluir
            </Button>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => {
                setAIAnalysisModalOpen(false)
                togglePdfUpload(selectedReference.id)
              }}
            >
              📄 Necesito el PDF completo para decidir
            </Button>
          </div>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
```

#### Cambio 4: Tab "Resultados" (consolida PRISMA + Exclusiones)
```typescript
<TabsContent value="resultados">
  <div className="space-y-6">
    {/* Diagrama PRISMA */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Diagrama de Flujo PRISMA 2020
        </CardTitle>
        <CardDescription>
          Resumen visual del proceso de selección de estudios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PrismaFlowDiagram stats={prismaStats} />
      </CardContent>
    </Card>

    {/* Tabla de Exclusiones */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Tabla de Motivos de Exclusión
        </CardTitle>
        <CardDescription>
          Registro detallado de las {excludedReferences.length} referencias 
          excluidas durante el proceso de cribado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Estadísticas de exclusión */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-700 mb-1">Fase 1 (IA automática)</p>
            <p className="text-2xl font-bold text-red-900">
              {excludedByAI.length} excluidas
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-700 mb-1">Fase 2 (Revisión manual)</p>
            <p className="text-2xl font-bold text-orange-900">
              {excludedManual.length} excluidas
            </p>
          </div>
        </div>

        {/* Tabla completa de exclusiones */}
        <ExclusionReasonsTable references={references} />
      </CardContent>
    </Card>
  </div>
</TabsContent>
```

---

## ✅ Beneficios de la Reorganización

### Para el Usuario
1. ✅ **Flujo claro y lineal:** Clasificación → Priorización → Revisión → Resultados
2. ✅ **No más redundancia:** Una sola pestaña de revisión (antes 2)
3. ✅ **Propósito claro:** Cada tab explica qué hace y por qué
4. ✅ **Menos confusión:** No ve referencias excluidas hasta el final (Resultados)
5. ✅ **Optimización de tiempo:** "Revisa 45 de 181" es claro y accionable

### Para el Desarrollo
1. ✅ **Menos complejidad:** 4 tabs en lugar de 6
2. ✅ **Consolidación de código:** Fase 2 + Fase 3 → Una sola vista
3. ✅ **Mejor UX:** Modal de "Ver análisis IA" + upload PDF inline
4. ✅ **Mantenibilidad:** Menos duplicación de lógica

---

## 📝 Checklist de Implementación

### Fase 1: Cambios de UI
- [ ] Reducir tabs de 6 a 4
- [ ] Renombrar "Análisis" → "Priorización"
- [ ] Añadir tarjeta explicativa en "Priorización"
- [ ] Consolidar "Fase 2" + "Fase 3" → "Revisión Manual"
- [ ] Eliminar tab "Exclusiones" (mover a "Resultados")
- [ ] Actualizar tab "PRISMA" → "Resultados" (incluye exclusiones)

### Fase 2: Funcionalidad Nueva
- [ ] Crear modal "Ver análisis completo de IA"
- [ ] Implementar upload de PDF expandible inline
- [ ] Filtrar solo candidatos en "Revisión Manual" (no excluidos)
- [ ] Añadir botones de acción en cada referencia candidata

### Fase 3: Testing
- [ ] Probar flujo completo: Clasificación → Priorización → Revisión → Resultados
- [ ] Validar que no se muestran excluidos en "Revisión Manual"
- [ ] Verificar que modal de análisis IA funciona correctamente
- [ ] Confirmar que upload de PDF inline funciona

---

## 🎓 Feedback del Docente Atendido

### ✅ Problema 1: "Fases duplicadas/redundantes"
**Solución:** Consolidamos Fase 2 + Fase 3 en una sola vista "Revisión Manual"

### ✅ Problema 2: "Demasiada info de excluidos"
**Solución:** En "Revisión Manual" solo se muestran candidatos, excluidos van a "Resultados"

### ✅ Problema 3: "No está claro qué hacer"
**Solución:** Cada tab tiene título claro + subtitle explicativo + tarjetas de ayuda

### ✅ Problema 4: "Análisis no explica su propósito"
**Solución:** Renombrado a "Priorización" con tarjeta explicativa y recomendación clara

---

**¿Aprobado por el usuario?** ⬜ Sí ⬜ No ⬜ Necesita ajustes

**Próximos pasos:** Implementar cambios en código después de aprobación.
