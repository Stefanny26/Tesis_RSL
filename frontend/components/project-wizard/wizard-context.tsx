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
    contenido?: string
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
  clearDataAfterStep: (step: number) => void
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
  const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const totalSteps = 7

  // Cargar protocolo existente si se pasa projectId
  useEffect(() => {
    async function loadExistingProtocol() {
      if (!projectId) {
        // Si no hay projectId, intentar cargar borrador local
        try {
          const draft = localStorage.getItem('wizard-draft')
          if (draft) {
            const parsed = JSON.parse(draft)
            const ageMinutes = (Date.now() - new Date(parsed.timestamp).getTime()) / 60000
            
            // Si el borrador tiene menos de 24 horas, cargar
            if (ageMinutes < 1440) {
              console.log('📥 Restaurando borrador local (guardado hace', Math.round(ageMinutes), 'minutos)')
              setData(prev => ({ ...prev, ...parsed.data }))
              setCurrentStep(parsed.currentStep)
            } else {
              console.log('🧹 Borrador local expirado, limpiando')
              localStorage.removeItem('wizard-draft')
            }
          }
        } catch (error) {
          console.error('Error cargando borrador local:', error)
        }
        
        setIsLoading(false)
        return
      }
      
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

  // Limpieza de proyectos temporales cuando el usuario abandona el wizard
  useEffect(() => {
    const cleanupTemporaryProject = async () => {
      // Solo limpiar si es un proyecto temporal (creado en step 6 pero no completado en step 7)
      if (data.projectId && currentStep < 7) {
        try {
          // Verificar si el proyecto es temporal
          const projectDetails = await apiClient.getProject(data.projectId)
          
          if (projectDetails?.data?.project?.status === 'temporary' || 
              projectDetails?.data?.project?.title?.startsWith('[TEMPORAL]')) {
            
            console.log('🧹 Eliminando proyecto temporal al abandonar wizard:', data.projectId)
            await apiClient.deleteProject(data.projectId)
            console.log('✅ Proyecto temporal eliminado exitosamente')
          }
        } catch (error) {
          console.error('❌ Error al eliminar proyecto temporal:', error)
          // No es crítico si falla - se puede limpiar manualmente después
        }
      }
    }

    // Manejador para cuando el usuario cierra la pestaña o navega fuera
    const handleBeforeUnload = () => {
      // Solo marcar para limpieza si hay proyecto temporal
      if (data.projectId && currentStep < 7) {
        // Usar navigator.sendBeacon para envío asíncrono que no bloquee
        const payload = JSON.stringify({ 
          projectId: data.projectId, 
          action: 'cleanup-temporary' 
        })
        
        try {
          navigator.sendBeacon('/api/projects/cleanup-temporary-project', payload)
        } catch (error) {
          console.error('Error enviando señal de limpieza:', error)
        }
      }
    }

    // Agregar event listener para detección de abandono
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Limpiar proyecto temporal cuando el componente se desmonte
    // (usuario navega fuera del wizard sin completar)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      // Limpiar timeout de auto-guardado pendiente
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId)
      }
      
      if (data.projectId && currentStep < 7) {
        // Ejecutar limpieza de forma asíncrona
        cleanupTemporaryProject()
      }
    }
  }, [data.projectId, currentStep, saveTimeoutId])

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => {
      const newData = { ...prev, ...updates }
      
      // Auto-guardar en localStorage (backup local)
      try {
        const key = projectId || 'wizard-draft'
        localStorage.setItem(key, JSON.stringify({
          data: newData,
          currentStep,
          timestamp: new Date().toISOString()
        }))
        console.log('💾 Progreso guardado en localStorage')
      } catch (error) {
        console.error('Error guardando en localStorage:', error)
      }
      
      // Auto-guardar en backend con debouncing (esperar 2 segundos sin cambios)
      if (projectId) {
        // Cancelar guardado anterior si existe
        if (saveTimeoutId) {
          clearTimeout(saveTimeoutId)
        }
        
        // Programar nuevo guardado
        const timeoutId = setTimeout(async () => {
          try {
            await apiClient.updateProtocol(projectId, {
              ...updates,
              lastSaved: new Date().toISOString()
            })
            console.log('✅ Auto-guardado en servidor')
          } catch (error) {
            console.error('❌ Error en auto-guardado:', error)
          }
        }, 2000) // Esperar 2 segundos sin cambios
        
        setSaveTimeoutId(timeoutId)
      }
      
      return newData
    })
  }

  const resetData = () => {
    setData(initialData)
    setCurrentStep(1)
  }

  // Función para limpiar datos generados después de un paso específico
  const clearDataAfterStep = async (targetStep: number) => {
    const updates: Partial<WizardData> = {}
    
    // Paso 1: Propuesta - limpiar todo lo posterior
    if (targetStep === 1) {
      updates.pico = { population: "", intervention: "", comparison: "", outcome: "" }
      updates.matrixIsNot = { is: [], isNot: [] }
      updates.matrixTable = []
      updates.generatedTitles = []
      updates.selectedTitle = ""
      updates.protocolJustification = ""
      updates.protocolTerms = { tecnologia: [], dominio: [], tipoEstudio: [], focosTematicos: [] }
      updates.confirmedTerms = { tecnologia: new Set(), dominio: new Set(), tipoEstudio: new Set(), focosTematicos: new Set() }
      updates.discardedTerms = { tecnologia: new Set(), dominio: new Set(), tipoEstudio: new Set(), focosTematicos: new Set() }
      updates.inclusionCriteria = []
      updates.exclusionCriteria = []
      updates.searchPlan = {
        databases: [],
        temporalRange: { start: 2019, end: new Date().getFullYear() },
        searchQueries: [],
        uploadedFiles: []
      }
      updates.prismaItems = []
    }
    
    // Paso 2: PICO + Matriz - limpiar títulos y todo lo posterior
    if (targetStep === 2) {
      updates.generatedTitles = []
      updates.selectedTitle = ""
      updates.protocolJustification = ""
      updates.protocolTerms = { tecnologia: [], dominio: [], tipoEstudio: [], focosTematicos: [] }
      updates.confirmedTerms = { tecnologia: new Set(), dominio: new Set(), tipoEstudio: new Set(), focosTematicos: new Set() }
      updates.discardedTerms = { tecnologia: new Set(), dominio: new Set(), tipoEstudio: new Set(), focosTematicos: new Set() }
      updates.inclusionCriteria = []
      updates.exclusionCriteria = []
      updates.searchPlan = {
        databases: [],
        temporalRange: { start: 2019, end: new Date().getFullYear() },
        searchQueries: [],
        uploadedFiles: []
      }
      updates.prismaItems = []
    }
    
    // Paso 3: Títulos - limpiar definición del protocolo y criterios
    if (targetStep === 3) {
      updates.protocolTerms = { tecnologia: [], dominio: [], tipoEstudio: [], focosTematicos: [] }
      updates.confirmedTerms = { tecnologia: new Set(), dominio: new Set(), tipoEstudio: new Set(), focosTematicos: new Set() }
      updates.discardedTerms = { tecnologia: new Set(), dominio: new Set(), tipoEstudio: new Set(), focosTematicos: new Set() }
      updates.inclusionCriteria = []
      updates.exclusionCriteria = []
      updates.searchPlan = {
        databases: [],
        temporalRange: { start: 2019, end: new Date().getFullYear() },
        searchQueries: [],
        uploadedFiles: []
      }
      updates.prismaItems = []
    }
    
    // Paso 4: Definición - limpiar criterios I/E
    if (targetStep === 4) {
      updates.inclusionCriteria = []
      updates.exclusionCriteria = []
      updates.searchPlan = {
        databases: [],
        temporalRange: { start: 2019, end: new Date().getFullYear() },
        searchQueries: [],
        uploadedFiles: []
      }
      updates.prismaItems = []
    }
    
    // Paso 5: Criterios I/E - limpiar plan de búsqueda
    if (targetStep === 5) {
      updates.searchPlan = {
        databases: [],
        temporalRange: { start: 2019, end: new Date().getFullYear() },
        searchQueries: [],
        uploadedFiles: []
      }
      updates.prismaItems = []
    }
    
    // Paso 6: Búsqueda - limpiar PRISMA
    if (targetStep === 6) {
      updates.prismaItems = []
    }
    
    // Actualizar el estado local
    setData(prev => ({ ...prev, ...updates }))
    
    // Si hay un projectId, actualizar también en el backend
    if (data.projectId) {
      try {
        await apiClient.updateProtocol(data.projectId, updates)
        console.log('✅ Datos limpiados en el servidor')
      } catch (error) {
        console.error('❌ Error limpiando datos en el servidor:', error)
      }
    }
  }

  const contextValue = useMemo(() => ({
    data,
    updateData,
    resetData,
    clearDataAfterStep,
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
