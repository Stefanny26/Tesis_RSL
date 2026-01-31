"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Upload, CheckCircle, AlertCircle, Eye, Trash2, Download, ClipboardCheck, Brain } from "lucide-react"
import type { Reference } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ReferenceDetailDialog } from "./reference-detail-dialog"
import { FullTextEvaluationForm } from "./full-text-evaluation-form"
import { cn } from "@/lib/utils"
import { ApiClient } from "@/lib/api-client"

interface FullTextReviewProps {
  references: Reference[]
  projectId: string
  onReferencesChange?: () => void // Callback para recargar referencias
}

export function FullTextReview({ references, projectId, onReferencesChange }: FullTextReviewProps) {
  const { toast } = useToast()
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set())
  const [extractingIds, setExtractingIds] = useState<Set<string>>(new Set())
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({})
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null)
  const [evaluationReference, setEvaluationReference] = useState<Reference | null>(null)
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false)

  // Cargar PDFs existentes al montar el componente y cuando cambien las referencias
  useEffect(() => {
    const initialPdfUrls: Record<string, string> = {}
    references.forEach(ref => {
      if (ref.fullTextAvailable && ref.fullTextUrl) {
        const fullUrl = ref.fullTextUrl.startsWith('http') 
          ? ref.fullTextUrl 
          : `${process.env.NEXT_PUBLIC_API_URL}${ref.fullTextUrl}`
        initialPdfUrls[ref.id] = fullUrl
      }
    })
    setPdfUrls(initialPdfUrls)
    console.log(`📁 Cargados ${Object.keys(initialPdfUrls).length} archivos de resultados existentes`, {
      totalRefs: references.length,
      withFullText: references.filter(r => r.fullTextAvailable).length,
      pdfUrls: Object.keys(initialPdfUrls)
    })
  }, [references])

  const handleFileUpload = async (referenceId: string, file: File) => {
    const validTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
      toast({
        title: "Archivo inválido",
        description: "Se permiten archivos PDF, TXT, DOC o DOCX con los resultados del estudio",
        variant: "destructive"
      })
      return
    }

    setUploadingIds(prev => new Set(prev).add(referenceId))

    try {
      const apiClient = new ApiClient()
      
      console.log(`📤 Subiendo archivo de resultados para referencia ${referenceId}...`)
      const result = await apiClient.uploadPdf(referenceId, file)
      
      // Construir URL completa para visualización
      const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}${result.pdfUrl}`
      
      setPdfUrls(prev => ({
        ...prev,
        [referenceId]: pdfUrl
      }))

      console.log(`✅ PDF subido exitosamente: ${pdfUrl}`)

      toast({
        title: "✅ Resultados cargados",
        description: `Archivo "${file.name}" subido exitosamente`
      })

      // Llamar al callback para recargar referencias desde el servidor
      if (onReferencesChange) {
        onReferencesChange()
      }
    } catch (error: any) {
      console.error('❌ Error subiendo PDF:', error)
      toast({
        title: "Error al subir PDF",
        description: error.message || "No se pudo subir el archivo",
        variant: "destructive"
      })
    } finally {
      setUploadingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(referenceId)
        return newSet
      })
    }
  }

  const handleRemovePdf = async (referenceId: string) => {
    if (!pdfUrls[referenceId]) return

    try {
      const apiClient = new ApiClient()
      
      console.log(`🗑️  Eliminando PDF de referencia ${referenceId}...`)
      await apiClient.deletePdf(referenceId)
      
      setPdfUrls(prev => {
        const newUrls = { ...prev }
        delete newUrls[referenceId]
        return newUrls
      })

      console.log(`✅ PDF eliminado exitosamente`)

      toast({
        title: "PDF eliminado",
        description: "El archivo ha sido removido"
      })

      // Llamar al callback para recargar referencias desde el servidor
      if (onReferencesChange) {
        onReferencesChange()
      }
    } catch (error: any) {
      console.error('❌ Error eliminando PDF:', error)
      toast({
        title: "Error al eliminar PDF",
        description: error.message || "No se pudo eliminar el archivo",
        variant: "destructive"
      })
    }
  }

  const referencesWithPdf = Object.keys(pdfUrls).length
  const progress = references.length > 0 ? (referencesWithPdf / references.length) * 100 : 0

  const handleOpenEvaluation = (ref: Reference) => {
    setEvaluationReference(ref)
    setEvaluationDialogOpen(true)
  }

  const handleExtractRQS = async (ref: Reference) => {
    if (!pdfUrls[ref.id]) {
      toast({
        title: "Archivo no disponible",
        description: "Primero debes cargar los resultados del texto completo",
        variant: "destructive"
      })
      return
    }

    setExtractingIds(prev => new Set(prev).add(ref.id))

    try {
      const apiClient = new ApiClient()
      
      toast({
        title: "🤖 Analizando archivo con IA...",
        description: "Extrayendo datos estructurados de los resultados para RQS"
      })

      await apiClient.extractSingleRQS(projectId, ref.id)

      toast({
        title: "✅ Análisis completado",
        description: "Los datos RQS han sido extraídos exitosamente"
      })

      if (onReferencesChange) {
        onReferencesChange()
      }
    } catch (error: any) {
      console.error('❌ Error extrayendo RQS:', error)
      toast({
        title: "Error en extracción",
        description: error.message || "No se pudo analizar el PDF",
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

  const handleEvaluationComplete = () => {
    // Aquí podrías recargar las referencias o actualizar el estado
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
                Para evitar archivos pesados, en lugar de cargar el PDF completo, carga un archivo con los <strong>resultados clave del estudio</strong> (objetivos, metodología, hallazgos principales, conclusiones). 
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
              {referencesWithPdf} de {references.length} artículos con resultados cargados
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
            const hasPdf = !!pdfUrls[ref.id]
            const isUploading = uploadingIds.has(ref.id)

            return (
              <Card key={ref.id} className={cn(
                "transition-all",
                hasPdf && "border-green-200 bg-green-50/50"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icono de estado */}
                    <div className={cn(
                      "rounded-full p-2 flex-shrink-0",
                      hasPdf ? "bg-green-100" : "bg-gray-100"
                    )}>
                      {hasPdf ? (
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
                            <span>•</span>
                            <span>{ref.year}</span>
                          </>
                        )}
                        {ref.source && (
                          <>
                            <span>•</span>
                            <span>{ref.source}</span>
                          </>
                        )}
                      </div>

                      {/* Estado de los resultados */}
                      <div className="flex items-center gap-2">
                        {hasPdf ? (
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
                      {!hasPdf ? (
                        <label>
                          <Input
                            type="file"
                            accept="application/pdf,.txt,.doc,.docx"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleFileUpload(ref.id, file)
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            disabled={isUploading}
                            variant="outline"
                            asChild
                          >
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              {isUploading ? 'Subiendo...' : 'Cargar Resultados'}
                            </span>
                          </Button>
                        </label>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(pdfUrls[ref.id], '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Ver Archivo
                          </Button>
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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemovePdf(ref.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
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
    </div>
  )
}
