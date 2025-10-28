"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface IsNotMatrixStepProps {
  data: { is: string[]; isNot: string[] }
  onChange: (data: { is: string[]; isNot: string[] }) => void
}

export function IsNotMatrixStep({ data, onChange }: IsNotMatrixStepProps) {
  const addItem = (type: "is" | "isNot") => {
    onChange({
      ...data,
      [type]: [...data[type], ""],
    })
  }

  const removeItem = (type: "is" | "isNot", index: number) => {
    onChange({
      ...data,
      [type]: data[type].filter((_, i) => i !== index),
    })
  }

  const updateItem = (type: "is" | "isNot", index: number, value: string) => {
    const newArray = [...data[type]]
    newArray[index] = value
    onChange({
      ...data,
      [type]: newArray,
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Matriz Es/No Es</h3>
        <p className="text-sm text-muted-foreground">
          Define claramente qué incluye y qué excluye tu investigación para establecer límites precisos.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ES Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">ES (Incluye)</Label>
            <Button size="sm" variant="outline" onClick={() => addItem("is")}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
          <div className="space-y-3">
            {data.is.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No hay elementos. Agrega uno para comenzar.</p>
            )}
            {data.is.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Ej: Estudios empíricos con datos cuantitativos"
                  value={item}
                  onChange={(e) => updateItem("is", index, e.target.value)}
                />
                <Button size="icon" variant="ghost" onClick={() => removeItem("is", index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* NO ES Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">NO ES (Excluye)</Label>
            <Button size="sm" variant="outline" onClick={() => addItem("isNot")}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
          <div className="space-y-3">
            {data.isNot.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No hay elementos. Agrega uno para comenzar.</p>
            )}
            {data.isNot.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Ej: Estudios teóricos sin validación"
                  value={item}
                  onChange={(e) => updateItem("isNot", index, e.target.value)}
                />
                <Button size="icon" variant="ghost" onClick={() => removeItem("isNot", index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
