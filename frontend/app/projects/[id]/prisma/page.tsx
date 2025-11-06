"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { PrismaItemCard } from "@/components/prisma/prisma-item-card"
import { PrismaProgress } from "@/components/prisma/prisma-progress"
import { AIValidationPanel } from "@/components/prisma/ai-validation-panel"
import { SectionFilter } from "@/components/prisma/section-filter"
import { prismaChecklist } from "@/lib/prisma-items"
import { Button } from "@/components/ui/button"
import { FileDown, Save } from "lucide-react"

export default function PrismaPage({ params }: { params: { id: string } }) {
  const [currentSection, setCurrentSection] = useState("Todos")
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set([4, 8, 17]))
  const [itemContents, setItemContents] = useState<Record<number, string>>({})
  const [aiSuggestions, setAiSuggestions] = useState<Record<number, string>>({})

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

  const filteredItems =
    currentSection === "Todos" ? prismaChecklist : prismaChecklist.filter((item) => item.section === currentSection)

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
              <Button variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Guardar
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
