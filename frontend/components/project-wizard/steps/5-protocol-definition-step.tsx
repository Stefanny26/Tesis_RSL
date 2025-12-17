"use client"

import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2, Wrench, Microscope, Focus, Check, X, Pencil, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

export function ProtocolDefinitionStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)
  const [regenerateSection, setRegenerateSection] = useState<'tecnologia' | 'dominio' | 'focosTematicos' | null>(null)
  const [regenerateFocus, setRegenerateFocus] = useState('')
  
  // Estado para términos confirmados
  const [confirmedTerms, setConfirmedTerms] = useState<{
    tecnologia: Set<number>
    dominio: Set<number>
    tipoEstudio: Set<number>
    focosTematicos: Set<number>
  }>({
    tecnologia: new Set(),
    dominio: new Set(),
    tipoEstudio: new Set(),
    focosTematicos: new Set()
  })

  // Estado para términos descartados (marcados con X)
  const [discardedTerms, setDiscardedTerms] = useState<{
    tecnologia: Set<number>
    dominio: Set<number>
    tipoEstudio: Set<number>
    focosTematicos: Set<number>
  }>({
    tecnologia: new Set(),
    dominio: new Set(),
    tipoEstudio: new Set(),
    focosTematicos: new Set()
  })

  // Estado para términos en modo edición
  const [editingTerms, setEditingTerms] = useState<{
    tecnologia: Set<number>
    dominio: Set<number>
    tipoEstudio: Set<number>
    focosTematicos: Set<number>
  }>({
    tecnologia: new Set(),
    dominio: new Set(),
    tipoEstudio: new Set(),
    focosTematicos: new Set()
  })

  // Inicializar valores por defecto si no existen
  const protocolTerms = {
    tecnologia: data.protocolTerms?.tecnologia || [],
    dominio: data.protocolTerms?.dominio || [],
    tipoEstudio: data.protocolTerms?.tipoEstudio || [],
    focosTematicos: data.protocolTerms?.focosTematicos || []
  }

  // Efecto para filtrar términos descartados INMEDIATAMENTE cuando cambian
  useEffect(() => {
    const hasDiscarded = 
      discardedTerms.tecnologia.size > 0 ||
      discardedTerms.dominio.size > 0 ||
      discardedTerms.tipoEstudio.size > 0 ||
      discardedTerms.focosTematicos.size > 0
    
    if (hasDiscarded && protocolTerms.tecnologia.length > 0) {
      console.log('🗑️ Filtrando términos descartados:', {
        tecnologia: discardedTerms.tecnologia.size,
        dominio: discardedTerms.dominio.size,
        tipoEstudio: discardedTerms.tipoEstudio.size,
        focosTematicos: discardedTerms.focosTematicos.size
      })
      
      const filteredTerms = {
        tecnologia: protocolTerms.tecnologia.filter((_, i) => !discardedTerms.tecnologia.has(i)),
        dominio: protocolTerms.dominio.filter((_, i) => !discardedTerms.dominio.has(i)),
        tipoEstudio: protocolTerms.tipoEstudio.filter((_, i) => !discardedTerms.tipoEstudio.has(i)),
        focosTematicos: protocolTerms.focosTematicos.filter((_, i) => !discardedTerms.focosTematicos.has(i))
      }
      
      console.log('✅ Términos filtrados:', filteredTerms)
      
      updateData({ 
        protocolTerms: filteredTerms,
        protocolDefinition: {
          technologies: filteredTerms.tecnologia,
          applicationDomain: filteredTerms.dominio,
          studyType: filteredTerms.tipoEstudio,
          thematicFocus: filteredTerms.focosTematicos
        }
      })
    }
  }, [discardedTerms]) // Ejecutar cuando cambien los términos descartados

  const toggleConfirmTerm = (field: keyof typeof protocolTerms, index: number) => {
    setConfirmedTerms(prev => {
      const newSet = new Set(prev[field])
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return { ...prev, [field]: newSet }
    })
    
    // Si confirmamos un término, quitarlo de descartados
    setDiscardedTerms(prev => {
      const newSet = new Set(prev[field])
      newSet.delete(index)
      return { ...prev, [field]: newSet }
    })
  }

  const handleGenerateDefinitions = async () => {
    if (!data.pico.population || !data.pico.intervention) {
      toast({
        title: "Información incompleta",
        description: "Completa el marco PICO en el paso anterior",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      toast({
        title: "Generando definiciones...",
        description: "La IA está analizando tu proyecto para extraer términos específicos..."
      })

      // Llamar al nuevo endpoint específico para términos del protocolo
      const result = await apiClient.generateProtocolTerms(
        data.selectedTitle || data.projectName, // ← REGLA: Priorizar título RSL seleccionado
        data.projectDescription,
        data.pico,
        data.matrixIsNot,
        data.aiProvider
      )

      // Actualizar con los términos generados por la IA
      updateData({
        protocolTerms: {
          tecnologia: result.technologies || [],
          dominio: result.applicationDomain || [],
          tipoEstudio: result.studyType || [],
          focosTematicos: result.thematicFocus || []
        },
        protocolDefinition: {
          technologies: result.technologies || [],
          applicationDomain: result.applicationDomain || [],
          studyType: result.studyType || [],
          thematicFocus: result.thematicFocus || []
        }
      })

      toast({
        title: "✅ Definiciones generadas",
        description: `Términos específicos de "${data.projectName}" extraídos exitosamente`
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar las definiciones",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const updateArrayField = (field: keyof typeof protocolTerms, index: number, value: string) => {
    const newArray = [...protocolTerms[field]]
    newArray[index] = value
    updateData({
      protocolTerms: {
        ...protocolTerms,
        [field]: newArray
      }
    })
  }

  const addArrayItem = (field: keyof typeof protocolTerms) => {
    updateData({
      protocolTerms: {
        ...protocolTerms,
        [field]: [...protocolTerms[field], ""]
      }
    })
  }

  const removeArrayItem = (field: keyof typeof protocolTerms, index: number) => {
    updateData({
      protocolTerms: {
        ...protocolTerms,
        [field]: protocolTerms[field].filter((_, i) => i !== index)
      }
    })
  }

  const toggleDiscardTerm = (field: keyof typeof protocolTerms, index: number) => {
    setDiscardedTerms(prev => {
      const newSet = new Set(prev[field])
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return { ...prev, [field]: newSet }
    })
    
    // Si descartamos un término, quitarlo de confirmados
    setConfirmedTerms(prev => {
      const newSet = new Set(prev[field])
      newSet.delete(index)
      return { ...prev, [field]: newSet }
    })
  }

  const toggleEditMode = (field: keyof typeof protocolTerms, index: number) => {
    setEditingTerms(prev => {
      const newSet = new Set(prev[field])
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return { ...prev, [field]: newSet }
    })
  }

  const openRegenerateDialog = (section: 'tecnologia' | 'dominio' | 'focosTematicos') => {
    setRegenerateSection(section)
    setRegenerateFocus('')
    setRegenerateDialogOpen(true)
  }

  const handleRegenerateSection = async () => {
    if (!regenerateSection) return

    setIsRegenerating(true)
    try {
      toast({
        title: "Regenerando sección...",
        description: `Analizando con enfoque personalizado: ${regenerateFocus || 'predeterminado'}`
      })

      // Llamar al endpoint con contexto adicional
      const result = await apiClient.generateProtocolTerms(
        data.selectedTitle || data.projectName, // ← REGLA: Priorizar título RSL seleccionado
        data.projectDescription,
        data.pico,
        data.matrixIsNot,
        data.aiProvider,
        regenerateSection,
        regenerateFocus
      )

      // Actualizar solo la sección regenerada
      const sectionMap: Record<typeof regenerateSection, keyof typeof result> = {
        tecnologia: 'technologies',
        dominio: 'applicationDomain',
        focosTematicos: 'thematicFocus'
      }

      const resultKey = sectionMap[regenerateSection]
      const newProtocolTerms = {
        ...protocolTerms,
        [regenerateSection]: result[resultKey] || []
      }
      
      updateData({
        protocolTerms: newProtocolTerms,
        protocolDefinition: {
          technologies: newProtocolTerms.tecnologia,
          applicationDomain: newProtocolTerms.dominio,
          studyType: newProtocolTerms.tipoEstudio,
          thematicFocus: newProtocolTerms.focosTematicos
        }
      })

      // Limpiar estados de confirmación/descarte para la sección regenerada
      setConfirmedTerms(prev => ({ ...prev, [regenerateSection]: new Set() }))
      setDiscardedTerms(prev => ({ ...prev, [regenerateSection]: new Set() }))
      setEditingTerms(prev => ({ ...prev, [regenerateSection]: new Set() }))

      toast({
        title: "✅ Sección regenerada",
        description: "Los términos se han actualizado con tu enfoque personalizado"
      })

      setRegenerateDialogOpen(false)
      setRegenerateFocus('')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo regenerar la sección",
        variant: "destructive"
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">Definición de Términos del Protocolo</h2>
        <p className="text-lg text-muted-foreground">
          Rellena la parte inicial del protocolo con la definición de los términos clave
        </p>
      </div>

      {/* AI Generation Card */}
      {protocolTerms.tecnologia.length === 0 && (
        <Card className="border-primary/30 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle>Generar Definiciones con IA</CardTitle>
            <CardDescription>
              La IA analizará tu proyecto y generará términos específicos basados en tu tema, PICO y matriz Es/No Es. 
              Los términos estarán personalizados para "{data.projectName}" (no serán ejemplos genéricos).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateDefinitions}
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analizando "{data.projectName}"...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generar Términos Personalizados
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Technologies Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <CardTitle>🧩 Tecnología / Herramientas</CardTitle>
            </div>
            {protocolTerms.tecnologia.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openRegenerateDialog('tecnologia')}
                disabled={isRegenerating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar
              </Button>
            )}
          </div>
          <CardDescription>
            Tecnologías, herramientas y frameworks principales del estudio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {protocolTerms.tecnologia.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Genera definiciones con IA o agrega manualmente
            </p>
          )}
          {protocolTerms.tecnologia.map((tech, index) => {
            const isEditing = editingTerms.tecnologia.has(index)
            const isDiscarded = discardedTerms.tecnologia.has(index)
            const isConfirmed = confirmedTerms.tecnologia.has(index)
            
            return (
              <div key={index} className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={tech}
                    onChange={(e) => updateArrayField('tecnologia', index, e.target.value)}
                    placeholder="Ej: Object Document Mapping (ODM)"
                    rows={2}
                    disabled={!isEditing}
                    className={`resize-none transition-all pr-12 ${
                      isDiscarded
                        ? 'opacity-40 bg-red-50 dark:bg-red-950/20 line-through'
                        : isConfirmed
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                        : !isEditing
                        ? 'cursor-default bg-muted/50'
                        : ''
                    }`}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleEditMode('tecnologia', index)}
                    className="absolute top-1 right-1 h-7 w-7 p-0"
                    title={isEditing ? "Cancelar edición" : "Editar término"}
                  >
                    {isEditing ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    size="icon"
                    variant={isConfirmed ? "default" : "outline"}
                    onClick={() => toggleConfirmTerm('tecnologia', index)}
                    className={isConfirmed ? "bg-green-600 hover:bg-green-700" : ""}
                    title={isConfirmed ? "Término confirmado" : "Confirmar término"}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleDiscardTerm('tecnologia', index)}
                    className={isDiscarded ? "bg-red-100 text-red-700" : "text-red-600 hover:text-red-700 hover:bg-red-50"}
                    title={isDiscarded ? "Restaurar término" : "Descartar término"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
          <Button
            variant="outline"
            onClick={() => addArrayItem('tecnologia')}
            className="w-full"
          >
            + Agregar Tecnología
          </Button>
        </CardContent>
      </Card>

      {/* Application Domain Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-green-600" />
              <CardTitle>🧪 Dominio de Aplicación</CardTitle>
            </div>
            {protocolTerms.dominio.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openRegenerateDialog('dominio')}
                disabled={isRegenerating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar
              </Button>
            )}
          </div>
          <CardDescription>
            Contexto y ámbito de aplicación del estudio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {protocolTerms.dominio.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Genera definiciones con IA o agrega manualmente
            </p>
          )}
          {protocolTerms.dominio.map((domain, index) => {
            const isEditing = editingTerms.dominio.has(index)
            const isDiscarded = discardedTerms.dominio.has(index)
            const isConfirmed = confirmedTerms.dominio.has(index)
            
            return (
              <div key={index} className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={domain}
                    onChange={(e) => updateArrayField('dominio', index, e.target.value)}
                    placeholder="Ej: Applications (en el contexto de Node.js, MongoDB...)"
                    rows={2}
                    disabled={!isEditing}
                    className={`resize-none transition-all pr-12 ${
                      isDiscarded
                        ? 'opacity-40 bg-red-50 dark:bg-red-950/20 line-through'
                        : isConfirmed
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                        : !isEditing
                        ? 'cursor-default bg-muted/50'
                        : ''
                    }`}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleEditMode('dominio', index)}
                    className="absolute top-1 right-1 h-7 w-7 p-0"
                    title={isEditing ? "Cancelar edición" : "Editar término"}
                  >
                    {isEditing ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    size="icon"
                    variant={isConfirmed ? "default" : "outline"}
                    onClick={() => toggleConfirmTerm('dominio', index)}
                    className={isConfirmed ? "bg-green-600 hover:bg-green-700" : ""}
                    title={isConfirmed ? "Término confirmado" : "Confirmar término"}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleDiscardTerm('dominio', index)}
                    className={isDiscarded ? "bg-red-100 text-red-700" : "text-red-600 hover:text-red-700 hover:bg-red-50"}
                    title={isDiscarded ? "Restaurar término" : "Descartar término"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
          <Button
            variant="outline"
            onClick={() => addArrayItem('dominio')}
            className="w-full"
          >
            + Agregar Dominio
          </Button>
        </CardContent>
      </Card>

      {/* Thematic Focus Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Focus className="h-5 w-5 text-orange-600" />
              <CardTitle>🔍 Focos Temáticos</CardTitle>
            </div>
            {protocolTerms.focosTematicos.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openRegenerateDialog('focosTematicos')}
                disabled={isRegenerating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar
              </Button>
            )}
          </div>
          <CardDescription>
            Áreas temáticas y aspectos específicos a investigar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {protocolTerms.focosTematicos.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Genera definiciones con IA o agrega manualmente
            </p>
          )}
          {protocolTerms.focosTematicos.map((focus, index) => {
            const isEditing = editingTerms.focosTematicos.has(index)
            const isDiscarded = discardedTerms.focosTematicos.has(index)
            const isConfirmed = confirmedTerms.focosTematicos.has(index)
            
            return (
              <div key={index} className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={focus}
                    onChange={(e) => updateArrayField('focosTematicos', index, e.target.value)}
                    placeholder="Ej: Development Practices"
                    rows={2}
                    disabled={!isEditing}
                    className={`resize-none transition-all pr-12 ${
                      isDiscarded
                        ? 'opacity-40 bg-red-50 dark:bg-red-950/20 line-through'
                        : isConfirmed
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                        : !isEditing
                        ? 'cursor-default bg-muted/50'
                        : ''
                    }`}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleEditMode('focosTematicos', index)}
                    className="absolute top-1 right-1 h-7 w-7 p-0"
                    title={isEditing ? "Cancelar edición" : "Editar término"}
                  >
                    {isEditing ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    size="icon"
                    variant={isConfirmed ? "default" : "outline"}
                    onClick={() => toggleConfirmTerm('focosTematicos', index)}
                    className={isConfirmed ? "bg-green-600 hover:bg-green-700" : ""}
                    title={isConfirmed ? "Término confirmado" : "Confirmar término"}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleDiscardTerm('focosTematicos', index)}
                    className={isDiscarded ? "bg-red-100 text-red-700" : "text-red-600 hover:text-red-700 hover:bg-red-50"}
                    title={isDiscarded ? "Restaurar término" : "Descartar término"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
          <Button
            variant="outline"
            onClick={() => addArrayItem('focosTematicos')}
            className="w-full"
          >
            + Agregar Foco Temático
          </Button>
        </CardContent>
      </Card>

      {/* Regenerate Dialog */}
      <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Regenerar Sección</DialogTitle>
            <DialogDescription>
              Describe en qué quieres centrar el análisis para {' '}
              {regenerateSection === 'tecnologia' && 'Tecnología / Herramientas'}
              {regenerateSection === 'dominio' && 'Dominio de Aplicación'}
              {regenerateSection === 'focosTematicos' && 'Focos Temáticos'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="focus">
                Enfoque específico (opcional)
              </Label>
              <Textarea
                id="focus"
                placeholder="Ej: Quiero centrarme más en aspectos de rendimiento y escalabilidad..."
                value={regenerateFocus}
                onChange={(e) => setRegenerateFocus(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Si dejas esto en blanco, se usará el análisis predeterminado
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
              onClick={handleRegenerateSection}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar Sección
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
