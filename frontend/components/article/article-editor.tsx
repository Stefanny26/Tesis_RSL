"use client"

import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { ArticleVersion } from "@/lib/article-types"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlignLeft } from "lucide-react"

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

  const [activeSection, setActiveSection] = useState<string>("abstract")

  const scrollToSection = (sectionKey: string) => {
    const element = document.getElementById(`section-${sectionKey}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveSection(sectionKey)
    }
  }

  // Detect active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Logic to determine active section based on scroll position could go here
      // simplified for now
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-180px)]">
      {/* Sidebar Index */}
      <div className="w-full md:w-56 flex-shrink-0 bg-card rounded-lg border p-3 h-full hidden md:flex flex-col">
        <div className="flex items-center gap-1.5 mb-3 text-muted-foreground">
          <AlignLeft className="h-3.5 w-3.5" />
          <span className="font-medium text-xs">Índice</span>
        </div>
        <ScrollArea className="flex-1 pr-3">
          <div className="space-y-0.5">
            {sections.map((section) => (
              <Button
                key={section.key}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start text-left font-normal text-xs h-7",
                  activeSection === section.key
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => scrollToSection(section.key)}
              >
                {section.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content - Continuous Scroll */}
      <Card className="flex-1 h-full overflow-hidden flex flex-col shadow-sm">
        <ScrollArea className="flex-1 p-4 md:p-6 bg-white dark:bg-zinc-950">
          <div className="max-w-3xl mx-auto space-y-8 pb-16">
            {/* Document Header */}
            <div className="text-center border-b pb-5 mb-6">
              <h1 className="text-2xl font-bold tracking-tight mb-1.5">{version.title}</h1>
              <p className="text-muted-foreground text-xs">Versión {version.version} • {new Date(version.createdAt).toLocaleDateString()}</p>
            </div>

            {sections.map((section) => (
              <div
                key={section.key}
                id={`section-${section.key}`}
                className="scroll-mt-6 space-y-2.5"
                onFocus={() => setActiveSection(section.key)}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor={section.key} className="text-base font-semibold text-primary">
                    {section.label}
                  </Label>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
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
    </div>
  )
}
