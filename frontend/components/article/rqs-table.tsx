"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Circle, 
  Edit,
  Trash2,
  RefreshCw
} from "lucide-react"
import { RQSEntry } from "@/lib/api-client"

interface RQSTableProps {
  entries: RQSEntry[]
  onEdit?: (entry: RQSEntry) => void
  onDelete?: (entryId: number) => void
  onValidate?: (entryId: number) => void
  onExport?: () => void
  loading?: boolean
}

export function RQSTable({ 
  entries, 
  onEdit, 
  onDelete, 
  onValidate, 
  onExport,
  loading = false 
}: RQSTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const getStudyTypeBadge = (type?: string) => {
    const colors: Record<string, string> = {
      empirical: "bg-blue-500",
      case_study: "bg-green-500",
      experiment: "bg-purple-500",
      simulation: "bg-orange-500",
      review: "bg-pink-500",
      other: "bg-gray-500"
    }
    
    return (
      <Badge className={colors[type || 'other'] || colors.other}>
        {type?.replace('_', ' ') || 'Unknown'}
      </Badge>
    )
  }

  const getContextBadge = (context?: string) => {
    const colors: Record<string, string> = {
      industrial: "bg-indigo-500",
      enterprise: "bg-cyan-500",
      academic: "bg-teal-500",
      experimental: "bg-amber-500",
      mixed: "bg-violet-500",
      other: "bg-gray-500"
    }
    
    return (
      <Badge className={colors[context || 'other'] || colors.other}>
        {context || 'Unknown'}
      </Badge>
    )
  }

  const getRQBadge = (relation?: string) => {
    if (relation === 'yes') return <Badge className="bg-green-600">Yes</Badge>
    if (relation === 'partial') return <Badge className="bg-yellow-600">Partial</Badge>
    if (relation === 'no') return <Badge className="bg-red-600">No</Badge>
    return <Badge variant="outline">N/A</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando datos RQS...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay datos RQS</h3>
            <p className="text-muted-foreground">
              Primero debe extraer los datos RQS de las referencias incluidas
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tabla RQS - Datos Extraídos</CardTitle>
            <CardDescription>
              {entries.length} estudios incluidos • {entries.filter(e => e.validated).length} validados
            </CardDescription>
          </div>
          {onExport && (
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Autor / Año</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tecnología</TableHead>
                <TableHead>Contexto</TableHead>
                <TableHead className="text-center">RQ1</TableHead>
                <TableHead className="text-center">RQ2</TableHead>
                <TableHead className="text-center">RQ3</TableHead>
                <TableHead className="text-center">Validado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <>
                  <TableRow 
                    key={entry.id}
                    className={expandedRow === entry.id ? "bg-muted/50" : ""}
                  >
                    <TableCell className="font-mono text-sm">{entry.id}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{entry.author}</p>
                        <p className="text-sm text-muted-foreground">({entry.year})</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStudyTypeBadge(entry.studyType)}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{entry.technology || 'N/A'}</span>
                    </TableCell>
                    <TableCell>{getContextBadge(entry.context)}</TableCell>
                    <TableCell className="text-center">{getRQBadge(entry.rq1Relation)}</TableCell>
                    <TableCell className="text-center">{getRQBadge(entry.rq2Relation)}</TableCell>
                    <TableCell className="text-center">{getRQBadge(entry.rq3Relation)}</TableCell>
                    <TableCell className="text-center">
                      {entry.validated ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedRow(expandedRow === entry.id ? null : entry.id)}
                        >
                          {expandedRow === entry.id ? 'Ocultar' : 'Ver más'}
                        </Button>
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(entry.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRow === entry.id && (
                    <TableRow>
                      <TableCell colSpan={10} className="bg-muted/30">
                        <div className="p-4 space-y-4">
                          {entry.title && (
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Título:</h4>
                              <p className="text-sm">{entry.title}</p>
                            </div>
                          )}
                          {entry.keyEvidence && (
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Evidencia Clave:</h4>
                              <p className="text-sm">{entry.keyEvidence}</p>
                            </div>
                          )}
                          {entry.limitations && (
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Limitaciones:</h4>
                              <p className="text-sm">{entry.limitations}</p>
                            </div>
                          )}
                          {entry.rqNotes && (
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Notas RQs:</h4>
                              <p className="text-sm">{entry.rqNotes}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                            <span>Extracción: {entry.extractionMethod}</span>
                            {entry.qualityScore && <span>Calidad: {entry.qualityScore}</span>}
                            {entry.extractedAt && (
                              <span>Extraído: {new Date(entry.extractedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                          {!entry.validated && onValidate && (
                            <Button 
                              onClick={() => onValidate(entry.id)}
                              size="sm"
                              className="mt-2"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Marcar como Validado
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
