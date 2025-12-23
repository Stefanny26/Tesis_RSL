"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Brain, CheckCircle, XCircle, AlertCircle, Clock, DollarSign } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface HybridScreeningStatsProps {
  result: {
    success: boolean
    method: string
    summary: {
      total: number
      processed: number
      included: number
      excluded: number
      reviewManual: number
      durationMs: number
      phase1: {
        method: string
        highConfidenceInclude: number
        highConfidenceExclude: number
        greyZone: number
        avgSimilarity: number
      }
      phase2: {
        method: string
        analyzed: number
      }
    }
  }
}

export function HybridScreeningStats({ result }: HybridScreeningStatsProps) {
  const { summary } = result
  const { phase1, phase2 } = summary

  // Validación de seguridad
  if (!phase1 || !phase2) {
    console.error('Error: phase1 o phase2 undefined en HybridScreeningStats', { phase1, phase2, summary })
    return null
  }

  const includedPercentage = Math.round((summary.included / summary.total) * 100)
  const excludedPercentage = Math.round((summary.excluded / summary.total) * 100)
  const reviewPercentage = Math.round((summary.reviewManual / summary.total) * 100)

  const durationSeconds = (summary.durationMs / 1000).toFixed(1)
  const estimatedCost = ((phase2.analyzed || 0) * 0.0002).toFixed(4) // $0.0002 por referencia con ChatGPT

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Resultados del Cribado Híbrido
        </CardTitle>
        <CardDescription>
          Procesadas {summary.processed} de {summary.total} referencias en {durationSeconds}s
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fase 1: Embeddings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <h4 className="font-semibold text-sm">Fase 1: Embeddings</h4>
            </div>
            <Badge variant="outline" className="border-primary/30">
              🤖 Análisis masivo
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-primary/20 rounded-md p-3">
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-1">
                <CheckCircle className="h-3 w-3" />
                <span className="text-xs font-medium">Alta confianza +</span>
              </div>
              <p className="text-xl font-bold text-foreground">{phase1.highConfidenceInclude}</p>
              <p className="text-xs text-muted-foreground">Similitud &gt;30%</p>
            </div>
            
            <div className="border border-primary/20 rounded-md p-3">
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400 mb-1">
                <XCircle className="h-3 w-3" />
                <span className="text-xs font-medium">Alta confianza -</span>
              </div>
              <p className="text-xl font-bold text-foreground">{phase1.highConfidenceExclude}</p>
              <p className="text-xs text-muted-foreground">Similitud &lt;10%</p>
            </div>
            
            <div className="border border-primary/20 rounded-md p-3">
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 mb-1">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs font-medium">Zona gris</span>
              </div>
              <p className="text-xl font-bold text-foreground">{phase1.greyZone}</p>
              <p className="text-xs text-muted-foreground">10-30%</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Promedio similitud:</span>
            <span className="font-semibold">{(phase1.avgSimilarity * 100).toFixed(1)}%</span>
          </div>
        </div>

        <Separator />

        {/* Fase 2: ChatGPT */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-sm">Fase 2: ChatGPT</h4>
            </div>
            <Badge variant="outline" className="border-primary/30">
              🧠 Análisis experto
            </Badge>
          </div>
          
          <div className="border border-primary/20 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Referencias analizadas</span>
              <span className="text-2xl font-bold text-foreground">{phase2.analyzed}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Solo las referencias de la zona gris fueron enviadas a ChatGPT para análisis profundo con el protocolo PICO
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Tiempo:</span>
              <span className="font-semibold">{durationSeconds}s</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Costo estimado:</span>
              <span className="font-semibold">${estimatedCost}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Resultados Finales */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Resultados Finales</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>Incluidas</span>
              </div>
              <span className="font-bold text-green-600 dark:text-green-400">{summary.included} ({includedPercentage}%)</span>
            </div>
            <Progress value={includedPercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span>Excluidas</span>
              </div>
              <span className="font-bold text-red-600 dark:text-red-400">{summary.excluded} ({excludedPercentage}%)</span>
            </div>
            <Progress value={excludedPercentage} className="h-2" />
          </div>

          {summary.reviewManual > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Revisión manual</span>
                </div>
                <span className="font-bold text-amber-600 dark:text-amber-400">{summary.reviewManual} ({reviewPercentage}%)</span>
              </div>
              <Progress value={reviewPercentage} className="h-2" />
            </div>
          )}
        </div>

        <div className="bg-muted p-3 rounded-md">
          <p className="text-xs text-muted-foreground text-center">
            💡 <strong>Próximo paso:</strong> Revisa las {summary.total} referencias para confirmar las decisiones de la IA o hacer ajustes manuales.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
