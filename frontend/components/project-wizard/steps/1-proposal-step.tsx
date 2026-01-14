"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Info, Lightbulb, ChevronDown, ChevronUp } from "lucide-react"

// ✅ Áreas de investigación (clasificación oficial universitaria)
const RESEARCH_AREAS = [
  { value: "ingenieria-tecnologia", label: "🟦 Ingeniería y Tecnología", description: "Sistemas, Software, Electrónica, Industrial, Mecánica" },
  { value: "medicina-salud", label: "🟥 Medicina y Ciencias de la Salud", description: "Medicina, Enfermería, Odontología, Veterinaria" },
  { value: "ciencias-sociales", label: "🟩 Ciencias Sociales y Humanidades", description: "Educación, Sociología, Psicología, Derecho, Economía" },
  { value: "arquitectura-diseño", label: "🟪 Arquitectura, Diseño y Urbanismo", description: "Arquitectura, Construcción, Diseño, Planeación Urbana" },
]

export function ProposalStep() {
  const { data, updateData } = useWizard()
  const [showDetailedRules, setShowDetailedRules] = useState(false)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-bold">Comencemos con tu proyecto</h2>
        <p className="text-base text-muted-foreground">
          Describe brevemente tu idea de investigación. El asistente te guiará paso a paso.
        </p>
      </div>

      <Alert className="border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-foreground">
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
            <Label htmlFor="projectName" className="text-sm font-medium">
              Nombre del Proyecto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="projectName"
              placeholder="Ej: Análisis de Mongoose ODM en aplicaciones Node.js"
              value={data.projectName}
              onChange={(e) => updateData({ projectName: e.target.value })}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Un nombre temporal está bien, lo refinaremos más adelante
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDescription" className="text-sm font-medium">
              Descripción Breve <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="projectDescription"
              placeholder="Ej: Quiero investigar cómo el uso de Mongoose como ODM afecta el rendimiento y los patrones de diseño en aplicaciones Node.js con MongoDB..."
              value={data.projectDescription}
              onChange={(e) => updateData({ projectDescription: e.target.value })}
              rows={5}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Describe tu idea en 2-3 frases. ¿Qué quieres investigar y por qué?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="researchArea" className="text-sm font-medium">
              Área de Investigación <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.researchArea}
              onValueChange={(value) => updateData({ researchArea: value })}
            >
              <SelectTrigger id="researchArea" className="h-10">
                <SelectValue placeholder="Selecciona el área o disciplina de tu investigación" />
              </SelectTrigger>
              <SelectContent>
                {RESEARCH_AREAS.map((area) => (
                  <SelectItem key={area.value} value={area.value}>
                    {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Esto ayuda al sistema a generar análisis y recomendaciones más precisas para tu campo de estudio
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Rango Temporal de Publicaciones <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearStart" className="text-xs text-muted-foreground">
                  Año inicial
                </Label>
                <Input
                  id="yearStart"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear()}
                  placeholder="Ej: 2019"
                  value={data.yearStart || ''}
                  onChange={(e) => updateData({ yearStart: parseInt(e.target.value) || undefined })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearEnd" className="text-xs text-muted-foreground">
                  Año final
                </Label>
                <Input
                  id="yearEnd"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear()}
                  placeholder="Ej: 2025"
                  value={data.yearEnd || ''}
                  onChange={(e) => updateData({ yearEnd: parseInt(e.target.value) || undefined })}
                  className="h-10"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Rango de años para filtrar publicaciones. Esto se usará en los criterios de inclusión/exclusión y en las cadenas de búsqueda
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
