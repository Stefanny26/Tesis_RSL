"use client"

import { WizardProvider, useWizard } from "@/components/project-wizard/wizard-context"
import { WizardHeader } from "@/components/project-wizard/wizard-header"
import { WizardNavigation } from "@/components/project-wizard/wizard-navigation"
import { ProposalStep } from "@/components/project-wizard/steps/1-proposal-step"
import { PicoMatrixStep } from "@/components/project-wizard/steps/2-pico-matrix-step"
import { TitlesStep } from "@/components/project-wizard/steps/3-titles-step"
import { CriteriaStep } from "@/components/project-wizard/steps/4-criteria-step"
import { ProtocolDefinitionStep } from "@/components/project-wizard/steps/5-protocol-definition-step"
import { SearchPlanStep } from "@/components/project-wizard/steps/6-search-plan-step"
import { PrismaCheckStep } from "@/components/project-wizard/steps/7-prisma-check-step"
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
      return !!(data.projectName && data.projectDescription && data.researchArea)
    }
    if (currentStep === 2) {
      const hasBasicPICO = !!(data.pico?.population && data.pico?.intervention && data.pico?.outcome)
      const hasMatrix = (data.matrixIsNot?.is?.length > 0 && data.matrixIsNot?.isNot?.length > 0) || 
                        (data.matrixTable && data.matrixTable.length > 0)
      return hasBasicPICO && hasMatrix
    }
    if (currentStep === 3) {
      return !!data.selectedTitle
    }
    if (currentStep === 4) {
      // Paso 4: Definición (Términos del Protocolo)
      return !!(data.protocolTerms?.tecnologia?.length > 0 || data.protocolTerms?.dominio?.length > 0)
    }
    if (currentStep === 5) {
      // Paso 5: Criterios I/E (alimentados por términos)
      return data.inclusionCriteria.length > 0 && data.exclusionCriteria.length > 0
    }
    if (currentStep === 6) {
      // Paso 6: Búsqueda - Al menos una base seleccionada
      return data.searchPlan?.databases && data.searchPlan.databases.length > 0
    }
    if (currentStep === 7) {
      // Paso 7: PRISMA y Confirmación - último paso
      return true
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
        return <ProtocolDefinitionStep />
      case 5:
        return <CriteriaStep />
      case 6:
        return <SearchPlanStep />
      case 7:
        return <PrismaCheckStep />
      default:
        return <ProposalStep />
    }
  }

  return (
    <div className="min-h-screen bg-background">
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
        isLastStep={currentStep === 7}
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
