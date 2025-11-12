"use client"

import { useWizard } from "./wizard-context"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Home, Save } from "lucide-react"
import { useRouter } from "next/navigation"

const stepNames = [
  "Propuesta",
  "PICO + Matriz",
  "Títulos",
  "Búsqueda",
  "Definición",
  "PRISMA",
  "Confirmación"
]

interface WizardHeaderProps {
  onSaveDraft?: () => void
  isSaving?: boolean
}

export function WizardHeader({ onSaveDraft, isSaving }: WizardHeaderProps) {
  const { currentStep, totalSteps, data } = useWizard()
  const router = useRouter()
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-bold">Asistente de Protocolo de Investigación</h1>
              <p className="text-sm text-muted-foreground">
                {data.projectName || "Nuevo Proyecto"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {data.lastSaved && (
              <span className="text-xs text-muted-foreground">
                Guardado {new Date(data.lastSaved).toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-pulse" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar borrador
                </>
              )}
            </Button>
            <Badge variant="outline">
              Paso {currentStep} de {totalSteps}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {stepNames.map((name, index) => (
              <span
                key={index}
                className={currentStep === index + 1 ? "text-primary font-semibold" : ""}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
