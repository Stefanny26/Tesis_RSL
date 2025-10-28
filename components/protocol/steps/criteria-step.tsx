"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X } from "lucide-react"

interface CriteriaStepProps {
  inclusionCriteria: string[]
  exclusionCriteria: string[]
  onInclusionChange: (data: string[]) => void
  onExclusionChange: (data: string[]) => void
}

export function CriteriaStep({
  inclusionCriteria,
  exclusionCriteria,
  onInclusionChange,
  onExclusionChange,
}: CriteriaStepProps) {
  const addCriterion = (type: "inclusion" | "exclusion") => {
    if (type === "inclusion") {
      onInclusionChange([...inclusionCriteria, ""])
    } else {
      onExclusionChange([...exclusionCriteria, ""])
    }
  }

  const removeCriterion = (type: "inclusion" | "exclusion", index: number) => {
    if (type === "inclusion") {
      onInclusionChange(inclusionCriteria.filter((_, i) => i !== index))
    } else {
      onExclusionChange(exclusionCriteria.filter((_, i) => i !== index))
    }
  }

  const updateCriterion = (type: "inclusion" | "exclusion", index: number, value: string) => {
    if (type === "inclusion") {
      const newCriteria = [...inclusionCriteria]
      newCriteria[index] = value
      onInclusionChange(newCriteria)
    } else {
      const newCriteria = [...exclusionCriteria]
      newCriteria[index] = value
      onExclusionChange(newCriteria)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Criterios de Inclusión y Exclusión</h3>
        <p className="text-sm text-muted-foreground">
          Define los criterios que determinarán qué estudios serán incluidos o excluidos de tu revisión.
        </p>
      </div>

      <Tabs defaultValue="inclusion" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inclusion">Inclusión ({inclusionCriteria.length})</TabsTrigger>
          <TabsTrigger value="exclusion">Exclusión ({exclusionCriteria.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="inclusion" className="space-y-4 mt-4">
          <div className="space-y-3">
            {inclusionCriteria.map((criterion, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Ej: Publicaciones entre 2018-2024"
                  value={criterion}
                  onChange={(e) => updateCriterion("inclusion", index, e.target.value)}
                />
                <Button size="icon" variant="ghost" onClick={() => removeCriterion("inclusion", index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={() => addCriterion("inclusion")} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Criterio de Inclusión
          </Button>
        </TabsContent>

        <TabsContent value="exclusion" className="space-y-4 mt-4">
          <div className="space-y-3">
            {exclusionCriteria.map((criterion, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Ej: Estudios sin revisión por pares"
                  value={criterion}
                  onChange={(e) => updateCriterion("exclusion", index, e.target.value)}
                />
                <Button size="icon" variant="ghost" onClick={() => removeCriterion("exclusion", index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={() => addCriterion("exclusion")} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Criterio de Exclusión
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
