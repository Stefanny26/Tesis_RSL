"use client"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

interface PicoFrameworkStepProps {
  data: {
    population: string
    intervention: string
    comparison: string
    outcome: string
  }
  onChange: (data: any) => void
}

export function PicoFrameworkStep({ data, onChange }: PicoFrameworkStepProps) {
  const updateField = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="population">
            Población (P) <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="population"
            placeholder="Ej: Estudiantes universitarios de carreras STEM"
            value={data.population}
            onChange={(e) => updateField("population", e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">¿Quiénes son los sujetos de estudio?</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="intervention">
            Intervención (I) <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="intervention"
            placeholder="Ej: Uso de herramientas de inteligencia artificial para el aprendizaje"
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
            placeholder="Ej: Métodos de enseñanza tradicionales sin IA"
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
            placeholder="Ej: Mejora en el rendimiento académico y retención de conocimientos"
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
