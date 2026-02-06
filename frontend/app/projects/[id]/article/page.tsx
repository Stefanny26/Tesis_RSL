"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProjectHeader } from "@/components/project-header"
import { apiClient } from "@/lib/api-client"
import type { Project } from "@/lib/types"
import { ArticleEditor } from "@/components/article/article-editor"
import { VersionHistory } from "@/components/article/version-history"
import { AIGeneratorPanel } from "@/components/article/ai-generator-panel"
import { ArticleStats } from "@/components/article/article-stats"
import { PrismaPreviewDialog } from "@/components/article/prisma-preview-dialog"
import type { ArticleVersion } from "@/lib/article-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Save, FileDown, Loader2, Lock, Sparkles, FileText, CheckCircle2, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface ArticleStatus {
  canGenerate: boolean
  prismaCompleted: number
  prismaTotal: number
  message: string
  blockingReason?: string
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [versions, setVersions] = useState<ArticleVersion[]>([])
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null)
  const [status, setStatus] = useState<ArticleStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPrismaDialog, setShowPrismaDialog] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    try {
      setIsLoading(true)

      // Cargar proyecto
      const projectData = await apiClient.getProject(params.id)
      setProject(projectData)

      // Cargar estado del artículo
      const statusData = await apiClient.getArticleStatus(params.id)
      setStatus(statusData.data || statusData)

      // Cargar versiones guardadas del artículo
      try {
        const versionsData = await apiClient.getArticleVersions(params.id)
        
        if (versionsData.success && versionsData.data && versionsData.data.length > 0) {
          setVersions(versionsData.data)
          setCurrentVersionId(versionsData.data[0].id)
        } else {
          // Si no hay versiones, inicializar con una versión vacía
          const initialVersion: ArticleVersion = {
            id: 'v1-temp',
            projectId: params.id,
            version: 1,
            title: projectData.title || 'Artículo sin título',
            content: {
              abstract: '',
              introduction: '',
              methods: '',
              results: '',
              discussion: '',
              conclusions: '',
              references: '',
              declarations: ''
            },
            wordCount: 0,
            createdAt: new Date(),
            createdBy: user?.fullName || 'Usuario',
            changeDescription: 'Versión inicial',
            isPublished: false
          }

          setVersions([initialVersion])
          setCurrentVersionId('v1-temp')
        }
      } catch (error) {
        console.error('Error cargando versiones:', error)
        // Inicializar con versión vacía si hay error
        const initialVersion: ArticleVersion = {
          id: 'v1-temp',
          projectId: params.id,
          version: 1,
          title: projectData.title || 'Artículo sin título',
          content: {
            abstract: '',
            introduction: '',
            methods: '',
            results: '',
            discussion: '',
            conclusions: '',
            references: '',
            declarations: ''
          },
          wordCount: 0,
          createdAt: new Date(),
          createdBy: user?.fullName || 'Usuario',
          changeDescription: 'Versión inicial',
          isPublished: false
        }

        setVersions([initialVersion])
        setCurrentVersionId('v1-temp')
      }

    } catch (error: any) {
      console.error('Error cargando datos del artículo:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los datos del artículo",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const currentVersion = versions.find((v) => v.id === currentVersionId) || versions[0]

  const handleContentChange = (section: keyof ArticleVersion["content"], content: string) => {
    setVersions((prev) =>
      prev.map((v) =>
        v.id === currentVersionId
          ? {
            ...v,
            content: { ...v.content, [section]: content },
            wordCount: Object.values({ ...v.content, [section]: content })
              .join(" ")
              .split(" ")
              .filter((w) => w.length > 0).length,
          }
          : v,
      ),
    )
  }

  const handleSaveVersion = async () => {
    try {
      setIsSaving(true)

      // Guardar en la base de datos
      const response = await apiClient.saveArticleVersion(params.id, {
        title: currentVersion.title,
        sections: currentVersion.content,
        changeDescription: "Cambios manuales guardados"
      })

      if (response.success) {
        toast({
          title: "Versión guardada",
          description: `Versión ${response.data.versionNumber} guardada exitosamente`
        })

        // Recargar versiones
        await loadData()
      }
    } catch (error: any) {
      console.error('Error guardando versión:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la versión",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestoreVersion = (versionId: string) => {
    const versionToRestore = versions.find((v) => v.id === versionId)
    if (!versionToRestore) return

    // Actualizar la versión actual con el contenido restaurado
    setVersions((prev) =>
      prev.map((v) =>
        v.id === currentVersionId
          ? {
            ...v,
            content: versionToRestore.content,
            wordCount: versionToRestore.wordCount,
          }
          : v,
      ),
    )


    toast({
      title: "Versión restaurada",
      description: `Se ha restaurado la versión ${versionToRestore.version}`,
    })
  }

  async function handleGenerateDraft(section: string) {
    try {
      setIsGenerating(true)

      toast({
        title: "Generando sección",
        description: `Generando contenido para ${section}...`,
      })

      const response = await apiClient.generateArticleSection(
        params.id,
        section as any
      )

      if (response.success && response.data) {
        // Actualizar la sección correspondiente
        handleContentChange(section as keyof ArticleVersion["content"], response.data.content)

        toast({
          title: "✅ Sección generada",
          description: `Se ha generado contenido para ${section}`,
        })
      }

    } catch (error: any) {
      console.error('Error generando sección:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo generar la sección",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateFullArticle = async () => {
    if (!status?.canGenerate) {
      toast({
        title: "No disponible",
        description: status?.message || "Debe completar PRISMA primero",
        variant: "destructive"
      })
      return
    }

    try {
      setIsGenerating(true)

      toast({
        title: "Generando artículo",
        description: "Extrayendo datos y generando contenido...",
      })

      // Extraer RQS automáticamente antes de generar el artículo (proceso interno)
      try {
        await apiClient.extractRQSData(params.id)
      } catch (error) {
        console.log('RQS ya extraído o no necesario:', error)
      }

      const response = await apiClient.generateArticle(params.id)

      if (response.success && response.data) {
        // Guardar la versión generada en la base de datos
        const saveResponse = await apiClient.saveArticleVersion(params.id, {
          title: response.data.title || currentVersion.title,
          sections: response.data.sections,
          changeDescription: 'Generado automáticamente por IA desde PRISMA'
        })

        if (saveResponse.success) {
          toast({
            title: "✅ Artículo generado",
            description: `Versión ${saveResponse.data.versionNumber} guardada exitosamente`,
          })

          // Recargar versiones para obtener la nueva
          await loadData()
        }
      }

    } catch (error: any) {
      console.error('Error generando artículo:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el artículo",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportLatex = () => {
    if (!currentVersion) {
      toast({
        title: "No hay contenido",
        description: "Primero debe generar o crear una versión del artículo",
        variant: "destructive"
      })
      return
    }

    try {
      // Convertir markdown a LaTeX
      let latexContent = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[spanish]{babel}
\\usepackage[T1]{fontenc}
\\usepackage{graphicx}
\\usepackage{float}
\\usepackage{booktabs}
\\usepackage{longtable}
\\usepackage{hyperref}
\\usepackage{cite}
\\usepackage{amsmath}
\\usepackage{geometry}
\\usepackage{setspace}
\\geometry{margin=1in}
\\onehalfspacing

\\title{${currentVersion.title}}
\\author{${user?.fullName || 'Autor'}}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
${convertMarkdownToLatex(currentVersion.content.abstract)}
\\end{abstract}

\\section{Introducción}
${convertMarkdownToLatex(currentVersion.content.introduction)}

\\section{Métodos}
${convertMarkdownToLatex(currentVersion.content.methods)}

\\section{Resultados}
${convertMarkdownToLatex(currentVersion.content.results)}

\\section{Discusión}
${convertMarkdownToLatex(currentVersion.content.discussion)}

\\section{Conclusiones}
${convertMarkdownToLatex(currentVersion.content.conclusions)}

\\section*{Referencias}
${convertMarkdownToLatex(currentVersion.content.references)}

\\section*{Declaraciones}
${convertMarkdownToLatex(currentVersion.content.declarations)}

\\end{document}`

      // Descargar como archivo .tex
      const blob = new Blob([latexContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentVersion.title.replaceAll(/[^a-z0-9]/gi, '_').toLowerCase()}.tex`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      toast({
        title: "Exportado exitosamente",
        description: "El archivo LaTeX se ha descargado"
      })
    } catch (error) {
      console.error('Error exportando a LaTeX:', error)
      toast({
        title: "Error",
        description: "No se pudo exportar el artículo",
        variant: "destructive"
      })
    }
  }

  const handleExportReferences = () => {
    if (!currentVersion?.content.references) {
      toast({
        title: "No hay referencias",
        description: "Primero debe agregar referencias al artículo",
        variant: "destructive"
      })
      return
    }

    try {
      // Extraer referencias del markdown
      const referencesText = currentVersion.content.references
      const references = parseReferencesToJSON(referencesText)

      if (references.length === 0) {
        toast({
          title: "No se encontraron referencias",
          description: "No se pudieron extraer referencias del formato actual",
          variant: "destructive"
        })
        return
      }

      // Generar archivo JSON
      const jsonContent = JSON.stringify(references, null, 2)
      
      // Descargar como archivo .json
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentVersion.title.replaceAll(/[^a-z0-9]/gi, '_').toLowerCase()}_references.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      toast({
        title: "Referencias exportadas",
        description: `${references.length} referencias exportadas en formato JSON`
      })
    } catch (error) {
      console.error('Error exportando referencias:', error)
      toast({
        title: "Error",
        description: "No se pudieron exportar las referencias",
        variant: "destructive"
      })
    }
  }

  const parseReferencesToJSON = (referencesText: string): any[] => {
    const references: any[] = []
    let refCounter = 1
    
    // Limpiar markdown y texto adicional
    let cleanText = referencesText
      .replaceAll('**', '') // Quitar negritas
      .replaceAll('*', '') // Quitar asteriscos
      .trim()
    
    // Patrón 1: Referencias numeradas [1] Autor (Año). Título. Fuente.
    // Buscar líneas que empiezan con [número]
    const lines = cleanText.split('\n')
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Solo procesar líneas que empiezan con [número]
      const startsWithNumber = /^\[\d+\]/.test(trimmedLine)
      if (!startsWithNumber) continue
      
      // Regex más específico para referencias numeradas
      const refRegex = /^\[(\d+)\]\s+(.+?)\s+\((\d{4})\)\.\s+(.+?)(?:\.\s+(.+?))?$/
      const match = refRegex.exec(trimmedLine)
      
      if (match) {
        const [, id, authors, year, title, source] = match
        
        const reference: any = {
          id: `ref${id}`,
          type: "article-journal",
          title: title.trim(),
          author: parseAuthors(authors.trim()),
          issued: {
            "date-parts": [[Number.parseInt(year)]]
          }
        }

        if (source?.trim()) {
          const sourceTrimmed = source.trim()
          if (sourceTrimmed.toLowerCase().includes('scopus') || 
              sourceTrimmed.toLowerCase().includes('ieee') || 
              sourceTrimmed.toLowerCase().includes('wos')) {
            reference["container-title"] = sourceTrimmed
          } else {
            reference["publisher"] = sourceTrimmed
          }
        }

        references.push(reference)
        refCounter = Math.max(refCounter, Number.parseInt(id) + 1)
      }
    }

    // Patrón 2: Referencias metodológicas (PRISMA, etc.)
    // Formato: Autor (Año): Título. [Fuente]. [doi: xxx]
    const methodRefRegex = /^(?!\[)([A-Z][^(]+?)\s+\((\d{4})\)[:.]\s+([^.]+)(?:\.\s+([A-Z][^.]+?))?(?:\s+doi:\s*(.+?))?$/gm
    
    let match
    while ((match = methodRefRegex.exec(cleanText)) !== null) {
      const [, authors, year, title, source, doi] = match
      
      // Evitar duplicados de referencias ya capturadas
      const isDuplicate = references.some(ref => 
        ref.title.toLowerCase() === title.trim().toLowerCase()
      )
      
      if (!isDuplicate) {
        const reference: any = {
          id: `ref${refCounter++}`,
          type: "article-journal",
          title: title.trim(),
          author: parseAuthors(authors.trim()),
          issued: {
            "date-parts": [[Number.parseInt(year)]]
          }
        }

        if (source?.trim()) {
          reference["container-title"] = source.trim()
        }

        if (doi?.trim()) {
          reference["DOI"] = doi.trim()
        }

        references.push(reference)
      }
    }

    return references
  }

  const parseAuthors = (authorsString: string): any[] => {
    // Limpiar asteriscos y espacios extras
    const cleanAuthors = authorsString.replaceAll('*', '').trim()
    
    // Separar por comas, "and", "y", "et al."
    const etAlRegex = /^et\s+al\.?$/i
    // Split por delimitadores comunes: coma, punto y coma, 'and', 'y', 'et al.'
    const authorList = cleanAuthors
      .split(/[,;]\s*|\s+(?:and|y|et\s+al\.?)\s+/i)
      .map(a => a.trim())
      .filter(a => a.length > 0 && !etAlRegex.test(a))

    return authorList.map(author => {
      // Formato: "Apellido, Iniciales" o "Apellido Iniciales"
      const parts = author.split(/\s+/)
      
      // Si tiene formato "Apellido, I.I." 
      if (author.includes(',')) {
        const [family, ...givenParts] = author.split(',').map(p => p.trim())
        return {
          family: family,
          given: givenParts.join(' ').replaceAll('.', '. ').trim()
        }
      }
      
      // Si tiene múltiples partes, último es apellido
      if (parts.length >= 2) {
        // Verificar si todas las partes excepto la primera son iniciales
        const initialRegex = /^[A-Z]\.?$/
        const hasInitials = parts.slice(1).every(p => initialRegex.test(p))
        
        if (hasInitials) {
          // Formato: Apellido I. I.
          return {
            family: parts[0],
            given: parts.slice(1).join(' ')
          }
        } else {
          // Formato: Nombre Apellido
          return {
            family: parts.at(-1)!,
            given: parts.slice(0, -1).join(' ')
          }
        }
      }
      
      // Solo un nombre
      return {
        family: author,
        given: ""
      }
    })
  }

  const convertMarkdownToLatex = (markdown: string): string => {
    if (!markdown) return ''
    
    let latex = markdown
    
    // PASO 1: Convertir headers PRIMERO (antes de escapar #)
    latex = latex.replaceAll(/^###\s+\d+\.\d+\.\d+\s+(.+)$/gm, String.raw`\subsubsection{$1}`)
    latex = latex.replaceAll(/^###\s+(.+)$/gm, String.raw`\subsubsection{$1}`)
    latex = latex.replaceAll(/^##\s+\d+\.\d+\s+(.+)$/gm, String.raw`\subsection{$1}`)
    latex = latex.replaceAll(/^##\s+(.+)$/gm, String.raw`\subsection{$1}`)
    latex = latex.replaceAll(/^#\s+\d+\.\s+(.+)$/gm, String.raw`\section{$1}`)
    latex = latex.replaceAll(/^#\s+(.+)$/gm, String.raw`\section{$1}`)
    
    // PASO 1.5: Eliminar títulos duplicados (líneas en negrita o subsecciones justo después de secciones)
    // Ejemplo: \section{Conclusiones}\n\textbf{Conclusiones} -> \section{Conclusiones}
    latex = latex.replaceAll(/\\(section|subsection|subsubsection)\{([^}]+)\}\s*\n\s*\\textbf\{\2\}/g, String.raw`\$1{$2}`)
    // Eliminar subsecciones duplicadas después de secciones con el mismo nombre
    latex = latex.replaceAll(/\\section\{([^}]+)\}\s*\n\s*\\subsection\{\1\}/g, String.raw`\section{$1}`)
    
    // PASO 2: Detectar y convertir tablas Markdown COMPLETAS
    const tableRegex = /(\|.+\|[\r\n]+)+/g
    latex = latex.replaceAll(tableRegex, (tableMatch) => {
      const rows = tableMatch.trim().split('\n').filter(row => row.trim())
      if (rows.length < 2) return tableMatch
      
      // Detectar separador de headers (|---|---|)
      const headerSepIndex = rows.findIndex(row => /^\|[\s-:|]+\|$/.test(row))
      if (headerSepIndex === -1) return tableMatch // No es tabla válida
      
      const headerRow = rows[headerSepIndex - 1]
      const dataRows = rows.slice(headerSepIndex + 1)
      
      if (!headerRow) return tableMatch
      
      // Extraer headers
      const headers = headerRow.split('|')
        .map(h => h.trim())
        .filter(Boolean)
      
      const numCols = headers.length
      
      // IMPORTANTE: Usar p{width} para columnas con texto largo
      let colSpec = ''
      if (numCols === 2) {
        // Tabla de 2 columnas: primera corta, segunda larga (ej: base de datos + cadena de búsqueda)
        colSpec = 'p{3cm} p{12cm}'
      } else if (numCols === 3) {
        // Tabla de 3 columnas: ID corto, dos columnas medianas
        colSpec = 'p{2cm} p{6cm} p{6cm}'
      } else if (numCols === 4) {
        // Tabla de 4 columnas: ID corto, tres columnas medianas
        colSpec = 'p{2cm} p{4cm} p{4cm} p{4cm}'
      } else if (numCols === 5) {
        // Tabla de 5 columnas: ID corto, cuatro columnas pequeñas
        colSpec = 'p{1.5cm} p{3.5cm} p{3cm} p{3cm} p{3.5cm}'
      } else if (numCols === 6) {
        // Tabla de 6 columnas: características de estudios (ID, Autor, Tipo, Contexto, Tecnología, Publicación)
        colSpec = 'p{1cm} p{4cm} p{3cm} p{3cm} p{4cm} p{4cm}'
      } else if (numCols === 7) {
        // Tabla de 7 columnas: síntesis de resultados (ID, Evidencia, Métricas, RQ1, RQ2, RQ3, Calidad)
        colSpec = 'p{1cm} p{3.5cm} p{3cm} p{1.5cm} p{1.5cm} p{1.5cm} p{2cm}'
      } else {
        // Tablas con 8+ columnas: usar columnas centradas compactas
        colSpec = 'c '.repeat(numCols).trim()
      }
      
      // Construir tabla LaTeX con espaciado vertical mejorado
      let latexTable = '\n\\begin{table}[H]\n\\centering\n'
      latexTable += '\\renewcommand{\\arraystretch}{1.2}\n'
      latexTable += `\\begin{tabular}{${colSpec}}\n\\toprule\n`
      
      // Headers
      latexTable += headers.join(' & ') + ' \\\\\n\\midrule\n'
      
      // Data rows
      dataRows.forEach(row => {
        const cells = row.split('|')
          .map(c => c.trim())
          .filter(Boolean)
        if (cells.length > 0) {
          latexTable += cells.join(' & ') + ' \\\\\n'
        }
      })
      
      latexTable += '\\bottomrule\n\\end{tabular}\n\\caption{Tabla}\n\\end{table}\n\n'
      return latexTable
    })
    
    // PASO 3: Convertir imágenes
    latex = latex.replaceAll(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      const imageName = url.split('/').pop() || 'imagen.png'
      return `\n\\begin{figure}[H]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{images/${imageName}}\n\\caption{${alt}}\n\\end{figure}\n\n`
    })
    
    // PASO 4: Convertir listas con viñetas y numeradas
    const lines = latex.split('\n')
    let inItemize = false
    let inEnumerate = false
    const processedLines: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const nextLine = lines[i + 1] || ''
      
      const bulletRegex = /^[-*]\s+(.+)$/
      const bulletTestRegex = /^[-*]\s+/
      const numberedRegex = /^\d+\.\s+(.+)$/
      const numberedTestRegex = /^\d+\.\s+/
      
      // Lista con viñetas
      if (bulletRegex.test(line)) {
        if (!inItemize) {
          processedLines.push(String.raw`\begin{itemize}`)
          inItemize = true
        }
        processedLines.push(line.replace(bulletRegex, String.raw`  \item $1`))
        
        if (!bulletTestRegex.test(nextLine)) {
          processedLines.push(String.raw`\end{itemize}`)
          inItemize = false
        }
      }
      // Lista numerada
      else if (numberedRegex.test(line)) {
        if (!inEnumerate) {
          processedLines.push(String.raw`\begin{enumerate}`)
          inEnumerate = true
        }
        processedLines.push(line.replace(numberedRegex, String.raw`  \item $1`))
        
        if (!numberedTestRegex.test(nextLine)) {
          processedLines.push(String.raw`\end{enumerate}`)
          inEnumerate = false
        }
      }
      else {
        processedLines.push(line)
      }
    }
    
    latex = processedLines.join('\n')
    
    // PASO 5: Convertir bold y cursiva
    latex = latex.replaceAll(/\*\*(.+?)\*\*/g, String.raw`\textbf{$1}`)
    latex = latex.replaceAll(/\*(.+?)\*/g, String.raw`\textit{$1}`)
    
    // PASO 6: Escapar caracteres especiales (DESPUÉS de todas las conversiones)
    // IMPORTANTE: NO escapar { } porque son parte de la sintaxis LaTeX
    // Solo escapar: & % $ _ ~ ^
    latex = latex.replaceAll(/([&%$_~^])/g, String.raw`\$1`)
    
    return latex
  }

  const calculateCompletion = () => {
    if (!currentVersion) return 0
    const sections = Object.values(currentVersion.content)
    const filledSections = sections.filter((s) => s.trim().length > 100).length
    return Math.round((filledSections / sections.length) * 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {/* Project Header */}
          {project && <ProjectHeader project={project} />}

          {/* Status Alert */}
          {!status && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <Lock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
                Cargando estado del proyecto...
              </AlertDescription>
            </Alert>
          )}

          {status && !status.canGenerate && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <Lock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
                {status.message}
              </AlertDescription>
            </Alert>
          )}

          {status && status.canGenerate && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <Sparkles className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
                {status.message} Puede generar el artículo científico completo.
              </AlertDescription>
            </Alert>
          )}

          {/* Top Section: 3 Bloques - PRISMA + Generador + Acciones */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bloque 1: PRISMA Completado */}
            <Card>
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  PRISMA Completado
                </CardTitle>
                <CardDescription className="text-xs">
                  Checklist de directrices PRISMA 2020
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 py-2 pb-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Los ítems del checklist PRISMA 2020 se completan automáticamente al cerrar el proceso de cribado, 
                  asegurando el cumplimiento de las directrices internacionales para revisiones sistemáticas.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowPrismaDialog(true)}
                  className="w-full"
                  size="sm"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver PRISMA
                </Button>
              </CardContent>
            </Card>

            {/* Bloque 2: Generar Artículo Completo */}
            <Card>
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm font-semibold">Generar Artículo Completo</CardTitle>
                <CardDescription className="text-xs">
                  Crea todas las secciones del artículo automáticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-2 pb-3">
               
                <Button
                  onClick={handleGenerateFullArticle}
                  disabled={isGenerating || !status?.canGenerate}
                  className="w-full"
                  size="sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generar Borrador Completo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Bloque 3: Acciones */}
            <Card>
              <CardHeader >
                <CardTitle className="text-sm font-semibold">Acciones</CardTitle>
                <CardDescription className="text-xs">
                  Gestiona y exporta tu artículo científico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 ">
                <Button
                  variant="outline"
                  onClick={handleExportLatex}
                  disabled={!currentVersion || isGenerating}
                  className="w-full"
                  size="sm"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar LaTeX
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportReferences}
                  disabled={!currentVersion || isGenerating}
                  className="w-full"
                  size="sm"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar Referencias JSON
                </Button>
                <Button onClick={handleSaveVersion} disabled={isGenerating || isSaving} className="w-full" size="sm">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Versión
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* New Layout: Index (col-3) + Content (col-9) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Sidebar: Index + Version History */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="sticky top-6">
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                    <FileText className="h-3 w-3" />
                    Índice del Artículo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5 py-2">
                  <button
                    onClick={() => document.getElementById('section-title')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Título
                  </button>
                  <button
                    onClick={() => document.getElementById('section-abstract')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Resumen
                  </button>
                  <button
                    onClick={() => document.getElementById('section-introduction')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Introducción
                  </button>
                  <button
                    onClick={() => document.getElementById('section-methods')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Métodos
                  </button>
                  <button
                    onClick={() => document.getElementById('section-results')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Resultados
                  </button>
                  <button
                    onClick={() => document.getElementById('section-discussion')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Discusión
                  </button>
                  <button
                    onClick={() => document.getElementById('section-conclusions')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Conclusiones
                  </button>
                  <button
                    onClick={() => document.getElementById('section-references')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded-md transition-colors"
                  >
                    Referencias
                  </button>
                </CardContent>
              </Card>

              <VersionHistory
                versions={versions}
                currentVersionId={currentVersionId || ''}
                onSelectVersion={setCurrentVersionId}
                onRestoreVersion={handleRestoreVersion}
              />
            </div>

            {/* Center: Main Content Area (Article Editor) */}
            <div className="lg:col-span-9">
              {currentVersion && currentVersion.id !== 'v1-temp' ? (
                <ArticleEditor
                  version={currentVersion}
                  onContentChange={handleContentChange}
                  disabled={isGenerating}
                />
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="rounded-full bg-muted p-6">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold">No hay contenido generado aún</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Haz clic en "Generar Borrador Completo" para crear automáticamente todas las secciones del artículo científico basándote en tu protocolo y resultados de cribado.
                      </p>
                    </div>
                    <Button
                      onClick={handleGenerateFullArticle}
                      disabled={isGenerating || !status?.canGenerate}
                      size="lg"
                      className="mt-4"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generando artículo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generar Borrador Completo
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Diálogo de Vista Previa de PRISMA */}
      <PrismaPreviewDialog
        projectId={params.id}
        open={showPrismaDialog}
        onOpenChange={setShowPrismaDialog}
      />


    </div>
  )
}
