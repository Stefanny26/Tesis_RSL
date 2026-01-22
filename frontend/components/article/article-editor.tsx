import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { ArticleVersion } from "@/lib/article-types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ArticleEditorProps {
  version: ArticleVersion
  onContentChange: (section: keyof ArticleVersion["content"], content: string) => void
  disabled?: boolean
}

export function ArticleEditor({ version, onContentChange, disabled = false }: ArticleEditorProps) {
  const sections = [
    { key: "abstract" as const, label: "Resumen", rows: 6 },
    { key: "introduction" as const, label: "Introducción", rows: 10 },
    { key: "methods" as const, label: "Métodos", rows: 10 },
    { key: "results" as const, label: "Resultados", rows: 10 },
    { key: "discussion" as const, label: "Discusión", rows: 10 },
    { key: "conclusions" as const, label: "Conclusiones", rows: 6 },
    { key: "references" as const, label: "Referencias", rows: 8 },
    { key: "declarations" as const, label: "Declaraciones", rows: 8 },
  ]

  return (
    <Card className="w-full shadow-sm">
      <ScrollArea className="h-[calc(100vh-180px)] p-6 bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto space-y-6 pb-12 px-8">
          {/* Document Header */}
          <div id="section-title" className="text-center border-b pb-4 mb-4 scroll-mt-6">
            <h1 className="text-xl font-bold tracking-tight mb-1">{version.title}</h1>
            <p className="text-muted-foreground text-[10px]">Versión {version.version} • {new Date(version.createdAt).toLocaleDateString()}</p>
          </div>

          {sections.map((section) => (
            <div
              key={section.key}
              id={`section-${section.key}`}
              className="scroll-mt-6 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor={section.key} className="text-sm font-semibold text-primary">
                  {section.label}
                </Label>
                <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {(version.content[section.key] || '').split(/\s+/).filter(w => w.length > 0).length} palabras
                </span>
              </div>

              <Textarea
                id={section.key}
                value={version.content[section.key] || ''}
                onChange={(e) => onContentChange(section.key, e.target.value)}
                className="min-h-[120px] font-serif text-sm leading-relaxed border-0 focus-visible:ring-0 px-0 resize-y bg-transparent hover:bg-muted/10 transition-colors rounded-none border-b border-transparent focus:border-primary/20"
                placeholder={`Escribe o genera el contenido para ${section.label.toLowerCase()}...`}
                disabled={disabled}
                style={{ minHeight: `${section.rows * 1.3}em` }}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
