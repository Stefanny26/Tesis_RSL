"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, FileText, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImportReferencesWizardProps {
  readonly onImportSuccess?: (fileData: {
    filename: string
    format: 'csv' | 'ris' | 'bib'
    recordCount: number
    data: any[]
  }) => void
  readonly variant?: "default" | "outline" | "ghost"
  readonly size?: "default" | "sm" | "lg"
  readonly showLabel?: boolean
  readonly databaseName?: string
}

export function ImportReferencesWizard({ 
  onImportSuccess,
  variant = "default",
  size = "sm",
  showLabel = true,
  databaseName = "esta base"
}: Readonly<ImportReferencesWizardProps>) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const records = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const record: any = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ''
      })
      records.push(record)
    }

    return records
  }

  const parseRIS = (text: string): any[] => {
    const records: any[] = []
    const entries = text.split('\n\n').filter(e => e.trim())

    for (const entry of entries) {
      const record: any = {}
      const lines = entry.split('\n')

      for (const line of lines) {
        const match = line.match(/^([A-Z]{2})\s*-\s*(.*)$/)
        if (match) {
          const [, tag, value] = match
          switch (tag) {
            case 'TI':
            case 'T1':
              record.title = value
              break
            case 'AU':
            case 'A1':
              if (!record.authors) record.authors = []
              record.authors.push(value)
              break
            case 'PY':
            case 'Y1':
              record.year = value
              break
            case 'AB':
              record.abstract = value
              break
            case 'JO':
            case 'T2':
              record.journal = value
              break
            case 'DO':
              record.doi = value
              break
          }
        }
      }

      if (record.title) {
        records.push(record)
      }
    }

    return records
  }

  const parseBIB = (text: string): any[] => {
    const records: any[] = []
    const entries = text.match(/@\w+\{[^@]+\}/g) || []

    for (const entry of entries) {
      const record: any = {}
      
      const titleMatch = entry.match(/title\s*=\s*[{"](.*?)["}]/i)
      if (titleMatch) record.title = titleMatch[1]

      const authorMatch = entry.match(/author\s*=\s*[{"](.*?)["}]/i)
      if (authorMatch) record.authors = authorMatch[1].split(' and ')

      const yearMatch = entry.match(/year\s*=\s*[{"]*(\d{4})["}]*/i)
      if (yearMatch) record.year = yearMatch[1]

      const journalMatch = entry.match(/journal\s*=\s*[{"](.*?)["}]/i)
      if (journalMatch) record.journal = journalMatch[1]

      const doiMatch = entry.match(/doi\s*=\s*[{"](.*?)["}]/i)
      if (doiMatch) record.doi = doiMatch[1]

      if (record.title) {
        records.push(record)
      }
    }

    return records
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    try {
      const text = await file.text()
      const extension = file.name.split('.').pop()?.toLowerCase()

      let records: any[] = []
      let format: 'csv' | 'ris' | 'bib' = 'csv'

      switch (extension) {
        case 'csv':
          records = parseCSV(text)
          format = 'csv'
          break
        case 'ris':
          records = parseRIS(text)
          format = 'ris'
          break
        case 'bib':
        case 'bibtex':
          records = parseBIB(text)
          format = 'bib'
          break
        default:
          throw new Error(`Formato no soportado: ${extension}`)
      }

      if (records.length === 0) {
        throw new Error('No se encontraron referencias en el archivo')
      }

      toast({
        title: "✅ Referencias procesadas",
        description: `Se procesaron ${records.length} referencias de ${databaseName}`,
        duration: 3000
      })

      if (onImportSuccess) {
        onImportSuccess({
          filename: file.name,
          format,
          recordCount: records.length,
          data: records
        })
      }

    } catch (error: any) {
      toast({
        title: "Error al procesar archivo",
        description: error.message || "No se pudo procesar el archivo",
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsProcessing(false)
      e.target.value = ''
    }
  }

  const handleClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.ris,.bib,.bibtex'
    input.onchange = handleFileSelect as any
    input.click()
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {showLabel && "Procesando..."}
        </>
      ) : (
        <>
          <Upload className="h-4 w-4 mr-2" />
          {showLabel && "Cargar"}
        </>
      )}
    </Button>
  )
}
