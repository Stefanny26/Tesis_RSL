"use client"

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
  const { currentStep, setCurrentStep, totalSteps } = useWizard()
  const router = useRouter()

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
    if (onBack) {
      onBack()
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  return (
    <div className="flex items-center justify-between pt-6 border-t bg-white sticky bottom-0 pb-6">
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
                Si cancelas ahora, perderás todos los cambios no guardados. 
                Considera usar "Guardar borrador" antes de salir.
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
