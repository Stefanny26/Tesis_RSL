"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Check, 
  X, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  FileText,
  Calendar,
  Users,
  BookOpen,
  Tag,
  AlertCircle,
  Keyboard,
  Clock,
  TrendingUp
} from "lucide-react"
import type { Reference } from "@/lib/types"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface KeyTerms {
  technology?: string[]
  domain?: string[]
  studyType?: string[]
  themes?: string[]
}

interface IndividualReviewProps {
  references: Reference[]
  keyTerms?: KeyTerms
  onStatusChange: (id: string, status: Reference["status"], exclusionReason?: string) => void
}

/**
 * Resalta términos clave en un texto
 */
function highlightTerms(text: string, terms: string[]): React.ReactNode {
  if (!text || terms.length === 0) return text

  // Crear regex que capture todos los términos (case-insensitive)
  const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi')
  
  const parts = text.split(regex)
  
  return parts.map((part, i) => {
    const isMatch = terms.some(term => 
      part.toLowerCase() === term.toLowerCase()
    )
    if (isMatch) {
      return (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded font-medium">
          {part}
        </mark>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function IndividualReviewEnhanced({ references, keyTerms, onStatusChange }: IndividualReviewProps) {
  const { toast } = useToast()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [exclusionReason, setExclusionReason] = useState("")
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [reviewStartTime, setReviewStartTime] = useState<number>(Date.now())
  const [reviewedCount, setReviewedCount] = useState(0)

  // Calcular todos los términos para resaltar
  const allKeyTerms = [
    ...(keyTerms?.technology || []),
    ...(keyTerms?.domain || []),
    ...(keyTerms?.studyType || []),
    ...(keyTerms?.themes || [])
  ]

  // Filtrar solo referencias pendientes
  const pendingRefs = references.filter(ref => ref.status === "pending")
  const currentRef = pendingRefs[currentIndex]

  // Calcular estadísticas de velocidad
  const elapsedMinutes = (Date.now() - reviewStartTime) / 60000
  const reviewSpeed = reviewedCount > 0 ? reviewedCount / elapsedMinutes : 0
  const remaining = pendingRefs.length - currentIndex - 1
  const estimatedMinutes = reviewSpeed > 0 ? remaining / reviewSpeed : 0

  const handleNext = useCallback(() => {
    if (currentIndex < pendingRefs.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setExclusionReason("")
    }
  }, [currentIndex, pendingRefs.length])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setExclusionReason("")
    }
  }, [currentIndex])

  const handleInclude = useCallback(async () => {
    if (currentRef) {
      try {
        await onStatusChange(currentRef.id, "included")
        setReviewedCount(prev => prev + 1)
        if (currentIndex < pendingRefs.length - 1) {
          setTimeout(() => handleNext(), 150)
        }
        toast({
          title: "Incluido",
          description: "Referencia marcada como incluida",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado",
          variant: "destructive"
        })
      }
    }
  }, [currentRef, currentIndex, pendingRefs.length, handleNext, onStatusChange, toast])

  const handleExclude = useCallback(async () => {
    if (currentRef) {
      try {
        await onStatusChange(currentRef.id, "excluded")
        setReviewedCount(prev => prev + 1)
        setExclusionReason("")
        if (currentIndex < pendingRefs.length - 1) {
          setTimeout(() => handleNext(), 150)
        }
        toast({
          title: "Excluido",
          description: "Referencia marcada como excluida",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado",
          variant: "destructive"
        })
      }
    }
  }, [currentRef, currentIndex, pendingRefs.length, handleNext, onStatusChange, toast])

  const handleExcludeWithReason = useCallback(async () => {
    if (currentRef && exclusionReason.trim()) {
      try {
        await onStatusChange(currentRef.id, "excluded", exclusionReason.trim())
        setReviewedCount(prev => prev + 1)
        setExclusionReason("")
        if (currentIndex < pendingRefs.length - 1) {
          setTimeout(() => handleNext(), 150)
        }
        toast({
          title: "Excluido con razón",
          description: "Referencia excluida y razón guardada",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado",
          variant: "destructive"
        })
      }
    }
  }, [currentRef, exclusionReason, currentIndex, pendingRefs.length, handleNext, onStatusChange, toast])

  const handleMaybe = useCallback(async () => {
    if (currentRef) {
      try {
        await onStatusChange(currentRef.id, "maybe")
        setReviewedCount(prev => prev + 1)
        if (currentIndex < pendingRefs.length - 1) {
          setTimeout(() => handleNext(), 150)
        }
        toast({
          title: "Marcado como 'Quizás'",
          description: "Referencia requiere revisión adicional",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado",
          variant: "destructive"
        })
      }
    }
  }, [currentRef, currentIndex, pendingRefs.length, handleNext, onStatusChange, toast])

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar si está escribiendo en un input/textarea
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'i':
          handleInclude()
          break
        case 'e':
          handleExclude()
          break
        case 'm':
          handleMaybe()
          break
        case 'arrowleft':
          handlePrevious()
          break
        case 'arrowright':
          handleNext()
          break
        case '?':
          setShowShortcuts(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleInclude, handleExclude, handleMaybe, handleNext, handlePrevious])

  if (!currentRef) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">¡Revisión completada!</h3>
          <p className="text-muted-foreground mb-4">
            Todas las referencias pendientes han sido revisadas.
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Referencias revisadas: {reviewedCount}</p>
            <p>Velocidad promedio: {reviewSpeed.toFixed(1)} refs/min</p>
            <p>Tiempo total: {elapsedMinutes.toFixed(0)} minutos</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Keyboard Shortcuts Alert */}
      {showShortcuts && (
        <Alert>
          <Keyboard className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Atajos de teclado:</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><kbd className="px-2 py-1 bg-muted rounded">I</kbd> Incluir</div>
              <div><kbd className="px-2 py-1 bg-muted rounded">E</kbd> Excluir</div>
              <div><kbd className="px-2 py-1 bg-muted rounded">M</kbd> Quizás</div>
              <div><kbd className="px-2 py-1 bg-muted rounded">←</kbd> Anterior</div>
              <div><kbd className="px-2 py-1 bg-muted rounded">→</kbd> Siguiente</div>
              <div><kbd className="px-2 py-1 bg-muted rounded">?</kbd> Ocultar atajos</div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Progreso</div>
            <div className="text-2xl font-bold">
              {currentIndex + 1}/{pendingRefs.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Velocidad</div>
              <div className="text-xl font-bold">{reviewSpeed.toFixed(1)}/min</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Revisadas</div>
              <div className="text-xl font-bold">{reviewedCount}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Tiempo estimado</div>
            <div className="text-xl font-bold">
              {estimatedMinutes > 0 ? `${Math.ceil(estimatedMinutes)}min` : '--'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === pendingRefs.length - 1}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcuts(!showShortcuts)}
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Atajos
          </Button>
          {currentRef?.url && (
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a href={currentRef.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver artículo
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Article Details */}
      <Card>
        <CardContent className="p-6">
          <ScrollArea className="h-[calc(100vh-500px)]">
            <div className="space-y-6 pr-4">
              {/* Título con resaltado */}
              <div>
                <h2 className="text-2xl font-bold mb-2 leading-relaxed">
                  {highlightTerms(currentRef.title, allKeyTerms)}
                </h2>
                {currentRef.status && currentRef.status !== "pending" && (
                  <Badge variant="secondary" className="mb-4">
                    {currentRef.status}
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Autores</p>
                    <p className="text-muted-foreground">
                      {Array.isArray(currentRef.authors) 
                        ? currentRef.authors.join(", ") 
                        : currentRef.authors}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Año</p>
                    <p className="text-muted-foreground">{currentRef.year || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Fuente</p>
                    <p className="text-muted-foreground">{currentRef.source || currentRef.database || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">DOI</p>
                    {currentRef.doi ? (
                      <a
                        href={`https://doi.org/${currentRef.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {currentRef.doi}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-muted-foreground">N/A</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Abstract con resaltado */}
              {currentRef.abstract && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Abstract
                  </h3>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {highlightTerms(currentRef.abstract, allKeyTerms)}
                  </div>
                </div>
              )}

              {/* Keywords con resaltado */}
              {currentRef.keywords && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentRef.keywords.split(/[,;]/).map((keyword, i) => {
                      const kw = keyword.trim()
                      const isKeyTerm = allKeyTerms.some(term => 
                        kw.toLowerCase().includes(term.toLowerCase())
                      )
                      return (
                        <Badge 
                          key={i} 
                          variant={isKeyTerm ? "default" : "outline"}
                          className={isKeyTerm ? "bg-yellow-100 text-yellow-900 border-yellow-300" : ""}
                        >
                          {kw}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Main Actions */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleInclude}
                className="flex-1 text-green-700 hover:bg-green-50 hover:text-green-800 border-green-300 hover:border-green-400"
              >
                <Check className="h-5 w-5 mr-2" />
                Incluir <kbd className="ml-2 px-2 py-0.5 bg-muted rounded text-xs">I</kbd>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleMaybe}
                className="flex-1 text-orange-600 hover:bg-orange-50 hover:text-orange-700 border-orange-300 hover:border-orange-400"
              >
                <HelpCircle className="h-5 w-5 mr-2" />
                Quizás <kbd className="ml-2 px-2 py-0.5 bg-muted rounded text-xs">M</kbd>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleExclude}
                className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                <X className="h-5 w-5 mr-2" />
                Excluir <kbd className="ml-2 px-2 py-0.5 bg-muted rounded text-xs">E</kbd>
              </Button>
            </div>

            {/* Exclusion Reason */}
            <div className="flex items-center gap-2">
              <Textarea
                placeholder="Razón de exclusión (opcional)..."
                value={exclusionReason}
                onChange={(e) => setExclusionReason(e.target.value)}
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey && exclusionReason.trim()) {
                    handleExcludeWithReason()
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={handleExcludeWithReason}
                disabled={!exclusionReason.trim()}
                className="whitespace-nowrap h-[60px]"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Excluir<br/>con razón
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
