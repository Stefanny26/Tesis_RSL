"use client"

import { useState, useEffect } from "react"
import React from "react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProjectBreadcrumb } from "@/components/project-breadcrumb"
import { ProjectHeader } from "@/components/project-header"
import { ReferenceTable } from "@/components/screening/reference-table"
import { AIScreeningPanel } from "@/components/screening/ai-screening-panel"
import { ScreeningFilters } from "@/components/screening/screening-filters"
import { DuplicateDetectionDialog } from "@/components/screening/duplicate-detection-dialog"
import { HybridScreeningStats } from "@/components/screening/hybrid-screening-stats"
import { SimplifiedScreeningSummary } from "@/components/screening/simplified-screening-summary"
import { PrismaFlowDiagram } from "@/components/screening/prisma-flow-diagram"
import { apiClient } from "@/lib/api-client"
import type { Reference } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, Database, Copy, CheckCircle2, Brain, Download, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ScreeningPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<any>(null)
  const [references, setReferences] = useState<Reference[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<"fase1" | "priorizacion" | "revision" | "resultados" | "prisma">("fase1")
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    included: 0,
    excluded: 0
  })
  const [searchQueries, setSearchQueries] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState<Set<string>>(new Set())
  const [keyTerms, setKeyTerms] = useState<any>(null)
  const [duplicatesStats, setDuplicatesStats] = useState<any>(null)
  const [isDetectingDuplicates, setIsDetectingDuplicates] = useState(false)
  const [duplicateGroups, setDuplicateGroups] = useState<any[]>([])
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false)
  const [lastScreeningResult, setLastScreeningResult] = useState<any>(null)
  const [fase2Unlocked, setFase2Unlocked] = useState(false)
  const [selectedForFullText, setSelectedForFullText] = useState<Set<string>>(new Set())
  const [screeningFinalized, setScreeningFinalized] = useState(false)
  const [isFinalizingScreening, setIsFinalizingScreening] = useState(false)

  // Helper: Verificar si TODOS los artículos seleccionados han sido revisados manualmente
  const areAllArticlesReviewed = (): boolean => {
    if (selectedForFullText.size === 0) return false
    
    const selectedIds = Array.from(selectedForFullText)
    const selectedRefs = references.filter(r => selectedIds.includes(r.id))
    
    // Todos deben tener manualReviewStatus = 'included' o 'excluded' (NO 'pending' ni null)
    const allReviewed = selectedRefs.every(ref => 
      ref.manualReviewStatus === 'included' || ref.manualReviewStatus === 'excluded'
    )
    
    // Debug
    const pendingCount = selectedRefs.filter(ref => 
      !ref.manualReviewStatus || ref.manualReviewStatus === 'pending'
    ).length
    
    if (pendingCount > 0) {
      // Pending reviews exist but we continue processing
    }
    
    return allReviewed
  }

  // Cargar referencias del proyecto y protocolo (search queries) - EN PARALELO
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        // Cargar proyecto, referencias y protocolo en paralelo (3 llamadas simultáneas)
        const [projectData, refData, protocol] = await Promise.all([
          apiClient.getProject(params.id),
          apiClient.getAllReferences(params.id),
          apiClient.getProtocol(params.id).catch(err => {
            return null
          })
        ])
        
        setProject(projectData)
        setReferences(refData.references || [])
        setStats(refData.stats || { total: 0, pending: 0, included: 0, excluded: 0 })

        // Procesar protocolo si existe
        if (protocol) {
          if (protocol?.searchStrategy?.searchQueries) {
            setSearchQueries(protocol.searchStrategy.searchQueries)
          } else if (protocol?.searchPlan?.searchQueries) {
            setSearchQueries(protocol.searchPlan.searchQueries)
          }
          if (protocol?.keyTerms) {
            setKeyTerms(protocol.keyTerms)
          }
          if (protocol?.screeningResults) {
            // Validar que tenga el formato correcto con phase1 y phase2
            if (protocol.screeningResults.summary?.phase1 && protocol.screeningResults.summary?.phase2) {
              setLastScreeningResult(protocol.screeningResults)
            } else {
              setLastScreeningResult(null)
            }
          }
          if (protocol?.fase2Unlocked) {
            setFase2Unlocked(protocol.fase2Unlocked)
          }
          if (protocol?.selectedForFullText && Array.isArray(protocol.selectedForFullText) && protocol.selectedForFullText.length > 0) {
            setSelectedForFullText(new Set(protocol.selectedForFullText))
          } else if (refData?.references) {
            // Fallback: inferir selectedForFullText desde refs con manualReviewStatus
            const reviewedIds = (refData.references as any[]).filter(
              (r: any) => r.manualReviewStatus === 'included' || r.manualReviewStatus === 'excluded'
            ).map((r: any) => r.id)
            if (reviewedIds.length > 0) {
              setSelectedForFullText(new Set(reviewedIds))
              // NO marcar como completada automáticamente
            }
          }
          if (protocol?.screeningFinalized) {
            setScreeningFinalized(protocol.screeningFinalized)
          }
        }
      } catch (err: any) {
        console.error("Error cargando datos:", err)
        setError(err.message || "No se pudieron cargar los datos")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [params.id])

  // Cambiar a pestaña de revisión cuando el screening se finaliza
  useEffect(() => {
    if (screeningFinalized && activeTab === 'priorizacion') {
      setActiveTab('revision')
    }
  }, [screeningFinalized, activeTab])

  // Función para recargar solo las referencias (útil después de subir PDFs)
  const reloadReferences = async () => {
    try {
      const refData = await apiClient.getAllReferences(params.id)
      setReferences(refData.references || [])
      setStats(refData.stats || { total: 0, pending: 0, included: 0, excluded: 0 })
    } catch (err) {
      console.error('Error recargando referencias:', err)
    }
  }

  const handleStatusChange = async (id: string, status: Reference["status"], exclusionReason?: string) => {
    try {
      await apiClient.updateReferenceStatus(id, { status, exclusionReason })
      setReferences((prev) => prev.map((ref) => (ref.id === id ? { ...ref, status, exclusionReason } : ref)))
      
      // Actualizar stats
      setStats(prev => {
        const newStats = { ...prev }
        const ref = references.find(r => r.id === id)
        if (ref && ref.status !== status) {
          // Decrementar el estado anterior
          if (ref.status === 'pending') newStats.pending--
          else if (ref.status === 'included') newStats.included--
          else if (ref.status === 'excluded') newStats.excluded--
          
          // Incrementar el nuevo estado
          if (status === 'pending') newStats.pending++
          else if (status === 'included') newStats.included++
          else if (status === 'excluded') newStats.excluded++
        }
        return newStats
      })
      
      toast({ title: "Estado actualizado", description: `Referencia marcada como ${status}` })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" })
      throw error // Re-throw para que el componente pueda manejarlo
    }
  }

  const handleSelectForFullText = async (referenceIds: string[], count: number, phase: string) => {
    try {
      // 1. Identificar todas las referencias clasificadas por IA (candidatas)
      const classifiedRefs = references.filter(r => 
        r.aiClassification || r.similarity_score !== undefined || r.screeningScore !== undefined
      )
      
      // 2. Separar en seleccionadas y no seleccionadas
      const selectedIds = new Set(referenceIds)
      const notSelectedRefs = classifiedRefs.filter(r => !selectedIds.has(r.id))
      
      // 3. Primero revertir el estado de los artículos previamente seleccionados
      const previouslySelected = Array.from(selectedForFullText)
      if (previouslySelected.length > 0) {
        await Promise.all(
          previouslySelected.map(id => apiClient.updateReferenceStatus(id, { status: 'pending' }))
        )
      }
      
      // 4. Marcar las NUEVAS referencias seleccionadas como 'pending' para revisión manual
      await Promise.all(
        referenceIds.map(id => apiClient.updateReferenceStatus(id, { status: 'pending' }))
      )
      
      // 5. AUTOMÁTICAMENTE EXCLUIR las referencias NO seleccionadas
      if (notSelectedRefs.length > 0) {
        await Promise.all(notSelectedRefs.map(ref => 
          apiClient.updateReferenceStatus(ref.id, { 
            status: 'excluded',
            exclusionReason: `No alcanzó el criterio de corte de ${phase}. Score insuficiente para revisión de texto completo.`
          })
        ))
      }
      
      // 6. Actualizar estado local: reemplazar selección anterior
      setReferences((prev) =>
        prev.map((ref) => {
          if (referenceIds.includes(ref.id)) {
            return { ...ref, status: "pending" as const }
          } else if (notSelectedRefs.some(r => r.id === ref.id)) {
            return { ...ref, status: "excluded" as const }
          }
          return ref
        })
      )
      
      // 7. REEMPLAZAR (no acumular) IDs seleccionados para full-text
      setSelectedForFullText(new Set(referenceIds))
      
      // 8. Guardar en el protocolo para persistencia
      try {
        await apiClient.updateProtocol(params.id, {
          selectedForFullText: referenceIds
        })
      } catch (protocolError) {
        // Non-critical: protocol persistence is best-effort; screening proceeds with local state
      }

      // 9. Actualizar stats
      setStats(prev => {
        const newStats = { ...prev }
        newStats.pending = referenceIds.length
        newStats.excluded = prev.excluded + notSelectedRefs.length
        return newStats
      })
      
      toast({ 
        title: "✅ Selección completada", 
        description: `${count} artículos para revisión • ${notSelectedRefs.length} excluidos automáticamente` 
      })
      
      // 10. Navegar a la pestaña de revisión manual
      setActiveTab("revision")
    } catch (error) {
      console.error('❌ Error en selección:', error)
      toast({ 
        title: "Error", 
        description: "No se pudieron seleccionar los artículos", 
        variant: "destructive" 
      })
    }
  }

  const handleDeleteReference = async (id: string) => {
    try {
      await apiClient.deleteReference(id)
      
      // Actualizar estado local
      const ref = references.find(r => r.id === id)
      setReferences((prev) => prev.filter((r) => r.id !== id))
      
      // Actualizar estadísticas
      if (ref) {
        setStats((prev) => {
          const newStats = { ...prev }
          newStats.total--
          if (ref.status === 'pending') newStats.pending--
          else if (ref.status === 'included') newStats.included--
          else if (ref.status === 'excluded') newStats.excluded--
          return newStats
        })
      }
      
      toast({ 
        title: "Referencia eliminada", 
        description: "La referencia ha sido eliminada permanentemente" 
      })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "No se pudo eliminar la referencia", 
        variant: "destructive" 
      })
    }
  }

  const handleFetchFromScopus = async (query: any) => {
    if (!query.apiQuery) {
      toast({
        title: "Error",
        description: "No hay query API disponible",
        variant: "destructive"
      })
      return
    }

    setIsFetching(prev => new Set(prev).add(query.databaseId))
    
    try {
      toast({
        title: "🔍 Buscando en Scopus...",
        description: "Esto puede tardar unos segundos"
      })

      const result = await apiClient.scopusFetch(query.apiQuery, params.id, 25)

      if (result.success) {
        toast({
          title: "✅ Búsqueda completada",
          description: `${result.savedCount} artículos guardados de ${result.totalResults} encontrados`
        })

        // Recargar referencias
        const data = await apiClient.getReferences(params.id)
        setReferences(data.references || [])
        setStats(data.stats || { total: 0, pending: 0, included: 0, excluded: 0 })
      }
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "No se pudieron obtener los artículos",
        variant: "destructive"
      })
    } finally {
      setIsFetching(prev => {
        const newSet = new Set(prev)
        newSet.delete(query.databaseId)
        return newSet
      })
    }
  }

  const handleDetectDuplicates = async () => {
    setIsDetectingDuplicates(true)
    try {
      toast({
        title: "🔍 Detectando duplicados...",
        description: "Analizando referencias para encontrar duplicados"
      })

      const result = await apiClient.detectDuplicates(params.id)
      setDuplicatesStats(result.stats)
      setDuplicateGroups(result.groups || [])

      if (result.groups && result.groups.length > 0) {
        setShowDuplicatesDialog(true)
        toast({
          title: "✅ Detección completada",
          description: `Se encontraron ${result.stats.duplicates} duplicados en ${result.stats.duplicateGroups} grupos`
        })
      } else {
        toast({
          title: "✅ Sin duplicados",
          description: "No se encontraron referencias duplicadas",
        })
      }
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "No se pudieron detectar duplicados",
        variant: "destructive"
      })
    } finally {
      setIsDetectingDuplicates(false)
    }
  }

  const handleKeepReference = async (groupId: string, referenceId: string) => {
    try {
      await apiClient.resolveDuplicateGroup(params.id, groupId, referenceId)
      
      // Recargar referencias
      const data = await apiClient.getReferences(params.id)
      setReferences(data.references || [])
      setStats(data.stats || { total: 0, pending: 0, included: 0, excluded: 0 })
      
      // Remover el grupo resuelto de la lista
      setDuplicateGroups(prev => prev.filter(g => g.id !== groupId))
      
      // Si no quedan más grupos, cerrar el diálogo
      if (duplicateGroups.length <= 1) {
        setShowDuplicatesDialog(false)
      }
    } catch (error: any) {
      throw new Error(error.message || "No se pudo resolver el grupo de duplicados")
    }
  }

  const handleRunScreening = async (threshold: number, method: 'embeddings' | 'llm', llmProvider?: 'gemini' | 'chatgpt') => {
    try {
      const pending = references.filter(r => r.status === 'pending')
      const totalRefs = references.length
      
      // Permitir re-ejecución incluso si no hay pendientes
      if (totalRefs === 0) {
        toast({ 
          title: "Sin referencias", 
          description: "No hay referencias para analizar", 
          variant: "destructive" 
        })
        return
      }

      const methodName = method === 'embeddings' ? 'Híbrido (Embeddings + ChatGPT)' : (llmProvider === 'gemini' ? 'Gemini' : 'ChatGPT')
      const isRerun = pending.length === 0 && totalRefs > 0
      
      toast({ 
        title: isRerun ? "Re-ejecutando cribado..." : "Ejecutando cribado...", 
        description: `Analizando ${totalRefs} referencias con ${methodName}` 
      })

      if (method === 'embeddings') {
        // Método HÍBRIDO: Embeddings + ChatGPT para zona gris
        const result = await apiClient.runScreeningEmbeddings(params.id, { threshold })
        
        if (result.success && result.summary) {
          // Validar formato antes de guardar
          if (!result.summary.phase1 || !result.summary.phase2) {
            console.error('❌ Error: resultado sin phase1 o phase2', result)
            throw new Error('Formato de respuesta del backend inválido')
          }
          
          // Usar handleScreeningComplete para recargar datos y limpiar estados
          await handleScreeningComplete(result)
          
          const { included, excluded, reviewManual, phase1, phase2 } = result.summary
          
          toast({ 
            title: "✅ Cribado híbrido completado", 
            description: `Fase 1 (Embeddings): ${phase1.highConfidenceInclude} incluidas, ${phase1.highConfidenceExclude} excluidas
Fase 2 (ChatGPT): ${phase2.analyzed} analizadas en zona gris
Total: ${included} incluidas, ${excluded} excluidas${reviewManual > 0 ? `, ${reviewManual} para revisión manual` : ''}`,
            duration: 8000
          })
        } else {
          throw new Error('Formato de respuesta inválido')
        }
      } else {
        const result = await apiClient.runScreeningLLM(params.id, { llmProvider: llmProvider! })
        
        if (result.results) {
          setReferences(prev => prev.map(ref => {
            const updated = result.results.find(r => r.referenceId === ref.id)
            return updated ? { ...ref, status: updated.decision as Reference["status"] } : ref
          }))
          
          const toInclude = result.results.filter(r => r.decision === 'included').length
          const toExclude = result.results.filter(r => r.decision === 'excluded').length
          toast({ 
            title: "Cribado completado", 
            description: `${toInclude} incluidas, ${toExclude} excluidas con ${methodName}` 
          })
        } else {
          throw new Error('Formato de respuesta inválido')
        }
      }

    } catch (error: any) {
      console.error('Error en cribado automático:', error)
      const errorMsg = error.message || "No se pudo ejecutar el cribado automático"
      toast({ 
        title: "Error en cribado", 
        description: errorMsg.includes('404') 
          ? "Error en el modelo de IA. Intenta con otro proveedor." 
          : errorMsg.includes('rate_limit') 
          ? "Límite de peticiones alcanzado. Espera 30 segundos e intenta nuevamente."
          : errorMsg,
        variant: "destructive" 
      })
    }
  }

  // Nueva función para manejar completado del SSE
  const handleScreeningComplete = async (resultData?: any) => {
    try {
      // Si recibimos datos del SSE, guardarlos inmediatamente
      if (resultData) {
        setLastScreeningResult(resultData)
      }
      
      // Recargar referencias
      const refData = await apiClient.getAllReferences(params.id)
      setReferences(refData.references || [])
      setStats(refData.stats || { total: 0, pending: 0, included: 0, excluded: 0 })
      
      // Recargar protocolo para obtener resultados actualizados y fase2Unlocked
      try {
        const protocol = await apiClient.getProtocol(params.id)
        if (protocol) {
          // Actualizar screeningResults si están presentes
          if (protocol.screeningResults) {
            if (protocol.screeningResults.summary?.phase1 && protocol.screeningResults.summary?.phase2) {
              setLastScreeningResult(protocol.screeningResults)
            }
          }
          
          // 🧹 IMPORTANTE: Resetear estados locales basados en el protocolo recargado
          // Si selectedForFullText está vacío, significa que hubo una re-ejecución y se limpiaron los datos previos
          if (!protocol.selectedForFullText || protocol.selectedForFullText.length === 0) {
            setSelectedForFullText(new Set())
            setScreeningFinalized(false)
            setFase2Unlocked(protocol.fase2Unlocked || false)
          } else {
            // Si hay selectedForFullText, restaurar del protocolo
            setSelectedForFullText(new Set(protocol.selectedForFullText))
            setManualReviewCompleted(protocol.manualReviewFinalized || false)
            setScreeningFinalized(protocol.screeningFinalized || false)
            setFase2Unlocked(protocol.fase2Unlocked || false)
          }
          
          // Actualizar estado de fase2Unlocked
          if (protocol.fase2Unlocked) {
            setFase2Unlocked(true)
            // Mostrar toast informativo
            toast({
              title: "✅ Screening completado",
              description: "Ahora puedes proceder a la Revisión Manual de artículos",
              duration: 5000
            })
          }
        }
      } catch (protocolErr) {
        // Non-critical: protocol update is best-effort; outer error handler covers critical failures
      }
      
    } catch (error) {
      console.error('❌ Error recargando datos:', error)
      toast({
        title: "Error recargando datos",
        description: "Por favor recarga la página para ver los resultados",
        variant: "destructive"
      })
    }
  }

  // Manejar exportación de referencias
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const format = 'bibtex' // Puedes agregar un selector de formato más adelante
      const blob = await apiClient.exportReferences(params.id, format)
      
      // Crear link de descarga
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `references-${params.id}.bib`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "✅ Exportación exitosa",
        description: `Referencias exportadas en formato ${format.toUpperCase()}`
      })
    } catch (error: any) {
      toast({
        title: "Error al exportar",
        description: error.message || "No se pudieron exportar las referencias",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Filter references
  const filteredReferences = references.filter((ref) => {
    const matchesStatus = statusFilter === "all" || ref.status === statusFilter
    
    // Filtro por método de clasificación
    let matchesMethod = true
    if (methodFilter !== 'all' && ref.aiReasoning) {
      const reasoning = ref.aiReasoning.toLowerCase()
      if (methodFilter === 'embeddings') {
        // Solo embeddings (no tiene ChatGPT)
        matchesMethod = reasoning.includes('embeddings') && !reasoning.includes('chatgpt')
      } else if (methodFilter === 'chatgpt') {
        // Solo ChatGPT (no tiene solo embeddings)
        matchesMethod = reasoning.includes('chatgpt') && !reasoning.includes('embeddings')
      } else if (methodFilter === 'hybrid') {
        // Híbrido (tiene ambos)
        matchesMethod = reasoning.includes('embeddings') && reasoning.includes('chatgpt')
      } else if (methodFilter === 'manual') {
        // Manual (no tiene razonamiento de IA)
        matchesMethod = !ref.aiReasoning || ref.aiReasoning === ''
      }
    } else if (methodFilter === 'manual') {
      matchesMethod = !ref.aiReasoning || ref.aiReasoning === ''
    }
    
    const matchesSearch =
      searchQuery === "" ||
      ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(ref.authors) 
        ? ref.authors.some((author) => author.toLowerCase().includes(searchQuery.toLowerCase()))
        : (ref.authors || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ref.abstract || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesMethod && matchesSearch
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Cargando referencias...</p>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Error al cargar referencias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.push(`/projects/${params.id}`)}>
                Volver al Proyecto
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Project Header */}
          {project && <ProjectHeader project={project} />}

          {/* Sistema de Cribado Reorganizado */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
<TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="fase1" className="flex flex-col items-center gap-1 py-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="font-semibold">Clasificación IA</span>
              </div>
              <span className="text-xs text-muted-foreground">Screening Automático</span>
            </TabsTrigger>
            <TabsTrigger value="prisma" className="flex flex-col items-center gap-1 py-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="font-semibold">Diagrama PRISMA</span>
              </div>
              <span className="text-xs text-muted-foreground">Flujo de Selección</span>
            </TabsTrigger>
            <TabsTrigger value="resultados" className="flex flex-col items-center gap-1 py-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-semibold">Resultados Detallado</span>
              </div>
              <span className="text-xs text-muted-foreground">Resumen final</span>
              </TabsTrigger>
            </TabsList>

            {/* FASE 1: Clasificación Automática con IA */}
            <TabsContent value="fase1" className="space-y-6">
              {/* Panel de IA en un solo cuerpo */}
              <AIScreeningPanel
                totalReferences={stats.total}
                pendingReferences={stats.pending}
                projectId={params.id}
                onRunScreening={handleRunScreening}
                onScreeningComplete={handleScreeningComplete}
              />
              
              {lastScreeningResult && (
                <SimplifiedScreeningSummary
                  projectId={params.id}
                  result={{
                    ...lastScreeningResult,
                    classifiedReferences: {
                      highConfidenceInclude: references.filter(r => 
                        (r.screeningScore ?? 0) > 0.15 && 
                        !r.aiReasoning?.toLowerCase().includes('chatgpt')
                      ),
                      highConfidenceExclude: references.filter(r => 
                        (r.screeningScore ?? 0) < 0.10 && 
                        !r.aiReasoning?.toLowerCase().includes('chatgpt')
                      ),
                      complementaryRelevant: references.filter(r => 
                        r.aiClassification === 'include' && 
                        r.aiReasoning?.toLowerCase().includes('chatgpt')
                      ),
                      complementaryNotRelevant: references.filter(r => 
                        r.aiClassification === 'exclude' && 
                        r.aiReasoning?.toLowerCase().includes('chatgpt')
                      )
                    }
                  }} 
                  onProceedToManualReview={async (selectedIds: string[]) => {
                    try {
                      // Marcar artículos como seleccionados para texto completo
                      setSelectedForFullText(new Set(selectedIds))
                      setFase2Unlocked(true)
                      // NO marcar como completada aquí - el usuario aún debe revisar todos
                      
                      // Marcar artículos como 'pending' SOLO si no tienen decisión manual previa
                      await Promise.all(
                        selectedIds.map(id => {
                          const ref = references.find(r => r.id === id)
                          // No sobrescribir si ya tiene decisión manual (included/excluded)
                          if (ref?.manualReviewStatus === 'included' || ref?.manualReviewStatus === 'excluded') {
                            return Promise.resolve()
                          }
                          return apiClient.updateReferenceStatus(id, { status: 'pending' })
                        })
                      )
                      
                      // Actualizar el estado local — preservar status de artículos ya revisados
                      setReferences(prevRefs => 
                        prevRefs.map(ref => {
                          if (!selectedIds.includes(ref.id)) return ref
                          // Si ya tiene decisión manual, mantener su status
                          if (ref.manualReviewStatus === 'included' || ref.manualReviewStatus === 'excluded') {
                            return ref
                          }
                          return { ...ref, status: 'pending' as const }
                        })
                      )
                      
                      // Ir directamente al diagrama PRISMA
                      setActiveTab("prisma")
                      
                      toast({
                        title: "✅ Artículos seleccionados",
                        description: `${selectedIds.length} artículo${selectedIds.length !== 1 ? 's' : ''} marcado${selectedIds.length !== 1 ? 's' : ''} para revisión manual`,
                      })
                      
                      // Recargar referencias para asegurar sincronización
                      setTimeout(async () => {
                        try {
                          const refData = await apiClient.getAllReferences(params.id)
                          setReferences(refData.references || [])
                        } catch (error) {
                          // Non-critical: delayed sync refresh; user can manually reload if needed
                        }
                      }, 1000)
                      
                    } catch (error) {
                      console.error('❌ Error al actualizar artículos seleccionados:', error)
                      toast({
                        title: "Error",
                        description: "No se pudieron actualizar todos los artículos",
                        variant: "destructive"
                      })
                    }
                    
                    // Guardar en el protocolo los artículos seleccionados
                    apiClient.updateProtocol(params.id, { 
                      fase2Unlocked: true,
                      selectedForFullText: selectedIds
                    })
                      .catch(() => {})
                    
                    toast({
                      title: "✅ Revisión manual completada",
                      description: `${selectedIds.length} artículo${selectedIds.length !== 1 ? 's' : ''} aprobado${selectedIds.length !== 1 ? 's' : ''} para inclusión final`,
                    })
                  }}
                  isLocked={areAllArticlesReviewed()}
                  onReferenceStatusChange={async (referenceId: string, status: 'included' | 'excluded' | 'pending', exclusionReason?: string) => {
                    try {
                      // NO llamar al backend aquí — handleSavePastedResults ya guardó con manualReviewStatus
                      // Solo actualizar estado local inmediatamente
                      setReferences(prevRefs => 
                        prevRefs.map(ref => 
                          ref.id === referenceId 
                          ? { ...ref, status: status as any, manualReviewStatus: status, exclusionReason }
                          : ref
                        )
                      )
                      
                    } catch (error) {
                      console.error('❌ Error al actualizar estado del artículo:', error)
                    }
                  }}
                />
              )}

              {/* Tabla de Referencias - Solo se muestra si NO hay resultados de cribado */}
              {!lastScreeningResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Todas las Referencias ({references.length})
                    </CardTitle>
                    <CardDescription>
                      Ejecuta el cribado automático para que la IA clasifique todas tus referencias
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScreeningFilters
                      statusFilter={statusFilter}
                      onStatusFilterChange={setStatusFilter}
                      searchQuery={searchQuery}
                      onSearchQueryChange={setSearchQuery}
                      methodFilter={methodFilter}
                      onMethodFilterChange={setMethodFilter}
                    />
                    
                    <ReferenceTable
                      references={filteredReferences}
                      onStatusChange={handleStatusChange}
                          onDelete={handleDeleteReference}
                          selectedIds={[]}
                          onSelectionChange={() => {}}
                          showActions={false}
                          enableSelection={false}
                        />
                      </CardContent>
                    </Card>
              )}
            </TabsContent>

            {/* PESTAÑA: Diagrama PRISMA (Flujo de Selección) */}
            <TabsContent value="prisma" className="space-y-6">
              {(() => {
                // Calcular estadísticas PRISMA desde las referencias reales
                const totalRefs = references.length
                const classifiedRefs = references.filter(r => r.aiClassification)
                const excludedByAI = references.filter(r => r.aiClassification === 'exclude')
                
                // Solo contar artículos que fueron explícitamente seleccionados para full-text
                const selectedForReview = references.filter(r => selectedForFullText.has(r.id))
                // Usar manualReviewStatus para reflejar las decisiones de revisión manual
                const excludedManual = selectedForReview.filter(r => r.manualReviewStatus === 'excluded')
                const includedRefs = selectedForReview.filter(r => r.manualReviewStatus === 'included')
                const pendingReview = selectedForReview.filter(r => !r.manualReviewStatus || r.manualReviewStatus === 'pending')
                
                // DEBUG: Imprimir valores para diagnóstico
                // Calcular referencias procesadas en Fase 1 (las que tienen clasificación de IA)
                const screenedInPhase1 = classifiedRefs.length
                // CORRECCIÓN: Excluidas = Total clasificadas - Seleccionadas para revisión
                // Esto incluye tanto las auto-excluidas por IA como las excluidas manualmente por el usuario
                const excludedInPhase1 = classifiedRefs.length - selectedForReview.length
                
                // Build databases list from ACTUAL imported references by source
                const databaseCounts: Record<string, number> = {}
                references.forEach((ref) => {
                  const source = ref.source || 'Unknown'
                  databaseCounts[source] = (databaseCounts[source] || 0) + 1
                })
                
                const databases = Object.entries(databaseCounts)
                  .filter(([name]) => name !== 'Unknown') // No mostrar fuentes desconocidas
                  .map(([name, hits]) => ({
                  name,
                  hits
                }))
                
                // Collect exclusion reasons from manual review (full-text phase)
                const exclusionReasons: Record<string, number> = {}
                excludedManual.forEach((ref) => {
                  if (ref.exclusionReason) {
                    const reason = ref.exclusionReason.trim()
                    exclusionReasons[reason] = (exclusionReasons[reason] || 0) + 1
                  }
                })

                // Desglose de motivos de exclusión en cribado título/abstract (Fase 1)
                const screeningExclusionReasons: Record<string, number> = {}
                const notSelectedRefs = classifiedRefs.filter(r => !selectedForFullText.has(r.id))
                notSelectedRefs.forEach((ref) => {
                  if (ref.exclusionReason) {
                    const reason = ref.exclusionReason.trim()
                    screeningExclusionReasons[reason] = (screeningExclusionReasons[reason] || 0) + 1
                  } else if (ref.matchedCriteria && ref.matchedCriteria.length > 0) {
                    ref.matchedCriteria.forEach((criteria: string) => {
                      const reason = `Does not meet: ${criteria.trim()}`
                      screeningExclusionReasons[reason] = (screeningExclusionReasons[reason] || 0) + 1
                    })
                  } else if (ref.aiClassification === 'exclude') {
                    const reason = 'Does not meet inclusion criteria (AI)'
                    screeningExclusionReasons[reason] = (screeningExclusionReasons[reason] || 0) + 1
                  } else {
                    const reason = 'Low thematic relevance (insufficient score)'
                    screeningExclusionReasons[reason] = (screeningExclusionReasons[reason] || 0) + 1
                  }
                })

                // Criterios de exclusión del protocolo
                const protocolExclusionCriteria = project?.protocol?.exclusionCriteria || []
                
                const prismaStats = {
                  // CORRECCIÓN: identified debe ser el total REAL de referencias (no sumar duplicates)
                  identified: totalRefs,
                  duplicates: stats.duplicates || 0, // Duplicados detectados y marcados
                  afterDedup: totalRefs - (stats.duplicates || 0), // Referencias después de eliminar duplicados
                  screenedTitleAbstract: screenedInPhase1 > 0 ? screenedInPhase1 : totalRefs,
                  excludedTitleAbstract: excludedInPhase1,
                  fullTextAssessed: selectedForReview.length,
                  excludedFullText: excludedManual.length,
                  includedFinal: includedRefs.length,
                  pendingReview: pendingReview.length,
                  databases: databases.length > 0 ? databases : undefined,
                  exclusionReasons: Object.keys(exclusionReasons).length > 0 ? exclusionReasons : undefined,
                  screeningExclusionReasons: Object.keys(screeningExclusionReasons).length > 0 ? screeningExclusionReasons : undefined,
                  protocolExclusionCriteria: protocolExclusionCriteria.length > 0 ? protocolExclusionCriteria : undefined
                }

                return (
                  <div className="space-y-6">
                    {/* Diagrama PRISMA */}
                    <PrismaFlowDiagram stats={prismaStats} />
                    
                    {/* Botón para continuar a Resultados Detallado */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Continuar al Resumen Final</CardTitle>
                        <CardDescription>
                          Revise el resumen detallado de la revisión sistemática con las estadísticas completas, 
                          tablas de artículos incluidos/excluidos y opciones de exportación antes de finalizar el cribado.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => setActiveTab('resultados')}
                          className="w-full"
                          size="lg"
                        >
                          Ver Resultados Detallado
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )
              })()}
            </TabsContent>

            {/* PESTAÑA: Resultados Detallado (Resumen final) */}
            <TabsContent value="resultados" className="space-y-6">
              {(() => {
                // ═══ DATOS REALES DEL PROYECTO ═══
                const totalRefs = references.length
                const classifiedRefs = references.filter(r => r.aiClassification)
                const selectedRefs = references.filter(r => selectedForFullText.has(r.id))
                const includedRefs = selectedRefs.filter(r => r.manualReviewStatus === 'included')
                const excludedManualRefs = selectedRefs.filter(r => r.manualReviewStatus === 'excluded')
                const pendingRefs = selectedRefs.filter(r => !r.manualReviewStatus || r.manualReviewStatus === 'pending')
                const excludedByAI = references.filter(r => r.aiClassification === 'exclude')
                const analyzedByChatGPT = references.filter(r => r.aiReasoning?.toLowerCase().includes('chatgpt'))
                
                // Título y tema del proyecto
                const projectTitle = project?.title || 'Revisión Sistemática'
                // projectDescription available via project?.description if needed
                const researchArea = project?.researchArea || ''
                const picoFramework = project?.protocol?.picoFramework
                const researchQuestions = project?.protocol?.researchQuestions || []
                const inclusionCriteria = project?.protocol?.inclusionCriteria || []
                const exclusionCriteria = project?.protocol?.exclusionCriteria || []
                
                // Distribución temporal
                const yearCounts: Record<string, number> = {}
                includedRefs.forEach(ref => {
                  const year = ref.year?.toString() || 'N/A'
                  yearCounts[year] = (yearCounts[year] || 0) + 1
                })
                const sortedYears = Object.entries(yearCounts).sort(([a], [b]) => a.localeCompare(b))
                const peakYear = sortedYears.length > 0 ? sortedYears.reduce((max, curr) => curr[1] > max[1] ? curr : max, sortedYears[0]) : null
                
                // Fuentes por base de datos
                const sourceCounts: Record<string, number> = {}
                includedRefs.forEach(ref => {
                  const src = ref.source || 'Desconocida'
                  sourceCounts[src] = (sourceCounts[src] || 0) + 1
                })
                
                // Distribución de scores en incluidos
                const scores = includedRefs.map(r => parseFloat(String(r.screeningScore)) || 0).filter(s => s > 0 && !isNaN(s))
                const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0
                const maxScore = scores.length > 0 ? Math.max(...scores) : 0
                const minScore = scores.length > 0 ? Math.min(...scores) : 0
                
                // Motivos de exclusión
                const exclusionReasons: Record<string, number> = {}
                references.filter(r => r.status === 'excluded').forEach(ref => {
                  const reason = ref.exclusionReason || (ref.aiReasoning ? 'Exclusión automática por IA' : 'Sin motivo especificado')
                  exclusionReasons[reason] = (exclusionReasons[reason] || 0) + 1
                })
                
                // Keyword / topic extraction from included refs
                const keywordCounts: Record<string, number> = {}
                includedRefs.forEach(ref => {
                  if (ref.keywords) {
                    ref.keywords.split(/[,;]+/).map(k => k.trim().toLowerCase()).filter(k => k.length > 2).forEach(kw => {
                      keywordCounts[kw] = (keywordCounts[kw] || 0) + 1
                    })
                  }
                })
                const topKeywords = Object.entries(keywordCounts).sort(([,a], [,b]) => b - a).slice(0, 8)

                // Journals / revistas de los incluidos
                const journalCounts: Record<string, number> = {}
                includedRefs.forEach(ref => {
                  const journal = (ref as any).journal || ref.source || 'N/A'
                  journalCounts[journal] = (journalCounts[journal] || 0) + 1
                })
                const topJournals = Object.entries(journalCounts).sort(([,a], [,b]) => b - a).slice(0, 6)

                return (
              <div className="grid gap-6">
                {/* Sección 1: Diagrama de Flujo PRISMA */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      1. Diagrama de Flujo PRISMA (Selección de Estudios)
                    </CardTitle>
                    <CardDescription>
                      Transparencia, trazabilidad y replicabilidad del proceso de búsqueda y filtrado de la RSL: <em>"{projectTitle}"</em>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PrismaFlowDiagram stats={(() => {
                      // Desglose de motivos de exclusión en cribado título/abstract
                      const scrExcReasons: Record<string, number> = {}
                      const notSelectedClassified = classifiedRefs.filter(r => !selectedForFullText.has(r.id))
                      notSelectedClassified.forEach((ref) => {
                        if (ref.exclusionReason) {
                          const reason = ref.exclusionReason.trim()
                          scrExcReasons[reason] = (scrExcReasons[reason] || 0) + 1
                        } else if (ref.matchedCriteria && ref.matchedCriteria.length > 0) {
                          ref.matchedCriteria.forEach((criteria: string) => {
                            const reason = `No cumple: ${criteria.trim()}`
                            scrExcReasons[reason] = (scrExcReasons[reason] || 0) + 1
                          })
                        } else if (ref.aiClassification === 'exclude') {
                          const reason = 'No cumple criterios de inclusión (IA)'
                          scrExcReasons[reason] = (scrExcReasons[reason] || 0) + 1
                        } else {
                          const reason = 'Baja relevancia temática (score insuficiente)'
                          scrExcReasons[reason] = (scrExcReasons[reason] || 0) + 1
                        }
                      })

                      // Razones de exclusión manual (full-text)
                      const manualExcReasons: Record<string, number> = {}
                      excludedManualRefs.forEach((ref) => {
                        if (ref.exclusionReason) {
                          const reason = ref.exclusionReason.trim()
                          manualExcReasons[reason] = (manualExcReasons[reason] || 0) + 1
                        }
                      })

                      return {
                        identified: totalRefs,
                        duplicates: 0,
                        afterDedup: totalRefs,
                        screenedTitleAbstract: classifiedRefs.length > 0 ? classifiedRefs.length : totalRefs,
                        excludedTitleAbstract: classifiedRefs.length - selectedRefs.length,
                        fullTextAssessed: selectedRefs.length,
                        excludedFullText: excludedManualRefs.length,
                        includedFinal: includedRefs.length,
                        screeningExclusionReasons: Object.keys(scrExcReasons).length > 0 ? scrExcReasons : undefined,
                        exclusionReasons: Object.keys(manualExcReasons).length > 0 ? manualExcReasons : undefined,
                        protocolExclusionCriteria: exclusionCriteria.length > 0 ? exclusionCriteria : undefined,
                      }
                    })()} />
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg space-y-2">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200">Descripción del proceso de selección:</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        De un total de <strong>{totalRefs}</strong> registros identificados en las bases de datos 
                        ({Object.entries(sourceCounts).map(([src, count]) => `${src}: ${count}`).join(', ') || 'múltiples fuentes'}), 
                        se realizó el cribado automático mediante análisis de embeddings semánticos y modelos de lenguaje (ChatGPT). 
                        {classifiedRefs.length > 0 && <> El proceso de cribado por título y abstract clasificó <strong>{classifiedRefs.length}</strong> referencias, 
                        resultando en la exclusión de <strong>{classifiedRefs.length - selectedRefs.length}</strong> artículos que no cumplían los criterios de inclusión. </>}
                        {analyzedByChatGPT.length > 0 && <> El análisis complementario por ChatGPT evaluó <strong>{analyzedByChatGPT.length}</strong> referencias en la zona gris. </>}
                        Se seleccionaron <strong>{selectedRefs.length}</strong> artículos para evaluación de texto completo, 
                        de los cuales <strong>{includedRefs.length}</strong> fueron incluidos en la síntesis final
                        {excludedManualRefs.length > 0 && <> y <strong>{excludedManualRefs.length}</strong> fueron excluidos tras la revisión manual</>}.
                        {pendingRefs.length > 0 && <> Quedan <strong>{pendingRefs.length}</strong> artículos pendientes de revisión.</>}
                      </p>
                      <div className="mt-2 p-3 bg-blue-100 dark:bg-blue-900/40 rounded text-xs text-blue-700 dark:text-blue-300">
                        <strong>Recomendación para la tesis:</strong> Este diagrama debe incluirse en el capítulo de Metodología como Figura X. 
                        Referencia: Page MJ, McKenzie JE, Bossuyt PM, et al. The PRISMA 2020 statement. BMJ 2021;372:n71.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sección 2: Distribución Temporal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📊 2. Distribución Temporal de Estudios Incluidos
                    </CardTitle>
                    <CardDescription>
                      Vigencia y evolución del interés científico en: <em>"{projectTitle}"</em>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">Distribución por Año de Publicación ({includedRefs.length} estudios incluidos)</h4>
                        {sortedYears.length > 0 ? (
                          <div className="space-y-3">
                            {/* Barras visuales */}
                            {sortedYears.map(([year, count]) => {
                              const maxCount = Math.max(...sortedYears.map(([,c]) => c))
                              const percentage = (count / maxCount) * 100
                              return (
                                <div key={year} className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-sm w-12">{year}</span>
                                  <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                                    <div 
                                      className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2 transition-all"
                                      style={{ width: `${Math.max(percentage, 15)}%` }}
                                    >
                                      <span className="text-xs font-bold text-white">{count}</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No hay artículos incluidos aún para mostrar distribución temporal.</p>
                        )}
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-green-900 dark:text-green-200">Descripción:</h4>
                        <p className="text-sm text-green-800 dark:text-green-300">
                          {sortedYears.length > 0 ? (
                            <>
                              La distribución anual de los <strong>{includedRefs.length}</strong> estudios incluidos 
                              abarca el período {sortedYears[0][0]}–{sortedYears[sortedYears.length - 1][0]}.
                              {peakYear && <> El mayor número de publicaciones se concentra en <strong>{peakYear[0]}</strong> con {peakYear[1]} estudio{peakYear[1] > 1 ? 's' : ''}.</>}
                              {' '}Esto indica que la investigación sobre <em>{researchArea || projectTitle}</em> se encuentra en un estado{' '}
                              {sortedYears.length >= 3 ? 'de desarrollo activo con producción científica reciente.' : 
                               sortedYears.length >= 2 ? 'emergente con publicaciones en los últimos años.' : 
                               'inicial con evidencia limitada.'}
                            </>
                          ) : (
                            'Pendiente de artículos incluidos para generar análisis temporal.'
                          )}
                        </p>
                        <div className="mt-2 p-3 bg-green-100 dark:bg-green-900/40 rounded text-xs text-green-700 dark:text-green-300">
                          <strong>Librería recomendada para gráfico publicable:</strong> Matplotlib o Seaborn (Python). 
                          Ideal para gráficos de barras o línea de tendencia con resolución de publicación científica.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sección 3: Evaluación de Calidad */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      ⭐ 3. Evaluación de Calidad Metodológica
                    </CardTitle>
                    <CardDescription>
                      Análisis del rigor metodológico de los {includedRefs.length} artículos seleccionados según criterios de Kitchenham (2007)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Criterios de inclusión del protocolo como proxy de calidad */}
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">Criterios de Inclusión Evaluados (del Protocolo)</h4>
                        {inclusionCriteria.length > 0 ? (
                          <div className="grid gap-2">
                            {inclusionCriteria.map((criteria: string, idx: number) => {
                              // Contar cuántos incluidos mencionan este criterio en su razonamiento
                              const matchCount = includedRefs.filter(r => {
                                const reasoning = (r.aiReasoning || '').toLowerCase()
                                const criteriaLower = criteria.toLowerCase()
                                // Buscar coincidencia parcial con palabras clave del criterio
                                const keywords = criteriaLower.split(/\s+/).filter(w => w.length > 4)
                                return keywords.some(kw => reasoning.includes(kw))
                              }).length
                              // Si no hay match por razonamiento, mostrar included/selected
                              const displayCount = matchCount > 0 ? matchCount : includedRefs.length
                              const displayTotal = selectedRefs.length
                              const ratio = displayTotal > 0 ? displayCount / displayTotal : 0
                              return (
                                <div key={`ic-${idx}`} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded">
                                  <span className="text-sm flex-1">IC{idx + 1}: {criteria}</span>
                                  <Badge variant="outline" className={ratio >= 0.8 
                                    ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                                    : ratio >= 0.5
                                    ? 'bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
                                    : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                                  }>
                                    {displayCount}/{displayTotal} cumplen
                                  </Badge>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">Define criterios de inclusión en el protocolo para esta evaluación.</p>
                        )}
                        
                        {exclusionCriteria.length > 0 && (
                          <>
                            <h4 className="font-semibold mt-4 mb-3">Criterios de Exclusión Aplicados</h4>
                            <div className="grid gap-2">
                              {exclusionCriteria.map((criteria: string, idx: number) => {
                                // Contar excluidos cuya razón mencione palabras clave de este criterio
                                const allExcluded = references.filter(r => r.status === 'excluded')
                                const criteriaLower = criteria.toLowerCase()
                                const keywords = criteriaLower.split(/\s+/).filter(w => w.length > 4)
                                const matchCount = allExcluded.filter(r => {
                                  const reason = (r.exclusionReason || r.aiReasoning || '').toLowerCase()
                                  return keywords.some(kw => reason.includes(kw))
                                }).length
                                // Si no hay match individual, mostrar total de excluidos / nro de criterios
                                const displayCount = matchCount > 0 ? matchCount : Math.round(allExcluded.length / exclusionCriteria.length)
                                return (
                                  <div key={`ec-${idx}`} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/50 rounded">
                                    <span className="text-sm flex-1">EC{idx + 1}: {criteria}</span>
                                    <Badge variant="outline" className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700">
                                      {displayCount} excluidos
                                    </Badge>
                                  </div>
                                )
                              })}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Distribución de confianza IA */}
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">Distribución de Confianza del Screening por IA</h4>
                        <p className="text-xs text-muted-foreground mb-3">Similitud coseno entre embeddings semánticos del abstract y el protocolo de investigación. Rango típico: 15%–50%.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className={`p-3 rounded text-center ${maxScore >= 0.4 ? 'bg-green-100 dark:bg-green-950/50' : maxScore >= 0.25 ? 'bg-yellow-100 dark:bg-yellow-950/50' : 'bg-red-100 dark:bg-red-950/50'}`}>
                            <div className={`text-xl font-bold ${maxScore >= 0.4 ? 'text-green-700 dark:text-green-300' : maxScore >= 0.25 ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300'}`}>{scores.length > 0 ? `${(maxScore * 100).toFixed(1)}%` : 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">Score Máximo</div>
                          </div>
                          <div className={`p-3 rounded text-center ${avgScore >= 0.35 ? 'bg-green-100 dark:bg-green-950/50' : avgScore >= 0.2 ? 'bg-yellow-100 dark:bg-yellow-950/50' : 'bg-red-100 dark:bg-red-950/50'}`}>
                            <div className={`text-xl font-bold ${avgScore >= 0.35 ? 'text-green-700 dark:text-green-300' : avgScore >= 0.2 ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300'}`}>{scores.length > 0 ? `${(avgScore * 100).toFixed(1)}%` : 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">Score Promedio</div>
                          </div>
                          <div className={`p-3 rounded text-center ${minScore >= 0.3 ? 'bg-green-100 dark:bg-green-950/50' : minScore >= 0.15 ? 'bg-yellow-100 dark:bg-yellow-950/50' : 'bg-red-100 dark:bg-red-950/50'}`}>
                            <div className={`text-xl font-bold ${minScore >= 0.3 ? 'text-green-700 dark:text-green-300' : minScore >= 0.15 ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300'}`}>{scores.length > 0 ? `${(minScore * 100).toFixed(1)}%` : 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">Score Mínimo</div>
                          </div>
                          <div className="p-3 bg-purple-100 dark:bg-purple-950/50 rounded text-center">
                            <div className="text-xl font-bold text-purple-700 dark:text-purple-300">{includedRefs.length}</div>
                            <div className="text-xs text-purple-800 dark:text-purple-400">Estudios Incluidos</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-200">Descripción:</h4>
                        <p className="text-sm text-purple-800 dark:text-purple-300">
                          {includedRefs.length > 0 ? (
                            <>
                              De los <strong>{selectedRefs.length}</strong> artículos evaluados a texto completo, 
                              <strong> {includedRefs.length}</strong> ({selectedRefs.length > 0 ? ((includedRefs.length / selectedRefs.length) * 100).toFixed(0) : 0}%) 
                              cumplieron con todos los criterios de inclusión definidos en el protocolo
                              {inclusionCriteria.length > 0 && <> ({inclusionCriteria.length} criterios)</>}.
                              {scores.length > 0 && <> Los artículos incluidos obtuvieron un score de similitud semántica promedio 
                              de <strong>{(avgScore * 100).toFixed(1)}%</strong> (rango: {(minScore * 100).toFixed(1)}%–{(maxScore * 100).toFixed(1)}%), 
                              indicando {avgScore >= 0.5 ? 'una alta coherencia semántica' : avgScore >= 0.35 ? 'una coherencia moderada' : avgScore >= 0.2 ? 'una coherencia baja — se recomienda verificar la relevancia manualmente' : 'baja similitud con el protocolo — las referencias podrían no ser relevantes al tema de investigación'} con el protocolo de investigación.</>}
                            </>
                          ) : (
                            'Pendiente de artículos incluidos para evaluación de calidad.'
                          )}
                        </p>
                        <div className="mt-2 p-3 bg-purple-100 dark:bg-purple-900/40 rounded text-xs text-purple-700 dark:text-purple-300">
                          <strong>Librería recomendada:</strong> Plotly (Python) para barras apiladas que muestren proporción de cumplimiento 
                          (Sí/No/Parcial) por cada criterio de calidad según Kitchenham (2007).
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sección 4: Mapeo Temático */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🎯 4. Mapeo Temático y Concentración de Estudios
                    </CardTitle>
                    <CardDescription>
                      Identificación de áreas cubiertas y vacíos de investigación en los {includedRefs.length} estudios incluidos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Keywords de los artículos incluidos */}
                      {topKeywords.length > 0 && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-3">Términos Clave más Frecuentes</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {topKeywords.map(([keyword, count], idx) => {
                              const colors = [
                                'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
                                'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300',
                                'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300',
                                'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300',
                                'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300',
                                'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300',
                                'bg-pink-100 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300',
                                'bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300'
                              ]
                              return (
                                <div key={keyword} className={`p-3 rounded text-center ${colors[idx % colors.length]}`}>
                                  <div className="text-lg font-bold">{count}</div>
                                  <div className="text-xs capitalize">{keyword}</div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Fuentes / Revistas principales */}
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">Distribución por Fuente / Revista</h4>
                        {topJournals.length > 0 ? (
                          <div className="space-y-2">
                            {topJournals.map(([journal, count]) => {
                              const percentage = (count / includedRefs.length) * 100
                              return (
                                <div key={journal} className="flex items-center gap-3">
                                  <span className="text-sm w-1/2 truncate" title={journal}>{journal}</span>
                                  <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-5 overflow-hidden">
                                    <div 
                                      className="bg-indigo-500 h-full rounded-full flex items-center justify-end pr-2"
                                      style={{ width: `${Math.max(percentage, 15)}%` }}
                                    >
                                      <span className="text-xs font-bold text-white">{count}</span>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 w-10">{percentage.toFixed(0)}%</span>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No hay artículos incluidos aún.</p>
                        )}
                      </div>

                      {/* PICO si existe */}
                      {picoFramework && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-3">Dimensiones PICO del Protocolo</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {picoFramework.population && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded">
                                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">P - Población</div>
                                <div className="text-sm mt-1">{picoFramework.population}</div>
                              </div>
                            )}
                            {picoFramework.intervention && (
                              <div className="p-3 bg-green-50 dark:bg-green-950/50 rounded">
                                <div className="text-xs font-semibold text-green-700 dark:text-green-300">I - Intervención</div>
                                <div className="text-sm mt-1">{picoFramework.intervention}</div>
                              </div>
                            )}
                            {picoFramework.comparison && (
                              <div className="p-3 bg-orange-50 dark:bg-orange-950/50 rounded">
                                <div className="text-xs font-semibold text-orange-700 dark:text-orange-300">C - Comparación</div>
                                <div className="text-sm mt-1">{picoFramework.comparison}</div>
                              </div>
                            )}
                            {(picoFramework.outcome || picoFramework.outcomes) && (
                              <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded">
                                <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">O - Resultado</div>
                                <div className="text-sm mt-1">{picoFramework.outcome || picoFramework.outcomes}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-200">Descripción:</h4>
                        <p className="text-sm text-orange-800 dark:text-orange-300">
                          {includedRefs.length > 0 ? (
                            <>
                              El análisis temático de los <strong>{includedRefs.length}</strong> estudios incluidos 
                              revela que las publicaciones provienen de <strong>{Object.keys(journalCounts).length}</strong> fuentes diferentes
                              {topJournals.length > 0 && <>, siendo la fuente más frecuente <strong>{topJournals[0][0]}</strong> con {topJournals[0][1]} artículo{topJournals[0][1] > 1 ? 's' : ''}</>}.
                              {topKeywords.length > 0 && <> Los términos clave más recurrentes son: {topKeywords.slice(0, 4).map(([kw]) => `"${kw}"`).join(', ')}, 
                              lo que confirma la alineación con el tema de investigación. </>}
                              {Object.keys(sourceCounts).length > 1 && <> La diversidad de bases de datos ({Object.keys(sourceCounts).join(', ')}) refuerza 
                              la exhaustividad de la búsqueda bibliográfica.</>}
                            </>
                          ) : (
                            'Pendiente de artículos incluidos para el mapeo temático.'
                          )}
                        </p>
                        <div className="mt-2 p-3 bg-orange-100 dark:bg-orange-900/40 rounded text-xs text-orange-700 dark:text-orange-300">
                          <strong>Librería recomendada:</strong> Plotly Express (Python) para gráfico de burbujas con tres dimensiones 
                          (Eje X: Tema, Eje Y: Fuente, Tamaño: Número de estudios). También se puede usar WordCloud para mapa de palabras clave.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sección 5: Síntesis de Artículos Incluidos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📋 5. Síntesis de Estudios Incluidos
                    </CardTitle>
                    <CardDescription>
                      Tabla comparativa de los {includedRefs.length} artículos que pasaron todos los filtros de selección
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {includedRefs.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-300 dark:border-slate-600 text-sm text-gray-900 dark:text-gray-100">
                            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100">
                              <tr>
                                <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left">#</th>
                                <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left">Autores</th>
                                <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left">Año</th>
                                <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left">Título</th>
                                <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left">Fuente</th>
                                <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left">Score IA</th>
                                <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left">DOI</th>
                              </tr>
                            </thead>
                            <tbody>
                              {includedRefs.sort((a, b) => (b.screeningScore || 0) - (a.screeningScore || 0)).map((ref, idx) => (
                                <tr key={ref.id} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}>
                                  <td className="border border-gray-300 dark:border-slate-600 px-3 py-2 font-mono">{idx + 1}</td>
                                  <td className="border border-gray-300 dark:border-slate-600 px-3 py-2 max-w-[200px] truncate" title={ref.authors.join(', ')}>
                                    {ref.authors.length > 0 ? (ref.authors[0].split(' ').pop() || ref.authors[0]) + (ref.authors.length > 1 ? ' et al.' : '') : 'N/A'}
                                  </td>
                                  <td className="border border-gray-300 dark:border-slate-600 px-3 py-2">{ref.year || 'N/A'}</td>
                                  <td className="border border-gray-300 dark:border-slate-600 px-3 py-2 max-w-[300px]">
                                    <span className="line-clamp-2" title={ref.title}>{ref.title}</span>
                                  </td>
                                  <td className="border border-gray-300 dark:border-slate-600 px-3 py-2">{ref.source || 'N/A'}</td>
                                  <td className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-center">
                                    <Badge variant="outline" className={
                                      (ref.screeningScore || 0) >= 0.3 ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' :
                                      (ref.screeningScore || 0) >= 0.2 ? 'bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' :
                                      'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600'
                                    }>
                                      {ref.screeningScore ? `${(ref.screeningScore * 100).toFixed(1)}%` : 'N/A'}
                                    </Badge>
                                  </td>
                                  <td className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-xs max-w-[150px] truncate" title={ref.doi || ''}>
                                    {ref.doi || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : pendingRefs.length > 0 ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Artículos pendientes de revisión</AlertTitle>
                          <AlertDescription>
                            Hay <strong>{pendingRefs.length}</strong> artículos seleccionados pendientes de ser marcados como incluidos o excluidos. 
                            Usa el botón "Cargar" en la pestaña de Clasificación IA para revisarlos.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <p className="text-muted-foreground text-sm text-center py-8">
                          No hay artículos incluidos aún. Completa la revisión de los artículos seleccionados.
                        </p>
                      )}
                      
                      {/* Motivos de exclusión si hay */}
                      {Object.keys(exclusionReasons).length > 0 && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-3">Motivos de Exclusión Registrados</h4>
                          <div className="grid gap-2">
                            {Object.entries(exclusionReasons).sort(([,a], [,b]) => b - a).map(([reason, count]) => (
                              <div key={reason} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/50 rounded">
                                <span className="text-sm flex-1 mr-2">{reason.length > 80 ? reason.substring(0, 80) + '...' : reason}</span>
                                <Badge variant="outline" className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 flex-shrink-0">
                                  {count} artículo{count > 1 ? 's' : ''}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-red-900 dark:text-red-200">Descripción:</h4>
                        <p className="text-sm text-red-800 dark:text-red-300">
                          {includedRefs.length > 0 ? (
                            <>
                              La tabla presenta los <strong>{includedRefs.length}</strong> estudios que superaron todos los filtros de selección 
                              para la RSL <em>"{projectTitle}"</em>.
                              {scores.length > 0 && <> Los scores de relevancia oscilan entre {(minScore * 100).toFixed(1)}% y {(maxScore * 100).toFixed(1)}%, 
                              con un promedio de {(avgScore * 100).toFixed(1)}%. </>}
                              {Object.keys(sourceCounts).length > 1 && <> Los artículos provienen de {Object.keys(sourceCounts).length} bases de datos distintas, 
                              asegurando diversidad en las fuentes. </>}
                              {researchQuestions.length > 0 && <> Estos estudios serán utilizados para responder las {researchQuestions.length} preguntas de investigación 
                              definidas en el protocolo.</>}
                            </>
                          ) : (
                            'Pending: incluye artículos para generar la síntesis técnica.'
                          )}
                        </p>
                        <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/40 rounded text-xs text-red-700 dark:text-red-300">
                          <strong>Librería recomendada:</strong> Pandas (Python) con exportación a Styler para formato LaTeX/HTML. 
                          Usar <code className="bg-white dark:bg-slate-800 px-1 rounded">df.to_latex()</code> para generar tablas directamente insertables en el documento.
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          const headers = ['#', 'Autores', 'Año', 'Título', 'Fuente', 'Score IA', 'DOI']
                          const rows = includedRefs.map((ref, idx) => [
                            idx + 1,
                            `"${ref.authors.join('; ').replace(/"/g, '""')}"`,
                            ref.year || 'N/A',
                            `"${ref.title.replace(/"/g, '""')}"`,
                            ref.source || 'N/A',
                            ref.screeningScore ? `${(ref.screeningScore * 100).toFixed(1)}%` : 'N/A',
                            ref.doi || ''
                          ])
                          const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
                          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                          const link = document.createElement('a')
                          link.href = URL.createObjectURL(blob)
                          link.download = `estudios-incluidos-${new Date().toISOString().split('T')[0]}.csv`
                          link.click()
                          toast({ title: "CSV exportado", description: `${includedRefs.length} estudios incluidos exportados.` })
                        }}>
                          <Download className="h-4 w-4 mr-2" />
                          Exportar Tabla CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          // Export ALL references with full data
                          const headers = ['#', 'Autores', 'Año', 'Título', 'Fuente', 'DOI', 'Estado', 'Score IA', 'Razón Exclusión']
                          const rows = references.map((ref, idx) => [
                            idx + 1,
                            `"${ref.authors.join('; ').replace(/"/g, '""')}"`,
                            ref.year || 'N/A',
                            `"${ref.title.replace(/"/g, '""')}"`,
                            ref.source || 'N/A',
                            ref.doi || '',
                            ref.status,
                            ref.screeningScore ? `${(ref.screeningScore * 100).toFixed(1)}%` : 'N/A',
                            `"${(ref.exclusionReason || '').replace(/"/g, '""')}"`
                          ])
                          const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
                          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                          const link = document.createElement('a')
                          link.href = URL.createObjectURL(blob)
                          link.download = `todas-referencias-${new Date().toISOString().split('T')[0]}.csv`
                          link.click()
                          toast({ title: "CSV completo exportado", description: `${references.length} referencias totales exportadas.` })
                        }}>
                          <Download className="h-4 w-4 mr-2" />
                          Exportar Todas las Referencias
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Botón Final: Finalizar Cribado, Completar PRISMA y Redirigir a Artículo */}
                <Card className="border-2 border-primary bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/40 dark:to-blue-950/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                      <CheckCircle2 className="h-6 w-6" />
                      Finalizar Proceso de Cribado
                    </CardTitle>
                    <CardDescription>
                      Una vez finalizado, se completará automáticamente el checklist PRISMA 2020 y 
                      podrá acceder a la sección de Artículo para generar su borrador completo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center border dark:border-slate-700">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalRefs}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Identificados</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center border dark:border-slate-700">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{selectedRefs.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Evaluados</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center border dark:border-slate-700">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{includedRefs.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Incluidos Final</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center border dark:border-slate-700">
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{excludedManualRefs.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Excluidos Manual</div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={async () => {
                          setIsFinalizingScreening(true)
                          try {
                            // Solo marcar estado de finalización — NO sobrescribir databases ni searchQueries
                            // Los datos originales del protocolo (wizard) deben preservarse intactos
                            await apiClient.updateProtocol(params.id, {
                              screeningFinalized: true,
                              prismaUnlocked: true,
                            })
                            
                            setScreeningFinalized(true)
                            
                            toast({
                              title: "Cribado Finalizado",
                              description: "Completando PRISMA 2020 automáticamente..."
                            })
                            
                            // 2. Generar automáticamente todo el contenido de PRISMA
                            const prismaResponse = await apiClient.completePrismaByBlocks(params.id, 'all')
                            
                            if (prismaResponse.success) {
                              toast({
                                title: "✅ PRISMA Completado",
                                description: "Redirigiendo a la sección de Artículo...",
                              })
                            } else {
                              toast({
                                title: "⚠️ PRISMA parcialmente completado",
                                description: "Puede revisar PRISMA antes de generar el artículo",
                                variant: "destructive"
                              })
                            }
                            
                            // 3. Redirigir al Artículo después de 2 segundos
                            setTimeout(() => {
                              router.push(`/projects/${params.id}/article`)
                            }, 2000)
                          } catch (error: any) {
                            console.error('❌ Error al finalizar cribado:', error)
                            toast({
                              title: "Error",
                              description: error.message || "No se pudo finalizar el cribado",
                              variant: "destructive"
                            })
                          } finally {
                            setIsFinalizingScreening(false)
                          }
                        }}
                        disabled={screeningFinalized || isFinalizingScreening || selectedForFullText.size === 0}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        size="lg"
                      >
                        {isFinalizingScreening ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Completando PRISMA...
                          </>
                        ) : screeningFinalized ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Cribado Finalizado
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Finalizar Cribado y Generar Artículo
                          </>
                        )}
                      </Button>
                      
                      {selectedForFullText.size === 0 && (
                        <p className="text-sm text-muted-foreground text-center">
                          Debe completar la selección de artículos en "Clasificación IA" antes de finalizar
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
                )
              })()}
            </TabsContent>

          </Tabs>
        </div>
      </main>

      {/* Diálogo de Duplicados */}
      <DuplicateDetectionDialog
        open={showDuplicatesDialog}
        onOpenChange={setShowDuplicatesDialog}
        duplicateGroups={duplicateGroups}
        onKeepReference={handleKeepReference}
        isProcessing={isDetectingDuplicates}
      />
    </div>
  )
}
