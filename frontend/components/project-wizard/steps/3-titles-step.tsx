"use client"

import { useState, useCallback, useRef } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, RefreshCw, CheckCircle2, Pencil, Save } from "lucide-react"
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

export function TitlesStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [editingIndex, setEditingIndex] = useState<number>(-1)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [translatingIndex, setTranslatingIndex] = useState<number>(-1)
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set())
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleGenerateTitles = async () => {
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
        title: "Generando títulos...",
        description: `Usando ${getProviderName(data.aiProvider)} para crear 5 opciones bilingües...`
      })

      const result = await apiClient.generateTitles(
        data.matrixIsNot,
        data.pico,
        data.aiProvider
      )

      console.log('Respuesta del backend:', result)
      console.log('Títulos recibidos:', result?.titles)

      if (result && result.titles) {
        // Procesar títulos con traducción automática
        const processedTitles = result.titles.map((t: any) => {
          const justificationText = t.reasoning || t.justification || ""
          
          return {
            title: t.title, // Título en inglés
            spanishTitle: t.spanishTitle || t.title, // Traducción al español
            justification: justificationText,
            spanishJustification: t.spanishJustification || justificationText,
            cochraneCompliance: t.cochraneCompliance || "partial",
            components: t.components || {
              population: "unspecified",
              intervention: "unspecified",
              comparator: null,
              outcome: "unspecified"
            },
            wordCount: t.wordCount || 0
          }
        })

        console.log('Títulos procesados:', processedTitles)

        updateData({ generatedTitles: processedTitles })

        toast({
          title: "Títulos generados",
          description: `${processedTitles.length} opciones bilingües creadas.`
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar los títulos",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectTitle = async (index: number) => {
    setSelectedIndex(index)
    const selectedTitle = data.generatedTitles[index].title
    updateData({ selectedTitle })
    
    // Crear proyecto de borrador cuando se selecciona un título (si no existe aún)
    if (!data.projectId && selectedTitle && data.projectName && data.projectDescription) {
      await createProjectDraft(selectedTitle)
    }
  }
  
  // Función para crear proyecto como borrador temprano en el proceso
  const createProjectDraft = async (selectedTitle: string) => {
    try {
      console.log('📝 Creando proyecto como borrador...')
      
      const projectData = {
        title: selectedTitle,
        description: data.projectDescription,
        researchArea: data.researchArea,
        status: 'draft' // Estado borrador para permitir edición
      }

      const result = await apiClient.createProject(projectData)
      
      if (result.success && result.data?.project?.id) {
        const projectId = result.data.project.id
        console.log('✅ Proyecto borrador creado con ID:', projectId)
        
        // Actualizar wizard data con el projectId
        updateData({ 
          projectId: projectId, 
          lastSaved: new Date() 
        })
        
        toast({
          title: "Proyecto creado",
          description: "Tu proyecto se ha guardado como borrador y se actualizará automáticamente"
        })
        
        // Guardar protocolo inicial
        setTimeout(async () => {
          try {
            await saveInitialProtocolData(projectId)
          } catch (error) {
            console.error('Error guardando protocolo inicial:', error)
          }
        }, 500)
        
      } else {
        throw new Error('No se recibió respuesta válida del servidor')
      }
    } catch (error: any) {
      console.error('Error creando proyecto borrador:', error)
      toast({
        title: "Error creando proyecto",
        description: error.message || "No se pudo crear el proyecto. Se guardará localmente.",
        variant: "destructive"
      })
    }
  }

  // Función para guardar protocolo inicial con los datos actuales  
  const saveInitialProtocolData = async (projectId: string) => {
    try {
      const protocolData = {
        proposedTitle: data.selectedTitle,
        population: data.pico.population,
        intervention: data.pico.intervention,
        comparison: data.pico.comparison || '',
        outcomes: data.pico.outcome,
        refinedQuestion: data.projectDescription,
        isMatrix: data.matrixIsNot.is,
        isNotMatrix: data.matrixIsNot.isNot,
        researchArea: data.researchArea, // Guardar área de investigación
        temporalRange: {
          start: data.yearStart || 2019,
          end: data.yearEnd || new Date().getFullYear(),
          justification: `Rango temporal definido para ${data.researchArea || 'la investigación'}`
        }
      }
      
      // Usar updateProtocol para guardar/actualizar el protocolo
      await apiClient.updateProtocol(projectId, protocolData)
      console.log('✅ Protocolo inicial guardado')
    } catch (error) {
      console.error('Error guardando protocolo inicial:', error)
    }
  }

  // Auto-save debounced function
  const autoSaveTitles = useCallback(async (titles: typeof data.generatedTitles) => {
    if (!data.projectId) return

    try {
      setSaveStatus('saving')
      await apiClient.updateProtocol(data.projectId, {
        generatedTitles: titles
      })
      setSaveStatus('saved')
      
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Error saving titles:', error)
      setSaveStatus('idle')
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios automáticamente."
      })
    }
  }, [data.projectId, toast])

  const handleUpdateTitle = (index: number, field: 'title' | 'spanishTitle', value: string) => {
    const updatedTitles = [...data.generatedTitles]
    updatedTitles[index] = { ...updatedTitles[index], [field]: value }
    updateData({ generatedTitles: updatedTitles })
    
    // Track which field was edited
    setEditedFields(prev => new Set(prev).add(field))
    
    // Si es el título seleccionado, actualizamos también selectedTitle
    if (selectedIndex === index && field === 'title') {
      updateData({ selectedTitle: value })
    }

    // Auto-save con debounce de 1 segundo
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      autoSaveTitles(updatedTitles)
    }, 1000)
  }

  const handleConfirmEdit = async (index: number) => {
    const titleData = data.generatedTitles[index]
    
    // Determine what needs translation
    const editedEN = editedFields.has('title')
    const editedES = editedFields.has('spanishTitle')

    if (editedEN || editedES) {
      setTranslatingIndex(index)
      try {
        const updatedTitles = [...data.generatedTitles]

        if (editedEN && titleData.title) {
          // Translate EN → ES
          const translatedES = await apiClient.translateText(titleData.title, 'en', 'es')
          updatedTitles[index] = { ...updatedTitles[index], spanishTitle: translatedES }
        }
        
        if (editedES && titleData.spanishTitle) {
          // Translate ES → EN
          const translatedEN = await apiClient.translateText(titleData.spanishTitle, 'es', 'en')
          updatedTitles[index] = { ...updatedTitles[index], title: translatedEN }
          // Update selectedTitle if this is the selected one
          if (selectedIndex === index) {
            updateData({ selectedTitle: translatedEN })
          }
        }

        updateData({ generatedTitles: updatedTitles })
        autoSaveTitles(updatedTitles)

        toast({
          title: "Traducción actualizada",
          description: editedEN 
            ? "El título en español se ha actualizado automáticamente." 
            : "El título en inglés se ha actualizado automáticamente."
        })
      } catch (error: any) {
        console.error('Error translating title:', error)
        toast({
          variant: "destructive",
          title: "Error al traducir",
          description: "No se pudo traducir automáticamente. Puedes editarlo manualmente."
        })
      } finally {
        setTranslatingIndex(-1)
      }
    }

    setEditingIndex(-1)
    setEditedFields(new Set())
  }

  const getComplianceBadge = (compliance: string) => {
    const variants = {
      full: { label: "Cochrane ✓", variant: "default" as const, className: "bg-green-600" },
      partial: { label: "Parcial", variant: "secondary" as const, className: "" },
      none: { label: "Básico", variant: "outline" as const, className: "" }
    }
    const config = variants[compliance as keyof typeof variants] || variants.partial
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-2xl font-bold">
          Gestión de Títulos
        </h2>
        <div className="p-4 rounded-lg border border-blue-300 dark:border-blue-700">
          <p className="text-sm leading-relaxed">
            La IA ha generado 5 títulos académicos bilingües con sus justificaciones siguiendo los criterios de Cochrane Review. 
            Revisa las opciones y <strong>selecciona el que más te convenza</strong>, o bien, 
            <strong> edita cualquiera</strong> usando el botón de edición para adaptarlo a tus necesidades específicas.
          </p>
        </div>
      </div>

      {/* Generate Button */}
      {data.generatedTitles.length === 0 && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle>Generar Títulos con IA</CardTitle>
            <CardDescription>
              Basado en tu marco PICO y matriz Es/No Es, la IA creará 5 opciones de títulos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateTitles}
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generando 5 títulos...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generar Títulos
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Titles */}
      {data.generatedTitles.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold">Selecciona un título</h3>
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Guardado ✓
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleGenerateTitles}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Regenerar
            </Button>
          </div>

          <div className="space-y-4">
            {data.generatedTitles.map((titleData, index) => {
              const isEditing = editingIndex === index
              
              return (
                <Card
                  key={index}
                  className={`transition-all ${
                    selectedIndex === index
                      ? 'border-primary border-2 shadow-lg bg-primary/5'
                      : 'hover:border-primary/50 hover:shadow-md'
                  } ${!isEditing && 'cursor-pointer'}`}
                  onClick={() => !isEditing && handleSelectTitle(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Número grande circular */}
                      <div className="flex-shrink-0">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold transition-colors ${
                          selectedIndex === index 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                      </div>

                      {/* Contenido bilingüe */}
                      <div className="flex-1 space-y-4">
                        {/* Título en Inglés */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold">
                              EN
                            </Badge>
                            <span className="text-sm font-medium text-muted-foreground">English Title</span>
                          </div>
                          {isEditing ? (
                            <Textarea
                              value={titleData.title}
                              onChange={(e) => handleUpdateTitle(index, 'title', e.target.value)}
                              rows={2}
                              className="text-base font-semibold resize-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : translatingIndex === index && editedFields.has('spanishTitle') ? (
                            <div className="flex items-center gap-2 text-base font-semibold">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                              <span className="text-muted-foreground">Traduciendo...</span>
                            </div>
                          ) : (
                            <p className="text-base font-semibold leading-relaxed">
                              {titleData.title}
                            </p>
                          )}
                        </div>

                        {/* Título en Español */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-semibold">
                              ES
                            </Badge>
                            <span className="text-sm font-medium text-muted-foreground">Título en Español</span>
                          </div>
                          {isEditing ? (
                            <Textarea
                              value={titleData.spanishTitle || ''}
                              onChange={(e) => handleUpdateTitle(index, 'spanishTitle', e.target.value)}
                              rows={2}
                              className="text-base resize-none"
                              placeholder="Traducción en español..."
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : translatingIndex === index && editedFields.has('title') ? (
                            <div className="flex items-center gap-2 text-base">
                              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                              <span className="text-muted-foreground">Traduciendo...</span>
                            </div>
                          ) : (
                            <p className="text-base leading-relaxed text-muted-foreground">
                              {titleData.spanishTitle || 'Generando traducción...'}
                            </p>
                          )}
                        </div>

                        {/* Justificación - Siempre visible */}
                        <div className="pt-3 border-t border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs font-semibold">
                              Justificación
                            </Badge>
                          </div>
                          {titleData.justification ? (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {titleData.spanishJustification || titleData.justification}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground/60 italic">
                              Generando justificación...
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Botón de editar/guardar */}
                      <Button
                        variant={isEditing ? "default" : "ghost"}
                        size="icon"
                        className="flex-shrink-0"
                        disabled={translatingIndex === index}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isEditing) {
                            handleConfirmEdit(index)
                          } else {
                            setEditingIndex(index)
                            setEditedFields(new Set())
                          }
                        }}
                      >
                        {translatingIndex === index ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isEditing ? (
                          <Save className="h-4 w-4" />
                        ) : (
                          <Pencil className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

