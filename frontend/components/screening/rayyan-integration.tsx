"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  User,
  Calendar,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  AlertCircle
} from "lucide-react"
import type { Reference } from "@/lib/types"

interface RayyanIntegrationProps {
  projectId: string
  references: Reference[]
  onSyncComplete: () => void
}

export function RayyanIntegration({ projectId, references, onSyncComplete }: RayyanIntegrationProps) {
  const { toast } = useToast()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [decisions, setDecisions] = useState<Record<string, 'included' | 'excluded' | 'maybe'>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [currentNote, setCurrentNote] = useState("")

  // Filtrar solo referencias pendientes
  const pendingReferences = references.filter(ref => ref.status === 'pending')
  const currentReference = pendingReferences[currentIndex]
  const progress = (Object.keys(decisions).length / pendingReferences.length) * 100

  // Cargar nota del artículo actual
  useEffect(() => {
    if (currentReference) {
      setCurrentNote(notes[currentReference.id] || "")
    }
  }, [currentIndex, currentReference, notes])

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar si está escribiendo en textarea
      if (e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case 'i':
          handleDecision('included')
          break
        case 'e':
          handleDecision('excluded')
          break
        case 'm':
        case '?':
          handleDecision('maybe')
          break
        case 'arrowleft':
          goToPrevious()
          break
        case 'arrowright':
          goToNext()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, currentReference, currentNote])

  // Manejar decisión
  const handleDecision = async (decision: 'included' | 'excluded' | 'maybe') => {
    if (!currentReference) return

    try {
      // Guardar decisión localmente
      setDecisions(prev => ({ ...prev, [currentReference.id]: decision }))
      
      // Guardar nota si existe
      if (currentNote.trim()) {
        setNotes(prev => ({ ...prev, [currentReference.id]: currentNote }))
      }

      // TODO: Actualizar en backend
      // await apiClient.updateReferenceStatus(currentReference.id, { status: decision })

      toast({
        title: decision === 'included' ? '✓ Incluido' : decision === 'excluded' ? '✗ Excluido' : '? Revisar después',
        description: `Artículo marcado como ${decision}`,
      })

      // Avanzar al siguiente artículo automáticamente
      if (currentIndex < pendingReferences.length - 1) {
        setTimeout(() => setCurrentIndex(prev => prev + 1), 300)
      } else {
        toast({
          title: "¡Cribado completado!",
          description: `Has revisado ${pendingReferences.length} artículos`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la decisión",
        variant: "destructive",
      })
    }
  }

  // Navegar entre artículos
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < pendingReferences.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  // Si no hay referencias pendientes
  if (pendingReferences.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">¡No hay artículos pendientes!</h3>
          <p className="text-muted-foreground">
            Todos los artículos han sido revisados o no hay referencias en el proyecto.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Si no hay referencia actual (por seguridad)
  if (!currentReference) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error al cargar artículo</h3>
          <p className="text-muted-foreground">
            No se pudo cargar el artículo actual. Intenta recargar la página.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con progreso */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progreso del Cribado</span>
              <span className="text-muted-foreground">
                {Object.keys(decisions).length} de {pendingReferences.length} revisados
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                {Object.values(decisions).filter(d => d === 'included').length} incluidos
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                {Object.values(decisions).filter(d => d === 'excluded').length} excluidos
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                {Object.values(decisions).filter(d => d === 'maybe').length} por revisar
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        
        <div className="text-sm font-medium">
          Artículo {currentIndex + 1} de {pendingReferences.length}
        </div>
        
        <Button
          variant="outline"
          onClick={goToNext}
          disabled={currentIndex === pendingReferences.length - 1}
        >
          Siguiente
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Contenido del artículo */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl leading-tight mb-3">
                {currentReference.title}
              </CardTitle>
              {decisions[currentReference.id] && (
                <Badge 
                  variant="outline" 
                  className={
                    decisions[currentReference.id] === 'included' 
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : decisions[currentReference.id] === 'excluded'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }
                >
                  {decisions[currentReference.id] === 'included' && '✓ Incluido'}
                  {decisions[currentReference.id] === 'excluded' && '✗ Excluido'}
                  {decisions[currentReference.id] === 'maybe' && '? Por revisar'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Metadatos */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-1">Autores</div>
                <div className="text-sm">
                  {Array.isArray(currentReference.authors) 
                    ? currentReference.authors.join('; ')
                    : currentReference.authors || 'No especificado'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-1">Año</div>
                <div className="text-sm">{currentReference.year || 'No especificado'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-1">Fuente</div>
                <div className="text-sm">{currentReference.source || 'No especificado'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-1">Estado</div>
                <Badge variant="secondary">
                  {currentReference.status === 'pending' ? 'Pendiente' : currentReference.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">Resumen</h4>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed">
              {currentReference.abstract || 'No hay resumen disponible para este artículo.'}
            </div>
          </div>

          {/* DOI/URL */}
          {currentReference.doi && (
            <div className="flex items-center gap-2 text-sm">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">DOI:</span>
              <a 
                href={`https://doi.org/${currentReference.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {currentReference.doi}
              </a>
            </div>
          )}

          {/* Notas */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Notas de revisión</h4>
            </div>
            <Textarea
              placeholder="Añade notas sobre este artículo (opcional)..."
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Botones de decisión */}
      <Card className="border-2 bg-muted/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <Button
              size="lg"
              onClick={() => handleDecision('included')}
              className="h-16 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">Incluir</span>
                <span className="text-xs opacity-90">Relevante para la revisión</span>
              </div>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => handleDecision('maybe')}
              className="h-16 border-2 border-yellow-500 hover:bg-yellow-50"
            >
              <HelpCircle className="mr-2 h-5 w-5 text-yellow-600" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">Revisar después</span>
                <span className="text-xs text-muted-foreground">Necesita más análisis</span>
              </div>
            </Button>

            <Button
              size="lg"
              onClick={() => handleDecision('excluded')}
              className="h-16 bg-red-600 hover:bg-red-700 text-white"
            >
              <XCircle className="mr-2 h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">Excluir</span>
                <span className="text-xs opacity-90">No cumple criterios</span>
              </div>
            </Button>
          </div>

          {/* Atajos de teclado */}
          <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
            <span className="font-medium">Atajos:</span> 
            <kbd className="mx-1 px-2 py-1 bg-muted rounded">←</kbd> Anterior
            <kbd className="mx-1 px-2 py-1 bg-muted rounded">→</kbd> Siguiente
            <kbd className="mx-1 px-2 py-1 bg-muted rounded">I</kbd> Incluir
            <kbd className="mx-1 px-2 py-1 bg-muted rounded">E</kbd> Excluir
            <kbd className="mx-1 px-2 py-1 bg-muted rounded">M</kbd> Revisar
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
