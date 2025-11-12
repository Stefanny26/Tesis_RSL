"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Loader2, Plus, X, Info, Brain, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

export function PicoMatrixStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedAI, setSelectedAI] = useState<'chatgpt' | 'gemini'>(data.aiProvider)

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
        description: `Usando ${selectedAI === 'chatgpt' ? 'ChatGPT' : 'Gemini'}. Esto puede tomar 20-30 segundos...`
      })

      const result = await apiClient.generateProtocolAnalysis(
        data.projectName,
        data.projectDescription,
        selectedAI
      )

      // Extraer PICO
      const pico = result.fase1_marco_pico?.marco_pico || {}
      
      // Extraer Matriz Es/No Es
      const matriz = result.fase2_matriz_es_no_es || {}

      updateData({
        pico: {
          population: pico.population?.descripcion || "",
          intervention: pico.intervention?.descripcion || "",
          comparison: pico.comparison?.descripcion || "",
          outcome: pico.outcomes?.descripcion || ""
        },
        matrixIsNot: {
          is: matriz.es || [],
          isNot: matriz.no_es || []
        },
        aiProvider: selectedAI
      })

      toast({
        title: "✅ Generado exitosamente",
        description: "Revisa y edita los resultados según necesites"
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

  const addMatrixItem = (type: 'is' | 'isNot') => {
    const current = data.matrixIsNot[type]
    updateData({
      matrixIsNot: {
        ...data.matrixIsNot,
        [type]: [...current, ""]
      }
    })
  }

  const removeMatrixItem = (type: 'is' | 'isNot', index: number) => {
    const current = data.matrixIsNot[type]
    updateData({
      matrixIsNot: {
        ...data.matrixIsNot,
        [type]: current.filter((_, i) => i !== index)
      }
    })
  }

  const updateMatrixItem = (type: 'is' | 'isNot', index: number, value: string) => {
    const current = [...data.matrixIsNot[type]]
    current[index] = value
    updateData({
      matrixIsNot: {
        ...data.matrixIsNot,
        [type]: current
      }
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">PICO + Matriz Es/No Es</h2>
        <p className="text-lg text-muted-foreground">
          Estructura tu pregunta y delimita el alcance de tu investigación
        </p>
      </div>

      {/* AI Generation Panel */}
      <Card className="border-primary/30 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Generar automáticamente con IA</CardTitle>
          </div>
          <CardDescription>
            La IA analizará tu propuesta y generará el marco PICO y la matriz Es/No Es
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={selectedAI === 'gemini' ? 'default' : 'outline'}
              onClick={() => setSelectedAI('gemini')}
              disabled={isGenerating}
              size="lg"
            >
              <Zap className="h-5 w-5 mr-2" />
              Gemini
              <Badge variant="secondary" className="ml-2">Recomendado</Badge>
            </Button>
            <Button
              variant={selectedAI === 'chatgpt' ? 'default' : 'outline'}
              onClick={() => setSelectedAI('chatgpt')}
              disabled={isGenerating}
              size="lg"
            >
              <Brain className="h-5 w-5 mr-2" />
              ChatGPT
            </Button>
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

      <Tabs defaultValue="pico" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pico">Marco PICO</TabsTrigger>
          <TabsTrigger value="matrix">Matriz Es/No Es</TabsTrigger>
        </TabsList>

        {/* PICO Tab */}
        <TabsContent value="pico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Framework PICO</CardTitle>
              <CardDescription>
                Estructura tu pregunta usando: Población, Intervención, Comparación, Resultado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="population">
                  P - Población / Contexto <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="population"
                  placeholder="¿Quiénes son los sujetos o cuál es el contexto? Ej: Aplicaciones Node.js con bases de datos NoSQL"
                  value={data.pico.population}
                  onChange={(e) => updateData({
                    pico: { ...data.pico, population: e.target.value }
                  })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intervention">
                  I - Intervención / Tecnología <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="intervention"
                  placeholder="¿Qué se está evaluando? Ej: Uso de Mongoose ODM como capa de abstracción"
                  value={data.pico.intervention}
                  onChange={(e) => updateData({
                    pico: { ...data.pico, intervention: e.target.value }
                  })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparison">C - Comparación (Opcional)</Label>
                <Textarea
                  id="comparison"
                  placeholder="¿Con qué se compara? Ej: Otros ODMs o acceso directo al driver de MongoDB"
                  value={data.pico.comparison}
                  onChange={(e) => updateData({
                    pico: { ...data.pico, comparison: e.target.value }
                  })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome">
                  O - Resultado / Outcome <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="outcome"
                  placeholder="¿Qué resultados esperas medir? Ej: Rendimiento, patrones de diseño, mantenibilidad"
                  value={data.pico.outcome}
                  onChange={(e) => updateData({
                    pico: { ...data.pico, outcome: e.target.value }
                  })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matriz Tab */}
        <TabsContent value="matrix" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* ES (Incluye) */}
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-900">✅ ES (Incluye)</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addMatrixItem('is')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                <CardDescription>Qué SÍ incluye tu investigación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.matrixIsNot.is.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-4">
                    Sin elementos. Usa IA o agrega manualmente.
                  </p>
                )}
                {data.matrixIsNot.is.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      placeholder="Ej: Estudios empíricos con datos reales"
                      value={item}
                      onChange={(e) => updateMatrixItem('is', index, e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeMatrixItem('is', index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* NO ES (Excluye) */}
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-900">❌ NO ES (Excluye)</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addMatrixItem('isNot')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                <CardDescription>Qué NO incluye tu investigación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.matrixIsNot.isNot.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-4">
                    Sin elementos. Usa IA o agrega manualmente.
                  </p>
                )}
                {data.matrixIsNot.isNot.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      placeholder="Ej: Estudios teóricos sin validación"
                      value={item}
                      onChange={(e) => updateMatrixItem('isNot', index, e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeMatrixItem('isNot', index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
