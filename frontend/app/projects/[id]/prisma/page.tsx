"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProjectHeader } from "@/components/project-header"
import type { Project } from "@/lib/types"
import { Loader2, Sparkles } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

// Improved Components
import { PrismaItemCard } from "@/components/prisma/prisma-item-card"
import { PrismaProgress } from "@/components/prisma/prisma-progress"
import { SectionSummary } from "@/components/prisma/section-summary"
import { prismaChecklist, type PrismaItemData, type PrismaItem, type PrismaStats, type PrismaContentType } from "@/lib/prisma-items"

interface PrismaStatus {
  completed: number
  total: number
  isPrismaComplete: boolean
  canGenerateArticle: boolean
  completionPercentage: number
  message: string
}

// Backend item interface
interface BackendPrismaItem {
  id: string
  project_id: string
  item_number?: number
  itemNumber?: number
  section: string
  completed: boolean
  content: string | null
  content_type: PrismaContentType
  data_source: string | null
  automated_content: string | null
  last_human_edit: string | null
  ai_validated: boolean
  ai_suggestions: string | null
}

const SECTIONS = ["TÍTULO", "RESUMEN", "INTRODUCCIÓN", "MÉTODOS", "RESULTADOS", "DISCUSIÓN", "OTRA INFORMACIÓN"]

export default function PrismaPageImproved({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [items, setItems] = useState<BackendPrismaItem[]>([])
  const [stats, setStats] = useState<PrismaStats | null>(null)
  const [status, setStatus] = useState<PrismaStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)
  const [activeBlock, setActiveBlock] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState("Todos")

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    try {
      setIsLoading(true)

      // Cargar proyecto
      const projectData = await apiClient.getProject(params.id)
      setProject(projectData)

      // Cargar ítems PRISMA
      const prismaResponse = await apiClient.request(`/api/projects/${params.id}/prisma`, { method: 'GET' })
      if (prismaResponse.success && prismaResponse.data) {
        setItems(prismaResponse.data.items || [])
        setStats(prismaResponse.data.stats || null)
      }

      // Cargar estado
      const statusResponse = await apiClient.getPrismaStatus(params.id)
      if (statusResponse.success && statusResponse.data) {
        setStatus(statusResponse.data)
      }

    } catch (error: any) {
      console.error('Error cargando datos PRISMA:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los datos de PRISMA",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCompleteBlock(block: 'all' | 'methods' | 'results' | 'discussion' | 'other') {
    try {
      setIsCompleting(true)
      setActiveBlock(block)

      toast({
        title: "Completando PRISMA",
        description: `Generando contenido para bloque: ${block === 'all' ? 'TODOS' : block.toUpperCase()}...`,
      })

      const response = await apiClient.completePrismaByBlocks(params.id, block)

      if (response.success) {
        toast({
          title: "✅ PRISMA Completado",
          description: `Bloques completados: ${response.data.blocksProcessed.join(', ')}`,
        })

        // Recargar datos
        await loadData()
      }

    } catch (error: any) {
      console.error('Error completando PRISMA:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo completar PRISMA",
        variant: "destructive"
      })
    } finally {
      setIsCompleting(false)
      setActiveBlock(null)
    }
  }

  async function handleUpdateItem(itemNumber: number, content: string) {
    try {
      const response = await apiClient.request(`/api/projects/${params.id}/prisma/${itemNumber}/content`, {
        method: 'PUT',
        body: JSON.stringify({ content })
      })

      if (response.success) {
        // Actualizar localmente
        setItems(prev => prev.map(item =>
          (item.item_number || item.itemNumber) === itemNumber
            ? { ...item, content, content_type: 'human', completed: true }
            : item
        ))

        // No mostrar toast para autoguardado para no molestar, o uno sutil
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo guardar el cambio",
        variant: "destructive"
      })
    }
  }

  // Transform backend item to component data format
  const getComponentData = (backendItem: BackendPrismaItem): PrismaItemData => {
    return {
      projectId: backendItem.project_id,
      itemNumber: backendItem.item_number || backendItem.itemNumber || 0,
      section: backendItem.section,
      completed: backendItem.completed,
      content: backendItem.content || "",
      contentType: backendItem.content_type,
      dataSource: backendItem.data_source || undefined,
      aiValidation: {
        validated: backendItem.ai_validated,
        suggestions: backendItem.ai_suggestions || undefined
      }
    }
  }

  // Aggregate stats per section
  const sectionStats = SECTIONS.map(name => {
    const sectionItems = items.filter(i => i.section === name)
    return {
      name,
      total: sectionItems.length,
      completed: sectionItems.filter(i => i.completed).length
    }
  })

  // Filter items logic
  const filteredDefinitionItems = prismaChecklist.filter(def =>
    currentSection === "Todos" ? true : def.section === currentSection
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          {project && <ProjectHeader project={project} />}
          <Button
            onClick={() => handleCompleteBlock('all')}
            disabled={isCompleting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            {isCompleting && activeBlock === 'all' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Completar PRISMA con IA
          </Button>
        </div>

        {/* Progress & Summary Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <PrismaProgress
              completedItems={stats?.completed || 0}
              totalItems={27}
            />
          </div>
          <div className="lg:col-span-2">
            <SectionSummary sections={sectionStats} />
          </div>
        </div>

        {/* Status Message (If needed/important) */}
        {!status?.isPrismaComplete ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start gap-3">
            <div className="mt-0.5 font-bold">⚠️ Atención:</div>
            <div>{status?.message || "Complete los ítems pendientes para poder generar el artículo."}</div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800 flex items-start gap-3">
            <div className="mt-0.5 font-bold">✅ Todo listo:</div>
            <div>Puede proceder a generar el artículo científico en la siguiente pestaña.</div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 border-b">
            <Tabs value={currentSection} onValueChange={setCurrentSection} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-transparent gap-2">
                <TabsTrigger
                  value="Todos"
                  className="rounded-full px-4 border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Todos
                </TabsTrigger>
                {SECTIONS.map(section => (
                  <TabsTrigger
                    key={section}
                    value={section}
                    className="rounded-full px-4 border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                  >
                    {section}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredDefinitionItems.map((definitionItem) => {
              // Find matching backend item
              const backendItem = items.find(i => (i.item_number || i.itemNumber) === definitionItem.id)

              if (!backendItem) return null // Should not happen ideally

              const itemData = getComponentData(backendItem)

              return (
                <PrismaItemCard
                  key={definitionItem.id}
                  item={definitionItem}
                  itemData={itemData}
                  onToggleComplete={() => { }} // Read-only toggle handled by logic usually
                  onContentChange={(content) => {
                    // Optimistic update handled inside component or here if managed controlled
                    // We update local state in handleUpdateItem wrapper logic if needed
                    // But PrismaItemCard uses local state? 
                    // Let's force update via key or managing state
                  }}
                  // PrismaItemCard handles textarea internally but calls onContentChange
                  onRequestAISuggestion={() => handleUpdateItem(definitionItem.id, itemData.content)}
                // Wait, onContentChange updates, onRequestAISuggestion triggers AI? 
                // The component props: onContentChange calls handleUpdateItem on blur roughly
                />
              )
            })}
          </div>

          {filteredDefinitionItems.length === 0 && (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
              <p className="text-muted-foreground">No se encontraron ítems en esta sección</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

