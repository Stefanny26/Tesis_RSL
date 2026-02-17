"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface ImportReferencesButtonProps {
  readonly projectId: string
  readonly onImportSuccess?: (count: number) => void
  readonly variant?: "default" | "outline" | "ghost"
  readonly size?: "default" | "sm" | "lg"
  readonly showLabel?: boolean
}

interface ValidationWarning {
  type: string
  severity: 'critical' | 'warning' | 'info' | 'error'
  count: number
  message: string
  articles?: string[]
}

export function ImportReferencesButton({ 
  projectId, 
  onImportSuccess,
  variant = "default",
  size = "default",
  showLabel = true
}: Readonly<ImportReferencesButtonProps>) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([])
  const [showWarningsDialog, setShowWarningsDialog] = useState(false)
  const [importSummary, setImportSummary] = useState<{ imported: number; total: number; skipped: number } | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('files', file)

    setIsUploading(true)
    try {
      const result = await apiClient.importReferences(projectId, formData)
      
      const importedCount = result.data?.success || 0
      const failedCount = result.data?.failed || 0
      const duplicatesCount = result.data?.duplicates || 0
      const skippedValidation = result.data?.skippedValidation || 0
      const warnings: ValidationWarning[] = result.data?.warnings || []
      const bySource = result.data?.bySource || {}
      const duplicateDetection = result.data?.duplicateDetection
      
      // Construir mensaje por fuente
      const sourceDetails = Object.entries(bySource).map(([source, stats]: [string, any]) => {
        const parts = []
        if (stats.parsed > 0) parts.push(`${stats.parsed} encontradas`)
        if (stats.imported > 0) parts.push(`${stats.imported} importadas`)
        if (stats.duplicates > 0) parts.push(`${stats.duplicates} duplicadas`)
        return `${source}: ${parts.join(', ')}`
      }).join('\n')
      
      let duplicateMessage = ''
      if (duplicateDetection && duplicateDetection.stats.duplicates > 0) {
        duplicateMessage = `\n🔍 ${duplicateDetection.stats.duplicates} duplicados adicionales marcados`
      }
      
      // Si hay warnings de validación, mostrar el diálogo
      if (warnings.length > 0) {
        setValidationWarnings(warnings)
        setImportSummary({ 
          imported: importedCount, 
          total: importedCount + duplicatesCount + failedCount + skippedValidation,
          skipped: skippedValidation
        })
        setShowWarningsDialog(true)
      }

      // Toast principal de resultado
      const hasCriticalWarning = warnings.some(w => w.type === 'missing_abstract')
      
      toast({
        title: hasCriticalWarning 
          ? "⚠️ Referencias importadas con alertas" 
          : "✅ Referencias procesadas",
        description: sourceDetails 
          ? `${sourceDetails}${duplicateMessage}${skippedValidation > 0 ? `\n❌ ${skippedValidation} rechazadas por datos incompletos` : ''}` 
          : `${importedCount} importadas${duplicatesCount > 0 ? `, ${duplicatesCount} duplicados` : ''}${failedCount > 0 ? `, ${failedCount} fallidas` : ''}${skippedValidation > 0 ? `, ${skippedValidation} rechazadas` : ''}`,
        duration: hasCriticalWarning ? 10000 : 6000,
        variant: hasCriticalWarning ? "destructive" : "default"
      })

      if (onImportSuccess) {
        onImportSuccess(importedCount)
      }
    } catch (error: any) {
      toast({
        title: "Error al importar referencias",
        description: error.message || "No se pudieron importar las referencias",
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.ris,.bib,.txt,.nbib,.ciw,.json'
    input.onchange = handleFileSelect as any
    input.click()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'error': return 'bg-red-50 text-red-700 border-red-200'
      case 'warning': return 'bg-amber-50 text-amber-800 border-amber-300'
      case 'info': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">CRÍTICO</Badge>
      case 'error': return <Badge variant="destructive">ERROR</Badge>
      case 'warning': return <Badge className="bg-amber-500 hover:bg-amber-600">ADVERTENCIA</Badge>
      case 'info': return <Badge variant="outline">INFO</Badge>
      default: return <Badge variant="outline">{severity}</Badge>
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {showLabel && "Importando y validando..."}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {showLabel && "Importar Referencias"}
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Formatos: CSV, RIS, BibTeX
      </p>
      <p className="text-xs text-amber-600 dark:text-amber-400 text-center font-medium">
        Campos obligatorios: título, autores, año, revista/conferencia y DOI
      </p>
      <p className="text-xs text-muted-foreground text-center">
        Referencias sin estos datos serán rechazadas
      </p>

      {/* Diálogo de Alertas de Validación */}
      <Dialog open={showWarningsDialog} onOpenChange={setShowWarningsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Reporte de Validación de Referencias
            </DialogTitle>
            <DialogDescription>
              {importSummary && (
                <span className="block mt-1">
                  De <strong>{importSummary.total}</strong> referencias procesadas: <strong className="text-green-600">{importSummary.imported}</strong> importadas
                  {importSummary.skipped > 0 && <>, <strong className="text-red-600">{importSummary.skipped} rechazadas por datos incompletos</strong></>}
                </span>
              )}
              <span className="block mt-1 text-xs">
                Campos obligatorios: título, autores, año, revista/conferencia y DOI.
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-2">
            {validationWarnings
              .sort((a, b) => {
                const order: Record<string, number> = { critical: 0, error: 1, warning: 2, info: 3 }
                return (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
              })
              .map((warning, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(warning.severity)}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium flex-1">{warning.message}</p>
                  {getSeverityBadge(warning.severity)}
                </div>
                {warning.articles && warning.articles.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer hover:underline">
                      Ver artículos afectados ({warning.count})
                    </summary>
                    <ul className="mt-1 space-y-0.5 text-xs pl-4 list-disc">
                      {warning.articles.map((article, aIdx) => (
                        <li key={aIdx} className="truncate" title={article}>
                          {article.length > 80 ? article.substring(0, 80) + '...' : article}
                        </li>
                      ))}
                      {warning.count > warning.articles.length && (
                        <li className="text-muted-foreground italic">
                          ...y {warning.count - warning.articles.length} más
                        </li>
                      )}
                    </ul>
                  </details>
                )}
              </div>
            ))}

            {/* Nota especial si hay referencias rechazadas */}
            {validationWarnings.some(w => w.type === 'rejected') && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-lg mt-4">
                <h4 className="font-semibold text-red-900 text-sm flex items-center gap-1">
                  ❌ Referencias Rechazadas
                </h4>
                <p className="text-xs text-red-800 mt-1">
                  Las referencias sin <strong>título, autores, año, revista/conferencia o DOI</strong> fueron rechazadas
                  para evitar datos incompletos y duplicados futuros.
                </p>
                <p className="text-xs text-red-800 mt-2 font-medium">
                  Para importar estas referencias:
                </p>
                <ul className="text-xs text-red-800 mt-1 space-y-1 pl-4 list-decimal">
                  <li>Vuelve a descargar desde la base de datos incluyendo todos los campos</li>
                  <li>En Scopus/IEEE/WoS: verifica que la exportación incluya todos los metadatos</li>
                  <li>Completa los datos faltantes en el archivo antes de reimportarlo</li>
                </ul>
              </div>
            )}

            {/* Nota especial si hay abstracts faltantes */}
            {validationWarnings.some(w => w.type === 'missing_abstract') && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg mt-4">
                <h4 className="font-semibold text-amber-900 text-sm flex items-center gap-1">
                  ⚠️ Acción Recomendada: Abstract Faltante
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  El <strong>Abstract (Resumen)</strong> es el campo que la IA utiliza para clasificar los artículos
                  durante el cribado automático. Sin él, la clasificación automática no será precisa.
                </p>
                <p className="text-xs text-amber-800 mt-2 font-medium">
                  Opciones para resolver:
                </p>
                <ul className="text-xs text-amber-800 mt-1 space-y-1 pl-4 list-decimal">
                  <li>Buscar los artículos por DOI y copiar los abstracts manualmente</li>
                  <li>Volver a descargar incluyendo el campo "Abstract" en la exportación</li>
                  <li>En Scopus/IEEE: al exportar, asegúrate de incluir los abstracts</li>
                </ul>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowWarningsDialog(false)}>
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
