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
import { apiClient } from "@/lib/api-client"
import type { Reference } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDown, Loader2, AlertCircle, ClipboardCheck, ExternalLink, Database, Copy, Trash2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ScreeningPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [references, setReferences] = useState<Reference[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<"manual" | "rayyan">("manual")
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

  // Cargar referencias del proyecto y protocolo (search queries)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        // Cargar referencias
        const refData = await apiClient.getReferences(params.id)
        setReferences(refData.references || [])
        setStats(refData.stats || { total: 0, pending: 0, included: 0, excluded: 0 })

        // Cargar protocolo para obtener search queries y keyTerms
        try {
          const protocol = await apiClient.getProtocol(params.id)
          if (protocol?.searchPlan?.searchQueries) {
            setSearchQueries(protocol.searchPlan.searchQueries)
          }
          if (protocol?.keyTerms) {
            setKeyTerms(protocol.keyTerms)
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

  const handleStatusChange = async (id: string, status: Reference["status"]) => {
    try {
      await apiClient.updateReferenceStatus(id, { status })
      setReferences((prev) => prev.map((ref) => (ref.id === id ? { ...ref, status } : ref)))
      
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
        title: "Detectando duplicados...",
        description: "Analizando referencias para encontrar duplicados"
      })

      const result = await apiClient.detectDuplicates(params.id)
      setDuplicatesStats(result.stats)

      // Recargar referencias para reflejar los cambios
      const data = await apiClient.getReferences(params.id)
      setReferences(data.references || [])
      setStats(data.stats || { total: 0, pending: 0, included: 0, excluded: 0 })

      toast({
        title: "✅ Detección completada",
        description: `Se encontraron ${result.stats.duplicates} duplicados en ${result.stats.duplicateGroups} grupos`
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron detectar duplicados",
        variant: "destructive"
      })
    } finally {
      setIsDetectingDuplicates(false)
    }
  }

  const handleRunScreening = async (threshold: number, method: 'embeddings' | 'llm', llmProvider?: 'gemini' | 'chatgpt') => {
    try {
      const pending = references.filter(r => r.status === 'pending')
      if (pending.length === 0) {
        toast({ 
          title: "Sin referencias pendientes", 
          description: "Todas las referencias ya han sido evaluadas", 
          variant: "destructive" 
        })
        return
      }

      const methodName = method === 'embeddings' ? 'Embeddings' : (llmProvider === 'gemini' ? 'Gemini' : 'ChatGPT')
      toast({ 
        title: "Ejecutando cribado...", 
        description: `Analizando ${pending.length} referencias con ${methodName}` 
      })

      if (method === 'embeddings') {
        const result = await apiClient.runScreeningEmbeddings(params.id, { threshold })
        const updatedRefs = result.results.map(r => ({
          ...references.find(ref => ref.id === r.referenceId)!,
          status: r.decision as Reference["status"],
          score: r.similarity
        }))
        setReferences(prev => prev.map(ref => updatedRefs.find(u => u.id === ref.id) || ref))
        
        const toInclude = updatedRefs.filter(r => r.status === 'included').length
        const toExclude = updatedRefs.filter(r => r.status === 'excluded').length
        toast({ 
          title: "Cribado completado", 
          description: `${toInclude} incluidas, ${toExclude} excluidas con ${methodName}` 
        })
      } else {
        const result = await apiClient.runScreeningLLM(params.id, { llmProvider: llmProvider! })
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

  // Filter references
  const filteredReferences = references.filter((ref) => {
    const matchesStatus = statusFilter === "all" || ref.status === statusFilter
    const matchesSearch =
      searchQuery === "" ||
      ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.authors.some((author) => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ref.abstract.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
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

          {/* Tabs para diferentes modos de cribado */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "manual" | "rayyan")} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Cribado Manual
              </TabsTrigger>
              <TabsTrigger value="rayyan" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Revisión Individual
              </TabsTrigger>
            </TabsList>

            {/* Tab de Cribado Manual */}
            <TabsContent value="manual" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Referencias</CardTitle>
                      <CardDescription>
                        {filteredReferences.length} de {references.length} referencias
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ScreeningFilters
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        searchQuery={searchQuery}
                        onSearchQueryChange={setSearchQuery}
                      />
                      <ReferenceTable
                        references={filteredReferences}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteReference}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <AIScreeningPanel
                    totalReferences={stats.total}
                    pendingReferences={stats.pending}
                    onRunScreening={handleRunScreening}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab de Revisión Individual */}
            <TabsContent value="rayyan" className="space-y-6">
              <IndividualReview
                references={references}
                keyTerms={keyTerms}
                onStatusChange={handleStatusChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onIncludeAll={handleBulkInclude}
        onExcludeAll={handleBulkExclude}
        onDeleteAll={handleBulkDelete}
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  )
}
