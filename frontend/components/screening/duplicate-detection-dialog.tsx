"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle2, Copy, Loader2, Trash2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface DuplicateGroup {
  id: string
  references: Array<{
    id: string
    title: string
    authors: string[]
    year: number
    doi?: string
    source?: string
    database?: string
  }>
  similarity: number
  reason: string
}

interface DuplicateDetectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  duplicateGroups: DuplicateGroup[]
  onKeepReference: (groupId: string, referenceId: string) => Promise<void>
  isProcessing?: boolean
}

export function DuplicateDetectionDialog({
  open,
  onOpenChange,
  duplicateGroups,
  onKeepReference,
  isProcessing = false
}: DuplicateDetectionDialogProps) {
  const { toast } = useToast()
  const [processingGroups, setProcessingGroups] = useState<Set<string>>(new Set())
  const [selectedReferences, setSelectedReferences] = useState<Record<string, string>>({})

  const handleSelectReference = (groupId: string, referenceId: string) => {
    setSelectedReferences(prev => ({
      ...prev,
      [groupId]: referenceId
    }))
  }

  const handleResolveGroup = async (groupId: string) => {
    const selectedId = selectedReferences[groupId]
    if (!selectedId) {
      toast({
        title: "⚠️ Selección requerida",
        description: "Por favor, selecciona cuál referencia deseas mantener",
        variant: "destructive"
      })
      return
    }

    setProcessingGroups(prev => new Set(prev).add(groupId))
    try {
      await onKeepReference(groupId, selectedId)
      toast({
        title: "✅ Grupo resuelto",
        description: "Los duplicados han sido eliminados correctamente"
      })
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "No se pudo resolver el grupo de duplicados",
        variant: "destructive"
      })
    } finally {
      setProcessingGroups(prev => {
        const newSet = new Set(prev)
        newSet.delete(groupId)
        return newSet
      })
    }
  }

  const handleResolveAll = async () => {
    // Verificar que todas las selecciones estén hechas
    const pendingGroups = duplicateGroups.filter(g => !selectedReferences[g.id])
    if (pendingGroups.length > 0) {
      toast({
        title: "⚠️ Selecciones incompletas",
        description: `Faltan ${pendingGroups.length} grupos por resolver`,
        variant: "destructive"
      })
      return
    }

    // Resolver todos los grupos
    for (const group of duplicateGroups) {
      await handleResolveGroup(group.id)
    }
  }

  const totalDuplicates = duplicateGroups.reduce((sum, g) => sum + (g.references.length - 1), 0)
  const resolvedGroups = duplicateGroups.filter(g => processingGroups.has(g.id)).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-orange-600" />
            Duplicados Detectados
          </DialogTitle>
          <DialogDescription>
            Se encontraron {duplicateGroups.length} grupos de duplicados ({totalDuplicates} referencias duplicadas)
          </DialogDescription>
        </DialogHeader>

        {isProcessing ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Analizando duplicados...</span>
          </div>
        ) : duplicateGroups.length === 0 ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>¡Excelente!</strong> No se encontraron duplicados en tu proyecto.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{duplicateGroups.length}</div>
                <div className="text-xs text-muted-foreground">Grupos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{totalDuplicates}</div>
                <div className="text-xs text-muted-foreground">Duplicados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(selectedReferences).length}
                </div>
                <div className="text-xs text-muted-foreground">Seleccionados</div>
              </div>
            </div>

            {/* Alerta de instrucciones */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Instrucciones:</strong> Para cada grupo, selecciona la referencia que deseas mantener. 
                Las demás serán marcadas como duplicadas y eliminadas.
              </AlertDescription>
            </Alert>

            {/* Grupos de duplicados */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {duplicateGroups.map((group, groupIndex) => (
                  <Card key={group.id} className="border-2 border-orange-200">
                    <CardHeader className="pb-3 bg-orange-50/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Grupo {groupIndex + 1}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-orange-100 text-orange-700">
                            {group.references.length} referencias
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {(group.similarity * 100).toFixed(0)}% similar
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-xs mt-1">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        {group.reason}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      {group.references.map((ref) => {
                        const isSelected = selectedReferences[group.id] === ref.id
                        return (
                          <div
                            key={ref.id}
                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                              isSelected
                                ? "border-green-500 bg-green-50"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => handleSelectReference(group.id, ref.id)}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleSelectReference(group.id, ref.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 space-y-1">
                                <h4 className="font-medium text-sm leading-tight">{ref.title}</h4>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span>{ref.authors.slice(0, 3).join(", ")}</span>
                                  <span>•</span>
                                  <span>{ref.year}</span>
                                  {ref.doi && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono">DOI: {ref.doi}</span>
                                    </>
                                  )}
                                  {ref.source && (
                                    <>
                                      <span>•</span>
                                      <Badge variant="outline" className="text-xs">
                                        {ref.source}
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        )
                      })}

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => handleResolveGroup(group.id)}
                        disabled={!selectedReferences[group.id] || processingGroups.has(group.id)}
                      >
                        {processingGroups.has(group.id) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Resolviendo...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Resolver Grupo
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {duplicateGroups.length > 0 && (
            <Button
              onClick={handleResolveAll}
              disabled={Object.keys(selectedReferences).length !== duplicateGroups.length || processingGroups.size > 0}
            >
              {processingGroups.size > 0 ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Resolver Todos
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
