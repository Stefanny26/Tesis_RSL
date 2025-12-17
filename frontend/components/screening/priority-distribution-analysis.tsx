"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"

interface PriorityDistributionAnalysisProps {
  readonly references: ReadonlyArray<{
    readonly id: string
    readonly title: string
    readonly similarity_score?: number | null
    readonly screeningScore?: number | null
    readonly ai_classification?: string
  }>
}

export function PriorityDistributionAnalysis({ references }: Readonly<PriorityDistributionAnalysisProps>) {
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
      recommendations: {
        highConfidence: scoredRefs.slice(0, top10Index),
        recommended: scoredRefs.slice(0, top25Index),
        extended: scoredRefs.slice(0, elbowIndex)
      }
    }
  }, [references])

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
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Distribución de Puntajes de Prioridad
          </CardTitle>
          <CardDescription>
            Análisis estadístico de {analysis.total} referencias ordenadas por similitud con el protocolo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 font-semibold mb-1">Puntaje Máximo</p>
              <p className="text-2xl font-bold text-green-900">{(stats.max * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 font-semibold mb-1">Top 10% (Percentil 90)</p>
              <p className="text-2xl font-bold text-blue-900">{(stats.p90 * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-700 font-semibold mb-1">Top 25% (Percentil 75)</p>
              <p className="text-2xl font-bold text-purple-900">{(stats.p75 * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-orange-700 font-semibold mb-1">Mediana (Percentil 50)</p>
              <p className="text-2xl font-bold text-orange-900">{(stats.p50 * 100).toFixed(1)}%</p>
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
          <div className="relative h-64 bg-slate-50 rounded-lg p-4">
            {/* Eje Y (Puntajes) */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-slate-600">
              <span>{(stats.max * 100).toFixed(0)}%</span>
              <span>{(stats.mean * 100).toFixed(0)}%</span>
              <span>{(stats.min * 100).toFixed(0)}%</span>
            </div>

            {/* Área del gráfico */}
            <div className="ml-12 h-full relative">
              {/* Líneas de percentiles */}
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-red-400"
                style={{ top: `${(1 - stats.p90 / stats.max) * 100}%` }}
              >
                <span className="absolute -top-2 right-2 text-xs text-red-600 bg-white px-1">
                  Top 10%: {(stats.p90 * 100).toFixed(1)}%
                </span>
              </div>
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-green-400"
                style={{ top: `${(1 - stats.p75 / stats.max) * 100}%` }}
              >
                <span className="absolute -top-2 right-2 text-xs text-green-600 bg-white px-1">
                  Top 25%: {(stats.p75 * 100).toFixed(1)}%
                </span>
              </div>
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-orange-400"
                style={{ top: `${(1 - stats.p50 / stats.max) * 100}%` }}
              >
                <span className="absolute -top-2 right-2 text-xs text-orange-600 bg-white px-1">
                  Mediana: {(stats.p50 * 100).toFixed(1)}%
                </span>
              </div>

              {/* Línea vertical del codo */}
              <div 
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-purple-600"
                style={{ left: `${(indices.elbow / analysis.total) * 100}%` }}
              >
                <span className="absolute bottom-2 -left-8 text-xs text-purple-600 bg-white px-1 font-semibold">
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
            <div className="absolute bottom-0 left-12 right-0 h-8 flex justify-between items-end text-xs text-slate-600">
              <span>1</span>
              <span>{Math.floor(analysis.total / 2)}</span>
              <span>{analysis.total}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            📊 <strong>Interpretación:</strong> La línea azul muestra la distribución de puntajes.
            El "codo" (línea púrpura vertical) marca el punto de inflexión donde la relevancia cae bruscamente.
          </p>
        </CardContent>
      </Card>

      {/* Recomendaciones de Corte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Criterio de Corte Recomendado (Método Híbrido)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Badge className="bg-green-600">Fase 1: Alta Confianza</Badge>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 mb-1">
                  Revisa los primeros {indices.top10} artículos
                </p>
                <p className="text-xs text-green-700">
                  Puntaje &gt; {(stats.p90 * 100).toFixed(1)}% (Top 10%)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ✅ Estos artículos son <strong>casi con seguridad relevantes</strong>. 
                  Empieza tu revisión manual con estos.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Badge className="bg-blue-600">Fase 2: Recomendado</Badge>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Continúa hasta el artículo {indices.top25}
                </p>
                <p className="text-xs text-blue-700">
                  Puntaje &gt; {(stats.p75 * 100).toFixed(1)}% (Top 25%)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Estos artículos tienen <strong>alta probabilidad de relevancia</strong>. 
                  Incluye estos en tu revisión de texto completo.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Badge className="bg-purple-600">Fase 3: Punto de Corte (Codo)</Badge>
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-900 mb-1">
                  Extiende hasta el artículo {indices.elbow}
                </p>
                <p className="text-xs text-purple-700">
                  Puntaje &gt; {(elbowScore * 100).toFixed(1)}% (Punto de inflexión detectado)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  📐 Este es el <strong>"codo" del gráfico</strong>. 
                  Después de este punto, la relevancia cae significativamente.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingDown className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-900 mb-1">
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
        </CardContent>
      </Card>

      {/* Resumen Numérico */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Resumen de Artículos para Full Text Screening</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="text-sm font-semibold text-green-900">Mínimo recomendado (Top 10%):</span>
              <Badge className="bg-green-600">{indices.top10} artículos</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-sm font-semibold text-blue-900">Recomendado estándar (Top 25%):</span>
              <Badge className="bg-blue-600">{indices.top25} artículos</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
              <span className="text-sm font-semibold text-purple-900">Punto de corte óptimo (Codo):</span>
              <Badge className="bg-purple-600">{indices.elbow} artículos</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
              <span className="text-sm font-semibold text-orange-900">Máximo razonable (Mediana):</span>
              <Badge className="bg-orange-600">{indices.top50} artículos</Badge>
            </div>
          </div>

          <div className="mt-4 p-4 bg-slate-100 rounded-lg">
            <p className="text-sm font-semibold text-slate-900 mb-2">
              ✅ Recomendación Final:
            </p>
            <p className="text-sm text-slate-700">
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
