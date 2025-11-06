"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Reference } from "@/lib/types"
import { Eye, CheckCircle, XCircle } from "lucide-react"
import { ReferenceDetailDialog } from "./reference-detail-dialog"

interface ReferenceTableProps {
  references: Reference[]
  onStatusChange: (id: string, status: Reference["status"]) => void
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

const statusConfig = {
  pending: { label: "Pendiente", variant: "secondary" as const, color: "text-yellow-600" },
  included: { label: "Incluido", variant: "default" as const, color: "text-green-600" },
  excluded: { label: "Excluido", variant: "destructive" as const, color: "text-red-600" },
  duplicate: { label: "Duplicado", variant: "outline" as const, color: "text-gray-600" },
}

export function ReferenceTable({ references, onStatusChange, selectedIds, onSelectionChange }: ReferenceTableProps) {
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null)

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === references.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(references.map((ref) => ref.id))
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground"
    if (score >= 0.8) return "text-green-600 font-semibold"
    if (score >= 0.6) return "text-yellow-600 font-semibold"
    return "text-red-600 font-semibold"
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox checked={selectedIds.length === references.length} onCheckedChange={toggleSelectAll} />
              </TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Autores</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Score IA</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {references.map((reference) => {
              const statusInfo = statusConfig[reference.status]
              return (
                <TableRow key={reference.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(reference.id)}
                      onCheckedChange={() => toggleSelection(reference.id)}
                    />
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="font-medium line-clamp-2">{reference.title}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {typeof reference.authors === 'string' 
                      ? reference.authors.split(',').slice(0, 2).join(', ') + (reference.authors.split(',').length > 2 ? ' et al.' : '')
                      : Array.isArray(reference.authors) 
                        ? reference.authors.slice(0, 2).join(", ") + (reference.authors.length > 2 ? " et al." : "")
                        : reference.authors}
                  </TableCell>
                  <TableCell>{reference.year}</TableCell>
                  <TableCell className="text-sm">{reference.source}</TableCell>
                  <TableCell>
                    {reference.screeningScore ? (
                      <span className={getScoreColor(reference.screeningScore)}>
                        {(reference.screeningScore * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedReference(reference)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {reference.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onStatusChange(reference.id, "included")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onStatusChange(reference.id, "excluded")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {selectedReference && (
        <ReferenceDetailDialog
          reference={selectedReference}
          open={!!selectedReference}
          onOpenChange={(open) => !open && setSelectedReference(null)}
          onStatusChange={onStatusChange}
        />
      )}
    </>
  )
}
