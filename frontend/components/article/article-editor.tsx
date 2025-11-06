"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ArticleVersion } from "@/lib/article-types"

interface ArticleEditorProps {
  version: ArticleVersion
  onContentChange: (section: keyof ArticleVersion["content"], content: string) => void
}

export function ArticleEditor({ version, onContentChange }: ArticleEditorProps) {
  const sections = [
    { key: "abstract" as const, label: "Resumen", rows: 6 },
    { key: "introduction" as const, label: "Introducción", rows: 10 },
    { key: "methods" as const, label: "Métodos", rows: 10 },
    { key: "results" as const, label: "Resultados", rows: 10 },
    { key: "discussion" as const, label: "Discusión", rows: 10 },
    { key: "conclusions" as const, label: "Conclusiones", rows: 6 },
    { key: "references" as const, label: "Referencias", rows: 8 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor de Artículo</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="abstract" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
            {sections.map((section) => (
              <TabsTrigger key={section.key} value={section.key}>
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map((section) => (
            <TabsContent key={section.key} value={section.key} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor={section.key}>{section.label}</Label>
                <Textarea
                  id={section.key}
                  value={version.content[section.key]}
                  onChange={(e) => onContentChange(section.key, e.target.value)}
                  rows={section.rows}
                  className="font-serif text-base leading-relaxed"
                  placeholder={`Escribe el contenido de ${section.label.toLowerCase()}...`}
                />
                <p className="text-xs text-muted-foreground">
                  {version.content[section.key].split(" ").filter((w) => w.length > 0).length} palabras
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
