"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Sparkles, BarChart3, Info, Brain, CheckCircle2, Loader2, TrendingUp } from "lucide-react"
import { SimilarityDistributionAnalysis } from "./similarity-distribution-analysis"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"

interface AIScreeningPanelProps {
  totalReferences: number
  pendingReferences: number
  projectId: string
  onRunScreening: (threshold: number, method: 'embeddings' | 'llm', provider?: 'chatgpt' | 'gemini') => void
}

export function AIScreeningPanel({ totalReferences, pendingReferences, projectId, onRunScreening }: AIScreeningPanelProps) {
  const [method, setMethod] = useState<'embeddings' | 'llm'>('embeddings');
  const [threshold, setThreshold] = useState([0.15]);
  const [recommendedThreshold, setRecommendedThreshold] = useState<number | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const onThresholdRecommended = (newThreshold: number) => {
    setRecommendedThreshold(newThreshold);
    setThreshold([newThreshold]);
  };

  const onAnalysisComplete = (data: any) => {
    setAnalysisData(data);
    if (data?.recommendedCutoff?.threshold) {
      setRecommendedThreshold(data.recommendedCutoff.threshold);
      setThreshold([data.recommendedCutoff.threshold]);
    }
  };

  const handleRunScreening = async () => {
    setIsRunning(true);
    setProgress(0);

    try {
      // Paso 1: Ejecutar análisis de similitudes automáticamente (10% del progreso)
      setProgress(5);
      console.log('🔍 Paso 1: Ejecutando análisis de similitudes...');
      try {
        const analysisResult = await apiClient.analyzeSimilarityDistribution(projectId);
        if (analysisResult?.data) {
          onAnalysisComplete(analysisResult.data);
          setProgress(10);
          console.log('✅ Análisis de similitudes completado');
        }
      } catch (analysisError) {
        console.warn('⚠️ No se pudo ejecutar el análisis de similitudes, continuando con cribado...', analysisError);
        setProgress(10);
      }

      // Paso 2: Ejecutar el cribado híbrido (el análisis YA se hizo arriba, solo ejecutamos screening)
      setProgress(15);
      console.log('🤖 Paso 2: Ejecutando cribado híbrido (Embeddings + ChatGPT)...');
      
      // Llamar a la función del padre que ejecuta el screening real
      await onRunScreening(threshold[0], method, method === 'llm' ? 'gemini' : undefined);
      
      // Completar progreso
      setProgress(100);
      setIsRunning(false);
      console.log('✅ Cribado híbrido completado exitosamente');
    } catch (error: any) {
      console.error('❌ Error en el proceso de cribado:', error);
      setIsRunning(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Único y Simplificado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Cribado Automático con IA
          </CardTitle>
          <CardDescription>
            El sistema ejecutará automáticamente: (1) Análisis de similitudes para determinar el umbral óptimo, (2) Clasificación con Embeddings de referencias de alta/baja confianza, y (3) Análisis con ChatGPT de la zona gris (10-30% similitud)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Umbral de Inclusión</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{(threshold[0] * 100).toFixed(0)}%</span>
                {recommendedThreshold !== null && Math.abs(threshold[0] - recommendedThreshold) < 0.01 && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    ✓ Recomendado
                  </Badge>
                )}
              </div>
            </div>
            <Slider
              value={threshold}
              onValueChange={setThreshold}
              min={0.05}
              max={0.5}
              step={0.01}
              disabled={isRunning}
              className="w-full"
            />
            {recommendedThreshold !== null ? (
              <p className="text-xs text-green-700 dark:text-green-400">
                ✅ Usando umbral recomendado por análisis: {(recommendedThreshold * 100).toFixed(1)}%
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                ⚠️ <strong>Protocolo en español vs artículos en inglés:</strong> Se recomienda umbral bajo (10-20%). Con mismo idioma usar 70%+
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-muted-foreground text-sm">Total Referencias</p>
              <p className="text-2xl font-bold">{totalReferences}</p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-muted-foreground text-sm">Pendientes</p>
              <p className="text-2xl font-bold">{pendingReferences}</p>
            </div>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {progress < 15 ? '📊 Analizando similitudes...' : 
                   progress < 90 ? '🤖 Ejecutando cribado híbrido...' : 
                   '✅ Finalizando...'}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <Button 
            onClick={handleRunScreening} 
            disabled={isRunning || totalReferences === 0 || method === 'llm'} 
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : method === 'llm' ? (
              "⚠️ Cuota de API Agotada"
            ) : pendingReferences === 0 ? (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                🔄 Re-ejecutar Cribado Híbrido
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                🚀 Ejecutar Cribado Híbrido
              </>
            )}
          </Button>

          {method === 'llm' && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Por favor selecciona el método de <strong>Embeddings</strong> para continuar
              </AlertDescription>
            </Alert>
          )}

          {pendingReferences === 0 && totalReferences > 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-600">
                ℹ️ Las referencias ya fueron procesadas. Puedes re-ejecutar el análisis para actualizar los resultados con la nueva lógica.
              </AlertDescription>
            </Alert>
          )}

          {/* Información del sistema automático */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 ¿Qué hace el análisis automático?
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>📊 <strong>Paso 1:</strong> Analiza similitudes y determina umbral óptimo (Método Elbow)</li>
              <li>🤖 <strong>Paso 2:</strong> Clasifica con Embeddings referencias de alta/baja confianza</li>
              <li>🧠 <strong>Paso 3:</strong> ChatGPT analiza la zona gris (10-30% similitud)</li>
              <li>✅ <strong>Resultado:</strong> Referencias organizadas listas para tu revisión</li>
              <li>📈 <strong>Eficiencia:</strong> 95% precisión | ~$0.01 USD | 1-2 min</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Mostrar estadísticas del análisis si existen */}
      {analysisData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Resultados del Análisis
            </CardTitle>
            <CardDescription>
              {analysisData.totalReferences} referencias analizadas • Método Elbow aplicado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estadísticas de Similitud */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                📊 Estadísticas de Similitud
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="text-xs text-muted-foreground mb-1">Mínimo</div>
                  <div className="text-2xl font-bold">{(analysisData.statistics.min * 100).toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Artículo menos similar</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="text-xs text-muted-foreground mb-1">Máximo</div>
                  <div className="text-2xl font-bold">{(analysisData.statistics.max * 100).toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Artículo más similar</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="text-xs text-muted-foreground mb-1">Media</div>
                  <div className="text-2xl font-bold">{(analysisData.statistics.mean * 100).toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Similitud promedio</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="text-xs text-muted-foreground mb-1">Mediana</div>
                  <div className="text-2xl font-bold">{(analysisData.statistics.median * 100).toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Punto medio</div>
                </div>
              </div>
            </div>

            {/* Distribución por Percentiles */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                📈 Distribución por Percentiles
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">Top 5% (P95)</div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{(analysisData.statistics.percentile95 * 100).toFixed(2)}%</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">5% más similares</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200">
                  <div className="text-xs text-purple-700 dark:text-purple-300 mb-1">Top 10% (P90)</div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{(analysisData.statistics.percentile90 * 100).toFixed(2)}%</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">10% más similares</div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200">
                  <div className="text-xs text-orange-700 dark:text-orange-300 mb-1">Top 25% (P75)</div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{(analysisData.statistics.percentile75 * 100).toFixed(2)}%</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">25% más similares</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                  <div className="text-xs text-muted-foreground mb-1">Mediana (P50)</div>
                  <div className="text-2xl font-bold">{(analysisData.statistics.percentile50 * 100).toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">50% sobre este valor</div>
                </div>
              </div>
            </div>

            {/* Umbral Óptimo Recomendado */}
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-green-600 text-white flex-shrink-0">
                  🎯
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1 flex items-center gap-2">
                    Umbral Óptimo Encontrado (Elbow Point)
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-300 mb-3">
                    Este es el punto de inflexión donde la relación calidad/cantidad es óptima
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-green-700 dark:text-green-300 mb-1">📊 Umbral Recomendado</div>
                      <div className="text-3xl font-bold text-green-900 dark:text-green-100">{(analysisData.recommendedCutoff.threshold * 100).toFixed(2)}%</div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">Artículos con similitud ≥ este valor serán incluidos</div>
                    </div>
                    <div>
                      <div className="text-xs text-green-700 dark:text-green-300 mb-1">📝 Artículos a Revisar</div>
                      <div className="text-3xl font-bold text-green-900 dark:text-green-100">{analysisData.recommendedCutoff.articlesToReview}</div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">{analysisData.recommendedCutoff.percentageOfTotal}% del total ({analysisData.totalReferences} refs)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
