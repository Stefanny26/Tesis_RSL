"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  AlertCircle,
  FileText,
  CheckCheck,
  Lock,
  Unlock,
  ArrowRight
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
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
  1: "Título del estudio",
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
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [items, setItems] = useState<PrismaItem[]>([])
  const [stats, setStats] = useState<PrismaStats | null>(null)
  const [status, setStatus] = useState<PrismaStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)
  const [activeBlock, setActiveBlock] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState("TÍTULO")
  const [prismaLocked, setPrismaLocked] = useState(false)

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    try {
      setIsLoading(true)

      // Cargar proyecto
      const projectData = await apiClient.getProject(params.id)
      setProject(projectData)
      
      // Verificar si PRISMA está bloqueado
      if (projectData.protocol?.prisma_locked || projectData.protocol?.prismaLocked) {
        setPrismaLocked(true)
      }

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

  async function handleFinalizePrisma() {
    try {
      // Actualizar protocolo para bloquear PRISMA
      await apiClient.updateProtocol(params.id, { prismaLocked: true })
      
      setPrismaLocked(true)
      
      toast({
        title: "✅ PRISMA Finalizado",
        description: "La sección PRISMA ha sido bloqueada. Ya no se pueden realizar cambios.",
      })
      
      // Redirigir a la página de artículo después de 1 segundo
      setTimeout(() => {
        router.push(`/projects/${params.id}/article`)
      }, 1000)
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo finalizar PRISMA",
        variant: "destructive"
      })
    }
  }



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

      <main className="container mx-auto px-4 py-8 space-y-4">
        {/* Header */}
        {project && <ProjectHeader project={project} />}

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-1">
                  <FileText className="h-5 w-5" />
                  Lista de Verificación PRISMA 2020
                </CardTitle>
                <CardDescription>
                  Estado de cumplimiento de la guía de reporte
                </CardDescription>
              </div>
              {status?.isPrismaComplete && !prismaLocked && (
                <Badge className="bg-green-500">
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Completo
                </Badge>
              )}
              {prismaLocked && (
                <Badge className="bg-blue-500">
                  <Lock className="h-4 w-4 mr-1" />
                  Finalizado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Progress bar */}


            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div>
                <div className="text-sm text-muted-foreground">Completados</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats?.automated || 0}</div>
                <div className="text-sm text-muted-foreground">Automatizados</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats?.human || 0}</div>
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

        {/* New Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
          {/* Sidebar Index */}
          <div className="w-full">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Índice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {Object.keys(PRISMA_SECTIONS).map((section) => {
                  const sectionItems = PRISMA_SECTIONS[section as keyof typeof PRISMA_SECTIONS] || []
                  const completed = items.filter(item =>
                    sectionItems.includes(item.item_number || item.itemNumber) && item.completed
                  ).length
                  const total = sectionItems.length

                  return (
                    <Button
                      key={section}
                      variant={currentSection === section ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-between text-left font-normal"
                      onClick={() => {
                        setCurrentSection(section)
                        const element = document.getElementById(`section-${section}`)
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" })
                        }
                      }}
                    >
                      <span className="truncate">{section}</span>
                      <span className="text-xs ml-2 flex-shrink-0">
                        {completed}/{total}
                      </span>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="w-full">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-8">
                  {Object.entries(PRISMA_SECTIONS).map(([sectionName, itemNumbers]) => {
                    const sectionItems = items.filter(item =>
                      itemNumbers.includes(item.item_number || item.itemNumber)
                    ).sort((a, b) => (a.item_number || a.itemNumber) - (b.item_number || b.itemNumber))

                    return (
                      <div
                        key={sectionName}
                        id={`section-${sectionName}`}
                        className="scroll-mt-6 space-y-4 pb-6 border-b last:border-0 last:pb-0"
                      >
                        {/* Section Header */}
                        <div className="space-y-2">
                          <h2 className="text-xl font-bold text-primary">
                            {sectionName}
                          </h2>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(sectionItems.filter(i => i.completed).length / sectionItems.length) * 100}
                              className="h-2 flex-1"
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {sectionItems.filter(i => i.completed).length}/{sectionItems.length}
                            </span>
                          </div>
                        </div>

                        {/* Section Items */}
                        <div className="space-y-4">{sectionItems.map((item) => (
                          <div
                            key={item.id}
                            id={`item-${item.item_number || item.itemNumber}`}
                            className="space-y-1"
                          >
                            {/* Item Header */}
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {item.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-base">
                                    {PRISMA_ITEM_NAMES[item.item_number || item.itemNumber] || `Ítem ${item.item_number || item.itemNumber}`}
                                  </h3>
                                  <Badge variant="outline" className="text-xs h-5">
                                    #{item.item_number || item.itemNumber}
                                  </Badge>
                                  <Badge variant={item.completed ? "default" : "secondary"} className="text-xs h-5">
                                    {item.content_type === 'automated' && '🤖 IA'}
                                    {item.content_type === 'human' && '✍️ Manual'}
                                    {item.content_type === 'hybrid' && '🔄 Híbrido'}
                                    {item.content_type === 'pending' && '⏳ Pendiente'}
                                  </Badge>
                                </div>
                                {item.data_source && (
                                  <p className="text-xs text-muted-foreground">
                                    <strong>Fuente:</strong> {item.data_source}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Item Content */}
                            <div className="ml-8">
                              {!item.content && item.content_type === 'pending' && !prismaLocked && (
                                <Alert className="mb-2">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription className="text-xs">
                                    Este ítem aún no ha sido completado. Escriba el contenido manualmente o genere con IA.
                                  </AlertDescription>
                                </Alert>
                              )}
                              {prismaLocked && (
                                <Alert className="mb-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
                                  <Lock className="h-4 w-4 text-blue-600" />
                                  <AlertDescription className="text-xs text-blue-900 dark:text-blue-100">
                                    PRISMA finalizado. No se pueden realizar cambios.
                                  </AlertDescription>
                                </Alert>
                              )}
                              <Textarea
                                value={item.content || ''}
                                onChange={(e) => {
                                  if (prismaLocked) return
                                  const newContent = e.target.value
                                  setItems(prev => prev.map(i =>
                                    (i.item_number || i.itemNumber) === (item.item_number || item.itemNumber)
                                      ? { ...i, content: newContent }
                                      : i
                                  ))
                                }}
                                onBlur={() => {
                                  if (prismaLocked) return
                                  if (item.content) {
                                    handleUpdateItem(item.item_number || item.itemNumber, item.content)
                                  }
                                }}
                                disabled={prismaLocked}
                                rows={5}
                                placeholder={prismaLocked ? "Contenido bloqueado" : `Contenido del ítem ${PRISMA_ITEM_NAMES[item.item_number || item.itemNumber]}...`}
                                className="font-serif text-sm leading-relaxed min-h-[100px] resize-y"
                              />
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs text-muted-foreground">
                                  {(item.content || '').split(/\s+/).filter(w => w.length > 0).length} palabras
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Botón de finalización cuando PRISMA está completo */}
        {status?.isPrismaComplete && !prismaLocked && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">PRISMA Finalizado</h3>
                <p className="text-xs text-muted-foreground">
                  Has completado todos los ítems de la lista de verificación PRISMA 2020. Ahora puedes generar el artículo científico completo.
                </p>
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white h-9"
                  onClick={handleFinalizePrisma}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Finalizar y Continuar a Artículo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
