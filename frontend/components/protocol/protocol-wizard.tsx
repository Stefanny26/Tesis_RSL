"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, Sparkles, Brain, Zap, Save, BookOpen, Target, Search, Plus, X, Edit2, Check, CheckCircle2, FileText } from "lucide-react"
import { aiService, type AIProvider } from "@/lib/ai-service"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { ImportReferencesButton } from "@/components/screening/import-references-button"

interface ProtocolWizardProps {
  projectId: string
  projectTitle: string
  projectDescription: string
}

export function ProtocolWizard({ projectId, projectTitle, projectDescription }: ProtocolWizardProps) {
  const { toast } = useToast()
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini')
  const [loading, setLoading] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false) // Inicialmente oculto
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Captura de área y rango temporal del usuario
  const [projectArea, setProjectArea] = useState<string>("")
  const [yearStart, setYearStart] = useState<number>(2020) // Últimos 5 años por defecto
  const [yearEnd, setYearEnd] = useState<number>(new Date().getFullYear()) // Año actual
  
  const [protocolData, setProtocolData] = useState({
    proposedTitle: "",
    evaluationInitial: { themeClear: "", delimitation: "", viability: "", comment: "" },
    isNotMatrix: { is: [] as string[], isNot: [] as string[] },
    matrixElements: [] as Array<{ question: string; present: string; justification: string }>,
    refinedQuestion: "",
    pico: { population: "", intervention: "", comparison: "", outcomes: "" },
    researchQuestions: [""],
    inclusionCriteria: [""],
    exclusionCriteria: [""],
    searchStrategy: { databases: [] as string[], searchString: "", temporalRange: { start: 2019, end: 2025, justification: "" } },
    keyTerms: { technology: [] as string[], domain: [] as string[], studyType: [] as string[], themes: [] as string[] },
    prismaCompliance: [] as Array<{ number: number; item: string; complies: string; evidence: string }>,
  })

  const [editingItem, setEditingItem] = useState<{ section: string; type?: string; index: number; value: string } | null>(null)
  const [newItemSection, setNewItemSection] = useState<string | null>(null)
  const [newItemValue, setNewItemValue] = useState("")

  useEffect(() => {
    async function loadProtocol() {
      try {
        const protocol = await apiClient.getProtocol(projectId)
        if (protocol) {
          setProtocolData({
            proposedTitle: protocol.proposedTitle || "",
            evaluationInitial: protocol.evaluationInitial || { themeClear: "", delimitation: "", viability: "", comment: "" },
            isNotMatrix: { is: protocol.isMatrix || [], isNot: protocol.isNotMatrix || [] },
            matrixElements: protocol.matrixElements || [],
            refinedQuestion: protocol.refinedQuestion || "",
            pico: {
              population: protocol.picoFramework?.population || "",
              intervention: protocol.picoFramework?.intervention || "",
              comparison: protocol.picoFramework?.comparison || "",
              outcomes: protocol.picoFramework?.outcomes || ""
            },
            researchQuestions: protocol.researchQuestions || [""],
            inclusionCriteria: protocol.inclusionCriteria || [""],
            exclusionCriteria: protocol.exclusionCriteria || [""],
            searchStrategy: {
              databases: protocol.searchStrategy?.databases || [],
              searchString: protocol.searchStrategy?.searchString || "",
              temporalRange: protocol.searchStrategy?.temporalRange || { start: 2019, end: 2025, justification: "" }
            },
            keyTerms: protocol.keyTerms || { technology: [], domain: [], studyType: [], themes: [] },
            prismaCompliance: protocol.prismaCompliance || []
          })
          
          // Solo mostrar panel de IA si el protocolo está vacío (recién creado sin wizard)
          const isEmpty = !protocol.picoFramework?.population && 
                          !protocol.isMatrix?.length && 
                          !protocol.inclusionCriteria?.length &&
                          !protocol.prismaCompliance?.length
          setShowAIPanel(isEmpty)
        } else {
          // Protocolo no existe, mostrar panel de IA
          setShowAIPanel(true)
        }
      } catch (error) {
        console.error("Error cargando protocolo:", error)
        // Si hay error, asumir que es nuevo y mostrar IA
        setShowAIPanel(true)
      }
    }
    loadProtocol()
  }, [projectId])

  const saveProtocol = useCallback(async (data: typeof protocolData) => {
    setIsSaving(true)
    try {
      await apiClient.updateProtocol(projectId, {
        // Título propuesto por IA
        proposedTitle: data.proposedTitle,
        
        // Evaluación inicial
        evaluationInitial: data.evaluationInitial,
        
        // Matriz Es/No Es
        isMatrix: data.isNotMatrix.is,
        isNotMatrix: data.isNotMatrix.isNot,
        matrixElements: data.matrixElements,
        refinedQuestion: data.refinedQuestion,
        
        // Marco PICO
        population: data.pico.population,
        intervention: data.pico.intervention,
        comparison: data.pico.comparison,
        outcomes: data.pico.outcomes,
        
        // Preguntas de investigación
        researchQuestions: data.researchQuestions,
        
        // Criterios
        inclusionCriteria: data.inclusionCriteria,
        exclusionCriteria: data.exclusionCriteria,
        
        // Términos clave
        keyTerms: data.keyTerms,
        
        // Estrategia de búsqueda completa
        databases: data.searchStrategy.databases,
        searchString: data.searchStrategy.searchString,
        temporalRange: data.searchStrategy.temporalRange,
        
        // Cumplimiento PRISMA
        prismaCompliance: data.prismaCompliance
      })
      setLastSaved(new Date())
      toast({ 
        title: "✅ Guardado exitoso", 
        description: "Todos los datos del protocolo se guardaron en la base de datos" 
      })
    } catch (error) {
      console.error("Error guardando:", error)
      toast({ 
        title: "⚠️ Error al guardar", 
        description: "No se pudo guardar el protocolo en la base de datos", 
        variant: "destructive" 
      })
    } finally {
      setIsSaving(false)
    }
  }, [projectId, toast])

  const handleAIGenerate = async () => {
    if (!projectTitle || !projectDescription) {
      toast({ title: "Datos incompletos", description: "Se requiere título y descripción del proyecto", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      toast({ title: "Generando protocolo completo...", description: `Usando ${selectedProvider === 'chatgpt' ? 'ChatGPT' : 'Gemini'}. Esto puede tomar 30-60 segundos...` })
      const result = await aiService.generateProtocolAnalysis(
        projectTitle, 
        projectDescription, 
        selectedProvider,
        projectArea || undefined,
        yearStart,
        yearEnd
      )
      
      const newData = { ...protocolData }
      
      // Título propuesto
      if (result.data.titulo_propuesto) {
        newData.proposedTitle = result.data.titulo_propuesto
      }
      
      // Evaluación inicial
      if (result.data.evaluacion_inicial) {
        newData.evaluationInitial = {
          themeClear: result.data.evaluacion_inicial.tema_claro || "",
          delimitation: result.data.evaluacion_inicial.delimitacion_adecuada || "",
          viability: result.data.evaluacion_inicial.viabilidad_slr || "",
          comment: result.data.evaluacion_inicial.comentario || ""
        }
      }
      
      // Marco PICO
      if (result.data.fase1_marco_pico?.marco_pico) {
        const pico = result.data.fase1_marco_pico.marco_pico
        newData.pico = {
          population: pico.population?.descripcion || "",
          intervention: pico.intervention?.descripcion || "",
          comparison: pico.comparison?.descripcion || "",
          outcomes: pico.outcomes?.descripcion || ""
        }
      }
      
      // Matriz Es/No Es (completa)
      if (result.data.fase2_matriz_es_no_es) {
        newData.isNotMatrix = { 
          is: result.data.fase2_matriz_es_no_es.es || [], 
          isNot: result.data.fase2_matriz_es_no_es.no_es || [] 
        }
        newData.matrixElements = result.data.fase2_matriz_es_no_es.elementos || []
        newData.refinedQuestion = result.data.fase2_matriz_es_no_es.pregunta_refinada || ""
      }
      
      // Preguntas de investigación
      if (result.data.fase3_analisis_cochrane?.recomendaciones_pregunta) {
        newData.researchQuestions = result.data.fase3_analisis_cochrane.recomendaciones_pregunta
      }
      
      // Términos clave
      if (result.data.fase4_terminos_clave) {
        newData.keyTerms = {
          technology: result.data.fase4_terminos_clave.tecnologia_herramientas || [],
          domain: result.data.fase4_terminos_clave.dominio_aplicacion || [],
          studyType: result.data.fase4_terminos_clave.tipo_estudio || [],
          themes: result.data.fase4_terminos_clave.focos_tematicos || []
        }
      }
      
      // Cumplimiento PRISMA
      if (result.data.fase5_cumplimiento_prisma?.items_evaluados) {
        newData.prismaCompliance = result.data.fase5_cumplimiento_prisma.items_evaluados
      }
      
      // Criterios de inclusión/exclusión
      if (result.data.fase6_criterios_inclusion_exclusion) {
        newData.inclusionCriteria = result.data.fase6_criterios_inclusion_exclusion.criterios_inclusion || [""]
        newData.exclusionCriteria = result.data.fase6_criterios_inclusion_exclusion.criterios_exclusion || [""]
      }
      
      // Estrategia de búsqueda
      if (result.data.fase7_estrategia_busqueda) {
        newData.searchStrategy = {
          databases: result.data.fase7_estrategia_busqueda.bases_datos || [],
          searchString: result.data.fase7_estrategia_busqueda.cadena_busqueda || "",
          temporalRange: result.data.fase7_estrategia_busqueda.rango_temporal || { start: 2019, end: 2025, justification: "" }
        }
      }
      
      setProtocolData(newData)
      await saveProtocol(newData)
      setShowAIPanel(false)
      toast({ title: "✅ Protocolo completo generado", description: "Análisis PRISMA/Cochrane aplicado. Revisa todas las pestañas." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo generar el análisis", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMatrix = async () => {
    if (!projectTitle || !projectDescription) {
      toast({ title: "Datos incompletos", description: "Se requiere título y descripción del proyecto", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      toast({ title: "Generando Matriz Es/No Es...", description: `Usando ${selectedProvider === 'chatgpt' ? 'ChatGPT' : 'Gemini'}` })
      const result = await aiService.generateProtocolAnalysis(
        projectTitle, 
        projectDescription, 
        selectedProvider,
        projectArea || undefined,
        yearStart,
        yearEnd
      )
      
      const newData = { ...protocolData }
      if (result.data.fase2_matriz_es_no_es) {
        newData.isNotMatrix = { 
          is: result.data.fase2_matriz_es_no_es.es || [], 
          isNot: result.data.fase2_matriz_es_no_es.no_es || [] 
        }
      }
      setProtocolData(newData)
      await saveProtocol(newData)
      toast({ title: "✅ Matriz generada", description: "Criterios Es/No Es aplicados correctamente" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo generar la matriz", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Protocolo de Revisión Sistemática</CardTitle>
              <CardDescription>El sistema analizará tu propuesta y generará un protocolo PRISMA/Cochrane completo</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {/* Botón para importar referencias */}
              <ImportReferencesButton 
                projectId={projectId}
                variant="outline"
                size="sm"
                onImportSuccess={() => {
                  toast({
                    title: "✅ Referencias cargadas",
                    description: "Las referencias están listas para el cribado",
                    duration: 3000
                  })
                }}
              />
              
              {!showAIPanel && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAIPanel(true)}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Re-analizar con IA
                </Button>
              )}
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Guardando...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Save className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Guardado {new Date(lastSaved).toLocaleTimeString()}</span>
                </>
              ) : null}
            </div>
          </div>
        </CardHeader>
      </Card>

      {showAIPanel ? (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <CardTitle>Analizador y Generador de Protocolo con IA</CardTitle>
            </div>
            <CardDescription>
              La IA evaluará tu propuesta, verificará el cumplimiento PRISMA/Cochrane/WPOM y generará un protocolo completo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Proveedor de IA</label>
              <div className="flex gap-2">
                <Button variant={selectedProvider === 'chatgpt' ? 'default' : 'outline'} onClick={() => setSelectedProvider('chatgpt')} className="flex-1" disabled={loading}>
                  <Brain className="w-4 h-4 mr-2" />ChatGPT
                </Button>
                <Button variant={selectedProvider === 'gemini' ? 'default' : 'outline'} onClick={() => setSelectedProvider('gemini')} className="flex-1" disabled={loading}>
                  <Zap className="w-4 h-4 mr-2" />Gemini<Badge variant="secondary" className="ml-2">Recomendado</Badge>
                </Button>
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg space-y-2 border-2 border-dashed border-border">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">📋 Propuesta inicial del usuario:</p>
              <div>
                <span className="text-sm font-medium">Tema / Idea de investigación:</span>
                <p className="text-sm text-muted-foreground mt-1">{projectTitle}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Descripción / Contexto:</span>
                <p className="text-sm text-muted-foreground mt-1">{projectDescription}</p>
              </div>
            </div>
            
            {/* Campos adicionales para mejorar la calidad metodológica */}
            <div className="space-y-3 bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-900 font-semibold uppercase">⚙️ Configuración metodológica</p>
              <div>
                <label className="text-sm font-medium mb-1 block">Área de conocimiento (opcional)</label>
                <Input 
                  placeholder="Ej: Informática, Medicina, Ingeniería..."
                  value={projectArea}
                  onChange={(e) => setProjectArea(e.target.value)}
                  disabled={loading}
                  className="bg-white"
                />
                <p className="text-xs text-muted-foreground mt-1">Ayuda a contextualizar el protocolo según estándares del área</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Año inicio</label>
                  <Input 
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    placeholder="2020"
                    value={yearStart}
                    onChange={(e) => setYearStart(parseInt(e.target.value) || 2020)}
                    disabled={loading}
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Año fin</label>
                  <Input 
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    placeholder={new Date().getFullYear().toString()}
                    value={yearEnd}
                    onChange={(e) => setYearEnd(parseInt(e.target.value) || new Date().getFullYear())}
                    disabled={loading}
                    className="bg-white"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Rango temporal: {yearStart} - {yearEnd} ({yearEnd - yearStart} años). 
                Recomendado: últimos 5-10 años para áreas tecnológicas.
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-900 font-medium">💡 ¿Qué hará el sistema?</p>
              <ul className="text-xs text-blue-800 mt-1 space-y-1 ml-4 list-disc">
                <li>Evaluará si tu idea cumple con los estándares de una revisión sistemática</li>
                <li>Aplicará el marco PICO y la matriz Es/No Es para delimitar el alcance</li>
                <li>Propondrá un título refinado según Cochrane Review</li>
                <li>Generará criterios de inclusión/exclusión y estrategia de búsqueda</li>
              </ul>
            </div>
            <Button onClick={handleAIGenerate} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando propuesta y generando protocolo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analizar y Generar Protocolo Completo
                </>
              )}
            </Button>
            {loading && (
              <p className="text-xs text-center text-muted-foreground italic">
                ⏱️ Esto puede tomar 40-60 segundos. La IA está evaluando tu propuesta con criterios PRISMA/Cochrane...
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setShowAIPanel(true)}>
            <Sparkles className="w-4 h-4 mr-2" />Re-analizar con IA
          </Button>
        </div>
      )}

      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="resumen"><FileText className="w-4 h-4 mr-2" />Análisis</TabsTrigger>
          <TabsTrigger value="pico"><Target className="w-4 h-4 mr-2" />PICO</TabsTrigger>
          <TabsTrigger value="matriz"><BookOpen className="w-4 h-4 mr-2" />Es/No Es</TabsTrigger>
          <TabsTrigger value="criterios"><CheckCircle2 className="w-4 h-4 mr-2" />Criterios</TabsTrigger>
          <TabsTrigger value="busqueda"><Search className="w-4 h-4 mr-2" />Búsqueda</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          <div className="space-y-6">
            {/* Propuesta Original */}
            <Card className="border-border bg-muted/30">
              <CardHeader>
                <CardTitle className="text-foreground">📝 Tu Propuesta Inicial</CardTitle>
                <CardDescription>Tema e idea de investigación proporcionada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Tema / Idea:</p>
                  <p className="text-sm text-foreground">{projectTitle}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Descripción / Contexto:</p>
                  <p className="text-sm text-foreground">{projectDescription}</p>
                </div>
              </CardContent>
            </Card>

            {/* Título Propuesto */}
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="text-blue-900">✨ Título Refinado (Propuesto por IA)</CardTitle>
                <CardDescription>Título mejorado según estándares Cochrane Review y PRISMA</CardDescription>
              </CardHeader>
              <CardContent>
                {protocolData.proposedTitle ? (
                  <div className="p-4 bg-card rounded-lg border-2 border-primary">
                    <p className="text-lg font-semibold text-foreground">{protocolData.proposedTitle}</p>
                    <p className="text-xs text-blue-600 mt-2">
                      💡 Este título sigue el formato: [Tecnología] in [Contexto]: A Systematic Literature Review on [Aspectos Clave]
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-sm text-muted-foreground italic text-center">
                      Haz clic en "Analizar y Generar Protocolo" para que la IA proponga un título refinado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evaluación Inicial */}
            <Card>
              <CardHeader>
                <CardTitle>🔍 Evaluación de Viabilidad</CardTitle>
                <CardDescription>La IA evalúa si tu propuesta cumple con los requisitos para una revisión sistemática</CardDescription>
              </CardHeader>
              <CardContent>
                {protocolData.evaluationInitial?.comment ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">Tema Claro</p>
                        <Badge variant={protocolData.evaluationInitial.themeClear === 'si' ? 'default' : 'secondary'}>
                          {protocolData.evaluationInitial.themeClear === 'si' ? '✅ Sí' : '⚠️ No'}
                        </Badge>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">Delimitación</p>
                        <Badge variant={protocolData.evaluationInitial.delimitation === 'si' ? 'default' : 'secondary'}>
                          {protocolData.evaluationInitial.delimitation === 'si' ? '✅ Sí' : '⚠️ No'}
                        </Badge>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">Viabilidad SLR</p>
                        <Badge variant={protocolData.evaluationInitial.viability === 'si' ? 'default' : 'secondary'}>
                          {protocolData.evaluationInitial.viability === 'si' ? '✅ Sí' : '⚠️ No'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">📋 Comentario de la IA:</p>
                      <p className="text-sm text-foreground">{protocolData.evaluationInitial.comment}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-card rounded-lg border-2 border-dashed border-border">
                    <p className="text-sm text-muted-foreground italic text-center">
                      La IA evaluará si tu propuesta tiene: <strong>tema claro</strong>, <strong>delimitación adecuada</strong> y <strong>viabilidad como SLR</strong>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pregunta Refinada */}
            {protocolData.refinedQuestion && (
              <Card className="border-green-200 bg-green-50/30">
                <CardHeader>
                  <CardTitle className="text-green-900">❓ Pregunta de Investigación Refinada</CardTitle>
                  <CardDescription>Pregunta mejorada basada en el análisis de la matriz Es/No Es</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-white rounded-lg border border-green-300">
                    <p className="text-base text-gray-800">{protocolData.refinedQuestion}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Términos Clave */}
            {protocolData.keyTerms?.technology?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>🔑 Términos Clave Identificados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {protocolData.keyTerms?.technology?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">🧩 Tecnología / Herramientas:</p>
                      <div className="flex flex-wrap gap-2">
                        {protocolData.keyTerms.technology.map((term, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-50">{term}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {protocolData.keyTerms?.domain?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">🧪 Dominio de Aplicación:</p>
                      <div className="flex flex-wrap gap-2">
                        {protocolData.keyTerms.domain.map((term, i) => (
                          <Badge key={i} variant="outline" className="bg-purple-50">{term}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {protocolData.keyTerms?.themes?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">🔍 Focos Temáticos:</p>
                      <div className="flex flex-wrap gap-2">
                        {protocolData.keyTerms.themes.map((term, i) => (
                          <Badge key={i} variant="outline" className="bg-green-50">{term}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Marco PICO</CardTitle>
              <CardDescription>
                Framework para estructurar la pregunta de investigación (Población, Intervención, Comparación, Resultados)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">📍 Población / Problema (P)</label>
                <p className="text-xs text-muted-foreground mb-1">¿Cuál es el contexto o población objetivo?</p>
                <Textarea value={protocolData.pico.population} onChange={(e) => { const newData = { ...protocolData, pico: { ...protocolData.pico, population: e.target.value } }; setProtocolData(newData); setTimeout(() => saveProtocol(newData), 2000) }} rows={3} className="mt-1" placeholder="Ej: Aplicaciones web desarrolladas con Node.js y Express.js" />
              </div>
              <div>
                <label className="text-sm font-medium">🔧 Intervención / Tecnología (I)</label>
                <p className="text-xs text-muted-foreground mb-1">¿Qué tecnología, método o enfoque se estudia?</p>
                <Textarea value={protocolData.pico.intervention} onChange={(e) => { const newData = { ...protocolData, pico: { ...protocolData.pico, intervention: e.target.value } }; setProtocolData(newData); setTimeout(() => saveProtocol(newData), 2000) }} rows={3} className="mt-1" placeholder="Ej: Implementación de autenticación JWT y OAuth2.0" />
              </div>
              <div>
                <label className="text-sm font-medium">⚖️ Comparación (C)</label>
                <p className="text-xs text-muted-foreground mb-1">¿Con qué se compara? (Opcional)</p>
                <Textarea value={protocolData.pico.comparison} onChange={(e) => { const newData = { ...protocolData, pico: { ...protocolData.pico, comparison: e.target.value } }; setProtocolData(newData); setTimeout(() => saveProtocol(newData), 2000) }} rows={3} className="mt-1" placeholder="Ej: Otras estrategias de autenticación (session-based, API keys)" />
              </div>
              <div>
                <label className="text-sm font-medium">📊 Resultados / Outcomes (O)</label>
                <p className="text-xs text-muted-foreground mb-1">¿Qué resultados o impactos se esperan observar?</p>
                <Textarea value={protocolData.pico.outcomes} onChange={(e) => { const newData = { ...protocolData, pico: { ...protocolData.pico, outcomes: e.target.value } }; setProtocolData(newData); setTimeout(() => saveProtocol(newData), 2000) }} rows={3} className="mt-1" placeholder="Ej: Seguridad, rendimiento, facilidad de implementación, escalabilidad" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matriz">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>📖 Matriz Es/No Es (Delimitación del Alcance)</CardTitle>
                  <CardDescription>
                    Define claramente qué SÍ incluye y qué NO incluye tu investigación para delimitar el alcance
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleGenerateMatrix} 
                  disabled={loading}
                  variant="outline"
                  className="gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generar con IA
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Columna ES */}
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-green-700">✅ ES (Incluye)</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewItemSection('is')
                          setNewItemValue('')
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {newItemSection === 'is' && (
                      <div className="flex gap-2 p-2 bg-white rounded-lg border border-green-300">
                        <Input
                          placeholder="Nuevo elemento..."
                          value={newItemValue}
                          onChange={(e) => setNewItemValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newItemValue.trim()) {
                              const newData = { ...protocolData }
                              newData.isNotMatrix.is.push(newItemValue.trim())
                              setProtocolData(newData)
                              setNewItemValue('')
                              setNewItemSection(null)
                              setTimeout(() => saveProtocol(newData), 1000)
                            }
                            if (e.key === 'Escape') setNewItemSection(null)
                          }}
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          onClick={() => {
                            if (newItemValue.trim()) {
                              const newData = { ...protocolData }
                              newData.isNotMatrix.is.push(newItemValue.trim())
                              setProtocolData(newData)
                              setNewItemValue('')
                              setNewItemSection(null)
                              setTimeout(() => saveProtocol(newData), 1000)
                            }
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setNewItemSection(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {protocolData.isNotMatrix.is.length === 0 ? (
                      <p className="text-sm text-center py-4 text-muted-foreground italic">
                        No hay elementos. Genera con IA o agrega manualmente.
                      </p>
                    ) : (
                      protocolData.isNotMatrix.is.map((item, index) => (
                        <div key={`is-${index}`}>
                          {editingItem?.section === 'isNotMatrix' && editingItem.type === 'is' && editingItem.index === index ? (
                            <div className="flex gap-2 p-2 bg-white rounded-lg border border-green-500">
                              <Input
                                value={editingItem.value}
                                onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newData = { ...protocolData }
                                    newData.isNotMatrix.is[index] = editingItem.value
                                    setProtocolData(newData)
                                    setEditingItem(null)
                                    setTimeout(() => saveProtocol(newData), 1000)
                                  }
                                  if (e.key === 'Escape') setEditingItem(null)
                                }}
                                autoFocus
                              />
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  const newData = { ...protocolData }
                                  newData.isNotMatrix.is[index] = editingItem.value
                                  setProtocolData(newData)
                                  setEditingItem(null)
                                  setTimeout(() => saveProtocol(newData), 1000)
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="group flex items-center gap-2 p-3 bg-white rounded-lg border border-green-200 hover:border-green-400 transition-colors">
                              <span className="flex-1 text-sm">{item}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => setEditingItem({ section: 'isNotMatrix', type: 'is', index, value: item })}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-red-600"
                                  onClick={() => {
                                    const newData = { ...protocolData }
                                    newData.isNotMatrix.is = newData.isNotMatrix.is.filter((_, i) => i !== index)
                                    setProtocolData(newData)
                                    setTimeout(() => saveProtocol(newData), 1000)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Columna NO ES */}
                <Card className="border-red-200 bg-red-50/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-red-700">❌ NO ES (Excluye)</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewItemSection('isNot')
                          setNewItemValue('')
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {newItemSection === 'isNot' && (
                      <div className="flex gap-2 p-2 bg-white rounded-lg border border-red-300">
                        <Input
                          placeholder="Nuevo elemento..."
                          value={newItemValue}
                          onChange={(e) => setNewItemValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newItemValue.trim()) {
                              const newData = { ...protocolData }
                              newData.isNotMatrix.isNot.push(newItemValue.trim())
                              setProtocolData(newData)
                              setNewItemValue('')
                              setNewItemSection(null)
                              setTimeout(() => saveProtocol(newData), 1000)
                            }
                            if (e.key === 'Escape') setNewItemSection(null)
                          }}
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          onClick={() => {
                            if (newItemValue.trim()) {
                              const newData = { ...protocolData }
                              newData.isNotMatrix.isNot.push(newItemValue.trim())
                              setProtocolData(newData)
                              setNewItemValue('')
                              setNewItemSection(null)
                              setTimeout(() => saveProtocol(newData), 1000)
                            }
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setNewItemSection(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {protocolData.isNotMatrix.isNot.length === 0 ? (
                      <p className="text-sm text-center py-4 text-muted-foreground italic">
                        No hay elementos. Genera con IA o agrega manualmente.
                      </p>
                    ) : (
                      protocolData.isNotMatrix.isNot.map((item, index) => (
                        <div key={`isNot-${index}`}>
                          {editingItem?.section === 'isNotMatrix' && editingItem.type === 'isNot' && editingItem.index === index ? (
                            <div className="flex gap-2 p-2 bg-white rounded-lg border border-red-500">
                              <Input
                                value={editingItem.value}
                                onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newData = { ...protocolData }
                                    newData.isNotMatrix.isNot[index] = editingItem.value
                                    setProtocolData(newData)
                                    setEditingItem(null)
                                    setTimeout(() => saveProtocol(newData), 1000)
                                  }
                                  if (e.key === 'Escape') setEditingItem(null)
                                }}
                                autoFocus
                              />
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  const newData = { ...protocolData }
                                  newData.isNotMatrix.isNot[index] = editingItem.value
                                  setProtocolData(newData)
                                  setEditingItem(null)
                                  setTimeout(() => saveProtocol(newData), 1000)
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="group flex items-center gap-2 p-3 bg-white rounded-lg border border-red-200 hover:border-red-400 transition-colors">
                              <span className="flex-1 text-sm">{item}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => setEditingItem({ section: 'isNotMatrix', type: 'isNot', index, value: item })}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-red-600"
                                  onClick={() => {
                                    const newData = { ...protocolData }
                                    newData.isNotMatrix.isNot = newData.isNotMatrix.isNot.filter((_, i) => i !== index)
                                    setProtocolData(newData)
                                    setTimeout(() => saveProtocol(newData), 1000)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="busqueda">
          <Card>
            <CardHeader>
              <CardTitle>Estrategia de Búsqueda</CardTitle>
              <CardDescription>Define tu estrategia de búsqueda y las bases de datos a utilizar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cadena de Búsqueda Booleana</label>
                <Textarea 
                  placeholder='Ej: ("Mongoose" OR "ODM") AND ("Node.js" OR "JavaScript") AND ("MongoDB")'
                  value={protocolData.searchStrategy.searchString} 
                  onChange={(e) => { 
                    const newData = { ...protocolData, searchStrategy: { ...protocolData.searchStrategy, searchString: e.target.value } }
                    setProtocolData(newData)
                    setTimeout(() => saveProtocol(newData), 2000) 
                  }} 
                  rows={4} 
                  className="font-mono text-sm" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Usa operadores booleanos: AND, OR, NOT y comillas para frases exactas
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Bases de Datos Seleccionadas</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewItemSection('databases')
                      setNewItemValue('')
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Base de Datos
                  </Button>
                </div>

                {newItemSection === 'databases' && (
                  <div className="flex gap-2 p-3 bg-muted rounded-lg mb-3">
                    <Input
                      placeholder="Nombre de la base de datos (ej: IEEE Xplore, ACM Digital Library)"
                      value={newItemValue}
                      onChange={(e) => setNewItemValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newItemValue.trim()) {
                          const newData = { ...protocolData }
                          newData.searchStrategy.databases.push(newItemValue.trim())
                          setProtocolData(newData)
                          setNewItemValue('')
                          setNewItemSection(null)
                          setTimeout(() => saveProtocol(newData), 1000)
                        }
                        if (e.key === 'Escape') setNewItemSection(null)
                      }}
                      autoFocus
                    />
                    <Button 
                      size="sm" 
                      onClick={() => {
                        if (newItemValue.trim()) {
                          const newData = { ...protocolData }
                          newData.searchStrategy.databases.push(newItemValue.trim())
                          setProtocolData(newData)
                          setNewItemValue('')
                          setNewItemSection(null)
                          setTimeout(() => saveProtocol(newData), 1000)
                        }
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setNewItemSection(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {protocolData.searchStrategy.databases.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic py-2">
                      No hay bases de datos configuradas. Genera con IA o agrega manualmente.
                    </p>
                  ) : (
                    protocolData.searchStrategy.databases.map((db, i) => (
                      <Badge key={`db-${i}`} variant="secondary" className="text-sm py-1 px-3">
                        {db}
                        <button
                          onClick={() => {
                            const newData = { ...protocolData }
                            newData.searchStrategy.databases = newData.searchStrategy.databases.filter((_, idx) => idx !== i)
                            setProtocolData(newData)
                            setTimeout(() => saveProtocol(newData), 1000)
                          }}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>

                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-blue-900 mb-1">💡 Bases de datos recomendadas:</p>
                  <p className="text-xs text-blue-700">
                    IEEE Xplore, ACM Digital Library, Scopus, Web of Science, Springer Link, ScienceDirect, Google Scholar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criterios">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Criterios de Inclusión */}
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-800">✅ Criterios de Inclusión</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewItemSection('inclusion')
                      setNewItemValue('')
                    }}
                    className="border-green-300 hover:bg-green-100"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                <CardDescription>Qué estudios o artículos SÍ serán incluidos en la revisión sistemática</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {newItemSection === 'inclusion' && (
                  <div className="flex gap-2 p-3 bg-white rounded-lg border border-green-300 mb-3">
                    <Input
                      placeholder="Ej: Artículos publicados entre 2019 y 2024"
                      value={newItemValue}
                      onChange={(e) => setNewItemValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newItemValue.trim()) {
                          const newData = { ...protocolData }
                          newData.inclusionCriteria.push(newItemValue.trim())
                          setProtocolData(newData)
                          setNewItemValue('')
                          setNewItemSection(null)
                          setTimeout(() => saveProtocol(newData), 1000)
                        }
                        if (e.key === 'Escape') setNewItemSection(null)
                      }}
                      autoFocus
                    />
                    <Button 
                      size="sm" 
                      onClick={() => {
                        if (newItemValue.trim()) {
                          const newData = { ...protocolData }
                          newData.inclusionCriteria.push(newItemValue.trim())
                          setProtocolData(newData)
                          setNewItemValue('')
                          setNewItemSection(null)
                          setTimeout(() => saveProtocol(newData), 1000)
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setNewItemSection(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {protocolData.inclusionCriteria.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-4 text-center">
                    No hay criterios de inclusión. Genera con IA o agrega manualmente.
                  </p>
                ) : (
                  protocolData.inclusionCriteria.map((criterion, index) => (
                    <div 
                      key={`inclusion-${index}`}
                      className="group flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200 hover:border-green-400 transition-colors"
                    >
                      {editingItem?.section === 'inclusionCriteria' && editingItem.index === index ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const newData = { ...protocolData }
                                newData.inclusionCriteria[index] = editingItem.value
                                setProtocolData(newData)
                                setEditingItem(null)
                                setTimeout(() => saveProtocol(newData), 1000)
                              }
                              if (e.key === 'Escape') setEditingItem(null)
                            }}
                            autoFocus
                          />
                          <Button size="sm" onClick={() => {
                            const newData = { ...protocolData }
                            newData.inclusionCriteria[index] = editingItem.value
                            setProtocolData(newData)
                            setEditingItem(null)
                            setTimeout(() => saveProtocol(newData), 1000)
                          }}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <p className="flex-1 text-sm text-gray-700">{criterion}</p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingItem({ section: 'inclusionCriteria', index, value: criterion })}
                              className="h-7 w-7 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newData = { ...protocolData }
                                newData.inclusionCriteria = newData.inclusionCriteria.filter((_, i) => i !== index)
                                setProtocolData(newData)
                                setTimeout(() => saveProtocol(newData), 1000)
                              }}
                              className="h-7 w-7 p-0 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Criterios de Exclusión */}
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-800">✗ Criterios de Exclusión</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewItemSection('exclusion')
                      setNewItemValue('')
                    }}
                    className="border-red-300 hover:bg-red-100"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                <CardDescription>Qué estudios o artículos NO serán incluidos en la revisión sistemática</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {newItemSection === 'exclusion' && (
                  <div className="flex gap-2 p-3 bg-white rounded-lg border border-red-300 mb-3">
                    <Input
                      placeholder="Ej: Artículos que no estén en inglés o español"
                      value={newItemValue}
                      onChange={(e) => setNewItemValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newItemValue.trim()) {
                          const newData = { ...protocolData }
                          newData.exclusionCriteria.push(newItemValue.trim())
                          setProtocolData(newData)
                          setNewItemValue('')
                          setNewItemSection(null)
                          setTimeout(() => saveProtocol(newData), 1000)
                        }
                        if (e.key === 'Escape') setNewItemSection(null)
                      }}
                      autoFocus
                    />
                    <Button 
                      size="sm" 
                      onClick={() => {
                        if (newItemValue.trim()) {
                          const newData = { ...protocolData }
                          newData.exclusionCriteria.push(newItemValue.trim())
                          setProtocolData(newData)
                          setNewItemValue('')
                          setNewItemSection(null)
                          setTimeout(() => saveProtocol(newData), 1000)
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setNewItemSection(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {protocolData.exclusionCriteria.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-4 text-center">
                    No hay criterios de exclusión. Genera con IA o agrega manualmente.
                  </p>
                ) : (
                  protocolData.exclusionCriteria.map((criterion, index) => (
                    <div 
                      key={`exclusion-${index}`}
                      className="group flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200 hover:border-red-400 transition-colors"
                    >
                      {editingItem?.section === 'exclusionCriteria' && editingItem.index === index ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const newData = { ...protocolData }
                                newData.exclusionCriteria[index] = editingItem.value
                                setProtocolData(newData)
                                setEditingItem(null)
                                setTimeout(() => saveProtocol(newData), 1000)
                              }
                              if (e.key === 'Escape') setEditingItem(null)
                            }}
                            autoFocus
                          />
                          <Button size="sm" onClick={() => {
                            const newData = { ...protocolData }
                            newData.exclusionCriteria[index] = editingItem.value
                            setProtocolData(newData)
                            setEditingItem(null)
                            setTimeout(() => saveProtocol(newData), 1000)
                          }}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <p className="flex-1 text-sm text-gray-700">{criterion}</p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingItem({ section: 'exclusionCriteria', index, value: criterion })}
                              className="h-7 w-7 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newData = { ...protocolData }
                                newData.exclusionCriteria = newData.exclusionCriteria.filter((_, i) => i !== index)
                                setProtocolData(newData)
                                setTimeout(() => saveProtocol(newData), 1000)
                              }}
                              className="h-7 w-7 p-0 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
