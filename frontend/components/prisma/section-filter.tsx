"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SectionFilterProps {
  currentSection: string
  onSectionChange: (section: string) => void
}

const sections = ["Todos", "Título", "Resumen", "Introducción", "Métodos", "Resultados", "Discusión", "Financiamiento"]

export function SectionFilter({ currentSection, onSectionChange }: SectionFilterProps) {
  return (
    <Tabs value={currentSection} onValueChange={onSectionChange} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
        {sections.map((section) => (
          <TabsTrigger key={section} value={section} className="whitespace-nowrap">
            {section}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
