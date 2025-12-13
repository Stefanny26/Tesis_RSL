"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type AIProvider = 'chatgpt' | 'gemini'

export interface WizardData {
  // Metadata del proyecto (se crea al avanzar al Paso 6)
  projectId?: string
  
  // Paso 1: Propuesta
  projectName: string
  projectDescription: string
  researchArea: string // Nueva: área/disciplina de investigación
  yearStart?: number // Año inicial del rango temporal
  yearEnd?: number // Año final del rango temporal
  
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
  matrixTable?: Array<{
    pregunta: string
    presente: 'si' | 'no' | 'parcial'
    justificacion: string
  }>
  
  // Paso 3: Títulos
  generatedTitles: Array<{
    title: string
    spanishTitle: string
    justification: string
    cochraneCompliance: string
  }>
  selectedTitle: string
  protocolJustification?: string  // Justificación completa del protocolo (4 párrafos integrados)
  
  // Paso 4: Términos del Protocolo (ANTES de criterios)
  protocolTerms?: {
    tecnologia?: string[]
    dominio?: string[]
    tipoEstudio?: string[]
    focosTematicos?: string[]
  }
  
  // Paso 5: Criterios I/E (alimentados por términos)
  inclusionCriteria: string[]
  exclusionCriteria: string[]
  
  // Paso 6: Búsqueda (Plan de búsqueda + Estrategia)
  searchPlan: {
    databases: Array<{
      name: string
      searchString: string
      explanation?: string
      dateRange: string
      resultCount?: number | null
      status?: 'pending' | 'searching' | 'completed' | 'error'
      hasAPI?: boolean
      connectionStatus?: 'requires_key' | 'available' | 'manual'
    }>
    temporalRange: {
      start: number
      end: number
    }
    searchQueries?: Array<{
      databaseId: string
      databaseName: string
      query: string
      baseQuery: string
      hasAPI: boolean
      apiRequired: boolean
      status: 'pending' | 'searching' | 'completed' | 'error'
      resultCount: number | null
      lastSearched: string | null
      connectionStatus: 'requires_key' | 'available' | 'manual'
      note?: string
    }>
    uploadedFiles?: Array<{
      filename: string
      format: 'csv' | 'ris' | 'bib'
      recordCount: number
      uploadedAt: string
      databaseId: string
      databaseName: string
      data: any[]
    }>
  }
  
  protocolDefinition: {
    technologies: string[]
    applicationDomain: string[]
    studyType: string[]
    thematicFocus: string[]
  }
  
  // Paso 7: PRISMA Checklist
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
  researchArea: "",
  pico: { population: "", intervention: "", comparison: "", outcome: "" },
  matrixIsNot: { is: [], isNot: [] },
  generatedTitles: [],
  selectedTitle: "",
  protocolJustification: "",
  protocolTerms: {
    tecnologia: [],
    dominio: [],
    tipoEstudio: [],
    focosTematicos: []
  },
  inclusionCriteria: [],
  exclusionCriteria: [],
  searchPlan: {
    databases: [],
    temporalRange: {
      start: 2019,
      end: new Date().getFullYear()
    },
    searchQueries: [],
    uploadedFiles: []
  },
  protocolDefinition: {
    technologies: [],
    applicationDomain: [],
    studyType: [],
    thematicFocus: []
  },
  prismaItems: [],
  aiProvider: 'chatgpt',
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
