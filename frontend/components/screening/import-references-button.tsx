"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

interface ImportReferencesButtonProps {
  readonly projectId: string
  readonly onImportSuccess?: (count: number) => void
  readonly variant?: "default" | "outline" | "ghost"
  readonly size?: "default" | "sm" | "lg"
  readonly showLabel?: boolean
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('files', file)

    setIsUploading(true)
    try {
      const result = await apiClient.importReferences(projectId, formData)
      
      // Backend retorna estructura mejorada con bySource y duplicateDetection
      const importedCount = result.data?.success || 0
      const failedCount = result.data?.failed || 0
      const duplicatesCount = result.data?.duplicates || 0
      const bySource = result.data?.bySource || {}
      const duplicateDetection = result.data?.duplicateDetection
      
      // Construir mensaje detallado con estadísticas por fuente
      const sourceDetails = Object.entries(bySource).map(([source, stats]: [string, any]) => {
        const parts = []
        if (stats.parsed > 0) parts.push(`${stats.parsed} encontradas`)
        if (stats.imported > 0) parts.push(`${stats.imported} importadas`)
        if (stats.duplicates > 0) parts.push(`${stats.duplicates} duplicadas`)
        return `${source}: ${parts.join(', ')}`
      }).join('\n')
      
      // Mensaje de duplicados avanzados si hay detección
      let duplicateMessage = ''
      if (duplicateDetection && duplicateDetection.stats.duplicates > 0) {
        duplicateMessage = `\n\n🔍 Detección avanzada: ${duplicateDetection.stats.duplicates} duplicados adicionales marcados`
      }
      
      const details = []
      if (importedCount > 0) details.push(`${importedCount} referencias importadas`)
      if (duplicatesCount > 0) details.push(`${duplicatesCount} duplicados evitados`)
      if (failedCount > 0) details.push(`${failedCount} fallidas`)
      
      toast({
        title: "✅ Referencias procesadas",
        description: sourceDetails ? `${sourceDetails}${duplicateMessage}` : details.join(', '),
        duration: 6000
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
      // Limpiar el input para permitir subir el mismo archivo nuevamente
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
            {showLabel && "Importando..."}
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
        Debes tener una cuenta creada en la base de datos
      </p>
    </div>
  )
}
