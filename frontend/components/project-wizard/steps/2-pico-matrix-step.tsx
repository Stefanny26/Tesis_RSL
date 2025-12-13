"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Loader2, Info, Brain, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

// Helper function para obtener icono y label del componente PICO
const getPicoComponent = (pregunta: string) => {
  if (pregunta.includes('Población')) return { icon: '👥', label: 'Población' }
  if (pregunta.includes('Intervención')) return { icon: '🔧', label: 'Intervención' }
  if (pregunta.includes('Comparación')) return { icon: '⚖️', label: 'Comparador' }
  if (pregunta.includes('Resultado') || pregunta.includes('Outcome')) return { icon: '🎯', label: 'Outcomes' }
  return { icon: '❓', label: pregunta }
}

// Helper function para obtener nombre del proveedor de IA
const getProviderName = (provider: 'chatgpt' | 'gemini') => {
  const names = {
    chatgpt: 'ChatGPT',
    gemini: 'Gemini'
  }
  return names[provider]
}

export function PicoMatrixStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedAI, setSelectedAI] = useState<'chatgpt' | 'gemini'>(data.aiProvider || 'chatgpt')

  const handleGenerateWithAI = async () => {
    if (!data.projectName || !data.projectDescription) {
      toast({
        title: "Información incompleta",
        description: "Necesitas completar el Paso 1 primero",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      toast({
        title: "Generando análisis...",
        description: `Usando ${getProviderName(selectedAI)}. Esto puede tomar 20-30 segundos...`
      })

      // Obtener área legible desde el valor del select
      const areaMap: Record<string, string> = {
        'ingenieria-tecnologia': 'Ingeniería y Tecnología',
        'medicina-salud': 'Medicina y Ciencias de la Salud',
        'ciencias-sociales': 'Ciencias Sociales y Humanidades',
        'arquitectura-diseño': 'Arquitectura, Diseño y Urbanismo'
      }
      const areaTexto = data.researchArea ? areaMap[data.researchArea] : undefined

      console.log('📤 DEBUG - Enviando al backend:')
      console.log('   - Nombre:', data.projectName)
      console.log('   - Área:', areaTexto, '(valor original:', data.researchArea, ')')
      console.log('   - Año inicio:', data.yearStart, '(tipo:', typeof data.yearStart, ')')
      console.log('   - Año fin:', data.yearEnd, '(tipo:', typeof data.yearEnd, ')')

      const result = await apiClient.generateProtocolAnalysis(
        data.projectName,
        data.projectDescription,
        selectedAI,
        areaTexto,
        data.yearStart,
        data.yearEnd
      )

      // Extraer PICO
      const pico = result.fase1_marco_pico?.marco_pico || {}
      
      // Extraer Matriz Es/No Es y crear tabla unificada
      const matrizData = result.fase2_matriz_es_no_es || {}
      
      // Crear tabla unificada con componentes PICO + Justificación Es/No Es
      const tablaUnificada = [
        {
          pregunta: "Población / Contexto",
          contenido: pico.population?.descripcion || "",
          presente: "si",
          justificacion: `ES: ${pico.population?.justificacion || 'El tema define claramente el contexto de aplicación'}`
        },
        {
          pregunta: "Intervención / Tecnología",
          contenido: pico.intervention?.descripcion || "",
          presente: "si",
          justificacion: `ES: ${pico.intervention?.justificacion || 'La tecnología o fenómeno de interés está especificado'}`
        },
        {
          pregunta: "Comparación",
          contenido: pico.comparison?.descripcion || "No especificado",
          presente: pico.comparison?.descripcion ? "si" : "parcial",
          justificacion: pico.comparison?.descripcion 
            ? `ES: ${pico.comparison?.justificacion || 'Se definen comparadores explícitos'}`
            : "NO ES explícito: El tema no menciona comparadores directos, aunque se pueden inferir alternativas"
        },
        {
          pregunta: "Outcomes / Resultados",
          contenido: pico.outcomes?.descripcion || "",
          presente: "si",
          justificacion: `ES: ${pico.outcomes?.justificacion || 'Los resultados esperados están claramente definidos'}`
        }
      ]

      console.log('🔍 DEBUG - Tabla unificada generada:', tablaUnificada);

      updateData({
        pico: {
          population: pico.population?.descripcion || "",
          intervention: pico.intervention?.descripcion || "",
          comparison: pico.comparison?.descripcion || "",
          outcome: pico.outcomes?.descripcion || ""
        },
        matrixTable: tablaUnificada, // Tabla unificada PICO + Es/No Es
        matrixIsNot: {
          is: matrizData.es || [],
          isNot: matrizData.no_es || []
        },
        aiProvider: selectedAI
      })

      console.log('✅ DEBUG - Datos actualizados en wizard con tabla unificada');

      toast({
        title: "✅ Generado exitosamente",
        description: "Tabla unificada PICO + Es/No Es creada. Revisa los resultados."
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el análisis",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">PICO + Matriz Es/No Es</h2>
        <p className="text-lg text-muted-foreground">
          Estructura tu pregunta y delimita el alcance de tu investigación
        </p>
      </div>

      {/* Texto Introductorio */}
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
          <p className="font-semibold mb-2">📊 Análisis Preliminar Integrado</p>
          <p>
            En esta sección se genera el <strong>análisis preliminar del tema</strong> mediante la integración del{' '}
            <strong>Marco PICO</strong> y la <strong>Matriz Es/No Es</strong>, con el objetivo de clarificar la población,
            intervención, comparadores y resultados esperados, así como validar qué elementos están presentes o ausentes 
            en la pregunta de investigación.
          </p>
          <p className="mt-2">
            Una vez que hagas clic en "Generar", se creará automáticamente la <strong>tabla unificada</strong> con 
            población, contenido generado por IA y la justificación Es/No Es.
          </p>
        </AlertDescription>
      </Alert>

      {/* AI Generation Panel */}
      <Card className="border-primary/30 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="dark:text-blue-100">Generar automáticamente con IA</CardTitle>
          </div>
          <CardDescription className="dark:text-blue-200">
            La IA analizará tu propuesta y generará la tabla unificada PICO + Es/No Es
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Selecciona el modelo de IA:</Label>
            <RadioGroup
              value={selectedAI}
              onValueChange={(value) => setSelectedAI(value as 'chatgpt' | 'gemini')}
              className="flex flex-col space-y-3"
              disabled={isGenerating}
            >
              <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 cursor-pointer">
                <RadioGroupItem value="chatgpt" id="chatgpt" />
                <Label 
                  htmlFor="chatgpt" 
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Brain className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium">ChatGPT (GPT-4o-mini)</span>
                  <span className="ml-auto px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                    Por defecto
                  </span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border border-blue-200 dark:border-blue-800 p-4 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer">
                <RadioGroupItem value="gemini" id="gemini" />
                <Label 
                  htmlFor="gemini" 
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">Gemini (gemini-2.0-flash-exp)</span>
                  <span className="ml-auto px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
                    Rápido
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generando análisis completo...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generar PICO + Matriz
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Tabla Unificada PICO + Es/No Es - Solo visible después de generar */}
      {data.matrixTable && data.matrixTable.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tabla Unificada: Marco PICO + Matriz Es/No Es</CardTitle>
            <CardDescription>
              Análisis integrado de la población, intervención, comparadores y resultados esperados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                      <th className="text-left p-4 font-semibold text-blue-900 dark:text-blue-100 w-1/4">
                        Componente PICO
                      </th>
                      <th className="text-left p-4 font-semibold text-blue-900 dark:text-blue-100 w-1/3">
                        Contenido Generado por IA
                      </th>
                      <th className="text-left p-4 font-semibold text-blue-900 dark:text-blue-100 w-5/12">
                        Justificación (Es / No Es)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.matrixTable.map((elemento, index) => {
                      const { icon, label } = getPicoComponent(elemento.pregunta)
                      return (
                        <tr key={`pico-${label}-${index}`} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4 align-top">
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-primary text-lg">
                                {icon}
                              </span>
                              <div>
                                <span className="font-bold text-sm">
                                  {label}
                                </span>
                              </div>
                            </div>
                          </td>
                        <td className="p-4 align-top">
                          <p className="text-sm leading-relaxed">
                            {elemento.contenido || data.pico.population}
                          </p>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex items-start gap-2">
                            {elemento.presente === 'si' && (
                              <span className="text-green-600 dark:text-green-400 font-bold flex-shrink-0 mt-0.5">
                                ✅ ES:
                              </span>
                            )}
                            {elemento.presente === 'no' && (
                              <span className="text-red-600 dark:text-red-400 font-bold flex-shrink-0 mt-0.5">
                                ❌ NO ES:
                              </span>
                            )}
                            {elemento.presente === 'parcial' && (
                              <span className="text-amber-600 dark:text-amber-400 font-bold flex-shrink-0 mt-0.5">
                                ⚠️ PARCIAL:
                              </span>
                            )}
                            <span className="text-sm text-muted-foreground leading-relaxed">
                              {elemento.justificacion}
                            </span>
                          </div>
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <Alert className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
                  <p className="font-semibold mb-1">⭐ Nota Metodológica:</p>
                  <p>
                    El marco PICO se realizó integrando la matriz Es/No Es con otros marcos metodológicos, 
                    no solo PICO, para mejorar y validar el planteamiento de la pregunta de investigación según 
                    las guías <strong>PRISMA 2020</strong> y <strong>Cochrane</strong>.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

