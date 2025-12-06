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
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              🤖 Análisis masivo
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center gap-1 text-green-700 mb-1">
                <CheckCircle className="h-3 w-3" />
                <span className="text-xs font-medium">Alta confianza +</span>
              </div>
              <p className="text-xl font-bold text-green-900">{phase1.highConfidenceInclude}</p>
              <p className="text-xs text-green-600">Similitud &gt;30%</p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center gap-1 text-red-700 mb-1">
                <XCircle className="h-3 w-3" />
                <span className="text-xs font-medium">Alta confianza -</span>
              </div>
              <p className="text-xl font-bold text-red-900">{phase1.highConfidenceExclude}</p>
              <p className="text-xs text-red-600">Similitud &lt;10%</p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <div className="flex items-center gap-1 text-amber-700 mb-1">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs font-medium">Zona gris</span>
              </div>
              <p className="text-xl font-bold text-amber-900">{phase1.greyZone}</p>
              <p className="text-xs text-amber-600">10-30%</p>
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
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              🧠 Análisis experto
            </Badge>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Referencias analizadas</span>
              <span className="text-2xl font-bold text-blue-900">{phase2.analyzed}</span>
            </div>
            <p className="text-xs text-blue-600">
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
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Incluidas</span>
              </div>
              <span className="font-bold text-green-600">{summary.included} ({includedPercentage}%)</span>
            </div>
            <Progress value={includedPercentage} className="h-2 bg-green-100 [&>div]:bg-green-600" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Excluidas</span>
              </div>
              <span className="font-bold text-red-600">{summary.excluded} ({excludedPercentage}%)</span>
            </div>
            <Progress value={excludedPercentage} className="h-2 bg-red-100 [&>div]:bg-red-600" />
          </div>

          {summary.reviewManual > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Revisión manual</span>
                </div>
                <span className="font-bold text-amber-600">{summary.reviewManual} ({reviewPercentage}%)</span>
              </div>
              <Progress value={reviewPercentage} className="h-2 bg-amber-100 [&>div]:bg-amber-600" />
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
