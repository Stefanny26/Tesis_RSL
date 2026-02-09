"use client"

import React from "react"
import { useWizard } from "./wizard-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface WizardNavigationProps {
  onNext?: () => void | Promise<void>
  onBack?: () => void
  canGoNext?: boolean
  canGoBack?: boolean
  nextLabel?: string
  isLastStep?: boolean
}

export function WizardNavigation({
  onNext,
  onBack,
  canGoNext = true,
  canGoBack = true,
  nextLabel = "Siguiente",
  isLastStep = false
}: WizardNavigationProps) {
  const { currentStep, setCurrentStep, totalSteps, clearDataAfterStep } = useWizard()
  const router = useRouter()
  const [showBackConfirmation, setShowBackConfirmation] = React.useState(false)
  const [pendingBackStep, setPendingBackStep] = React.useState<number | null>(null)

  const handleNext = async () => {
    if (onNext) {
      await onNext()
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    // Si estamos en un paso que tiene datos generados, mostrar confirmación
    if (currentStep > 1) {
      setPendingBackStep(currentStep - 1)
      setShowBackConfirmation(true)
    }
  }

  const confirmBack = () => {
    if (pendingBackStep !== null) {
      // Limpiar datos generados después del paso al que volvemos
      clearDataAfterStep(pendingBackStep)
      
      if (onBack) {
        onBack()
      }
      setCurrentStep(pendingBackStep)
      setShowBackConfirmation(false)
      setPendingBackStep(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const cancelBack = () => {
    setShowBackConfirmation(false)
    setPendingBackStep(null)
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  return (
    <div className="flex items-center justify-between pt-6 border-t bg-background pb-6">
      <div className="flex gap-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="lg">
              <X className="h-5 w-5 mr-2" />
              Cancelar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Si cancelas ahora, perderás todo el progreso del wizard. 
                Solo se guarda el proyecto cuando completas todos los pasos y haces clic en "Crear Proyecto".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Volver al wizard</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Sí, cancelar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {canGoBack && currentStep > 1 && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Atrás
          </Button>
        )}
      </div>

      {/* Confirmation Dialog for Going Back */}
      <AlertDialog open={showBackConfirmation} onOpenChange={setShowBackConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Volver al paso anterior?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Si vuelves atrás, se eliminarán los datos generados en los pasos posteriores.
              </p>
              <p className="font-semibold text-foreground">
                Por ejemplo, si vuelves al paso de Propuesta, se borrarán:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Marco PICO generado</li>
                <li>Títulos generados</li>
                <li>Criterios de inclusión/exclusión</li>
                <li>Y todos los demás datos posteriores</li>
              </ul>
              <p className="text-amber-600 dark:text-amber-400 font-medium mt-2">
                Esta acción no se puede deshacer.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelBack}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBack}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, volver y borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!isLastStep && (
        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          size="lg"
        >
          {nextLabel}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      )}
    </div>
  )
}
