"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Brain, CheckCircle, Info, BarChart3, Zap } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AIScreeningPanelProps {
  totalReferences: number
  pendingReferences: number
  onRunScreening: (threshold: number, method: 'embeddings' | 'llm', provider?: 'chatgpt' | 'gemini') => void
}

export function AIScreeningPanel({ totalReferences, pendingReferences, onRunScreening }: AIScreeningPanelProps) {
  // UMBRAL AJUSTADO: 0.15 (15%) para compensar diferencia de idioma inglés/español
  // Con mismo idioma se recomienda 0.7 (70%)
  const [threshold, setThreshold] = useState([0.15])
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [method, setMethod] = useState<'embeddings' | 'llm'>('embeddings')
  const [llmProvider, setLlmProvider] = useState<'chatgpt' | 'gemini'>('gemini')

  const handleRunScreening = async () => {
    setIsRunning(true)
    setProgress(0)

    // Call screening immediately
    onRunScreening(threshold[0], method, method === 'llm' ? llmProvider : undefined)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Cribado Automático con IA
        </CardTitle>
        <CardDescription>
          Utiliza embeddings semánticos o análisis con LLM para clasificar referencias automáticamente según tu protocolo PICO
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={method} onValueChange={(v) => setMethod(v as 'embeddings' | 'llm')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="embeddings" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Embeddings
            </TabsTrigger>
            <TabsTrigger value="llm" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              LLM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="embeddings" className="space-y-4 mt-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Método: Embeddings Semánticos</strong>
                <br />
                Usa el modelo <code className="text-xs bg-muted px-1 py-0.5 rounded">all-MiniLM-L6-v2</code> (384 tokens) para generar vectores semánticos.
                Calcula similitud de coseno entre referencias y tu protocolo PICO.
                <br />
                <span className="text-muted-foreground text-xs">
                  ⚡ Rápido (~3 min por 1000 refs) | 💰 Sin costo de API | 📊 Resultados consistentes
                </span>
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="llm" className="space-y-4 mt-4">
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>⚠️ Cuotas de API Agotadas</strong>
                <br />
                Las cuotas gratuitas de Gemini y ChatGPT se han agotado temporalmente.
                <br />
                <span className="text-xs">
                  Por favor usa el método de <strong>Embeddings</strong> que no requiere API externa.
                </span>
              </AlertDescription>
            </Alert>

            <div className="space-y-3 opacity-50 pointer-events-none">
              <div className="space-y-2">
                <Label>Proveedor de LLM</Label>
                <Select value={llmProvider} onValueChange={(v) => setLlmProvider(v as 'chatgpt' | 'gemini')} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span>Gemini 2.0 Flash (Cuota agotada)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="chatgpt">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-green-500" />
                        <span>ChatGPT (Cuota agotada)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Método: Análisis con LLM ({llmProvider === 'gemini' ? 'Gemini' : 'ChatGPT'})</strong>
                  <br />
                  {llmProvider === 'gemini' ? (
                    <>
                      Usa <strong>Gemini 2.0 Flash</strong> de Google para analizar cada referencia con razonamiento contextual.
                      Genera explicaciones detalladas de inclusión/exclusión.
                    </>
                  ) : (
                    <>
                      Usa <strong>GPT-4o-mini</strong> de OpenAI para analizar cada referencia con razonamiento contextual.
                      Genera explicaciones detalladas de inclusión/exclusión.
                    </>
                  )}
                  <br />
                  <span className="text-muted-foreground text-xs">
                    🧠 Más preciso | 💭 Con explicación | ⏱️ 2 seg/ref | 💰 Consume API
                  </span>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Umbral de Inclusión</Label>
              <span className="text-sm font-medium">{(threshold[0] * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={threshold}
              onValueChange={setThreshold}
              min={0.05}
              max={0.5}
              step={0.05}
              disabled={isRunning}
            />
            <p className="text-xs text-muted-foreground">
              ⚠️ <strong>Protocolo en español vs artículos en inglés:</strong> Se recomienda umbral bajo (10-20%). Con mismo idioma usar 70%+
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-muted-foreground">Total Referencias</p>
              <p className="text-2xl font-bold">{totalReferences}</p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold">{pendingReferences}</p>
            </div>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Procesando referencias...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <Button 
            onClick={handleRunScreening} 
            disabled={isRunning || pendingReferences === 0 || method === 'llm'} 
            className="w-full"
          >
            {method === 'embeddings' ? <BarChart3 className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isRunning ? "Procesando..." : method === 'llm' ? "⚠️ Cuota de API Agotada" : `Ejecutar Cribado con Embeddings`}
          </Button>

          {method === 'llm' && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <Info className="h-4 w-4" />
              <span>Por favor selecciona el método de Embeddings para continuar</span>
            </div>
          )}

          {pendingReferences === 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Todas las referencias han sido procesadas</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
