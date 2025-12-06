"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProjectBreadcrumb } from "@/components/project-breadcrumb"
import { ReferenceTable } from "@/components/screening/reference-table"
import { AIScreeningPanel } from "@/components/screening/ai-screening-panel"
import { BulkActionsBar } from "@/components/screening/bulk-actions-bar"
import { ScreeningFilters } from "@/components/screening/screening-filters"
import { IndividualReview } from "@/components/screening/individual-review"
import { IndividualReviewEnhanced } from "@/components/screening/individual-review-enhanced"
import { DuplicateDetectionDialog } from "@/components/screening/duplicate-detection-dialog"
import { HybridScreeningStats } from "@/components/screening/hybrid-screening-stats"
import { ClassifiedReferencesView } from "@/components/screening/classified-references-view"
import { ExclusionReasonsTable } from "@/components/screening/exclusion-reasons-table"
import { PrismaFlowDiagram } from "@/components/screening/prisma-flow-diagram"
import { FullTextReview } from "@/components/screening/full-text-review"
import { apiClient } from "@/lib/api-client"
import type { Reference } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDown, Loader2, AlertCircle, ClipboardCheck, ExternalLink, Database, Copy, Trash2, CheckCircle2, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ScreeningPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [references, setReferences] = useState<Reference[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<"fase1" | "fase2" | "fase3" | "exclusiones" | "prisma">("fase1")
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

  // Cargar referencias del proyecto y protocolo (search queries)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        // Cargar TODAS las referencias (sin límite de paginación para screening)
        console.log('🔄 Cargando TODAS las referencias del proyecto...')
        const refData = await apiClient.getAllReferences(params.id)
        console.log(`✅ Referencias cargadas: ${refData.references?.length || 0}`)
        setReferences(refData.references || [])
        setStats(refData.stats || { total: 0, pending: 0, included: 0, excluded: 0 })

        // Cargar protocolo para obtener search queries, keyTerms y resultados de cribado
        try {
          const protocol = await apiClient.getProtocol(params.id)
          if (protocol?.searchPlan?.searchQueries) {
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
              console.warn('Resultados de screening en formato antiguo, se ignorarán:', protocol.screeningResults)
              setLastScreeningResult(null)
            }
          }
          if (protocol?.fase2Unlocked) {
            setFase2Unlocked(protocol.fase2Unlocked)
          }
        } catch (protocolErr) {
          console.log("No se pudo cargar el protocolo (probablemente no existe aún)")
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

  // Función para recargar solo las referencias (útil después de subir PDFs)
  const reloadReferences = async () => {
    try {
      const refData = await apiClient.getAllReferences(params.id)
      setReferences(refData.references || [])
      setStats(refData.stats || { total: 0, pending: 0, included: 0, excluded: 0 })
      console.log('🔄 Referencias recargadas:', refData.references?.length)
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

  const handleBulkInclude = async () => {
    try {
      await Promise.all(selectedIds.map(id => apiClient.updateReferenceStatus(id, { status: 'included' })))
      setReferences((prev) =>
        prev.map((ref) => (selectedIds.includes(ref.id) ? { ...ref, status: "included" as const } : ref)),
      )
      toast({ title: "Referencias incluidas", description: `${selectedIds.length} referencias marcadas como incluidas` })
      setSelectedIds([])
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron actualizar las referencias", variant: "destructive" })
    }
  }

  const handleBulkExclude = async () => {
    try {
      await Promise.all(selectedIds.map(id => apiClient.updateReferenceStatus(id, { status: 'excluded' })))
      setReferences((prev) =>
        prev.map((ref) => (selectedIds.includes(ref.id) ? { ...ref, status: "excluded" as const } : ref)),
      )
      toast({ title: "Referencias excluidas", description: `${selectedIds.length} referencias marcadas como excluidas` })
      setSelectedIds([])
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron actualizar las referencias", variant: "destructive" })
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} referencias? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      // Eliminar referencias del backend
      await Promise.all(selectedIds.map(id => apiClient.deleteReference(id)))
      
      // Actualizar estado local
      const deletedCount = selectedIds.length
      setReferences((prev) => prev.filter((ref) => !selectedIds.includes(ref.id)))
      
      // Actualizar estadísticas
      setStats((prev) => {
        const newStats = { ...prev }
        selectedIds.forEach(id => {
          const ref = references.find(r => r.id === id)
          if (ref) {
            newStats.total--
            if (ref.status === 'pending') newStats.pending--
            else if (ref.status === 'included') newStats.included--
            else if (ref.status === 'excluded') newStats.excluded--
          }
        })
        return newStats
      })
      
      toast({ 
        title: "Referencias eliminadas", 
        description: `${deletedCount} referencias eliminadas permanentemente` 
      })
      setSelectedIds([])
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "No se pudieron eliminar las referencias", 
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
        console.log(`🚀 Iniciando cribado híbrido para ${totalRefs} referencias...`)
        const result = await apiClient.runScreeningEmbeddings(params.id, { threshold })
        
        if (result.success && result.summary) {
          console.log('📊 Resultado del cribado recibido:', result)
          
          // Validar formato antes de guardar
          if (!result.summary.phase1 || !result.summary.phase2) {
            console.error('❌ Error: resultado sin phase1 o phase2', result)
            throw new Error('Formato de respuesta del backend inválido')
          }
          
          // Guardar resultado para mostrar estadísticas
          setLastScreeningResult(result)
          
          // Persistir resultados en el protocolo para que no se pierdan
          try {
            const protocol = await apiClient.getProtocol(params.id)
            if (protocol) {
              await apiClient.updateProtocol(params.id, {
                ...protocol,
                screeningResults: result
              })
            }
          } catch (err) {
            console.warn('No se pudieron guardar los resultados en el protocolo:', err)
          }
          
          // Recargar TODAS las referencias para obtener los resultados actualizados
          const refData = await apiClient.getAllReferences(params.id)
          setReferences(refData.references || [])
          setStats(refData.stats || { total: 0, pending: 0, included: 0, excluded: 0 })
          
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
          {/* Breadcrumb */}
          <ProjectBreadcrumb projectId={params.id} projectTitle="Mi Proyecto RSL" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cribado de Referencias</h1>
              <p className="text-muted-foreground">
                Revisa y clasifica estudios según criterios de elegibilidad PICO con asistencia de IA
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleExport}
                disabled={isExporting || references.length === 0}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="mr-2 h-4 w-4" />
                )}
                Exportar
              </Button>
            </div>
          </div>

          {/* Resumen de datos - Panel único consolidado */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Copy className="h-5 w-5" />
                    Resumen de datos
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {duplicatesStats ? 
                      "¡Hurra! 🎉 ¡Has importado datos con éxito a Rayyan! Ahora es hora de detectar duplicados." :
                      "Importa referencias y detecta duplicados automáticamente"
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Referencias importadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.total}</div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2 w-full"
                      disabled
                    >
                      Añadir referencias
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total de duplicados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{duplicatesStats?.duplicates || 0}</div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={handleDetectDuplicates}
                      disabled={isDetectingDuplicates || stats.total < 2}
                    >
                      {isDetectingDuplicates ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Detectando...
                        </>
                      ) : (
                        'Detectar duplicados'
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pendiente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2 w-full"
                      disabled={stats.pending === 0}
                    >
                      Empieza a resolver
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Resuelto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">✓ No duplicado</span>
                      <span className="font-medium">{duplicatesStats?.unique || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        <Trash2 className="h-3 w-3 inline mr-1" />
                        Borrado
                      </span>
                      <span className="font-medium">0</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Search Queries from Protocol (if available) */}
          {searchQueries.length > 0 && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Búsqueda Académica Automatizada
                </CardTitle>
                <CardDescription>
                  Ejecuta las búsquedas configuradas en el protocolo para importar referencias automáticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {searchQueries.map((query) => (
                  <div key={query.databaseId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{query.databaseName}</span>
                        {query.resultCount !== null && (
                          <Badge variant="secondary">
                            {query.resultCount.toLocaleString()} resultados
                          </Badge>
                        )}
                        {query.hasAPI ? (
                          <Badge variant="default" className="bg-green-500">API disponible</Badge>
                        ) : (
                          <Badge variant="outline">Manual</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {query.query}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {query.hasAPI && query.databaseId === 'scopus' ? (
                        <Button
                          onClick={() => handleFetchFromScopus(query)}
                          disabled={isFetching.has(query.databaseId)}
                          size="sm"
                        >
                          {isFetching.has(query.databaseId) ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Buscando...
                            </>
                          ) : (
                            <>
                              <Database className="h-4 w-4 mr-2" />
                              Buscar y Guardar
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          {query.hasAPI ? 'Próximamente' : 'Subir CSV'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tabs de Fases del Cribado */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="fase1" className="flex flex-col items-center gap-1 py-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="font-semibold">Fase 1</span>
                </div>
                <span className="text-xs text-muted-foreground">Clasificación IA</span>
              </TabsTrigger>
              <TabsTrigger value="fase2" className="flex flex-col items-center gap-1 py-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="font-semibold">Fase 2</span>
                </div>
                <span className="text-xs text-muted-foreground">Revisión Manual</span>
              </TabsTrigger>
              <TabsTrigger value="fase3" className="flex flex-col items-center gap-1 py-3">
                <div className="flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  <span className="font-semibold">Fase 3</span>
                </div>
                <span className="text-xs text-muted-foreground">Texto Completo</span>
              </TabsTrigger>
              <TabsTrigger value="exclusiones" className="flex flex-col items-center gap-1 py-3">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span className="font-semibold">Exclusiones</span>
                </div>
                <span className="text-xs text-muted-foreground">Motivos</span>
              </TabsTrigger>
              <TabsTrigger value="prisma" className="flex flex-col items-center gap-1 py-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="font-semibold">PRISMA</span>
                </div>
                <span className="text-xs text-muted-foreground">Diagrama</span>
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
              />
              
              {lastScreeningResult && (
                <HybridScreeningStats result={lastScreeningResult} />
              )}

              {/* Tabla de Referencias */}
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
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        showActions={false}
                        enableSelection={false}
                      />
                    </CardContent>
                  </Card>

              {lastScreeningResult && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>📊 Resultados de la Clasificación</CardTitle>
                    <CardDescription>
                      Referencias organizadas por método de clasificación
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ClassifiedReferencesView 
                      references={references.filter(r => r.aiReasoning || r.aiClassification || r.screeningScore !== undefined)} 
                    />
                    
                    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-dashed">
                      <div className="flex items-start gap-4">
                        <CheckCircle2 className="h-10 w-10 text-green-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">✅ Clasificación Automática Completada</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            La IA ha clasificado {lastScreeningResult.summary.processed} referencias. Las referencias que necesitan tu revisión están listas en la Fase 2.
                          </p>
                          <Button onClick={() => {
                            setFase2Unlocked(true)
                            setActiveTab("fase2")
                            // Guardar en el protocolo
                            apiClient.getProtocol(params.id).then(protocol => {
                              if (protocol) {
                                apiClient.updateProtocol(params.id, { ...protocol, fase2Unlocked: true })
                              }
                            }).catch(err => console.warn('No se pudo actualizar el protocolo:', err))
                          }} size="lg">
                            Continuar a Fase 2: Revisión Manual →
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* FASE 2: Revisión Manual */}
            <TabsContent value="fase2" className="space-y-6">
              {(() => {
                // Verificar si se ha ejecutado el cribado de Fase 1
                const hasAIClassification = references.some(r => r.aiClassification)
                
                // Solo mostrar referencias que NECESITAN revisión manual:
                // 1. Las que la IA recomendó INCLUIR (para confirmar)
                // 2. Las que están en duda/revisar
                // NO mostrar las que la IA ya excluyó automáticamente
                const referencesForReview = references.filter(r => 
                  r.aiClassification === 'include' || 
                  r.aiClassification === 'review'
                )
                
                const reviewFilteredRefs = referencesForReview.filter((ref) => {
                  const matchesStatus = statusFilter === "all" || ref.status === statusFilter
                  const matchesSearch =
                    searchQuery === "" ||
                    ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ref.authors.some((author) => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    ref.abstract.toLowerCase().includes(searchQuery.toLowerCase())
                  return matchesStatus && matchesSearch
                })

                // Si no hay clasificación de IA O no se ha desbloqueado Fase 2, mostrar mensaje
                if (!hasAIClassification || !fase2Unlocked) {
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ClipboardCheck className="h-5 w-5 text-blue-600" />
                          Referencias para Revisión Manual
                        </CardTitle>
                        <CardDescription>
                          Revisa manualmente las referencias clasificadas por la IA para confirmar inclusiones
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            {!hasAIClassification ? 'No hay referencias clasificadas aún' : 'Fase 2 bloqueada'}
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-md mb-6">
                            {!hasAIClassification 
                              ? 'Primero debes completar la Fase 1: Clasificación IA para obtener referencias clasificadas que requieran revisión manual.'
                              : 'Debes hacer clic en el botón "Continuar a Fase 2" al final de la Fase 1 para desbloquear esta fase.'
                            }
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab('fase1')}
                          >
                            ← Volver a Fase 1
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }

                return (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-blue-600" />
                            Referencias para Revisión Manual
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Revisa las {referencesForReview.length} referencias que la IA recomendó <strong>incluir</strong> o que están en <strong>duda</strong>. Las excluidas automáticamente no requieren tu revisión.
                          </CardDescription>
                        </div>
                        {referencesForReview.length === 0 && (
                          <Badge variant="secondary" className="text-sm px-3 py-1">
                            Ejecuta el cribado en Fase 1
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {referencesForReview.length > 0 ? (
                        <>
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-sm text-green-700 mb-1">🤖 IA Recomendó: Incluir</p>
                              <p className="text-2xl font-bold text-green-900">
                                {referencesForReview.filter(r => r.aiClassification === 'include').length}
                              </p>
                              <p className="text-xs text-green-600 mt-1">Confirma o ajusta la decisión</p>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-sm text-yellow-700 mb-1">⚠️ IA Sugiere: Revisar</p>
                              <p className="text-2xl font-bold text-yellow-900">
                                {referencesForReview.filter(r => r.aiClassification === 'review').length}
                              </p>
                              <p className="text-xs text-yellow-600 mt-1">Requiere tu evaluación manual</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm text-blue-700 mb-1">🔵 Sin clasificar</p>
                              <p className="text-2xl font-bold text-blue-900">
                                {referencesForReview.filter(r => !r.aiClassification).length}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">Pendiente de análisis</p>
                            </div>
                          </div>

                          <ScreeningFilters
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            searchQuery={searchQuery}
                            onSearchQueryChange={setSearchQuery}
                            methodFilter={methodFilter}
                            onMethodFilterChange={setMethodFilter}
                          />
                          
                          <ReferenceTable
                            references={reviewFilteredRefs}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteReference}
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            showActions={false}
                          />

                          {referencesForReview.every(r => r.status !== 'pending') && (
                            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-dashed">
                              <div className="flex items-start gap-4">
                                <CheckCircle2 className="h-10 w-10 text-green-600 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg mb-2">✅ Revisión Manual Completada</h4>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Has revisado todas las referencias. Ahora puedes pasar a la Fase 3 para analizar el texto completo de los artículos incluidos.
                                  </p>
                                  <Button onClick={() => setActiveTab("fase3")} size="lg">
                                    Continuar a Fase 3: Análisis Texto Completo →
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No hay referencias para revisar</h3>
                          <p className="text-sm text-muted-foreground max-w-md mb-6">
                            Primero debes ejecutar el cribado automático en la <strong>Fase 1</strong> para que la IA clasifique tus referencias.
                          </p>
                          <Button onClick={() => setActiveTab("fase1")} variant="outline">
                            ← Volver a Fase 1
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })()}
            </TabsContent>

            {/* FASE 3: Análisis de Texto Completo */}
            <TabsContent value="fase3" className="space-y-6">
              {(() => {
                const includedReferences = references.filter(r => r.status === 'included')
                
                return (
                  <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="border-2 border-green-200 bg-green-50">
                        <CardHeader className="pb-3">
                          <CardDescription className="text-green-700">Artículos Incluidos</CardDescription>
                          <CardTitle className="text-3xl text-green-900">{includedReferences.length}</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Con PDF Cargado</CardDescription>
                          <CardTitle className="text-3xl">0</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Datos Extraídos</CardDescription>
                          <CardTitle className="text-3xl">0</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Revisión Completa</CardDescription>
                          <CardTitle className="text-3xl">0</CardTitle>
                        </CardHeader>
                      </Card>
                    </div>

                    {/* Main Card */}
                    {includedReferences.length > 0 ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileDown className="h-5 w-5 text-purple-600" />
                            Análisis de Texto Completo
                          </CardTitle>
                          <CardDescription>
                            Revisa y extrae datos de los {includedReferences.length} artículos incluidos después del cribado
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Sección: Próximos pasos */}
                          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8 border-2 border-dashed border-purple-200">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                              <FileDown className="h-6 w-6 text-purple-600" />
                              Flujo de Análisis de Texto Completo
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                  <FileDown className="h-6 w-6 text-purple-600" />
                                </div>
                                <h4 className="font-semibold mb-2">1. Carga de PDFs</h4>
                                <p className="text-sm text-muted-foreground">
                                  Sube los artículos completos de cada referencia incluida
                                </p>
                              </div>
                              <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                  <Brain className="h-6 w-6 text-blue-600" />
                                </div>
                                <h4 className="font-semibold mb-2">2. Análisis IA</h4>
                                <p className="text-sm text-muted-foreground">
                                  Extracción automática de datos relevantes del texto completo
                                </p>
                              </div>
                              <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <h4 className="font-semibold mb-2">3. Síntesis</h4>
                                <p className="text-sm text-muted-foreground">
                                  Genera la revisión sistemática con resultados extraídos
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Lista de referencias incluidas con carga de PDFs */}
                          <FullTextReview 
                            references={includedReferences}
                            projectId={params.id}
                            onReferencesChange={reloadReferences}
                          />
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileDown className="h-5 w-5 text-purple-600" />
                            Análisis de Texto Completo
                          </CardTitle>
                          <CardDescription>
                            Revisa y extrae datos de los artículos incluidos después del cribado
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No hay artículos incluidos aún</h3>
                            <p className="text-sm text-muted-foreground max-w-md mb-6">
                              Primero debes completar la <strong>Fase 2: Revisión Manual</strong> para confirmar los artículos que serán incluidos en tu revisión sistemática.
                            </p>
                            <Button onClick={() => setActiveTab("fase2")} variant="outline">
                              ← Volver a Fase 2
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )
              })()}
            </TabsContent>

            {/* PESTAÑA: Tabla de Exclusiones */}
            <TabsContent value="exclusiones" className="space-y-6">
              <ExclusionReasonsTable references={references} />
            </TabsContent>

            {/* PESTAÑA: Diagrama PRISMA */}
            <TabsContent value="prisma" className="space-y-6">
              {(() => {
                // Calcular estadísticas PRISMA desde las referencias reales
                const totalRefs = references.length
                const classifiedRefs = references.filter(r => r.aiClassification)
                const excludedByAI = references.filter(r => r.aiClassification === 'exclude')
                const excludedManual = references.filter(r => r.status === 'excluded' && r.aiClassification !== 'exclude')
                const includedRefs = references.filter(r => r.status === 'included')
                
                // Calcular referencias procesadas en Fase 1 (las que tienen clasificación de IA)
                const screenedInPhase1 = classifiedRefs.length
                const excludedInPhase1 = excludedByAI.length
                
                // Referencias que pasaron a Fase 2 (incluidas por IA o en revisión)
                const passedToPhase2 = references.filter(r => 
                  r.aiClassification === 'include' || r.aiClassification === 'review'
                ).length
                
                const prismaStats = {
                  identified: totalRefs,
                  duplicates: 0, // TODO: Implementar detección de duplicados
                  afterDedup: totalRefs,
                  screenedTitleAbstract: screenedInPhase1 > 0 ? screenedInPhase1 : totalRefs,
                  excludedTitleAbstract: excludedInPhase1,
                  fullTextAssessed: includedRefs.length,
                  excludedFullText: excludedManual.length,
                  includedFinal: includedRefs.length
                }

                return (
                  <div className="space-y-6">
                    <PrismaFlowDiagram stats={prismaStats} />
                    
                    {lastScreeningResult && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Detalles del Cribado Automático</CardTitle>
                          <CardDescription>
                            Resultados del análisis híbrido (Embeddings + ChatGPT)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <HybridScreeningStats result={lastScreeningResult} />
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )
              })()}
            </TabsContent>

          </Tabs>
        </div>
      </main>

      {/* Barra de acciones masivas - Solo en Fase 2 y Fase 3 */}
      {(activeTab === "fase2" || activeTab === "fase3") && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          onIncludeAll={handleBulkInclude}
          onExcludeAll={handleBulkExclude}
          onDeleteAll={handleBulkDelete}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

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
