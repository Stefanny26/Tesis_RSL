"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowRight, Loader2 } from "lucide-react"

interface PriorityDistributionAnalysisProps {
  readonly references: ReadonlyArray<{
    readonly id: string
    readonly title: string
    readonly similarity_score?: number | null
    readonly screeningScore?: number | null
    readonly ai_classification?: string
  }>
  readonly onSelectForFullText?: (referenceIds: string[], count: number, phase: string) => Promise<void>
  readonly disabled?: boolean
}

export function PriorityDistributionAnalysis({ references, onSelectForFullText, disabled = false }: Readonly<PriorityDistributionAnalysisProps>) {
  const [loadingPhase, setLoadingPhase] = useState<string | null>(null)

  const analysis = useMemo(() => {
    // Filtrar referencias con puntaje válido (buscar en similarity_score o screeningScore)
    const scoredRefs = references
      .filter(ref => {
        const score = ref.similarity_score ?? ref.screeningScore
        return score != null && !Number.isNaN(score) && score > 0
      })
      .map(ref => ({
        ...ref,
        score: (ref.similarity_score ?? ref.screeningScore)!
      }))
      .sort((a, b) => b.score - a.score) // Ordenar de mayor a menor

    if (scoredRefs.length === 0) {
      return null
    }

    // Calcular estadísticas
    const scores = scoredRefs.map(r => r.score)
    const max = Math.max(...scores)
    const min = Math.min(...scores)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    
    // Calcular percentiles
    const percentile = (p: number) => {
      const index = Math.ceil((p / 100) * scores.length) - 1
      return scores[index]
    }

    const p90 = percentile(10)  // Top 10%
    const p75 = percentile(25)  // Top 25%
    const p50 = percentile(50)  // Mediana
    const p25 = percentile(75)  // Bottom 25%

    // Calcular índices para percentiles
    const top10Index = Math.ceil(scoredRefs.length * 0.1)
    const top25Index = Math.ceil(scoredRefs.length * 0.25)
    const top50Index = Math.ceil(scoredRefs.length * 0.5)

    // Detectar "codo" (punto de inflexión)
    // Calculamos la segunda derivada para encontrar el cambio de curvatura
    const findElbow = () => {
      if (scoredRefs.length < 10) return top25Index

      const derivatives: number[] = []
      for (let i = 1; i < scoredRefs.length - 1; i++) {
        const d2 = scoredRefs[i - 1].score - 2 * scoredRefs[i].score + scoredRefs[i + 1].score
        derivatives.push(Math.abs(d2))
      }

      // Encontrar el máximo (mayor cambio de curvatura)
      const maxDerivativeIndex = derivatives.indexOf(Math.max(...derivatives)) + 1
      
      // Si el codo está en los primeros 10%, probablemente no es útil
      // Si está después del 50%, probablemente es demasiado tarde
      if (maxDerivativeIndex < top10Index) return top25Index
      if (maxDerivativeIndex > top50Index) return top25Index
      
      return maxDerivativeIndex
    }

    const elbowIndex = findElbow()
    const elbowScore = scoredRefs[elbowIndex]?.score || p75

    return {
      total: scoredRefs.length,
      scores: scoredRefs,
      stats: {
        max,
        min,
        mean,
        p90,
        p75,
        p50,
        p25
      },
      indices: {
        top10: top10Index,
        top25: top25Index,
        top50: top50Index,
        elbow: elbowIndex
      },
      elbowScore,
      scoredRefs,
      recommendations: {
        highConfidence: scoredRefs.slice(0, top10Index),
        recommended: scoredRefs.slice(0, top25Index),
        extended: scoredRefs.slice(0, elbowIndex)
      }
    }
  }, [references])

  const handleSelectPhase = async (phase: string, count: number) => {
    if (!onSelectForFullText || !analysis) return
    
    setLoadingPhase(phase)
    try {
      // Obtener los IDs de los top N artículos
      const topReferences = analysis.scoredRefs.slice(0, count)
      const referenceIds = topReferences.map(ref => ref.id)
      
      await onSelectForFullText(referenceIds, count, phase)
    } finally {
      setLoadingPhase(null)
    }
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Análisis de Distribución
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay referencias con puntajes de similitud para analizar.
            Ejecuta primero el cribado automático (Fase 1).
          </p>
        </CardContent>
      </Card>
    )
  }

  const { stats, indices, elbowScore } = analysis

  return (
    <div className="space-y-4">
      {/* Estadísticas Principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Distribución de Puntajes de Prioridad
          </CardTitle>
          <CardDescription>
            Análisis estadístico de {analysis.total} referencias ordenadas por similitud con el protocolo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border border-green-300 dark:border-green-700 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1">Puntaje Máximo</p>
              <p className="text-2xl font-bold text-foreground">{(stats.max * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 border border-blue-300 dark:border-blue-700 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1">Top 10% (Percentil 90)</p>
              <p className="text-2xl font-bold text-foreground">{(stats.p90 * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 border border-purple-300 dark:border-purple-700 rounded-lg">
              <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold mb-1">Top 25% (Percentil 75)</p>
              <p className="text-2xl font-bold text-foreground">{(stats.p75 * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 border border-orange-300 dark:border-orange-700 rounded-lg">
              <p className="text-xs text-orange-700 dark:text-orange-400 font-semibold mb-1">Mediana (Percentil 50)</p>
              <p className="text-2xl font-bold text-foreground">{(stats.p50 * 100).toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Codo (Simulado con CSS) */}
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Punto de Inflexión ("Codo")</CardTitle>
          <CardDescription>
            Distribución visual de puntajes ordenados de mayor a menor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-64 bg-muted/30 rounded-lg p-4">
            {/* Eje Y (Puntajes) */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-muted-foreground">
              <span>{(stats.max * 100).toFixed(0)}%</span>
              <span>{(stats.mean * 100).toFixed(0)}%</span>
              <span>{(stats.min * 100).toFixed(0)}%</span>
            </div>

            {/* Área del gráfico */}
            <div className="ml-12 h-full relative">
              {/* Líneas de percentiles */}
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-red-400 dark:border-red-600"
                style={{ top: `${(1 - stats.p90 / stats.max) * 100}%` }}
              >
                <span className="absolute -top-2 right-2 text-xs text-red-600 dark:text-red-400 bg-background px-1">
                  Top 10%: {(stats.p90 * 100).toFixed(1)}%
                </span>
              </div>
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-green-400 dark:border-green-600"
                style={{ top: `${(1 - stats.p75 / stats.max) * 100}%` }}
              >
                <span className="absolute -top-2 right-2 text-xs text-green-600 dark:text-green-400 bg-background px-1">
                  Top 25%: {(stats.p75 * 100).toFixed(1)}%
                </span>
              </div>
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-orange-400 dark:border-orange-600"
                style={{ top: `${(1 - stats.p50 / stats.max) * 100}%` }}
              >
                <span className="absolute -top-2 right-2 text-xs text-orange-600 dark:text-orange-400 bg-background px-1">
                  Mediana: {(stats.p50 * 100).toFixed(1)}%
                </span>
              </div>

              {/* Línea vertical del codo */}
              <div 
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-purple-600 dark:border-purple-400"
                style={{ left: `${(indices.elbow / analysis.total) * 100}%` }}
              >
                <span className="absolute bottom-2 -left-8 text-xs text-purple-600 dark:text-purple-400 bg-background px-1 font-semibold">
                  Codo ↓
                </span>
              </div>

              {/* Curva simulada (usando degradado) */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-100 opacity-30 rounded"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 90%)'
                }}
              />
              
              {/* Puntos de datos simulados */}
              {analysis.scores.slice(0, 50).map((ref, idx) => (
                <div
                  key={ref.id}
                  className="absolute w-2 h-2 bg-blue-600 rounded-full"
                  style={{
                    left: `${(idx / analysis.total) * 100}%`,
                    top: `${(1 - ref.score / stats.max) * 100}%`
                  }}
                  title={`${ref.title.substring(0, 50)}... - ${(ref.score * 100).toFixed(1)}%`}
                />
              ))}
            </div>

            {/* Eje X (Número de artículo) */}
            <div className="absolute bottom-0 left-12 right-0 h-8 flex justify-between items-end text-xs text-muted-foreground">
              <span>1</span>
              <span>{Math.floor(analysis.total / 2)}</span>
              <span>{analysis.total}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            <strong>Interpretación:</strong> La línea azul muestra la distribución de puntajes.
            El "codo" (línea púrpura vertical) marca el punto de inflexión donde la relevancia cae bruscamente.
          </p>
        </CardContent>
      </Card>

      {/* Recomendaciones de Corte - Unificado */}
      <Card className="border-green-300 dark:border-green-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Criterio de Corte Recomendado (Método Híbrido)
          </CardTitle>
          <CardDescription className="space-y-2">
            <p className="font-semibold text-foreground">
              Selecciona con cuántos artículos (Top) deseas continuar al Full Text:
            </p>
            <p>
              Haz clic en cualquier fase para seleccionar automáticamente esos artículos para revisión de texto completo. 
              Cada fase representa un nivel de confianza diferente basado en el análisis estadístico.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fase 1: Alta Confianza */}
          <button
            onClick={() => handleSelectPhase('fase1', indices.top10)}
            disabled={!onSelectForFullText || loadingPhase !== null || disabled}
            className="w-full p-4 border-2 border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-green-600 dark:bg-green-700">Fase 1: Alta Confianza</Badge>
                  <span className="text-xs text-green-700 dark:text-green-400">
                    Puntaje &gt; {(stats.p90 * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Estos artículos son <strong>casi con seguridad relevantes</strong>. 
                  Empieza tu revisión manual con estos.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {loadingPhase === 'fase1' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                ) : (
                  <>
                    <Badge variant="outline" className="text-base font-bold">
                      {indices.top10} artículos
                    </Badge>
                    <ArrowRight className="h-5 w-5 text-green-600" />
                  </>
                )}
              </div>
            </div>
          </button>

          {/* Fase 2: Recomendado */}
          <button
            onClick={() => handleSelectPhase('fase2', indices.top25)}
            disabled={!onSelectForFullText || loadingPhase !== null || disabled}
            className="w-full p-4 border-2 border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-600 dark:bg-blue-700">Fase 2: Recomendado</Badge>
                  <span className="text-xs text-blue-700 dark:text-blue-400">
                    Puntaje &gt; {(stats.p75 * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Estos artículos tienen <strong>alta probabilidad de relevancia</strong>. 
                  Incluye estos en tu revisión de texto completo.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {loadingPhase === 'fase2' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  <>
                    <Badge variant="outline" className="text-base font-bold">
                      {indices.top25} artículos
                    </Badge>
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </>
                )}
              </div>
            </div>
          </button>

          {/* Fase 3: Punto de Corte (Codo) */}
          <button
            onClick={() => handleSelectPhase('fase3', indices.elbow)}
            disabled={!onSelectForFullText || loadingPhase !== null || disabled}
            className="w-full p-4 border-2 border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-purple-600 dark:bg-purple-700">Fase 3: Punto de Corte (Codo)</Badge>
                  <span className="text-xs text-purple-700 dark:text-purple-400">
                    Puntaje &gt; {(elbowScore * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Este es el <strong>"codo" del gráfico</strong>. 
                  Después de este punto, la relevancia cae significativamente.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {loadingPhase === 'fase3' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                ) : (
                  <>
                    <Badge variant="outline" className="text-base font-bold">
                      {indices.elbow} artículos
                    </Badge>
                    <ArrowRight className="h-5 w-5 text-purple-600" />
                  </>
                )}
              </div>
            </div>
          </button>

          {/* Criterio de Detención */}
          <div className="p-4 border border-orange-300 dark:border-orange-700 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Criterio de Detención
                </p>
                <p className="text-xs text-muted-foreground">
                  Después del artículo {indices.elbow}, continúa revisando hasta encontrar 
                  <strong> 3-4 artículos consecutivos no relevantes</strong>. 
                  En ese momento, puedes detener tu revisión con confianza, sabiendo que has cubierto 
                  todos los candidatos probables.
                </p>
              </div>
            </div>
          </div>

          {/* Recomendación Final */}
          <div className="mt-4 p-4 border-2 border-primary/30 rounded-lg bg-primary/5">
            <p className="text-sm font-semibold text-foreground mb-2">
              Recomendación Final:
            </p>
            <p className="text-sm text-foreground">
              Para tu revisión de texto completo, enfócate en los primeros <strong>{indices.top25} artículos</strong>
              {' '}(Top 25%). Si tienes tiempo adicional, extiende hasta el artículo <strong>{indices.elbow}</strong>
              {' '}(punto de inflexión del codo).
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Después del artículo {indices.elbow}, la probabilidad de encontrar artículos relevantes 
              disminuye drásticamente según el análisis estadístico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
