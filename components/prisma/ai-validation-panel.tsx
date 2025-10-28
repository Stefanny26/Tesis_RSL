"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Sparkles, CheckCircle, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface AIValidationPanelProps {
  completedItems: number
  totalItems: number
  onRunValidation: () => void
}

export function AIValidationPanel({ completedItems, totalItems, onRunValidation }: AIValidationPanelProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [validationResults, setValidationResults] = useState<{
    score: number
    issues: string[]
    suggestions: string[]
  } | null>(null)

  const handleValidation = async () => {
    setIsValidating(true)
    setProgress(0)
    setValidationResults(null)

    // Simulate AI validation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsValidating(false)
          // Mock validation results
          setValidationResults({
            score: 85,
            issues: [
              "El ítem 8 (Búsqueda) necesita más detalles sobre los límites utilizados",
              "El ítem 17 (Selección de estudios) requiere un diagrama de flujo PRISMA",
            ],
            suggestions: [
              "Considere agregar más detalles sobre el proceso de extracción de datos",
              "Incluya información sobre el registro del protocolo en PROSPERO",
            ],
          })
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Validación con IA
        </CardTitle>
        <CardDescription>Valida tu cumplimiento PRISMA con asistencia de inteligencia artificial</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="text-sm">
            La IA analizará tu contenido y proporcionará sugerencias para mejorar el cumplimiento PRISMA.
          </AlertDescription>
        </Alert>

        {isValidating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Validando ítems...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {validationResults && (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Puntuación de Cumplimiento</p>
              <p className="text-3xl font-bold">{validationResults.score}%</p>
            </div>

            {validationResults.issues.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span>Problemas Detectados</span>
                </div>
                <ul className="space-y-2">
                  {validationResults.issues.map((issue, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground bg-yellow-50 p-2 rounded border-l-2 border-yellow-400"
                    >
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validationResults.suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Sugerencias de Mejora</span>
                </div>
                <ul className="space-y-2">
                  {validationResults.suggestions.map((suggestion, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground bg-blue-50 p-2 rounded border-l-2 border-blue-400"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <Button onClick={handleValidation} disabled={isValidating || completedItems === 0} className="w-full">
          <Brain className="mr-2 h-4 w-4" />
          {isValidating ? "Validando..." : "Ejecutar Validación IA"}
        </Button>
      </CardContent>
    </Card>
  )
}
