"use client"

import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Lightbulb } from "lucide-react"

export function ProposalStep() {
  const { data, updateData } = useWizard()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">Comencemos con tu proyecto</h2>
        <p className="text-lg text-muted-foreground">
          Describe brevemente tu idea de investigación. El asistente te guiará paso a paso.
        </p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          No necesitas tener todo definido ahora. Solo proporciona una descripción básica 
          y el asistente te ayudará a estructurar tu protocolo completo.
        </AlertDescription>
      </Alert>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
          <CardDescription>
            Entrada mínima para comenzar (1-2 frases son suficientes)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-base">
              Nombre del Proyecto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="projectName"
              placeholder="Ej: Análisis de Mongoose ODM en aplicaciones Node.js"
              value={data.projectName}
              onChange={(e) => updateData({ projectName: e.target.value })}
              className="text-lg h-12"
            />
            <p className="text-xs text-muted-foreground">
              Un nombre temporal está bien, lo refinaremos más adelante
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDescription" className="text-base">
              Descripción Breve <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="projectDescription"
              placeholder="Ej: Quiero investigar cómo el uso de Mongoose como ODM afecta el rendimiento y los patrones de diseño en aplicaciones Node.js con MongoDB..."
              value={data.projectDescription}
              onChange={(e) => updateData({ projectDescription: e.target.value })}
              rows={6}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Describe tu idea en 2-3 frases. ¿Qué quieres investigar y por qué?
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            <CardTitle>Ejemplos de propuestas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-medium mb-1">Ejemplo 1:</p>
              <p className="text-muted-foreground">
                "Evaluar el impacto de la inteligencia artificial en el aprendizaje de estudiantes 
                universitarios de ingeniería, comparando métodos tradicionales con sistemas adaptativos."
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-medium mb-1">Ejemplo 2:</p>
              <p className="text-muted-foreground">
                "Analizar patrones de diseño en arquitecturas de microservicios usando Docker y Kubernetes, 
                enfocándose en escalabilidad y mantenibilidad."
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-medium mb-1">Ejemplo 3:</p>
              <p className="text-muted-foreground">
                "Revisión sistemática sobre técnicas de ciberseguridad en aplicaciones web modernas, 
                comparando frameworks de autenticación OAuth vs JWT."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
