"use client"

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react"
import { apiClient } from "@/lib/api-client"

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
  
  // Estado de validación de términos (cuáles están confirmados y rechazados)
  confirmedTerms?: {
    tecnologia?: Set<number>
    dominio?: Set<number>
    tipoEstudio?: Set<number>
    focosTematicos?: Set<number>
  }
  
  discardedTerms?: {
    tecnologia?: Set<number>
    dominio?: Set<number>
    tipoEstudio?: Set<number>
    focosTematicos?: Set<number>
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
  confirmedTerms: {
    tecnologia: new Set(),
    dominio: new Set(),
    tipoEstudio: new Set(),
    focosTematicos: new Set()
  },
  discardedTerms: {
    tecnologia: new Set(),
    dominio: new Set(),
    tipoEstudio: new Set(),
    focosTematicos: new Set()
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

interface WizardProviderProps {
  readonly children: ReactNode
  readonly projectId?: string // Si se pasa, carga el protocolo existente
  readonly projectData?: { title: string; description: string; researchArea?: string } // Datos básicos del proyecto
}

export function WizardProvider({ children, projectId, projectData }: WizardProviderProps) {
  const [data, setData] = useState<WizardData>(initialData)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(!!projectId)
  const totalSteps = 7

  // Cargar protocolo existente si se pasa projectId
  useEffect(() => {
    async function loadExistingProtocol() {
      if (!projectId) return
      
      try {
        console.log('🔍 Cargando protocolo existente para proyecto:', projectId)
        const protocol = await apiClient.getProtocol(projectId)
        console.log('📋 Protocolo recibido:', protocol)
        
        if (protocol) {
          // Mapear datos del protocolo al formato del wizard
          const loadedData: Partial<WizardData> = {
            projectId: projectId,
            projectName: projectData?.title || "",
            projectDescription: protocol.refinedQuestion || projectData?.description || "",
            researchArea: projectData?.researchArea || "",
            
            // PICO
            pico: {
              population: protocol.population || "",
              intervention: protocol.intervention || "",
              comparison: protocol.comparison || "",
              outcome: protocol.outcomes || ""
            },
            
            // Matriz Es/No Es
            matrixIsNot: {
              is: protocol.isMatrix || [],
              isNot: protocol.isNotMatrix || []
            },
            
            // Título seleccionado
            selectedTitle: protocol.proposedTitle || projectData?.title || "",
            
            // Términos del protocolo
            protocolDefinition: protocol.keyTerms || {
              technologies: [],
              applicationDomain: [],
              studyType: [],
              thematicFocus: []
            },
            
            // Criterios
            inclusionCriteria: protocol.inclusionCriteria || [],
            exclusionCriteria: protocol.exclusionCriteria || [],
            
            // Plan de búsqueda
            searchPlan: {
              databases: (protocol.searchQueries || []).map((q: any) => ({
                name: q.databaseName || q.database || "",
                searchString: q.query || "",
                dateRange: `${protocol.temporalRange?.start || 2019}-${protocol.temporalRange?.end || new Date().getFullYear()}`,
                resultCount: q.resultsCount || null,
                status: q.status || 'pending',
                hasAPI: q.hasAPI || false,
                connectionStatus: q.apiRequired ? 'requires_key' : 'available'
              })),
              temporalRange: {
                start: protocol.temporalRange?.start || 2019,
                end: protocol.temporalRange?.end || new Date().getFullYear()
              },
              searchQueries: protocol.searchQueries || []
            },
            
            // Rango temporal
            yearStart: protocol.temporalRange?.start || 2019,
            yearEnd: protocol.temporalRange?.end || new Date().getFullYear(),
            
            // PRISMA - ahora se carga desde API /api/projects/:id/prisma
            prismaItems: []
            // prismaCompliance deprecado - usar endpoint /prisma
          }
          
          setData(prev => ({ ...prev, ...loadedData }))
          console.log('✅ Protocolo cargado en wizard')
        }
      } catch (error) {
        console.error("❌ Error cargando protocolo:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadExistingProtocol()
  }, [projectId, projectData])

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const resetData = () => {
    setData(initialData)
    setCurrentStep(1)
  }

  const contextValue = useMemo(() => ({
    data,
    updateData,
    resetData,
    currentStep,
    setCurrentStep,
    totalSteps
  }), [data, currentStep])

  return (
    <WizardContext.Provider value={contextValue}>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Cargando protocolo...</div>
        </div>
      ) : (
        children
      )}
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
