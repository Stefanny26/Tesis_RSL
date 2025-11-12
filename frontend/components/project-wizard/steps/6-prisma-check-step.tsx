"use client"

import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

const PRISMA_ITEMS_WPOM = [
  { number: 1, item: "Título identifica el estudio como revisión sistemática", stage: "title" },
  { number: 2, item: "Se describe la justificación de la revisión", stage: "background" },
  { number: 3, item: "Se proporciona declaración explícita usando PICOS", stage: "pico" },
  { number: 4, item: "Se especifica y justifica la estrategia de búsqueda", stage: "search" },
  { number: 5, item: "Se identifican criterios de inclusión y exclusión", stage: "criteria" },
  { number: 6, item: "Se describen todas las fuentes de información", stage: "search" },
  { number: 7, item: "Se presenta la estrategia electrónica completa", stage: "search" },
  { number: 8, item: "Se describe el proceso de selección de estudios", stage: "screening" },
  { number: 9, item: "Se define el proceso de extracción de datos", stage: "extraction" },
  { number: 10, item: "Se lista los datos extraídos de cada estudio", stage: "extraction" },
  { number: 11, item: "Se describe el método de síntesis", stage: "synthesis" },
  { number: 12, item: "Se presenta diagrama de flujo PRISMA", stage: "screening" },
  { number: 13, item: "Cumplimiento general PRISMA/WPOM", stage: "all" }
]

export function PrismaCheckStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  const [compliance, setCompliance] = useState(0)
  const [hasAutoEvaluated, setHasAutoEvaluated] = useState(false)

  // Auto-evaluar cuando el componente se monta por primera vez
  useEffect(() => {
    if (data.prismaItems.length === 0) {
      // Inicializar items
      const initialItems = PRISMA_ITEMS_WPOM.map(item => ({
        ...item,
        complies: null,
        evidence: ""
      }))
      updateData({ prismaItems: initialItems })
    } else if (!hasAutoEvaluated && data.prismaItems.some(item => item.complies === null)) {
      // Si hay items sin evaluar, auto-evaluar automáticamente sin mostrar toast
      handleAutoEvaluate(false)
      setHasAutoEvaluated(true)
    } else {
      // Calcular porcentaje de cumplimiento
      const completed = data.prismaItems.filter(item => item.complies === true).length
      setCompliance(Math.round((completed / data.prismaItems.length) * 100))
    }
  }, [data.prismaItems])

  const handleAutoEvaluate = (showToast = true) => {
    const autoEvaluated = data.prismaItems.map(item => {
      let complies: boolean | null = null
      let evidence = item.evidence

      switch (item.stage) {
        case 'title':
          complies = !!data.selectedTitle
          evidence = complies ? `Título definido: ${data.selectedTitle}` : "Falta título"
          break
        case 'pico':
          complies = !!(data.pico.population && data.pico.intervention)
          evidence = complies ? "Marco PICO completado en Paso 2" : "PICO incompleto"
          break
        case 'search':
          complies = data.searchPlan.databases.length > 0
          evidence = complies ? `${data.searchPlan.databases.length} bases de datos definidas` : "Falta estrategia"
          break
        case 'criteria':
          complies = data.inclusionCriteria.length > 0 && data.exclusionCriteria.length > 0
          evidence = complies ? `${data.inclusionCriteria.length} criterios inclusión, ${data.exclusionCriteria.length} criterios exclusión` : "Criterios incompletos"
          break
        case 'screening':
          // Ahora verificamos definiciones de protocolo en lugar de screening
          complies = (data.protocolDefinition?.technologies.length || 0) > 0
          evidence = complies ? `Definiciones de protocolo completadas` : "Sin definiciones de protocolo"
          break
        default:
          complies = false
          evidence = "Pendiente de completar"
      }

      return { ...item, complies, evidence }
    })

    updateData({ prismaItems: autoEvaluated })
    
    if (showToast) {
      toast({
        title: "✅ Auto-evaluación completada",
        description: "Revisa y ajusta las evidencias según necesites"
      })
    }
  }

  const updateItemCompliance = (index: number, complies: boolean) => {
    const newItems = [...data.prismaItems]
    newItems[index].complies = complies
    updateData({ prismaItems: newItems })
  }

  const updateItemEvidence = (index: number, evidence: string) => {
    const newItems = [...data.prismaItems]
    newItems[index].evidence = evidence
    updateData({ prismaItems: newItems })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">Verificación PRISMA/WPOM</h2>
        <p className="text-lg text-muted-foreground">
          Checklist de 13 ítems de calidad para revisiones sistemáticas
        </p>
      </div>

      {/* Progress Card */}
      <Card className="border-primary/30 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Progreso de Cumplimiento</CardTitle>
            <Badge variant="outline" className="text-lg px-4 py-1">
              {compliance}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={compliance} className="h-3" />
          <Button onClick={() => handleAutoEvaluate(true)} size="lg" className="w-full">
            <Sparkles className="h-5 w-5 mr-2" />
            Auto-evaluar con datos del wizard
          </Button>
        </CardContent>
      </Card>

      {/* PRISMA Items */}
      <div className="space-y-3">
        {data.prismaItems.map((item, index) => (
          <Card key={item.number} className={
            item.complies === true ? "border-green-500 bg-green-50/30" :
            item.complies === false ? "border-red-500 bg-red-50/30" :
            ""
          }>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant={item.complies === true ? "default" : "outline"}
                    onClick={() => updateItemCompliance(index, true)}
                    className={item.complies === true ? "bg-green-600" : ""}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={item.complies === false ? "destructive" : "outline"}
                    onClick={() => updateItemCompliance(index, false)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">#{item.number}</Badge>
                    <Badge variant="secondary">{item.stage}</Badge>
                  </div>
                  <CardTitle className="text-base font-medium">
                    {item.item}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium">Evidencia de cumplimiento:</label>
                <Textarea
                  placeholder="Describe cómo cumples con este ítem o dónde encontrar la evidencia..."
                  value={item.evidence}
                  onChange={(e) => updateItemEvidence(index, e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
