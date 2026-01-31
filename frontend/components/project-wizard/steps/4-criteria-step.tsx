"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2, RefreshCw, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

// Helper function para obtener nombre del proveedor de IA
const getProviderName = (provider: 'chatgpt' | 'gemini') => {
  const names = {
    chatgpt: 'ChatGPT',
    gemini: 'Gemini'
  }
  return names[provider]
}

export function CriteriaStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)
  const [regenerateType, setRegenerateType] = useState<'inclusion' | 'exclusion' | null>(null)
  const [regenerateCategory, setRegenerateCategory] = useState<number | null>(null) // Índice de la categoría
  const [regenerateFocus, setRegenerateFocus] = useState('')

  // Nombres de las categorías (nivel protocolo PRISMA)
  // Nombres de las categorías
  const categoryNames = [
    'Cobertura Temática',
    'Tecnologías Abordadas',
    'Tipo de Estudio',
    'Tipo de Documento',
    'Rango Temporal',
    'Idioma'
  ]

  const handleGenerateCriteria = async () => {
    if (!data.protocolTerms || (!data.protocolTerms.tecnologia?.length && !data.protocolTerms.dominio?.length)) {
      toast({
        title: "Términos del protocolo requeridos",
        description: "Debes completar el Paso 4 (Definición) primero para generar los términos del protocolo",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      toast({
        title: "Generando criterios...",
        description: `Usando ${getProviderName(data.aiProvider)} con términos confirmados del protocolo...`
      })

      // Llamar al nuevo endpoint con términos normalizados y validados
      const result = await apiClient.generateInclusionExclusionCriteria(
        data.protocolTerms,
        data.pico,
        data.aiProvider,
        undefined, // specificType
        undefined, // customFocus
        undefined, // categoryIndex
        undefined, // categoryName
        data.yearStart,
        data.yearEnd,
        data.selectedTitle // ← REGLA: Usar título RSL seleccionado para derivar criterios
      )

      // Backend returns structured criteria with categories
      // Convert to array format expected by UI
      const inclusionCriteria = result.inclusionCriteria.map((item: any) => item.criterio)
      const exclusionCriteria = result.exclusionCriteria.map((item: any) => item.criterio)

      updateData({
        inclusionCriteria,
        exclusionCriteria
      })

      toast({
        title: "Términos normalizados",
        description: `Se eliminaron duplicados y se validaron ${result.normalizedTerms?.tecnologia?.length || 0} términos tecnológicos`
      })

      toast({
        title: "Criterios generados",
        description: "Criterios de inclusión y exclusión creados basándose en tu proyecto"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar los criterios",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const updateCriterion = (type: 'inclusion' | 'exclusion', index: number, value: string) => {
    if (type === 'inclusion') {
      const newCriteria = [...data.inclusionCriteria]
      newCriteria[index] = value
      updateData({ inclusionCriteria: newCriteria })
    } else {
      const newCriteria = [...data.exclusionCriteria]
      newCriteria[index] = value
      updateData({ exclusionCriteria: newCriteria })
    }
  }

  const openRegenerateDialog = (type: 'inclusion' | 'exclusion', categoryIndex: number) => {
    setRegenerateType(type)
    setRegenerateCategory(categoryIndex)
    setRegenerateFocus('')
    setRegenerateDialogOpen(true)
  }

  const handleRegenerateCriteria = async () => {
    if (!regenerateType || regenerateCategory === null) return

    setIsRegenerating(true)
    try {
      const categoryName = categoryNames[regenerateCategory]
      
      toast({
        title: "Regenerando criterio...",
        description: `${categoryName} - ${regenerateType === 'inclusion' ? 'Inclusión' : 'Exclusión'}`
      })

      // Llamar al endpoint con categoría específica
      const result = await apiClient.generateInclusionExclusionCriteria(
        data.protocolTerms,
        data.pico,
        data.aiProvider,
        regenerateType,
        regenerateFocus || undefined,
        regenerateCategory,
        categoryName,
        data.yearStart,
        data.yearEnd,
        data.selectedTitle // ← REGLA: Usar título RSL seleccionado
      )

      // Si el backend retorna un solo criterio (isSingleCriterion = true)
      if (result.isSingleCriterion && result.singleCriterion) {
        if (regenerateType === 'inclusion') {
          const inclusionCriteria = [...data.inclusionCriteria]
          inclusionCriteria[regenerateCategory] = result.singleCriterion
          updateData({ inclusionCriteria })
        } else {
          const exclusionCriteria = [...data.exclusionCriteria]
          exclusionCriteria[regenerateCategory] = result.singleCriterion
          updateData({ exclusionCriteria })
        }
      } else {
        // Fallback: usar el formato antiguo si el backend no retorna isSingleCriterion
        if (regenerateType === 'inclusion') {
          const inclusionCriteria = [...data.inclusionCriteria]
          const newCriterio = result.inclusionCriteria?.[regenerateCategory]?.criterio || 
                             result.inclusionCriteria?.[0]?.criterio || ''
          inclusionCriteria[regenerateCategory] = newCriterio
          updateData({ inclusionCriteria })
        } else {
          const exclusionCriteria = [...data.exclusionCriteria]
          const newCriterio = result.exclusionCriteria?.[regenerateCategory]?.criterio || 
                             result.exclusionCriteria?.[0]?.criterio || ''
          exclusionCriteria[regenerateCategory] = newCriterio
          updateData({ exclusionCriteria })
        }
      }

      toast({
        title: "Criterio regenerado",
        description: `${categoryName} actualizado exitosamente`
      })

      setRegenerateDialogOpen(false)
      setRegenerateFocus('')
      setRegenerateCategory(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo regenerar el criterio",
        variant: "destructive"
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-2xl font-bold">Criterios de Inclusión y Exclusión</h2>
        <p className="text-base text-muted-foreground">
          Define los criterios para seleccionar estudios relevantes según metodología PRISMA
        </p>
      </div>

      {/* AI Generation Card */}
      <Card className="border-primary/30 bg-card">
        <CardHeader>
          <CardTitle>Generar Criterios con IA</CardTitle>
          <CardDescription>
            La IA analizará tu marco PICO y generará criterios de inclusión/exclusión estructurados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerateCriteria}
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generando criterios...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generar Criterios I/E
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Criteria Table */}
      {(data.inclusionCriteria.length > 0 || data.exclusionCriteria.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Criterios de Inclusión/Exclusión</CardTitle>
            <CardDescription>
              Criterios estructurados por categoría según metodología PRISMA. Usa el botón de regenerar en cada celda para actualizar criterios individuales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] bg-muted/50 text-foreground font-semibold">Categoría</TableHead>
                  <TableHead className="bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-100 font-semibold">✅ Criterios de Inclusión</TableHead>
                  <TableHead className="bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-100 font-semibold">❌ Criterios de Exclusión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-semibold bg-muted/50 text-foreground">Cobertura Temática</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          value={data.inclusionCriteria[0] || ''}
                          onChange={(e) => updateCriterion('inclusion', 0, e.target.value)}
                          placeholder="Ej: Estudios que mencionen explícitamente MongoDB..."
                          rows={3}
                          className="resize-none pr-10"
                        />
                        <Pencil className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRegenerateDialog('inclusion', 2)}
                        disabled={isRegenerating}
                        className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          value={data.exclusionCriteria[0] || ''}
                          onChange={(e) => updateCriterion('exclusion', 0, e.target.value)}
                          placeholder="Ej: Publicaciones donde estos términos no aparecen..."
                          rows={3}
                          className="resize-none pr-10"
                        />
                        <Pencil className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRegenerateDialog('exclusion', 0)}
                        disabled={isRegenerating}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-semibold bg-muted/50 text-foreground">Tecnologías Abordadas</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          value={data.inclusionCriteria[1] || ''}
                          onChange={(e) => updateCriterion('inclusion', 1, e.target.value)}
                          placeholder="Ej: Uso de Mongoose como ODM..."
                          rows={3}
                          className="resize-none pr-10"
                        />
                        <Pencil className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRegenerateDialog('inclusion', 1)}
                        disabled={isRegenerating}
                        className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          value={data.exclusionCriteria[1] || ''}
                          onChange={(e) => updateCriterion('exclusion', 1, e.target.value)}
                          placeholder="Ej: Investigaciones centradas en otros ODM..."
                          rows={3}
                          className="resize-none pr-10"
                        />
                        <Pencil className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRegenerateDialog('exclusion', 1)}
                        disabled={isRegenerating}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-semibold bg-muted/50 text-foreground">Tipo de Estudio</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          value={data.inclusionCriteria[2] || ''}
                          onChange={(e) => updateCriterion('inclusion', 2, e.target.value)}
                          placeholder="Ej: Estudios relevantes para el análisis de prácticas..."
                          rows={3}
                          className="resize-none pr-10"
                        />
                        <Pencil className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRegenerateDialog('inclusion', 2)}
                        disabled={isRegenerating}
                        className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          value={data.exclusionCriteria[5] || ''}
                          onChange={(e) => updateCriterion('exclusion', 5, e.target.value)}
                          placeholder="Ej: Artículos en otros idiomas..."
                          rows={3}
                          className="resize-none pr-10"
                        />
                        <Pencil className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRegenerateDialog('exclusion', 2)}
                        disabled={isRegenerating}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-semibold bg-muted/50 text-foreground">Tipo de Documento</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          value={data.inclusionCriteria[3] || ''}
                          onChange={(e) => updateCriterion('inclusion', 3, e.target.value)}
                          placeholder="Ej: Publicaciones académicas rigurosas..."
                          rows={3}
                          className="resize-none pr-10"
                        />
                        <Pencil className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRegenerateDialog('inclusion', 3)}
                        disabled={isRegenerating}
                        className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Textarea
                        value={data.exclusionCriteria[3] || ''}
                        onChange={(e) => updateCriterion('exclusion', 3, e.target.value)}
                        placeholder="Ej: Trabajos fuera del ámbito académico técnico..."
                        rows={3}
                        className="resize-none"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRegenerateDialog('exclusion', 3)}
                        disabled={isRegenerating}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-semibold bg-muted/50 text-foreground">Rango Temporal</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          value={data.inclusionCriteria[4] || ''}
                          onChange={(e) => updateCriterion('inclusion', 4, e.target.value)}
                          placeholder={`Ej: Trabajos publicados desde ${data.yearStart || '20XX'}...`}
                          rows={3}
                          className="resize-none pr-10"
                        />
                        <Pencil className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRegenerateDialog('inclusion', 4)}
                        disabled={isRegenerating}
                        className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          value={data.exclusionCriteria[4] || ''}
                          onChange={(e) => updateCriterion('exclusion', 4, e.target.value)}
                          placeholder={`Ej: Publicaciones anteriores a ${data.yearStart || '20XX'}...`}
                          rows={3}
                          className="resize-none pr-10"
                        />
                        <Pencil className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRegenerateDialog('exclusion', 4)}
                        disabled={isRegenerating}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-semibold bg-muted/50 text-foreground">Idioma</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          value={data.inclusionCriteria[5] || ''}
                          onChange={(e) => updateCriterion('inclusion', 5, e.target.value)}
                          placeholder="Ej: Artículos en inglés o español..."
                          rows={3}
                          className="resize-none pr-10"
                        />
                        <Pencil className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRegenerateDialog('inclusion', 5)}
                        disabled={isRegenerating}
                        className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          value={data.exclusionCriteria[3] || ''}
                          onChange={(e) => updateCriterion('exclusion', 3, e.target.value)}
                          placeholder="Ej: Publicaciones sin revisión por pares..."
                          rows={3}
                          className="resize-none pr-10"
                        />
                        <Pencil className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRegenerateDialog('exclusion', 5)}
                        disabled={isRegenerating}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Regenerate Dialog */}
      <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              Regenerar: {regenerateCategory === null ? '' : categoryNames[regenerateCategory]} - {regenerateType === 'inclusion' ? 'Inclusión' : 'Exclusión'}
            </DialogTitle>
            <DialogDescription>
              Describe en qué quieres centrar el análisis para este criterio específico (opcional)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="criteria-focus">
                Enfoque específico (opcional)
              </Label>
              <Textarea
                id="criteria-focus"
                placeholder={`Ej: Quiero criterios más ${regenerateType === 'inclusion' ? 'inclusivos enfocados en estudios empíricos' : 'restrictivos para excluir literatura gris'}...`}
                value={regenerateFocus}
                onChange={(e) => setRegenerateFocus(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Si dejas esto en blanco, se usará el análisis predeterminado basado en tu protocolo
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRegenerateDialogOpen(false)}
              disabled={isRegenerating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRegenerateCriteria}
              disabled={isRegenerating}
              className={regenerateType === 'inclusion' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
