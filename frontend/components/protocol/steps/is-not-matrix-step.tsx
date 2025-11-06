"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Sparkles, Loader2 } from "lucide-react"
import { generateIsNotMatrix, type AIProvider } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"

interface IsNotMatrixStepProps {
  data: { is: string[]; isNot: string[] }
  onChange: (data: { is: string[]; isNot: string[] }) => void
  projectTitle: string
  projectDescription: string
}

export function IsNotMatrixStep({ data, onChange, projectTitle, projectDescription }: IsNotMatrixStepProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const addItem = (type: "is" | "isNot") => {
    onChange({
      ...data,
      [type]: [...data[type], ""],
    })
  }

  const removeItem = (type: "is" | "isNot", index: number) => {
    onChange({
      ...data,
      [type]: data[type].filter((_, i) => i !== index),
    })
  }

  const updateItem = (type: "is" | "isNot", index: number, value: string) => {
    const newArray = [...data[type]]
    newArray[index] = value
    onChange({
      ...data,
      [type]: newArray,
    })
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
      const result = await generateIsNotMatrix(provider, projectTitle, projectDescription)
      onChange(result)
      toast({
        title: "¡Generado con éxito!",
        description: `La matriz Es/No Es ha sido generada usando ${provider === "chatgpt" ? "ChatGPT" : "Gemini"}`,
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
        <h3 className="text-lg font-semibold">Matriz Es/No Es</h3>
        <p className="text-sm text-muted-foreground">
          Define claramente qué incluye y qué excluye tu investigación para establecer límites precisos.
        </p>
      </div>

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

      <div className="grid md:grid-cols-2 gap-6">
        {/* ES Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">ES (Incluye)</Label>
            <Button size="sm" variant="outline" onClick={() => addItem("is")}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
          <div className="space-y-3">
            {data.is.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No hay elementos. Usa IA o agrega manualmente.</p>
            )}
            {data.is.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Ej: Estudios empíricos con datos cuantitativos"
                  value={item}
                  onChange={(e) => updateItem("is", index, e.target.value)}
                />
                <Button size="icon" variant="ghost" onClick={() => removeItem("is", index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* NO ES Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">NO ES (Excluye)</Label>
            <Button size="sm" variant="outline" onClick={() => addItem("isNot")}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
          <div className="space-y-3">
            {data.isNot.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No hay elementos. Usa IA o agrega manualmente.</p>
            )}
            {data.isNot.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Ej: Estudios teóricos sin validación"
                  value={item}
                  onChange={(e) => updateItem("isNot", index, e.target.value)}
                />
                <Button size="icon" variant="ghost" onClick={() => removeItem("isNot", index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
