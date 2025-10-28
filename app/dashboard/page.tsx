"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ProjectCard } from "@/components/dashboard/project-card"
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog"
import { mockProjects } from "@/lib/mock-data"
import { BookOpen, FileText, CheckCircle, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = {
    totalProjects: mockProjects.length,
    activeProjects: mockProjects.filter((p) => p.status === "in-progress" || p.status === "screening").length,
    completedProjects: mockProjects.filter((p) => p.status === "completed").length,
    totalReferences: mockProjects.reduce((acc, p) => acc + (p.references?.total || 0), 0),
  }

  const activeProjects = mockProjects.filter((p) => p.status !== "completed")
  const completedProjects = mockProjects.filter((p) => p.status === "completed")

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenido, {user?.name}</h1>
          <p className="text-muted-foreground">Gestiona tus revisiones sistemáticas de literatura con IA</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Proyectos Totales"
            value={stats.totalProjects}
            icon={BookOpen}
            description="Todos tus proyectos RSL"
          />
          <StatsCard
            title="Proyectos Activos"
            value={stats.activeProjects}
            icon={Clock}
            description="En progreso o cribado"
          />
          <StatsCard
            title="Proyectos Completados"
            value={stats.completedProjects}
            icon={CheckCircle}
            description="Finalizados exitosamente"
          />
          <StatsCard
            title="Referencias Totales"
            value={stats.totalReferences}
            icon={FileText}
            description="En todos los proyectos"
          />
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Mis Proyectos</h2>
            <CreateProjectDialog />
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Activos ({activeProjects.length})</TabsTrigger>
              <TabsTrigger value="completed">Completados ({completedProjects.length})</TabsTrigger>
              <TabsTrigger value="all">Todos ({mockProjects.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              {activeProjects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No tienes proyectos activos. Crea uno nuevo para comenzar.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {completedProjects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {completedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Aún no has completado ningún proyecto.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
