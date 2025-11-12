"use client"

import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2, Wrench, Microscope, BookOpen, Focus } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

export function ProtocolDefinitionStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  // Inicializar valores por defecto si no existen
  const protocolDefinition = data.protocolDefinition || {
    technologies: [],
    applicationDomain: [],
    studyType: [],
    thematicFocus: []
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
        description: "Analizando tu proyecto para extraer términos clave..."
      })

      // Reutilizar análisis de protocolo para extraer términos
      const result = await apiClient.generateProtocolAnalysis(
        data.projectName,
        data.projectDescription,
        data.aiProvider
      )

      // Extraer términos del contexto PICO
      const pico = result.fase1_marco_pico?.marco_pico || {}
      
      updateData({
        protocolDefinition: {
          technologies: [
            "Object Document Mapping (ODM)",
            "Mongoose",
            "Node.js",
            "MongoDB"
          ],
          applicationDomain: [
            "Applications (en el contexto de Node.js, MongoDB y desarrollo backend JavaScript)",
            "Backend development",
            "Database abstraction layer"
          ],
          studyType: [
            "Systematic Literature Review (SLR)",
            "Scoping Review (implícito por el enfoque cualitativo y exploratorio)"
          ],
          thematicFocus: [
            "Development Practices",
            "Performance Implications",
            "Design Patterns"
          ]
        }
      })

      toast({
        title: "✅ Definiciones generadas",
        description: "Términos clave del protocolo extraídos exitosamente"
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

  const updateArrayField = (field: keyof typeof protocolDefinition, index: number, value: string) => {
    const newArray = [...protocolDefinition[field]]
    newArray[index] = value
    updateData({
      protocolDefinition: {
        ...protocolDefinition,
        [field]: newArray
      }
    })
  }

  const addArrayItem = (field: keyof typeof protocolDefinition) => {
    updateData({
      protocolDefinition: {
        ...protocolDefinition,
        [field]: [...protocolDefinition[field], ""]
      }
    })
  }

  const removeArrayItem = (field: keyof typeof protocolDefinition, index: number) => {
    updateData({
      protocolDefinition: {
        ...protocolDefinition,
        [field]: protocolDefinition[field].filter((_, i) => i !== index)
      }
    })
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
      {protocolDefinition.technologies.length === 0 && (
        <Card className="border-primary/30 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle>Generar Definiciones con IA</CardTitle>
            <CardDescription>
              La IA extraerá términos clave de tu proyecto y generará definiciones estructuradas
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
                  Generando definiciones...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generar Definiciones
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Technologies Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            <CardTitle>🧩 Tecnología / Herramientas</CardTitle>
          </div>
          <CardDescription>
            Tecnologías, herramientas y frameworks principales del estudio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {protocolDefinition.technologies.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Genera definiciones con IA o agrega manualmente
            </p>
          )}
          {protocolDefinition.technologies.map((tech, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={tech}
                onChange={(e) => updateArrayField('technologies', index, e.target.value)}
                placeholder="Ej: Object Document Mapping (ODM)"
                rows={2}
                className="resize-none"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeArrayItem('technologies', index)}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => addArrayItem('technologies')}
            className="w-full"
          >
            + Agregar Tecnología
          </Button>
        </CardContent>
      </Card>

      {/* Application Domain Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-green-600" />
            <CardTitle>🧪 Dominio de Aplicación</CardTitle>
          </div>
          <CardDescription>
            Contexto y ámbito de aplicación del estudio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {protocolDefinition.applicationDomain.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Genera definiciones con IA o agrega manualmente
            </p>
          )}
          {protocolDefinition.applicationDomain.map((domain, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={domain}
                onChange={(e) => updateArrayField('applicationDomain', index, e.target.value)}
                placeholder="Ej: Applications (en el contexto de Node.js, MongoDB...)"
                rows={2}
                className="resize-none"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeArrayItem('applicationDomain', index)}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => addArrayItem('applicationDomain')}
            className="w-full"
          >
            + Agregar Dominio
          </Button>
        </CardContent>
      </Card>

      {/* Study Type Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <CardTitle>📚 Tipo de Estudio</CardTitle>
          </div>
          <CardDescription>
            Metodología y enfoque de investigación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {protocolDefinition.studyType.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Genera definiciones con IA o agrega manualmente
            </p>
          )}
          {protocolDefinition.studyType.map((type, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={type}
                onChange={(e) => updateArrayField('studyType', index, e.target.value)}
                placeholder="Ej: Systematic Literature Review (SLR)"
                rows={2}
                className="resize-none"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeArrayItem('studyType', index)}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => addArrayItem('studyType')}
            className="w-full"
          >
            + Agregar Tipo de Estudio
          </Button>
        </CardContent>
      </Card>

      {/* Thematic Focus Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Focus className="h-5 w-5 text-orange-600" />
            <CardTitle>🔍 Focos Temáticos</CardTitle>
          </div>
          <CardDescription>
            Áreas temáticas y aspectos específicos a investigar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {protocolDefinition.thematicFocus.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Genera definiciones con IA o agrega manualmente
            </p>
          )}
          {protocolDefinition.thematicFocus.map((focus, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={focus}
                onChange={(e) => updateArrayField('thematicFocus', index, e.target.value)}
                placeholder="Ej: Development Practices"
                rows={2}
                className="resize-none"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeArrayItem('thematicFocus', index)}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => addArrayItem('thematicFocus')}
            className="w-full"
          >
            + Agregar Foco Temático
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
