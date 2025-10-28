"use client"

import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Calendar,
  CheckCircle,
  Settings,
  BookOpen,
  Filter,
  ClipboardCheck,
  FileEdit,
  FileDown,
} from "lucide-react"
import Link from "next/link"
import { mockProjects } from "@/lib/mock-data"

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = mockProjects.find((p) => p.id === params.id) || mockProjects[0]

  const screeningProgress = project.references ? (project.references.screened / project.references.total) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                <p className="text-muted-foreground max-w-3xl">{project.description}</p>
              </div>
              <Badge variant={project.status === "completed" ? "outline" : "default"}>
                {project.status === "draft"
                  ? "Borrador"
                  : project.status === "in-progress"
                    ? "En Progreso"
                    : project.status === "screening"
                      ? "Cribado"
                      : project.status === "analysis"
                        ? "Análisis"
                        : "Completado"}
              </Badge>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{project.collaborators.length + 1} colaboradores</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Actualizado {project.updatedAt.toLocaleDateString("es-ES")}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-5 gap-4">
            <Button asChild className="h-auto py-4 flex-col gap-2">
              <Link href={`/projects/${params.id}/protocol`}>
                <Settings className="h-5 w-5" />
                <span>Protocolo</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <Link href={`/projects/${params.id}/screening`}>
                <Filter className="h-5 w-5" />
                <span>Cribado</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <Link href={`/projects/${params.id}/prisma`}>
                <ClipboardCheck className="h-5 w-5" />
                <span>PRISMA</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <Link href={`/projects/${params.id}/article`}>
                <FileEdit className="h-5 w-5" />
                <span>Artículo</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <Link href={`/projects/${params.id}/export`}>
                <FileDown className="h-5 w-5" />
                <span>Exportar</span>
              </Link>
            </Button>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="protocol">Protocolo</TabsTrigger>
              <TabsTrigger value="team">Equipo</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Progress Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Referencias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{project.references?.total || 0}</div>
                      <Progress value={screeningProgress} />
                      <p className="text-xs text-muted-foreground">
                        {project.references?.screened || 0} cribadas de {project.references?.total || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Cumplimiento PRISMA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{project.prismaCompliance || 0}%</div>
                      <Progress value={project.prismaCompliance || 0} />
                      <p className="text-xs text-muted-foreground">
                        {Math.round(((project.prismaCompliance || 0) / 100) * 27)} de 27 ítems
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Estado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-lg font-semibold">
                          {project.status === "in-progress" ? "En Progreso" : "Activo"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Última actualización: {project.updatedAt.toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Protocol Summary */}
              {project.protocol && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Resumen del Protocolo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.protocol.picoFramework && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Población</p>
                          <p className="text-sm text-muted-foreground">{project.protocol.picoFramework.population}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Intervención</p>
                          <p className="text-sm text-muted-foreground">{project.protocol.picoFramework.intervention}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Comparación</p>
                          <p className="text-sm text-muted-foreground">{project.protocol.picoFramework.comparison}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Resultado</p>
                          <p className="text-sm text-muted-foreground">{project.protocol.picoFramework.outcome}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="protocol" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Protocolo de Investigación</CardTitle>
                  <CardDescription>Detalles completos del protocolo de revisión sistemática</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href={`/projects/${params.id}/protocol`}>Ver Protocolo Completo</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Equipo del Proyecto</CardTitle>
                  <CardDescription>Colaboradores y roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{project.ownerName}</p>
                        <p className="text-sm text-muted-foreground">Investigador Principal</p>
                      </div>
                      <Badge>Propietario</Badge>
                    </div>
                    {project.collaborators.map((collaborator, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{collaborator}</p>
                          <p className="text-sm text-muted-foreground">Colaborador</p>
                        </div>
                        <Badge variant="outline">Revisor</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
