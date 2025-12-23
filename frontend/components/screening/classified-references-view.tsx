"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, AlertCircle, Eye, ChevronDown, ChevronUp } from "lucide-react"
import type { Reference } from "@/lib/types"
import { useState } from "react"
import { ReferenceDetailDialog } from "./reference-detail-dialog"

interface ClassifiedReferencesViewProps {
  references: Reference[]
  onViewDetails?: (ref: Reference) => void
}

export function ClassifiedReferencesView({ references, onViewDetails }: ClassifiedReferencesViewProps) {
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['included', 'excluded', 'hybrid']))

  // Filtrar referencias válidas (no undefined/null)
  const validReferences = references.filter(r => r && r.id)

  // Clasificar referencias según el método
  const embeddingsOnly = validReferences.filter(r => {
    if (!r.aiReasoning) return false
    const reasoning = r.aiReasoning.toLowerCase()
    const hasEmbeddings = reasoning.includes('embeddings')
    const hasChatGPT = reasoning.includes('chatgpt')
    return hasEmbeddings && !hasChatGPT
  })

  const chatgptOnly = validReferences.filter(r => {
    if (!r.aiReasoning) return false
    const reasoning = r.aiReasoning.toLowerCase()
    const hasEmbeddings = reasoning.includes('embeddings')
    const hasChatGPT = reasoning.includes('chatgpt')
    return hasChatGPT && !hasEmbeddings
  })

  const hybrid = validReferences.filter(r => {
    if (!r.aiReasoning) return false
    const reasoning = r.aiReasoning.toLowerCase()
    const hasEmbeddings = reasoning.includes('embeddings')
    const hasChatGPT = reasoning.includes('chatgpt')
    return hasEmbeddings && hasChatGPT
  })

  // Dentro de cada grupo, separar por decisión
  const getGroupsByDecision = (refs: Reference[]) => {
    return {
      included: refs.filter(r => r.aiClassification === 'include'),
      excluded: refs.filter(r => r.aiClassification === 'exclude'),
      review: refs.filter(r => r.aiClassification === 'review' || !r.aiClassification)
    }
  }

  const embeddingsGroups = getGroupsByDecision(embeddingsOnly)
  const hybridGroups = getGroupsByDecision(hybrid)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const ReferenceCard = ({ reference, showMethod = false }: { reference: Reference, showMethod?: boolean }) => {
    // Validar que reference no sea undefined o null
    if (!reference) return null
    
    const confidence = reference.aiConfidenceScore ? Math.round(reference.aiConfidenceScore * 100) : 0
    const similarity = reference.screeningScore ? Math.round(reference.screeningScore * 100) : 0

    return (
      <div className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2 mb-1">{reference.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {Array.isArray(reference.authors) 
                ? reference.authors.slice(0, 2).join(', ') + (reference.authors.length > 2 ? ' et al.' : '')
                : reference.authors}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {showMethod && (
                <Badge variant="outline" className="text-[10px]">
                  {reference.aiReasoning?.includes('🧠 CHATGPT') ? '🔀 Híbrido' : '🤖 Embeddings'}
                </Badge>
              )}
              <Badge variant={reference.aiClassification === 'include' ? 'default' : 'destructive'} className="text-[10px]">
                {reference.aiClassification === 'include' ? '✅ Incluir' : '❌ Excluir'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {reference.aiReasoning?.includes('🧠 CHATGPT') ? `${confidence}% confianza` : `${similarity}% similitud`}
              </span>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setSelectedReference(reference)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const SectionCard = ({ 
    title, 
    icon: Icon, 
    count, 
    color, 
    refs, 
    sectionId,
    description 
  }: { 
    title: string
    icon: any
    count: number
    color: string
    refs: Reference[]
    sectionId: string
    description: string
  }) => {
    const isExpanded = expandedSections.has(sectionId)
    
    return (
      <Card className={`border-2 ${color}`}>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection(sectionId)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <CardTitle className="text-base">{title}</CardTitle>
              <Badge variant="secondary">{count}</Badge>
            </div>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            {refs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay referencias en esta categoría</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {refs.filter(ref => ref && ref.id).map(ref => (
                    <ReferenceCard key={ref.id} reference={ref} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Grupo 1: Alta Confianza con Embeddings (Incluir) */}
        <SectionCard
          sectionId="embeddings-include"
          title="🤖 Alta Confianza - INCLUIR (Embeddings)"
          icon={CheckCircle}
          count={embeddingsGroups.included.length}
          color="border-green-300 dark:border-green-700"
          refs={embeddingsGroups.included}
          description="Referencias con alta similitud semántica (>30%) clasificadas automáticamente como incluidas"
        />

        {/* Grupo 2: Alta Confianza con Embeddings (Excluir) */}
        <SectionCard
          sectionId="embeddings-exclude"
          title="🤖 Alta Confianza - EXCLUIR (Embeddings)"
          icon={XCircle}
          count={embeddingsGroups.excluded.length}
          color="border-red-300 dark:border-red-700"
          refs={embeddingsGroups.excluded}
          description="Referencias con baja similitud semántica (<10%) clasificadas automáticamente como excluidas"
        />

        {/* Grupo 3: Zona Gris Analizada por ChatGPT */}
        {(hybridGroups.included.length > 0 || hybridGroups.excluded.length > 0) && (
          <>
            <SectionCard
              sectionId="hybrid-include"
              title="🔀 Zona Gris - INCLUIR (Embeddings + ChatGPT)"
              icon={CheckCircle}
              count={hybridGroups.included.length}
              color="border-blue-300 dark:border-blue-700"
              refs={hybridGroups.included}
              description="Referencias de la zona gris (10-30% similitud) que ChatGPT clasificó como incluidas después de análisis detallado"
            />

            <SectionCard
              sectionId="hybrid-exclude"
              title="🔀 Zona Gris - EXCLUIR (Embeddings + ChatGPT)"
              icon={XCircle}
              count={hybridGroups.excluded.length}
              color="border-orange-300 dark:border-orange-700"
              refs={hybridGroups.excluded}
              description="Referencias de la zona gris (10-30% similitud) que ChatGPT clasificó como excluidas después de análisis detallado"
            />
          </>
        )}

        {/* Resumen Total */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{embeddingsGroups.included.length}</p>
                <p className="text-xs text-muted-foreground">Embeddings → Incluir</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{embeddingsGroups.excluded.length}</p>
                <p className="text-xs text-muted-foreground">Embeddings → Excluir</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{hybridGroups.included.length}</p>
                <p className="text-xs text-muted-foreground">ChatGPT → Incluir</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{hybridGroups.excluded.length}</p>
                <p className="text-xs text-muted-foreground">ChatGPT → Excluir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedReference && (
        <ReferenceDetailDialog
          reference={selectedReference}
          open={!!selectedReference}
          onOpenChange={(open) => !open && setSelectedReference(null)}
        />
      )}
    </>
  )
}
