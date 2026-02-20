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
import { useSearchParams } from "next/navigation"

function WizardContent() {
  const { data, currentStep, updateData } = useWizard()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const handleCreateProject = async () => {
    setIsSaving(true)
    try {
      let projectId: string
      
      // Si ya existe un proyecto temporal (creado en paso 6), actualizarlo
      if (data.projectId) {
        const updatePayload = {
          title: data.projectName, // Quitar prefijo [TEMPORAL]
          description: data.projectDescription || "Proyecto de revisión sistemática",
          researchArea: data.researchArea,
          status: "draft" // Cambiar de 'temporary' a 'draft'
        }
        
        await apiClient.updateProject(data.projectId, updatePayload)
        projectId = data.projectId
        
        toast({
          title: "✅ Proyecto actualizado",
          description: "Tu proyecto con referencias queda listo"
        })
      } else {
        // Si NO existe proyecto, crear uno nuevo
        const payload = {
          title: data.projectName,
          description: data.projectDescription || "Proyecto de revisión sistemática",
          researchArea: data.researchArea,
          status: "draft"
        }
        
        const project = await apiClient.createProject(payload)
        projectId = project.id
        
        toast({
          title: "✅ Proyecto creado",
          description: "El proyecto fue creado correctamente"
        })
      }

      // Redirigir al proyecto (temporal actualizado o nuevo)
      window.location.href = `/projects/${projectId}`
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
      // Solo validar que haya algo generado, no requiere completitud
      return !!(data.pico?.population || data.pico?.intervention)
    }
    if (currentStep === 3) {
      // No validar, permitir avanzar
      return true
    }
    if (currentStep === 4) {
      // Validar que haya términos generados
      const hasTerms = 
        (data.protocolTerms?.tecnologia?.length ?? 0) > 0 ||
        (data.protocolTerms?.dominio?.length ?? 0) > 0 ||
        (data.protocolTerms?.focosTematicos?.length ?? 0) > 0
      
      // Validar que al menos un término esté confirmado
      const hasConfirmed = 
        (data.confirmedTerms?.tecnologia?.size ?? 0) > 0 ||
        (data.confirmedTerms?.dominio?.size ?? 0) > 0 ||
        (data.confirmedTerms?.focosTematicos?.size ?? 0) > 0
      
      return hasTerms && hasConfirmed
    }
    if (currentStep === 5) {
      // No validar criterios, permitir avanzar
      return true
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
    // Solo mostrar mensajes en los pasos que requieren validación
    if (currentStep === 4) {
      const hasTerms = 
        (data.protocolTerms?.tecnologia?.length ?? 0) > 0 ||
        (data.protocolTerms?.dominio?.length ?? 0) > 0 ||
        (data.protocolTerms?.focosTematicos?.length ?? 0) > 0
      
      const hasConfirmed = 
        (data.confirmedTerms?.tecnologia?.size ?? 0) > 0 ||
        (data.confirmedTerms?.dominio?.size ?? 0) > 0 ||
        (data.confirmedTerms?.focosTematicos?.size ?? 0) > 0
      
      if (!hasTerms) return "Genera términos con IA o agrégalos manualmente"
      if (!hasConfirmed) return "Confirma al menos un término con ✓"
    }
    if (currentStep === 6) {
      const hasDatabases = (data.searchPlan?.databases?.length ?? 0) > 0
      const hasReferences = data.searchPlan?.uploadedFiles && data.searchPlan.uploadedFiles.length > 0
      
      if (!hasDatabases) return "Genera las cadenas de búsqueda primero"
      if (!hasReferences) return "Carga referencias desde al menos una base de datos"
    }
    
    // Si no hay mensaje de validación, retornar "Siguiente"
    return "Siguiente"
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
      <WizardHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-24">{renderStep()}</div>
      </main>

      <WizardNavigation
        canGoNext={canGoNext}
        isLastStep={currentStep === 7}
        nextLabel={validationMessage}
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
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  
  // Si NO hay projectId, es un proyecto completamente nuevo - limpiar localStorage
  if (!projectId) {
    try {
      localStorage.removeItem('wizard-draft')
    } catch (e) {
      // Non-critical: localStorage may be unavailable (e.g., private browsing)
    }
  }
  
  return (
    <WizardProvider projectId={projectId || undefined}>
      <WizardContent />
    </WizardProvider>
  )
}
