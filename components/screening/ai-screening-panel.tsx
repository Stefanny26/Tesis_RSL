"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Brain, CheckCircle, Info } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface AIScreeningPanelProps {
  totalReferences: number
  pendingReferences: number
  onRunScreening: (threshold: number) => void
}

export function AIScreeningPanel({ totalReferences, pendingReferences, onRunScreening }: AIScreeningPanelProps) {
  const [threshold, setThreshold] = useState([0.7])
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleRunScreening = async () => {
    setIsRunning(true)
    setProgress(0)

    // Simulate AI screening process
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          onRunScreening(threshold[0])
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
          Utiliza embeddings semánticos para clasificar referencias automáticamente según tu protocolo PICO
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            El sistema usa el modelo MiniLM para generar embeddings y calcular similitud semántica entre las referencias
            y tu protocolo.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Umbral de Inclusión</Label>
              <span className="text-sm font-medium">{(threshold[0] * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={threshold}
              onValueChange={setThreshold}
              min={0.5}
              max={0.95}
              step={0.05}
              disabled={isRunning}
            />
            <p className="text-xs text-muted-foreground">
              Referencias con score superior a este umbral serán marcadas como candidatas a inclusión
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

          <Button onClick={handleRunScreening} disabled={isRunning || pendingReferences === 0} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {isRunning ? "Procesando..." : "Ejecutar Cribado Automático"}
          </Button>

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
