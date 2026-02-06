"use client"

import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText,
  Save,
  Rocket,
  Target,
  Database,
  Filter,
  BookOpen
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

const PRISMA_WPOM_ITEMS = [
  { id: "prisma-1", number: 1, question: "¿Es entendible por alguien que no es experto?", autoFillKey: "clarity" },
  { id: "prisma-2", number: 2, question: "¿Se definen claramente las \"variables\"?", autoFillKey: "variables" },
  { id: "prisma-3", number: 3, question: "¿Se describe la justificación de la revisión en relación con lo que se conoce?", autoFillKey: "rationale" },
  { id: "prisma-4", number: 4, question: "¿Se proporciona una declaración explícita de las preguntas usando PICOS?", autoFillKey: "pico" },
  { id: "prisma-5", number: 5, question: "Si extiende investigaciones previas, ¿explica por qué se necesita este estudio?", autoFillKey: "need" },
  { id: "prisma-6", number: 6, question: "¿Se especifica y justifica la estrategia de búsqueda (manual, automatizada o mixta)?", autoFillKey: "searchStrategy" },
  { id: "prisma-7", number: 7, question: "¿Se identifican los criterios de inclusión y exclusión de estudios primarios?", autoFillKey: "criteria" },
  { id: "prisma-8", number: 8, question: "¿Se describen todas las fuentes de información utilizadas y fechas de cobertura?", autoFillKey: "sources" },
  { id: "prisma-9", number: 9, question: "¿Se presenta la estrategia electrónica de búsqueda completa para al menos una base de datos?", autoFillKey: "searchString" },
  { id: "prisma-10", number: 10, question: "¿Se identifican las revistas y conferencias para búsquedas manuales?", autoFillKey: "manualSearch" },
  { id: "prisma-11", number: 11, question: "¿Se especifica el período temporal de cobertura y su justificación?", autoFillKey: "temporalRange" },
  { id: "prisma-12", number: 12, question: "¿Se indican procedimientos auxiliares (e.g., consultas a expertos, revisión de bibliografía secundaria)?", autoFillKey: "auxiliary" },
  { id: "prisma-13", number: 13, question: "¿Se describe cómo se evaluará el proceso de búsqueda (comparación con revisión previa, etc.)?", autoFillKey: "validation" }
]

export function PrismaCheckStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  const router = useRouter()
  const [prismaData, setPrismaData] = useState<Record<string, { complies: boolean | null; evidence: string }>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Auto-evaluar cumplimiento PRISMA basado en datos del wizard
  useEffect(() => {
    const newPrismaData: Record<string, { complies: boolean | null; evidence: string }> = {}
    const hasPICO = !!(data.pico?.population && data.pico?.intervention && data.pico?.outcome)
    const hasSearchPlan = (data.searchPlan?.databases?.length || 0) > 0
    const hasQueries = (data.searchPlan?.searchQueries?.length || 0) > 0
    const hasCriteria = (data.inclusionCriteria?.length || 0) + (data.exclusionCriteria?.length || 0) > 0
    const hasTerms = (data.protocolDefinition?.technologies?.length || 0) > 0

    newPrismaData["prisma-1"] = { complies: !!(data.projectDescription && data.selectedTitle), evidence: "" }
    newPrismaData["prisma-2"] = { complies: hasTerms || !!data.pico?.population, evidence: "" }
    newPrismaData["prisma-3"] = { complies: !!data.projectDescription, evidence: "" }
    newPrismaData["prisma-4"] = { complies: hasPICO, evidence: "" }
    newPrismaData["prisma-5"] = { complies: !!data.projectDescription, evidence: "" }
    newPrismaData["prisma-6"] = { complies: hasSearchPlan, evidence: "" }
    newPrismaData["prisma-7"] = { complies: hasCriteria, evidence: "" }
    newPrismaData["prisma-8"] = { complies: hasSearchPlan, evidence: "" }
    newPrismaData["prisma-9"] = { complies: hasQueries, evidence: "" }
    newPrismaData["prisma-10"] = { complies: hasSearchPlan, evidence: "" }
    newPrismaData["prisma-11"] = { complies: !!(data.yearStart && data.yearEnd), evidence: "" }
    newPrismaData["prisma-12"] = { complies: true, evidence: "" }
    newPrismaData["prisma-13"] = { complies: true, evidence: "" }

    setPrismaData(newPrismaData)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const calculateCompliance = () => {
    const items = Object.values(prismaData)
    const completed = items.filter(i => i.complies === true).length
    return items.length > 0 ? Math.round((completed / items.length) * 100) : 0
  }

  const handleFinishProject = async () => {
    setIsSaving(true)
    try {
      // Separar datos de proyecto y protocolo
      const projectData = {
        title: data.selectedTitle,
        description: data.projectDescription,
        status: 'in-progress' // Cambiar de 'draft' a 'in-progress' (estado válido)
      }

      // Encontrar el título seleccionado completo (con español)
      const selectedTitleObj = data.generatedTitles?.find(t => t.title === data.selectedTitle)
      const titleToSave = selectedTitleObj?.spanishTitle || data.selectedTitle

      // Mapear IDs de bases de datos a nombres completos
      const DATABASE_ID_TO_NAME: Record<string, string> = {
        'scopus': 'Scopus',
        'ieee': 'IEEE Xplore',
        'acm': 'ACM Digital Library',
        'springer': 'Springer Link',
        'sciencedirect': 'ScienceDirect',
        'webofscience': 'Web of Science',
        'pubmed': 'PubMed',
        'embase': 'Embase',
        'cochrane': 'Cochrane Library',
        'cinahl': 'CINAHL',
        'eric': 'ERIC',
        'psycinfo': 'PsycINFO',
        'jstor': 'JSTOR',
        'sage': 'SAGE Journals',
        'avery': 'Avery Index',
        'taylor': 'Taylor & Francis',
        'econlit': 'EconLit',
        'wiley': 'Wiley Online Library',
        'arxiv': 'arXiv',
        'google_scholar': 'Google Scholar'
      }

      // Convertir IDs a nombres
      const databaseNames = (data.searchPlan?.databases || []).map(dbId => {
        // Si ya es un objeto con name, usar name
        if (typeof dbId === 'object' && dbId !== null && 'name' in dbId) {
          return dbId.name
        }
        // Si es string (ID), convertir a nombre
        if (typeof dbId === 'string') {
          return DATABASE_ID_TO_NAME[dbId] || dbId
        }
        return null
      }).filter(name => name !== null)

      // Construir cadenas de búsqueda desde las queries
      const searchQueries = data.searchPlan?.searchQueries || []
      const firstQuery = searchQueries.length > 0 ? searchQueries[0] : null
      const searchString = firstQuery?.query || ''

      // Mapear todas las queries con sus bases de datos
      const queries = searchQueries.map(q => ({
        database: q.databaseName || q.databaseId,
        databaseId: q.databaseId,
        query: q.query,
        baseQuery: q.baseQuery,
        hasAPI: q.hasAPI,
        apiRequired: q.apiRequired,
        status: q.status || 'pending',
        resultsCount: 0
      }))

      const protocolData = {
        proposedTitle: titleToSave,
        population: data.pico.population,
        intervention: data.pico.intervention,
        comparison: data.pico.comparison || '',
        outcomes: data.pico.outcome,
        refinedQuestion: data.projectDescription,
        isMatrix: data.matrixIsNot.is,
        isNotMatrix: data.matrixIsNot.isNot,
        inclusionCriteria: data.inclusionCriteria,
        exclusionCriteria: data.exclusionCriteria,
        databases: databaseNames,
        searchString: searchString,
        searchQueries: queries,
        temporalRange: {
          start: data.yearStart || 2019,
          end: data.yearEnd || new Date().getFullYear(),
          justification: `Rango temporal definido para cubrir investigaciones recientes en ${data.researchArea || 'el área de estudio'}`
        },
        keyTerms: {
          technology: (data.protocolDefinition?.technologies || []).filter((_, idx) => !data.discardedTerms?.tecnologia?.has(idx)),
          domain: (data.protocolDefinition?.applicationDomain || []).filter((_, idx) => !data.discardedTerms?.dominio?.has(idx)),
          studyType: (data.protocolDefinition?.studyType || []).filter((_, idx) => !data.discardedTerms?.tipoEstudio?.has(idx)),
          themes: (data.protocolDefinition?.thematicFocus || []).filter((_, idx) => !data.discardedTerms?.focosTematicos?.has(idx))
        },
        prismaCompliance: PRISMA_WPOM_ITEMS.map(item => ({
          number: item.number,
          item: item.question,
          complies: prismaData[item.id]?.complies ? 'yes' : prismaData[item.id]?.complies === false ? 'no' : 'pending',
          evidence: prismaData[item.id]?.evidence || ''
        }))
      }

      console.log('🔍 DEBUG - searchPlan:', data.searchPlan)
      console.log('🔍 DEBUG - protocolDefinition:', data.protocolDefinition)
      console.log('🔍 DEBUG - protocolData que se enviará:', protocolData)

      let result: any = null
      
      if (data.projectId) {
        // Proyecto ya existe (creado en paso 6), actualizarlo
        console.log('📝 Actualizando proyecto existente:', data.projectId)
        
        // 1. Actualizar proyecto (solo title, description, status)
        await apiClient.updateProject(data.projectId, projectData)
        
        // 2. Actualizar protocolo por separado
        await apiClient.updateProtocol(data.projectId, protocolData)
        
        toast({
          title: "Proyecto completado",
          description: "Redirigiendo a tu proyecto..."
        })
        setTimeout(() => router.push(`/projects/${data.projectId}`), 1500)
      } else {
        // Crear proyecto nuevo (caso excepcional)
        console.log('Creando proyecto nuevo')
        result = await apiClient.createProject({
          ...projectData,
          protocol: protocolData
        } as any)

        if (result.success && result.data?.project?.id) {
          toast({
            title: "Proyecto creado exitosamente",
            description: "Redirigiendo a tu proyecto..."
          })
          updateData({ projectId: result.data.project.id, lastSaved: new Date() })
          setTimeout(() => router.push(`/projects/${result.data.project.id}`), 1500)
        }
      }
    } catch (error: any) {
      console.error('Error al guardar proyecto:', error)
      toast({
        title: "Error al guardar proyecto",
        description: error.message || "No se pudo guardar el proyecto",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const compliance = calculateCompliance()
  const researchArea = data.researchArea || "su área de investigación"
  const themaCentral = data.projectName || "tema central"

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header consistente con otras secciones */}
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-2xl font-bold">Confirmación del Protocolo</h2>
        <p className="text-base text-muted-foreground">
          Resumen y confirmación final de tu revisión sistemática en {researchArea}
        </p>
      </div>

      {/* Resumen Ejecutivo del Protocolo - UNIFICADO */}
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Reporte Final del Protocolo</CardTitle>
              <CardDescription className="text-primary-foreground/80 mt-1">
                Resumen ejecutivo de tu revisión sistemática
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Mensaje informativo */}
          <div className="border-l-4 border-primary pl-4 bg-primary/5 p-3 rounded-r">
            <p className="text-sm text-foreground">
              Este es el paso final de tu protocolo de investigación. A continuación se presenta el <strong>resumen completo</strong> de toda la información generada durante la planificación.
            </p>
          </div>

          {/* Título del Proyecto */}
          <div className="p-4 rounded-lg border-2 border-primary/20">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Título de la Investigación
            </div>
            <p className="text-base font-semibold mt-1 text-gray-900 dark:text-gray-100">{data.selectedTitle}</p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-lg border-2 border-primary/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Bases de Datos</div>
              <div className="text-2xl font-bold text-foreground mt-2">
                {data.searchPlan?.databases?.length || 0}
              </div>
            </div>
            <div className="p-4 rounded-lg border-2 border-primary/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Criterios I/E</div>
              <div className="text-2xl font-bold text-foreground mt-2">
                {(data.inclusionCriteria?.length || 0) + (data.exclusionCriteria?.length || 0)}
              </div>
            </div>
            <div className="p-4 rounded-lg border-2 border-primary/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Términos Clave</div>
              <div className="text-2xl font-bold text-foreground mt-2">
                {(data.protocolTerms?.tecnologia?.length || 0) + (data.protocolTerms?.dominio?.length || 0) + (data.protocolTerms?.focosTematicos?.length || 0)}
              </div>
            </div>
            <div className="p-4 rounded-lg border-2 border-primary/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Calidad PRISMA</div>
              <div className="text-2xl font-bold text-foreground mt-2">{compliance}%</div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Proyecto</span>
              <p className="font-medium mt-1 text-foreground">{data.projectName}</p>
            </div>
            <div className="p-3 rounded-lg border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Área de Investigación</span>
              <p className="font-medium mt-1 text-gray-900 dark:text-gray-100">{researchArea.replace('-', ' ').toUpperCase()}</p>
            </div>
            <div className="p-3 rounded-lg border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Período Temporal</span>
              <p className="font-medium mt-1 text-foreground">{data.yearStart || 'N/A'} - {data.yearEnd || 'N/A'}</p>
            </div>
          </div>

          {/* ─── SECCIÓN: Marco PICO ─── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b pb-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">Marco PICO</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">P - Población / Contexto</span>
                <p className="text-sm mt-1 text-foreground">{data.pico?.population || 'No definido'}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase">I - Intervención</span>
                <p className="text-sm mt-1 text-foreground">{data.pico?.intervention || 'No definido'}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase">C - Comparación</span>
                <p className="text-sm mt-1 text-foreground">{data.pico?.comparison || 'No aplica'}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">O - Resultados Esperados</span>
                <p className="text-sm mt-1 text-foreground">{data.pico?.outcome || 'No definido'}</p>
              </div>
            </div>
          </div>


          {/* ─── SECCIÓN: Términos del Protocolo ─── */}
          {((data.protocolTerms?.tecnologia?.length ?? 0) > 0 || (data.protocolTerms?.dominio?.length ?? 0) > 0 || (data.protocolTerms?.focosTematicos?.length ?? 0) > 0) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-base">Términos del Protocolo</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(data.protocolTerms?.tecnologia?.length ?? 0) > 0 && (
                  <div className="p-3 rounded-lg border border-border">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Tecnología / Herramienta</span>
                    <ul className="mt-1 space-y-1">
                      {data.protocolTerms?.tecnologia?.map((t: string) => (
                        <li key={t} className="text-sm text-foreground flex items-start gap-1">
                          <span className="text-primary mt-0.5">•</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(data.protocolTerms?.dominio?.length ?? 0) > 0 && (
                  <div className="p-3 rounded-lg border border-border">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Dominio de Aplicación</span>
                    <ul className="mt-1 space-y-1">
                      {data.protocolTerms?.dominio?.map((d: string) => (
                        <li key={d} className="text-sm text-foreground flex items-start gap-1">
                          <span className="text-primary mt-0.5">•</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(data.protocolTerms?.tipoEstudio?.length ?? 0) > 0 && (
                  <div className="p-3 rounded-lg border border-border">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Tipo de Estudio</span>
                    <ul className="mt-1 space-y-1">
                      {data.protocolTerms?.tipoEstudio?.map((t: string) => (
                        <li key={t} className="text-sm text-foreground flex items-start gap-1">
                          <span className="text-primary mt-0.5">•</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(data.protocolTerms?.focosTematicos?.length ?? 0) > 0 && (
                  <div className="p-3 rounded-lg border border-border">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Focos Temáticos</span>
                    <ul className="mt-1 space-y-1">
                      {data.protocolTerms?.focosTematicos?.map((f: string) => (
                        <li key={f} className="text-sm text-foreground flex items-start gap-1">
                          <span className="text-primary mt-0.5">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── SECCIÓN: Criterios de Inclusión y Exclusión ─── */}
          {(data.inclusionCriteria?.length > 0 || data.exclusionCriteria?.length > 0) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-base">Criterios de Inclusión / Exclusión</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.inclusionCriteria?.length > 0 && (
                  <div className="p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                    <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase">Criterios de Inclusión ({data.inclusionCriteria.length})</span>
                    <ol className="mt-2 space-y-1 list-decimal list-inside">
                      {data.inclusionCriteria.map((c: string) => (
                        <li key={c} className="text-sm text-foreground">{c}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {data.exclusionCriteria?.length > 0 && (
                  <div className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                    <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">Criterios de Exclusión ({data.exclusionCriteria.length})</span>
                    <ol className="mt-2 space-y-1 list-decimal list-inside">
                      {data.exclusionCriteria.map((c: string) => (
                        <li key={c} className="text-sm text-foreground">{c}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── SECCIÓN: Bases de Datos y Cadenas de Búsqueda ─── */}
          {(data.searchPlan?.searchQueries?.length ?? 0) > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-base">Bases de Datos y Cadenas de Búsqueda</h3>
              </div>
              <div className="space-y-3">
                {data.searchPlan?.searchQueries?.map((q: any) => (
                  <div key={q.databaseId || q.databaseName} className="p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">{q.databaseName || q.databaseId}</span>
                      <Badge variant="outline" className="text-xs">{q.resultCount !== null && q.resultCount !== undefined ? `${q.resultCount} refs` : 'Pendiente'}</Badge>
                    </div>
                    <pre className="text-xs bg-muted/50 p-2 rounded border overflow-x-auto whitespace-pre-wrap font-mono text-foreground">{q.query}</pre>
                    {q.explanation && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Botón de Confirmación ─── */}
          <div className="text-center space-y-4 pt-4">
            <Button
              size="lg"
              onClick={handleFinishProject}
              disabled={isSaving}
              className="w-full max-w-md h-12 text-base font-semibold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all"
            >
              {isSaving ? (
                <>
                  <Save className="h-6 w-6 mr-2 animate-pulse" />
                  Guardando proyecto...
                </>
              ) : (
                <>
                  <Rocket className="h-6 w-6 mr-2" />
                  Confirmar y Crear Proyecto
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Al confirmar, se creará tu proyecto y podrás comenzar con la fase de ejecución
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
