"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Sparkles, Loader2 } from "lucide-react"
import { generatePICO, type AIProvider } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"

interface PicoFrameworkStepProps {
  data: {
    population: string
    intervention: string
    comparison: string
    outcome: string
  }
  onChange: (data: any) => void
  projectTitle: string
  projectDescription: string
}

export function PicoFrameworkStep({ data, onChange, projectTitle, projectDescription }: PicoFrameworkStepProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const updateField = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const handleAIGeneration = async (provider: AIProvider) => {
    if (!projectTitle || !projectDescription) {
      toast({
        title: "Información incompleta",
        description: "Necesitas un título y descripción del proyecto para generar con IA",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const result = await generatePICO(provider, projectTitle, projectDescription)
      onChange(result)
      toast({
        title: "¡Generado con éxito!",
        description: `El framework PICO ha sido generado usando ${provider === "chatgpt" ? "ChatGPT" : "Gemini"}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al generar con IA",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Framework PICO</h3>
        <p className="text-sm text-muted-foreground">
          Estructura tu pregunta de investigación usando el framework PICO (Población, Intervención, Comparación,
          Resultado).
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          El framework PICO te ayuda a formular preguntas de investigación claras y enfocadas, facilitando la búsqueda
          de evidencia relevante.
        </AlertDescription>
      </Alert>

      <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1">
          <p className="text-sm font-medium mb-2">Generar automáticamente con IA:</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAIGeneration("chatgpt")}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              ChatGPT
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAIGeneration("gemini")}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Gemini
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="population">
            Población (P) <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="population"
            placeholder="Ej: Aplicaciones Node.js que utilizan bases de datos NoSQL"
            value={data.population}
            onChange={(e) => updateField("population", e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">¿Quiénes son los sujetos de estudio o el contexto?</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="intervention">
            Intervención (I) <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="intervention"
            placeholder="Ej: Implementación de Mongoose ODM como solución de mapeo objeto-documento"
            value={data.intervention}
            onChange={(e) => updateField("intervention", e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">¿Qué intervención o exposición se está evaluando?</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comparison">Comparación (C)</Label>
          <Textarea
            id="comparison"
            placeholder="Ej: Otros ODMs para MongoDB o acceso directo sin ODM"
            value={data.comparison}
            onChange={(e) => updateField("comparison", e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">¿Con qué se compara? (opcional)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="outcome">
            Resultado (O) <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="outcome"
            placeholder="Ej: Patrones de diseño, impacto en rendimiento y facilidad de mantenimiento"
            value={data.outcome}
            onChange={(e) => updateField("outcome", e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">¿Qué resultado se espera medir?</p>
        </div>
      </div>
    </div>
  )
}
