"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface ResearchQuestionsStepProps {
  data: string[]
  onChange: (data: string[]) => void
}

export function ResearchQuestionsStep({ data, onChange }: ResearchQuestionsStepProps) {
  const addQuestion = () => {
    onChange([...data, ""])
  }

  const removeQuestion = (index: number) => {
    onChange(data.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...data]
    newQuestions[index] = value
    onChange(newQuestions)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Preguntas de Investigación</h3>
        <p className="text-sm text-muted-foreground">
          Define las preguntas principales que guiarán tu revisión sistemática. Deben ser específicas, medibles y
          relevantes.
        </p>
      </div>

      <div className="space-y-4">
        {data.map((question, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Pregunta {index + 1}</Label>
              {data.length > 1 && (
                <Button size="sm" variant="ghost" onClick={() => removeQuestion(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Textarea
              placeholder="Ej: ¿Cómo impacta el uso de IA en el rendimiento académico de estudiantes universitarios?"
              value={question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              rows={3}
            />
          </div>
        ))}

        <Button variant="outline" onClick={addQuestion} className="w-full bg-transparent">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Pregunta
        </Button>
      </div>
    </div>
  )
}
