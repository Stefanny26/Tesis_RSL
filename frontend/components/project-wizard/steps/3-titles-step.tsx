"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, RefreshCw, CheckCircle2, Languages } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

export function TitlesStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [translations, setTranslations] = useState<{ [key: number]: string }>({})
  const [translating, setTranslating] = useState<{ [key: number]: boolean }>({})

  const handleGenerateTitles = async () => {
    if (!data.pico.population || !data.pico.intervention) {
      toast({
        title: "Información incompleta",
        description: "Completa el marco PICO en el paso anterior",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      toast({
        title: "Generando títulos...",
        description: `Usando ${data.aiProvider === 'chatgpt' ? 'ChatGPT' : 'Gemini'} para crear 5 opciones...`
      })

      const result = await apiClient.generateTitles(
        data.matrixIsNot,
        data.pico,
        data.aiProvider
      )

      console.log('📥 Respuesta del backend:', result)
      console.log('📝 Títulos recibidos:', result?.titles)

      if (result && result.titles) {
        const titles = result.titles.map((t: any) => ({
          title: t.title,
          justification: t.reasoning || t.justification || "",
          cochraneCompliance: t.cochraneCompliance || "partial"
        }))

        console.log('✅ Títulos procesados:', titles)

        updateData({ generatedTitles: titles })

        toast({
          title: "✅ Títulos generados",
          description: `${titles.length} opciones creadas. Selecciona la que más te guste o edítala.`
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar los títulos",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectTitle = (index: number) => {
    setSelectedIndex(index)
    updateData({ selectedTitle: data.generatedTitles[index].title })
  }

  const handleTranslate = async (index: number, text: string) => {
    if (translations[index]) {
      // Si ya está traducido, limpiamos la traducción para mostrar el original
      setTranslations(prev => {
        const newTranslations = { ...prev }
        delete newTranslations[index]
        return newTranslations
      })
      return
    }

    setTranslating(prev => ({ ...prev, [index]: true }))
    
    try {
      // Usar MyMemory Translation API (gratuita, sin API key)
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.responseData && data.responseData.translatedText) {
        setTranslations(prev => ({ ...prev, [index]: data.responseData.translatedText }))
        toast({
          title: "✅ Título traducido",
          description: "Haz clic nuevamente para ver el original",
        })
      } else {
        throw new Error('No se recibió traducción')
      }
    } catch (error) {
      console.error('Error traduciendo:', error)
      toast({
        title: "Error al traducir",
        description: "Intenta nuevamente en unos segundos",
        variant: "destructive"
      })
    } finally {
      setTranslating(prev => ({ ...prev, [index]: false }))
    }
  }

  const getComplianceBadge = (compliance: string) => {
    const variants = {
      full: { label: "Cochrane ✓", variant: "default" as const, className: "bg-green-600" },
      partial: { label: "Parcial", variant: "secondary" as const, className: "" },
      none: { label: "Básico", variant: "outline" as const, className: "" }
    }
    const config = variants[compliance as keyof typeof variants] || variants.partial
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">Generación de Títulos</h2>
        <p className="text-lg text-muted-foreground">
          La IA generará 5 títulos académicos según criterios Cochrane Review
        </p>
      </div>

      {/* Generate Button */}
      {data.generatedTitles.length === 0 && (
        <Card className="border-primary/30 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle>Generar Títulos con IA</CardTitle>
            <CardDescription>
              Basado en tu marco PICO y matriz Es/No Es, la IA creará 5 opciones de títulos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateTitles}
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generando 5 títulos...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generar Títulos
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Titles */}
      {data.generatedTitles.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Selecciona un título</h3>
            <Button
              variant="outline"
              onClick={handleGenerateTitles}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Regenerar
            </Button>
          </div>

          <RadioGroup value={String(selectedIndex)} onValueChange={(v) => handleSelectTitle(Number(v))}>
            <div className="space-y-4">
              {data.generatedTitles.map((titleData, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all ${
                    selectedIndex === index
                      ? 'border-primary border-2 shadow-lg'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectTitle(index)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={String(index)} id={`title-${index}`} className="mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Label htmlFor={`title-${index}`} className="text-lg font-semibold leading-tight cursor-pointer flex-1">
                            {translations[index] || titleData.title}
                          </Label>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTranslate(index, titleData.title)
                              }}
                              disabled={translating[index]}
                              className="h-8 w-8 p-0"
                            >
                              {translating[index] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Languages className={`h-4 w-4 ${translations[index] ? 'text-primary' : ''}`} />
                              )}
                            </Button>
                            {selectedIndex === index && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Opción {index + 1}</Badge>
                          {getComplianceBadge(titleData.cochraneCompliance)}
                          {translations[index] && (
                            <Badge variant="secondary" className="text-xs">
                              🇪🇸 Traducido
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Justificación:</p>
                      <p className="text-sm">{titleData.justification}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RadioGroup>

          {/* Custom Title Editor */}
          {selectedIndex >= 0 && (
            <Card className="border-primary/50 bg-blue-50/30">
              <CardHeader>
                <CardTitle>Editar título seleccionado</CardTitle>
                <CardDescription>
                  Puedes modificar el título según tus necesidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={data.selectedTitle}
                  onChange={(e) => updateData({ selectedTitle: e.target.value })}
                  rows={3}
                  className="text-lg font-semibold"
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
