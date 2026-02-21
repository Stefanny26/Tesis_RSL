"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ArticleVersion } from "@/lib/article-types"
import { Clock, User, FileText, Eye, RotateCcw, CheckCircle2, ChevronDown } from "lucide-react"

interface VersionHistoryProps {
  versions: ArticleVersion[]
  currentVersionId: string
  onSelectVersion: (versionId: string) => void
  onRestoreVersion: (versionId: string) => void
  compact?: boolean
}

export function VersionHistory({ versions, currentVersionId, onSelectVersion, onRestoreVersion, compact = false }: VersionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatDate = (date: Date) => {
    try {
      return new Date(date).toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  const content = (
    <div className="space-y-1">
      {versions.map((version) => {
        const isCurrent = version.id === currentVersionId
        const isExpanded = expandedId === version.id
        return (
          <div key={version.id} className={`rounded-md border transition-colors ${isCurrent ? 'border-primary/40 bg-primary/5' : 'border-transparent hover:bg-accent/50'}`}>
            {/* Header — always visible */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : version.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-left"
            >
              <CheckCircle2 className={`h-3.5 w-3.5 flex-shrink-0 ${isCurrent ? 'text-primary' : 'text-green-500'}`} />
              <Badge variant={isCurrent ? "default" : "secondary"} className="text-[10px] h-4 px-1.5 flex-shrink-0">
                v{version.version}
              </Badge>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium truncate block">
                  {isCurrent ? 'Versión actual' : `${formatDate(version.createdAt)}`}
                </span>
              </div>
              <ChevronDown className={`h-3 w-3 text-muted-foreground flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="px-2 pb-2 pt-0 space-y-1.5">
                <p className="text-[10px] text-muted-foreground pl-5">
                  {version.changeDescription}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground pl-5">
                  <span className="flex items-center gap-0.5">
                    <User className="h-2.5 w-2.5" />
                    {version.createdBy}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <FileText className="h-2.5 w-2.5" />
                    {version.wordCount} palabras
                  </span>
                </div>
                <div className="flex gap-1 pl-5 pt-0.5">
                  {!isCurrent && (
                    <>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onSelectVersion(version.id) }} className="h-6 text-[10px] px-2">
                        <Eye className="h-2.5 w-2.5 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onRestoreVersion(version.id) }} className="h-6 text-[10px] px-2">
                        <RotateCcw className="h-2.5 w-2.5 mr-1" />
                        Restaurar
                      </Button>
                    </>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] text-primary font-medium">Visualizando ahora</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  if (compact) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          Versiones guardadas ({versions.length})
        </h3>
        {content}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="flex items-center gap-1.5 text-base">
          <Clock className="h-4 w-4" />
          Historial de Versiones
        </CardTitle>
        <CardDescription className="text-xs">{versions.length} versiones guardadas de tu artículo</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {content}
      </CardContent>
    </Card>
  )
}
