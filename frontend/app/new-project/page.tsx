"use client"

import { apiClient } from "@/lib/api-client"
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

  const handleSaveDraft = () => {
    toast({
      title: "💾 Borrador guardado",
      description: "El progreso se ha guardado localmente"
    })
  }

  const handleCreateProject = async () => {
    setIsSaving(true)
    try {
      const payload = {
        title: data.projectName,
        description: data.projectDescription || "Proyecto de revisión sistemática",
        researchArea: data.researchArea,
        status: "draft"
      }

      const project = await apiClient.createProject(payload)

      toast({
        title: "✅ Proyecto creado",
        description: "El proyecto fue creado correctamente"
      })

      window.location.href = `/projects/${project.id}`
    } catch (err) {
      console.error(err)
      toast({
        title: "❌ Error creando proyecto",
        description: "Revisa los datos ingresados",
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
      const hasBasicPICO = !!(
        data.pico?.population &&
        data.pico?.intervention &&
        data.pico?.outcome
      )
      const hasMatrix =
        (data.matrixIsNot?.is?.length > 0 &&
          data.matrixIsNot?.isNot?.length > 0) ||
        (data.matrixTable && data.matrixTable.length > 0)

      return hasBasicPICO && hasMatrix
    }
    if (currentStep === 3) return !!data.selectedTitle
    if (currentStep === 4) {
      return (
        data.protocolTerms?.tecnologia?.length > 0 ||
        data.protocolTerms?.dominio?.length > 0
      )
    }
    if (currentStep === 5) {
      return (
        data.inclusionCriteria.length > 0 &&
        data.exclusionCriteria.length > 0
      )
    }
    if (currentStep === 6) {
      // Requiere: bases de datos seleccionadas Y referencias cargadas
      const hasDatabases = (data.searchPlan?.databases?.length ?? 0) > 0
      const hasReferences = data.searchPlan?.uploadedFiles && data.searchPlan.uploadedFiles.length > 0
      const totalReferences = hasReferences 
        ? (data.searchPlan?.uploadedFiles ?? []).reduce((sum, f) => sum + f.recordCount, 0)
        : 0
      
      return hasDatabases && hasReferences && totalReferences > 0
    }
    return true
  }

  const getValidationMessage = () => {
    if (currentStep === 6) {
      const hasDatabases = (data.searchPlan?.databases?.length ?? 0) > 0
      const hasReferences = data.searchPlan?.uploadedFiles && data.searchPlan.uploadedFiles.length > 0
      
      if (!hasDatabases) return "Genera las cadenas de búsqueda primero"
      if (!hasReferences) return "Carga referencias desde al menos una base de datos"
      return ""
    }
    return ""
  }

  const canGoNext = validateStep()
  const validationMessage = getValidationMessage()

  const renderStep = () => {
    switch (currentStep) {
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
      <WizardHeader onSaveDraft={handleSaveDraft} isSaving={isSaving} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-24">{renderStep()}</div>
      </main>

      <WizardNavigation
        canGoNext={canGoNext}
        isLastStep={currentStep === 7}
        nextLabel={validationMessage || "Siguiente"}
        onNext={() => {
          if (!validateStep()) return

          if (currentStep === 7) {
            handleCreateProject()
          } else {
            updateData({ currentStep: currentStep + 1 })
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
        }}
        onBack={() => {
          if (currentStep > 1) {
            updateData({ currentStep: currentStep - 1 })
            window.scrollTo({ top: 0, behavior: "smooth" })
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
