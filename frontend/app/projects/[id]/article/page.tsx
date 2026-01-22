"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProjectHeader } from "@/components/project-header"
import { apiClient } from "@/lib/api-client"
import type { Project } from "@/lib/types"
import { ArticleEditor } from "@/components/article/article-editor"
import { VersionHistory } from "@/components/article/version-history"
import { AIGeneratorPanel } from "@/components/article/ai-generator-panel"
import { ArticleStats } from "@/components/article/article-stats"
import { ArticlePreview } from "@/components/article/article-preview"
import type { ArticleVersion } from "@/lib/article-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Save, FileDown, Eye, Loader2, Lock, Sparkles, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { exportArticleToPDF, exportArticleToDOCX } from "@/lib/article-export"

interface ArticleStatus {
  canGenerate: boolean
  prismaCompleted: number
  prismaTotal: number
  message: string
  blockingReason?: string
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [versions, setVersions] = useState<ArticleVersion[]>([])
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null)
  const [status, setStatus] = useState<ArticleStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    try {
      setIsLoading(true)

      // Cargar proyecto
      const projectData = await apiClient.getProject(params.id)
      setProject(projectData)

      // Cargar estado del artículo
      const statusData = await apiClient.getArticleStatus(params.id)
      setStatus(statusData.data || statusData)

      // Cargar versiones guardadas del artículo
      try {
        const versionsData = await apiClient.getArticleVersions(params.id)
        if (versionsData.success && versionsData.data && versionsData.data.length > 0) {
          setVersions(versionsData.data)
          setCurrentVersionId(versionsData.data[0].id)
        } else {
          // Si no hay versiones, inicializar con una versión vacía
          const initialVersion: ArticleVersion = {
            id: 'v1-temp',
            projectId: params.id,
            version: 1,
            title: projectData.title || 'Artículo sin título',
            content: {
              abstract: '',
              introduction: '',
              methods: '',
              results: '',
              discussion: '',
              conclusions: '',
              references: '',
              declarations: ''
            },
            wordCount: 0,
            createdAt: new Date(),
            createdBy: user?.fullName || 'Usuario',
            changeDescription: 'Versión inicial',
            isPublished: false
          }

          setVersions([initialVersion])
          setCurrentVersionId('v1-temp')
        }
      } catch (error) {
        console.error('Error cargando versiones:', error)
        // Inicializar con versión vacía si hay error
        const initialVersion: ArticleVersion = {
          id: 'v1-temp',
          projectId: params.id,
          version: 1,
          title: projectData.title || 'Artículo sin título',
          content: {
            abstract: '',
            introduction: '',
            methods: '',
            results: '',
            discussion: '',
            conclusions: '',
            references: '',
            declarations: ''
          },
          wordCount: 0,
          createdAt: new Date(),
          createdBy: user?.fullName || 'Usuario',
          changeDescription: 'Versión inicial',
          isPublished: false
        }

        setVersions([initialVersion])
        setCurrentVersionId('v1-temp')
      }

    } catch (error: any) {
      console.error('Error cargando datos del artículo:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los datos del artículo",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const currentVersion = versions.find((v) => v.id === currentVersionId) || versions[0]

  const handleContentChange = (section: keyof ArticleVersion["content"], content: string) => {
    setVersions((prev) =>
      prev.map((v) =>
        v.id === currentVersionId
          ? {
            ...v,
            content: { ...v.content, [section]: content },
            wordCount: Object.values({ ...v.content, [section]: content })
              .join(" ")
              .split(" ")
              .filter((w) => w.length > 0).length,
          }
          : v,
      ),
    )
  }

  const handleSaveVersion = async () => {
    try {
      setIsSaving(true)

      // Guardar en la base de datos
      const response = await apiClient.saveArticleVersion(params.id, {
        title: currentVersion.title,
        sections: currentVersion.content,
        changeDescription: "Cambios manuales guardados"
      })

      if (response.success) {
        toast({
          title: "Versión guardada",
          description: `Versión ${response.data.versionNumber} guardada exitosamente`
        })

        // Recargar versiones
        await loadData()
      }
    } catch (error: any) {
      console.error('Error guardando versión:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la versión",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestoreVersion = (versionId: string) => {
    const versionToRestore = versions.find((v) => v.id === versionId)
    if (!versionToRestore) return

    // Actualizar la versión actual con el contenido restaurado
    setVersions((prev) =>
      prev.map((v) =>
        v.id === currentVersionId
          ? {
            ...v,
            content: versionToRestore.content,
            wordCount: versionToRestore.wordCount,
          }
          : v,
      ),
    )


    toast({
      title: "Versión restaurada",
      description: `Se ha restaurado la versión ${versionToRestore.version}`,
    })
  }

  const handleGenerateDraft = async (section: string) => {
    try {
      setIsGenerating(true)

      toast({
        title: "Generando sección",
        description: `Generando contenido para ${section}...`,
      })

      const response = await apiClient.generateArticleSection(
        params.id,
        section as any
      )

      if (response.success && response.data) {
        // Actualizar la sección correspondiente
        handleContentChange(section as keyof ArticleVersion["content"], response.data.content)

        toast({
          title: "✅ Sección generada",
          description: `Se ha generado contenido para ${section}`,
        })
      }

    } catch (error: any) {
      console.error('Error generando sección:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo generar la sección",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateFullArticle = async () => {
    if (!status?.canGenerate) {
      toast({
        title: "No disponible",
        description: status?.message || "Debe completar PRISMA primero",
        variant: "destructive"
      })
      return
    }

    try {
      setIsGenerating(true)

      toast({
        title: "Generando artículo",
        description: "Extrayendo datos y generando contenido...",
      })

      // Extraer RQS automáticamente antes de generar el artículo (proceso interno)
      try {
        await apiClient.extractRQSData(params.id)
      } catch (error) {
        console.log('RQS ya extraído o no necesario:', error)
      }

      const response = await apiClient.generateArticle(params.id)

      if (response.success && response.data) {
        // Guardar la versión generada en la base de datos
        const saveResponse = await apiClient.saveArticleVersion(params.id, {
          title: response.data.title || currentVersion.title,
          sections: response.data.sections,
          changeDescription: 'Generado automáticamente por IA desde PRISMA'
        })

        if (saveResponse.success) {
          toast({
            title: "✅ Artículo generado",
            description: `Versión ${saveResponse.data.versionNumber} guardada exitosamente`,
          })

          // Recargar versiones para obtener la nueva
          await loadData()
        }
      }

    } catch (error: any) {
      console.error('Error generando artículo:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el artículo",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreview = () => {
    if (!currentVersion) {
      toast({
        title: "No hay contenido",
        description: "Primero debe generar o crear una versión del artículo",
        variant: "destructive"
      })
      return
    }
    setShowPreview(true)
  }

  const handleExport = (format: 'pdf' | 'docx') => {
    if (!currentVersion) {
      toast({
        title: "No hay contenido",
        description: "Primero debe generar o crear una versión del artículo",
        variant: "destructive"
      })
      return
    }

    try {
      if (format === 'pdf') {
        exportArticleToPDF(currentVersion)
        toast({
          title: "Exportando a PDF",
          description: "Se abrirá una ventana para guardar el PDF"
        })
      } else {
        exportArticleToDOCX(currentVersion)
        toast({
          title: "Exportado exitosamente",
          description: "El archivo se ha descargado en formato Word"
        })
      }
    } catch (error) {
      console.error('Error exportando:', error)
      toast({
        title: "Error",
        description: "No se pudo exportar el artículo",
        variant: "destructive"
      })
    }
  }

  const calculateCompletion = () => {
    if (!currentVersion) return 0
    const sections = Object.values(currentVersion.content)
    const filledSections = sections.filter((s) => s.trim().length > 100).length
    return Math.round((filledSections / sections.length) * 100)
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

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {/* Project Header */}
          {project && <ProjectHeader project={project} />}

          {/* Status Alert */}
          {!status && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <Lock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
                Cargando estado del proyecto...
              </AlertDescription>
            </Alert>
          )}

          {status && !status.canGenerate && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <Lock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
                {status.message}
              </AlertDescription>
            </Alert>
          )}

          {status && status.canGenerate && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <Sparkles className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
                {status.message} Puede generar el artículo científico completo.
              </AlertDescription>
            </Alert>
          )}

          {/* Top Section: 3 Bloques - Info IA + Generador + Acciones */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bloque 1: Información del Generador con IA */}
            <Card>
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <Sparkles className="h-4 w-4" />
                  Generador con IA
                </CardTitle>
                <CardDescription className="text-xs">
                  Genera borradores automáticamente usando inteligencia artificial
                </CardDescription>
              </CardHeader>
              <CardContent className="py-2 pb-1">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  La IA utilizará tu protocolo PICO, referencias incluidas y checklist PRISMA para generar contenido académico de alta calidad.
                </p>
              </CardContent>
            </Card>

            {/* Bloque 2: Generar Artículo Completo */}
            <Card>
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm font-semibold">Generar Artículo Completo</CardTitle>
                <CardDescription className="text-xs">
                  Crea todas las secciones del artículo automáticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-2 pb-3">
               
                <Button
                  onClick={handleGenerateFullArticle}
                  disabled={isGenerating || !status?.canGenerate}
                  className="w-full"
                  size="sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generar Borrador Completo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Bloque 3: Acciones */}
            <Card>
              <CardHeader >
                <CardTitle className="text-sm font-semibold">Acciones</CardTitle>
                <CardDescription className="text-xs">
                  Gestiona y exporta tu artículo científico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 ">
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!currentVersion || isGenerating}
                  className="w-full"
                  size="sm"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Vista Previa
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('pdf')}
                  disabled={!currentVersion || isGenerating}
                  className="w-full"
                  size="sm"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <Button onClick={handleSaveVersion} disabled={isGenerating || isSaving} className="w-full" size="sm">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Versión
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* New Layout: Index (col-3) + Content (col-9) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Sidebar: Index + Version History */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="sticky top-6">
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                    <FileText className="h-3 w-3" />
                    Índice del Artículo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5 py-2">
                  <button
                    onClick={() => document.getElementById('section-title')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Título
                  </button>
                  <button
                    onClick={() => document.getElementById('section-abstract')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Resumen
                  </button>
                  <button
                    onClick={() => document.getElementById('section-introduction')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Introducción
                  </button>
                  <button
                    onClick={() => document.getElementById('section-methods')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Métodos
                  </button>
                  <button
                    onClick={() => document.getElementById('section-results')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Resultados
                  </button>
                  <button
                    onClick={() => document.getElementById('section-discussion')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Discusión
                  </button>
                  <button
                    onClick={() => document.getElementById('section-conclusions')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Conclusiones
                  </button>
                  <button
                    onClick={() => document.getElementById('section-references')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Referencias
                  </button>
                </CardContent>
              </Card>

              <VersionHistory
                versions={versions}
                currentVersionId={currentVersionId || ''}
                onSelectVersion={setCurrentVersionId}
                onRestoreVersion={handleRestoreVersion}
              />
            </div>

            {/* Center: Main Content Area (Article Editor) */}
            <div className="lg:col-span-9">
              {currentVersion && (
                <ArticleEditor
                  version={currentVersion}
                  onContentChange={handleContentChange}
                  disabled={isGenerating}
                />
              )}
            </div>
          </div>
        </div>

        {/* Preview Dialog */}
        {currentVersion && (
          <ArticlePreview
            version={currentVersion}
            open={showPreview}
            onClose={() => setShowPreview(false)}
            onExport={handleExport}
          />
        )}
      </main>
    </div>
  )
}
