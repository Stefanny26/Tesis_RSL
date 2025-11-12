"use client"

import { WizardProvider, useWizard } from "@/components/project-wizard/wizard-context"
import { WizardHeader } from "@/components/project-wizard/wizard-header"
import { WizardNavigation } from "@/components/project-wizard/wizard-navigation"
import { ProposalStep } from "@/components/project-wizard/steps/1-proposal-step"
import { PicoMatrixStep } from "@/components/project-wizard/steps/2-pico-matrix-step"
import { TitlesStep } from "@/components/project-wizard/steps/3-titles-step"
import { SearchPlanStep } from "@/components/project-wizard/steps/4-search-plan-step"
import { ProtocolDefinitionStep } from "@/components/project-wizard/steps/5-protocol-definition-step"
import { PrismaCheckStep } from "@/components/project-wizard/steps/6-prisma-check-step"
import { ConfirmationStep } from "@/components/project-wizard/steps/7-confirmation-step"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

function WizardContent() {
  const { data, currentStep, updateData } = useWizard()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      toast({
        title: "💾 Guardando borrador...",
        description: "Los datos se están guardando localmente"
      })

      // Guardar en localStorage como borrador
      localStorage.setItem('project-wizard-draft', JSON.stringify({
        data,
        currentStep,
        lastSaved: new Date().toISOString()
      }))

      toast({
        title: "✅ Borrador guardado",
        description: "Puedes continuar más tarde desde donde dejaste"
      })
    } catch (error) {
      toast({
        title: "❌ Error al guardar",
        description: "No se pudo guardar el borrador",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const validateStep = () => {
    if (currentStep === 1) {
      return !!(data.projectName && data.projectDescription)
    }
    if (currentStep === 2) {
      return !!(
        data.pico?.population && data.pico?.intervention && data.pico?.outcome &&
        data.matrixIsNot?.is?.length > 0 && data.matrixIsNot?.isNot?.length > 0
      )
    }
    if (currentStep === 3) {
      return !!data.selectedTitle
    }
    if (currentStep === 4) {
      return data.searchPlan?.databases && data.searchPlan.databases.length > 0
    }
    return true
  }

  const canGoNext = validateStep()

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return <ProposalStep />
      case 2:
        return <PicoMatrixStep />
      case 3:
        return <TitlesStep />
      case 4:
        return <SearchPlanStep />
      case 5:
        return <ProtocolDefinitionStep />
      case 6:
        return <PrismaCheckStep />
      case 7:
        return <ConfirmationStep />
      default:
        return <ProposalStep />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <WizardHeader 
        onSaveDraft={handleSaveDraft}
        isSaving={isSaving}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-24">
          {renderStep()}
        </div>
      </main>

      <WizardNavigation 
        canGoNext={canGoNext}
        onNext={() => {
          if (validateStep()) {
            updateData({ currentStep: currentStep + 1 })
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
        onBack={() => {
          if (currentStep > 1) {
            updateData({ currentStep: currentStep - 1 })
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
      />
    </div>
  )
}

export default function NewProjectWizardPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  )
}
