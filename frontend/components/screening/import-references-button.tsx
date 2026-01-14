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
      
      // Backend retorna: { success: true, data: { success: N, failed: N, duplicates: N } }
      const importedCount = result.data?.success || 0
      const failedCount = result.data?.failed || 0
      const duplicatesCount = result.data?.duplicates || 0
      
      const details = []
      if (importedCount > 0) details.push(`${importedCount} importadas`)
      if (failedCount > 0) details.push(`${failedCount} fallidas`)
      if (duplicatesCount > 0) details.push(`${duplicatesCount} duplicadas`)
      
      toast({
        title: "✅ Referencias procesadas",
        description: details.join(', '),
        duration: 4000
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
    input.accept = '.csv,.ris,.bib'
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
        📋 Formatos: CSV, RIS, BIB
      </p>
      <p className="text-xs text-amber-600 dark:text-amber-400 text-center font-medium">
        ⚠️ Debes tener una cuenta creada en la base de datos
      </p>
    </div>
  )
}
