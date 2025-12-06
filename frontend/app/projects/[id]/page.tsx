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
  const [protocolStats, setProtocolStats] = useState({
    criteriaCount: 0,
    definitionsCount: 0,
    databasesCount: 0
  })
  const [screeningStats, setScreeningStats] = useState({
    total: 0,
    pending: 0,
    included: 0,
    excluded: 0,
    screened: 0,
    duplicates: 0
  })
  const [prismaStats, setPrismaStats] = useState({
    completed: 0,
    total: 27
  })
  const { toast } = useToast()

  useEffect(() => {
    async function loadProject() {
      try {
        setIsLoading(true)
        const data = await apiClient.getProject(params.id)
        setProject(data)
        
        // Load protocol statistics
        try {
          const protocol = await apiClient.getProtocol(params.id)
          if (protocol) {
            const criteriaCount = (protocol.inclusionCriteria?.length || 0) + (protocol.exclusionCriteria?.length || 0)
            const definitionsCount = (protocol.keyTerms?.technology?.length || 0) + 
                                     (protocol.keyTerms?.domain?.length || 0) + 
                                     (protocol.keyTerms?.studyType?.length || 0) + 
                                     (protocol.keyTerms?.themes?.length || 0)
            const databasesCount = protocol.databases?.length || 0
            
            setProtocolStats({
              criteriaCount,
              definitionsCount,
              databasesCount
            })
          }
        } catch (protocolErr) {
          console.error("Error cargando estadísticas del protocolo:", protocolErr)
        }

        // Load screening statistics
        try {
          const screeningData = await apiClient.getScreeningStats(params.id)
          if (screeningData) {
            setScreeningStats({
              total: screeningData.total || 0,
              pending: screeningData.pending || 0,
              included: screeningData.included || 0,
              excluded: screeningData.excluded || 0,
              screened: screeningData.aiReviewed || 0,
              duplicates: screeningData.duplicates || 0
            })
          }
        } catch (screeningErr) {
          console.error("Error cargando estadísticas de screening:", screeningErr)
        }

        // PRISMA stats - por ahora usamos valores por defecto
        // TODO: Crear endpoint /api/prisma/:projectId/items
        setPrismaStats({
          completed: 0,
          total: 27
        })
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

  const protocolProgress = (protocolStats.criteriaCount > 0 && protocolStats.databasesCount > 0) ? 100 : 50
  const createdDate = new Date(project.createdAt)
  const updatedDate = new Date(project.updatedAt)
  
  // Calcular cumplimiento PRISMA desde prisma_items
  const prismaCompliance = prismaStats.total > 0
    ? Math.round((prismaStats.completed / prismaStats.total) * 100)
    : 0
  const prismaItemsCompleted = prismaStats.completed
  const prismaTotalItems = prismaStats.total
  
  // Calcular progreso de screening acumulativo por fases (5 fases = 20% cada una)
  // Fase 1: Clasificación automática (20%) - completa cuando todas tienen aiClassification
  // Fase 2: Revisión manual (20%) - completa cuando todas están classified (included/excluded)
  // Fase 3: Texto completo (20%) - completa cuando included tienen PDFs cargados
  // Fase 4: Exclusiones (20%) - completa cuando excluded tienen motivos
  // Fase 5: PRISMA (20%) - completa cuando diagrama está completo
  let screeningProgress = 0
  
  if (screeningStats.total > 0) {
    // Fase 1: 20% si todas las referencias tienen clasificación de IA
    const fase1Progress = (screeningStats.screened / screeningStats.total) * 20
    screeningProgress += fase1Progress
    
    // Fase 2: 20% adicional si todas están clasificadas (included/excluded, no pending)
    const classifiedCount = screeningStats.included + screeningStats.excluded
    const fase2Progress = (classifiedCount / screeningStats.total) * 20
    screeningProgress += fase2Progress
    
    // Fase 3, 4, 5: Por ahora no tenemos datos, se pueden agregar después
    // TODO: Agregar progreso de Fase 3 (texto completo), Fase 4 (exclusiones), Fase 5 (PRISMA)
  }
  
  screeningProgress = Math.min(Math.round(screeningProgress), 100)

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
                <p className="text-muted-foreground max-w-3xl">
                  {project.protocol?.picoFramework?.population 
                    ? `Investigación sobre ${project.protocol.picoFramework.population}` 
                    : project.description?.substring(0, 200) || 'Proyecto de revisión sistemática'}
                  {project.description && project.description.length > 200 && '...'}
                </p>
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
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Resumen Ejecutivo General */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Settings className="h-6 w-6" />
                    Resumen Ejecutivo del Proyecto
                  </CardTitle>
                  <CardDescription>
                    Progreso general de tu revisión sistemática de literatura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    {/* Protocolo */}
                    <Card className="border-2 border-blue-200 bg-blue-50/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Settings className="h-5 w-5 text-blue-600" />
                          <Badge variant={protocolStats.criteriaCount > 0 ? "default" : "secondary"}>
                            {protocolStats.criteriaCount > 0 ? "Completado" : "Pendiente"}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-medium text-blue-900">Protocolo</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-3xl font-bold text-blue-700">
                          {protocolStats.criteriaCount > 0 ? "100%" : "0%"}
                        </div>
                        <Progress value={protocolStats.criteriaCount > 0 ? 100 : 0} className="h-2" />
                        <div className="text-xs text-muted-foreground space-y-1 pt-2">
                          <div className="flex justify-between">
                            <span>Criterios I/E:</span>
                            <span className="font-semibold">{protocolStats.criteriaCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Términos clave:</span>
                            <span className="font-semibold">{protocolStats.definitionsCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bases de datos:</span>
                            <span className="font-semibold">{protocolStats.databasesCount}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cribado */}
                    <Card className="border-2 border-amber-200 bg-amber-50/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Filter className="h-5 w-5 text-amber-600" />
                          <Badge variant={screeningProgress === 100 ? "default" : screeningProgress > 0 ? "secondary" : "outline"}>
                            {screeningProgress === 100 ? "Completado" : screeningProgress > 0 ? "En Progreso" : "Sin iniciar"}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-medium text-amber-900">Cribado</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-3xl font-bold text-amber-700">
                          {screeningProgress}%
                        </div>
                        <Progress value={screeningProgress} className="h-2" />
                        <div className="text-xs text-muted-foreground space-y-1 pt-2">
                          <div className="flex justify-between">
                            <span>Total referencias:</span>
                            <span className="font-semibold">{screeningStats.total}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-600">✓ Incluidas:</span>
                            <span className="font-semibold text-green-600">{screeningStats.included}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-600">✗ Excluidas:</span>
                            <span className="font-semibold text-red-600">{screeningStats.excluded}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-600">🔁 Duplicados:</span>
                            <span className="font-semibold text-orange-600">{screeningStats.duplicates}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-600">⏳ Pendientes:</span>
                            <span className="font-semibold text-yellow-600">{screeningStats.pending}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* PRISMA */}
                    <Card className="border-2 border-teal-200 bg-teal-50/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <ClipboardCheck className="h-5 w-5 text-teal-600" />
                          <Badge variant={prismaCompliance === 100 ? "default" : prismaCompliance > 0 ? "secondary" : "outline"}>
                            {prismaCompliance === 100 ? "Completado" : prismaCompliance > 0 ? "En Progreso" : "Sin iniciar"}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-medium text-teal-900">PRISMA</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-3xl font-bold text-teal-700">
                          {prismaCompliance}%
                        </div>
                        <Progress value={prismaCompliance} className="h-2" />
                        <div className="text-xs text-muted-foreground space-y-1 pt-2">
                          <div className="flex justify-between">
                            <span>Ítems completados:</span>
                            <span className="font-semibold">{prismaItemsCompleted} / {prismaTotalItems}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cumplimiento:</span>
                            <span className="font-semibold">
                              {prismaCompliance >= 80 ? "Excelente" : prismaCompliance >= 60 ? "Bueno" : prismaCompliance > 0 ? "En desarrollo" : "Pendiente"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Artículo */}
                    <Card className="border-2 border-purple-200 bg-purple-50/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <FileEdit className="h-5 w-5 text-purple-600" />
                          <Badge variant="outline">
                            En desarrollo
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-medium text-purple-900">Artículo</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-3xl font-bold text-purple-700">
                          0%
                        </div>
                        <Progress value={0} className="h-2" />
                        <div className="text-xs text-muted-foreground space-y-1 pt-2">
                          <div className="flex justify-between">
                            <span>Versiones:</span>
                            <span className="font-semibold">0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Palabras:</span>
                            <span className="font-semibold">0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estado:</span>
                            <span className="font-semibold">Sin iniciar</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Estado General del Proyecto */}
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-lg">
                            Estado: {project.status === "draft"
                              ? "Borrador"
                              : project.status === "in-progress"
                                ? "En Progreso"
                                : project.status === "screening"
                                  ? "Fase de Cribado"
                                  : project.status === "analysis"
                                    ? "Fase de Análisis"
                                    : "Completado"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Última actualización: {updatedDate.toLocaleDateString("es-ES", { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {Math.round((
                            (protocolStats.criteriaCount > 0 ? 25 : 0) + 
                            (screeningProgress * 0.25) + 
                            (prismaCompliance * 0.25) + 
                            0
                          ))}%
                        </p>
                        <p className="text-xs text-muted-foreground">Progreso total</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="protocol" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Protocolo de Investigación</CardTitle>
                      <CardDescription>Detalles completos del protocolo de revisión sistemática</CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/projects/${params.id}/protocol`}>Editar Protocolo</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {project.protocol ? (
                    <>
                      {/* Título propuesto */}
                      {project.protocol.proposedTitle && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-2">✨ Título Refinado (Propuesto por IA)</p>
                          <p className="text-lg font-semibold text-gray-900">{project.protocol.proposedTitle}</p>
                        </div>
                      )}

                      {/* Evaluación Inicial */}
                      {project.protocol.evaluationInitial && (
                        <div className="p-4 bg-muted rounded-lg space-y-3">
                          <p className="text-sm font-medium mb-3">🔍 Evaluación de Viabilidad</p>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-background rounded-lg text-center">
                              <p className="text-xs text-muted-foreground mb-1">Tema Claro</p>
                              <Badge variant={project.protocol.evaluationInitial.themeClear === 'si' ? 'default' : 'secondary'}>
                                {project.protocol.evaluationInitial.themeClear === 'si' ? '✅ Sí' : '⚠️ No'}
                              </Badge>
                            </div>
                            <div className="p-3 bg-background rounded-lg text-center">
                              <p className="text-xs text-muted-foreground mb-1">Delimitación</p>
                              <Badge variant={project.protocol.evaluationInitial.delimitation === 'si' ? 'default' : 'secondary'}>
                                {project.protocol.evaluationInitial.delimitation === 'si' ? '✅ Sí' : '⚠️ No'}
                              </Badge>
                            </div>
                            <div className="p-3 bg-background rounded-lg text-center">
                              <p className="text-xs text-muted-foreground mb-1">Viabilidad SLR</p>
                              <Badge variant={project.protocol.evaluationInitial.viability === 'si' ? 'default' : 'secondary'}>
                                {project.protocol.evaluationInitial.viability === 'si' ? '✅ Sí' : '⚠️ No'}
                              </Badge>
                            </div>
                          </div>
                          {project.protocol.evaluationInitial.comment && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-xs font-semibold text-amber-800 mb-1">📋 Comentario:</p>
                              <p className="text-sm text-gray-900">{project.protocol.evaluationInitial.comment}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Marco PICO */}
                      {project.protocol.picoFramework && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm font-medium text-purple-900 mb-3">🎯 Marco PICO</p>
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

                      {/* Pregunta Refinada */}
                      {project.protocol.refinedQuestion && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-medium text-green-900 mb-2">❓ Pregunta de Investigación Refinada</p>
                          <p className="text-base text-gray-800">{project.protocol.refinedQuestion}</p>
                        </div>
                      )}

                      {/* Matriz Es/No Es */}
                      {(project.protocol.isMatrix?.length > 0 || project.protocol.isNotMatrix?.length > 0) && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                          <p className="text-sm font-medium text-slate-900 mb-3">📖 Matriz Es/No Es</p>
                          <div className="grid md:grid-cols-2 gap-4">
                            {project.protocol.isMatrix && project.protocol.isMatrix.length > 0 && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-xs font-semibold text-green-700 mb-2">✅ ES (Incluye)</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {project.protocol.isMatrix.map((item, i) => (
                                    <li key={i} className="text-sm text-gray-700">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {project.protocol.isNotMatrix && project.protocol.isNotMatrix.length > 0 && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs font-semibold text-red-700 mb-2">❌ NO ES (Excluye)</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {project.protocol.isNotMatrix.map((item, i) => (
                                    <li key={i} className="text-sm text-gray-700">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Términos Clave */}
                      {project.protocol.keyTerms && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm font-medium text-amber-900 mb-3">🔑 Términos Clave</p>
                          <div className="space-y-3">
                            {project.protocol.keyTerms.technology && project.protocol.keyTerms.technology.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-700 mb-2">🧩 Tecnología:</p>
                                <div className="flex flex-wrap gap-2">
                                  {project.protocol.keyTerms.technology.map((term, i) => (
                                    <Badge key={i} variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">{term}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {project.protocol.keyTerms.domain && project.protocol.keyTerms.domain.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-700 mb-2">🧪 Dominio:</p>
                                <div className="flex flex-wrap gap-2">
                                  {project.protocol.keyTerms.domain.map((term, i) => (
                                    <Badge key={i} variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">{term}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {project.protocol.keyTerms.themes && project.protocol.keyTerms.themes.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-700 mb-2">🔍 Temas:</p>
                                <div className="flex flex-wrap gap-2">
                                  {project.protocol.keyTerms.themes.map((term, i) => (
                                    <Badge key={i} variant="outline" className="bg-green-100 text-green-800 border-green-300">{term}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {project.protocol.keyTerms.studyType && project.protocol.keyTerms.studyType.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-700 mb-2">📚 Tipo de Estudio:</p>
                                <div className="flex flex-wrap gap-2">
                                  {project.protocol.keyTerms.studyType.map((term, i) => (
                                    <Badge key={i} variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">{term}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Preguntas de Investigación */}
                      {project.protocol.researchQuestions && project.protocol.researchQuestions.length > 0 && (
                        <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                          <p className="text-sm font-medium text-cyan-900 mb-3">❓ Preguntas de Investigación</p>
                          <ul className="space-y-2">
                            {project.protocol.researchQuestions.map((question, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-cyan-600 font-semibold">{i + 1}.</span>
                                <span className="text-sm text-gray-700">{question}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Criterios de Inclusión/Exclusión */}
                      {(project.protocol.inclusionCriteria?.length > 0 || project.protocol.exclusionCriteria?.length > 0) && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                          <p className="text-sm font-medium text-slate-900 mb-3">📋 Criterios de Inclusión y Exclusión</p>
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
                      {project.protocol.searchStrategy && (
                        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <p className="text-sm font-medium text-indigo-900 mb-3">🔎 Estrategia de Búsqueda</p>
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
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-indigo-700 mb-2">Cadena de búsqueda:</p>
                              <code className="text-xs bg-white p-3 rounded block overflow-x-auto text-gray-800 border border-indigo-200">
                                {project.protocol.searchStrategy.searchString}
                              </code>
                            </div>
                          )}
                          {project.protocol.searchStrategy.temporalRange && (
                            <div>
                              <p className="text-xs font-semibold text-indigo-700 mb-2">Rango temporal:</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
                                  {project.protocol.searchStrategy.temporalRange.start} - {project.protocol.searchStrategy.temporalRange.end}
                                </Badge>
                                {project.protocol.searchStrategy.temporalRange.justification && (
                                  <span className="text-xs text-muted-foreground">
                                    ({project.protocol.searchStrategy.temporalRange.justification})
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cumplimiento PRISMA */}
                      {project.protocol.prismaCompliance && project.protocol.prismaCompliance.length > 0 && (
                        <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                          <p className="text-sm font-medium text-teal-900 mb-3">✓ Cumplimiento PRISMA ({project.protocol.prismaCompliance.length} ítems)</p>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {project.protocol.prismaCompliance.slice(0, 5).map((item, i) => (
                              <div key={i} className="p-3 bg-white rounded-lg border border-teal-200">
                                <div className="flex items-start justify-between mb-1">
                                  <p className="text-xs font-semibold text-teal-800">Ítem {item.number}: {item.item}</p>
                                  <Badge variant={item.complies === 'si' ? 'default' : 'secondary'} className="ml-2">
                                    {item.complies === 'si' ? '✅' : '⚠️'}
                                  </Badge>
                                </div>
                                {item.evidence && (
                                  <p className="text-xs text-muted-foreground">{item.evidence}</p>
                                )}
                              </div>
                            ))}
                            {project.protocol.prismaCompliance.length > 5 && (
                              <p className="text-xs text-center text-muted-foreground pt-2">
                                ... y {project.protocol.prismaCompliance.length - 5} ítems más
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium mb-1">Protocolo no generado</p>
                      <p className="text-sm mb-4">Ve a la página de Protocolo para generar el análisis con IA</p>
                      <Button asChild>
                        <Link href={`/projects/${params.id}/protocol`}>Ir al Protocolo</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
