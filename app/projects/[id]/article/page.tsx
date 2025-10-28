"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ArticleEditor } from "@/components/article/article-editor"
import { VersionHistory } from "@/components/article/version-history"
import { AIGeneratorPanel } from "@/components/article/ai-generator-panel"
import { ArticleStats } from "@/components/article/article-stats"
import { mockVersions } from "@/lib/mock-versions"
import type { ArticleVersion } from "@/lib/article-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, FileDown, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ArticlePage({ params }: { params: { id: string } }) {
  const [versions, setVersions] = useState<ArticleVersion[]>(mockVersions)
  const [currentVersionId, setCurrentVersionId] = useState(mockVersions[0].id)
  const { toast } = useToast()

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

  const handleSaveVersion = () => {
    const newVersion: ArticleVersion = {
      ...currentVersion,
      id: `v${versions.length + 1}`,
      version: versions.length + 1,
      createdAt: new Date(),
      changeDescription: "Cambios manuales guardados",
    }

    setVersions([newVersion, ...versions])
    setCurrentVersionId(newVersion.id)

    toast({
      title: "Versión guardada",
      description: `Se ha creado la versión ${newVersion.version}`,
    })
  }

  const handleRestoreVersion = (versionId: string) => {
    const versionToRestore = versions.find((v) => v.id === versionId)
    if (!versionToRestore) return

    const newVersion: ArticleVersion = {
      ...versionToRestore,
      id: `v${versions.length + 1}`,
      version: versions.length + 1,
      createdAt: new Date(),
      changeDescription: `Restaurada desde versión ${versionToRestore.version}`,
    }

    setVersions([newVersion, ...versions])
    setCurrentVersionId(newVersion.id)

    toast({
      title: "Versión restaurada",
      description: `Se ha restaurado la versión ${versionToRestore.version}`,
    })
  }

  const handleGenerateDraft = (section: string) => {
    toast({
      title: "Sección generada",
      description: `La IA ha generado contenido para ${section}`,
    })
  }

  const handleGenerateFullArticle = () => {
    toast({
      title: "Artículo generado",
      description: "La IA ha generado un borrador completo del artículo",
    })
  }

  const calculateCompletion = () => {
    const sections = Object.values(currentVersion.content)
    const filledSections = sections.filter((s) => s.trim().length > 100).length
    return Math.round((filledSections / sections.length) * 100)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editor de Artículo</h1>
              <p className="text-muted-foreground">Escribe y gestiona versiones de tu artículo científico</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Vista Previa
              </Button>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={handleSaveVersion}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Versión
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Input
              value={currentVersion.title}
              onChange={(e) =>
                setVersions((prev) =>
                  prev.map((v) => (v.id === currentVersionId ? { ...v, title: e.target.value } : v)),
                )
              }
              className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
              placeholder="Título del artículo..."
            />
          </div>

          {/* Stats */}
          <ArticleStats
            wordCount={currentVersion.wordCount}
            lastSaved={currentVersion.createdAt}
            completionPercentage={calculateCompletion()}
          />

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-2">
              <ArticleEditor version={currentVersion} onContentChange={handleContentChange} />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <AIGeneratorPanel
                onGenerateDraft={handleGenerateDraft}
                onGenerateFullArticle={handleGenerateFullArticle}
              />
              <VersionHistory
                versions={versions}
                currentVersionId={currentVersionId}
                onSelectVersion={setCurrentVersionId}
                onRestoreVersion={handleRestoreVersion}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
