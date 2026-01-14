"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Reference } from "@/lib/types"

interface Scores {
  relevance: number
  interventionPresent: number
  methodValidity: number
  dataReported: number
  textAccessible: number
  dateRange: number
  methodQuality: number
}

interface FullTextEvaluationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reference: Reference
  projectId: string
  onEvaluationComplete: () => void
}

const criteriaDefinitions = {
  relevance: {
    label: "Relevancia al protocolo PICO",
    description: "¿El estudio es relevante para la pregunta de investigación?",
    maxScore: 2,
    levels: ["No relevante", "Parcialmente relevante", "Muy relevante"]
  },
  interventionPresent: {
    label: "Intervención presente",
    description: "¿El estudio describe claramente la intervención?",
    maxScore: 2,
    levels: ["No descrita", "Parcialmente descrita", "Bien descrita"]
  },
  methodValidity: {
    label: "Validez metodológica",
    description: "¿La metodología del estudio es válida y rigurosa?",
    maxScore: 2,
    levels: ["Metodología débil", "Metodología aceptable", "Metodología robusta"]
  },
  dataReported: {
    label: "Datos reportados",
    description: "¿Los datos y resultados están reportados adecuadamente?",
    maxScore: 2,
    levels: ["Datos insuficientes", "Datos parciales", "Datos completos"]
  },
  textAccessible: {
    label: "Texto completo accesible",
    description: "¿Se tiene acceso al texto completo del artículo?",
    maxScore: 1,
    levels: ["No accesible", "Accesible"]
  },
  dateRange: {
    label: "Rango de fecha",
    description: "¿La publicación está dentro del rango de fechas del protocolo?",
    maxScore: 1,
    levels: ["Fuera de rango", "Dentro de rango"]
  },
  methodQuality: {
    label: "Calidad metodológica general",
    description: "Evaluación general de la calidad del estudio",
    maxScore: 2,
    levels: ["Baja calidad", "Calidad aceptable", "Alta calidad"]
  }
}

export function FullTextEvaluationForm({
  open,
  onOpenChange,
  reference,
  projectId,
  onEvaluationComplete
}: FullTextEvaluationFormProps) {
  const { toast } = useToast()
  const [scores, setScores] = useState<Scores>({
    relevance: 1,
    interventionPresent: 1,
    methodValidity: 1,
    dataReported: 1,
    textAccessible: 1,
    dateRange: 1,
    methodQuality: 1
  })
  const [threshold, setThreshold] = useState(7)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calcular puntaje total en tiempo real
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const maxScore = 12
  const decision = totalScore >= threshold ? "include" : "exclude"

  // Resetear formulario cuando se abre
  useEffect(() => {
    if (open) {
      setScores({
        relevance: 1,
        interventionPresent: 1,
        methodValidity: 1,
        dataReported: 1,
        textAccessible: 1,
        dateRange: 1,
        methodQuality: 1
      })
      setThreshold(7)
      setComment("")
    }
  }, [open])

  const handleScoreChange = (criterion: keyof Scores, value: number[]) => {
    setScores(prev => ({
      ...prev,
      [criterion]: value[0]
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/screening/projects/${projectId}/references/${reference.id}/evaluate-fulltext`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            scores,
            threshold,
            comment: comment.trim() || undefined
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al evaluar el artículo")
      }

      const result = await response.json()

      toast({
        title: result.decision === "include" ? "✅ Artículo incluido" : "❌ Artículo excluido",
        description: result.message || `Puntaje: ${result.totalScore}/${maxScore}`,
        variant: result.decision === "include" ? "default" : "destructive"
      })

      onEvaluationComplete()
      onOpenChange(false)

    } catch (error: any) {
      toast({
        title: "Error al evaluar",
        description: error.message || "No se pudo completar la evaluación",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluación de Texto Completo</DialogTitle>
          <DialogDescription>
            Sistema de 7 criterios (0-12 puntos). Umbral: {threshold} puntos.
          </DialogDescription>
        </DialogHeader>

        {/* Información de la referencia */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-sm font-medium line-clamp-2">{reference.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {reference.authors} • {reference.year}
            </p>
          </CardContent>
        </Card>

        {/* Puntaje actual y decisión */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Puntaje Total</p>
            <p className="text-xl font-bold">
              {totalScore} <span className="text-lg text-muted-foreground">/ {maxScore}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-2">Decisión</p>
            {decision === "include" ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-4 w-4" />
                Incluir
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-4 w-4" />
                Excluir
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Sliders para cada criterio */}
        <div className="space-y-6">
          {(Object.keys(criteriaDefinitions) as Array<keyof Scores>).map((criterion) => {
            const def = criteriaDefinitions[criterion]
            const currentScore = scores[criterion]
            
            return (
              <div key={criterion} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Label htmlFor={criterion} className="text-sm font-medium">
                      {def.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {def.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {currentScore}/{def.maxScore}
                  </Badge>
                </div>
                
                <Slider
                  id={criterion}
                  min={0}
                  max={def.maxScore}
                  step={1}
                  value={[currentScore]}
                  onValueChange={(value) => handleScoreChange(criterion, value)}
                  className="w-full"
                />
                
                <p className="text-xs text-muted-foreground italic">
                  {def.levels[currentScore]}
                </p>
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Umbral de decisión */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="threshold" className="text-sm font-medium">
              Umbral de decisión
            </Label>
            <Badge variant="secondary">
              {threshold} puntos
            </Badge>
          </div>
          <Slider
            id="threshold"
            min={0}
            max={12}
            step={1}
            value={[threshold]}
            onValueChange={(value) => setThreshold(value[0])}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Referencias con {threshold}+ puntos serán incluidas
          </p>
        </div>

        <Separator />

        {/* Comentarios */}
        <div className="space-y-2">
          <Label htmlFor="comment">Comentarios (opcional)</Label>
          <Textarea
            id="comment"
            placeholder="Notas adicionales sobre esta evaluación..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Advertencia si está por excluir */}
        {decision === "exclude" && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Esta referencia será excluida</p>
              <p className="text-xs text-muted-foreground mt-1">
                El puntaje ({totalScore}) está por debajo del umbral ({threshold}).
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Guardando..." : "Guardar evaluación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
