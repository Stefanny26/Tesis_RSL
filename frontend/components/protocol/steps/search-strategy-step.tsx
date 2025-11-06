"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"

const commonDatabases = [
  "IEEE Xplore",
  "ACM Digital Library",
  "Scopus",
  "Web of Science",
  "PubMed",
  "Google Scholar",
  "ScienceDirect",
  "SpringerLink",
]

interface SearchStrategyStepProps {
  data: {
    databases: string[]
    keywords: string[]
    searchString: string
  }
  onChange: (data: any) => void
}

export function SearchStrategyStep({ data, onChange }: SearchStrategyStepProps) {
  const toggleDatabase = (database: string) => {
    const newDatabases = data.databases.includes(database)
      ? data.databases.filter((db) => db !== database)
      : [...data.databases, database]
    onChange({ ...data, databases: newDatabases })
  }

  const addKeyword = () => {
    onChange({ ...data, keywords: [...data.keywords, ""] })
  }

  const removeKeyword = (index: number) => {
    onChange({ ...data, keywords: data.keywords.filter((_, i) => i !== index) })
  }

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...data.keywords]
    newKeywords[index] = value
    onChange({ ...data, keywords: newKeywords })
  }

  const updateSearchString = (value: string) => {
    onChange({ ...data, searchString: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Estrategia de Búsqueda</h3>
        <p className="text-sm text-muted-foreground">
          Define las bases de datos, palabras clave y cadena de búsqueda para tu revisión sistemática.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Bases de Datos</Label>
          <div className="grid grid-cols-2 gap-3">
            {commonDatabases.map((database) => (
              <div key={database} className="flex items-center space-x-2">
                <Checkbox
                  id={database}
                  checked={data.databases.includes(database)}
                  onCheckedChange={() => toggleDatabase(database)}
                />
                <label htmlFor={database} className="text-sm cursor-pointer">
                  {database}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Palabras Clave</Label>
          {data.keywords.map((keyword, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Ej: artificial intelligence, machine learning"
                value={keyword}
                onChange={(e) => updateKeyword(index, e.target.value)}
              />
              <Button size="icon" variant="ghost" onClick={() => removeKeyword(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addKeyword} className="w-full bg-transparent">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Palabra Clave
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="searchString">Cadena de Búsqueda</Label>
          <Textarea
            id="searchString"
            placeholder='Ej: ("artificial intelligence" OR "machine learning") AND ("education" OR "learning") AND ("university" OR "higher education")'
            value={data.searchString}
            onChange={(e) => updateSearchString(e.target.value)}
            rows={5}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Usa operadores booleanos (AND, OR, NOT) y comillas para frases exactas
          </p>
        </div>
      </div>
    </div>
  )
}
