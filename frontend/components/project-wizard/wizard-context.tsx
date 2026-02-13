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
  const [isInitialized, setIsInitialized] = useState(!projectId) // true si no hay projectId (nuevo proyecto), false si es draft (necesita carga)
  const totalSteps = 7

  // Función para determinar el paso actual basado en los datos cargados
  const determineCurrentStep = (loadedData: Partial<WizardData>): number => {
    console.log('📊 Determinando paso actual basado en datos:', {
      hasProjectName: !!loadedData.projectName,
      hasProjectDescription: !!loadedData.projectDescription,
      hasPico: !!(loadedData.pico?.population && loadedData.pico?.intervention),
      hasMatrix: !!(loadedData.matrixIsNot?.is?.length || loadedData.matrixIsNot?.isNot?.length),
      hasTitle: !!loadedData.selectedTitle,
      hasCriteria: !!(loadedData.inclusionCriteria?.length || loadedData.exclusionCriteria?.length),
      hasTerms: !!(loadedData.protocolDefinition && 
                   (loadedData.protocolDefinition.technologies?.length ||
                    loadedData.protocolDefinition.applicationDomain?.length ||
                    loadedData.protocolDefinition.studyType?.length ||
                    loadedData.protocolDefinition.thematicFocus?.length)),
      hasSearchPlan: !!(loadedData.searchPlan?.databases?.length),
      hasReferences: !!(loadedData.searchPlan?.uploadedFiles?.length)
    })

    // Step 7: Si tiene referencias cargadas -> Paso de revisión/finalización (PrismaCheckStep)
    if (loadedData.searchPlan?.uploadedFiles?.length && loadedData.searchPlan.uploadedFiles.length > 0) {
      console.log('📚 Referencias detectadas, dirigiendo a step 7 (PrismaCheckStep)')
      return 7
    }

    // Step 6: Si tiene plan de búsqueda configurado -> Carga de referencias (SearchPlanStep)
    if (loadedData.searchPlan?.databases?.length && loadedData.searchPlan.databases.length > 0) {
      console.log('🔍 Plan de búsqueda detectado, dirigiendo a step 6 (SearchPlanStep)')
      return 6
    }

    // Step 5: Si tiene términos del protocolo definidos -> Plan de búsqueda (ProtocolDefinitionStep)
    if (loadedData.protocolDefinition && 
        (loadedData.protocolDefinition.technologies?.length ||
         loadedData.protocolDefinition.applicationDomain?.length ||
         loadedData.protocolDefinition.studyType?.length ||
         loadedData.protocolDefinition.thematicFocus?.length)) {
      console.log('🏷️ Términos del protocolo detectados, dirigiendo a step 5 (ProtocolDefinitionStep)')
      return 5
    }

    // Step 4: Si tiene criterios definidos -> Definición de términos (CriteriaStep completado, ir a ProtocolDefinitionStep)
    if (loadedData.inclusionCriteria?.length || loadedData.exclusionCriteria?.length) {
      console.log('✅ Criterios detectados, dirigiendo a step 5 (siguiente: ProtocolDefinitionStep)')
      return 5
    }

    // Step 3: Si tiene título seleccionado -> Criterios (TitlesStep completado, ir a CriteriaStep)
    if (loadedData.selectedTitle && loadedData.selectedTitle.trim()) {
      console.log('📝 Título detectado, dirigiendo a step 4 (siguiente: CriteriaStep)')
      return 4
    }

    // Step 2: Si tiene PICO o matriz Es/No Es -> Selección de título (PicoMatrixStep completado, ir a TitlesStep)
    if ((loadedData.pico?.population || loadedData.pico?.intervention || 
         loadedData.pico?.comparison || loadedData.pico?.outcome) ||
        (loadedData.matrixIsNot?.is?.length || loadedData.matrixIsNot?.isNot?.length)) {
      console.log('🎯 Marco PICO/Matriz detectado, dirigiendo a step 3 (siguiente: TitlesStep)')
      return 3
    }

    // Step 1: Si tiene información básica del proyecto -> Continuar desde tema (ProposalStep completado, ir a PicoMatrixStep)
    if (loadedData.projectName || loadedData.projectDescription) {
      console.log('📄 Información básica detectada, dirigiendo a step 2 (siguiente: PicoMatrixStep)')
      return 2
    }

    // Default: Empezar desde el principio
    console.log('🆕 Sin información previa, empezando desde step 1')
    return 1
  }

  // Cargar protocolo existente si se pasa projectId
  useEffect(() => {
    async function loadExistingProtocol() {
      if (!projectId) {
        // Si no hay projectId, intentar cargar borrador local MEJORADO
        try {
          const draft = localStorage.getItem('wizard-draft')
          if (draft) {
            const parsed = JSON.parse(draft)
            const ageMinutes = (Date.now() - new Date(parsed.timestamp).getTime()) / 60000
            
            // Aumentar tiempo de vida del borrador de 24h a 7 días
            if (ageMinutes < 10080) { // 7 días en minutos
              console.log('📥 Restaurando borrador local (guardado hace', Math.round(ageMinutes), 'minutos)')
              setData(prev => ({ 
                ...prev, 
                ...parsed.data,
                lastSaved: new Date(parsed.timestamp) 
              }))
              setCurrentStep(parsed.currentStep || determineCurrentStep(parsed.data))
              
              // Si el borrador tiene projectId, cargar también del servidor
              if (parsed.data.projectId) {
                console.log('🔄 Borrador tiene projectId, sincronizando con servidor...')
                try {
                  const serverProtocol = await apiClient.getProtocol(parsed.data.projectId)
                  if (serverProtocol) {
                    // Combinar datos locales (más recientes) con servidor (respaldo)
                    console.log('✅ Datos del servidor obtenidos, combinando con borrador local')
                  }
                } catch (serverError) {
                  console.warn('⚠️ No se pudo sincronizar con servidor, usando borrador local')
                }
              }
            } else {
              console.log('🧹 Borrador local expirado (más de 7 días), limpiando')
              localStorage.removeItem('wizard-draft')
            }
          }
        } catch (error) {
          console.error('Error cargando borrador local:', error)
          localStorage.removeItem('wizard-draft') // Limpiar borrador corrupto
        }
        
        setIsLoading(false)
        return
      }
      
      try {
        console.log('🔍 Cargando protocolo existente para proyecto:', projectId)
        
        // Si no se pasó projectData, cargar los datos del proyecto primero
        let projectInfo = projectData
        if (!projectInfo) {
          try {
            const projectResponse = await apiClient.getProject(projectId)
            projectInfo = {
              title: projectResponse.title || projectResponse.data?.project?.title || "",
              description: projectResponse.description || projectResponse.data?.project?.description || "",
              researchArea: projectResponse.researchArea || projectResponse.data?.project?.researchArea || ""
            }
            console.log('📦 Datos del proyecto cargados:', projectInfo)
          } catch (err) {
            console.error('Error cargando datos del proyecto:', err)
          }
        }
        
        const protocol = await apiClient.getProtocol(projectId)
        console.log('📋 Protocolo recibido:', protocol)
        
        // Cargar referencias existentes del proyecto
        let uploadedFiles: any[] = []
        try {
          const referencesResponse = await apiClient.getReferences(projectId)
          if (referencesResponse && referencesResponse.length > 0) {
            // Agrupar referencias por fuente de base de datos
            const dbGroups: Record<string, any[]> = {}
            referencesResponse.forEach((ref: any) => {
              const source = ref.source || 'unknown'
              if (!dbGroups[source]) dbGroups[source] = []
              dbGroups[source].push(ref)
            })
            
            // Convertir a formato uploadedFiles
            uploadedFiles = Object.entries(dbGroups).map(([dbName, refs]) => ({
              name: `${dbName}_export.bib`,
              recordCount: refs.length,
              database: dbName,
              uploadedAt: new Date().toISOString()
            }))
            
            console.log('📚 Referencias cargadas:', uploadedFiles.length, 'archivos')
          }
        } catch (err) {
          console.error('Error cargando referencias:', err)
        }
        
        if (protocol) {
          // Mapear datos del protocolo al formato del wizard
          const loadedData: Partial<WizardData> = {
            projectId: projectId,
            projectName: projectInfo?.title || "",
            projectDescription: protocol.refinedQuestion || projectInfo?.description || "",
            // Cargar researchArea del protocolo si existe, o del proyecto como fallback
            researchArea: protocol.researchArea || projectInfo?.researchArea || "",
            
            // PICO - el backend puede devolverlo en picoFramework o campos directos
            pico: {
              population: protocol.picoFramework?.population || protocol.population || "",
              intervention: protocol.picoFramework?.intervention || protocol.intervention || "",
              comparison: protocol.picoFramework?.comparison || protocol.comparison || "",
              outcome: protocol.picoFramework?.outcomes || protocol.outcomes || ""
            },
            
            // Matriz Es/No Es
            matrixIsNot: {
              is: protocol.isMatrix || [],
              isNot: protocol.isNotMatrix || []
            },
            
            // Título seleccionado
            selectedTitle: protocol.proposedTitle || projectInfo?.title || "",
            
            // Términos del protocolo (formato wizard-internal)
            // Mapear keyTerms del protocolo al formato protocolTerms del wizard
            protocolTerms: {
              tecnologia: protocol.keyTerms?.technology || [],
              dominio: protocol.keyTerms?.domain || [],
              tipoEstudio: protocol.keyTerms?.studyType || [],
              focosTematicos: protocol.keyTerms?.themes || []
            },
            
            // Términos confirmados (asumimos todos confirmados al cargar desde servidor)
            confirmedTerms: {
              tecnologia: new Set((protocol.keyTerms?.technology || []).map((_: any, i: number) => i)),
              dominio: new Set((protocol.keyTerms?.domain || []).map((_: any, i: number) => i)),
              tipoEstudio: new Set((protocol.keyTerms?.studyType || []).map((_: any, i: number) => i)),
              focosTematicos: new Set((protocol.keyTerms?.themes || []).map((_: any, i: number) => i))
            },
            
            // Sin términos descartados al cargar desde servidor
            discardedTerms: {
              tecnologia: new Set<number>(),
              dominio: new Set<number>(),
              tipoEstudio: new Set<number>(),
              focosTematicos: new Set<number>()
            },
            
            // Términos del protocolo (formato legacy para paso 7)
            // Mapear keyTerms a estructura esperada por protocolDefinition
            protocolDefinition: {
              technologies: protocol.keyTerms?.technology || [],
              applicationDomain: protocol.keyTerms?.domain || [],
              studyType: protocol.keyTerms?.studyType || [],
              thematicFocus: protocol.keyTerms?.themes || []
            },
            
            // Criterios
            inclusionCriteria: protocol.inclusionCriteria || [],
            exclusionCriteria: protocol.exclusionCriteria || [],
            
            // Plan de búsqueda
            searchPlan: {
              databases: (protocol.searchStrategy?.searchQueries || protocol.searchQueries || []).map((q: any) => ({
                name: q.databaseName || q.database || "",
                searchString: q.query || "",
                dateRange: `${protocol.searchStrategy?.temporalRange?.start || 2019}-${protocol.searchStrategy?.temporalRange?.end || new Date().getFullYear()}`,
                resultCount: q.resultsCount || null,
                status: q.status || 'pending',
                hasAPI: q.hasAPI || false,
                connectionStatus: q.apiRequired ? 'requires_key' : 'available'
              })),
              temporalRange: {
                start: protocol.searchStrategy?.temporalRange?.start || 2019,
                end: protocol.searchStrategy?.temporalRange?.end || new Date().getFullYear()
              },
              searchQueries: protocol.searchStrategy?.searchQueries || protocol.searchQueries || [],
              uploadedFiles: uploadedFiles // Referencias cargadas del proyecto
            },
            
            // Rango temporal - cargar desde searchStrategy
            yearStart: protocol.searchStrategy?.temporalRange?.start || 2019,
            yearEnd: protocol.searchStrategy?.temporalRange?.end || new Date().getFullYear(),
            
            // PRISMA - ahora se carga desde API /api/projects/:id/prisma
            prismaItems: []
            // prismaCompliance deprecado - usar endpoint /prisma
          }
          
          setData(prev => ({ ...prev, ...loadedData }))
          
          // Determinar el paso actual basado en qué información está disponible
          const determinedStep = determineCurrentStep(loadedData)
          console.log('✅ Protocolo cargado en wizard, estableciendo step:', determinedStep)
          setCurrentStep(determinedStep)
          
          // Marcar como inicializado para permitir auto-guardado
          setIsInitialized(true)
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
      const newData = { ...prev, ...updates, lastSaved: new Date() }
      
      // Auto-guardar en localStorage (backup local MEJORADO)
      try {
        const key = projectId || 'wizard-draft'
        const draftData = {
          data: newData,
          currentStep,
          timestamp: new Date().toISOString(),
          version: '2.0' // Versionar para futures migraciones
        }
        localStorage.setItem(key, JSON.stringify(draftData))
        console.log('💾 Progreso guardado en localStorage (step', currentStep, ')')
      } catch (error) {
        console.error('Error guardando en localStorage:', error)
      }
      
      // Auto-guardar en backend MEJORADO con debouncing más agresivo
      // Solo auto-guardar si ya está inicializado (no durante carga de draft)
      if (newData.projectId && isInitialized) {
        // Cancelar guardado anterior si existe
        if (saveTimeoutId) {
          clearTimeout(saveTimeoutId)
        }
        
        // Programar nuevo guardado con menos delay para mejor UX
        const timeoutId = setTimeout(async () => {
          try {
            console.log('📡 Iniciando auto-guardado en servidor...')
            
            // Construir datos del protocolo incremental
            const protocolUpdates: any = {}
            
            // Solo incluir campos que han cambiado para optimizar
            if (updates.selectedTitle || updates.pico) {
              protocolUpdates.proposedTitle = newData.selectedTitle
              protocolUpdates.population = newData.pico?.population
              protocolUpdates.intervention = newData.pico?.intervention
              protocolUpdates.comparison = newData.pico?.comparison
              protocolUpdates.outcomes = newData.pico?.outcome
            }
            
            if (updates.inclusionCriteria || updates.exclusionCriteria) {
              protocolUpdates.inclusionCriteria = newData.inclusionCriteria
              protocolUpdates.exclusionCriteria = newData.exclusionCriteria
            }
            
            if (updates.searchPlan) {
              protocolUpdates.searchQueries = newData.searchPlan?.searchQueries || []
              protocolUpdates.searchString = newData.searchPlan?.searchQueries?.[0]?.query || ''
            }
            
            // Soportar ambas estructuras: protocolDefinition (preferido) y protocolTerms (legacy)
            if (updates.protocolDefinition || updates.protocolTerms) {
              protocolUpdates.keyTerms = {
                technology: newData.protocolDefinition?.technologies || newData.protocolTerms?.tecnologia || [],
                domain: newData.protocolDefinition?.applicationDomain || newData.protocolTerms?.dominio || [],
                studyType: newData.protocolDefinition?.studyType || newData.protocolTerms?.tipoEstudio || [],
                themes: newData.protocolDefinition?.thematicFocus || newData.protocolTerms?.focosTematicos || []
              }
            }
            
            // Guardar researchArea si ha cambiado
            if (updates.researchArea) {
              protocolUpdates.researchArea = newData.researchArea
            }
            
            // Guardar protocolo (createOrUpdate)
            await apiClient.updateProtocol(newData.projectId, {
              ...protocolUpdates,
              lastSaved: new Date().toISOString()
            })
            
            console.log('✅ Auto-guardado exitoso en servidor')
            
            // También actualizar datos básicos del proyecto si han cambiado
            if (updates.selectedTitle || updates.projectDescription || updates.researchArea) {
              await apiClient.updateProject(newData.projectId, {
                title: newData.selectedTitle,
                description: newData.projectDescription,
                researchArea: newData.researchArea,
                status: 'draft' // Mantener como borrador hasta step 7
              })
              console.log('✅ Datos del proyecto actualizados')
            }
            
          } catch (error) {
            console.error('❌ Error en auto-guardado:', error)
            // No mostrar error al usuario para no interrumpir el flujo
          }
        }, 1000) // Reducido de 2000ms a 1000ms para guardado más frecuente
        
        setSaveTimeoutId(timeoutId)
      }
      
      return newData
    })
  }

  const resetData = () => {
    setData(initialData)
    setCurrentStep(1)
    
    // Limpiar también localStorage
    try {
      localStorage.removeItem('wizard-draft')
      console.log('🧹 Wizard reset completo - limpiando localStorage')
    } catch (error) {
      console.error('Error limpiando localStorage:', error)
    }
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
    setData(prev => ({ ...prev, ...updates, lastSaved: new Date() }))
    
    // Si hay un projectId, actualizar también en el backend INMEDIATAMENTE
    if (data.projectId) {
      try {
        // Convertir formato wizard a formato backend
        const protocolUpdates: any = {
          lastSaved: new Date().toISOString()
        }
        
        // Mapear campos wizard -> backend
        if ('protocolTerms' in updates) {
          protocolUpdates.keyTerms = {
            technology: updates.protocolTerms?.tecnologia || [],
            domain: updates.protocolTerms?.dominio || [],
            studyType: updates.protocolTerms?.tipoEstudio || [],
            themes: updates.protocolTerms?.focosTematicos || []
          }
        }
        
        if ('inclusionCriteria' in updates) {
          protocolUpdates.inclusionCriteria = updates.inclusionCriteria || []
        }
        
        if ('exclusionCriteria' in updates) {
          protocolUpdates.exclusionCriteria = updates.exclusionCriteria || []
        }
        
        if ('searchPlan' in updates) {
          protocolUpdates.databases = updates.searchPlan?.databases || []
          protocolUpdates.searchQueries = updates.searchPlan?.searchQueries || []
          protocolUpdates.temporalRange = updates.searchPlan?.temporalRange
        }
        
        // Forzar guardado inmediato (sin debouncing) para cambios estructurales
        await apiClient.updateProtocol(data.projectId, protocolUpdates)
        console.log('✅ Datos limpiados y sincronizados con el servidor')
      } catch (error) {
        console.error('❌ Error limpiando datos en el servidor:', error)
        // Mantener cambios locales aunque falle el servidor
      }
    }
    
    // También limpiar localStorage para reflejar el nuevo estado
    try {
      const key = data.projectId || 'wizard-draft'
      const draftData = {
        data: { ...data, ...updates, lastSaved: new Date() },
        currentStep,
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
      localStorage.setItem(key, JSON.stringify(draftData))
      console.log('💾 Estado limpio guardado en localStorage (step', currentStep, ')')
    } catch (error) {
      console.error('Error actualizando localStorage tras limpiar:', error)
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
