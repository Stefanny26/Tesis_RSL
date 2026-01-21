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
        <DialogHeader className="px-4 py-3 border-b bg-background flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold leading-tight mb-1.5">
                {version.title}
              </DialogTitle>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
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
            <div className="flex gap-1.5 shrink-0">
              <Button variant="outline" size="sm" onClick={() => onExport('pdf')} className="gap-1.5 text-xs h-7">
                <FileDown className="h-3 w-3" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport('docx')} className="gap-1.5 text-xs h-7">
                <FileDown className="h-3 w-3" />
                DOCX
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-base prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-2 prose-p:text-[13px] prose-p:leading-relaxed prose-p:mb-2">

              {/* Abstract */}
              {version.content.abstract && (
                <section className="mb-4 bg-muted/30 p-4 rounded-lg border">
                  <h2 className="!mt-0 !mb-2 text-primary text-sm">Abstract</h2>
                  <div className="text-justify leading-relaxed text-[13px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.abstract}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Introduction */}
              {version.content.introduction && (
                <section className="mb-4">
                  <h2 className="border-b border-primary/20 pb-1.5 text-sm">1. Introduction</h2>
                  <div className="text-justify leading-relaxed text-[13px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.introduction}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Methods */}
              {version.content.methods && (
                <section className="mb-4">
                  <h2 className="border-b border-primary/20 pb-1.5 text-sm">2. Methods</h2>
                  <div className="text-justify leading-relaxed text-[13px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.methods}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Results */}
              {version.content.results && (
                <section className="mb-4">
                  <h2 className="border-b border-primary/20 pb-1.5 text-sm">3. Results</h2>
                  <div className="text-justify leading-relaxed text-[13px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.results}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Discussion */}
              {version.content.discussion && (
                <section className="mb-4">
                  <h2 className="border-b border-primary/20 pb-1.5 text-sm">4. Discussion</h2>
                  <div className="text-justify leading-relaxed text-[13px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.discussion}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Conclusions */}
              {version.content.conclusions && (
                <section className="mb-4">
                  <h2 className="border-b border-primary/20 pb-1.5 text-sm">5. Conclusions</h2>
                  <div className="text-justify leading-relaxed text-[13px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.conclusions}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Declarations */}
              {version.content.declarations && (
                <section className="mb-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                  <h2 className="!mt-0 !mb-2 text-sm">Declarations</h2>
                  <div className="text-justify leading-relaxed text-[11px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content.declarations}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* References */}
              {version.content.references && (
                <section className="mb-4">
                  <h2 className="border-b border-primary/20 pb-1.5 text-sm">References</h2>
                  <div className="leading-relaxed text-[11px] space-y-1.5">
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

