"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Target,
  BarChart3,
  Download,
  RefreshCw
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface ScreeningStatistics {
  count: number
  min: number
  max: number
  mean: number
  median: number
  stdDev: number
  percentile25: number
  percentile50: number
  percentile75: number
  percentile90: number
  percentile95: number
}

interface ElbowPoint {
  index: number
  score: number
  percentage: number
}

interface Recommendation {
  level: 'high_confidence' | 'recommended' | 'extended' | 'maximum'
  label: string
  threshold: number
  articleCount: number
  description: string
  color: string
}

interface AnalysisData {
  totalReferences: number
  scoredReferences: number
  statistics: ScreeningStatistics
  elbowPoint: ElbowPoint
  recommendations: Recommendation[]
  chartData: { index: number; score: number }[]
  statusCounts: {
    pending: number
    included: number
    excluded: number
    conflicted: number
  }
}

interface ScreeningAnalysisProps {
  projectId: string
  analysisData: AnalysisData | null
  isLoading: boolean
  onRefresh: () => void
  onApplyThreshold?: (threshold: number) => void
}

export function ScreeningAnalysisPanel({
  projectId,
  analysisData,
  isLoading,
  onRefresh,
  onApplyThreshold
}: ScreeningAnalysisProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análisis de Resultados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Analizando resultados...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysisData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análisis de Resultados
          </CardTitle>
          <CardDescription>
            Ejecuta el cribado automático para ver el análisis estadístico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No hay datos de screening disponibles. Ejecuta primero el cribado automático con embeddings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const { statistics, elbowPoint, recommendations, chartData, statusCounts } = analysisData

  return (
    <div className="space-y-6">
      {/* Header con resumen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análisis Estadístico de Screening
              </CardTitle>
              <CardDescription className="mt-1">
                {analysisData.scoredReferences} de {analysisData.totalReferences} referencias analizadas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold">{statusCounts.pending}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Incluidos</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.included}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Excluidos</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.excluded}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">En conflicto</p>
              <p className="text-2xl font-bold text-amber-600">{statusCounts.conflicted}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas descriptivas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estadísticas de Prioridad</CardTitle>
          <CardDescription>
            Distribución de puntajes de similitud con criterios PICO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Máximo</p>
              <p className="text-lg font-semibold">{statistics.max.toFixed(4)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Top 5% (P95)</p>
              <p className="text-lg font-semibold">{statistics.percentile95.toFixed(4)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Top 10% (P90)</p>
              <p className="text-lg font-semibold">{statistics.percentile90.toFixed(4)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Top 25% (P75)</p>
              <p className="text-lg font-semibold">{statistics.percentile75.toFixed(4)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Mediana (P50)</p>
              <p className="text-lg font-semibold">{statistics.median.toFixed(4)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Media</p>
              <p className="text-lg font-semibold">{statistics.mean.toFixed(4)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Desv. Estándar</p>
              <p className="text-lg font-semibold">{statistics.stdDev.toFixed(4)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Mínimo</p>
              <p className="text-lg font-semibold">{statistics.min.toFixed(4)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de distribución (Elbow Plot) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distribución de Puntajes de Prioridad
          </CardTitle>
          <CardDescription>
            Gráfico de "codo" (Elbow Plot) - Busca el punto donde la curva cae bruscamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="index" 
                  label={{ value: 'Número de Artículo (Ordenado por prioridad)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Puntaje de Prioridad', angle: -90, position: 'insideLeft' }}
                  domain={[0, 1]}
                />
                <Tooltip 
                  formatter={(value: number) => value.toFixed(4)}
                  labelFormatter={(label) => `Artículo #${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
                {/* Línea del punto de codo */}
                <ReferenceLine 
                  x={elbowPoint.index} 
                  stroke="#f59e0b" 
                  strokeDasharray="3 3"
                  label={{ value: `Codo: ${elbowPoint.percentage}%`, position: 'top' }}
                />
                {/* Línea del Top 10% */}
                <ReferenceLine 
                  y={statistics.percentile90} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3"
                  label={{ value: 'Top 10%', position: 'right' }}
                />
                {/* Línea del Top 25% */}
                <ReferenceLine 
                  y={statistics.percentile75} 
                  stroke="#22c55e" 
                  strokeDasharray="3 3"
                  label={{ value: 'Top 25%', position: 'right' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <Alert className="mt-4 border-amber-300 dark:border-amber-700">
            <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-foreground">
              <strong>Punto de Codo Detectado:</strong> Artículo #{elbowPoint.index} (Top {elbowPoint.percentage}%) 
              con puntaje {elbowPoint.score.toFixed(4)}. Este es el punto donde la relevancia cae significativamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Recomendaciones de Criterio de Corte
          </CardTitle>
          <CardDescription>
            Basado en el análisis estadístico y método híbrido (Colab)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    style={{ backgroundColor: rec.color }}
                    className="text-white"
                  >
                    {rec.label}
                  </Badge>
                  <span className="text-sm font-medium">
                    {rec.articleCount} artículos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Umbral: <strong>{rec.threshold.toFixed(4)}</strong>
                  </span>
                  {onApplyThreshold && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onApplyThreshold(rec.threshold)}
                    >
                      Aplicar
                    </Button>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {rec.description}
              </p>
              
              <Progress 
                value={(rec.articleCount / analysisData.scoredReferences) * 100} 
                className="h-2"
                style={{
                  // @ts-ignore
                  '--progress-background': rec.color
                } as React.CSSProperties}
              />
            </div>
          ))}

          <Alert className="border-primary/20 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-foreground">
              <strong>Método Híbrido Recomendado:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Empieza revisando los artículos del <strong>Top 10%</strong> (alta confianza)</li>
                <li>Continúa hasta el <strong>punto de codo recomendado</strong> (Top {elbowPoint.percentage}%)</li>
                <li>Opcionalmente, revisa hasta el <strong>Top 25%</strong> para cobertura extendida</li>
                <li>Detente cuando encuentres 3-4 artículos seguidos irrelevantes</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Botón de exportación */}
      <Card>
        <CardContent className="pt-6">
          <Button className="w-full" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Resultados Priorizados (CSV)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
