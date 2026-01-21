"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ArticleVersion } from "@/lib/article-types"
import { Clock, User, FileText, Eye, RotateCcw } from "lucide-react"

interface VersionHistoryProps {
  versions: ArticleVersion[]
  currentVersionId: string
  onSelectVersion: (versionId: string) => void
  onRestoreVersion: (versionId: string) => void
}

export function VersionHistory({ versions, currentVersionId, onSelectVersion, onRestoreVersion }: VersionHistoryProps) {
  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="flex items-center gap-1.5 text-base">
          <Clock className="h-4 w-4" />
          Historial de Versiones
        </CardTitle>
        <CardDescription className="text-xs">Todas las versiones guardadas de tu artículo</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`p-3 border rounded-lg transition-colors ${
                version.id === currentVersionId ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Badge variant={version.id === currentVersionId ? "default" : "outline"} className="text-xs h-5">v{version.version}</Badge>
                  {version.isPublished && <Badge variant="secondary" className="text-xs h-5">Publicada</Badge>}
                </div>
                <div className="flex gap-0.5">
                  <Button size="sm" variant="ghost" onClick={() => onSelectVersion(version.id)} className="h-6 w-6 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                  {version.id !== currentVersionId && (
                    <Button size="sm" variant="ghost" onClick={() => onRestoreVersion(version.id)} className="h-6 w-6 p-0">
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-xs font-medium mb-1.5">{version.changeDescription}</p>

              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-2.5 w-2.5" />
                  <span>{version.createdBy}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  <span>{version.createdAt.toLocaleString("es-ES")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-2.5 w-2.5" />
                  <span>{version.wordCount} palabras</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
