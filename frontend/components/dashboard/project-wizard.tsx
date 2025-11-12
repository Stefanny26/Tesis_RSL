"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Circle, Sparkles, ArrowRight, ArrowLeft, Loader2, Brain, Zap, FileText, Target, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

type AIProvider = 'chatgpt' | 'gemini'
type Framework = 'pico' | 'matrix' | 'both'

interface MatrixData {
  population: string
  intervention: string
  need: string
  outcomes: string
  provider: string
  studyType: string
  comparison: string
}

interface PICOData {
  population: string
  intervention: string
  comparison: string
  outcomes: string
}

interface TitleSuggestion {
  title: string
  cochraneCompliance: 'full' | 'partial' | 'none'
  reasoning: string
}

interface ProjectWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type WizardStep = 'framework' | 'matrix' | 'pico' | 'titles' | 'preview' | 'confirmation'

export function ProjectWizard({ open, onOpenChange }: ProjectWizardProps) {
  const { toast } = useToast()
  const router = useRouter()
  
  // Estado del wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>('framework')
  const [framework, setFramework] = useState<Framework>('both')
  const [useAI, setUseAI] = useState(true)
  const [aiProvider, setAIProvider] = useState<AIProvider>('gemini')
  
  // Datos de la matriz
  const [matrixData, setMatrixData] = useState<MatrixData>({
    population: '',
    intervention: '',
    need: '',
    outcomes: '',
    provider: '',
    studyType: 'systematic-review',
    comparison: ''
  })
  
  // Datos PICO
  const [picoData, setPicoData] = useState<PICOData>({
    population: '',
    intervention: '',
    comparison: '',
    outcomes: ''
  })
  
  // Títulos generados
  const [titleSuggestions, setTitleSuggestions] = useState<TitleSuggestion[]>([])
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number | null>(null)
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false)
  
  // Estado de guardado
  const [isSaving, setIsSaving] = useState(false)

  const steps: { id: WizardStep; title: string; icon: any }[] = [
    { id: 'framework', title: 'Marco de Trabajo', icon: Target },
    { id: 'matrix', title: 'Matriz Es/No Es', icon: BookOpen },
    { id: 'pico', title: 'Pregunta PICO', icon: FileText },
    { id: 'titles', title: 'Generación de Títulos', icon: Sparkles },
    { id: 'preview', title: 'Vista Previa', icon: CheckCircle2 }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const handleNext = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex < steps.length - 1) {
      // Validaciones por paso
      if (currentStep === 'framework' && !framework) {
        toast({
          title: "Selección requerida",
          description: "Selecciona un marco de trabajo",
          variant: "destructive"
        })
        return
      }
      
      if (currentStep === 'matrix' && framework !== 'pico') {
        if (!matrixData.population || !matrixData.intervention || !matrixData.need || !matrixData.outcomes) {
          toast({
            title: "Campos incompletos",
            description: "Completa al menos los campos obligatorios de la matriz",
            variant: "destructive"
          })
          return
        }
      }
      
      if (currentStep === 'pico' && framework !== 'matrix') {
        if (!picoData.population || !picoData.intervention || !picoData.outcomes) {
          toast({
            title: "Campos incompletos",
            description: "Completa al menos P, I y O del marco PICO",
            variant: "destructive"
          })
          return
        }
      }
      
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  const handleBack = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id)
    }
  }

  const handleGenerateTitles = async () => {
    setIsGeneratingTitles(true)
    try {
      toast({
        title: "Generando títulos...",
        description: `Usando ${aiProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} para crear 5 opciones`
      })
      
      // Llamar al endpoint real de generación de títulos
      const result = await apiClient.generateTitles(matrixData, picoData, aiProvider)
      
      if (result.titles && result.titles.length > 0) {
        setTitleSuggestions(result.titles)
        toast({
          title: "✅ Títulos generados",
          description: `${result.titles.length} opciones creadas con validación Cochrane`
        })
      } else {
        throw new Error('No se recibieron títulos del servidor')
      }
    } catch (error: any) {
      console.error('Error generando títulos:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar los títulos",
        variant: "destructive"
      })
      
      // Fallback: usar títulos mock si falla la API
      const mockTitles: TitleSuggestion[] = [
        {
          title: `${matrixData.intervention} in ${matrixData.population}: A Systematic Review on ${matrixData.outcomes}`,
          cochraneCompliance: 'full',
          reasoning: 'Incluye intervención, población y resultados claramente definidos'
        },
        {
          title: `Exploring ${matrixData.intervention} for ${matrixData.outcomes} in ${matrixData.population}: A Literature Review`,
          cochraneCompliance: 'full',
          reasoning: 'Formato claro con verbo exploratorio y alcance definido'
        },
        {
          title: `${matrixData.intervention} and Its Impact on ${matrixData.outcomes}: Systematic Review`,
          cochraneCompliance: 'partial',
          reasoning: 'Falta especificar la población explícitamente'
        },
        {
          title: `Development Practices and ${matrixData.outcomes} Using ${matrixData.intervention}: A Scoping Review`,
          cochraneCompliance: 'full',
          reasoning: 'Incluye práctica, resultado y herramienta. Tipo de revisión claro'
        },
        {
          title: `Evaluating ${matrixData.intervention} Strategies in ${matrixData.population}: A Technical Review`,
          cochraneCompliance: 'full',
          reasoning: 'Verbo activo, estrategias claras y contexto definido'
        }
      ]
      
      setTitleSuggestions(mockTitles)
    } finally {
      setIsGeneratingTitles(false)
    }
  }

  const handleCreateProject = async () => {
    if (selectedTitleIndex === null) {
      toast({
        title: "Título no seleccionado",
        description: "Selecciona uno de los títulos sugeridos",
        variant: "destructive"
      })
      return
    }
    
    setIsSaving(true)
    try {
      const selectedTitle = titleSuggestions[selectedTitleIndex].title
      
      const projectData = {
        title: selectedTitle,
        description: `
**Matriz Es/No Es:**
- Población: ${matrixData.population}
- Intervención: ${matrixData.intervention}
- Necesidad: ${matrixData.need}
- Resultados Esperados: ${matrixData.outcomes}
${matrixData.provider ? `- Proveedor: ${matrixData.provider}` : ''}
- Tipo de Estudio: ${matrixData.studyType}
${matrixData.comparison ? `- Comparación: ${matrixData.comparison}` : ''}

**Marco PICO:**
- P (Población): ${picoData.population}
- I (Intervención): ${picoData.intervention}
- C (Comparación): ${picoData.comparison || 'N/A'}
- O (Resultados): ${picoData.outcomes}
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
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Asistente de Creación de Proyecto
          </DialogTitle>
          <DialogDescription>
            Define tu proyecto paso a paso con asistencia de IA
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted rounded-lg">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStepIndex > index
            
            return (
              <div key={step.id} className="flex items-center">
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
                  <span className="text-xs mt-1 text-center max-w-[80px]">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20'}`} />
                )}
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-2">
          {currentStep === 'framework' && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Selecciona el Marco de Trabajo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Elige cómo estructurar tu proyecto de investigación
                </p>
                
                <RadioGroup value={framework} onValueChange={(value) => setFramework(value as Framework)}>
                  <Card className="mb-3 cursor-pointer hover:border-primary transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both" className="cursor-pointer font-medium">
                          Ambos (Recomendado)
                        </Label>
                        <Badge>Completo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Usa tanto la Matriz Es/No Es como el Marco PICO para una definición completa
                    </CardContent>
                  </Card>

                  <Card className="mb-3 cursor-pointer hover:border-primary transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="matrix" id="matrix" />
                        <Label htmlFor="matrix" className="cursor-pointer font-medium">
                          Solo Matriz Es/No Es
                        </Label>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Define el alcance con preguntas guiadas sobre población, intervención y resultados
                    </CardContent>
                  </Card>

                  <Card className="mb-3 cursor-pointer hover:border-primary transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pico" id="pico" />
                        <Label htmlFor="pico" className="cursor-pointer font-medium">
                          Solo Marco PICO
                        </Label>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Estructura tu pregunta de investigación con Población, Intervención, Comparación y Resultados
                    </CardContent>
                  </Card>
                </RadioGroup>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-sm">Asistencia con IA</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useAI"
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="useAI" className="text-sm cursor-pointer">
                      Usar IA para generar sugerencias y validaciones
                    </Label>
                  </div>
                  
                  {useAI && (
                    <div className="flex gap-2">
                      <Button
                        variant={aiProvider === 'gemini' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAIProvider('gemini')}
                        className="flex-1"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Gemini
                      </Button>
                      <Button
                        variant={aiProvider === 'chatgpt' ? 'default' : 'outline'}
                        size="sm"
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
            </div>
          )}

          {currentStep === 'matrix' && (framework === 'matrix' || framework === 'both') && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Construcción de la Matriz "Es / No Es"</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Responde las siguientes preguntas para delimitar tu investigación
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="population">
                    Población o contexto <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    ¿Cuál es la población o contexto que delimita el estudio?
                  </p>
                  <Input
                    id="population"
                    placeholder="Ej: Aplicaciones web Node.js"
                    value={matrixData.population}
                    onChange={(e) => setMatrixData({ ...matrixData, population: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="intervention">
                    Intervención o fenómeno <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    ¿Qué intervención, tecnología o fenómeno analizarás?
                  </p>
                  <Input
                    id="intervention"
                    placeholder="Ej: Mongoose ODM"
                    value={matrixData.intervention}
                    onChange={(e) => setMatrixData({ ...matrixData, intervention: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="need">
                    Necesidad o motivación <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    ¿Qué problema o necesidad impulsa la revisión?
                  </p>
                  <Textarea
                    id="need"
                    placeholder="Ej: Evaluar el rendimiento y patrones de diseño"
                    value={matrixData.need}
                    onChange={(e) => setMatrixData({ ...matrixData, need: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="outcomes">
                    Resultados esperados <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    ¿Qué resultados o impactos deseas identificar?
                  </p>
                  <Textarea
                    id="outcomes"
                    placeholder="Ej: Rendimiento, escalabilidad, facilidad de desarrollo"
                    value={matrixData.outcomes}
                    onChange={(e) => setMatrixData({ ...matrixData, outcomes: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="provider">Proveedor de la intervención</Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    ¿Quién ejecuta o aplica la intervención? (Opcional)
                  </p>
                  <Input
                    id="provider"
                    placeholder="Ej: Desarrolladores de software"
                    value={matrixData.provider}
                    onChange={(e) => setMatrixData({ ...matrixData, provider: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="studyType">Tipo de estudio o metodología <span className="text-red-500">*</span></Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    ¿Qué tipo de revisión realizarás?
                  </p>
                  <select
                    id="studyType"
                    value={matrixData.studyType}
                    onChange={(e) => setMatrixData({ ...matrixData, studyType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="systematic-review">Revisión Sistemática (SLR)</option>
                    <option value="scoping-review">Scoping Review</option>
                    <option value="literature-review">Literature Review</option>
                    <option value="mapping-study">Mapping Study</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="comparison">Grupo de comparación</Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    ¿Existe un grupo de comparación o alternativa? (Opcional)
                  </p>
                  <Input
                    id="comparison"
                    placeholder="Ej: Otros ODMs como Sequelize"
                    value={matrixData.comparison}
                    onChange={(e) => setMatrixData({ ...matrixData, comparison: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'pico' && (framework === 'pico' || framework === 'both') && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Generación de Pregunta PICO</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Formula tu pregunta de investigación con el marco PICO
                </p>
              </div>

              <div className="space-y-4">
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">P - Población</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      Define el grupo, contexto o sujeto de estudio
                    </p>
                    <Input
                      placeholder="Ej: Aplicaciones Node.js que usan bases de datos NoSQL"
                      value={picoData.population}
                      onChange={(e) => setPicoData({ ...picoData, population: e.target.value })}
                    />
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">I - Intervención</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      Indica la acción o fenómeno principal
                    </p>
                    <Input
                      placeholder="Ej: Uso de Mongoose ODM para mapeo objeto-documento"
                      value={picoData.intervention}
                      onChange={(e) => setPicoData({ ...picoData, intervention: e.target.value })}
                    />
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">C - Comparación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      Alternativa o grupo de contraste (Opcional)
                    </p>
                    <Input
                      placeholder="Ej: Otros ODMs (Sequelize, TypeORM) o acceso directo a MongoDB"
                      value={picoData.comparison}
                      onChange={(e) => setPicoData({ ...picoData, comparison: e.target.value })}
                    />
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">O - Outcomes (Resultados)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      Resultados o efectos esperados
                    </p>
                    <Textarea
                      placeholder="Ej: Rendimiento de consultas, facilidad de desarrollo, mantenibilidad del código"
                      value={picoData.outcomes}
                      onChange={(e) => setPicoData({ ...picoData, outcomes: e.target.value })}
                      rows={2}
                    />
                  </CardContent>
                </Card>

                {picoData.population && picoData.intervention && picoData.outcomes && (
                  <Card className="border-primary bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Pregunta PICO Generada
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm italic">
                        "En <strong>{picoData.population}</strong>, ¿cómo <strong>{picoData.intervention}</strong>
                        {picoData.comparison && ` comparado con ${picoData.comparison}`} afecta <strong>{picoData.outcomes}</strong>?"
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {currentStep === 'titles' && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Generación Automática de Títulos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  La IA generará 5 opciones de títulos validados con criterios Cochrane
                </p>
              </div>

              {titleSuggestions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Listo para generar títulos</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                      La IA analizará tu matriz y marco PICO para crear 5 opciones de títulos académicos
                    </p>
                    <Button
                      onClick={handleGenerateTitles}
                      disabled={isGeneratingTitles}
                      size="lg"
                    >
                      {isGeneratingTitles ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generar 5 Títulos con IA
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {titleSuggestions.map((suggestion, index) => (
                    <Card
                      key={index}
                      className={`cursor-pointer transition-all ${
                        selectedTitleIndex === index
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedTitleIndex(index)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {selectedTitleIndex === index ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Opción {index + 1}</Badge>
                              <Badge
                                variant={
                                  suggestion.cochraneCompliance === 'full'
                                    ? 'default'
                                    : suggestion.cochraneCompliance === 'partial'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {suggestion.cochraneCompliance === 'full' && '✅ Cumple Cochrane'}
                                {suggestion.cochraneCompliance === 'partial' && '⚠️ Cumplimiento Parcial'}
                                {suggestion.cochraneCompliance === 'none' && '❌ No cumple'}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm leading-tight mb-2">
                              {suggestion.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {suggestion.reasoning}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={handleGenerateTitles}
                    disabled={isGeneratingTitles}
                    className="w-full"
                  >
                    {isGeneratingTitles ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Regenerar Títulos
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'preview' && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Confirmación Final</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Revisa tu propuesta antes de crear el proyecto
                </p>
              </div>

              <Card className="border-green-200 bg-green-50/30">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Título Seleccionado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {selectedTitleIndex !== null ? titleSuggestions[selectedTitleIndex].title : 'No seleccionado'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Matriz Es / No Es</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Población:</strong> {matrixData.population}</div>
                  <div><strong>Intervención:</strong> {matrixData.intervention}</div>
                  <div><strong>Necesidad:</strong> {matrixData.need}</div>
                  <div><strong>Resultados:</strong> {matrixData.outcomes}</div>
                  {matrixData.provider && <div><strong>Proveedor:</strong> {matrixData.provider}</div>}
                  <div><strong>Tipo de Estudio:</strong> {matrixData.studyType}</div>
                  {matrixData.comparison && <div><strong>Comparación:</strong> {matrixData.comparison}</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Marco PICO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>P:</strong> {picoData.population}</div>
                  <div><strong>I:</strong> {picoData.intervention}</div>
                  <div><strong>C:</strong> {picoData.comparison || 'N/A'}</div>
                  <div><strong>O:</strong> {picoData.outcomes}</div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs font-medium text-blue-900 mb-1">
                  🎯 Próximos pasos después de crear el proyecto:
                </p>
                <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                  <li>Se generará automáticamente el protocolo completo</li>
                  <li>Se crearán estrategias de búsqueda específicas por base de datos</li>
                  <li>Se generarán términos clave y criterios de inclusión/exclusión</li>
                  <li>Podrás refinar cada sección según tus necesidades</li>
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
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>

          {currentStep === 'preview' ? (
            <Button
              onClick={handleCreateProject}
              disabled={isSaving || selectedTitleIndex === null}
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando Proyecto...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Crear Proyecto
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
