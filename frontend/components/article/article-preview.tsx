"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileDown, X } from "lucide-react"
import type { ArticleVersion } from "@/lib/article-types"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ArticlePreviewProps {
  version: ArticleVersion
  open: boolean
  onClose: () => void
  onExport: (format: 'pdf' | 'docx') => void
}

export function ArticlePreview({ version, open, onClose, onExport }: ArticlePreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[1400px] w-[95vw] h-[95vh] overflow-hidden flex flex-col p-0 sm:max-w-[1400px]"
        showCloseButton={false}
      >
        {/* Header fijo con controles */}
        <DialogHeader className="px-8 py-6 border-b bg-background flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold leading-tight mb-3">
                {version.title}
              </DialogTitle>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium">Versión {version.version}</span>
                <span>•</span>
                <span>{new Date(version.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                <span>•</span>
                <span>Autor: {version.createdBy}</span>
                <span>•</span>
                <span className="font-semibold">{version.wordCount.toLocaleString()} palabras</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="default" onClick={() => onExport('pdf')} className="gap-2">
                <FileDown className="h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" size="default" onClick={() => onExport('docx')} className="gap-2">
                <FileDown className="h-4 w-4" />
                DOCX
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto px-12 py-8 flex-1">
          <div className="max-w-5xl mx-auto">
            <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-base prose-p:leading-relaxed prose-p:mb-4">

              {/* Abstract */}
              {version.content.abstract && (
                <section className="mb-12 bg-muted/30 p-8 rounded-lg border">
                  <h2 className="!mt-0 !mb-4 text-primary">Abstract</h2>
                  <div className="text-justify leading-relaxed text-base">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.abstract}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Introduction */}
              {version.content.introduction && (
                <section className="mb-12">
                  <h2 className="border-b-2 border-primary/20 pb-3">1. Introduction</h2>
                  <div className="text-justify leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.introduction}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Methods */}
              {version.content.methods && (
                <section className="mb-12">
                  <h2 className="border-b-2 border-primary/20 pb-3">2. Methods</h2>
                  <div className="text-justify leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.methods}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Results */}
              {version.content.results && (
                <section className="mb-12">
                  <h2 className="border-b-2 border-primary/20 pb-3">3. Results</h2>
                  <div className="text-justify leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.results}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Discussion */}
              {version.content.discussion && (
                <section className="mb-12">
                  <h2 className="border-b-2 border-primary/20 pb-3">4. Discussion</h2>
                  <div className="text-justify leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.discussion}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Conclusions */}
              {version.content.conclusions && (
                <section className="mb-12">
                  <h2 className="border-b-2 border-primary/20 pb-3">5. Conclusions</h2>
                  <div className="text-justify leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.conclusions}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Declarations */}
              {version.content.declarations && (
                <section className="mb-12 bg-muted/20 p-8 rounded-lg border border-dashed">
                  <h2 className="!mt-0 !mb-4">Declarations</h2>
                  <div className="text-justify leading-relaxed text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.declarations}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* References */}
              {version.content.references && (
                <section className="mb-12">
                  <h2 className="border-b-2 border-primary/20 pb-3">References</h2>
                  <div className="leading-relaxed text-sm space-y-3">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.references}</ReactMarkdown>
                  </div>
                </section>
              )}

            </article>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

