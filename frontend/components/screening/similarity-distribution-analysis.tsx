/**
 * @deprecated Este componente será reemplazado por priority-distribution-analysis.tsx
 * 
 * TODO: Migrar todos los usos a priority-distribution-analysis.tsx y eliminar este archivo
 * El nuevo componente ofrece:
 * - Análisis de percentiles más preciso (Top 10%, Top 25%, Mediana)
 * - Detección automática del "codo" (elbow point) con segunda derivada
 * - Gráfico visual de distribución mejorado
 * - Recomendaciones de criterio de corte más detalladas
 * 
 * Mantener hasta que se complete la migración (estimado: versión 2.1.0)
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, TrendingUp, Info, CheckCircle2, Sparkles } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface SimilarityDistributionAnalysisProps {
  projectId: string
  onAnalysisComplete?: (data: any) => void
}

export function SimilarityDistributionAnalysis({ 
  projectId, 
  onAnalysisComplete 
}: SimilarityDistributionAnalysisProps) {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiClient.analyzeSimilarityDistribution(projectId)
      setAnalysis(result.data)
      setDialogOpen(true) // Abrir diálogo automáticamente
      
      // Pasar los datos completos al callback
      if (onAnalysisComplete) {
        onAnalysisComplete(result.data)
      }
    } catch (err: any) {
      setError(err.message || 'Error al analizar distribución')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Diseño compacto horizontal estilo el ejemplo */}
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">
                {analysis ? 'Análisis Completado' : 'Análisis de Distribución de Similitudes'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {analysis 
                  ? `Umbral: ${(analysis.recommendedCutoff.threshold * 100).toFixed(1)}% • ${analysis.recommendedCutoff.articlesToReview} artículos (${analysis.recommendedCutoff.percentageOfTotal}%) a revisar`
                  : 'Análisis estadístico automático usando Método Elbow'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!analysis && (
              <>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Modelo</div>
                  <div className="text-sm font-medium text-foreground">all-MiniLM-L6-v2</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Costo</div>
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">~3 min | $0</div>
                </div>
              </>
            )}
            <Button 
              onClick={analysis ? () => setDialogOpen(true) : runAnalysis}
              size="sm"
              variant="outline"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {loading ? 'Analizando...' : analysis ? 'Ver análisis' : 'Ejecutar análisis'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Dialog con los detalles del análisis */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análisis de Distribución de Similitudes
              </DialogTitle>
              <DialogDescription>
                Resultados del análisis estadístico con Método Elbow
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
              {analysis && (
          <div className="space-y-6">
            {/* Estadísticas Descriptivas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">📊 Estadísticas de Similitud</h3>
                <Badge variant="outline" className="text-xs">
                  {analysis.totalReferences} referencias analizadas
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Rango de similitud semántica (0% = sin relación, 100% = idéntico al protocolo):
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard 
                  label="Mínimo" 
                  value={(analysis.statistics.min * 100).toFixed(2) + '%'}
                  description="Artículo menos similar"
                />
                <StatCard 
                  label="Máximo" 
                  value={(analysis.statistics.max * 100).toFixed(2) + '%'}
                  description="Artículo más similar"
                />
                <StatCard 
                  label="Media" 
                  value={(analysis.statistics.mean * 100).toFixed(2) + '%'}
                  description="Similitud promedio"
                />
                <StatCard 
                  label="Mediana" 
                  value={(analysis.statistics.median * 100).toFixed(2) + '%'}
                  description="Punto medio"
                />
              </div>
            </div>

            {/* Percentiles */}
            <div>
              <h3 className="font-semibold mb-3">📈 Distribución por Percentiles</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Los percentiles te ayudan a entender cómo se distribuyen las similitudes:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard 
                  label="Top 5% (P95)" 
                  value={(analysis.statistics.percentile95 * 100).toFixed(2) + '%'}
                  description="5% más similares"
                  highlight
                />
                <StatCard 
                  label="Top 10% (P90)" 
                  value={(analysis.statistics.percentile90 * 100).toFixed(2) + '%'}
                  description="10% más similares"
                  highlight
                />
                <StatCard 
                  label="Top 25% (P75)" 
                  value={(analysis.statistics.percentile75 * 100).toFixed(2) + '%'}
                  description="25% más similares"
                />
                <StatCard 
                  label="Mediana (P50)" 
                  value={(analysis.statistics.percentile50 * 100).toFixed(2) + '%'}
                  description="50% sobre este valor"
                />
              </div>
            </div>

            {/* Punto de Corte Recomendado */}
            <Alert className="border-green-300 dark:border-green-700">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-foreground">
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-base">🎯 Umbral Óptimo Encontrado (Elbow Point)</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Este es el punto de inflexión donde la relación calidad/cantidad es óptima
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">📊 Umbral Recomendado</p>
                      <p className="text-3xl font-bold text-green-700 dark:text-green-400 mt-1">
                        {(analysis.recommendedCutoff.threshold * 100).toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Artículos con similitud ≥ este valor serán incluidos
                      </p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">📚 Artículos a Revisar</p>
                      <p className="text-3xl font-bold text-green-700 dark:text-green-400 mt-1">
                        {analysis.recommendedCutoff.articlesToReview}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analysis.recommendedCutoff.percentageOfTotal}% del total ({analysis.totalReferences} refs)
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg border border-primary/20 mt-3">
                    <p className="text-xs text-foreground">
                      <strong>💡 ¿Cómo se calculó?</strong> El algoritmo analizó la curva de similitudes 
                      y encontró el punto donde la "ganancia" de incluir más artículos disminuye significativamente. 
                      Este es el balance ideal entre <strong>exhaustividad</strong> (no perder artículos relevantes) 
                      y <strong>precisión</strong> (no incluir artículos irrelevantes).
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Análisis de Umbrales */}
            <div>
              <h3 className="font-semibold mb-3">🔍 Simulación de Diferentes Umbrales</h3>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Compara qué pasaría</strong> si usaras diferentes umbrales de similitud. 
                El marcado en verde es el recomendado por el análisis Elbow:
              </p>
              <div className="space-y-2">
                {analysis.thresholdAnalysis.map((item: any) => (
                  <ThresholdRow 
                    key={item.threshold}
                    threshold={item.threshold}
                    included={item.included}
                    excluded={item.excluded}
                    inclusionRate={item.inclusionRate}
                    isRecommended={
                      Math.abs(item.threshold - analysis.recommendedCutoff.threshold) < 0.05
                    }
                  />
                ))}
              </div>
            </div>

            {/* Recomendaciones */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">💡 Cómo Usar Este Análisis:</p>
                <div className="space-y-3 text-sm">
                  <div className="border border-green-300 dark:border-green-700 p-3 rounded">
                    <p className="font-semibold text-green-800 dark:text-green-400">✅ Zona Verde (Alta Confianza)</p>
                    <p className="text-foreground mt-1">
                      <strong>Similitud {'>'} {(analysis.statistics.percentile90 * 100).toFixed(0)}% (Top 10%)</strong>
                      <br />
                      → Estos artículos son MUY similares a tu protocolo. Revísalos primero.
                      <br />
                      → Alta probabilidad de ser relevantes para tu RSL.
                    </p>
                  </div>
                  
                  <div className="border border-yellow-300 dark:border-yellow-700 p-3 rounded">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-400">⚠️ Zona Gris (Revisar Manualmente)</p>
                    <p className="text-foreground mt-1">
                      <strong>Similitud entre {(analysis.statistics.percentile25 * 100).toFixed(0)}% 
                      y {(analysis.recommendedCutoff.threshold * 100).toFixed(0)}%</strong>
                      <br />
                      → Artículos con similitud moderada. Requieren análisis humano.
                      <br />
                      → Pueden contener información valiosa o ser falsos positivos.
                    </p>
                  </div>
                  
                  <div className="border border-red-300 dark:border-red-700 p-3 rounded">
                    <p className="font-semibold text-red-800 dark:text-red-400">❌ Zona Roja (Baja Confianza)</p>
                    <p className="text-foreground mt-1">
                      <strong>Similitud {'<'} {(analysis.recommendedCutoff.threshold * 100).toFixed(0)}%</strong>
                      <br />
                      → Artículos con baja similitud al protocolo.
                      <br />
                      → Probablemente no son relevantes para tu revisión.
                    </p>
                  </div>

                  <div className="border border-primary/30 p-3 rounded mt-3">
                    <p className="text-xs text-foreground">
                      <strong>🎯 Paso siguiente:</strong> Aplica el umbral recomendado de{' '}
                      <strong>{(analysis.recommendedCutoff.threshold * 100).toFixed(2)}%</strong> en 
                      el panel de "Cribado Automatico con IA" para clasificar tus {analysis.totalReferences} referencias 
                      automáticamente. Esto filtrará aproximadamente {analysis.recommendedCutoff.articlesToReview} artículos 
                      que deberás revisar en detalle.
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => setDialogOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cerrar
              </Button>
              <Button 
                onClick={runAnalysis} 
                variant="default"
                className="flex-1"
              >
                Regenerar Análisis
              </Button>
            </div>
          </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
    </div>
  )
}

function StatCard({ 
  label, 
  value, 
  description,
  highlight = false 
}: { 
  label: string
  value: string
  description?: string
  highlight?: boolean
}) {
  return (
    <div className={`p-3 rounded-lg border ${
      highlight ? 'border-blue-300 dark:border-blue-700' : 'border-primary/20'
    }`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${
        highlight ? 'text-blue-700 dark:text-blue-400' : 'text-foreground'
      }`}>
        {value}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  )
}

function ThresholdRow({
  threshold,
  included,
  excluded,
  inclusionRate,
  isRecommended
}: {
  threshold: number
  included: number
  excluded: number
  inclusionRate: number
  isRecommended: boolean
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      isRecommended ? 'border-green-300 dark:border-green-700' : 'border-primary/20'
    }`}>
      <div className="flex items-center gap-3">
        <span className={`font-mono text-sm font-semibold ${
          isRecommended ? 'text-green-700 dark:text-green-400' : 'text-foreground'
        }`}>
          {(threshold * 100).toFixed(0)}%
        </span>
        {isRecommended && (
          <Badge variant="default" className="bg-green-600 dark:bg-green-700">Recomendado</Badge>
        )}
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-right">
          <p className="text-muted-foreground text-xs">Incluir</p>
          <p className="font-semibold text-green-600">{included}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">Excluir</p>
          <p className="font-semibold text-red-600">{excluded}</p>
        </div>
        <div className="text-right min-w-[60px]">
          <p className="text-muted-foreground text-xs">Tasa</p>
          <p className="font-semibold">{inclusionRate}%</p>
        </div>
      </div>
    </div>
  )
}
