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
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">Comencemos con tu proyecto</h2>
        <p className="text-lg text-muted-foreground">
          Describe brevemente tu idea de investigación. El asistente te guiará paso a paso.
        </p>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
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

          <div className="space-y-2">
            <Label htmlFor="researchArea" className="text-base">
              Área de Investigación <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.researchArea}
              onValueChange={(value) => updateData({ researchArea: value })}
            >
              <SelectTrigger id="researchArea" className="text-base h-12">
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
            <Label className="text-base">
              Rango Temporal de Publicaciones <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearStart" className="text-sm text-muted-foreground">
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
                  className="text-base h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearEnd" className="text-sm text-muted-foreground">
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
                  className="text-base h-12"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Rango de años para filtrar publicaciones. Esto se usará en los criterios de inclusión/exclusión y en las cadenas de búsqueda
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="dark:text-blue-100">Reglas para definir un tema de Revisión Sistemática de Literatura (SLR)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* ESTRUCTURA RECOMENDADA - PRINCIPAL */}
            <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-700">
              <p className="font-semibold text-base text-blue-900 dark:text-blue-200 mb-3">📐 Estructura Recomendada:</p>
              <p className="text-sm text-blue-800 dark:text-blue-300 font-mono bg-white/50 dark:bg-black/30 p-3 rounded mb-3">
                [TECNOLOGÍA/HERRAMIENTA] + [ASPECTO A ANALIZAR] + [CONTEXTO/POBLACIÓN]
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Ejemplo completo:</strong><br />
                "Prácticas de desarrollo con Mongoose ODM en aplicaciones Node.js: Una revisión sistemática"
              </p>
            </div>

            {/* BOTÓN PARA EXPANDIR REGLAS DETALLADAS */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowDetailedRules(!showDetailedRules)}
                className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                {showDetailedRules ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Ocultar ejemplos detallados
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Ver más ejemplos y reglas detalladas
                  </>
                )}
              </Button>
            </div>

            {/* REGLAS DETALLADAS - COLAPSABLES */}
            {showDetailedRules && (
              <div className="space-y-3 text-sm animate-in slide-in-from-top-2">
                <p className="font-semibold text-base text-blue-900 dark:text-blue-200">📋 Reglas Generales:</p>
                
                <div className="p-3 bg-card rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-medium mb-1 flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    1. Intervención/Tecnología/Fenómeno
                  </p>
                  <p className="text-muted-foreground text-xs">
                    El tema debe describir claramente <strong>qué se va a analizar</strong>.
                    <br />
                    <span className="text-green-600 dark:text-green-400">✅ Ejemplo:</span> "Object Document Mapping con Mongoose en aplicaciones Node.js"
                    <br />
                    <span className="text-red-600 dark:text-red-400">❌ Evitar:</span> "MongoDB en aplicaciones" (muy genérico)
                  </p>
                </div>

                <div className="p-3 bg-card rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-medium mb-1 flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    2. Contexto o Población
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Debe definirse el <strong>ámbito de aplicación</strong>.
                    <br />
                    <span className="text-green-600 dark:text-green-400">✅ Ejemplo:</span> "Aplicaciones backend Node.js con MongoDB"
                    <br />
                    <span className="text-red-600 dark:text-red-400">❌ Evitar:</span> "Desarrollo web" (demasiado amplio)
                  </p>
                </div>

                <div className="p-3 bg-card rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-medium mb-1 flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    3. Enfoque del Análisis
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Especificar <strong>qué aspecto se estudia</strong> (prácticas, rendimiento, impacto, diseño).
                    <br />
                    <span className="text-green-600 dark:text-green-400">✅ Ejemplo:</span> "Prácticas de desarrollo y patrones de diseño con Mongoose"
                  </p>
                </div>

                <div className="p-3 bg-card rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-medium mb-1 flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    4. Alineación Metodológica
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Debe ser compatible con <strong>PRISMA/Cochrane</strong>.
                    <br />
                    <span className="text-green-600 dark:text-green-400">✅ Ejemplo:</span> "Revisión sistemática de..." o "Scoping review de..."
                  </p>
                </div>

                <div className="p-3 bg-card rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="font-medium mb-1 flex items-center gap-2">
                    <span className="text-orange-600 dark:text-orange-400">!</span>
                    5. Sin Resultados Anticipados
                  </p>
                  <p className="text-muted-foreground text-xs">
                    El título <strong>no debe incluir conclusiones</strong>.
                    <br />
                    <span className="text-green-600 dark:text-green-400">✅ Correcto:</span> "Implicaciones de rendimiento del uso de Mongoose en Node.js"
                    <br />
                    <span className="text-red-600 dark:text-red-400">❌ Incorrecto:</span> "Mongoose mejora el rendimiento en Node.js"
                  </p>
                </div>

                <div className="p-3 bg-card rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="font-medium mb-1 flex items-center gap-2">
                    <span className="text-purple-600 dark:text-purple-400">✓</span>
                    6. Claridad y Acotación
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Tema <strong>específico, no genérico</strong>.
                    <br />
                    <span className="text-green-600 dark:text-green-400">✅ Específico:</span> "Mongoose ODM en aplicaciones Node.js"
                    <br />
                    <span className="text-red-600 dark:text-red-400">❌ Genérico:</span> "Bases de datos NoSQL"
                  </p>
                </div>

                <div className="p-3 bg-card rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <p className="font-medium mb-1 flex items-center gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                    7. Orientación Técnica/Científica
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Debe apuntar a <strong>literatura académica o técnica revisada por pares</strong>.
                    <br />
                    <span className="text-green-600 dark:text-green-400">✅ Fuentes:</span> Journals, conferencias científicas
                    <br />
                    <span className="text-red-600 dark:text-red-400">❌ Evitar:</span> Blogs, tutoriales personales
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
