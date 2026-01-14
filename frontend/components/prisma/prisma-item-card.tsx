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
      className={`border-l-4 transition-all ${
        isCompleted 
          ? "border-l-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/10" 
          : "border-l-gray-300 hover:border-l-blue-500"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  isCompleted 
                    ? 'border-emerald-600 bg-emerald-600 text-white' 
                    : 'border-gray-300 bg-white'
                }`}>
                  {isCompleted && <Check className="h-4 w-4" />}
                  {!isCompleted && <span className="text-xs font-medium text-gray-500">{item.id}</span>}
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                    {item.item}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {item.description}
                  </CardDescription>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="-mt-1"
              >
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 pl-9">
              <Badge variant="outline" className="text-xs font-normal">
                {item.section}
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal">
                {item.location}
              </Badge>
              <ContentTypeBadge 
                contentType={contentType}
                dataSource={dataSource}
              />
            </div>
          </div>
        </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pl-9">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contenido</label>
            
            <div className={`rounded-lg border-2 transition-colors ${
              content && contentType !== 'pending'
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
                rows={6}
                className="border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              />
            </div>
            
            {content && contentType !== 'pending' && (
              <div className="flex items-start gap-2 text-xs px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded border">
                {contentType === 'automated' && (
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Check className="h-3.5 w-3.5 flex-shrink-0" />
                    <span><strong>Automatizado:</strong> {dataSource || 'Generado por el sistema'}</span>
                  </div>
                )}
                {contentType === 'hybrid' && (
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Check className="h-3.5 w-3.5 flex-shrink-0" />
                    <span><strong>Híbrido:</strong> Generado automáticamente y editado manualmente</span>
                  </div>
                )}
                {contentType === 'human' && (
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 flex-shrink-0" />
                    <span><strong>Manual:</strong> Escrito por el investigador</span>
                  </div>
                )}
              </div>
            )}
            
            {!content && (
              <Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-900 dark:text-amber-200">
                  Este ítem no tiene contenido aún. Puedes completarlo manualmente o usar el botón "Completar PRISMA Automáticamente" en la parte superior de la página.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {aiSuggestion && (
            <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <FileText className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Sugerencia metodológica</p>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{aiSuggestion}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}
    </Card>
  )
}
