"use client"

import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  XCircle, 
  FileText,
  Search,
  ClipboardCheck,
  Save,
  Rocket
} from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const PRISMA_WPOM_ITEMS = [
  { 
    id: "prisma-1",
    number: 1, 
    question: "¿Es entendible por alguien que no es experto?", 
    description: "La pregunta y el objetivo están redactados con claridad, sin jerga innecesaria",
    autoFillKey: "clarity"
  },
  { 
    id: "prisma-2",
    number: 2, 
    question: "¿Se definen claramente las \"variables\"?", 
    description: "Los conceptos clave están conceptualizados y organizados",
    autoFillKey: "variables"
  },
  { 
    id: "prisma-3",
    number: 3, 
    question: "¿Se describe la justificación de la revisión en relación con lo que se conoce?", 
    description: "Se detalla el contexto y necesidad del estudio en el área",
    autoFillKey: "rationale"
  },
  { 
    id: "prisma-4",
    number: 4, 
    question: "¿Se proporciona una declaración explícita de las preguntas usando PICOS?", 
    description: "Se aplicó el marco PICO para formular la pregunta central",
    autoFillKey: "pico"
  },
  { 
    id: "prisma-5",
    number: 5, 
    question: "Si extiende investigaciones previas, ¿explica por qué se necesita este estudio?", 
    description: "Se justifica la necesidad por gaps en la literatura actual",
    autoFillKey: "need"
  },
  { 
    id: "prisma-6",
    number: 6, 
    question: "¿Se especifica y justifica la estrategia de búsqueda (manual, automatizada o mixta)?", 
    description: "Estrategia de búsqueda definida y justificada",
    autoFillKey: "searchStrategy"
  },
  { 
    id: "prisma-7",
    number: 7, 
    question: "¿Se identifican los criterios de inclusión y exclusión de estudios primarios?", 
    description: "Criterios estructurados y organizados",
    autoFillKey: "criteria"
  },
  { 
    id: "prisma-8",
    number: 8, 
    question: "¿Se describen todas las fuentes de información utilizadas y fechas de cobertura?", 
    description: "Bases de datos y período temporal especificados",
    autoFillKey: "sources"
  },
  { 
    id: "prisma-9",
    number: 9, 
    question: "¿Se presenta la estrategia electrónica de búsqueda completa para al menos una base de datos?", 
    description: "Cadena de búsqueda detallada con operadores booleanos",
    autoFillKey: "searchString"
  },
  { 
    id: "prisma-10",
    number: 10, 
    question: "¿Se identifican las revistas y conferencias para búsquedas manuales?", 
    description: "Fuentes específicas para búsqueda manual planificadas",
    autoFillKey: "manualSearch"
  },
  { 
    id: "prisma-11",
    number: 11, 
    question: "¿Se especifica el período temporal de cobertura y su justificación?", 
    description: "Rango de años definido con justificación",
    autoFillKey: "temporalRange"
  },
  { 
    id: "prisma-12",
    number: 12, 
    question: "¿Se indican procedimientos auxiliares (e.g., consultas a expertos, revisión de bibliografía secundaria)?", 
    description: "Procedimientos adicionales como contacto con autores, revisión de referencias",
    autoFillKey: "auxiliary"
  },
  { 
    id: "prisma-13",
    number: 13, 
    question: "¿Se describe cómo se evaluará el proceso de búsqueda (comparación con revisión previa, etc.)?", 
    description: "Método de validación de la búsqueda especificado",
    autoFillKey: "validation"
  }
]

const PRISMA_SECTIONS = {
  understanding: {
    name: "CLARIDAD Y DEFINICIÓN",
    icon: FileText,
    items: [1, 2]
  },
  justification: {
    name: "JUSTIFICACIÓN Y OBJETIVOS", 
    icon: ClipboardCheck,
    items: [3, 4, 5]
  },
  methodology: {
    name: "METODOLOGÍA DE BÚSQUEDA",
    icon: Search,
    items: [6, 7, 8, 9, 10, 11, 12, 13]
  }
}

export function PrismaCheckStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  const router = useRouter()
  const [prismaData, setPrismaData] = useState<Record<string, { complies: boolean | null; evidence: string }>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Auto-rellenar evidencias al montar
  useEffect(() => {
    autoFillEvidences()
  }, [])

  const autoFillEvidences = () => {
    const researchArea = data.researchArea || "su área de investigación"
    const newPrismaData: Record<string, { complies: boolean | null; evidence: string }> = {}

    // 1. Claridad para no expertos
    newPrismaData["prisma-1"] = {
      complies: !!(data.projectDescription && data.selectedTitle),
      evidence: data.projectDescription ?
        `La pregunta y el objetivo están redactados con claridad, sin jerga innecesaria.\n\n` +
        `Título: "${data.selectedTitle}"\n` +
        `Descripción: ${data.projectDescription}\n\n` +
        `El planteamiento es comprensible para lectores no especializados en ${researchArea}.` :
        "Pendiente: Verificar que la pregunta sea entendible sin jerga técnica"
    }

    // 2. Definición de variables
    const hasVariables = !!(data.protocolDefinition?.technologies?.length > 0 || data.pico.population)
    newPrismaData["prisma-2"] = {
      complies: hasVariables,
      evidence: hasVariables ?
        `Los conceptos clave están conceptualizados y organizados:\n\n` +
        `Variables tecnológicas: ${data.protocolDefinition?.technologies?.join(', ') || 'No especificado'}\n` +
        `Población: ${data.pico.population || 'No especificado'}\n` +
        `Intervención: ${data.pico.intervention || 'No especificado'}\n` +
        `Dominio: ${data.protocolDefinition?.applicationDomain?.join(', ') || researchArea}\n\n` +
        `Todas las variables están claramente definidas y contextualizadas.` :
        "Pendiente: Definir claramente las variables del estudio"
    }

    // 3. Justificación con conocimiento existente
    newPrismaData["prisma-3"] = {
      complies: !!data.projectDescription,
      evidence: data.projectDescription ?
        `Justificación de la revisión:\n\n${data.projectDescription}\n\n` +
        `Área: ${researchArea}\n\n` +
        `Se detalla el contexto y necesidad del estudio en relación con la literatura actual de ${researchArea}.` :
        "Pendiente: Describir la justificación en relación con lo que ya se conoce"
    }

    // 4. Declaración PICO
    const hasPICO = !!(data.pico.population && data.pico.intervention && data.pico.outcome)
    newPrismaData["prisma-4"] = {
      complies: hasPICO,
      evidence: hasPICO ?
        `Marco PICO aplicado para formular la pregunta central:\n\n` +
        `🎯 Población (P): ${data.pico.population}\n` +
        `⚙️ Intervención (I): ${data.pico.intervention}\n` +
        `⚖️ Comparación (C): ${data.pico.comparison || 'No aplica'}\n` +
        `📊 Resultado (O): ${data.pico.outcome}\n\n` +
        `Este marco permite una búsqueda estructurada y replicable en ${researchArea}.` :
        "Pendiente: Completar el marco PICO/PICOS"
    }

    // 5. Justificación de necesidad
    newPrismaData["prisma-5"] = {
      complies: !!data.projectDescription,
      evidence: data.projectDescription ?
        `Necesidad del estudio justificada:\n\n${data.projectDescription}\n\n` +
        `Se justifica la necesidad por gaps identificados en la literatura actual de ${researchArea}. ` +
        `Esta revisión sistemática aborda aspectos no cubiertos o insuficientemente analizados en estudios previos.` :
        "Pendiente: Explicar por qué se necesita este estudio (gaps en la literatura)"
    }

    // 6. Estrategia de búsqueda especificada
    const hasSearchPlan = (data.searchPlan?.databases?.length || 0) > 0
    const dbCount = data.searchPlan?.databases?.length || 0
    const searchType = dbCount > 1 ? 'Mixta (automatizada + manual planificada)' : 'Automatizada'
    newPrismaData["prisma-6"] = {
      complies: hasSearchPlan,
      evidence: hasSearchPlan && data.searchPlan?.databases ?
        `Estrategia de búsqueda especificada y justificada:\n\n` +
        `Tipo: ${searchType}\n\n` +
        `Bases de datos seleccionadas (${dbCount}):\n` +
        data.searchPlan.databases.map((db, i) => `${i + 1}. ${db}`).join('\n') + '\n\n' +
        `Justificación: Bases seleccionadas por su cobertura en ${researchArea} y acceso a literatura actualizada.` :
        "Pendiente: Especificar y justificar la estrategia de búsqueda"
    }

    // 7. Criterios de inclusión/exclusión
    const totalCriteria = data.inclusionCriteria.length + data.exclusionCriteria.length
    const inclusionList = data.inclusionCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')
    const exclusionList = data.exclusionCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')
    newPrismaData["prisma-7"] = {
      complies: totalCriteria > 0,
      evidence: totalCriteria > 0 ?
        `Criterios identificados y estructurados (${totalCriteria} total):\n\n` +
        `✅ INCLUSIÓN (${data.inclusionCriteria.length}):\n${inclusionList}\n\n` +
        `❌ EXCLUSIÓN (${data.exclusionCriteria.length}):\n${exclusionList}\n\n` +
        `Criterios organizados por dominio tecnológico y temporal para ${researchArea}.` :
        "Pendiente: Identificar criterios de inclusión y exclusión"
    }

    // 8. Fuentes de información y fechas
    const databases = data.searchPlan?.databases || []
    newPrismaData["prisma-8"] = {
      complies: databases.length > 0,
      evidence: databases.length > 0 ?
        `Fuentes de información y fechas de cobertura:\n\n` +
        databases.map((db, i) => `${i + 1}. ${db}`).join('\n') + '\n\n' +
        `Fecha de consulta: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n` +
        `Período de cobertura: Se especificará en la estrategia de búsqueda.\n` +
        `Fuentes seleccionadas por relevancia en ${researchArea}.` :
        "Pendiente: Describir fuentes y fechas de cobertura"
    }

    // 9. Estrategia electrónica completa
    const queries = data.searchPlan?.searchQueries || []
    const queryList = queries.map((q) => {
      const resultText = q.resultCount === null ? 'Pendiente de ejecutar' : `Resultados: ${q.resultCount}`
      return `📊 ${q.databaseName}:\n${q.query}\n${resultText}`
    }).join('\n\n')
    newPrismaData["prisma-9"] = {
      complies: queries.length > 0,
      evidence: queries.length > 0 ?
        `Estrategia electrónica de búsqueda presentada:\n\n${queryList}\n\n` +
        `Cadena detallada con operadores booleanos para ${researchArea}.\n` +
        `La estrategia es replicable y está documentada completamente.` :
        "Pendiente: Presentar cadena de búsqueda completa con operadores booleanos"
    }

    // 10. Búsquedas manuales
    newPrismaData["prisma-10"] = {
      complies: null,
      evidence: `Búsqueda manual planificada:\n\n` +
        `Se identificarán revistas y conferencias específicas de ${researchArea}.\n\n` +
        `Fuentes planificadas:\n` +
        `• Conferencias principales del área\n` +
        `• Revistas especializadas indexadas\n` +
        `• Repositorios institucionales relevantes\n\n` +
        `La búsqueda manual complementará la búsqueda automatizada.`
    }

    // 11. Período temporal
    newPrismaData["prisma-11"] = {
      complies: null,
      evidence: `Período temporal de cobertura:\n\n` +
        `Se especificará el rango de años para la búsqueda.\n\n` +
        `Justificación: El período se determinará considerando:\n` +
        `• Madurez de las tecnologías en ${researchArea}\n` +
        `• Disponibilidad de estudios primarios\n` +
        `• Relevancia temporal para la investigación actual\n\n` +
        `Se documentará claramente en el protocolo final.`
    }

    // 12. Procedimientos auxiliares
    newPrismaData["prisma-12"] = {
      complies: null,
      evidence: `Procedimientos auxiliares planificados:\n\n` +
        `• Revisión de listas de referencias de estudios clave\n` +
        `• Contacto con autores si faltan documentos importantes\n` +
        `• Consulta con expertos en ${researchArea} si es necesario\n` +
        `• Búsqueda de literatura gris relevante\n\n` +
        `Estos procedimientos complementarán la búsqueda principal.`
    }

    // 13. Evaluación del proceso
    newPrismaData["prisma-13"] = {
      complies: null,
      evidence: `Evaluación del proceso de búsqueda:\n\n` +
        `Métodos de validación:\n` +
        `• Comparación con revisiones previas (si existen)\n` +
        `• Verificación de recuperación de papers conocidos\n` +
        `• Análisis de cobertura de conceptos clave en ${researchArea}\n\n` +
        `Se documentarán los resultados de la validación para asegurar exhaustividad.`
    }

    setPrismaData(newPrismaData)
    
    toast({
      title: "✅ PRISMA auto-completado",
      description: "Evidencias prellenadas con datos del protocolo"
    })
  }

  // Funciones deshabilitadas - Los campos son read-only en el paso final
  // const updateItemCompliance = (itemId: string, complies: boolean) => {
  //   setPrismaData(prev => ({
  //     ...prev,
  //     [itemId]: { ...prev[itemId], complies }
  //   }))
  // }

  // const updateItemEvidence = (itemId: string, evidence: string) => {
  //   setPrismaData(prev => ({
  //     ...prev,
  //     [itemId]: { ...prev[itemId], evidence }
  //   }))
  // }

  const calculateCompliance = () => {
    const items = Object.values(prismaData)
    const completed = items.filter(i => i.complies === true).length
    return items.length > 0 ? Math.round((completed / items.length) * 100) : 0
  }

  const handleFinishProject = async () => {
    setIsSaving(true)
    try {
      if (data.projectId) {
        toast({
          title: "✅ Proyecto ya guardado",
          description: "Redirigiendo al proyecto..."
        })
        setTimeout(() => router.push(`/projects/${data.projectId}`), 1000)
        return
      }

      const projectData = {
        title: data.selectedTitle,
        description: data.projectDescription,
        protocol: {
          proposedTitle: data.selectedTitle,
          population: data.pico.population,
          intervention: data.pico.intervention,
          comparison: data.pico.comparison || '',
          outcomes: data.pico.outcome,
          isMatrix: data.matrixIsNot.is,
          isNotMatrix: data.matrixIsNot.isNot,
          inclusionCriteria: data.inclusionCriteria,
          exclusionCriteria: data.exclusionCriteria,
          databases: data.searchPlan?.databases || [],
          searchString: '',
          temporalRange: '',
          keyTerms: {
            technology: data.protocolDefinition?.technologies || [],
            domain: data.protocolDefinition?.applicationDomain || [],
            studyType: data.protocolDefinition?.studyType || [],
            themes: data.protocolDefinition?.thematicFocus || []
          }
        }
      }

      const result = await apiClient.createProject(projectData)

      if (result.success && result.data?.project?.id) {
        toast({
          title: "🎉 Proyecto creado exitosamente",
          description: "Redirigiendo a tu proyecto..."
        })
        updateData({ projectId: result.data.project.id, lastSaved: new Date() })
        setTimeout(() => router.push(`/projects/${result.data.project.id}`), 1500)
      }
    } catch (error: any) {
      toast({
        title: "❌ Error al crear proyecto",
        description: error.message || "No se pudo crear el proyecto",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const compliance = calculateCompliance()
  const researchArea = data.researchArea || "su área de investigación"

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header consistente con otras secciones */}
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">PRISMA 2020 y Confirmación</h2>
        <p className="text-lg text-muted-foreground">
          Verificación de calidad PRISMA 2020 para revisión sistemática en {researchArea}
        </p>
      </div>

      {/* Mensaje informativo */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Reporte Final del Protocolo
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Este es el paso final de tu protocolo de investigación. A continuación se presenta un reporte completo con la verificación de calidad PRISMA 2020. 
                Los campos son de <strong>solo lectura</strong> y representan tu protocolo final. Una vez que confirmes, se creará tu proyecto y podrás comenzar la fase de ejecución.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Ejecutivo del Protocolo */}
      <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-950 dark:to-blue-950/20">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Resumen Ejecutivo del Protocolo</CardTitle>
              <CardDescription className="text-blue-100 mt-1">
                Reporte final de tu revisión sistemática
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Título del Proyecto */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              Título de la Investigación
            </div>
            <p className="text-lg font-semibold mt-1">{data.selectedTitle}</p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Bases de Datos</div>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                {data.searchPlan?.databases?.length || 0}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">Criterios I/E</div>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                {(data.inclusionCriteria?.length || 0) + (data.exclusionCriteria?.length || 0)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">Términos Clave</div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
                {(data.protocolTerms?.tecnologia?.length || 0) + (data.protocolTerms?.dominio?.length || 0)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase">Calidad PRISMA</div>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-2">{compliance}%</div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Proyecto</span>
              <p className="font-medium mt-1">📚 {data.projectName}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Área de Investigación</span>
              <p className="font-medium mt-1">🎯 {researchArea.replace('-', ' ').toUpperCase()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progreso PRISMA 2020</span>
              <span className="font-semibold">{Object.values(prismaData).filter(i => i.complies === true).length} / {Object.keys(prismaData).length} ítems</span>
            </div>
            <Progress value={compliance} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* PRISMA/WPOM Checklist con Acordeón */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Checklist PRISMA / WPOM
          </CardTitle>
          <CardDescription>
            Evaluación de 13 ítems del protocolo de investigación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={["understanding", "justification", "methodology"]} className="w-full">
            {Object.entries(PRISMA_SECTIONS).map(([key, section]) => {
              const SectionIcon = section.icon
              const sectionItems = PRISMA_WPOM_ITEMS.filter(item => section.items.includes(item.number))
              const completedInSection = sectionItems.filter(item => prismaData[item.id]?.complies === true).length
              
              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <SectionIcon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-semibold">{section.name}</span>
                      </div>
                      <Badge variant={completedInSection === sectionItems.length ? "default" : "secondary"}>
                        {completedInSection}/{sectionItems.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {sectionItems.map((item) => {
                        const itemData = prismaData[item.id] || { complies: null, evidence: "" }
                        
                        return (
                          <div key={item.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex gap-2 flex-shrink-0 pt-1">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    itemData.complies === true 
                                      ? "bg-green-600 text-white shadow-md" 
                                      : "bg-gray-200 text-gray-400 dark:bg-gray-800"
                                  }`}
                                  title={itemData.complies === true ? "Sí cumple" : "No evaluado"}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    itemData.complies === false 
                                      ? "bg-red-600 text-white shadow-md" 
                                      : "bg-gray-200 text-gray-400 dark:bg-gray-800"
                                  }`}
                                  title={itemData.complies === false ? "No cumple" : "No evaluado"}
                                >
                                  <XCircle className="h-4 w-4" />
                                </div>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-start gap-2 mb-1">
                                  <Badge variant="outline" className="font-mono text-xs">{item.number}</Badge>
                                  <h4 className="font-semibold text-sm leading-tight">{item.question}</h4>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
                                
                                <Textarea
                                  placeholder="No hay evidencia registrada para este ítem"
                                  value={itemData.evidence || "Este ítem fue evaluado automáticamente basándose en la información del protocolo."}
                                  rows={4}
                                  readOnly
                                  className="text-sm resize-none bg-muted/30 cursor-default border-muted"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Card de Finalización */}
      <Card className="border-4 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950 dark:via-blue-950 dark:to-purple-950 shadow-2xl">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            {/* Icono y Título Principal */}
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                <Rocket className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                ¡Protocolo Completado!
              </h3>
              <p className="text-lg font-medium text-muted-foreground">
                Has finalizado la definición de tu protocolo de investigación
              </p>
            </div>

            {/* Información de completitud */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border-2 border-green-200 dark:border-green-800 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-muted-foreground">Calidad PRISMA 2020</span>
                <Badge variant={compliance >= 80 ? "default" : "secondary"} className="text-lg px-3 py-1">
                  {compliance}%
                </Badge>
              </div>
              <Progress value={compliance} className="h-3 mb-4" />
              <p className="text-sm text-muted-foreground">
                {compliance >= 80 
                  ? "✅ Excelente: Tu protocolo cumple con altos estándares de calidad"
                  : compliance >= 60
                  ? "⚠️ Bueno: Puedes mejorar algunos aspectos del protocolo más adelante"
                  : "📝 Básico: Considera revisar y completar más ítems del checklist"}
              </p>
            </div>

            {/* Mensaje de cierre */}
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-300 dark:border-blue-700 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-left space-y-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Este es el cierre de la fase de planificación
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Al confirmar, se creará tu proyecto y podrás comenzar con la <strong>fase de ejecución</strong>: 
                    búsqueda de literatura, cribado de referencias y análisis de datos.
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de Confirmación */}
            <Button
              size="lg"
              onClick={handleFinishProject}
              disabled={isSaving}
              className="w-full max-w-md h-14 text-lg font-semibold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all"
            >
              {isSaving ? (
                <>
                  <Save className="h-6 w-6 mr-2 animate-pulse" />
                  Guardando proyecto...
                </>
              ) : (
                <>
                  <Rocket className="h-6 w-6 mr-2" />
                  Confirmar y Crear Proyecto
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Al confirmar aceptas que el protocolo está listo para la fase de ejecución
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
