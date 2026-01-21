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
  disabled?: boolean
  isGenerating?: boolean
}

export function AIGeneratorPanel({ 
  onGenerateDraft, 
  onGenerateFullArticle, 
  disabled = false,
  isGenerating: externalIsGenerating = false
}: AIGeneratorPanelProps) {
  const [selectedSection, setSelectedSection] = useState("abstract")
  const isGenerating = externalIsGenerating

  const handleGenerateSection = async () => {
    onGenerateDraft(selectedSection)
  }

  const handleGenerateFull = async () => {
    onGenerateFullArticle()
  }

  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-1 text-sm">
          <Wand2 className="h-3.5 w-3.5" />
          Generador con IA
        </CardTitle>
        <CardDescription className="text-[11px]">Genera borradores automáticamente usando inteligencia artificial</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3">
        <Alert className="py-1.5">
          <Info className="h-3 w-3" />
          <AlertDescription className="text-[11px] leading-tight">
            La IA utilizará tu protocolo PICO, referencias incluidas y checklist PRISMA para generar contenido académico
            de alta calidad.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Generar Artículo Completo</Label>
            <Button onClick={handleGenerateFull} disabled={isGenerating || disabled} className="w-full text-xs h-8">
              <Wand2 className="mr-1.5 h-3.5 w-3.5" />
              Generar Borrador Completo
            </Button>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generando contenido con IA...</span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="text-xs font-medium">Modelo de IA</p>
          <p className="text-xs text-muted-foreground">ChatGPT 4 (OpenAI)</p>
        </div>
      </CardContent>
    </Card>
  )
}
