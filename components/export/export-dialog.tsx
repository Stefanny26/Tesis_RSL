"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { FileDown, FileText, FileSpreadsheet, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExportDialogProps {
  projectId: string
  projectTitle: string
}

export function ExportDialog({ projectId, projectTitle }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState("pdf")
  const [includeProtocol, setIncludeProtocol] = useState(true)
  const [includeReferences, setIncludeReferences] = useState(true)
  const [includePrisma, setIncludePrisma] = useState(true)
  const [includeArticle, setIncludeArticle] = useState(true)
  const { toast } = useToast()

  const handleExport = () => {
    // Mock export functionality
    toast({
      title: "Exportación iniciada",
      description: `Generando archivo ${format.toUpperCase()} de "${projectTitle}"`,
    })
    setOpen(false)

    // Simulate download
    setTimeout(() => {
      toast({
        title: "Exportación completada",
        description: "El archivo está listo para descargar",
      })
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar Proyecto</DialogTitle>
          <DialogDescription>Selecciona el formato y contenido a exportar</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Formato de Exportación</Label>
            <RadioGroup value={format} onValueChange={setFormat}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer font-normal">
                  <FileText className="h-4 w-4" />
                  PDF - Documento completo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="docx" id="docx" />
                <Label htmlFor="docx" className="flex items-center gap-2 cursor-pointer font-normal">
                  <FileText className="h-4 w-4" />
                  DOCX - Microsoft Word
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="latex" id="latex" />
                <Label htmlFor="latex" className="flex items-center gap-2 cursor-pointer font-normal">
                  <FileText className="h-4 w-4" />
                  LaTeX - Formato académico
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bibtex" id="bibtex" />
                <Label htmlFor="bibtex" className="flex items-center gap-2 cursor-pointer font-normal">
                  <FileSpreadsheet className="h-4 w-4" />
                  BibTeX - Referencias bibliográficas
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Content Selection */}
          <div className="space-y-3">
            <Label>Contenido a Incluir</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="protocol" checked={includeProtocol} onCheckedChange={(c) => setIncludeProtocol(!!c)} />
                <Label htmlFor="protocol" className="cursor-pointer font-normal">
                  Protocolo de investigación (PICO, criterios)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="references"
                  checked={includeReferences}
                  onCheckedChange={(c) => setIncludeReferences(!!c)}
                />
                <Label htmlFor="references" className="cursor-pointer font-normal">
                  Referencias y resultados de cribado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="prisma" checked={includePrisma} onCheckedChange={(c) => setIncludePrisma(!!c)} />
                <Label htmlFor="prisma" className="cursor-pointer font-normal">
                  Checklist PRISMA y diagrama de flujo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="article" checked={includeArticle} onCheckedChange={(c) => setIncludeArticle(!!c)} />
                <Label htmlFor="article" className="cursor-pointer font-normal">
                  Artículo completo (última versión)
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
