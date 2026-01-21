"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProjectHeader } from "@/components/project-header"
import type { Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  FileText,
  CheckCheck,
  Lock,
  Unlock
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"

interface PrismaItem {
  id: string
  project_id: string
  item_number?: number
  itemNumber?: number
  section: string
  completed: boolean
  content: string | null
  content_type: 'automated' | 'human' | 'hybrid' | 'pending'
  data_source: string | null
  automated_content: string | null
  last_human_edit: string | null
  ai_validated: boolean
  ai_suggestions: string | null
}

interface PrismaStats {
  total: number
  completed: number
  pending: number
  automated: number
  human: number
  hybrid: number
  aiValidated: number
  completionPercentage: number
}

interface PrismaStatus {
  completed: number
  total: number
  isPrismaComplete: boolean
  canGenerateArticle: boolean
  completionPercentage: number
  message: string
}

const PRISMA_SECTIONS = {
  "TÍTULO": [1],
  "RESUMEN": [2],
  "INTRODUCCIÓN": [3, 4],
  "MÉTODOS": [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  "RESULTADOS": [16, 17, 18, 19, 20, 21, 22],
  "DISCUSIÓN": [23],
  "OTRA INFORMACIÓN": [24, 25, 26, 27]
}

const PRISMA_ITEM_NAMES: Record<number, string> = {
  1: "Título",
  2: "Resumen estructurado",
  3: "Justificación",
  4: "Objetivos",
  5: "Criterios de elegibilidad",
  6: "Fuentes de información",
  7: "Estrategia de búsqueda",
  8: "Proceso de selección",
  9: "Recolección de datos",
  10: "Lista de datos",
  11: "Riesgo de sesgo",
  12: "Medidas de efecto",
  13: "Métodos de síntesis",
  14: "Sesgo de reporte",
  15: "Evaluación de certeza",
  16: "Selección de estudios",
  17: "Características de estudios",
  18: "Riesgo de sesgo en estudios",
  19: "Resultados individuales",
  20: "Resultados de síntesis",
  21: "Sesgo de reporte (resultados)",
  22: "Certeza de evidencia",
  23: "Interpretación y discusión",
  24: "Registro y protocolo",
  25: "Financiamiento",
  26: "Conflictos de interés",
  27: "Disponibilidad de datos"
}

export default function PrismaPageImproved({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [items, setItems] = useState<PrismaItem[]>([])
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
        toast({
          title: "Guardado",
          description: `Ítem ${itemNumber} actualizado`
        })
        
        // Actualizar localmente
        setItems(prev => prev.map(item => 
          (item.item_number || item.itemNumber) === itemNumber 
            ? { ...item, content, content_type: 'human', completed: true }
            : item
        ))
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar",
        variant: "destructive"
      })
    }
  }

  const getItemsBySection = (section: string) => {
    if (section === "Todos") return items
    const itemNumbers = PRISMA_SECTIONS[section as keyof typeof PRISMA_SECTIONS] || []
    return items.filter(item => itemNumbers.includes(item.item_number || item.itemNumber))
  }

  const filteredItems = getItemsBySection(currentSection)

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

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        {project && <ProjectHeader project={project} />}

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lista de Verificación PRISMA 2020
                </CardTitle>
                <CardDescription>
                  Estado de cumplimiento de la guía de reporte
                </CardDescription>
              </div>
              {status?.isPrismaComplete && (
                <Badge className="bg-green-500">
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Completo
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progreso General</span>
                <span className="text-muted-foreground">
                  {stats?.completed || 0}/27 ítems ({stats?.completionPercentage || 0}%)
                </span>
              </div>
              <Progress value={stats?.completionPercentage || 0} className="h-3" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-xl font-bold text-green-600">{stats?.completed || 0}</div>
                <div className="text-sm text-muted-foreground">Completados</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{stats?.automated || 0}</div>
                <div className="text-sm text-muted-foreground">Automatizados</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{stats?.human || 0}</div>
                <div className="text-sm text-muted-foreground">Manuales</div>
              </div>
            </div>

            {/* Status Alert */}
            {status && (
              <Alert className={status.isPrismaComplete ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-yellow-500"}>
                {status.isPrismaComplete ? (
                  <Unlock className="h-4 w-4 text-green-600" />
                ) : (
                  <Lock className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription>
                  {status.message}
                  {status.canGenerateArticle && (
                    <span className="block mt-1 font-medium text-green-600">
                      ✅ Puede generar el artículo científico
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Ítems PRISMA</CardTitle>
            <CardDescription>Revise y edite cada ítem según sea necesario</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Section Filter */}
            <Tabs value={currentSection} onValueChange={setCurrentSection} className="mb-6">
              <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
                <TabsTrigger value="Todos">Todos</TabsTrigger>
                {Object.keys(PRISMA_SECTIONS).map(section => (
                  <TabsTrigger key={section} value={section}>
                    {section}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Items Accordion */}
            <Accordion type="single" collapsible className="w-full">
              {filteredItems.map((item) => (
                <AccordionItem key={item.id} value={`item-${item.item_number || item.itemNumber}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.section} - {PRISMA_ITEM_NAMES[item.item_number || item.itemNumber] || `Ítem ${item.item_number || item.itemNumber}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Ítem PRISMA #{item.item_number || item.itemNumber}
                        </div>
                      </div>
                      <Badge variant={item.completed ? "default" : "secondary"}>
                        {item.content_type === 'automated' && '🤖 IA'}
                        {item.content_type === 'human' && '👤 Manual'}
                        {item.content_type === 'hybrid' && '🔄 Híbrido'}
                        {item.content_type === 'pending' && '⏳ Pendiente'}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {item.data_source && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Fuente:</strong> {item.data_source}
                        </div>
                      )}
                      {!item.content && item.content_type === 'pending' && (
                        <div className="text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md mb-2">
                          ⏳ Este ítem aún no ha sido completado. Use el botón "Completar Todos" o escriba el contenido manualmente.
                        </div>
                      )}
                      <Textarea
                        value={item.content || ''}
                        onChange={(e) => {
                          const newContent = e.target.value
                          setItems(prev => prev.map(i => 
                            (i.item_number || i.itemNumber) === (item.item_number || item.itemNumber) 
                              ? { ...i, content: newContent }
                              : i
                          ))
                        }}
                        onBlur={() => {
                          if (item.content) {
                            handleUpdateItem(item.item_number || item.itemNumber, item.content)
                          }
                        }}
                        rows={8}
                        placeholder="Contenido del ítem PRISMA..."
                        className="font-serif"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay ítems en esta sección</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
