"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2, RefreshCw } from "lucide-react"
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
  const [regenerateFocus, setRegenerateFocus] = useState('')

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
        data.aiProvider
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
        title: "✅ Términos normalizados",
        description: `Se eliminaron duplicados y se validaron ${result.normalizedTerms?.tecnologia?.length || 0} términos tecnológicos`
      })

      toast({
        title: "✅ Criterios generados",
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

  const openRegenerateDialog = (type: 'inclusion' | 'exclusion') => {
    setRegenerateType(type)
    setRegenerateFocus('')
    setRegenerateDialogOpen(true)
  }

  const handleRegenerateCriteria = async () => {
    if (!regenerateType) return

    setIsRegenerating(true)
    try {
      toast({
        title: "Regenerando criterios...",
        description: `Enfoque personalizado: ${regenerateFocus || 'predeterminado'}`
      })

      // Llamar al endpoint con tipo específico y enfoque personalizado
      const result = await apiClient.generateInclusionExclusionCriteria(
        data.protocolTerms,
        data.pico,
        data.aiProvider,
        regenerateType,
        regenerateFocus
      )

      // Actualizar solo los criterios del tipo regenerado
      if (regenerateType === 'inclusion') {
        const inclusionCriteria = result.inclusionCriteria.map((item: any) => item.criterio)
        updateData({ inclusionCriteria })
      } else {
        const exclusionCriteria = result.exclusionCriteria.map((item: any) => item.criterio)
        updateData({ exclusionCriteria })
      }

      toast({
        title: "✅ Criterios regenerados",
        description: `Criterios de ${regenerateType === 'inclusion' ? 'Inclusión' : 'Exclusión'} actualizados con tu enfoque`
      })

      setRegenerateDialogOpen(false)
      setRegenerateFocus('')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron regenerar los criterios",
        variant: "destructive"
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">Criterios de Inclusión y Exclusión</h2>
        <p className="text-lg text-muted-foreground">
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Matriz de Criterios de Inclusión/Exclusión</CardTitle>
                <CardDescription>
                  Criterios estructurados por categoría según metodología PRISMA
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openRegenerateDialog('inclusion')}
                  disabled={isRegenerating}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar Inclusión
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openRegenerateDialog('exclusion')}
                  disabled={isRegenerating}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar Exclusión
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] bg-muted">Categoría</TableHead>
                  <TableHead className="bg-green-50 dark:bg-green-950/20">✅ Criterios de Inclusión</TableHead>
                  <TableHead className="bg-red-50 dark:bg-red-950/20">❌ Criterios de Exclusión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-semibold bg-muted">Cobertura Temática</TableCell>
                  <TableCell>
                    <Textarea
                      value={data.inclusionCriteria[0] || ''}
                      onChange={(e) => updateCriterion('inclusion', 0, e.target.value)}
                      placeholder="Ej: Estudios que mencionen explícitamente MongoDB..."
                      rows={3}
                      className="resize-none"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={data.exclusionCriteria[0] || ''}
                      onChange={(e) => updateCriterion('exclusion', 0, e.target.value)}
                      placeholder="Ej: Publicaciones donde estos términos no aparecen..."
                      rows={3}
                      className="resize-none"
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-semibold bg-muted">Tecnologías Abordadas</TableCell>
                  <TableCell>
                    <Textarea
                      value={data.inclusionCriteria[1] || ''}
                      onChange={(e) => updateCriterion('inclusion', 1, e.target.value)}
                      placeholder="Ej: Uso de Mongoose como ODM..."
                      rows={3}
                      className="resize-none"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={data.exclusionCriteria[1] || ''}
                      onChange={(e) => updateCriterion('exclusion', 1, e.target.value)}
                      placeholder="Ej: Investigaciones centradas en otros ODM..."
                      rows={3}
                      className="resize-none"
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-semibold bg-muted">Tipo de Estudio</TableCell>
                  <TableCell>
                    <Textarea
                      value={data.inclusionCriteria[2] || ''}
                      onChange={(e) => updateCriterion('inclusion', 2, e.target.value)}
                      placeholder="Ej: Estudios relevantes para el análisis de prácticas..."
                      rows={3}
                      className="resize-none"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={data.exclusionCriteria[2] || ''}
                      onChange={(e) => updateCriterion('exclusion', 2, e.target.value)}
                      placeholder="Ej: Artículos puramente descriptivos..."
                      rows={3}
                      className="resize-none"
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-semibold bg-muted">Tipo de Documento</TableCell>
                  <TableCell>
                    <Textarea
                      value={data.inclusionCriteria[3] || ''}
                      onChange={(e) => updateCriterion('inclusion', 3, e.target.value)}
                      placeholder="Ej: Artículos publicados en journals..."
                      rows={3}
                      className="resize-none"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={data.exclusionCriteria[3] || ''}
                      onChange={(e) => updateCriterion('exclusion', 3, e.target.value)}
                      placeholder="Ej: Trabajos fuera del ámbito académico técnico..."
                      rows={3}
                      className="resize-none"
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-semibold bg-muted">Rango Temporal</TableCell>
                  <TableCell>
                    <Textarea
                      value={data.inclusionCriteria[4] || ''}
                      onChange={(e) => updateCriterion('inclusion', 4, e.target.value)}
                      placeholder="Ej: Publicaciones entre 2019 y 2025..."
                      rows={3}
                      className="resize-none"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={data.exclusionCriteria[4] || ''}
                      onChange={(e) => updateCriterion('exclusion', 4, e.target.value)}
                      placeholder="Ej: Estudios anteriores a 2019..."
                      rows={3}
                      className="resize-none"
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-semibold bg-muted">Idioma</TableCell>
                  <TableCell>
                    <Textarea
                      value={data.inclusionCriteria[5] || ''}
                      onChange={(e) => updateCriterion('inclusion', 5, e.target.value)}
                      placeholder="Ej: Publicaciones en inglés..."
                      rows={3}
                      className="resize-none"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={data.exclusionCriteria[5] || ''}
                      onChange={(e) => updateCriterion('exclusion', 5, e.target.value)}
                      placeholder="Ej: Artículos en otros idiomas..."
                      rows={3}
                      className="resize-none"
                    />
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
            <DialogTitle>Regenerar Criterios de {regenerateType === 'inclusion' ? 'Inclusión' : 'Exclusión'}</DialogTitle>
            <DialogDescription>
              Describe en qué quieres centrar el análisis para los criterios de {regenerateType === 'inclusion' ? 'inclusión' : 'exclusión'}
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
