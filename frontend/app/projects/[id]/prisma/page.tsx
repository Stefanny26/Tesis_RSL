"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { PrismaItemCard } from "@/components/prisma/prisma-item-card"
import { PrismaProgress } from "@/components/prisma/prisma-progress"
import { AIValidationPanel } from "@/components/prisma/ai-validation-panel"
import { SectionFilter } from "@/components/prisma/section-filter"
import { prismaChecklist } from "@/lib/prisma-items"
import { Button } from "@/components/ui/button"
import { FileDown, Save, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

// Función para generar contenido basado en datos del wizard
function generateItemContent(itemId: number, protocolData: any): string {
  switch (itemId) {
    case 1: // Título
      return protocolData.selectedTitle || "Pendiente de completar"
    
    case 2: // Resumen estructurado
      return protocolData.projectDescription || "Pendiente de completar"
    
    case 3: // Justificación (background)
      const pico = protocolData.pico
      if (pico && (pico.population || pico.intervention)) {
        return `Contexto: ${pico.population || 'N/A'}\nIntervención estudiada: ${pico.intervention || 'N/A'}\nObjetivo: ${pico.outcome || 'N/A'}`
      }
      return "Marco PICO completado en Paso 2"
    
    case 4: // Objetivos usando PICO
      if (protocolData.pico) {
        const { population, intervention, comparison, outcome } = protocolData.pico
        return `Población: ${population || 'N/A'}\nIntervención: ${intervention || 'N/A'}\nComparación: ${comparison || 'N/A'}\nResultados: ${outcome || 'N/A'}`
      }
      return "Marco PICO definido en Paso 2"
    
    case 5: // Criterios de elegibilidad
      const inclusion = protocolData.inclusionCriteria || []
      const exclusion = protocolData.exclusionCriteria || []
      if (inclusion.length > 0 || exclusion.length > 0) {
        return `Criterios de Inclusión:\n${inclusion.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}\n\nCriterios de Exclusión:\n${exclusion.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}`
      }
      return "Criterios definidos en Paso 4"
    
    case 6: // Fuentes de información
      const databases = protocolData.searchPlan?.databases || []
      if (databases.length > 0) {
        return `Bases de datos consultadas:\n${databases.map((db: any) => `• ${db.name}`).join('\n')}`
      }
      return "Bases de datos seleccionadas en Paso 5"
    
    case 7: // Estrategia de búsqueda
      if (protocolData.searchPlan?.databases) {
        const strategies = protocolData.searchPlan.databases.map((db: any) => 
          `${db.name}:\n${db.searchString || 'Sin cadena definida'}\n`
        ).join('\n')
        return strategies || "Cadenas de búsqueda definidas en Paso 5"
      }
      return "Estrategia de búsqueda completa en Paso 5"
    
    case 8: // Proceso de selección
      const matrix = protocolData.matrixIsNot || { is: [], isNot: [] }
      if (matrix.is.length > 0 || matrix.isNot.length > 0) {
        return `Matriz Es/No Es aplicada:\nES: ${matrix.is.join(', ')}\nNO ES: ${matrix.isNot.join(', ')}`
      }
      return "Matriz Es/No Es definida en Paso 2"
    
    case 9: // Proceso extracción de datos
      const terms = protocolData.protocolDefinition
      if (terms && (terms.technologies?.length > 0 || terms.applicationDomain?.length > 0)) {
        return `Términos del protocolo:\nTecnologías: ${terms.technologies?.join(', ') || 'N/A'}\nDominio: ${terms.applicationDomain?.join(', ') || 'N/A'}`
      }
      return "Términos del protocolo definidos en Paso 6"
    
    case 10: // Datos extraídos
      return "Datos a extraer según términos definidos en Paso 6"
    
    case 11: // Síntesis de resultados
      const tableData = protocolData.matrixTable || []
      if (tableData.length > 0) {
        return `Tabla de elementos de matriz completada (${tableData.length} elementos)`
      }
      return "Método de síntesis basado en matriz Es/No Es"
    
    case 12: // Diagrama de flujo
      return "Diagrama PRISMA a generar con resultados de screening"
    
    case 13: // Cumplimiento general
      return "Checklist PRISMA completado - Revisar todos los ítems"
    
    default:
      return "Pendiente de completar"
  }
}

export default function PrismaPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [currentSection, setCurrentSection] = useState("Todos")
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set())
  const [itemContents, setItemContents] = useState<Record<number, string>>({})
  const [aiSuggestions, setAiSuggestions] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [protocolData, setProtocolData] = useState<any>(null)

  // Cargar datos del protocolo al montar
  useEffect(() => {
    async function loadProtocol() {
      try {
        const result = await apiClient.getProtocol(params.id)
        
        // El backend puede devolver { protocol: {...} } o directamente el protocolo
        const protocol = result.protocol || result
        setProtocolData(protocol)
        
        if (protocol) {
          // Auto-generar contenido para todos los ítems basado en datos del wizard
          const autoGeneratedContents: Record<number, string> = {}
          const autoCompleted = new Set<number>()
          
          prismaChecklist.forEach(item => {
            const content = generateItemContent(item.id, protocol)
            autoGeneratedContents[item.id] = content
            
            // Marcar como completado si tiene contenido válido
            if (content && !content.startsWith("Pendiente")) {
              autoCompleted.add(item.id)
            }
          })
          
          // Si hay datos guardados previamente, sobrescribir
          if (protocol.prismaCompliance) {
            protocol.prismaCompliance.forEach((item: any) => {
              const itemId = item.number || item.id
              
              if (item.complies === 'si' || item.complies === true) {
                autoCompleted.add(itemId)
              }
              if (item.evidence) {
                autoGeneratedContents[itemId] = item.evidence
              }
            })
          }
          
          setCompletedItems(autoCompleted)
          setItemContents(autoGeneratedContents)
        }
      } catch (error) {
        console.error("Error cargando protocolo:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el protocolo",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProtocol()
  }, [params.id, toast])

  const toggleItemComplete = (itemId: number) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const updateItemContent = (itemId: number, content: string) => {
    setItemContents((prev) => ({ ...prev, [itemId]: content }))
  }

  const requestAISuggestion = (itemId: number) => {
    // Mock AI suggestion - in production, this would call the AI API
    const mockSuggestions: Record<number, string> = {
      1: 'Considere incluir "Revisión Sistemática" en el título para mayor claridad. Ejemplo: "Inteligencia Artificial en Educación Superior: Una Revisión Sistemática"',
      2: "Su resumen debe incluir: antecedentes (2-3 líneas), objetivo específico, bases de datos consultadas, criterios PICO, número de estudios incluidos, principales hallazgos y conclusión principal.",
      3: "Explique por qué es importante realizar esta revisión ahora. Mencione las brechas en el conocimiento actual y cómo su revisión las abordará.",
    }

    setAiSuggestions((prev) => ({
      ...prev,
      [itemId]:
        mockSuggestions[itemId] || "Asegúrese de proporcionar información completa y específica para este ítem.",
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Construir array de PRISMA compliance
      const prismaCompliance = prismaChecklist.map(item => ({
        number: item.id,
        item: item.title,
        complies: completedItems.has(item.id) ? 'si' : 'no',
        evidence: itemContents[item.id] || ''
      }))

      await apiClient.updateProtocol(params.id, {
        prismaCompliance
      })

      toast({
        title: "✅ Guardado exitoso",
        description: "Los cambios del checklist PRISMA se han guardado"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredItems =
    currentSection === "Todos" ? prismaChecklist : prismaChecklist.filter((item) => item.section === currentSection)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Cargando checklist PRISMA...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Checklist PRISMA</h1>
              <p className="text-muted-foreground">Valida el cumplimiento de los 27 ítems PRISMA 2020</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </>
                )}
              </Button>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Section Filter */}
          <SectionFilter currentSection={currentSection} onSectionChange={setCurrentSection} />

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {filteredItems.map((item) => (
                <PrismaItemCard
                  key={item.id}
                  item={item}
                  isCompleted={completedItems.has(item.id)}
                  content={itemContents[item.id] || ""}
                  aiSuggestion={aiSuggestions[item.id]}
                  onToggleComplete={() => toggleItemComplete(item.id)}
                  onContentChange={(content) => updateItemContent(item.id, content)}
                  onRequestAISuggestion={() => requestAISuggestion(item.id)}
                />
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <PrismaProgress completedItems={completedItems.size} totalItems={prismaChecklist.length} />
              <AIValidationPanel
                completedItems={completedItems.size}
                totalItems={prismaChecklist.length}
                onRunValidation={() => {}}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
