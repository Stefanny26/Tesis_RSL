"use client"

import { useEffect, useState } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProjectHeader } from "@/components/project-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Settings, BookOpen, Filter, ClipboardCheck, FileEdit, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import type { Project } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadProject() {
      try {
        setIsLoading(true)
        const data = await apiClient.getProject(params.id)

        // Cargar protocolo completo
        if (data.id) {
          try {
            const protocol = await apiClient.getProtocol(data.id)
            console.log('🔍 Protocolo cargado completo:', protocol)
            console.log('🔍 Search Strategy:', protocol?.searchStrategy)
            console.log('🔍 Search String:', protocol?.searchStrategy?.searchString)
            console.log('🔍 Databases:', protocol?.databases)
            if (protocol) {
              data.protocol = protocol
            }
          } catch (protocolErr) {
            console.error("Error cargando protocolo:", protocolErr)
          }
        }

        setProject(data)
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

  const updatedDate = new Date(project.createdAt)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Project Header */}
          <ProjectHeader project={project} />

          {/* Protocolo */}
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
                      <p className="text-sm font-medium text-blue-900 mb-2">Título Refinado (Propuesto por IA)</p>
                      <p className="text-lg font-semibold text-gray-900">{project.protocol.proposedTitle}</p>
                    </div>
                  )}

                  {/* Marco PICO */}
                  {project.protocol.picoFramework && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm font-medium text-purple-900 mb-3">Marco PICO</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-1">Población</p>
                          <p className="text-sm text-gray-700">
                            {project.protocol.picoFramework.population || <span className="text-gray-400 italic">No especificado</span>}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-1">Intervención</p>
                          <p className="text-sm text-gray-700">
                            {project.protocol.picoFramework.intervention || <span className="text-gray-400 italic">No especificado</span>}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-1">Comparación</p>
                          <p className="text-sm text-gray-700">
                            {project.protocol.picoFramework.comparison || <span className="text-gray-400 italic">No especificado</span>}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-1">Resultado</p>
                          <p className="text-sm text-gray-700">
                            {project.protocol.picoFramework.outcomes || <span className="text-gray-400 italic">No especificado</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Matriz Es/No Es */}
                  {(project.protocol.isMatrix?.length > 0 || project.protocol.isNotMatrix?.length > 0) && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-sm font-medium text-slate-900 mb-3">Matriz Es/No Es</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {project.protocol.isMatrix && project.protocol.isMatrix.length > 0 && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-xs font-semibold text-green-700 mb-2">ES (Incluye)</p>
                            <ul className="list-disc list-inside space-y-1">
                              {project.protocol.isMatrix.map((item, i) => (
                                <li key={i} className="text-sm text-gray-700">{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {project.protocol.isNotMatrix && project.protocol.isNotMatrix.length > 0 && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs font-semibold text-red-700 mb-2">NO ES (Excluye)</p>
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
                      <p className="text-sm font-medium text-amber-900 mb-3">Términos Clave</p>
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
                                <Badge key={i} variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">{term}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {project.protocol.keyTerms.themes && project.protocol.keyTerms.themes.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-amber-700 mb-2">Temas:</p>
                            <div className="flex flex-wrap gap-2">
                              {project.protocol.keyTerms.themes.map((term, i) => (
                                <Badge key={i} variant="outline" className="bg-green-100 text-green-800 border-green-300">{term}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {project.protocol.keyTerms.studyType && project.protocol.keyTerms.studyType.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-amber-700 mb-2">Tipo de Estudio:</p>
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


                  {/* Criterios de Inclusión/Exclusión */}
                  {(project.protocol.inclusionCriteria?.length > 0 || project.protocol.exclusionCriteria?.length > 0) && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-sm font-medium text-slate-900 mb-3">Criterios de Inclusión y Exclusión</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {project.protocol.inclusionCriteria && project.protocol.inclusionCriteria.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-green-700 mb-2">Inclusión:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {project.protocol.inclusionCriteria.map((criteria, i) => (
                                <li key={i} className="text-sm text-gray-700">{criteria}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {project.protocol.exclusionCriteria && project.protocol.exclusionCriteria.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-700 mb-2">Exclusión:</p>
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
                  {(() => {
                    console.log('🔍 Rendering Search Strategy:', project.protocol.searchStrategy)
                    console.log('🔍 Has searchString?:', !!project.protocol.searchStrategy?.searchString)
                    console.log('🔍 searchQueries:', project.protocol.searchStrategy?.searchQueries)
                    console.log('🔍 Full protocol object:', project.protocol)
                    return null
                  })()}
                  {(project.protocol.searchStrategy?.searchQueries?.length > 0 || project.protocol.searchQueries?.length > 0 || project.protocol.searchStrategy || project.protocol.databases || project.protocol.searchString) && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-sm font-medium text-indigo-900 mb-3">Estrategia de Búsqueda</p>

                      {/* Bases de datos */}
                      {((project.protocol.searchStrategy?.databases?.length > 0) || (project.protocol.databases?.length > 0)) && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-indigo-700 mb-2">Bases de datos:</p>
                          <div className="flex flex-wrap gap-2">
                            {(project.protocol.searchStrategy?.databases || project.protocol.databases || []).map((db, i) => (
                              <Badge key={i} variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">{db}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cadenas de búsqueda específicas por base de datos */}
                      {(project.protocol.searchStrategy?.searchQueries && project.protocol.searchStrategy.searchQueries.length > 0) || (project.protocol.searchQueries && project.protocol.searchQueries.length > 0) ? (
                        <div className="mb-3 space-y-3">
                          <p className="text-xs font-semibold text-indigo-700 mb-2">Cadenas de búsqueda:</p>
                          {(project.protocol.searchStrategy?.searchQueries || project.protocol.searchQueries || []).map((queryObj: any, index: number) => (
                            <div key={index} className="bg-white p-3 rounded border border-indigo-200">
                              <p className="text-xs font-medium text-indigo-600 mb-1">
                                {queryObj.database || queryObj.databaseName || `Base de datos ${index + 1}`}:
                              </p>
                              <code className="text-xs bg-gray-50 p-2 rounded block overflow-x-auto text-gray-800 border border-gray-200">
                                {queryObj.query}
                              </code>
                            </div>
                          ))}
                        </div>
                      ) : (project.protocol.searchStrategy?.searchString || project.protocol.searchString) ? (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-indigo-700 mb-2">Cadena de búsqueda:</p>
                          <code className="text-xs bg-white p-3 rounded block overflow-x-auto text-gray-800 border border-indigo-200">
                            {project.protocol.searchStrategy?.searchString || project.protocol.searchString}
                          </code>
                        </div>
                      ) : null}

                      {/* Rango temporal */}
                      {(project.protocol.searchStrategy?.temporalRange || project.protocol.temporalRange) && (
                        <div>
                          <p className="text-xs font-semibold text-indigo-700 mb-2">Rango temporal:</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
                              {(project.protocol.searchStrategy?.temporalRange?.start || project.protocol.temporalRange?.start)} - {(project.protocol.searchStrategy?.temporalRange?.end || project.protocol.temporalRange?.end)}
                            </Badge>
                            {(project.protocol.searchStrategy?.temporalRange?.justification || project.protocol.temporalRange?.justification) && (
                              <span className="text-xs text-muted-foreground">
                                ({project.protocol.searchStrategy?.temporalRange?.justification || project.protocol.temporalRange?.justification})
                              </span>
                            )}
                          </div>
                        </div>
                      )}
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
        </div>
      </main>
    </div>
  )
}
