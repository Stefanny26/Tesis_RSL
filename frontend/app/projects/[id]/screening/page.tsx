"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ReferenceTable } from "@/components/screening/reference-table"
import { AIScreeningPanel } from "@/components/screening/ai-screening-panel"
import { BulkActionsBar } from "@/components/screening/bulk-actions-bar"
import { ScreeningFilters } from "@/components/screening/screening-filters"
import { AcademicSearchDialog } from "@/components/screening/academic-search-dialog"
import { RayyanIntegration } from "@/components/screening/rayyan-integration"
import { apiClient } from "@/lib/api-client"
import type { Reference } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileDown, Loader2, AlertCircle, Database, ClipboardCheck, ExternalLink } from "lucide-react"
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
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"manual" | "rayyan">("manual")
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    included: 0,
    excluded: 0
  })

  // Cargar referencias del proyecto
  useEffect(() => {
    async function loadReferences() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiClient.getReferences(params.id)
        setReferences(data.references || [])
        setStats(data.stats || { total: 0, pending: 0, included: 0, excluded: 0 })
      } catch (err: any) {
        console.error("Error cargando referencias:", err)
        setError(err.message || "No se pudieron cargar las referencias")
      } finally {
        setIsLoading(false)
      }
    }
    loadReferences()
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

  const handleImportComplete = async () => {
    // Recargar referencias después de importar desde bases de datos académicas
    try {
      const data = await apiClient.getReferences(params.id)
      setReferences(data.references || [])
      setStats(data.stats || { total: 0, pending: 0, included: 0, excluded: 0 })
      toast({ 
        title: "Referencias importadas", 
        description: "Las nuevas referencias se han agregado al proyecto" 
      })
    } catch (error) {
      toast({ 
        title: "Error al recargar", 
        description: "Las referencias se importaron pero hubo un error al actualizar la vista", 
        variant: "destructive" 
      })
    }
  }

  const handleRunScreening = async (threshold: number) => {
    try {
      toast({ title: "Ejecutando cribado automático...", description: "Esto puede tomar unos momentos" })
      // TODO: Implementar endpoint de cribado automático con IA
      // const result = await apiClient.runAutoScreening(params.id, threshold)
      
      // Por ahora, mock implementation
      setReferences((prev) =>
        prev.map((ref) => {
          if (ref.status === "pending" && ref.screeningScore) {
            if (ref.screeningScore >= threshold) {
              return { ...ref, status: "included" as const }
            } else if (ref.screeningScore < 0.5) {
              return { ...ref, status: "excluded" as const }
            }
          }
          return ref
        }),
      )
      toast({ title: "Cribado completado", description: "Las referencias han sido clasificadas automáticamente" })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo ejecutar el cribado automático", variant: "destructive" })
    }
  }

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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cribado de Referencias</h1>
              <p className="text-muted-foreground">Revisa y clasifica referencias con asistencia de IA</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="default"
                onClick={() => setIsSearchDialogOpen(true)}
              >
                <Database className="mr-2 h-4 w-4" />
                Buscar en Bases de Datos
              </Button>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Incluidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.included}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Excluidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.excluded}</div>
              </CardContent>
            </Card>
          </div>

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

            {/* Tab de Integración Rayyan */}
            <TabsContent value="rayyan" className="space-y-6">
              <RayyanIntegration
                projectId={params.id}
                references={references}
                onSyncComplete={() => {
                  // Recargar referencias después de sincronizar con Rayyan
                  apiClient.getReferences(params.id).then((data) => {
                    setReferences(data.references || [])
                    setStats(data.stats || { total: 0, pending: 0, included: 0, excluded: 0 })
                  })
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onIncludeAll={handleBulkInclude}
        onExcludeAll={handleBulkExclude}
        onClearSelection={() => setSelectedIds([])}
      />

      <AcademicSearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        projectId={params.id}
        onImportComplete={handleImportComplete}
      />
    </div>
  )
}
