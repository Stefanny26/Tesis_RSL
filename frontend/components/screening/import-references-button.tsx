"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

interface ImportReferencesButtonProps {
  projectId: string
  onImportComplete?: (count: number) => void
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  showLabel?: boolean
  buttonText?: string // Texto personalizable del botón
  databaseName?: string // Para mostrar en el toast
}

export function ImportReferencesButton({
  projectId,
  onImportComplete,
  variant = "outline",
  size = "sm",
  showLabel = true,
  buttonText = "Subir",
  databaseName
}: ImportReferencesButtonProps) {
  const { toast } = useToast()
  const [isImporting, setIsImporting] = useState(false)

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.bib,.ris,.csv,.txt,.nbib,.ciw'
    input.multiple = true
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files || files.length === 0) return

      setIsImporting(true)
      try {
        const formData = new FormData()
        Array.from(files).forEach(file => {
          formData.append('files', file)
        })

        const dbInfo = databaseName ? ` de ${databaseName}` : ''
        toast({
          title: "📤 Importando referencias...",
          description: `Procesando ${files.length} archivo(s)${dbInfo}...`
        })

        const result = await apiClient.importReferences(projectId, formData)

        toast({
          title: "✅ Importación exitosa",
          description: `${result.imported} referencias importadas correctamente${dbInfo}`
        })

        // Notificar al componente padre
        if (onImportComplete) {
          onImportComplete(result.imported)
        }
      } catch (error: any) {
        toast({
          title: "❌ Error al importar",
          description: error.message || "No se pudieron importar las referencias",
          variant: "destructive"
        })
      } finally {
        setIsImporting(false)
      }
    }
    input.click()
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleImport}
      disabled={isImporting}
    >
      {isImporting ? (
        <Loader2 className={showLabel ? "mr-2 h-4 w-4 animate-spin" : "h-4 w-4 animate-spin"} />
      ) : (
        <Upload className={showLabel ? "mr-2 h-4 w-4" : "h-4 w-4"} />
      )}
      {showLabel && (isImporting ? "Importando..." : buttonText)}
    </Button>
  )
}
