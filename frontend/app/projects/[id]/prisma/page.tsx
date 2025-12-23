"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProjectBreadcrumb } from "@/components/project-breadcrumb"
import { ProjectHeader } from "@/components/project-header"
import type { Project } from "@/lib/types"
import { PrismaProgress } from "@/components/prisma/prisma-progress"
import { SectionFilter } from "@/components/prisma/section-filter"
import { prismaChecklist, type PrismaItemData, type PrismaStats } from "@/lib/prisma-items"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FileDown, Loader2, RefreshCw, Sparkles, AlertCircle, Info } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ContentTypeBadge } from "@/components/prisma/content-type-badge"
import { Textarea } from "@/components/ui/textarea"

export default function PrismaPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [currentSection, setCurrentSection] = useState("Todos")
  const [project, setProject] = useState<Project | null>(null)
  const [prismaItems, setPrismaItems] = useState<Record<number, PrismaItemData>>({})
  const [stats, setStats] = useState<PrismaStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasTriedGenerate, setHasTriedGenerate] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [protocol, setProtocol] = useState<any>(null)
  const [isExtractingPDFs, setIsExtractingPDFs] = useState(false)
  const [isCompletingPrisma, setIsCompletingPrisma] = useState(false)
  const [extractionResult, setExtractionResult] = useState<any>(null)

  useEffect(() => {
    loadProjectAndPrismaData()
  }, [params.id])

  async function loadProjectAndPrismaData() {
    try {
      setIsLoading(true)
      
      // Cargar proyecto
      const projectData = await apiClient.getProject(params.id)
      setProject(projectData)
      setProjectName(projectData?.name || projectData?.title || "Proyecto")
      
      // Cargar protocolo
      const protocolObj = await apiClient.getProtocol(params.id)
      setProtocol(protocolObj)
      
      console.log('📋 Protocolo cargado:', protocolObj)
      
      // Mapear datos del protocolo a ítems PRISMA automáticamente
      const itemsMap: Record<number, PrismaItemData> = {}
      
      if (!protocolObj) {
        console.warn('⚠️ No se encontró protocolo')
        setPrismaItems({})
        setStats({ completed: 0, pending: 27, automated: 0, hybrid: 0, human: 0, total: 27, aiValidated: 0, completionPercentage: 0 })
        setIsLoading(false)
        return
      }
      
      // Primero: cargar los 13 ítems del reporte final PRISMA si existen
      if (protocolObj.prismaCompliance && Array.isArray(protocolObj.prismaCompliance) && protocolObj.prismaCompliance.length > 0) {
        console.log('✅ Cargando ítems PRISMA desde reporte final del protocolo:', protocolObj.prismaCompliance.length)
        
        protocolObj.prismaCompliance.forEach((prismaItem: any) => {
          // Soporte para múltiples formatos de datos
          const itemNumber = prismaItem.itemNumber || prismaItem.item_number || prismaItem.number
          const content = prismaItem.content || prismaItem.evidence || prismaItem.text || ''
          
          if (itemNumber && content) {
            const prismaChecklistItem = prismaChecklist.find(p => p.id === itemNumber)
            itemsMap[itemNumber] = {
              projectId: params.id,
              itemNumber: itemNumber,
              section: prismaChecklistItem?.section || '',
              content: content,
              contentType: 'automated',
              dataSource: prismaItem.dataSource || prismaItem.data_source || 'Protocolo: Reporte Final PRISMA',
              completed: true
            }
          }
        })
        
        console.log(`✅ ${Object.keys(itemsMap).length} ítems PRISMA cargados desde reporte final`)
      } else {
        console.log('⚠️ No se encontraron ítems PRISMA en el reporte final, cargando desde campos básicos del protocolo')
      }
      
      // Si no hay ítems del reporte final, mapear desde campos básicos del protocolo
      if (Object.keys(itemsMap).length === 0) {
        // Ítem 1: Título (TÍTULO)
        if (protocolObj.proposedTitle || protocolObj.selectedTitle) {
          itemsMap[1] = {
            projectId: params.id,
            itemNumber: 1,
            section: 'TÍTULO',
            content: protocolObj.proposedTitle || protocolObj.selectedTitle,
            contentType: 'automated',
            dataSource: 'Protocolo: Título Propuesto',
            completed: true
          }
        }
      
      // Ítem 2: Resumen estructurado (RESUMEN)
      if (protocolObj.refinedQuestion || protocolObj.population) {
        const resumenParts = []
        if (protocolObj.refinedQuestion) resumenParts.push(`Pregunta de investigación: ${protocolObj.refinedQuestion}`)
        if (protocolObj.population) resumenParts.push(`Población: ${protocolObj.population}`)
        if (protocolObj.intervention) resumenParts.push(`Intervención: ${protocolObj.intervention}`)
        if (protocolObj.outcomes) resumenParts.push(`Resultados esperados: ${protocolObj.outcomes}`)
        
        if (resumenParts.length > 0) {
          itemsMap[2] = {
            projectId: params.id,
            itemNumber: 2,
            section: 'RESUMEN',
            content: resumenParts.join('\n\n'),
            contentType: 'automated',
            dataSource: 'Protocolo: Resumen derivado del protocolo',
            completed: true
          }
        }
      }
      
      // Ítem 3: Justificación (INTRODUCCIÓN)
      if (protocolObj.justification || protocolObj.refinedQuestion) {
        itemsMap[3] = {
          projectId: params.id,
          itemNumber: 3,
          section: 'INTRODUCCIÓN',
          content: protocolObj.justification || `Pregunta de investigación refinada: ${protocolObj.refinedQuestion}`,
          contentType: 'automated',
          dataSource: 'Protocolo: Justificación',
          completed: true
        }
      }
      
      // Ítem 4: Objetivos (INTRODUCCIÓN - PICO)
      if (protocolObj.population || protocolObj.intervention) {
        const picoLines = []
        if (protocolObj.population) picoLines.push(`Población: ${protocolObj.population}`)
        if (protocolObj.intervention) picoLines.push(`Intervención: ${protocolObj.intervention}`)
        if (protocolObj.comparison) picoLines.push(`Comparación: ${protocolObj.comparison}`)
        if (protocolObj.outcomes) picoLines.push(`Resultados: ${protocolObj.outcomes}`)
        
        if (protocolObj.researchQuestions && protocolObj.researchQuestions.length > 0) {
          picoLines.push('\nPreguntas de investigación:')
          protocolObj.researchQuestions.forEach((q: string, i: number) => {
            picoLines.push(`${i + 1}. ${q}`)
          })
        }
        
        itemsMap[4] = {
          projectId: params.id,
          itemNumber: 4,
          section: 'INTRODUCCIÓN',
          content: picoLines.join('\n'),
          contentType: 'automated',
          dataSource: 'Protocolo: Marco PICO y preguntas de investigación',
          completed: true
        }
      }
      
      // Ítem 5: Criterios de elegibilidad (MÉTODOS)
      if (protocolObj.inclusionCriteria || protocolObj.exclusionCriteria) {
        const inclusion = protocolObj.inclusionCriteria || []
        const exclusion = protocolObj.exclusionCriteria || []
        const inclusionText = inclusion.map((c: string, i: number) => i + 1 + '. ' + c).join('\n')
        const exclusionText = exclusion.map((c: string, i: number) => i + 1 + '. ' + c).join('\n')
        const criteriosText = 'Criterios de Inclusión:\n' + inclusionText + '\n\nCriterios de Exclusión:\n' + exclusionText
        itemsMap[5] = {
          projectId: params.id,
          itemNumber: 5,
          section: 'MÉTODOS',
          content: criteriosText,
          contentType: 'automated',
          dataSource: 'Protocolo: Criterios de Elegibilidad',
          completed: true
        }
      }
      
      // Ítem 6: Fuentes de información (MÉTODOS - Bases de datos)
      if (protocolObj.databases && protocolObj.databases.length > 0) {
        const dbLines = ['Bases de datos consultadas:']
        protocolObj.databases.forEach((db: any) => {
          const dbName = db.name || db
          dbLines.push(`• ${dbName}`)
        })
        
        if (protocolObj.temporalRange) {
          if (protocolObj.temporalRange.start || protocolObj.temporalRange.end) {
            dbLines.push(`\nRango temporal: ${protocolObj.temporalRange.start || 'Sin límite'} - ${protocolObj.temporalRange.end || 'Actualidad'}`)
          }
        } else if (protocolObj.dateRangeStart || protocolObj.dateRangeEnd) {
          dbLines.push(`\nRango temporal: ${protocolObj.dateRangeStart || 'Sin límite'} - ${protocolObj.dateRangeEnd || 'Actualidad'}`)
        }
        
        itemsMap[6] = {
          projectId: params.id,
          itemNumber: 6,
          section: 'MÉTODOS',
          content: dbLines.join('\n'),
          contentType: 'automated',
          dataSource: 'Protocolo: Bases de Datos y rango temporal',
          completed: true
        }
      }
      
      // Ítem 7: Estrategia de búsqueda (MÉTODOS)
      if (protocolObj.searchQueries && protocolObj.searchQueries.length > 0) {
        // Usar searchQueries que contiene todas las cadenas específicas por base de datos
        const dbSearches = protocolObj.searchQueries.map((queryObj: any) => {
          const dbName = queryObj.database || queryObj.databaseName || 'Base de datos'
          return `${dbName}:\n${queryObj.query}`
        })
        
        const searchText = dbSearches.join('\n\n')
        
        itemsMap[7] = {
          projectId: params.id,
          itemNumber: 7,
          section: 'MÉTODOS',
          content: searchText,
          contentType: 'automated',
          dataSource: 'Protocolo: Estrategia de Búsqueda',
          completed: true
        }
      } else if (protocolObj.searchString || (protocolObj.databases && protocolObj.databases.length > 0)) {
        // Fallback a método antiguo si no hay searchQueries
        let searchText = ''
        if (protocolObj.searchString) {
          searchText = `Cadena de búsqueda:\n${protocolObj.searchString}`
        } else if (protocolObj.databases) {
          const dbSearches = protocolObj.databases
            .filter((db: any) => db.searchString)
            .map((db: any) => `${db.name}:\n${db.searchString}`)
          if (dbSearches.length > 0) {
            searchText = dbSearches.join('\n\n')
          }
        }
        
        if (searchText) {
          itemsMap[7] = {
            projectId: params.id,
            itemNumber: 7,
            section: 'MÉTODOS',
            content: searchText,
            contentType: 'automated',
            dataSource: 'Protocolo: Estrategia de Búsqueda',
            completed: true
          }
        }
      }
      
      // Ítem 10: Elementos de datos (MÉTODOS)
      if (protocolObj.keyTerms && Object.keys(protocolObj.keyTerms).length > 0) {
        const termsLines = ['Términos clave extraídos:']
        Object.entries(protocolObj.keyTerms).forEach(([category, terms]: [string, any]) => {
          if (Array.isArray(terms) && terms.length > 0) {
            termsLines.push(`\n${category}:`)
            terms.forEach((term: string) => termsLines.push(`• ${term}`))
          }
        })
        
        if (termsLines.length > 1) {
          itemsMap[10] = {
            projectId: params.id,
            itemNumber: 10,
            section: 'MÉTODOS',
            content: termsLines.join('\n'),
            contentType: 'automated',
            dataSource: 'Protocolo: Términos clave',
            completed: true
          }
        }
      }
      }
      
      console.log('✅ Ítems mapeados:', Object.keys(itemsMap).length)
      
      setPrismaItems(itemsMap)
      
      // Calcular estadísticas - contar solo ítems realmente completados
      const allItems = Object.values(itemsMap)
      const completedCount = allItems.filter(item => item.completed === true).length
      const pending = 27 - completedCount
      
      console.log(`📊 Estadísticas PRISMA: ${completedCount}/27 completados, ${pending} pendientes`)
      
      setStats({
        total: 27,
        completed: completedCount,
        pending,
        automated: completedCount,
        human: 0,
        hybrid: 0,
        aiValidated: 0,
        completionPercentage: Math.round((completedCount / 27) * 100)
      })
      
    } catch (error: any) {
      console.error("❌ Error cargando datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del protocolo",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGenerateContent() {
    try {
      setIsGenerating(true)
      setHasTriedGenerate(true)
      
      const data = await apiClient.generatePrismaContent(params.id)
      
      const itemsMap: Record<number, PrismaItemData> = {}
      data.items.forEach((item: PrismaItemData) => {
        itemsMap[item.itemNumber] = item
      })
      
      setPrismaItems(itemsMap)
      setStats(data.stats)
      
      toast({
        title: "Contenido generado exitosamente",
        description: `Se generó contenido para ${data.stats.completed} ítems PRISMA`,
      })
    } catch (error: any) {
      console.error("Error generando contenido:", error)
      toast({
        title: "Error al generar contenido",
        description: error.message || "No se pudo generar el contenido automáticamente",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleExtractPDFs() {
    try {
      setIsExtractingPDFs(true)
      
      toast({
        title: "Procesando referencias incluidas",
        description: "Analizando PDFs completos y abstracts cuando no hay PDF. Esto puede tomar varios minutos...",
      })
      
      const response = await apiClient.extractPDFsData(params.id)
      
      setExtractionResult(response.data)
      
      const withFullText = response.data.withFullText || 0
      const abstractOnly = response.data.abstractOnly || 0
      
      toast({
        title: "Referencias analizadas exitosamente",
        description: `${response.data.processed} referencias procesadas: ${withFullText} con PDF completo, ${abstractOnly} solo abstract`,
      })
      
      console.log('✅ Resultado de extracción:', response.data)
    } catch (error: any) {
      console.error('❌ Error procesando PDFs:', error)
      toast({
        title: "Error al procesar referencias",
        description: error.message || "No se pudieron procesar las referencias. Verifica que haya PDFs o abstracts disponibles.",
        variant: "destructive"
      })
    } finally {
      setIsExtractingPDFs(false)
    }
  }

  async function handleCompletePrisma() {
    try {
      setIsCompletingPrisma(true)
      
      toast({
        title: "Completando PRISMA",
        description: "Generando ítems pendientes con IA...",
      })
      
      const response = await apiClient.completePrismaItems(params.id)
      
      toast({
        title: "PRISMA actualizado",
        description: response.data.message,
      })
      
      console.log('✅ Ítems generados:', response.data)
      
      // Recargar datos de PRISMA
      await loadProjectAndPrismaData()
      
    } catch (error: any) {
      console.error('❌ Error completando PRISMA:', error)
      toast({
        title: "Error al completar PRISMA",
        description: error.message || "No se pudieron generar los ítems PRISMA automáticamente",
        variant: "destructive"
      })
    } finally {
      setIsCompletingPrisma(false)
    }
  }

  async function handleToggleComplete(itemNumber: number) {
    try {
      const currentItem = prismaItems[itemNumber]
      const newCompleted = !currentItem?.completed
      
      const updatedItem = await apiClient.updatePrismaItem(params.id, itemNumber, {
        completed: newCompleted
      })
      
      setPrismaItems(prev => ({
        ...prev,
        [itemNumber]: updatedItem
      }))

      const newStats = await apiClient.getPrismaStats(params.id)
      setStats(newStats)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el ítem",
        variant: "destructive"
      })
    }
  }

  async function handleContentChange(itemNumber: number, content: string) {
    try {
      const updatedItem = await apiClient.updatePrismaItemContent(params.id, itemNumber, content)
      
      setPrismaItems(prev => ({
        ...prev,
        [itemNumber]: updatedItem
      }))

      const newStats = await apiClient.getPrismaStats(params.id)
      setStats(newStats)
      
      toast({
        description: "Contenido guardado automáticamente",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo guardar el contenido",
        variant: "destructive"
      })
    }
  }

  async function handleRequestAISuggestion(itemNumber: number) {
    try {
      const data = await apiClient.validatePrismaItemWithAI(params.id, itemNumber)
      
      setPrismaItems(prev => ({
        ...prev,
        [itemNumber]: data.item
      }))

      toast({
        title: "Validación completada",
        description: "Se generaron sugerencias metodológicas",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo validar el ítem",
        variant: "destructive"
      })
    }
  }

  const totalItems = prismaChecklist.length
  const completedCount = Object.values(prismaItems).filter(item => item?.completed).length

  const filteredItems = prismaChecklist.filter(item => {
    if (currentSection === "Todos") return true
    return item.section === currentSection
  })

  // Agrupar ítems por sección y mantener el orden
  const sectionOrder = ['TÍTULO', 'RESUMEN', 'INTRODUCCIÓN', 'MÉTODOS', 'RESULTADOS', 'DISCUSIÓN', 'OTRA INFORMACIÓN']
  
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = []
    }
    acc[item.section].push(item)
    return acc
  }, {} as Record<string, typeof filteredItems>)

  const sections = sectionOrder.filter(section => groupedItems[section])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Cargando checklist PRISMA...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <main className="container mx-auto px-4 py-6">
        {/* Project Header */}
        {project && <ProjectHeader project={project} />}

        <div className="space-y-6 mt-6">

          {/* Alert cuando PRISMA está bloqueado */}
          {protocol?.prismaLocked && (
            <Alert className="bg-gradient-to-r from-green-50 to-blue-50 border-green-300">
              <AlertCircle className="h-5 w-5 text-green-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold text-green-700">
                    🎉 PRISMA 2020 Completado y Bloqueado
                  </div>
                  <div className="text-sm text-gray-700">
                    Los 27 ítems del checklist PRISMA están completos. Esta sección está bloqueada para preservar la integridad metodológica.
                    <br />
                    <span className="font-medium">Siguiente paso:</span> Dirígete a la sección <strong>Artículo</strong> para generar el manuscrito final.
                  </div>
                  {protocol.prismaCompletedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      Completado: {new Date(protocol.prismaCompletedAt).toLocaleString('es-ES')}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Alert cuando PRISMA está completo pero no bloqueado */}
          {!protocol?.prismaLocked && Object.keys(prismaItems).length === 27 && (
            <Alert className="border-green-300 dark:border-green-700">
              <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm text-foreground">
                <strong>🎉 PRISMA Completado (27/27 ítems)</strong>
                <br />
                El checklist PRISMA 2020 está completo. Puedes proceder a la sección de <strong>Artículo</strong> para generar el manuscrito final.
              </AlertDescription>
            </Alert>
          )}

          {/* Alert para PDFs extraídos */}
          {extractionResult && extractionResult.processed > 0 && (
            <Alert className="border-blue-300 dark:border-blue-700">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-foreground">
                <strong>✓ {extractionResult.processed} referencias analizadas</strong> - Datos estructurados extraídos exitosamente.
                {extractionResult.withFullText > 0 && ` ${extractionResult.withFullText} con PDF completo`}
                {extractionResult.abstractOnly > 0 && `, ${extractionResult.abstractOnly} solo abstract`}
                {extractionResult.errors > 0 && ` (${extractionResult.errors} errores)`}
              </AlertDescription>
            </Alert>
          )}

          {Object.keys(prismaItems).length < 27 && protocol?.fase2_unlocked && !protocol?.prismaLocked && (
            <Alert className="border-purple-300 dark:border-purple-700">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <AlertDescription className="text-sm text-foreground">
                <strong>{27 - Object.keys(prismaItems).length} ítems pendientes.</strong> Haz clic en <strong>"Completar PRISMA Automáticamente"</strong> para que el sistema:
                <ol className="mt-2 ml-4 list-decimal space-y-1">
                  <li><strong>Analice</strong> todas las referencias incluidas (PDFs y abstracts)</li>
                  <li><strong>Genere</strong> el contexto PRISMA con tus datos</li>
                  <li><strong>Complete</strong> automáticamente los ítems 16, 17, 23, 24, 26, 27</li>
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">Este proceso puede tomar 2-3 minutos dependiendo del número de referencias.</p>
              </AlertDescription>
            </Alert>
          )}

          {Object.keys(prismaItems).length < 27 && !protocol?.fase2_unlocked && (
            <Alert className="border-amber-300 dark:border-amber-700">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-sm text-foreground">
                <strong>{27 - Object.keys(prismaItems).length} ítems pendientes de completar.</strong> Los datos del protocolo se cargan automáticamente. 
                Completa el cribado (Fase 2) para habilitar la generación automática con IA.
              </AlertDescription>
            </Alert>
          )}

          {Object.keys(prismaItems).length > 0 && (
            <Alert className="border-green-300 dark:border-green-700">
              <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm text-foreground">
                <strong>✓ {Object.keys(prismaItems).length} ítems cargados automáticamente</strong> desde tu protocolo (título, PICO, criterios, bases de datos, etc.)
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {/* Botón unificado: Analiza referencias + Completa PRISMA */}
              {protocol?.fase2_unlocked && Object.keys(prismaItems).length < 27 && !protocol?.prismaLocked && (
                <Button 
                  onClick={handleCompletePrisma} 
                  disabled={isCompletingPrisma}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                >
                  {isCompletingPrisma ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando (Paso {isCompletingPrisma ? '1-3' : ''}...)
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Completar PRISMA Automáticamente
                    </>
                  )}
                </Button>
              )}

              {/* Botón original de generar contenido (legacy) */}
              {Object.keys(prismaItems).length < 27 && !protocol?.fase2_unlocked && !protocol?.prismaLocked && (
                <Button 
                  onClick={handleGenerateContent} 
                  disabled={isGenerating}
                  className="bg-primary"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando con IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Completar con IA los {27 - Object.keys(prismaItems).length} ítems restantes
                    </>
                  )}
                </Button>
              )}

              <Button 
                onClick={loadProjectAndPrismaData} 
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar
              </Button>
            </div>

            <Button variant="outline" disabled={protocol?.prismaLocked}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SectionFilter 
                currentSection={currentSection} 
                onSectionChange={setCurrentSection} 
              />

              <div className="space-y-4">
                {sections.length > 0 ? (
                  <Accordion type="multiple" className="w-full space-y-2">
                    {sections.map((section) => {
                      const sectionItems = groupedItems[section]
                      const completedInSection = sectionItems.filter(item => prismaItems[item.id]?.completed).length
                      const totalInSection = sectionItems.length
                      
                      return (
                        <AccordionItem 
                          key={section} 
                          value={section}
                          className="border rounded-lg bg-card"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                                  {section}
                                </h2>
                                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                                  {completedInSection}/{totalInSection} completados
                                </span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          
                          <AccordionContent className="px-6 pb-4">
                            <div className="space-y-3 pt-2">
                              {sectionItems.map((item) => {
                                const itemData = prismaItems[item.id]
                                const content = itemData?.content || ""
                                const contentType = itemData?.contentType || 'pending'
                                const dataSource = itemData?.dataSource
                                
                                return (
                                  <Card key={item.id} className="overflow-hidden">
                                    <CardHeader className="bg-muted/30 pb-3">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                          <CardTitle className="text-base font-semibold">
                                            {item.id}. {item.item}
                                          </CardTitle>
                                          <CardDescription className="text-sm mt-1">
                                            {item.description}
                                          </CardDescription>
                                        </div>
                                        {itemData && (
                                          <div className="shrink-0">
                                            <ContentTypeBadge contentType={contentType} dataSource={dataSource} />
                                          </div>
                                        )}
                                      </div>
                                    </CardHeader>
                                    
                                    <CardContent className="pt-4">
                                      <div className="space-y-4">
                                        {content ? (
                                          <div>
                                            <Textarea
                                              value={content}
                                              onChange={(e) => handleContentChange(item.id, e.target.value)}
                                              placeholder="Editar contenido..."
                                              className="min-h-[120px] resize-y"
                                              disabled={protocol?.prismaLocked}
                                            />
                                            {protocol?.prismaLocked && (
                                              <p className="text-xs text-muted-foreground mt-2">
                                                🔒 PRISMA bloqueado - No se puede editar
                                              </p>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="bg-muted/50 rounded-lg p-6 text-center">
                                            <p className="text-muted-foreground text-sm">
                                              Este ítem no tiene contenido aún. Puedes completarlo manualmente o usar el botón 
                                              "Completar con IA los ítems restantes" en la parte superior de la página.
                                            </p>
                                          </div>
                                        )}
                                        
                                        {dataSource && (
                                          <p className="text-xs text-muted-foreground">
                                            Fuente: {dataSource}
                                          </p>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No hay ítems en esta sección
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <PrismaProgress 
                completedItems={stats?.completed || 0} 
                totalItems={totalItems} 
              />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen</CardTitle>
                  <CardDescription>Estado actual del checklist</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-semibold">{totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completados</span>
                    <span className="font-semibold text-green-600">{stats?.completed || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pendientes</span>
                    <span className="font-semibold text-amber-600">{stats?.pending || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Automatizados</span>
                    <span className="font-semibold text-blue-600">{stats?.automated || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Híbridos</span>
                    <span className="font-semibold text-purple-600">{stats?.hybrid || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
