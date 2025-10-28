"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileSpreadsheet, Download } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ReferenceExportProps {
  totalReferences: number
  includedReferences: number
}

export function ReferenceExport({ totalReferences, includedReferences }: ReferenceExportProps) {
  const [format, setFormat] = useState("bibtex")
  const [filter, setFilter] = useState("included")
  const { toast } = useToast()

  const handleExport = () => {
    const count = filter === "all" ? totalReferences : filter === "included" ? includedReferences : 0

    toast({
      title: "Exportación iniciada",
      description: `Exportando ${count} referencias en formato ${format.toUpperCase()}`,
    })

    setTimeout(() => {
      toast({
        title: "Exportación completada",
        description: "El archivo está listo para descargar",
      })
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Exportar Referencias
        </CardTitle>
        <CardDescription>Exporta tus referencias bibliográficas en diferentes formatos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Formato de Exportación</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bibtex">BibTeX (.bib)</SelectItem>
              <SelectItem value="ris">RIS (.ris)</SelectItem>
              <SelectItem value="endnote">EndNote (.enw)</SelectItem>
              <SelectItem value="csv">CSV (.csv)</SelectItem>
              <SelectItem value="excel">Excel (.xlsx)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Referencias a Exportar</Label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas ({totalReferences})</SelectItem>
              <SelectItem value="included">Solo incluidas ({includedReferences})</SelectItem>
              <SelectItem value="excluded">Solo excluidas ({totalReferences - includedReferences})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleExport} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Exportar Referencias
        </Button>
      </CardContent>
    </Card>
  )
}
