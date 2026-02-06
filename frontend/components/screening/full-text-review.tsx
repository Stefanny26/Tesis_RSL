"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, CheckCircle, AlertCircle, Eye, ClipboardCheck, Brain, ClipboardPaste, Save, Loader2 } from "lucide-react"
import type { Reference } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ReferenceDetailDialog } from "./reference-detail-dialog"
import { FullTextEvaluationForm } from "./full-text-evaluation-form"
import { cn } from "@/lib/utils"
import { ApiClient } from "@/lib/api-client"

interface FullTextReviewProps {
  references: Reference[]
  projectId: string
  onReferencesChange?: () => void
}

export function FullTextReview({ references, projectId, onReferencesChange }: FullTextReviewProps) {
  const { toast } = useToast()
  const [extractingIds, setExtractingIds] = useState<Set<string>>(new Set())
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null)
  const [evaluationReference, setEvaluationReference] = useState<Reference | null>(null)
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false)
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false)
  const [pasteRefId, setPasteRefId] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [isSavingPaste, setIsSavingPaste] = useState(false)

  const referencesWithResults = references.filter(r => r.fullTextAvailable).length
  const progress = references.length > 0 ? (referencesWithResults / references.length) * 100 : 0

  const handleOpenEvaluation = (ref: Reference) => {
    setEvaluationReference(ref)
    setEvaluationDialogOpen(true)
  }

  const handleExtractRQS = async (ref: Reference) => {
    setExtractingIds(prev => new Set(prev).add(ref.id))

    try {
      const apiClient = new ApiClient()

      toast({
        title: "Analizando con IA...",
        description: "Extrayendo datos estructurados de los resultados para RQS"
      })

      await apiClient.extractSingleRQS(projectId, ref.id)

      toast({
        title: "Análisis completado",
        description: "Los datos RQS han sido extraídos exitosamente"
      })

      if (onReferencesChange) {
        onReferencesChange()
      }
    } catch (error: any) {
      console.error('Error extrayendo RQS:', error)
      toast({
        title: "Error en extracción",
        description: error.message || "No se pudo analizar los resultados",
        variant: "destructive"
      })
    } finally {
      setExtractingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(ref.id)
        return newSet
      })
    }
  }

  const handleSavePastedResults = async () => {
    if (!pasteRefId || !pasteText.trim()) return
    setIsSavingPaste(true)
    try {
      const apiClient = new ApiClient()
      const blob = new Blob([pasteText], { type: 'text/plain' })
      const file = new File([blob], `resultados-${pasteRefId}.txt`, { type: 'text/plain' })

      toast({ title: "Guardando resultados...", description: "Subiendo texto al servidor" })
      await apiClient.uploadPdf(pasteRefId, file)

      toast({ title: "✅ Resultados guardados", description: "Texto cargado exitosamente" })

      if (onReferencesChange) onReferencesChange()

      setPasteDialogOpen(false)
      setPasteText('')
      setPasteRefId(null)
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

  const handleEvaluationComplete = () => {
    toast({
      title: "✅ Evaluación completada",
      description: "La referencia ha sido evaluada exitosamente"
    })
  }

  return (
    <div className="space-y-6">
      {/* Aviso informativo */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                💡 Carga de Resultados del Texto Completo
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Copia y pega los <strong>resultados clave del estudio</strong> (objetivos, metodología, hallazgos principales, conclusiones) directamente desde el artículo.
                Estos datos se utilizarán para el análisis y generación del artículo final.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barra de progreso general */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progreso de Carga de Resultados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {referencesWithResults} de {references.length} artículos con resultados cargados
            </span>
            <span className="font-semibold">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Lista de referencias */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {references.map((ref) => {
            const hasResults = !!ref.fullTextAvailable

            return (
              <Card key={ref.id} className={cn(
                "transition-all",
                hasResults && "border-green-200 bg-green-50/50"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icono de estado */}
                    <div className={cn(
                      "rounded-full p-2 flex-shrink-0",
                      hasResults ? "bg-green-100" : "bg-gray-100"
                    )}>
                      {hasResults ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-2 line-clamp-2">
                        {ref.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span>
                          {ref.authors.length > 0
                            ? ref.authors.slice(0, 2).join(', ') + (ref.authors.length > 2 ? ' et al.' : '')
                            : 'Sin autores'}
                        </span>
                        {ref.year && (
                          <>
                            <span>{'\u2022'}</span>
                            <span>{ref.year}</span>
                          </>
                        )}
                        {ref.source && (
                          <>
                            <span>{'\u2022'}</span>
                            <span>{ref.source}</span>
                          </>
                        )}
                      </div>

                      {/* Estado de los resultados */}
                      <div className="flex items-center gap-2">
                        {hasResults ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resultados Cargados
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Sin Resultados
                          </Badge>
                        )}

                        {ref.doi && (
                          <Badge variant="outline" className="text-xs">
                            DOI: {ref.doi}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPasteRefId(ref.id)
                          setPasteText('')
                          setPasteDialogOpen(true)
                        }}
                      >
                        <ClipboardPaste className="h-4 w-4 mr-2" />
                        {hasResults ? 'Cambiar Resultados' : 'Cargar Resultados'}
                      </Button>

                      {hasResults && (
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleExtractRQS(ref)}
                          disabled={extractingIds.has(ref.id)}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          {extractingIds.has(ref.id) ? 'Analizando...' : 'Analizar con IA'}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleOpenEvaluation(ref)}
                      >
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Evaluar
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedReference(ref)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ScrollArea>

      {/* Diálogo de detalles */}
      {selectedReference && (
        <ReferenceDetailDialog
          reference={selectedReference}
          open={!!selectedReference}
          onOpenChange={(open) => !open && setSelectedReference(null)}
          onStatusChange={() => { if (onReferencesChange) onReferencesChange() }}
        />
      )}

      {/* Diálogo de evaluación de texto completo */}
      {evaluationReference && (
        <FullTextEvaluationForm
          open={evaluationDialogOpen}
          onOpenChange={setEvaluationDialogOpen}
          reference={evaluationReference}
          projectId={projectId}
          onEvaluationComplete={handleEvaluationComplete}
        />
      )}

      {/* Diálogo para pegar resultados de texto completo */}
      <Dialog open={pasteDialogOpen} onOpenChange={(open) => {
        if (!isSavingPaste) {
          setPasteDialogOpen(open)
          if (!open) { setPasteText(''); setPasteRefId(null) }
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Cargar Resultados del Texto Completo</DialogTitle>
            <DialogDescription>
              Copia y pega los resultados clave del artículo: objetivos, metodología, hallazgos principales y conclusiones.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={"Pega aquí los resultados del artículo...\n\nEjemplo:\n- Objetivo: ...\n- Metodología: ...\n- Resultados principales: ...\n- Conclusiones: ..."}
              rows={14}
              className="resize-none font-mono text-sm"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              {pasteText.length > 0 ? `${pasteText.length} caracteres` : 'Sin contenido'}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setPasteDialogOpen(false); setPasteText(''); setPasteRefId(null) }}
              disabled={isSavingPaste}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSavePastedResults}
              disabled={isSavingPaste || !pasteText.trim()}
            >
              {isSavingPaste ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Resultados
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}