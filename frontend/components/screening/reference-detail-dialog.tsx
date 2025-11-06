"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Reference } from "@/lib/types"
import { CheckCircle, XCircle, Copy, ExternalLink } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ReferenceDetailDialogProps {
  reference: Reference
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (id: string, status: Reference["status"]) => void
}

export function ReferenceDetailDialog({ reference, open, onOpenChange, onStatusChange }: ReferenceDetailDialogProps) {
  const [notes, setNotes] = useState(reference.notes || "")

  const handleStatusChange = (status: Reference["status"]) => {
    onStatusChange(reference.id, status)
    onOpenChange(false)
  }

  const scorePercentage = reference.screeningScore ? reference.screeningScore * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl pr-8">{reference.title}</DialogTitle>
          <DialogDescription>
            {reference.authors.join(", ")} ({reference.year})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Score */}
          {reference.screeningScore && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Puntuación de Relevancia (IA)</Label>
                <span className="text-sm font-semibold">{scorePercentage.toFixed(0)}%</span>
              </div>
              <Progress value={scorePercentage} />
              <p className="text-xs text-muted-foreground">
                Basado en similitud semántica con el protocolo PICO y criterios de inclusión
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Fuente</Label>
              <p>{reference.source}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Año</Label>
              <p>{reference.year}</p>
            </div>
            {reference.doi && (
              <div className="col-span-2">
                <Label className="text-muted-foreground">DOI</Label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs">{reference.doi}</p>
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(reference.doi!)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`https://doi.org/${reference.doi}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <Label>Resumen</Label>
            <div className="bg-muted p-4 rounded-md text-sm leading-relaxed">{reference.abstract}</div>
          </div>

          {/* Review Info */}
          {reference.reviewedBy && (
            <div className="bg-muted/50 p-4 rounded-md space-y-2">
              <Label>Información de Revisión</Label>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Revisado por:</span> {reference.reviewedBy}
                </p>
                <p>
                  <span className="text-muted-foreground">Fecha:</span>{" "}
                  {reference.reviewedAt?.toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas de Revisión</Label>
            <Textarea
              id="notes"
              placeholder="Agrega notas sobre esta referencia..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-2">
            <Label>Estado Actual:</Label>
            <Badge
              variant={
                reference.status === "included"
                  ? "default"
                  : reference.status === "excluded"
                    ? "destructive"
                    : "secondary"
              }
            >
              {reference.status === "included"
                ? "Incluido"
                : reference.status === "excluded"
                  ? "Excluido"
                  : reference.status === "duplicate"
                    ? "Duplicado"
                    : "Pendiente"}
            </Badge>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {reference.status === "pending" && (
            <>
              <Button variant="destructive" onClick={() => handleStatusChange("excluded")}>
                <XCircle className="mr-2 h-4 w-4" />
                Excluir
              </Button>
              <Button onClick={() => handleStatusChange("included")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Incluir
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
