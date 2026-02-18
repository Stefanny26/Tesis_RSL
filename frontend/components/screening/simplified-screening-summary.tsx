"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
    ArrowRight,
    Info,
    ClipboardPaste,
    Loader2,
    CheckCircle,
    XCircle,
    Upload,
    FileText,
    X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface SimplifiedScreeningSummaryProps {
    projectId: string
    result: {
        summary: {
            total: number
            included: number
            excluded: number
            reviewManual: number
            phase1: {
                highConfidenceInclude: number
                highConfidenceExclude: number
                greyZone: number
            }
            phase2: {
                analyzed: number
            }
        }
        classifiedReferences?: {
            highConfidenceInclude: any[]
            highConfidenceExclude: any[]
            complementaryRelevant: any[]
            complementaryNotRelevant: any[]
        }
        statistics?: {
            min: number
            max: number
            mean: number
            median?: number
            percentile25?: number
            percentile50: number
            percentile75: number
            percentile90: number
            percentile95: number
        }
        recommendedCutoff?: {
            threshold: number
            articlesToReview: number
            percentageOfTotal: number
        }
    }
    onProceedToManualReview: (selectedIds: string[]) => void
    onReferenceStatusChange?: (referenceId: string, status: 'included' | 'excluded' | 'pending', exclusionReason?: string) => void
    isLocked?: boolean
}

export function SimplifiedScreeningSummary({ projectId, result, onProceedToManualReview, onReferenceStatusChange, isLocked = false }: SimplifiedScreeningSummaryProps) {
    const { toast } = useToast()
    const [manuallySelected, setManuallySelected] = useState<Set<string>>(new Set())
    const [pasteDialogOpen, setPasteDialogOpen] = useState(false)
    const [pasteRefId, setPasteRefId] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isSavingPaste, setIsSavingPaste] = useState(false)
    const [decision, setDecision] = useState<'include' | 'exclude' | null>(null)
    const [exclusionReason, setExclusionReason] = useState('')
    // Mapa local para rastrear decisiones de revisión (inmediato + persistido desde backend)
    const [reviewedArticles, setReviewedArticles] = useState<Map<string, 'included' | 'excluded'>>(new Map())

    const { summary, classifiedReferences, statistics, recommendedCutoff } = result

    // Inicializar el mapa de revisados desde manualReviewStatus (NO desde status, que es de la IA)
    useEffect(() => {
        const initialMap = new Map<string, 'included' | 'excluded'>()
        const allRefs = [
            ...(classifiedReferences?.highConfidenceInclude || []),
            ...(classifiedReferences?.complementaryRelevant || []),
            ...(classifiedReferences?.highConfidenceExclude || []),
            ...(classifiedReferences?.complementaryNotRelevant || [])
        ]
        allRefs.forEach((ref: any) => {
            // Solo usar manualReviewStatus (indica que el usuario revisó manualmente)
            if (ref.manualReviewStatus === 'included' || ref.manualReviewStatus === 'excluded') {
                initialMap.set(ref.id, ref.manualReviewStatus)
            }
        })
        if (initialMap.size > 0) {
            setReviewedArticles(prev => {
                const merged = new Map(prev)
                initialMap.forEach((val, key) => {
                    if (!merged.has(key)) merged.set(key, val)
                })
                return merged
            })
        }
    }, [classifiedReferences])

    // Helper para obtener el estado de revisión de un artículo
    const getReviewStatus = (refId: string): 'included' | 'excluded' | 'pending' => {
        return reviewedArticles.get(refId) || 'pending'
    }

    // Calcular artículos disponibles para selección
    const allRelevantArticles = [
        ...(classifiedReferences?.highConfidenceInclude || []),
        ...(classifiedReferences?.complementaryRelevant || [])
    ]

    // Ordenar por score descendente
    const sortedArticles = [...allRelevantArticles].sort((a, b) => {
        const scoreA = a.screeningScore || 0
        const scoreB = b.screeningScore || 0
        return scoreB - scoreA
    })

    // Calcular punto de codo (elbow) si no viene del backend - optimizado con useMemo
    const elbowIndex = useMemo(() => {
        if (recommendedCutoff?.articlesToReview) {
            return recommendedCutoff.articlesToReview
        }

        if (sortedArticles.length < 10) return Math.ceil(sortedArticles.length * 0.25)

        const derivatives: number[] = []
        for (let i = 1; i < sortedArticles.length - 1; i++) {
            const prevScore = sortedArticles[i - 1].screeningScore || 0
            const currScore = sortedArticles[i].screeningScore || 0
            const nextScore = sortedArticles[i + 1].screeningScore || 0
            const d2 = prevScore - 2 * currScore + nextScore
            derivatives.push(Math.abs(d2))
        }

        const maxDerivativeIndex = derivatives.indexOf(Math.max(...derivatives)) + 1
        const top10Index = Math.ceil(sortedArticles.length * 0.1)
        const top50Index = Math.ceil(sortedArticles.length * 0.5)

        if (maxDerivativeIndex < top10Index) return Math.ceil(sortedArticles.length * 0.25)
        if (maxDerivativeIndex > top50Index) return Math.ceil(sortedArticles.length * 0.25)

        return maxDerivativeIndex
    }, [sortedArticles, recommendedCutoff])

    // Usar el Top recomendado por el sistema (punto de codo)
    const recommendedCount = elbowIndex
    const recommendedArticles = sortedArticles.slice(0, Math.min(recommendedCount, sortedArticles.length))

    // Obtener artículos seleccionados (recomendados + manualmente agregados)
    const getSelectedArticles = () => {
        // Selección automática: artículos recomendados + manualmente agregados
        const baseSelection = new Set<string>(recommendedArticles.map(art => art.id))

        // Agregar selecciones manuales adicionales
        manuallySelected.forEach(id => baseSelection.add(id))

        return Array.from(baseSelection)
    }

    const handleProceed = () => {
        const selectedIds = getSelectedArticles()
        onProceedToManualReview(selectedIds)
    }

    const toggleManualSelection = (refId: string) => {
        const newSelected = new Set(manuallySelected)
        if (newSelected.has(refId)) {
            newSelected.delete(refId)
        } else {
            newSelected.add(refId)
        }
        setManuallySelected(newSelected)
    }

    const handleSavePastedResults = async (finalDecision: 'include' | 'exclude') => {
        if (!pasteRefId) return
        if (finalDecision === 'exclude' && !exclusionReason.trim()) {
            toast({
                title: "Razón de exclusión requerida",
                description: "Debes especificar por qué excluyes este artículo",
                variant: "destructive"
            })
            return
        }

        setIsSavingPaste(true)
        try {
            const apiClient = new ApiClient()

            // Subir archivo PDF
            if (selectedFile) {
                toast({
                    title: finalDecision === 'include' ? "Incluyendo artículo..." : "Excluyendo artículo...",
                    description: `Subiendo archivo PDF (${(selectedFile.size / 1024).toFixed(1)} KB)`
                })
                await apiClient.uploadPdf(pasteRefId, selectedFile)
            }

            // Enviar decisión al backend usando endpoint existente
            const token = localStorage.getItem("token")
            const mappedStatus = finalDecision === 'include' ? 'included' : 'excluded'
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/references/${pasteRefId}/screening`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: mappedStatus,
                        manualReviewStatus: mappedStatus,
                        exclusionReason: finalDecision === 'exclude' ? exclusionReason : undefined
                    })
                }
            )

            if (!response.ok) {
                throw new Error("Error al guardar la decisión")
            }

            // Actualizar mapa local de revisados inmediatamente
            const newStatus = finalDecision === 'include' ? 'included' as const : 'excluded' as const
            setReviewedArticles(prev => {
                const updated = new Map(prev)
                updated.set(pasteRefId, newStatus)
                return updated
            })

            // Notificar cambio de estado al componente padre
            if (onReferenceStatusChange) {
                onReferenceStatusChange(
                    pasteRefId,
                    newStatus,
                    finalDecision === 'exclude' ? exclusionReason : undefined
                )
            }

            toast({
                title: finalDecision === 'include' ? " Artículo incluido" : " Artículo excluido",
                description: finalDecision === 'include'
                    ? "El artículo ha sido incluido para el análisis final - Se reflejará en el diagrama PRISMA"
                    : "El artículo ha sido excluido de la revisión - Se reflejará en el diagrama PRISMA"
            })

            setPasteDialogOpen(false)
            setSelectedFile(null)
            setPasteRefId(null)
            setDecision(null)
            setExclusionReason('')
        } catch (error: any) {
            toast({
                title: "Error al guardar",
                description: error.message || "No se pudieron guardar los resultados",
                variant: "destructive"
            })
        } finally {
            setIsSavingPaste(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Resumen en Texto Simple */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Resumen del Screening Automático</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Estadísticas Principales */}
                    {statistics && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="h-5 w-5 text-primary" />
                                    Distribución de Puntajes de Prioridad
                                </CardTitle>
                                <CardDescription>
                                    Análisis estadístico de {summary.total} referencias ordenadas por similitud con el protocolo
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 border border-green-300 dark:border-green-700 rounded-lg">
                                        <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1">Puntaje Máximo</p>
                                        <p className="text-2xl font-bold text-foreground">{(statistics.max * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="p-3 border border-blue-300 dark:border-blue-700 rounded-lg">
                                        <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1">Top 10% (Percentil 90)</p>
                                        <p className="text-2xl font-bold text-foreground">{(statistics.percentile90 * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="p-3 border border-purple-300 dark:border-purple-700 rounded-lg">
                                        <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold mb-1">Top 25% (Percentil 75)</p>
                                        <p className="text-2xl font-bold text-foreground">{(statistics.percentile75 * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="p-3 border border-orange-300 dark:border-orange-700 rounded-lg">
                                        <p className="text-xs text-orange-700 dark:text-orange-400 font-semibold mb-1">Mediana (Percentil 50)</p>
                                        <p className="text-2xl font-bold text-foreground">{(statistics.percentile50 * 100).toFixed(1)}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Gráfico de Punto de Inflexión (Codo) */}
                    {statistics && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Gráfico de Punto de Inflexión ("Codo")</CardTitle>
                                <CardDescription>
                                    Distribución visual de puntajes ordenados de mayor a menor
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative h-64 bg-muted/30 rounded-lg p-4 overflow-hidden">
                                    {/* Eje Y (Puntajes) */}
                                    <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-muted-foreground pl-2 z-10">
                                        <span>{(statistics.max * 100).toFixed(0)}%</span>
                                        <span>{(statistics.mean * 100).toFixed(0)}%</span>
                                        <span>{(statistics.min * 100).toFixed(0)}%</span>
                                    </div>

                                    {/* Área del gráfico */}
                                    <div className="ml-12 mr-1 h-full relative overflow-hidden">
                                        {/* Líneas de percentiles */}
                                        <div
                                            className="absolute left-0 right-0 border-t-2 border-dashed border-red-400 dark:border-red-600"
                                            style={{ top: `${(1 - statistics.percentile90 / statistics.max) * 100}%` }}
                                        >
                                            <span className="absolute -top-3 right-0 text-[10px] text-red-600 dark:text-red-400 bg-background/80 px-1 rounded whitespace-nowrap">
                                                Top 10%: {(statistics.percentile90 * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div
                                            className="absolute left-0 right-0 border-t-2 border-dashed border-green-400 dark:border-green-600"
                                            style={{ top: `${(1 - statistics.percentile75 / statistics.max) * 100}%` }}
                                        >
                                            <span className="absolute -top-3 right-0 text-[10px] text-green-600 dark:text-green-400 bg-background/80 px-1 rounded whitespace-nowrap">
                                                Top 25%: {(statistics.percentile75 * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div
                                            className="absolute left-0 right-0 border-t-2 border-dashed border-orange-400 dark:border-orange-600"
                                            style={{ top: `${(1 - statistics.percentile50 / statistics.max) * 100}%` }}
                                        >
                                            <span className="absolute -top-3 right-0 text-[10px] text-orange-600 dark:text-orange-400 bg-background/80 px-1 rounded whitespace-nowrap">
                                                Mediana: {(statistics.percentile50 * 100).toFixed(1)}%
                                            </span>
                                        </div>

                                        {/* Línea vertical del codo */}
                                        <div
                                            className="absolute top-0 bottom-0 border-l-2 border-dashed border-purple-600 dark:border-purple-400"
                                            style={{ left: `${Math.min((elbowIndex / sortedArticles.length) * 100, 95)}%` }}
                                        >
                                            <span className="absolute bottom-2 -left-8 text-xs text-purple-600 dark:text-purple-400 bg-background/80 px-1 font-semibold whitespace-nowrap">
                                                Codo ↓
                                            </span>
                                        </div>

                                        {/* Curva simulada (usando degradado) */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-100 dark:from-blue-700 dark:via-blue-600 dark:to-blue-900 opacity-30 rounded"
                                            style={{
                                                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 90%)'
                                            }}
                                        />

                                        {/* Puntos de datos - TODOS los artículos */}
                                        {sortedArticles.map((ref, idx) => {
                                            const total = Math.max(sortedArticles.length - 1, 1)
                                            return (
                                                <div
                                                    key={ref.id}
                                                    className="absolute w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full -translate-x-1 -translate-y-1"
                                                    style={{
                                                        left: `${(idx / total) * 100}%`,
                                                        top: `${(1 - (ref.screeningScore || 0) / statistics.max) * 100}%`
                                                    }}
                                                    title={`${ref.title.substring(0, 50)}... - ${((ref.screeningScore || 0) * 100).toFixed(1)}%`}
                                                />
                                            )
                                        })}
                                    </div>

                                    {/* Eje X (Número de artículo) */}
                                    <div className="absolute bottom-0 left-12 right-0 h-8 flex justify-between items-end text-xs text-muted-foreground px-1">
                                        <span>1</span>
                                        <span>{Math.floor(sortedArticles.length / 2)}</span>
                                        <span>{sortedArticles.length}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground mt-4">
                                    <strong>Interpretación:</strong> La línea azul muestra la distribución de puntajes.
                                    El "codo" (línea púrpura vertical) marca el punto de inflexión donde la relevancia cae bruscamente.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            {/* Selección Automática del Top Recomendado */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Artículos Recomendados para Revisión Manual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLocked && (
                        <Alert className="border-blue-400 bg-blue-50 dark:!bg-blue-950/60 dark:border-blue-700">
                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                                La revisión manual ha sido completada. Los artículos y sus decisiones están bloqueados.
                            </AlertDescription>
                        </Alert>
                    )}
                    {!isLocked && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                El sistema ha identificado automáticamente los <strong>{recommendedArticles.length} artículos más relevantes</strong> según el análisis del punto de inflexión (codo).
                                Estos artículos serán revisados manualmente. Puedes agregar artículos adicionales si lo deseas.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Mostrar artículos recomendados automáticamente */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Artículos seleccionados ({getSelectedArticles().length})</h4>
                            <Badge className="bg-purple-600">
                                RECOMENDADO POR IA
                            </Badge>
                        </div>

                        {/* Progreso de revisión */}
                        {(() => {
                            const reviewed = recommendedArticles.filter((r: any) => getReviewStatus(r.id) !== 'pending').length
                            const includedCount = recommendedArticles.filter((r: any) => getReviewStatus(r.id) === 'included').length
                            const excludedCount = recommendedArticles.filter((r: any) => getReviewStatus(r.id) === 'excluded').length
                            const total = recommendedArticles.length
                            const pct = total > 0 ? Math.round((reviewed / total) * 100) : 0
                            return (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Progreso de revisión:</span>
                                        <span className="font-medium">
                                            {reviewed}/{total} revisados ({pct}%)
                                            {includedCount > 0 && <span className="text-green-600 dark:text-green-400 ml-2"> {includedCount} incluidos</span>}
                                            {excludedCount > 0 && <span className="text-red-600 dark:text-red-400 ml-2"> {excludedCount} excluidos</span>}
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                        <div className="h-full flex">
                                            <div className="bg-green-500 transition-all" style={{ width: `${total > 0 ? (includedCount / total) * 100 : 0}%` }} />
                                            <div className="bg-red-500 transition-all" style={{ width: `${total > 0 ? (excludedCount / total) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })()}

                        {/* Lista de artículos recomendados */}
                        <div className="space-y-2 border dark:border-slate-700 rounded-lg p-3 max-h-96 overflow-y-auto">
                            {recommendedArticles.map((ref: any, idx) => {
                                const reviewStatus = getReviewStatus(ref.id)
                                const isIncluded = reviewStatus === 'included'
                                const isExcluded = reviewStatus === 'excluded'
                                const isReviewed = isIncluded || isExcluded

                                return (
                                    <Card key={ref.id} className={cn(
                                        "transition-all border-l-4",
                                        isIncluded && "border-l-green-500 bg-green-50/60 dark:!bg-green-950/80 dark:border-l-green-400 dark:border-green-800",
                                        isExcluded && "border-l-red-500 bg-red-50/60 dark:!bg-red-950/80 dark:border-l-red-400 dark:border-red-800",
                                        !isReviewed && "border-l-sky-400 bg-sky-50/60 dark:!bg-sky-950/70 dark:border-l-sky-400 dark:border-sky-800"
                                    )}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                {/* Número con color según estado */}
                                                <div className={cn(
                                                    "rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs flex-shrink-0",
                                                    isIncluded && "bg-green-600 text-white",
                                                    isExcluded && "bg-red-600 text-white",
                                                    !isReviewed && "bg-sky-400 text-white"
                                                )}>
                                                    {isIncluded && <CheckCircle className="h-4 w-4" />}
                                                    {isExcluded && <XCircle className="h-4 w-4" />}
                                                    {!isReviewed && (idx + 1)}
                                                </div>

                                                {/* Contenido */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={cn(
                                                        "font-semibold text-sm mb-1",
                                                        isExcluded && "line-through opacity-60"
                                                    )}>
                                                        {ref.title}
                                                    </h3>

                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                                                        <span>
                                                            {ref.authors?.[0] || 'Sin autor'} {ref.authors && ref.authors.length > 1 ? 'et al.' : ''}
                                                        </span>
                                                        {ref.year && (
                                                            <>
                                                                <span>{'\u2022'}</span>
                                                                <span>{ref.year}</span>
                                                            </>
                                                        )}
                                                        {ref.screeningScore && (
                                                            <>
                                                                <span>{'\u2022'}</span>
                                                                <Badge variant="outline" className="text-xs h-5">
                                                                    Similitud: {(ref.screeningScore * 100).toFixed(1)}%
                                                                </Badge>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Badge de estado */}
                                                    {isIncluded && (
                                                        <Badge variant="default" className="bg-green-600 text-xs h-5">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Incluido
                                                        </Badge>
                                                    )}
                                                    {isExcluded && (
                                                        <Badge variant="default" className="bg-red-600 text-xs h-5">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Excluido{ref.exclusionReason ? `: ${ref.exclusionReason}` : ''}
                                                        </Badge>
                                                    )}
                                                    {!isReviewed && (
                                                        <Badge variant="outline" className="text-xs h-5 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600">
                                                            Pendiente de revisión
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Acciones */}
                                                {!isLocked && (
                                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                                        <Button
                                                            size="sm"
                                                            variant={isReviewed ? "outline" : "default"}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setPasteRefId(ref.id)
                                                                setSelectedFile(null)
                                                                setDecision(null)
                                                                setExclusionReason('')
                                                                setPasteDialogOpen(true)
                                                            }}
                                                            className={cn(
                                                                "h-7 text-[10px] px-2 py-1",
                                                                isIncluded && "border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950/60",
                                                                isExcluded && "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950/60"
                                                            )}
                                                        >
                                                            {!isReviewed && <><ClipboardPaste className="h-2.5 w-2.5 mr-0.5" />Revisar</>}
                                                            {isIncluded && <><CheckCircle className="h-2.5 w-2.5 mr-0.5" />Editar</>}
                                                            {isExcluded && <><XCircle className="h-2.5 w-2.5 mr-0.5" />Editar</>}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>



                        {/* Botón para proceder */}
                        {isLocked ? (
                            <div className="w-full text-center py-3 px-4 rounded-lg bg-green-50 border border-green-300 dark:!bg-green-950/60 dark:border-green-700">
                                <p className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center justify-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Revisión completada — {getSelectedArticles().length} artículos procesados
                                </p>
                            </div>
                        ) : (
                            <Button
                                onClick={handleProceed}
                                className="w-full"
                                size="lg"
                            >
                                Completar revisión y ver diagrama PRISMA ({getSelectedArticles().length} artículos)
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Diálogo para cargar resultados de PDF */}
            <Dialog open={pasteDialogOpen} onOpenChange={(open) => {
                if (!isSavingPaste) {
                    setPasteDialogOpen(open)
                    if (!open) {
                        setSelectedFile(null)
                        setPasteRefId(null)
                        setDecision(null)
                        setExclusionReason('')
                    }
                }
            }}>
                <DialogContent className="w-[95vw] max-w-[1400px] h-[90vh] flex flex-col p-0 gap-0 !max-w-none">                    <DialogHeader className="px-6 pt-4 pb-3 border-b bg-muted/30">
                    <DialogTitle className="text-lg">📄 Cargar Resultados del Texto Completo</DialogTitle>
                    <DialogDescription className="text-xs">
                        Sube el PDF del artículo
                    </DialogDescription>
                </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-row">
                        {/* COLUMNA IZQUIERDA: Gestión del Documento (80%) */}
                        <div className="w-[80%] border-r bg-muted/10 overflow-y-auto">
                            {pasteRefId && (() => {
                                const ref = recommendedArticles.find((r: any) => r.id === pasteRefId) ||
                                    sortedArticles.find((r: any) => r.id === pasteRefId)
                                if (!ref) return null

                                return (
                                    <div className="p-8">
                                        <div className="max-w-6xl mx-auto space-y-6">
                                            {/* Título */}
                                            <div>
                                                <h2 className="text-3xl font-bold tracking-tight leading-tight mb-4">
                                                    {ref.title}
                                                </h2>

                                                {/* Autores */}
                                                <div className="text-sm text-muted-foreground mb-4">
                                                    <span className="font-medium text-foreground">Autores:</span>{' '}
                                                    {ref.authors?.length > 0 ? ref.authors.join(', ') : 'Sin autores'}
                                                </div>

                                                {/* Badges */}
                                                <div className="flex flex-wrap gap-2">
                                                    {ref.year && (
                                                        <Badge variant="outline" className="text-xs">
                                                            📅 Año: {ref.year}
                                                        </Badge>
                                                    )}
                                                    {ref.journal && (
                                                        <Badge variant="outline" className="text-xs">
                                                            📚 {ref.journal}
                                                        </Badge>
                                                    )}
                                                    {ref.screeningScore && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            🎯 Similitud: {(ref.screeningScore * 100).toFixed(1)}%
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Resumen del artículo */}
                                            {ref.abstract && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-px bg-border flex-1" />
                                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                            Resumen
                                                        </h4>
                                                        <div className="h-px bg-border flex-1" />
                                                    </div>
                                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                                        <p className="text-sm leading-relaxed text-foreground/90 text-justify">
                                                            {ref.abstract}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>

                        {/* COLUMNA DERECHA: Información del Artículo (70%) */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6 space-y-6">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                    📎 Gestión del Documento
                                </h4>

                                {/* Área de carga de PDF */}
                                <div className="space-y-3">
                                    <label className="text-xs font-medium block text-muted-foreground">
                                        Archivo PDF del Artículo <span className="text-muted-foreground">(opcional)</span>
                                    </label>

                                    {!selectedFile ? (
                                        <label
                                            htmlFor="pdf-upload"
                                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/40 transition-colors"
                                        >
                                            <div className="flex flex-col items-center justify-center py-4">
                                                <Upload className="w-10 h-10 mb-2 text-muted-foreground" />
                                                <p className="mb-1 text-xs text-center px-2">
                                                    <span className="font-semibold">Click para seleccionar</span><br />o arrastra aquí
                                                </p>
                                                <p className="text-xs text-muted-foreground">PDF (máx 10MB)</p>
                                            </div>
                                            <input
                                                id="pdf-upload"
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,application/pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        if (file.size > 10 * 1024 * 1024) {
                                                            toast({
                                                                title: "Archivo muy grande",
                                                                description: "El archivo no debe superar 10MB",
                                                                variant: "destructive"
                                                            })
                                                            return
                                                        }
                                                        setSelectedFile(file)
                                                    }
                                                }}
                                            />
                                        </label>
                                    ) : (
                                        <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-950/20 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-green-900 dark:text-green-100 truncate">
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedFile(null)}
                                                    className="h-6 w-6 p-0 flex-shrink-0"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                Listo para subir
                                            </p>
                                        </div>
                                    )}

                                    <Alert className="py-1.5">
                                        <Info className="h-3 w-3" />
                                        <AlertDescription className="text-xs">
                                            El PDF se guardará para análisis posterior.
                                        </AlertDescription>
                                    </Alert>
                                </div>

                                {/* Campo de razón de exclusión */}
                                {decision === 'exclude' && (
                                    <div className="border-l-4 border-destructive bg-destructive/5 p-3 rounded-lg space-y-2">
                                        <label className="text-xs font-medium text-destructive block">
                                            ⚠️ Razón de Exclusión <span className="text-destructive">*</span>
                                        </label>
                                        <Textarea
                                            value={exclusionReason}
                                            onChange={(e) => setExclusionReason(e.target.value)}
                                            placeholder="Explica por qué excluyes este artículo (mínimo 10 caracteres)..."
                                            rows={4}
                                            className="resize-none text-xs bg-background"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {exclusionReason.length} caracteres • Mínimo 10
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 px-6 py-3 border-t bg-muted/30">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setPasteDialogOpen(false)
                                setSelectedFile(null)
                                setPasteRefId(null)
                                setDecision(null)
                                setExclusionReason('')
                            }}
                            disabled={isSavingPaste}
                            size="sm"
                        >
                            Cancelar
                        </Button>

                        {!decision ? (
                            <>
                                <Button
                                    variant="default"
                                    onClick={() => setDecision('include')}
                                    disabled={isSavingPaste}
                                    className="min-w-[110px]"
                                    size="sm"
                                >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                    Incluir
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setDecision('exclude')}
                                    disabled={isSavingPaste}
                                    className="min-w-[110px]"
                                    size="sm"
                                >
                                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                    Excluir
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => { setDecision(null); setExclusionReason('') }}
                                    disabled={isSavingPaste}
                                    size="sm"
                                >
                                    ← Cambiar decisión
                                </Button>
                                <Button
                                    variant={decision === 'include' ? 'default' : 'destructive'}
                                    onClick={() => handleSavePastedResults(decision)}
                                    disabled={
                                        isSavingPaste ||
                                        (decision === 'exclude' && exclusionReason.trim().length < 10)
                                    }
                                    className="min-w-[150px]"
                                    size="sm"
                                >
                                    {isSavingPaste ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            {decision === 'include' ? (
                                                <><CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Confirmar Inclusión</>
                                            ) : (
                                                <><XCircle className="h-3.5 w-3.5 mr-1.5" /> Confirmar Exclusión</>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
