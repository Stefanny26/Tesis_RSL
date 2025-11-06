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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historial de Versiones
        </CardTitle>
        <CardDescription>Todas las versiones guardadas de tu artículo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`p-4 border rounded-lg transition-colors ${
                version.id === currentVersionId ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={version.id === currentVersionId ? "default" : "outline"}>v{version.version}</Badge>
                  {version.isPublished && <Badge variant="secondary">Publicada</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => onSelectVersion(version.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {version.id !== currentVersionId && (
                    <Button size="sm" variant="ghost" onClick={() => onRestoreVersion(version.id)}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-sm font-medium mb-2">{version.changeDescription}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{version.createdBy}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{version.createdAt.toLocaleString("es-ES")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
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
