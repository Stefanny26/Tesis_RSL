"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ContentTypeBadge } from "./content-type-badge"
import type { PrismaItem, PrismaItemData } from "@/lib/prisma-items"
import { Check, ChevronDown, ChevronUp, FileText, AlertCircle } from "lucide-react"

interface PrismaItemCardProps {
  item: PrismaItem
  itemData?: PrismaItemData
  onToggleComplete: () => void
  onContentChange: (content: string) => void
  onRequestAISuggestion: () => void
}

export function PrismaItemCard({
  item,
  itemData,
  onToggleComplete,
  onContentChange,
  onRequestAISuggestion,
}: PrismaItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const isCompleted = itemData?.completed || false
  const content = itemData?.content || ""
  const contentType = itemData?.contentType || 'pending'
  const aiSuggestion = itemData?.aiValidation?.suggestions
  const dataSource = itemData?.dataSource

  return (
    <Card
      className={`border-l-4 transition-all ${isCompleted
        ? "border-l-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/10"
        : "border-l-gray-300 hover:border-l-blue-500"
        }`}
    >
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isCompleted
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-gray-300 bg-white'
                  }`}>
                  {isCompleted && <Check className="h-3 w-3" />}
                  {!isCompleted && <span className="text-[10px] font-medium text-gray-500">{item.id}</span>}
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.item}
                  </CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">
                    {item.description}
                  </CardDescription>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 pl-7">
              <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">
                {item.section}
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                {item.location}
              </Badge>
              <ContentTypeBadge
                contentType={contentType}
                dataSource={dataSource}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-2 pl-7 pb-3 px-3">
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Contenido</label>

            <div className={`rounded-lg border-2 transition-colors ${content && contentType !== 'pending'
              ? contentType === 'automated'
                ? "border-blue-200 bg-blue-50/30 dark:bg-blue-950/10"
                : contentType === 'hybrid'
                  ? "border-purple-200 bg-purple-50/30 dark:bg-purple-950/10"
                  : "border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10"
              : "border-dashed border-gray-300"
              }`}>
              <Textarea
                placeholder="Este ítem no tiene contenido aún. Puede completarlo manualmente o usar el botón 'Completar PRISMA Automáticamente' en la parte superior de la página."
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                rows={5}
                className="border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[12px]"
              />
            </div>

            {content && contentType !== 'pending' && (
              <div className="flex items-start gap-1.5 text-[10px] px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded border">
                {contentType === 'automated' && (
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                    <Check className="h-3 w-3 flex-shrink-0" />
                    <span><strong>Automatizado:</strong> {dataSource || 'Generado por el sistema'}</span>
                  </div>
                )}
                {contentType === 'hybrid' && (
                  <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400">
                    <Check className="h-3 w-3 flex-shrink-0" />
                    <span><strong>Híbrido:</strong> Generado automáticamente y editado manualmente</span>
                  </div>
                )}
                {contentType === 'human' && (
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <Check className="h-3 w-3 flex-shrink-0" />
                    <span><strong>Manual:</strong> Escrito por el investigador</span>
                  </div>
                )}
              </div>
            )}

            {!content && (
              <Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 py-2">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <AlertDescription className="text-[11px] text-amber-900 dark:text-amber-200">
                  Este ítem no tiene contenido aún. Puedes completarlo manualmente o usar el botón "Completar PRISMA Automáticamente" en la parte superior de la página.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {aiSuggestion && (
            <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 py-2">
              <FileText className="h-3 w-3 text-blue-600" />
              <AlertDescription>
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-0.5 text-[11px]">Sugerencia metodológica</p>
                <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed">{aiSuggestion}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}
    </Card>
  )
}
