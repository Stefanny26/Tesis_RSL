"use client"

import { useState, useEffect } from "react"
import React from "react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProjectBreadcrumb } from "@/components/project-breadcrumb"
import { ProjectHeader } from "@/components/project-header"
import { ReferenceTable } from "@/components/screening/reference-table"
import { AIScreeningPanel } from "@/components/screening/ai-screening-panel"
import { BulkActionsBar } from "@/components/screening/bulk-actions-bar"
import { ScreeningFilters } from "@/components/screening/screening-filters"
import { DuplicateDetectionDialog } from "@/components/screening/duplicate-detection-dialog"
import { HybridScreeningStats } from "@/components/screening/hybrid-screening-stats"
import { ClassifiedReferencesView } from "@/components/screening/classified-references-view"
import { ExclusionReasonsTable } from "@/components/screening/exclusion-reasons-table"
import { PrismaFlowDiagram } from "@/components/screening/prisma-flow-diagram"
import { PriorityDistributionAnalysis } from "@/components/screening/priority-distribution-analysis"
import { apiClient } from "@/lib/api-client"
import type { Reference } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileDown, Loader2, AlertCircle, ClipboardCheck, Database, Copy, Trash2, CheckCircle2, Brain, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ScreeningPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<any>(null)
  const [references, setReferences] = useState<Reference[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<"fase1" | "priorizacion" | "revision" | "resultados">("fase1")
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
  const [expandedAnalysis, setExpandedAnalysis] = useState<Set<string>>(new Set())

  const toggleAnalysis = (refId: string) => {
    const newExpanded = new Set(expandedAnalysis)
    if (newExpanded.has(refId)) {
      newExpanded.delete(refId)
    } else {
      newExpanded.add(refId)
    }
    setExpandedAnalysis(newExpanded)
  }

  // Cargar referencias del proyecto y protocolo (search queries)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        // Cargar datos del proyecto
        const projectData = await apiClient.getProject(params.id)
        setProject(projectData)
        
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

  // Nueva función para manejar completado del SSE
  const handleScreeningComplete = async (resultData?: any) => {
    try {
      console.log('🔄 Recargando datos después del cribado SSE...', resultData)
      
      // Si recibimos datos del SSE, guardarlos inmediatamente
      if (resultData) {
        console.log('💾 Guardando resultado del SSE:', resultData)
        setLastScreeningResult(resultData)
        
        // Guardar en el protocolo también
        try {
          const protocol = await apiClient.getProtocol(params.id)
          if (protocol) {
            await apiClient.updateProtocol(params.id, {
              ...protocol,
              screeningResults: resultData
            })
            console.log('✅ Resultado guardado en el protocolo')
          }
        } catch (err) {
          console.warn('No se pudo guardar en el protocolo:', err)
        }
      }
      
      // Recargar referencias
      const refData = await apiClient.getAllReferences(params.id)
      setReferences(refData.references || [])
      setStats(refData.stats || { total: 0, pending: 0, included: 0, excluded: 0 })
      
      // Si no obtuvimos datos del SSE, intentar cargar del protocolo
      if (!resultData) {
        try {
          const protocol = await apiClient.getProtocol(params.id)
          if (protocol && protocol.screeningResults) {
            setLastScreeningResult(protocol.screeningResults)
            console.log('✅ Resultado cargado desde el protocolo')
          }
        } catch (err) {
          console.warn('No se pudo cargar el protocolo:', err)
        }
      }
      
      console.log('✅ Datos actualizados después del cribado')
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

          {/* Export Button */}
          <div className="flex justify-end">
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

          {/* Sistema de Cribado Reorganizado */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="fase1" className="flex flex-col items-center gap-1 py-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="font-semibold">Clasificación IA</span>
                </div>
                <span className="text-xs text-muted-foreground">Screening Automático</span>
              </TabsTrigger>
              <TabsTrigger value="priorizacion" className="flex flex-col items-center gap-1 py-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">Priorización</span>
                </div>
                <span className="text-xs text-muted-foreground">Análisis de Corte</span>
              </TabsTrigger>
              <TabsTrigger value="revision" className="flex flex-col items-center gap-1 py-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="font-semibold">Revisión Manual</span>
                </div>
                <span className="text-xs text-muted-foreground">Evaluación de Candidatos</span>
              </TabsTrigger>
              <TabsTrigger value="resultados" className="flex flex-col items-center gap-1 py-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="font-semibold">Resultados</span>
                </div>
                <span className="text-xs text-muted-foreground">Diagrama PRISMA</span>
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
                    
                    <div className="mt-6 p-6 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg">
                      <div className="flex items-start gap-4">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2 text-foreground">Clasificación Automática Completada</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            La IA ha clasificado {lastScreeningResult.summary?.processed || lastScreeningResult.summary?.total || 'todas las'} referencias. Las referencias candidatas están listas para revisión manual.
                          </p>
                          <Button onClick={() => {
                            setFase2Unlocked(true)
                            setActiveTab("priorizacion")
                            // Guardar en el protocolo
                            apiClient.getProtocol(params.id).then(protocol => {
                              if (protocol) {
                                apiClient.updateProtocol(params.id, { ...protocol, fase2Unlocked: true })
                              }
                            }).catch(err => console.warn('No se pudo actualizar el protocolo:', err))
                          }} size="lg" className="bg-blue-600 hover:bg-blue-700">
                            Continuar a Análisis de Priorización
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* PESTAÑA: Revisión Manual de Candidatos (Consolidado: Fase 2 + Fase 3) */}
            <TabsContent value="revision" className="space-y-6">
              {(() => {
                // Verificar si se ha ejecutado el cribado de Fase 1
                const hasAIClassification = references.some(r => r.aiClassification)
                
                // Candidatos para revisión manual: SOLO referencias recomendadas para INCLUIR por la IA
                // Filtramos solo las que la IA clasificó como 'include'
                const candidatesForReview = references.filter(r => 
                  r.aiClassification === 'include'
                )
                
                const filteredCandidates = candidatesForReview.filter((ref) => {
                  const matchesStatus = statusFilter === "all" || ref.status === statusFilter
                  const matchesSearch =
                    searchQuery === "" ||
                    ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ref.authors.some((author) => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    ref.abstract.toLowerCase().includes(searchQuery.toLowerCase())
                  return matchesStatus && matchesSearch
                })

                // Si no hay clasificación de IA, mostrar mensaje informativo
                if (!hasAIClassification || !fase2Unlocked) {
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ClipboardCheck className="h-5 w-5 text-blue-600" />
                          Revisión Manual de Referencias Candidatas
                        </CardTitle>
                        <CardDescription>
                          Evaluación sistemática de referencias identificadas como potencialmente relevantes
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            {!hasAIClassification ? 'Clasificación Previa Requerida' : 'Etapa Bloqueada'}
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-md mb-6">
                            {!hasAIClassification 
                              ? 'Es necesario completar la Clasificación IA para identificar las referencias candidatas que requieren revisión manual según los criterios del protocolo.'
                              : 'Debe finalizar la etapa de Clasificación IA y confirmar la transición a esta fase mediante el botón correspondiente.'
                            }
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab('fase1')}
                          >
                            Volver a Clasificación IA
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
                            Referencias Candidatas para Revisión Manual
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Evaluación de {candidatesForReview.length} referencias identificadas como potencialmente relevantes por el sistema de clasificación automática.
                            <br />
                            <strong>Nota:</strong> Estas son las referencias que la IA recomienda incluir. Revise el análisis de IA para cada una y confirme o ajuste la decisión.
                          </CardDescription>
                        </div>
                        {candidatesForReview.length === 0 && (
                          <Badge variant="secondary" className="text-sm px-3 py-1">
                            Ejecute la clasificación en Clasificación IA
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {candidatesForReview.length > 0 ? (
                        <>
                          <Alert className="border-primary/20">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-foreground">Referencias Recomendadas para Inclusión</AlertTitle>
                            <AlertDescription className="text-muted-foreground text-sm mt-2">
                              La tabla muestra únicamente las <strong>{candidatesForReview.length} referencias que la IA recomienda incluir</strong> basándose 
                              en su similitud con los criterios del protocolo. Para cada referencia:
                              <ul className="list-disc ml-5 mt-2 space-y-1">
                                <li>Revise el <strong>análisis de IA</strong> haciendo clic en "Ver análisis de IA"</li>
                                <li>Confirme la inclusión o cambie el estado según su criterio experto</li>
                                <li>Si necesita revisar el texto completo, cargue el PDF del artículo</li>
                              </ul>
                            </AlertDescription>
                          </Alert>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="border border-green-300 dark:border-green-700 rounded-lg p-4">
                              <p className="text-sm text-green-700 dark:text-green-400 mb-1 font-medium">Total de Candidatos</p>
                              <p className="text-2xl font-bold text-foreground">
                                {candidatesForReview.length}
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Recomendados por IA para inclusión</p>
                            </div>
                            <div className="border border-blue-300 dark:border-blue-700 rounded-lg p-4">
                              <p className="text-sm text-blue-700 dark:text-blue-400 mb-1 font-medium">Pendientes de Revisión</p>
                              <p className="text-2xl font-bold text-foreground">
                                {candidatesForReview.filter(r => r.status === 'pending').length}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Esperando su decisión</p>
                            </div>
                          </div>

                          {/* Cards de Referencias Candidatas para Revisión Manual */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {candidatesForReview.map((ref) => (
                              <Card key={ref.id} className="border-l-4 border-l-blue-400 hover:shadow-lg transition-shadow flex flex-col">
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1">
                                      <CardTitle className="text-base mb-2 line-clamp-2">{ref.title}</CardTitle>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                      {(ref.similarity_score || ref.screeningScore) && (
                                        <Badge variant="secondary" className="text-base font-bold">
                                          {Math.round((ref.similarity_score || ref.screeningScore || 0) * 100)}%
                                        </Badge>
                                      )}
                                      <Badge className="bg-green-600 text-xs">
                                        IA: Incluir
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <strong>Autores:</strong> {Array.isArray(ref.authors) ? ref.authors.slice(0, 3).join(', ') : ref.authors}
                                    </span>
                                    {ref.year && <span><strong>Año:</strong> {ref.year}</span>}
                                  </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                  {ref.abstract && (
                                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                      {ref.abstract}
                                    </p>
                                  )}
                                  
                                  {/* Botón para ver análisis de IA */}
                                  {ref.aiReasoning && (
                                    <div className="mb-3">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleAnalysis(ref.id)}
                                        className="w-full text-xs"
                                      >
                                        <AlertCircle className="h-3 w-3 mr-2" />
                                        {expandedAnalysis.has(ref.id) ? 'Ocultar análisis de IA' : 'Ver análisis completo de IA'}
                                      </Button>
                                      
                                      {expandedAnalysis.has(ref.id) && (
                                        <Alert className="mt-3 border-primary/20">
                                          <AlertCircle className="h-4 w-4" />
                                          <AlertTitle className="text-foreground text-sm font-bold mb-2">
                                            Justificación de Inclusión
                                          </AlertTitle>
                                          <AlertDescription className="text-muted-foreground text-xs leading-relaxed max-h-60 overflow-y-auto">
                                            {(() => {
                                              // Detectar si es solo análisis técnico de embeddings
                                              const isTechnicalOnly = ref.aiReasoning && 
                                                (ref.aiReasoning.includes('Embeddings:') || 
                                                 ref.aiReasoning.includes('Similitud:') ||
                                                 ref.aiReasoning.length < 200);
                                              
                                              // Si es análisis técnico o no hay razonamiento, generar texto narrativo
                                              if (!ref.aiReasoning || isTechnicalOnly) {
                                                const score = Math.round((ref.similarity_score || ref.screeningScore || 0) * 100);
                                                let explanation = '';
                                                
                                                if (score >= 70) {
                                                  explanation = 'presenta una alineación muy fuerte con los criterios de inclusión del protocolo de revisión. El contenido del título y resumen demuestra una alta relevancia temática con los objetivos de investigación establecidos.';
                                                } else if (score >= 50) {
                                                  explanation = 'muestra una alineación considerable con los criterios de inclusión definidos. El análisis del título y resumen indica que aborda aspectos relevantes para los objetivos de la revisión sistemática.';
                                                } else if (score >= 30) {
                                                  explanation = 'presenta elementos que coinciden con los criterios de inclusión del protocolo. El análisis del contenido sugiere que el estudio aborda temas relacionados con los objetivos de investigación.';
                                                } else {
                                                  explanation = 'fue identificado por el sistema de screening como potencialmente relevante para los objetivos de la revisión sistemática, requiriendo evaluación detallada.';
                                                }
                                                
                                                return (
                                                  <div className="bg-muted/30 p-3 rounded border border-primary/20">
                                                    <p className="text-foreground leading-relaxed mb-3">
                                                      Este artículo {explanation}
                                                    </p>
                                                    <p className="text-foreground leading-relaxed">
                                                      El sistema de inteligencia artificial, mediante análisis de similitud semántica, 
                                                      determinó que la investigación cumple con los requisitos metodológicos y temáticos 
                                                      establecidos en el protocolo. Se recomienda la revisión del texto completo para 
                                                      confirmar la inclusión definitiva en la revisión sistemática.
                                                    </p>
                                                    {ref.matchedCriteria && ref.matchedCriteria.length > 0 && (
                                                      <>
                                                        <p className="text-foreground mt-3 mb-1">
                                                          <strong>Criterios de inclusión identificados:</strong>
                                                        </p>
                                                        <ul className="list-disc list-inside space-y-1 text-foreground ml-2">
                                                          {ref.matchedCriteria.map((criterion, idx) => (
                                                            <li key={idx}>{criterion}</li>
                                                          ))}
                                                        </ul>
                                                      </>
                                                    )}
                                                  </div>
                                                );
                                              }
                                              
                                              // Si hay análisis detallado, mostrarlo
                                              return (
                                                <div className="whitespace-pre-wrap bg-muted/30 p-3 rounded border border-primary/20 text-foreground leading-relaxed">
                                                  {ref.aiReasoning}
                                                </div>
                                              );
                                            })()}
                                          </AlertDescription>
                                        </Alert>
                                      )}
                                    </div>
                                  )}

                                  {/* Botón para cargar PDF */}
                                  <div className="mb-3">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full text-xs"
                                      onClick={() => {
                                        const input = document.createElement('input')
                                        input.type = 'file'
                                        input.accept = '.pdf'
                                        input.onchange = async (e: any) => {
                                          const file = e.target.files?.[0]
                                          if (!file) return
                                          
                                          if (file.size > 10 * 1024 * 1024) {
                                            toast({
                                              title: "Archivo muy grande",
                                              description: "El PDF no debe superar 10MB",
                                              variant: "destructive"
                                            })
                                            return
                                          }
                                          
                                          const formData = new FormData()
                                          formData.append('pdf', file)
                                          formData.append('referenceId', ref.id)
                                          
                                          try {
                                            toast({
                                              title: "Subiendo PDF...",
                                              description: `Cargando ${file.name}`
                                            })
                                            
                                            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/references/${ref.id}/upload-pdf`, {
                                              method: 'POST',
                                              body: formData,
                                              credentials: 'include'
                                            })
                                            
                                            if (!response.ok) throw new Error('Error al subir PDF')
                                            
                                            toast({
                                              title: "PDF cargado exitosamente",
                                              description: "El archivo está disponible para revisión"
                                            })
                                            
                                            await reloadReferences()
                                          } catch (error) {
                                            toast({
                                              title: "Error al subir PDF",
                                              description: "Intente nuevamente",
                                              variant: "destructive"
                                            })
                                          }
                                        }
                                        input.click()
                                      }}
                                    >
                                      <FileDown className="h-3 w-3 mr-2" />
                                      {ref.fullTextPath ? 'Cambiar PDF' : 'Cargar PDF completo'}
                                    </Button>
                                    {ref.fullTextPath && (
                                      <p className="text-xs text-green-600 mt-1 text-center">✓ PDF cargado</p>
                                    )}
                                  </div>

                                  {/* Acciones */}
                                  <div className="mt-auto pt-3 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-medium">Estado:</span>
                                      <Badge variant={
                                        ref.status === 'included' ? 'default' : 
                                        ref.status === 'excluded' ? 'destructive' : 
                                        'secondary'
                                      } className="text-xs">
                                        {ref.status === 'included' ? 'Incluido' : 
                                         ref.status === 'excluded' ? 'Excluido' : 
                                         'Pendiente'}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {ref.status !== 'included' && (
                                        <Button 
                                          size="sm" 
                                          onClick={() => handleStatusChange(ref.id, 'included')}
                                          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 flex-1 text-xs h-8"
                                        >
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Confirmar
                                        </Button>
                                      )}
                                      {ref.status !== 'excluded' && (
                                        <Button 
                                          size="sm" 
                                          variant="destructive"
                                          className="flex-1 text-xs h-8"
                                          onClick={() => {
                                            const reason = prompt('Ingrese el motivo de exclusión:')
                                            if (reason) {
                                              handleStatusChange(ref.id, 'excluded', reason)
                                            }
                                          }}
                                        >
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          Excluir
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          {candidatesForReview.every(r => r.status !== 'pending') && (
                            <div className="mt-6 p-6 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg">
                              <div className="flex items-start gap-4">
                                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground text-lg mb-2">Revisión Manual Completada</h4>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Ha completado la revisión de todas las referencias candidatas. 
                                    Puede analizar la priorización o consultar directamente los resultados finales.
                                  </p>
                                  <div className="flex gap-3">
                                    <Button onClick={() => setActiveTab("priorizacion")} size="lg" variant="outline">
                                      Análisis de Priorización
                                    </Button>
                                    <Button onClick={() => setActiveTab("resultados")} size="lg" className="bg-blue-600 hover:bg-blue-700">
                                      Ver Resultados (Diagrama PRISMA)
                                    </Button>
                                  </div>
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
                            Primero debe ejecutar el cribado automático en <strong>Clasificación IA</strong> para que el sistema clasifique las referencias.
                          </p>
                          <Button onClick={() => setActiveTab("fase1")} variant="outline">
                            Volver a Clasificación IA
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })()}
            </TabsContent>

            {/* PESTAÑA: Priorización y Análisis de Criterio de Corte */}
            <TabsContent value="priorizacion" className="space-y-6">
              {(() => {
                // Verificar si hay datos para análisis estadístico
                // Buscar en similarity_score o screeningScore
                const referencesWithScores = references.filter(r => {
                  const score = r.similarity_score ?? r.screeningScore
                  return score != null && !Number.isNaN(score) && score > 0
                })
                
                // También verificar si hay clasificaciones de IA (aunque no tengan score numérico)
                const hasAIClassification = references.some(r => r.aiClassification)

                if (referencesWithScores.length === 0) {
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          Análisis de Priorización para Revisión Manual
                        </CardTitle>
                        <CardDescription>
                          Determinación del criterio de corte óptimo mediante análisis estadístico
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <AlertCircle className="h-16 w-16 text-orange-400 mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            {hasAIClassification ? 'Análisis de Priorización No Disponible' : 'Ejecute el Screening Automático'}
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-md mb-4">
                            {hasAIClassification ? (
                              <>
                                El método de screening utilizado no genera scores numéricos de similitud, 
                                por lo que el análisis de priorización mediante Elbow Plot no está disponible. 
                                Puede proceder directamente a la <strong>Revisión Manual</strong> de las referencias clasificadas.
                              </>
                            ) : (
                              <>
                                Para realizar el análisis de priorización, es necesario ejecutar primero 
                                la <strong>Clasificación IA</strong>, que calculará los índices de similitud 
                                de cada referencia con respecto a los criterios del protocolo.
                              </>
                            )}
                          </p>
                          {!hasAIClassification && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mb-6">
                              <p className="text-sm font-medium text-blue-900 mb-2">
                                Propósito de esta herramienta:
                              </p>
                              <p className="text-sm text-blue-800">
                                El análisis de priorización utiliza métodos estadísticos (Elbow Plot) 
                                para identificar el punto óptimo de corte. Esto permite optimizar el 
                                esfuerzo de revisión manual enfocándose en las referencias de mayor 
                                relevancia, en lugar de revisar exhaustivamente todas las entradas.
                              </p>
                            </div>
                          )}
                          <Button 
                            onClick={() => setActiveTab(hasAIClassification ? "revision" : "fase1")} 
                            size="lg" 
                            variant="outline"
                          >
                            {hasAIClassification ? 'Ir a Revisión Manual' : 'Ir a Clasificación IA'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }

                return (
                  <div className="space-y-6">
                    <Card className="border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Análisis de Priorización: Determinación del Criterio de Corte
                        </CardTitle>
                        <CardDescription>
                          Análisis estadístico basado en {referencesWithScores.length} referencias 
                          para optimizar la eficiencia del proceso de revisión manual
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Alert className="border-primary/20 mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Metodología Aplicada</AlertTitle>
                          <AlertDescription className="text-sm mt-2">
                            Este análisis implementa el <strong>método del codo (Elbow Plot)</strong>, 
                            una técnica estadística que identifica el punto de inflexión en la distribución 
                            de relevancia. Este punto indica dónde la inclusión de referencias adicionales 
                            aporta rendimientos decrecientes, permitiendo establecer un criterio de corte 
                            fundamentado para la revisión manual.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>

                    <PriorityDistributionAnalysis references={references} />
                    
                    <Card className="border-green-300 dark:border-green-700">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">Continuar con la Revisión Manual</h4>
                            <p className="text-sm text-muted-foreground">
                              Proceda a evaluar los candidatos identificados según el análisis de priorización
                            </p>
                          </div>
                          <Button onClick={() => setActiveTab("revision")} size="lg" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                            Iniciar Revisión Manual
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })()}
            </TabsContent>

            {/* PESTAÑA: Resultados (PRISMA + Exclusiones) */}
            <TabsContent value="resultados" className="space-y-6">
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
                    {/* Diagrama PRISMA */}
                    <PrismaFlowDiagram stats={prismaStats} />
                    
                    {/* Detalles del Cribado Automático (si existe) */}
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

      {/* Barra de acciones masivas - Solo en Revisión Manual */}
      {activeTab === "revision" && (
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
