"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Sparkles, Wand2, Info } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface AIGeneratorPanelProps {
  onGenerateDraft: (section: string) => void
  onGenerateFullArticle: () => void
}

export function AIGeneratorPanel({ onGenerateDraft, onGenerateFullArticle }: AIGeneratorPanelProps) {
  const [selectedSection, setSelectedSection] = useState("abstract")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleGenerateSection = async () => {
    setIsGenerating(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          onGenerateDraft(selectedSection)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleGenerateFull = async () => {
    setIsGenerating(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          onGenerateFullArticle()
          return 100
        }
        return prev + 5
      })
    }, 500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Generador con IA
        </CardTitle>
        <CardDescription>Genera borradores automáticamente usando inteligencia artificial</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            La IA utilizará tu protocolo PICO, referencias incluidas y checklist PRISMA para generar contenido académico
            de alta calidad.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Generar Sección Individual</Label>
            <Select value={selectedSection} onValueChange={setSelectedSection} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abstract">Resumen</SelectItem>
                <SelectItem value="introduction">Introducción</SelectItem>
                <SelectItem value="methods">Métodos</SelectItem>
                <SelectItem value="results">Resultados</SelectItem>
                <SelectItem value="discussion">Discusión</SelectItem>
                <SelectItem value="conclusions">Conclusiones</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerateSection}
              disabled={isGenerating}
              className="w-full bg-transparent"
              variant="outline"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generar Sección
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Generar Artículo Completo</Label>
            <Button onClick={handleGenerateFull} disabled={isGenerating} className="w-full">
              <Wand2 className="mr-2 h-4 w-4" />
              Generar Borrador Completo
            </Button>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generando contenido...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="text-xs font-medium">Modelo de IA</p>
          <p className="text-xs text-muted-foreground">Gemini 1.5 Pro (vía Vercel AI Gateway)</p>
        </div>
      </CardContent>
    </Card>
  )
}
