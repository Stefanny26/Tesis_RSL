"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { ArticleVersion } from "@/lib/article-types"
import { Clock, User, FileText, Eye, RotateCcw } from "lucide-react"

interface VersionHistoryProps {
  versions: ArticleVersion[]
  currentVersionId: string
  onSelectVersion: (versionId: string) => void
  onRestoreVersion: (versionId: string) => void
  compact?: boolean
}

export function VersionHistory({ versions, currentVersionId, onSelectVersion, onRestoreVersion, compact = false }: VersionHistoryProps) {
  const content = (
    <Accordion type="single" collapsible className="w-full">
      {versions.map((version) => (
        <AccordionItem key={version.id} value={version.id} className="border-b last:border-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-1.5 text-left">
                  <Badge variant={version.id === currentVersionId ? "default" : "outline"} className="text-xs h-5">v{version.version}</Badge>
                  {version.isPublished && <Badge variant="secondary" className="text-xs h-5">Publicada</Badge>}
                  <span className="text-xs font-medium truncate max-w-[140px]">{version.changeDescription}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-2.5 w-2.5" />
                      <span>{version.createdBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{version.createdAt.toLocaleString("es-ES")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <FileText className="h-2.5 w-2.5" />
                    <span>{version.wordCount} palabras</span>
                  </div>
                  <div className="flex gap-1 pt-1">
                    <Button size="sm" variant="outline" onClick={() => onSelectVersion(version.id)} className="h-7 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    {version.id !== currentVersionId && (
                      <Button size="sm" variant="outline" onClick={() => onRestoreVersion(version.id)} className="h-7 text-xs">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restaurar
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
      ))}
    </Accordion>
  )

  if (compact) {
    return content
  }

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
        {content}
      </CardContent>
    </Card>
  )
}
