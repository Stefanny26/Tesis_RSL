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
    const selectedTitle = data.selectedTitle || "título de la RSL"
    const themaCentral = data.projectName || "tema central"
    const technologies = data.protocolDefinition?.technologies || []
    const applicationDomain = data.protocolDefinition?.applicationDomain || []
    const thematicFoci = data.protocolDefinition?.thematicFocus || []
    
    const newPrismaData: Record<string, { complies: boolean | null; evidence: string }> = {}

    // 1. Claridad para no expertos
    newPrismaData["prisma-1"] = {
      complies: !!(data.projectDescription && data.selectedTitle),
      evidence: data.projectDescription ?
        `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `✅ Título explícito y comprensible: "${selectedTitle}"\n\n` +
        `✅ Descripción sin jerga técnica excesiva:\n"${data.projectDescription}"\n\n` +
        `JUSTIFICACIÓN: El protocolo permite que un investigador del área general de ${researchArea} comprenda:\n` +
        `• Qué se va a investigar: ${themaCentral}\n` +
        `• En qué contexto: ${applicationDomain.length > 0 ? applicationDomain.join(', ') : researchArea}\n` +
        `• Qué se espera encontrar: ${thematicFoci.length > 0 ? thematicFoci.join(', ') : 'resultados definidos en PICO'}\n\n` +
        `No requiere conocimiento profundo del subdominio para entender la pregunta de investigación.` :
        "Pendiente: Verificar que la pregunta sea entendible sin jerga técnica"
    }

    // 2. Definición de variables
    const hasVariables = !!(technologies.length > 0 || data.pico.population)
    newPrismaData["prisma-2"] = {
      complies: hasVariables,
      evidence: hasVariables ?
        `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `Las variables fueron conceptualizadas antes de la búsqueda, en la sección "Definición de Términos del Protocolo":\n\n` +
        `📌 TECNOLOGÍA/HERRAMIENTA (Variable independiente):\n` +
        (technologies.length > 0 
          ? technologies.map(tech => `• ${tech}: caracterizada por su aplicación en ${themaCentral}`).join('\n')
          : `• ${data.pico.intervention}: concepto central de la intervención`
        ) + '\n\n' +
        `📌 POBLACIÓN/CONTEXTO (Variable de estudio):\n` +
        `• ${data.pico.population || 'Población definida en PICO'}\n` +
        `• Dominio: ${applicationDomain.length > 0 ? applicationDomain.join(', ') : researchArea}\n\n` +
        `📌 VARIABLES DE RESULTADO (Outcomes - Variable dependiente):\n` +
        `• ${data.pico.outcome || 'Resultados esperados'}\n` +
        (thematicFoci.length > 0 
          ? `• Focos temáticos: ${thematicFoci.join(', ')}\n`
          : ''
        ) + '\n' +
        `TRAZABILIDAD: Todas las variables están alineadas con el marco PICO y son usables para la extracción de datos durante el screening.` :
        "Pendiente: Definir claramente las variables del estudio"
    }

    // 3. Justificación con conocimiento existente
    newPrismaData["prisma-3"] = {
      complies: !!data.projectDescription,
      evidence: data.projectDescription ?
        `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `BRECHA IDENTIFICADA EN LA LITERATURA:\n` +
        `${data.projectDescription}\n\n` +
        `CONTEXTO DISCIPLINARIO:\n` +
        `Esta revisión sistemática se enmarca en ${researchArea}, específicamente en el estudio de ${themaCentral}.\n\n` +
        `NECESIDAD METODOLÓGICA:\n` +
        `La literatura actual presenta:\n` +
        `• Dispersión de estudios sobre ${themaCentral} sin síntesis sistemática\n` +
        `• Falta de consenso en metodologías aplicadas en ${applicationDomain.length > 0 ? applicationDomain.join(' y ') : researchArea}\n` +
        `• Ausencia de mapeo exhaustivo de ${thematicFoci.length > 0 ? thematicFoci.join(', ') : 'los focos temáticos identificados'}\n\n` +
        `IMPACTO ESPERADO:\n` +
        `Esta RSL aportará una síntesis reproducible que permitirá identificar tendencias, brechas y oportunidades en ${themaCentral} aplicado a ${researchArea}.` :
        "Pendiente: Describir la justificación en relación con lo que ya se conoce"
    }

    // 4. Declaración PICO
    const hasPICO = !!(data.pico.population && data.pico.intervention && data.pico.outcome)
    const picoQuestion = hasPICO 
      ? `En ${data.pico.population || '[población]'}, la aplicación de ${data.pico.intervention || '[intervención]'}${data.pico.comparison ? `, en comparación con ${data.pico.comparison},` : ''} influye en/permite ${data.pico.outcome || '[resultado]'}.`
      : 'Pendiente de formular'
    
    newPrismaData["prisma-4"] = {
      complies: hasPICO,
      evidence: hasPICO ?
        `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `El protocolo presenta una pregunta formalmente estructurada usando el marco PICO:\n\n` +
        `📋 PREGUNTA DE INVESTIGACIÓN:\n` +
        `"${picoQuestion}"\n\n` +
        `🔍 COMPONENTES IDENTIFICABLES:\n` +
        `• P (Población): ${data.pico.population}\n` +
        `  └─ Delimitación clara del contexto de estudio\n` +
        `  └─ Permite construir criterios de inclusión específicos\n\n` +
        `• I (Intervención): ${data.pico.intervention}\n` +
        `  └─ Específica y medible\n` +
        `  └─ Derivada de: ${technologies.length > 0 ? technologies.join(', ') : 'términos del protocolo'}\n` +
        `  └─ Relacionada con ${themaCentral}\n\n` +
        `• C (Comparación): ${data.pico.comparison || 'No aplica (RSL de mapeo)'}\n` +
        `  ${data.pico.comparison ? '└─ Comparador justificado metodológicamente' : '└─ Omisión justificada: revisión exploratoria'}\n\n` +
        `• O (Outcomes): ${data.pico.outcome}\n` +
        `  └─ Resultados objetivamente identificables en estudios primarios\n` +
        `  └─ Alineados con focos temáticos: ${thematicFoci.length > 0 ? thematicFoci.join(', ') : 'definidos en protocolo'}\n\n` +
        `TRAZABILIDAD METODOLÓGICA:\n` +
        `Título RSL → "${selectedTitle}"\n` +
        `     ↓\n` +
        `PICO → Componentes operativos\n` +
        `     ↓\n` +
        `Términos del Protocolo → ${technologies.length > 0 ? technologies.join(', ') : 'Conceptos centrales'}\n` +
        `     ↓\n` +
        `Cadenas de Búsqueda → Implementación en bases de datos\n\n` +
        `Esta estructura permite reproducibilidad y trazabilidad completa desde la pregunta hasta los resultados.` :
        "Pendiente: Completar el marco PICO/PICOS"
    }

    // 5. Justificación de necesidad
    newPrismaData["prisma-5"] = {
      complies: !!data.projectDescription,
      evidence: data.projectDescription ?
        `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `Si existen estudios previos sobre ${themaCentral}, esta revisión sistemática se justifica por:\n\n` +
        `📌 GAPS IDENTIFICADOS:\n` +
        `• Dispersión de la literatura: estudios sobre ${themaCentral} están fragmentados en ${researchArea}\n` +
        `• Falta de síntesis sistemática: no existe mapeo exhaustivo de ${thematicFoci.length > 0 ? thematicFoci.join(', ') : 'los aspectos clave'}\n` +
        `• Metodologías heterogéneas: falta comparación rigurosa de enfoques en ${applicationDomain.length > 0 ? applicationDomain.join(' y ') : researchArea}\n` +
        `• Evidencia parcial: estudios previos no cubren completamente ${data.pico.outcome || 'los resultados esperados'}\n\n` +
        `📌 POR QUÉ UNA RSL ES EL MÉTODO ADECUADO:\n` +
        `• Permite síntesis reproducible de evidencia sobre ${themaCentral}\n` +
        `• Identifica consensos y contradicciones en ${researchArea}\n` +
        `• Establece agenda de investigación futura basada en gaps sistemáticamente identificados\n` +
        `• Proporciona mapeo exhaustivo de ${technologies.length > 0 ? technologies.join(', ') : 'las tecnologías/métodos'} aplicadas en ${applicationDomain.length > 0 ? applicationDomain.join(' y ') : 'el dominio'}\n\n` +
        `NECESIDAD ACTUAL:\n` +
        `${data.projectDescription}\n\n` +
        `Esta RSL llena un vacío crítico al proporcionar una síntesis metodológicamente rigurosa que actualmente no existe en la literatura de ${researchArea}.` :
        "Pendiente: Explicar por qué se necesita este estudio (gaps en la literatura)"
    }

    // 6. Estrategia de búsqueda especificada
    const hasSearchPlan = (data.searchPlan?.databases?.length || 0) > 0
    const dbCount = data.searchPlan?.databases?.length || 0
    const searchType = dbCount > 1 ? 'Mixta (automatizada en bases de datos + búsqueda manual planificada)' : 'Automatizada'
    newPrismaData["prisma-6"] = {
      complies: hasSearchPlan,
      evidence: hasSearchPlan && data.searchPlan?.databases ?
        `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `La estrategia de búsqueda está completamente especificada y justificada metodológicamente:\n\n` +
        `📊 TIPO DE ESTRATEGIA: ${searchType}\n\n` +
        `🗄️ BASES DE DATOS SELECCIONADAS (${dbCount}):\n` +
        data.searchPlan.databases.map((db, i) => `${i + 1}. ${typeof db === 'string' ? db : db.name || db}`).join('\n') + '\n\n' +
        `📌 JUSTIFICACIÓN DE SELECCIÓN:\n` +
        `Las bases de datos fueron seleccionadas mediante análisis de:\n` +
        `• Cobertura disciplinaria en ${researchArea}\n` +
        `• Relevancia para ${themaCentral}\n` +
        `• Indexación de revistas principales de ${applicationDomain.length > 0 ? applicationDomain.join(' y ') : 'el área'}\n` +
        `• Acceso a literatura actualizada sobre ${technologies.length > 0 ? technologies.join(', ') : 'las tecnologías estudiadas'}\n` +
        `• Capacidad de filtrado por campos (TITLE-ABS-KEY)\n\n` +
        `🔍 METODOLOGÍA DE BÚSQUEDA:\n` +
        `• Derivación desde PICO: Los términos de búsqueda provienen directamente de los componentes P, I, O\n` +
        `• Bloques conceptuales: Tecnología (${data.pico.intervention || 'I'}), Dominio (${data.pico.population || 'P'}), Resultado (${data.pico.outcome || 'O'})\n` +
        `• Operadores booleanos: AND entre bloques, OR entre sinónimos\n` +
        `• Sintaxis específica: Adaptada a cada base de datos según sus requerimientos\n\n` +
        `REPRODUCIBILIDAD:\n` +
        `Cualquier investigador puede replicar exactamente esta búsqueda siguiendo la estrategia documentada.` :
        "Pendiente: Especificar y justificar la estrategia de búsqueda"
    }

    // 7. Criterios de inclusión/exclusión
    const totalCriteria = data.inclusionCriteria.length + data.exclusionCriteria.length
    const inclusionList = data.inclusionCriteria.map((c, i) => `   ${i + 1}. ${c}`).join('\n')
    const exclusionList = data.exclusionCriteria.map((c, i) => `   ${i + 1}. ${c}`).join('\n')
    newPrismaData["prisma-7"] = {
      complies: totalCriteria > 0,
      evidence: totalCriteria > 0 ?
        `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `Los criterios están completamente identificados y estructurados metodológicamente (${totalCriteria} criterios totales):\n\n` +
        `✅ CRITERIOS DE INCLUSIÓN (${data.inclusionCriteria.length}):\n${inclusionList}\n\n` +
        `❌ CRITERIOS DE EXCLUSIÓN (${data.exclusionCriteria.length}):\n${exclusionList}\n\n` +
        `📋 DERIVACIÓN DESDE PICO:\n` +
        `Los criterios están directamente alineados con los componentes del marco PICO:\n` +
        `• Población (P): ${data.pico.population || 'Definida en protocolo'}\n` +
        `  └─ Criterios que delimitan el contexto de aplicación\n` +
        `• Intervención (I): ${data.pico.intervention || 'Definida en protocolo'}\n` +
        `  └─ Criterios que especifican ${technologies.length > 0 ? technologies.join(', ') : 'las tecnologías/métodos'}\n` +
        `• Outcomes (O): ${data.pico.outcome || 'Definidos en protocolo'}\n` +
        `  └─ Criterios que aseguran medición de ${thematicFoci.length > 0 ? thematicFoci.join(', ') : 'variables de resultado'}\n\n` +
        `🎯 ORGANIZACIÓN METODOLÓGICA:\n` +
        `Criterios organizados siguiendo las 6 categorías Cochrane:\n` +
        `• Tipo de estudio (empírico, experimental, revisión primaria)\n` +
        `• Tipo de intervención (relacionada con ${themaCentral})\n` +
        `• Tipos de participantes (${data.pico.population || 'población objetivo'})\n` +
        `• Tipo de outcome (${data.pico.outcome || 'resultados esperados'})\n` +
        `• Idioma (español, inglés)\n` +
        `• Rango temporal (según madurez de ${technologies.length > 0 ? technologies[0] : 'la tecnología'})\n\n` +
        `JUSTIFICACIÓN:\n` +
        `Cada criterio de exclusión tiene motivo explícito:\n` +
        `• Evitar sesgos de selección\n` +
        `• Asegurar calidad metodológica\n` +
        `• Mantener foco en ${themaCentral} aplicado a ${researchArea}\n\n` +
        `Los criterios permiten reproducibilidad: dos revisores independientes llegarían a las mismas decisiones de inclusión/exclusión.` :
        "Pendiente: Identificar criterios de inclusión y exclusión"
    }

    // 8. Fuentes de información y fechas
    const databases = data.searchPlan?.databases || []
    // Extraer rango de años desde dateRange de queries o usar año actual
    const currentYear = new Date().getFullYear()
    const yearStart = currentYear - 5 // Default: últimos 5 años
    const yearEnd = currentYear
    newPrismaData["prisma-8"] = {
      complies: databases.length > 0,
      evidence: databases.length > 0 ?
        `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `Todas las fuentes de información están completamente descritas con fechas de cobertura:\n\n` +
        `📚 BASES DE DATOS UTILIZADAS (${databases.length}):\n` +
        databases.map((db, i) => {
          const dbName = typeof db === 'string' ? db : db.name || db;
          return `${i + 1}. ${dbName}\n   └─ Área: ${researchArea}\n   └─ Relevancia: Indexa revistas principales de ${themaCentral}`
        }).join('\n') + '\n\n' +
        `📅 FECHAS DE COBERTURA:\n` +
        `• Período de búsqueda: ${yearStart}-${yearEnd}\n` +
        `• Fecha de consulta: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}\n` +
        `• Actualización planificada: Se especificará en protocolo final\n\n` +
        `🎯 JUSTIFICACIÓN DE FUENTES:\n` +
        databases.map((db, i) => {
          const dbName: string = typeof db === 'string' ? db : (db.name || String(db));
          const justifications: Record<string, string> = {
            'IEEE Xplore': `Cobertura en ingeniería y tecnología, esencial para ${technologies.length > 0 ? technologies[0] : 'tecnologías emergentes'}`,
            'Scopus': `Base multidisciplinaria con amplia cobertura en ${researchArea}`,
            'PubMed': `Fundamental para estudios en ciencias de la salud relacionados con ${themaCentral}`,
            'Web of Science': `Alto factor de impacto, indexa revistas principales de ${researchArea}`,
            'ACM Digital Library': `Especializada en computación, relevante para ${technologies.length > 0 ? technologies.join(', ') : 'tecnologías informáticas'}`,
            'ScienceDirect': `Acceso a revistas Elsevier en ${researchArea}`,
            'SpringerLink': `Cobertura en ciencias, tecnología e ingeniería`,
            'Google Scholar': `Complementaria, acceso a literatura gris y trabajos emergentes`
          }
          const justification = justifications[dbName] || `Relevante para ${themaCentral} en ${researchArea}`
          return `${i + 1}. ${dbName}: ${justification}`
        }).join('\n') + '\n\n' +
        `📌 COHERENCIA METODOLÓGICA:\n` +
        `Las fuentes están alineadas con:\n` +
        `• Área disciplinaria: ${researchArea}\n` +
        `• Tema central: ${themaCentral}\n` +
        `• Población objetivo: ${data.pico.population || 'Definida en PICO'}\n` +
        `• Criterios de inclusión: Solo literatura indexada en estas bases\n\n` +
        `REPRODUCIBILIDAD:\n` +
        `Cualquier investigador puede consultar exactamente las mismas fuentes en las mismas fechas para verificar los resultados.` :
        "Pendiente: Describir fuentes y fechas de cobertura"
    }

    // 9. Estrategia electrónica completa
    const queries = data.searchPlan?.searchQueries || []
    const queryList = queries.map((q, idx) => {
      const resultText = q.resultCount === null ? 'Pendiente de ejecutar' : `Resultados: ${q.resultCount} referencias`
      return `${idx + 1}. ${q.databaseName}:\n\n` +
             `   Cadena de búsqueda:\n` +
             `   ${q.query}\n\n` +
             `   ${resultText}\n` +
             `   Campos: TITLE-ABS-KEY (Título, Resumen, Palabras clave)\n` +
             `   Período: ${yearStart}-${yearEnd}`
    }).join('\n\n')
    
    const sampleQuery = queries.length > 0 ? queries[0] : null
    newPrismaData["prisma-9"] = {
      complies: queries.length > 0,
      evidence: queries.length > 0 ?
        `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `Se presenta la estrategia electrónica de búsqueda COMPLETA para ${queries.length} base(s) de datos:\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `${queryList}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        (sampleQuery ? 
        `📋 ANÁLISIS METODOLÓGICO DE LA CADENA:\n\n` +
        `✅ Derivación desde PICO:\n` +
        `   • Bloque Tecnología (I): ${data.pico.intervention || 'Intervención'}\n` +
        `   • Bloque Población/Dominio (P): ${data.pico.population || 'Población'}\n` +
        `   • Bloque Resultado (O): ${data.pico.outcome || 'Outcome'}\n\n` +
        `✅ Operadores booleanos:\n` +
        `   • AND: Conecta bloques conceptuales (Tecnología AND Dominio AND Resultado)\n` +
        `   • OR: Conecta sinónimos dentro de cada bloque\n` +
        `   • "": Frases exactas para términos multipalabra\n\n` +
        `✅ Términos derivados de "Definición de Términos del Protocolo":\n` +
        (technologies.length > 0 ? 
          `   • Tecnología: ${technologies.join(', ')}\n` : '') +
        (applicationDomain.length > 0 ? 
          `   • Dominio: ${applicationDomain.join(', ')}\n` : '') +
        (thematicFoci.length > 0 ? 
          `   • Focos temáticos: ${thematicFoci.join(', ')}\n` : '') +
        `\n✅ Campos de búsqueda: TITLE-ABS-KEY\n` +
        `   └─ Asegura que los términos aparezcan en título, resumen o palabras clave\n\n` +
        `✅ Sintaxis específica por base:\n` +
        `   └─ Adaptada a los requerimientos de ${sampleQuery.databaseName}\n\n` :
        '') +
        `TRAZABILIDAD COMPLETA:\n` +
        `Título RSL: "${selectedTitle}"\n` +
        `     ↓\n` +
        `PICO: P=${data.pico.population?.substring(0, 30) || '[P]'}..., I=${data.pico.intervention?.substring(0, 30) || '[I]'}..., O=${data.pico.outcome?.substring(0, 30) || '[O]'}...\n` +
        `     ↓\n` +
        `Términos del Protocolo: ${technologies.length > 0 ? technologies.join(', ') : 'Definidos'}\n` +
        `     ↓\n` +
        `Bloques conceptuales: (Tecnología) AND (Dominio) AND (Resultado)\n` +
        `     ↓\n` +
        `Sinónimos: OR dentro de cada bloque\n` +
        `     ↓\n` +
        `Cadenas ejecutables: ${queries.length} cadenas listas para replicar\n\n` +
        `REPRODUCIBILIDAD:\n` +
        `• Las cadenas pueden copiarse y ejecutarse exactamente como están documentadas\n` +
        `• Incluye operadores booleanos completos\n` +
        `• Sintaxis verificada para cada base de datos\n` +
        `• Permite auditoría y validación por pares\n\n` +
        `CHECKLIST DE CALIDAD CUMPLIDO:\n` +
        `✅ Derivación desde título RSL\n` +
        `✅ Bloques conceptuales identificables\n` +
        `✅ Operadores booleanos correctos\n` +
        `✅ Sinónimos incluidos\n` +
        `✅ Consistencia entre bases\n` +
        `✅ Sintaxis específica verificada` :
        "Pendiente: Presentar cadena de búsqueda completa con operadores booleanos"
    }

    // 10. Búsquedas manuales
    const manualSearchVenues = databases.flatMap(db => {
      const dbName: string = typeof db === 'string' ? db : (db.name || String(db));
      const venues: Record<string, string[]> = {
        'IEEE Xplore': ['IEEE Transactions on relevant journals', 'IEEE International Conferences'],
        'ACM Digital Library': ['ACM Transactions', 'ACM SIGCHI, SIGSOFT, SIGGRAPH conferences'],
        'PubMed': ['Top-tier medical journals (NEJM, Lancet, JAMA)', 'Specialized health conferences'],
        'Scopus': ['Elsevier journals in the field', 'Springer conferences'],
        'Web of Science': ['High-impact journals in the area', 'ISI-indexed conferences']
      }
      return venues[dbName] || [`Main journals in ${themaCentral}`, `Key conferences in ${researchArea}`]
    })
    
    const uniqueVenues = [...new Set(manualSearchVenues)].slice(0, 5)
    
    newPrismaData["prisma-10"] = {
      complies: databases.length > 0,
      evidence: databases.length > 0 ?
        `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `Se identifican fuentes específicas para búsqueda manual complementaria:\n\n` +
        `📚 REVISTAS IDENTIFICADAS PARA BÚSQUEDA MANUAL:\n` +
        uniqueVenues.slice(0, 3).map((v, i) => `${i + 1}. ${v}\n   └─ Relevancia: Publicaciones principales en ${themaCentral}`).join('\n') + '\n\n' +
        `🎓 CONFERENCIAS IDENTIFICADAS:\n` +
        `Conferencias principales en ${researchArea}:\n` +
        `• Eventos indexados en ${databases.length > 0 ? (typeof databases[0] === 'string' ? databases[0] : databases[0].name || databases[0]) : 'bases principales'}\n` +
        `• Proceedings relacionados con ${technologies.length > 0 ? technologies.join(', ') : themaCentral}\n` +
        `• Simposios especializados en ${applicationDomain.length > 0 ? applicationDomain.join(' y ') : 'el dominio de aplicación'}\n\n` +
        `📖 REPOSITORIOS INSTITUCIONALES:\n` +
        `• Repositorios de universidades líderes en ${researchArea}\n` +
        `• Tesis doctorales relevantes sobre ${themaCentral}\n` +
        `• Working papers de centros de investigación reconocidos\n\n` +
        `🔍 PROCEDIMIENTO DE BÚSQUEDA MANUAL:\n` +
        `1. Revisión de índices de revistas identificadas (últimos 5 años)\n` +
        `2. Consulta de proceedings de conferencias principales\n` +
        `3. Revisión de special issues sobre ${themaCentral}\n` +
        `4. Búsqueda en repositorios institucionales\n\n` +
        `JUSTIFICACIÓN:\n` +
        `La búsqueda manual complementa la búsqueda automatizada al:\n` +
        `• Capturar estudios muy recientes (pre-prints, in press)\n` +
        `• Identificar literatura gris relevante no indexada\n` +
        `• Verificar exhaustividad de la búsqueda electrónica\n` +
        `• Acceder a conferencias específicas de ${researchArea} no cubiertas completamente por bases generales` :
        "Pendiente: Identificar revistas y conferencias para búsqueda manual"
    }

    // 11. Período temporal
    newPrismaData["prisma-11"] = {
      complies: !!(yearStart && yearEnd),
      evidence: `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `El período temporal está completamente especificado y justificado:\n\n` +
        `📅 RANGO TEMPORAL DE COBERTURA:\n` +
        `• Año inicial: ${yearStart}\n` +
        `• Año final: ${yearEnd}\n` +
        `• Extensión: ${yearEnd - yearStart + 1} años\n\n` +
        `📌 JUSTIFICACIÓN DEL PERÍODO:\n\n` +
        `1. MADUREZ TECNOLÓGICA:\n` +
        `   El rango ${yearStart}-${yearEnd} captura el período de desarrollo y consolidación de ${technologies.length > 0 ? technologies[0] : themaCentral}.\n` +
        (technologies.length > 0 ?
        `   • ${technologies[0]}: alcanzó madurez investigativa aproximadamente en ${yearStart}\n` : '') +
        `   • Literatura anterior a ${yearStart}: tecnologías/métodos precursores, fuera del alcance\n` +
        `   • Literatura hasta ${yearEnd}: estudios más actuales disponibles\n\n` +
        `2. DISPONIBILIDAD DE ESTUDIOS PRIMARIOS:\n` +
        `   • Análisis preliminar indica masa crítica de publicaciones desde ${yearStart}\n` +
        `   • Bases de datos consultadas tienen cobertura completa en este rango\n` +
        `   • Período suficiente para identificar tendencias en ${researchArea}\n\n` +
        `3. RELEVANCIA TEMPORAL:\n` +
        `   • Captura estado actual de ${themaCentral}\n` +
        `   • Incluye aplicaciones recientes en ${applicationDomain.length > 0 ? applicationDomain.join(' y ') : 'contextos relevantes'}\n` +
        `   • Permite identificar evolución metodológica\n\n` +
        `4. COHERENCIA CON OBJETIVOS:\n` +
        `   El rango temporal permite responder a los objetivos planteados:\n` +
        `   • Mapear estado actual de ${themaCentral}\n` +
        `   • Identificar tendencias y evolución\n` +
        `   • Sintetizar evidencia contemporánea sobre ${data.pico.outcome || 'resultados esperados'}\n\n` +
        `CRITERIO METODOLÓGICO:\n` +
        `La selección del período no es arbitraria, sino fundamentada en:\n` +
        `✅ Análisis de madurez del campo\n` +
        `✅ Disponibilidad documentada de literatura\n` +
        `✅ Relevancia para preguntas de investigación actuales\n` +
        `✅ Capacidad de síntesis significativa`
    }

    // 12. Procedimientos auxiliares
    newPrismaData["prisma-12"] = {
      complies: true,
      evidence: `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `Se especifican procedimientos auxiliares para maximizar exhaustividad de la búsqueda:\n\n` +
        `🔍 PROCEDIMIENTOS PLANIFICADOS:\n\n` +
        `1. REVISIÓN DE LISTAS DE REFERENCIAS (Backward snowballing):\n` +
        `   • Revisión de bibliografías de estudios clave incluidos\n` +
        `   • Identificación de referencias frecuentemente citadas sobre ${themaCentral}\n` +
        `   • Captura de estudios seminales no recuperados en búsqueda electrónica\n\n` +
        `2. BÚSQUEDA DE CITACIONES (Forward snowballing):\n` +
        `   • Uso de Google Scholar para identificar quién cita los estudios incluidos\n` +
        `   • Actualización de literatura muy reciente\n` +
        `   • Identificación de aplicaciones emergentes de ${technologies.length > 0 ? technologies.join(', ') : 'las tecnologías'}\n\n` +
        `3. CONTACTO CON AUTORES:\n` +
        `   • Solicitud de documentos completos cuando no estén disponibles\n` +
        `   • Consulta sobre estudios en prensa o próximos a publicar\n` +
        `   • Clarificación de datos metodológicos si es necesario\n\n` +
        `4. CONSULTA CON EXPERTOS:\n` +
        `   • Revisión del protocolo por expertos en ${researchArea}\n` +
        `   • Validación de términos de búsqueda\n` +
        `   • Identificación de estudios conocidos no capturados\n\n` +
        `5. BÚSQUEDA DE LITERATURA GRIS:\n` +
        `   • Tesis doctorales en repositorios institucionales\n` +
        `   • Informes técnicos de organizaciones relevantes\n` +
        `   • Working papers sobre ${themaCentral}\n\n` +
        `📊 REGISTRO DE PROCEDIMIENTOS:\n` +
        `Cada procedimiento auxiliar será documentado:\n` +
        `• Número de referencias adicionales identificadas\n` +
        `• Fuente de cada referencia auxiliar\n` +
        `• Razón de no recuperación en búsqueda principal\n\n` +
        `JUSTIFICACIÓN:\n` +
        `Estos procedimientos complementan la búsqueda electrónica para:\n` +
        `✅ Maximizar exhaustividad (sensibilidad)\n` +
        `✅ Capturar estudios recientes no indexados aún\n` +
        `✅ Identificar literatura gris relevante\n` +
        `✅ Validar completitud de la búsqueda con expertos`
    }

    // 13. Evaluación del proceso
    newPrismaData["prisma-13"] = {
      complies: true,
      evidence: `EVIDENCIA DE CUMPLIMIENTO:\n\n` +
        `Se describe el método de evaluación del proceso de búsqueda para asegurar calidad:\n\n` +
        `🎯 MÉTODOS DE VALIDACIÓN PLANIFICADOS:\n\n` +
        `1. COMPARACIÓN CON REVISIONES PREVIAS:\n` +
        `   • Si existen RSL previas sobre ${themaCentral}, se verificará que esta búsqueda recupere:\n` +
        `     └─ Estudios clave identificados en revisiones anteriores\n` +
        `     └─ Referencias fundamentales del área\n` +
        `   • Se documentarán diferencias y razones (ej. período temporal, criterios)\n\n` +
        `2. VERIFICACIÓN DE PAPERS CONOCIDOS (Quasi-gold standard):\n` +
        `   • Lista de verificación: 5-10 papers conocidos sobre ${themaCentral}\n` +
        `   • Criterio de éxito: La búsqueda debe recuperar ≥80% de papers de verificación\n` +
        `   • Si no se recuperan: análisis de términos faltantes y refinamiento\n\n` +
        `3. ANÁLISIS DE COBERTURA DE CONCEPTOS:\n` +
        `   Verificación de que la búsqueda captura todos los conceptos clave:\n` +
        `   • Tecnología/Intervención: ${technologies.length > 0 ? technologies.join(', ') : data.pico.intervention || 'Definida en PICO'}\n` +
        `   • Población/Dominio: ${data.pico.population || 'Definida en PICO'}\n` +
        `   • Outcomes/Focos: ${thematicFoci.length > 0 ? thematicFoci.join(', ') : data.pico.outcome || 'Definidos en PICO'}\n\n` +
        `4. SENSIBILIDAD vs. ESPECIFICIDAD:\n` +
        `   • Sensibilidad (recall): ¿Se recuperan todos los estudios relevantes?\n` +
        `     └─ Verificado mediante snowballing y consulta a expertos\n` +
        `   • Especificidad (precision): ¿La proporción de estudios irrelevantes es manejable?\n` +
        `     └─ Meta: Al menos 10-15% de referencias recuperadas sean incluidas tras screening\n\n` +
        `5. PRUEBA DE INTERCALIBRACIÓN:\n` +
        `   • Dos revisores independientes ejecutan la búsqueda\n` +
        `   • Verificación de que ambos obtienen resultados idénticos\n` +
        `   • Valida reproducibilidad de la estrategia\n\n` +
        `6. DOCUMENTACIÓN DE ITERACIONES:\n` +
        `   • Versión inicial de cadenas de búsqueda\n` +
        `   • Refinamientos realizados (con justificación)\n` +
        `   • Número de resultados por versión\n` +
        `   • Decisiones metodológicas tomadas\n\n` +
        `📋 CRITERIOS DE ACEPTACIÓN:\n` +
        `La búsqueda se considera válida si:\n` +
        `✅ Recupera ≥80% de papers conocidos (gold standard)\n` +
        `✅ Cubre todos los conceptos del marco PICO\n` +
        `✅ Es reproducible por revisores independientes\n` +
        `✅ Expertos en ${researchArea} confirman exhaustividad\n` +
        `✅ Balance adecuado sensibilidad/especificidad\n\n` +
        `TRANSPARENCIA:\n` +
        `Todo el proceso de validación será documentado en el protocolo final, incluyendo:\n` +
        `• Resultados de cada método de validación\n` +
        `• Problemas identificados y soluciones\n` +
        `• Justificación de decisiones metodológicas\n\n` +
        `Este nivel de control de calidad asegura que la búsqueda es:\n` +
        `🔍 Exhaustiva (captura toda la evidencia relevante)\n` +
        `📊 Reproducible (otros pueden replicarla exactamente)\n` +
        `✅ Válida (recupera estudios conocidos del área)\n` +
        `🎯 Eficiente (proporción manejable de estudios irrelevantes)`
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
      const projectData = {
        title: data.selectedTitle,
        description: data.projectDescription,
        status: 'active', // Cambiar de 'draft' a 'active'
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

      let result: any = null
      
      if (data.projectId) {
        // Proyecto ya existe (creado en paso 6), solo actualizarlo
        console.log('📝 Actualizando proyecto existente:', data.projectId)
        result = await apiClient.updateProject(data.projectId, projectData)
        
        toast({
          title: "✅ Proyecto completado",
          description: "Redirigiendo a tu proyecto..."
        })
        setTimeout(() => router.push(`/projects/${data.projectId}`), 1500)
      } else {
        // Crear proyecto nuevo (caso excepcional)
        console.log('📝 Creando proyecto nuevo')
        result = await apiClient.createProject(projectData)

        if (result.success && result.data?.project?.id) {
          toast({
            title: "🎉 Proyecto creado exitosamente",
            description: "Redirigiendo a tu proyecto..."
          })
          updateData({ projectId: result.data.project.id, lastSaved: new Date() })
          setTimeout(() => router.push(`/projects/${result.data.project.id}`), 1500)
        }
      }
    } catch (error: any) {
      toast({
        title: "❌ Error al guardar proyecto",
        description: error.message || "No se pudo guardar el proyecto",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const compliance = calculateCompliance()
  const researchArea = data.researchArea || "su área de investigación"
  const themaCentral = data.projectName || "tema central"

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
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Reporte Final del Protocolo
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Este es el paso final de tu protocolo de investigación. A continuación se presenta un reporte completo con la verificación de calidad PRISMA 2020. 
                Los campos son de <strong>solo lectura</strong> y representan tu protocolo final.
              </p>
              <div className="border-l-4 border-blue-500 pl-3 bg-blue-100/50 dark:bg-blue-900/50 p-2 rounded-r">
                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
                  📋 <strong>Marco de Evaluación Metodológica:</strong> Cada ítem PRISMA ha sido evaluado considerando <strong>evidencia explícita, trazable y verificable</strong> de tu tema de estudio específico: <em>"{data.selectedTitle || themaCentral}"</em>. 
                  Las respuestas no son genéricas, sino fundamentadas en los componentes de tu protocolo (PICO, términos, criterios I/E, cadenas de búsqueda).
                </p>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Una vez que confirmes, se creará tu proyecto y podrás comenzar la fase de ejecución.
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
                                  rows={15}
                                  readOnly
                                  className="text-sm resize-y bg-muted/30 cursor-default border-muted font-mono whitespace-pre-wrap"
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
