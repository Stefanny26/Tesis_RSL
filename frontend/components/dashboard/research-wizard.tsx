"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, Sparkles, ArrowRight, ArrowLeft, Loader2, Brain, Zap, BookOpen, Search, CheckSquare, FileText, Edit2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

type AIProvider = 'chatgpt' | 'gemini'

interface ResearchQuestion {
  question: string
}

interface MatrixElement {
  pregunta: string
  presente: 'si' | 'no' | 'parcial'
  justificacion: string
}

interface PICOData {
  population: string
  intervention: string
  comparison: string
  outcomes: string
}

interface GeneratedProtocol {
  matrixElements: MatrixElement[]
  matrixEs: string[]
  matrixNoEs: string[]
  picoData: PICOData
  proposedTitle: string
  cochraneCompliance: string
  keyTerms: {
    technology: string[]
    domain: string[]
    studyType: string[]
    thematicFocus: string[]
  }
}

interface SearchStrategy {
  database: string
  results: number
  dateRange: string
  searchString: string
}

interface PRISMAItem {
  item: string
  complies: boolean
  evidence: string
}

interface InclusionCriteria {
  category: string
  inclusion: string
  exclusion: string
}

interface ResearchWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type WizardStep = 'question' | 'analysis' | 'title' | 'terms' | 'strategy' | 'prisma' | 'criteria' | 'preview'

export function ResearchWizard({ open, onOpenChange }: ResearchWizardProps) {
  const { toast } = useToast()
  const router = useRouter()
  
  // Estado del wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>('question')
  const [useAI, setUseAI] = useState(true)
  const [aiProvider, setAIProvider] = useState<AIProvider>('gemini')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Datos de entrada
  const [researchQuestion, setResearchQuestion] = useState('')
  
  // Datos generados (editables)
  const [generatedData, setGeneratedData] = useState<GeneratedProtocol>({
    matrixElements: [],
    matrixEs: [],
    matrixNoEs: [],
    picoData: { population: '', intervention: '', comparison: '', outcomes: '' },
    proposedTitle: '',
    cochraneCompliance: '',
    keyTerms: { technology: [], domain: [], studyType: [], thematicFocus: [] }
  })
  
  const [searchStrategies, setSearchStrategies] = useState<SearchStrategy[]>([])
  const [prismaItems, setPrismaItems] = useState<PRISMAItem[]>([])
  const [inclusionCriteria, setInclusionCriteria] = useState<InclusionCriteria[]>([
    { category: 'Cobertura temática', inclusion: '', exclusion: '' },
    { category: 'Tecnologías abordadas', inclusion: '', exclusion: '' },
    { category: 'Tipo de estudio', inclusion: '', exclusion: '' },
    { category: 'Tipo de documento', inclusion: '', exclusion: '' },
    { category: 'Rango temporal', inclusion: '', exclusion: '' },
    { category: 'Idioma', inclusion: '', exclusion: '' }
  ])

  const steps: { id: WizardStep; title: string; icon: any }[] = [
    { id: 'question', title: 'Pregunta de Investigación', icon: FileText },
    { id: 'analysis', title: 'Análisis con IA', icon: Sparkles },
    { id: 'title', title: 'Título Propuesto', icon: BookOpen },
    { id: 'terms', title: 'Términos Clave', icon: Edit2 },
    { id: 'strategy', title: 'Estrategia de Búsqueda', icon: Search },
    { id: 'prisma', title: 'Verificación PRISMA', icon: CheckSquare },
    { id: 'criteria', title: 'Criterios Inclusión/Exclusión', icon: CheckCircle2 },
    { id: 'preview', title: 'Revisión Final', icon: FileText }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const handleNext = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  const handleBack = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id)
    }
  }

  const handleGenerateAnalysis = async () => {
    if (!researchQuestion.trim()) {
      toast({
        title: "Campo requerido",
        description: "Ingresa tu pregunta de investigación",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      toast({
        title: "Generando análisis...",
        description: `Usando ${aiProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} para analizar tu pregunta`
      })
      
      // Llamar al endpoint de análisis completo
      const result = await apiClient.generateProtocolAnalysis(
        'Análisis de pregunta de investigación',
        researchQuestion,
        aiProvider
      )
      
      // Mapear resultado al formato esperado
      setGeneratedData({
        matrixElements: result.fase2_matriz_es_no_es?.elementos || [],
        matrixEs: result.fase2_matriz_es_no_es?.es || [],
        matrixNoEs: result.fase2_matriz_es_no_es?.no_es || [],
        picoData: {
          population: result.fase1_pregunta_refinada || '',
          intervention: '',
          comparison: '',
          outcomes: ''
        },
        proposedTitle: result.titulo_propuesto || '',
        cochraneCompliance: result.fase3_analisis_cochrane?.cumplimiento_general || '',
        keyTerms: {
          technology: result.fase5_terminos_clave?.tecnologias || [],
          domain: result.fase5_terminos_clave?.dominios || [],
          studyType: result.fase5_terminos_clave?.tipos_estudio || [],
          thematicFocus: result.fase5_terminos_clave?.conceptos_principales || []
        }
      })
      
      // Inicializar PRISMA items
      setPrismaItems([
        { item: '¿Es entendible por alguien que no es experto?', complies: true, evidence: '' },
        { item: '¿Se definen claramente las "variables"?', complies: true, evidence: '' },
        { item: '¿Se describe la justificación de la revisión?', complies: true, evidence: '' },
        { item: '¿Se proporciona una declaración explícita usando PICOS?', complies: true, evidence: '' },
        { item: '¿Se especifica y justifica la estrategia de búsqueda?', complies: true, evidence: '' },
        { item: '¿Se identifican los criterios de inclusión y exclusión?', complies: true, evidence: '' },
        { item: '¿Se describen todas las fuentes de información?', complies: true, evidence: '' },
        { item: '¿Se presenta la estrategia electrónica completa?', complies: true, evidence: '' },
        { item: '¿Se identifican las revistas para búsquedas manuales?', complies: true, evidence: '' },
        { item: '¿Se especifica el período temporal y justificación?', complies: true, evidence: '' },
        { item: '¿Se indican procedimientos auxiliares?', complies: true, evidence: '' },
        { item: '¿Se describe cómo se evaluará el proceso de búsqueda?', complies: true, evidence: '' },
        { item: 'Conclusión: Cumplimiento PRISMA/WPOM', complies: true, evidence: 'Cumple completamente' }
      ])
      
      toast({
        title: "✅ Análisis completado",
        description: "Revisa y edita los resultados generados"
      })
      
      handleNext()
    } catch (error: any) {
      console.error('Error generando análisis:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el análisis",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateStrategies = async () => {
    setIsGenerating(true)
    try {
      toast({
        title: "Generando estrategias...",
        description: "Creando cadenas de búsqueda por base de datos"
      })
      
      const databases = ['scopus', 'acm', 'ieee', 'springer', 'sciencedirect', 'scholar']
      const result = await apiClient.generateSearchStrategies(
        { 
          population: generatedData.picoData.population,
          intervention: generatedData.picoData.intervention 
        },
        generatedData.picoData,
        databases,
        [...generatedData.keyTerms.technology, ...generatedData.keyTerms.domain],
        aiProvider
      )
      
      const strategies: SearchStrategy[] = databases.map(db => {
        const strategy = result.strategies[db]
        return {
          database: db.charAt(0).toUpperCase() + db.slice(1),
          results: 0,
          dateRange: '2019 - 2025',
          searchString: strategy?.searchString || ''
        }
      })
      
      setSearchStrategies(strategies)
      
      toast({
        title: "✅ Estrategias generadas",
        description: "Revisa y edita las cadenas de búsqueda"
      })
    } catch (error: any) {
      console.error('Error generando estrategias:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar las estrategias",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateProject = async () => {
    setIsSaving(true)
    try {
      const projectData = {
        title: generatedData.proposedTitle,
        description: `
**Pregunta de Investigación:**
${researchQuestion}

**Análisis Cochrane:**
${generatedData.cochraneCompliance}

**Marco PICO:**
- P: ${generatedData.picoData.population}
- I: ${generatedData.picoData.intervention}
- C: ${generatedData.picoData.comparison || 'N/A'}
- O: ${generatedData.picoData.outcomes}

**Matriz Es/No Es:**
Es: ${generatedData.matrixEs.join(', ')}
No Es: ${generatedData.matrixNoEs.join(', ')}
        `.trim()
      }
      
      const result = await apiClient.createProject(projectData)
      
      if (result.success && result.data?.project?.id) {
        toast({
          title: "✅ Proyecto creado",
          description: "Redirigiendo al protocolo..."
        })
        onOpenChange(false)
        router.push(`/projects/${result.data.project.id}/protocol`)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el proyecto",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Asistente de Creación con IA - Protocolo de Investigación
          </DialogTitle>
          <DialogDescription className="text-base">
            Genera tu protocolo completo paso a paso siguiendo metodología Cochrane/PRISMA
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-2 py-3 bg-muted rounded-lg overflow-x-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStepIndex > index
            
            return (
              <div key={step.id} className="flex items-center min-w-fit">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${isActive ? 'bg-primary text-primary-foreground' : ''}
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-muted-foreground/20 text-muted-foreground' : ''}
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs mt-1 text-center max-w-[90px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20'}`} />
                )}
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-2">
          {/* STEP 1: Pregunta de Investigación */}
          {currentStep === 'question' && (
            <div className="space-y-6 py-6">
              <div>
                <h3 className="text-2xl font-semibold mb-3">Pregunta de Investigación</h3>
                <p className="text-base text-muted-foreground mb-6">
                  Ingresa tu pregunta de investigación. El asistente con IA te ayudará a estructurar tu protocolo completo.
                </p>
              </div>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Tu Pregunta de Investigación</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ej: ¿Cómo Mongoose ODM afecta el rendimiento y patrones de diseño en aplicaciones Node.js con MongoDB?"
                    value={researchQuestion}
                    onChange={(e) => setResearchQuestion(e.target.value)}
                    rows={4}
                    className="text-base"
                  />
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-base">Configuración de IA</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useAI"
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="useAI" className="text-base cursor-pointer">
                      Usar IA para generar análisis completo (Matriz Es/No Es, PICO, Título Cochrane, Términos)
                    </Label>
                  </div>
                  
                  {useAI && (
                    <div className="flex gap-3">
                      <Button
                        variant={aiProvider === 'gemini' ? 'default' : 'outline'}
                        onClick={() => setAIProvider('gemini')}
                        className="flex-1"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Gemini (Recomendado)
                      </Button>
                      <Button
                        variant={aiProvider === 'chatgpt' ? 'default' : 'outline'}
                        onClick={() => setAIProvider('chatgpt')}
                        className="flex-1"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        ChatGPT
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerateAnalysis}
                  disabled={isGenerating || !researchQuestion.trim()}
                  size="lg"
                  className="text-base px-6"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generando análisis completo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generar Análisis con IA
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Análisis Generado (Matriz + PICO) */}
          {currentStep === 'analysis' && (
            <div className="space-y-6 py-6">
              <div>
                <h3 className="text-2xl font-semibold mb-3">Análisis de tu Pregunta de Investigación</h3>
                <p className="text-base text-muted-foreground mb-6">
                  Revisa y edita el análisis generado. Incluye Matriz Es/No Es y Marco PICO.
                </p>
              </div>

              {/* Matriz Es/No Es */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Matriz "Es / No Es" aplicada a la pregunta planteada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {generatedData.matrixElements.map((element, index) => (
                      <Card key={index} className="border">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Badge variant={
                              element.presente === 'si' ? 'default' : 
                              element.presente === 'parcial' ? 'secondary' : 'destructive'
                            }>
                              {element.presente}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium mb-1">{element.pregunta}</p>
                              <Textarea
                                value={element.justificacion}
                                onChange={(e) => {
                                  const newElements = [...generatedData.matrixElements]
                                  newElements[index].justificacion = e.target.value
                                  setGeneratedData({ ...generatedData, matrixElements: newElements })
                                }}
                                className="mt-2"
                                rows={2}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <Label className="text-base font-semibold mb-2 block">ES (Criterios de Inclusión)</Label>
                      <Textarea
                        value={generatedData.matrixEs.join('\n')}
                        onChange={(e) => setGeneratedData({ 
                          ...generatedData, 
                          matrixEs: e.target.value.split('\n').filter(Boolean) 
                        })}
                        rows={5}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-semibold mb-2 block">NO ES (Criterios de Exclusión)</Label>
                      <Textarea
                        value={generatedData.matrixNoEs.join('\n')}
                        onChange={(e) => setGeneratedData({ 
                          ...generatedData, 
                          matrixNoEs: e.target.value.split('\n').filter(Boolean) 
                        })}
                        rows={5}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Marco PICO */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aplicación del Marco PICO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base">P - Población/Contexto</Label>
                      <Input
                        value={generatedData.picoData.population}
                        onChange={(e) => setGeneratedData({
                          ...generatedData,
                          picoData: { ...generatedData.picoData, population: e.target.value }
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-base">I - Intervención/Fenómeno</Label>
                      <Input
                        value={generatedData.picoData.intervention}
                        onChange={(e) => setGeneratedData({
                          ...generatedData,
                          picoData: { ...generatedData.picoData, intervention: e.target.value }
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-base">C - Comparación</Label>
                      <Input
                        value={generatedData.picoData.comparison}
                        onChange={(e) => setGeneratedData({
                          ...generatedData,
                          picoData: { ...generatedData.picoData, comparison: e.target.value }
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-base">O - Resultados/Outcomes</Label>
                      <Input
                        value={generatedData.picoData.outcomes}
                        onChange={(e) => setGeneratedData({
                          ...generatedData,
                          picoData: { ...generatedData.picoData, outcomes: e.target.value }
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 3: Título Propuesto */}
          {currentStep === 'title' && (
            <div className="space-y-6 py-6">
              <div>
                <h3 className="text-2xl font-semibold mb-3">Título Propuesto según Cochrane Review</h3>
                <p className="text-base text-muted-foreground mb-6">
                  Revisa y edita el título generado. Debe ser conciso y reflejar las intervenciones y el problema.
                </p>
              </div>

              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Título Generado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={generatedData.proposedTitle}
                    onChange={(e) => setGeneratedData({ ...generatedData, proposedTitle: e.target.value })}
                    rows={3}
                    className="text-lg font-medium"
                  />
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Conformidad con Cochrane
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={generatedData.cochraneCompliance}
                    onChange={(e) => setGeneratedData({ ...generatedData, cochraneCompliance: e.target.value })}
                    rows={4}
                    className="text-sm"
                    placeholder="Análisis de conformidad con elementos de la matriz según Cochrane..."
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 4: Términos Clave */}
          {currentStep === 'terms' && (
            <div className="space-y-6 py-6">
              <div>
                <h3 className="text-2xl font-semibold mb-3">Definición de Términos Clave</h3>
                <p className="text-base text-muted-foreground mb-6">
                  Términos organizados por categorías para facilitar la búsqueda bibliográfica
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">🧩 Tecnología / Herramientas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generatedData.keyTerms.technology.join(', ')}
                      onChange={(e) => setGeneratedData({
                        ...generatedData,
                        keyTerms: { 
                          ...generatedData.keyTerms, 
                          technology: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        }
                      })}
                      rows={3}
                      placeholder="Ej: Mongoose, MongoDB, Node.js"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">🧪 Dominio de Aplicación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generatedData.keyTerms.domain.join(', ')}
                      onChange={(e) => setGeneratedData({
                        ...generatedData,
                        keyTerms: { 
                          ...generatedData.keyTerms, 
                          domain: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        }
                      })}
                      rows={3}
                      placeholder="Ej: Web Applications, Backend Development"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">📚 Tipo de Estudio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generatedData.keyTerms.studyType.join(', ')}
                      onChange={(e) => setGeneratedData({
                        ...generatedData,
                        keyTerms: { 
                          ...generatedData.keyTerms, 
                          studyType: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        }
                      })}
                      rows={3}
                      placeholder="Ej: Systematic Literature Review, Scoping Review"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">🔍 Focos Temáticos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generatedData.keyTerms.thematicFocus.join(', ')}
                      onChange={(e) => setGeneratedData({
                        ...generatedData,
                        keyTerms: { 
                          ...generatedData.keyTerms, 
                          thematicFocus: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        }
                      })}
                      rows={3}
                      placeholder="Ej: Performance, Design Patterns, Best Practices"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* STEP 5: Estrategia de Búsqueda */}
          {currentStep === 'strategy' && (
            <div className="space-y-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Estrategia de Búsqueda por Base de Datos</h3>
                  <p className="text-base text-muted-foreground mb-6">
                    Cadenas de búsqueda específicas con sintaxis correcta para cada base de datos
                  </p>
                </div>
                {searchStrategies.length === 0 && (
                  <Button onClick={handleGenerateStrategies} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar Estrategias
                      </>
                    )}
                  </Button>
                )}
              </div>

              {searchStrategies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resultados de Búsquedas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Base de Datos</TableHead>
                          <TableHead className="w-[100px]">Resultados</TableHead>
                          <TableHead className="w-[120px]">Rango</TableHead>
                          <TableHead>Cadena de Búsqueda</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchStrategies.map((strategy, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{strategy.database}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={strategy.results}
                                onChange={(e) => {
                                  const newStrategies = [...searchStrategies]
                                  newStrategies[index].results = parseInt(e.target.value) || 0
                                  setSearchStrategies(newStrategies)
                                }}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>{strategy.dateRange}</TableCell>
                            <TableCell>
                              <Textarea
                                value={strategy.searchString}
                                onChange={(e) => {
                                  const newStrategies = [...searchStrategies]
                                  newStrategies[index].searchString = e.target.value
                                  setSearchStrategies(newStrategies)
                                }}
                                rows={2}
                                className="text-sm font-mono"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* STEP 6: Verificación PRISMA */}
          {currentStep === 'prisma' && (
            <div className="space-y-6 py-6">
              <div>
                <h3 className="text-2xl font-semibold mb-3">Verificación de Cumplimiento — PRISMA / WPOM</h3>
                <p className="text-base text-muted-foreground mb-6">
                  Checklist de 13 ítems para validar la calidad del protocolo
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ítem PRISMA / WPOM</TableHead>
                        <TableHead className="w-[100px]">¿Cumple?</TableHead>
                        <TableHead>Evidencia de Cumplimiento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prismaItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.item}</TableCell>
                          <TableCell>
                            <select
                              value={item.complies ? 'yes' : 'no'}
                              onChange={(e) => {
                                const newItems = [...prismaItems]
                                newItems[index].complies = e.target.value === 'yes'
                                setPrismaItems(newItems)
                              }}
                              className="w-full px-2 py-1 border rounded"
                            >
                              <option value="yes">✅ Sí</option>
                              <option value="no">❌ No</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <Textarea
                              value={item.evidence}
                              onChange={(e) => {
                                const newItems = [...prismaItems]
                                newItems[index].evidence = e.target.value
                                setPrismaItems(newItems)
                              }}
                              rows={2}
                              className="text-sm"
                              placeholder="Describe cómo se cumple este ítem..."
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 7: Criterios de Inclusión/Exclusión */}
          {currentStep === 'criteria' && (
            <div className="space-y-6 py-6">
              <div>
                <h3 className="text-2xl font-semibold mb-3">Criterios de Inclusión y Exclusión</h3>
                <p className="text-base text-muted-foreground mb-6">
                  Define criterios claros para filtrar estudios primarios
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Categoría</TableHead>
                        <TableHead>Criterios de Inclusión</TableHead>
                        <TableHead>Criterios de Exclusión</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inclusionCriteria.map((criteria, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{criteria.category}</TableCell>
                          <TableCell>
                            <Textarea
                              value={criteria.inclusion}
                              onChange={(e) => {
                                const newCriteria = [...inclusionCriteria]
                                newCriteria[index].inclusion = e.target.value
                                setInclusionCriteria(newCriteria)
                              }}
                              rows={3}
                              className="text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Textarea
                              value={criteria.exclusion}
                              onChange={(e) => {
                                const newCriteria = [...inclusionCriteria]
                                newCriteria[index].exclusion = e.target.value
                                setInclusionCriteria(newCriteria)
                              }}
                              rows={3}
                              className="text-sm"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 8: Preview Final */}
          {currentStep === 'preview' && (
            <div className="space-y-6 py-6">
              <div>
                <h3 className="text-2xl font-semibold mb-3">Revisión Final del Protocolo</h3>
                <p className="text-base text-muted-foreground mb-6">
                  Verifica todos los datos antes de crear tu proyecto
                </p>
              </div>

              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Título del Proyecto</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">{generatedData.proposedTitle}</p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Marco PICO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>P:</strong> {generatedData.picoData.population}</div>
                    <div><strong>I:</strong> {generatedData.picoData.intervention}</div>
                    <div><strong>C:</strong> {generatedData.picoData.comparison || 'N/A'}</div>
                    <div><strong>O:</strong> {generatedData.picoData.outcomes}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Estadísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Bases de datos:</strong> {searchStrategies.length}</div>
                    <div><strong>Criterios PRISMA:</strong> {prismaItems.filter(i => i.complies).length}/{prismaItems.length}</div>
                    <div><strong>Categorías de criterios:</strong> {inclusionCriteria.length}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  🎯 Al crear el proyecto:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                  <li>Se guardará todo el protocolo generado</li>
                  <li>Podrás continuar con la búsqueda y cribado de referencias</li>
                  <li>Todas las estrategias quedarán documentadas</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <Separator />
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isSaving}
            size="lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>

          {currentStep === 'preview' ? (
            <Button
              onClick={handleCreateProject}
              disabled={isSaving}
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando Proyecto...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Crear Proyecto
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} size="lg">
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
