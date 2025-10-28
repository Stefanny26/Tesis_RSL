"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { PrismaItem } from "@/lib/prisma-items"
import { CheckCircle, Sparkles, Lightbulb } from "lucide-react"

interface PrismaItemCardProps {
  item: PrismaItem
  isCompleted: boolean
  content: string
  aiSuggestion?: string
  onToggleComplete: () => void
  onContentChange: (content: string) => void
  onRequestAISuggestion: () => void
}

export function PrismaItemCard({
  item,
  isCompleted,
  content,
  aiSuggestion,
  onToggleComplete,
  onContentChange,
  onRequestAISuggestion,
}: PrismaItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={isCompleted ? "border-green-200 bg-green-50/50" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox checked={isCompleted} onCheckedChange={onToggleComplete} className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base">
                  Ítem {item.id}: {item.item}
                </CardTitle>
                {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
              </div>
              <CardDescription className="text-sm">{item.description}</CardDescription>
              <Badge variant="outline" className="mt-2">
                {item.location}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Contenido del Artículo</label>
            <Textarea
              placeholder="Ingrese el contenido correspondiente a este ítem de su artículo..."
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={4}
            />
          </div>

          {aiSuggestion && (
            <Alert className="bg-blue-50 border-blue-200">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <p className="font-medium text-blue-900 mb-1">Sugerencia de IA:</p>
                <p className="text-sm text-blue-800">{aiSuggestion}</p>
              </AlertDescription>
            </Alert>
          )}

          <Button variant="outline" size="sm" onClick={onRequestAISuggestion}>
            <Sparkles className="mr-2 h-4 w-4" />
            Obtener Sugerencia de IA
          </Button>
        </CardContent>
      )}

      <div className="px-6 pb-4">
        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="w-full">
          {isExpanded ? "Ocultar Detalles" : "Mostrar Detalles"}
        </Button>
      </div>
    </Card>
  )
}
