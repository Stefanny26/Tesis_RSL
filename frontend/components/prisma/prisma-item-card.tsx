"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ContentTypeBadge } from "./content-type-badge"
import type { PrismaItem, PrismaItemData } from "@/lib/prisma-items"
import { CheckCircle, Sparkles, Lightbulb, ChevronDown, ChevronUp, FileText, MapPin } from "lucide-react"

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
      className={`transition-all duration-200 ${
        isCompleted 
          ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10" 
          : "border-muted hover:border-primary/50"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox 
              checked={isCompleted} 
              onCheckedChange={onToggleComplete} 
              className="mt-1.5 h-5 w-5" 
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-2 flex-wrap">
                <Badge 
                  variant="outline" 
                  className={`font-mono text-xs ${isCompleted ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-950 dark:border-green-800' : ''}`}
                >
                  Item {item.id}
                </Badge>
                <CardTitle className="text-base leading-tight flex-1">
                  {item.item}
                </CardTitle>
                {isCompleted && (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 animate-in fade-in duration-300" />
                )}
              </div>
              
              <CardDescription className="text-sm leading-relaxed">
                {item.description}
              </CardDescription>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {item.location}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {item.section}
                </Badge>
                <ContentTypeBadge 
                  contentType={contentType}
                  dataSource={dataSource}
                />
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Contenido del Artículo</label>
            </div>
            
            <div className={`rounded-lg border-2 transition-colors ${
              content && contentType !== 'pending'
                ? contentType === 'automated' 
                  ? "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
                  : contentType === 'hybrid'
                  ? "border-purple-200 bg-purple-50/50 dark:bg-purple-950/20"
                  : "border-green-200 bg-green-50/50 dark:bg-green-950/20"
                : "border-dashed border-muted"
            }`}>
              <Textarea
                placeholder="El contenido se generará automáticamente desde datos del protocolo, o puede editarse manualmente..."
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                rows={6}
                className="border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            
            {content && contentType !== 'pending' && (
              <div className="flex items-center gap-2 text-xs">
                {contentType === 'automated' && (
                  <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Generado automáticamente desde: {dataSource || 'sistema'}
                  </span>
                )}
                {contentType === 'hybrid' && (
                  <span className="text-purple-700 dark:text-purple-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Generado automáticamente y editado manualmente
                  </span>
                )}
                {contentType === 'human' && (
                  <span className="text-green-700 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Escrito manualmente por el investigador
                  </span>
                )}
              </div>
            )}
          </div>

          {aiSuggestion && (
            <Alert className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/20 dark:to-indigo-950/10">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Sugerencia metodológica:</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{aiSuggestion}</p>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRequestAISuggestion}
            className="w-full sm:w-auto"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Obtener Sugerencia Metodológica
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
