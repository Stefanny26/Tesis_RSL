"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"

interface PrismaItem {
  id: string
  project_id: string
  item_number?: number
  itemNumber?: number
  section: string
  completed: boolean
  content: string | null
  content_type: 'automated' | 'human' | 'hybrid' | 'pending'
  data_source: string | null
  automated_content: string | null
  last_human_edit: string | null
  ai_validated: boolean
  ai_suggestions: string | null
}

const PRISMA_ITEM_NAMES: Record<number, string> = {
  1: "Título del estudio",
  2: "Resumen estructurado",
  3: "Justificación",
  4: "Objetivos",
  5: "Criterios de elegibilidad",
  6: "Fuentes de información",
  7: "Estrategia de búsqueda",
  8: "Proceso de selección",
  9: "Recolección de datos",
  10: "Lista de datos",
  11: "Riesgo de sesgo",
  12: "Medidas de efecto",
  13: "Métodos de síntesis",
  14: "Sesgo de reporte",
  15: "Evaluación de certeza",
  16: "Selección de estudios",
  17: "Características de estudios",
  18: "Riesgo de sesgo en estudios",
  19: "Resultados individuales",
  20: "Resultados de síntesis",
  21: "Sesgo de reporte (resultados)",
  22: "Certeza de evidencia",
  23: "Interpretación y discusión",
  24: "Registro y protocolo",
  25: "Financiamiento",
  26: "Conflictos de interés",
  27: "Disponibilidad de datos"
}

const PRISMA_SECTIONS = {
  "TÍTULO": [1],
  "RESUMEN": [2],
  "INTRODUCCIÓN": [3, 4],
  "MÉTODOS": [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  "RESULTADOS": [16, 17, 18, 19, 20, 21, 22],
  "DISCUSIÓN": [23],
  "OTRA INFORMACIÓN": [24, 25, 26, 27]
}

interface PrismaPreviewDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrismaPreviewDialog({ projectId, open, onOpenChange }: PrismaPreviewDialogProps) {
  const [items, setItems] = useState<PrismaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadPrismaItems()
    }
  }, [open, projectId])

  async function loadPrismaItems() {
    try {
      setLoading(true)
      const response = await apiClient.request(`/api/projects/${projectId}/prisma`, { method: 'GET' })
      console.log('PRISMA Response:', response)
      
      if (response.success && response.data) {
        setItems(response.data.items || [])
      }
    } catch (error) {
      console.error('Error loading PRISMA items:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // Agrupar items por sección usando PRISMA_SECTIONS
  const groupedItems: Record<string, PrismaItem[]> = {}
  Object.entries(PRISMA_SECTIONS).forEach(([sectionName, itemNumbers]) => {
    groupedItems[sectionName] = items.filter(item => {
      const itemNum = item.item_number || item.itemNumber
      return itemNumbers.includes(itemNum as number)
    })
  })

  // Calcular estadísticas
  const totalItems = items.length
  const completedItems = items.filter(i => i.completed).length
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const sections = [
    { key: 'TÍTULO', label: 'Título' },
    { key: 'RESUMEN', label: 'Resumen' },
    { key: 'INTRODUCCIÓN', label: 'Introducción' },
    { key: 'MÉTODOS', label: 'Métodos' },
    { key: 'RESULTADOS', label: 'Resultados' },
    { key: 'DISCUSIÓN', label: 'Discusión' },
    { key: 'OTRA INFORMACIÓN', label: 'Otra Información' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[75vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle className="text-xl">Checklist PRISMA 2020</DialogTitle>
              <DialogDescription className="mt-1">
                Verificación de completitud del artículo científico
              </DialogDescription>
            </div>
            <Badge 
              variant={completionPercentage === 100 ? "default" : "secondary"} 
              className="text-sm px-3 py-1"
            >
              {completedItems}/{totalItems} ({completionPercentage}%)
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Accordion type="single" collapsible className="w-full">
                {sections.map(section => {
                  const sectionItems = groupedItems[section.key] || []
                  if (sectionItems.length === 0) return null

                  const sectionCompleted = sectionItems.filter(i => i.completed).length
                  const sectionTotal = sectionItems.length
                  const sectionPercentage = Math.round((sectionCompleted / sectionTotal) * 100)

                  return (
                    <AccordionItem key={section.key} value={section.key}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium text-base">{section.label}</span>
                          <Badge 
                            variant={sectionPercentage === 100 ? "default" : "outline"} 
                            className="ml-2"
                          >
                            {sectionCompleted}/{sectionTotal}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-3">
                          {sectionItems.map(item => {
                            const itemNum = item.item_number || item.itemNumber || 0
                            const itemName = PRISMA_ITEM_NAMES[itemNum] || `Ítem ${itemNum}`
                            const contentType = item.content_type === 'automated' ? 'Automático' :
                                              item.content_type === 'human' ? 'Manual' :
                                              item.content_type === 'hybrid' ? 'Híbrido' : 'Pendiente'
                            
                            return (
                              <div 
                                key={item.id} 
                                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                              >
                                {item.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-muted-foreground">
                                      Ítem #{itemNum}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {contentType}
                                    </Badge>
                                  </div>
                                  <p className="text-sm font-medium text-foreground mb-1">
                                    {itemName}
                                  </p>
                                  {item.content && (
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {item.content}
                                    </p>
                                  )}
                                  {item.data_source && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                                      <span>📍</span>
                                      <span>Fuente: {item.data_source}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>

              {completionPercentage === 100 && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      ¡Checklist Completado!
                    </p>
                    <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                      Tu artículo cumple con todos los ítems del checklist PRISMA 2020.
                    </p>
                  </div>
                </div>
              )}

              {completionPercentage < 100 && completionPercentage > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Progreso del Checklist
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                      Completa los ítems faltantes para cumplir con las directrices PRISMA 2020.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
