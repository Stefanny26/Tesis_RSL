"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ProjectCard } from "@/components/dashboard/project-card"
import { apiClient } from "@/lib/api-client"
import type { Project } from "@/lib/types"
import { BookOpen, FileText, CheckCircle, Clock, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getEffectiveProjectStatus, countActiveProjects, getScreeningProjects } from "@/lib/project-status-utils"

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Protección de ruta: redirigir si no hay usuario
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [user, authLoading, router])

  // Cargar proyectos del usuario
  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await apiClient.getProjects()
        // apiClient.getProjects() ya devuelve { projects: [], pagination: {} }
        const projectsList = response.projects || []
        
        // Cargar estadísticas de referencias para cada proyecto
        const projectsWithStats = await Promise.all(
          projectsList.map(async (project) => {
            try {
              const referencesData = await apiClient.getReferences(project.id)
              return {
                ...project,
                references: referencesData.stats ? {
                  total: referencesData.stats.total || 0,
                  screened: (referencesData.stats.included || 0) + (referencesData.stats.excluded || 0),
                  included: referencesData.stats.included || 0,
                  excluded: referencesData.stats.excluded || 0
                } : { total: 0, screened: 0, included: 0, excluded: 0 }
              }
            } catch (error) {
              // Si falla la carga de referencias, devolver el proyecto sin stats
              return {
                ...project,
                references: { total: 0, screened: 0, included: 0, excluded: 0 }
              }
            }
          })
        )
        
        setProjects(projectsWithStats)
      } catch (error: any) {
        console.error('Error cargando proyectos:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los proyectos",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadProjects()
    }
  }, [user, toast])

  // Mostrar loading mientras se verifica autenticación
  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // Calcular estadísticas con detección automática de estado
  const stats = {
    totalProjects: projects.length,
    activeProjects: countActiveProjects(projects),
    // PRISMA compliant: por ahora 0, TODO: agregar endpoint para obtener este dato
    prismaCompliantProjects: 0,
    totalReferences: projects.reduce((acc, p) => acc + (p.references?.total || 0), 0),
  }

  // Proyectos en screening: solo los que están en fase de cribado
  const screeningProjects = getScreeningProjects(projects)
  
  // Proyectos activos: cualquiera que no esté completado (incluye drafts con contenido)
  const activeProjects = projects.filter((p) => {
    const effectiveStatus = getEffectiveProjectStatus(p);
    return effectiveStatus !== "completed";
  })
  const completedProjects = projects.filter((p) => getEffectiveProjectStatus(p) === "completed")

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Bienvenido, {user?.fullName || 'Usuario'}
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus Revisiones Sistemáticas con validación PRISMA 2020 y asistencia de IA
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total de Proyectos RSL"
            value={stats.totalProjects}
            icon={BookOpen}
            description="Revisiones sistemáticas"
          />
          <StatsCard
            title="Proyectos Activos"
            value={stats.activeProjects}
            icon={Clock}
            description="En progreso o cribado"
          />
          <StatsCard
            title="Validaciones PRISMA"
            value={stats.prismaCompliantProjects}
            icon={CheckCircle}
            description="Proyectos con 100% de cumplimiento PRISMA 2020"
          />
          <StatsCard
            title="Referencias Totales"
            value={stats.totalReferences}
            icon={FileText}
            description="Artículos en todos los proyectos"
          />
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Mis Proyectos</h2>
            <button
              onClick={() => router.push('/new-project')}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              + Nuevo Proyecto
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Cargando proyectos...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes proyectos aún</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer proyecto de revisión sistemática
              </p>
              <button
                onClick={() => router.push('/new-project')}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                + Crear Proyecto
              </button>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">
                  Todos ({projects.length})
                </TabsTrigger>
                <TabsTrigger value="screening">
                  Cribado ({screeningProjects.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completados ({completedProjects.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="screening" className="mt-6">
                {screeningProjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay proyectos en cribado
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {screeningProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {completedProjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay proyectos completados
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {completedProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}
