"use client"

import { useEffect, useState } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, CheckCircle, Settings, BookOpen, Filter, ClipboardCheck, FileEdit, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import type { Project } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [referenceStats, setReferenceStats] = useState({
    total: 0,
    pending: 0,
    included: 0,
    excluded: 0,
    maybe: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    async function loadProject() {
      try {
        setIsLoading(true)
        const data = await apiClient.getProject(params.id)
        setProject(data)
        
        // Load reference statistics
        try {
          const referencesData = await apiClient.getReferences(params.id)
          if (referencesData.stats) {
            setReferenceStats(referencesData.stats)
          }
        } catch (refErr) {
          console.error("Error cargando estadísticas de referencias:", refErr)
          // Don't show error toast for references, just keep default stats
        }
      } catch (err: any) {
        console.error("Error cargando proyecto:", err)
        setError(err.message || "Error al cargar el proyecto")
        toast({
          title: "Error",
          description: "No se pudo cargar el proyecto",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [params.id, toast])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Cargando proyecto...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold mb-2">Error al cargar el proyecto</h2>
            <p className="text-muted-foreground mb-4">{error || "Proyecto no encontrado"}</p>
            <Button asChild>
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const screeningProgress = project.references ? (project.references.screened / project.references.total) * 100 : 0
  const createdDate = new Date(project.createdAt)
  const updatedDate = new Date(project.updatedAt)

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
                <span>{(project.members?.length || 0) + 1} colaboradores</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Actualizado {updatedDate.toLocaleDateString("es-ES")}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-4 gap-4">
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
                      <div className="text-2xl font-bold">{referenceStats.total}</div>
                      <Progress value={referenceStats.total > 0 
                        ? ((referenceStats.included + referenceStats.excluded) / referenceStats.total) * 100 
                        : 0} />
                      <p className="text-xs text-muted-foreground">
                        {referenceStats.included + referenceStats.excluded} cribadas de {referenceStats.total}
                      </p>
                      <div className="flex gap-2 text-xs pt-1">
                        <span className="text-green-600">✓ {referenceStats.included} incluidas</span>
                        <span className="text-red-600">✗ {referenceStats.excluded} excluidas</span>
                      </div>
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
                          {project.status === "draft"
                            ? "Borrador"
                            : project.status === "in-progress"
                              ? "En Progreso"
                              : project.status === "screening"
                                ? "Cribado"
                                : project.status === "analysis"
                                  ? "Análisis"
                                  : "Completado"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Última actualización: {updatedDate.toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Protocol Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Resumen del Protocolo
                  </CardTitle>
                  <CardDescription>
                    Información generada por IA y completada manualmente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Título Propuesto por IA */}
                  {project.protocol?.proposedTitle && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-blue-900">✨ Título Refinado (IA)</p>
                        <Badge className="bg-blue-600">Completado</Badge>
                      </div>
                      <p className="text-base text-blue-800 font-semibold">{project.protocol.proposedTitle}</p>
                    </div>
                  )}

                  {/* Evaluación Inicial */}
                  {project.protocol?.evaluationInitial && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-green-900">🔍 Evaluación de Viabilidad</p>
                        <Badge className="bg-green-600">Completado</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="text-center p-2 bg-white rounded">
                          <p className="text-xs text-gray-600">Tema Claro</p>
                          <p className="text-lg font-bold text-green-700">
                            {project.protocol.evaluationInitial.themeClear === 'si' ? '✅' : '⚠️'}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <p className="text-xs text-gray-600">Delimitación</p>
                          <p className="text-lg font-bold text-green-700">
                            {project.protocol.evaluationInitial.delimitation === 'si' ? '✅' : '⚠️'}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <p className="text-xs text-gray-600">Viabilidad</p>
                          <p className="text-lg font-bold text-green-700">
                            {project.protocol.evaluationInitial.viability === 'si' ? '✅' : '⚠️'}
                          </p>
                        </div>
                      </div>
                      {project.protocol.evaluationInitial.comment && (
                        <p className="text-sm text-green-800 italic">{project.protocol.evaluationInitial.comment}</p>
                      )}
                    </div>
                  )}

                  {/* Marco PICO */}
                  {project.protocol?.picoFramework && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-purple-900">📊 Marco PICO</p>
                        <Badge className="bg-purple-600">
                          {project.protocol.picoFramework.population && 
                           project.protocol.picoFramework.intervention && 
                           project.protocol.picoFramework.outcomes ? 'Completado' : 'Incompleto'}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-1">👥 Población</p>
                          <p className="text-sm text-gray-700">
                            {project.protocol.picoFramework.population || <span className="text-gray-400 italic">No especificado</span>}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-1">🎯 Intervención</p>
                          <p className="text-sm text-gray-700">
                            {project.protocol.picoFramework.intervention || <span className="text-gray-400 italic">No especificado</span>}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-1">⚖️ Comparación</p>
                          <p className="text-sm text-gray-700">
                            {project.protocol.picoFramework.comparison || <span className="text-gray-400 italic">No especificado</span>}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-1">📈 Resultado</p>
                          <p className="text-sm text-gray-700">
                            {project.protocol.picoFramework.outcomes || <span className="text-gray-400 italic">No especificado</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Términos Clave */}
                  {project.protocol?.keyTerms && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-amber-900">🔑 Términos Clave</p>
                        <Badge className="bg-amber-600">
                          {(project.protocol.keyTerms.technology?.length || 0) + 
                           (project.protocol.keyTerms.domain?.length || 0) > 0 ? 'Completado' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {project.protocol.keyTerms.technology && project.protocol.keyTerms.technology.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-amber-700 mb-2">Tecnología:</p>
                            <div className="flex flex-wrap gap-2">
                              {project.protocol.keyTerms.technology.map((term, i) => (
                                <Badge key={i} variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">{term}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {project.protocol.keyTerms.domain && project.protocol.keyTerms.domain.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-amber-700 mb-2">Dominio:</p>
                            <div className="flex flex-wrap gap-2">
                              {project.protocol.keyTerms.domain.map((term, i) => (
                                <Badge key={i} variant="outline" className="bg-green-100 text-green-800 border-green-300">{term}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {project.protocol.keyTerms.themes && project.protocol.keyTerms.themes.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-amber-700 mb-2">Temas:</p>
                            <div className="flex flex-wrap gap-2">
                              {project.protocol.keyTerms.themes.map((term, i) => (
                                <Badge key={i} variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">{term}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Criterios de Inclusión/Exclusión */}
                  {(project.protocol?.inclusionCriteria?.length > 0 || project.protocol?.exclusionCriteria?.length > 0) && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-slate-900">📋 Criterios</p>
                        <Badge className="bg-slate-600">
                          {project.protocol.inclusionCriteria?.length > 0 && 
                           project.protocol.exclusionCriteria?.length > 0 ? 'Completado' : 'Parcial'}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {project.protocol.inclusionCriteria && project.protocol.inclusionCriteria.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-green-700 mb-2">✅ Inclusión:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {project.protocol.inclusionCriteria.map((criteria, i) => (
                                <li key={i} className="text-sm text-gray-700">{criteria}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {project.protocol.exclusionCriteria && project.protocol.exclusionCriteria.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-700 mb-2">❌ Exclusión:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {project.protocol.exclusionCriteria.map((criteria, i) => (
                                <li key={i} className="text-sm text-gray-700">{criteria}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Estrategia de Búsqueda */}
                  {project.protocol?.searchStrategy && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-indigo-900">🔎 Estrategia de Búsqueda</p>
                        <Badge className="bg-indigo-600">
                          {project.protocol.searchStrategy.databases?.length > 0 ? 'Completado' : 'Pendiente'}
                        </Badge>
                      </div>
                      {project.protocol.searchStrategy.databases && project.protocol.searchStrategy.databases.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-indigo-700 mb-2">Bases de datos:</p>
                          <div className="flex flex-wrap gap-2">
                            {project.protocol.searchStrategy.databases.map((db, i) => (
                              <Badge key={i} variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">{db}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {project.protocol.searchStrategy.searchString && (
                        <div>
                          <p className="text-xs font-semibold text-indigo-700 mb-2">Cadena de búsqueda:</p>
                          <code className="text-xs bg-white p-2 rounded block overflow-x-auto text-gray-800">
                            {project.protocol.searchStrategy.searchString}
                          </code>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Si no hay ningún dato del protocolo */}
                  {!project.protocol?.proposedTitle && 
                   !project.protocol?.picoFramework && 
                   !project.protocol?.keyTerms && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium mb-1">Protocolo no generado</p>
                      <p className="text-sm">Haz clic en "Ver Protocolo Completo" para generar el análisis con IA</p>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                    {/* Propietario del proyecto */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{project.ownerName || "Propietario"}</p>
                        <p className="text-sm text-muted-foreground">Investigador Principal</p>
                      </div>
                      <Badge>Propietario</Badge>
                    </div>
                    
                    {/* Miembros del equipo */}
                    {project.members && project.members.length > 0 ? (
                      project.members.map((member, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{member.userEmail || member.userName || `Colaborador ${i + 1}`}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.role === "owner" ? "Propietario" :
                               member.role === "editor" ? "Editor" :
                               member.role === "reviewer" ? "Revisor" : "Colaborador"}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {member.role === "owner" ? "Propietario" :
                             member.role === "editor" ? "Editor" :
                             member.role === "reviewer" ? "Revisor" : "Investigador"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay colaboradores agregados aún
                      </p>
                    )}
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
