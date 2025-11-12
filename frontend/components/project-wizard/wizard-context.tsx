"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type AIProvider = 'chatgpt' | 'gemini'

export interface WizardData {
  // Paso 1: Propuesta
  projectName: string
  projectDescription: string
  
  // Paso 2: PICO + Matriz Es/No Es
  pico: {
    population: string
    intervention: string
    comparison: string
    outcome: string
  }
  matrixIsNot: {
    is: string[]
    isNot: string[]
  }
  
  // Paso 3: Títulos (5 opciones generadas)
  generatedTitles: Array<{
    title: string
    justification: string
    cochraneCompliance: string
  }>
  selectedTitle: string
  
  // Paso 4: Plan de búsqueda + Criterios
  searchPlan: {
    databases: Array<{
      name: string
      searchString: string
      dateRange: string
    }>
    keywords: string[]
    temporalRange: { start: number; end: number; justification: string }
  }
  inclusionCriteria: string[]
  exclusionCriteria: string[]
  
  // Paso 5: Definición de Términos del Protocolo
  protocolDefinition: {
    technologies: string[]
    applicationDomain: string[]
    studyType: string[]
    thematicFocus: string[]
  }
  
  // Paso 6: PRISMA Checklist
  prismaItems: Array<{
    number: number
    item: string
    complies: boolean | null
    evidence: string
    stage: string // En qué etapa se completa
  }>
  
  // Metadatos
  aiProvider: AIProvider
  lastSaved: Date | null
  currentStep: number
}

interface WizardContextType {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
  resetData: () => void
  currentStep: number
  setCurrentStep: (step: number) => void
  totalSteps: number
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

const initialData: WizardData = {
  projectName: "",
  projectDescription: "",
  pico: { population: "", intervention: "", comparison: "", outcome: "" },
  matrixIsNot: { is: [], isNot: [] },
  generatedTitles: [],
  selectedTitle: "",
  searchPlan: {
    databases: [],
    keywords: [],
    temporalRange: { start: 2019, end: 2025, justification: "" }
  },
  inclusionCriteria: [],
  exclusionCriteria: [],
  protocolDefinition: {
    technologies: [],
    applicationDomain: [],
    studyType: [],
    thematicFocus: []
  },
  prismaItems: [],
  aiProvider: 'gemini',
  lastSaved: null,
  currentStep: 1
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WizardData>(initialData)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const resetData = () => {
    setData(initialData)
    setCurrentStep(1)
  }

  return (
    <WizardContext.Provider
      value={{
        data,
        updateData,
        resetData,
        currentStep,
        setCurrentStep,
        totalSteps
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error("useWizard must be used within WizardProvider")
  }
  return context
}
