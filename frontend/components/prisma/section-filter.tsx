"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface SectionFilterProps {
  currentSection: string
  onSectionChange: (section: string) => void
  itemCounts?: Record<string, number>
}

const sections = [
  { value: "Todos", label: "Todos" },
  { value: "TÍTULO", label: "Título" },
  { value: "RESUMEN", label: "Resumen" },
  { value: "INTRODUCCIÓN", label: "Introducción" },
  { value: "MÉTODOS", label: "Métodos" },
  { value: "RESULTADOS", label: "Resultados" },
  { value: "DISCUSIÓN", label: "Discusión" },
  { value: "OTRA INFORMACIÓN", label: "Otra Información" }
]

export function SectionFilter({ currentSection, onSectionChange, itemCounts }: SectionFilterProps) {
  return (
    <div className="w-full">
      <Tabs value={currentSection} onValueChange={onSectionChange} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 bg-muted p-1">
          {sections.map((section) => (
            <TabsTrigger 
              key={section.value} 
              value={section.value} 
              className="whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground rounded-md px-4 py-2"
            >
              <span>{section.label}</span>
              {itemCounts && itemCounts[section.value] !== undefined && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {itemCounts[section.value]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
