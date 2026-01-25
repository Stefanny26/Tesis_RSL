import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { ArticleVersion } from "@/lib/article-types"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
import { useState } from "react"
import type { Components } from 'react-markdown'

// Componentes de Markdown extraídos para evitar redefiniciones
const MarkdownImage = ({ node, ...props }: any) => (
  <img
    {...props}
    alt={props.alt || 'Imagen del artículo'}
    className="max-w-full h-auto my-4 rounded-lg shadow-lg border border-muted"
    loading="lazy"
  />
)

const MarkdownTable = ({ node, ...props }: any) => (
  <div className="overflow-x-auto my-4">
    <table {...props} className="min-w-full border-collapse border border-gray-300" />
  </div>
)

const MarkdownTableHeader = ({ node, ...props }: any) => (
  <th 
    {...props} 
    scope="col"
    className="border border-gray-300 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left" 
  />
)

const MarkdownTableCell = ({ node, ...props }: any) => (
  <td {...props} className="border border-gray-300 px-4 py-2" />
)

const markdownComponents: Components = {
  img: MarkdownImage,
  table: MarkdownTable,
  th: MarkdownTableHeader,
  td: MarkdownTableCell,
}

interface ArticleEditorProps {
  version: ArticleVersion
  onContentChange: (section: keyof ArticleVersion["content"], content: string) => void
  disabled?: boolean
}

export function ArticleEditor({ version, onContentChange, disabled = false }: ArticleEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  
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
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {(version.content[section.key] || '').split(/\s+/).filter(w => w.length > 0).length} palabras
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setEditingSection(editingSection === section.key ? null : section.key)}
                  >
                    {editingSection === section.key ? (
                      <><Eye className="h-3 w-3 mr-1" /> Vista Previa</>
                    ) : (
                      <><Edit className="h-3 w-3 mr-1" /> Editar</>
                    )}
                  </Button>
                </div>
              </div>

              {editingSection === section.key ? (
                <Textarea
                  id={section.key}
                  value={version.content[section.key] || ''}
                  onChange={(e) => onContentChange(section.key, e.target.value)}
                  className="min-h-[120px] font-mono text-xs leading-relaxed border border-muted focus-visible:ring-1 focus-visible:ring-primary px-3 py-2 resize-y bg-muted/20"
                  placeholder={`Escribe o genera el contenido para ${section.label.toLowerCase()}...`}
                  disabled={disabled}
                  style={{ minHeight: `${section.rows * 1.3}em` }}
                />
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-justify prose-p:leading-relaxed prose-li:text-sm prose-img:rounded-lg prose-img:shadow-md min-h-[60px] p-4 rounded-md bg-muted/10 hover:bg-muted/20 transition-colors border border-transparent hover:border-muted">
                  {version.content[section.key] ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {version.content[section.key]}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground italic text-sm">
                      Haz clic en "Editar" para agregar contenido o usa "Generar Borrador Completo"
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
