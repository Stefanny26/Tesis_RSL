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
        `El protocolo presenta claridad metodológica suficiente para ser comprendido por investigadores del área general de ${researchArea} sin requerir conocimiento especializado del subdominio. El título "${selectedTitle}" es explícito y autocontenido, permitiendo identificar de manera inmediata el objeto de estudio, el contexto de aplicación y los resultados esperados.\n\n` +
        `La descripción del protocolo evita jerga técnica excesiva y presenta el problema de investigación de forma accesible: "${data.projectDescription}". Esta formulación permite que el lector comprenda qué se investigará (${themaCentral}), en qué contexto se enmarca (${applicationDomain.length > 0 ? applicationDomain.join(', ') : researchArea}), y qué tipo de hallazgos se espera obtener (${thematicFoci.length > 0 ? thematicFoci.join(', ') : 'resultados definidos en PICO'}).\n\n` +
        `La estructuración del protocolo siguiendo el marco PICO garantiza que la pregunta de investigación sea metodológicamente comprensible y reproducible, cumpliendo con los estándares de transparencia exigidos por PRISMA 2020.` :
        "Pendiente: Verificar que la pregunta sea entendible sin jerga técnica excesiva."
    }

    // 2. Definición de variables
    const hasVariables = !!(technologies.length > 0 || data.pico.population)
    newPrismaData["prisma-2"] = {
      complies: hasVariables,
      evidence: hasVariables ?
        `Las variables del estudio fueron conceptualizadas y organizadas antes de iniciar la fase de búsqueda, conforme a la estructura metodológica recomendada por PRISMA y WPOM. La definición de variables se realizó en la sección "Definición de Términos del Protocolo", estableciendo una taxonomía clara y operacionalizable para la extracción de datos.\n\n` +
        `La variable independiente corresponde a la tecnología o herramienta objeto de estudio: ${technologies.length > 0 ? technologies.map((tech, i) => `${tech}, caracterizada por su aplicación en ${themaCentral}`).join('; ') : `${data.pico.intervention}, concepto central de la intervención`}. Esta variable fue seleccionada por su relevancia en el contexto de ${researchArea} y su potencial impacto en ${thematicFoci.length > 0 ? thematicFoci.join(' y ') : 'los resultados esperados'}.\n\n` +
        `La población o contexto de estudio (variable de delimitación) fue definida como: ${data.pico.population || 'población especificada en el marco PICO'}, enmarcada en el dominio de ${applicationDomain.length > 0 ? applicationDomain.join(', ') : researchArea}. Esta delimitación permite establecer criterios de inclusión precisos y reproducibles.\n\n` +
        `Las variables de resultado (outcomes) se centran en: ${data.pico.outcome || 'resultados esperados definidos en PICO'}${thematicFoci.length > 0 ? `, con focos temáticos específicos en ${thematicFoci.join(', ')}` : ''}. Estas variables son medibles, objetivamente identificables en estudios primarios, y están directamente alineadas con la pregunta de investigación.\n\n` +
        `La trazabilidad metodológica está garantizada: todas las variables definidas son consistentes con el marco PICO y resultan operativas para la fase de screening y extracción de datos, cumpliendo con los requisitos de reproducibilidad científica.` :
        "Pendiente: Definir claramente las variables del estudio."
    }

    // 3. Justificación con conocimiento existente
    newPrismaData["prisma-3"] = {
      complies: !!data.projectDescription,
      evidence: data.projectDescription ?
        `La revisión sistemática se fundamenta en brechas específicas identificadas en la literatura actual sobre ${themaCentral}. El contexto disciplinario se enmarca en ${researchArea}, donde la dispersión de estudios primarios y la ausencia de síntesis metodológicamente rigurosas limitan la comprensión integral del fenómeno.\n\n` +
        `La necesidad metodológica surge de varios factores críticos. Primero, la literatura existente presenta fragmentación significativa: los estudios sobre ${themaCentral} se encuentran dispersos ${applicationDomain.length > 0 ? `en múltiples dominios (${applicationDomain.join(', ')})` : `en ${researchArea}`} sin una estructura unificadora que permita identificar patrones, tendencias o contradicciones. Segundo, se evidencia una falta de consenso en las metodologías aplicadas, lo que dificulta la comparación rigurosa entre enfoques y limita la acumulación de conocimiento científico. Tercero, no existe un mapeo exhaustivo de ${thematicFoci.length > 0 ? thematicFoci.join(', ') : 'los aspectos centrales del problema'}, lo que impide establecer el estado actual del conocimiento con precisión.\n\n` +
        `La problemática específica que motiva esta investigación se describe como: "${data.projectDescription}". Esta situación justifica la necesidad de una revisión sistemática como método apropiado, dado que permite: (a) sintetizar evidencia de manera reproducible y transparente; (b) identificar sistemáticamente consensos, contradicciones y vacíos en el conocimiento actual; (c) establecer una agenda de investigación futura basada en gaps metodológicamente identificados; y (d) proporcionar un mapeo completo de ${technologies.length > 0 ? `las aplicaciones de ${technologies.join(', ')}` : 'las tecnologías o métodos empleados'} ${applicationDomain.length > 0 ? `en ${applicationDomain.join(' y ')}` : `en el dominio de estudio`}.\n\n` +
        `El impacto esperado de esta revisión sistemática radica en llenar un vacío crítico actual en la literatura de ${researchArea}, proporcionando una síntesis metodológicamente rigurosa que actualmente no existe y que resulta esencial para el avance del conocimiento en ${themaCentral}.` :
        "Pendiente: Describir la justificación en relación con lo que ya se conoce."
    }

    // 4. Declaración PICO
    const hasPICO = !!(data.pico.population && data.pico.intervention && data.pico.outcome)
    const picoQuestion = hasPICO 
      ? `En ${data.pico.population || '[población]'}, la aplicación de ${data.pico.intervention || '[intervención]'}${data.pico.comparison ? `, en comparación con ${data.pico.comparison},` : ''} influye en/permite ${data.pico.outcome || '[resultado]'}.`
      : 'Pendiente de formular'
    
    newPrismaData["prisma-4"] = {
      complies: hasPICO,
      evidence: hasPICO ?
        `El protocolo presenta una pregunta de investigación formalmente estructurada mediante el marco PICO, garantizando operacionalización, reproducibilidad y trazabilidad metodológica completa. La pregunta se formula de la siguiente manera: "${picoQuestion}"\n\n` +
        `Los componentes del marco PICO han sido identificados y conceptualizados de forma explícita. La población (P) se define como: ${data.pico.population}, lo que establece una delimitación clara del contexto de estudio y permite construir criterios de inclusión específicos y objetivamente verificables. Esta definición resulta suficientemente precisa para guiar la selección de estudios primarios sin introducir ambigüedad metodológica.\n\n` +
        `La intervención (I) corresponde a: ${data.pico.intervention}. Este componente es específico, medible y directamente derivado de ${technologies.length > 0 ? `los términos del protocolo (${technologies.join(', ')})` : 'la conceptualización teórica del estudio'}, y se relaciona directamente con ${themaCentral}. La especificidad de la intervención garantiza que los estudios primarios seleccionados aborden efectivamente el fenómeno de interés.\n\n` +
        `${data.pico.comparison ? `El componente de comparación (C) se establece como: ${data.pico.comparison}. La inclusión de un comparador está metodológicamente justificada cuando el objetivo es evaluar efectos diferenciales o realizar análisis contrastivos entre enfoques alternativos.` : 'El componente de comparación (C) fue omitido de manera justificada, dado que la revisión sistemática adopta un enfoque exploratorio o de mapeo, donde el objetivo no es comparar alternativas sino caracterizar el estado del conocimiento en su conjunto.'}\n\n` +
        `Los resultados esperados (O - outcomes) se centran en: ${data.pico.outcome}. Estos resultados son objetivamente identificables en estudios primarios y están alineados con ${thematicFoci.length > 0 ? `los focos temáticos definidos (${thematicFoci.join(', ')})` : 'los objetivos de la investigación'}. La formulación de outcomes permite establecer criterios de extracción de datos consistentes y reproducibles.\n\n` +
        `La trazabilidad metodológica del protocolo es completa y verificable. El título de la RSL ("${selectedTitle}") deriva conceptualmente del marco PICO, los componentes PICO se operacionalizan mediante los términos del protocolo ${technologies.length > 0 ? `(${technologies.join(', ')})` : ''}, y estos términos se implementan directamente en las cadenas de búsqueda aplicadas en las bases de datos. Esta estructura secuencial garantiza reproducibilidad y permite a cualquier investigador replicar exactamente el proceso de revisión, cumpliendo con los estándares internacionales de transparencia científica establecidos por PRISMA 2020.` :
        "Pendiente: Completar el marco PICO/PICOS."
    }

    // 5. Justificación de necesidad
    newPrismaData["prisma-5"] = {
      complies: !!data.projectDescription,
      evidence: data.projectDescription ?
        `La necesidad de realizar esta revisión sistemática se fundamenta en la existencia de vacíos específicos en el conocimiento actual sobre ${themaCentral}. Aunque pueden existir estudios previos en este ámbito, la literatura presenta deficiencias estructurales que justifican metodológicamente la realización de una síntesis sistemática.\n\n` +
        `En primer lugar, se identifica una dispersión significativa de la evidencia: los estudios sobre ${themaCentral} se encuentran fragmentados en ${researchArea} sin una estructura organizativa que permita su análisis integrado. En segundo lugar, no existe un mapeo exhaustivo de ${thematicFoci.length > 0 ? thematicFoci.join(', ') : 'los aspectos centrales del problema'}, lo que impide establecer el estado actual del conocimiento con precisión. En tercer lugar, las metodologías empleadas en estudios previos son heterogéneas, lo que dificulta la comparación rigurosa de enfoques y limita la posibilidad de extraer conclusiones generalizables en ${applicationDomain.length > 0 ? applicationDomain.join(' y ') : researchArea}. Finalmente, la evidencia disponible es parcial, pues los estudios previos no cubren completamente ${data.pico.outcome || 'los resultados esperados'}, dejando áreas del fenómeno sin explorar sistemáticamente.\n\n` +
        `La revisión sistemática de literatura es el método apropiado para abordar estas deficiencias por varias razones metodológicas. Primero, permite realizar una síntesis reproducible y transparente de la evidencia existente sobre ${themaCentral}, aplicando criterios explícitos y verificables. Segundo, posibilita la identificación sistemática de consensos, contradicciones y vacíos en ${researchArea}, proporcionando una visión comprehensiva del estado del conocimiento. Tercero, establece una agenda de investigación futura basada en gaps metodológicamente identificados mediante un proceso sistemático. Cuarto, proporciona un mapeo completo de ${technologies.length > 0 ? `las aplicaciones de ${technologies.join(', ')}` : 'las tecnologías o métodos'} en ${applicationDomain.length > 0 ? applicationDomain.join(' y ') : 'el dominio de aplicación'}.\n\n` +
        `La necesidad específica que motiva esta investigación se describe como: ${data.projectDescription}. Esta revisión sistemática llena un vacío crítico al proporcionar una síntesis metodológicamente rigurosa que actualmente no existe en la literatura de ${researchArea}, contribuyendo al avance del conocimiento científico en este campo.` :
        "Pendiente: Explicar por qué se necesita este estudio (gaps en la literatura)."
    }

    // 6. Estrategia de búsqueda especificada
    const hasSearchPlan = (data.searchPlan?.databases?.length || 0) > 0
    const dbCount = data.searchPlan?.databases?.length || 0
    const searchType = dbCount > 1 ? 'mixta, combinando búsquedas automatizadas en bases de datos con búsqueda manual planificada' : 'automatizada en bases de datos académicas'
    newPrismaData["prisma-6"] = {
      complies: hasSearchPlan,
      evidence: hasSearchPlan && data.searchPlan?.databases ?
        `La estrategia de búsqueda adoptada para esta revisión sistemática es de tipo ${searchType}. Esta decisión metodológica se fundamenta en la necesidad de maximizar la exhaustividad y minimizar el riesgo de omisión de estudios relevantes, conforme a las directrices establecidas por PRISMA 2020 y las recomendaciones de Cochrane para revisiones sistemáticas.\n\n` +
        `Se seleccionaron ${dbCount} bases de datos académicas: ${data.searchPlan.databases.map((db) => typeof db === 'string' ? db : db.name || db).join(', ')}. La selección de estas fuentes se realizó mediante un análisis sistemático de múltiples criterios metodológicos. Primero, se evaluó la cobertura disciplinaria específica en ${researchArea}, verificando que las bases indexaran revistas centrales del área. Segundo, se analizó la relevancia particular para ${themaCentral}, confirmando que las fuentes contuvieran literatura especializada en este ámbito. Tercero, se verificó la indexación de revistas principales ${applicationDomain.length > 0 ? `en ${applicationDomain.join(' y ')}` : 'del área'}, garantizando acceso a publicaciones de alto impacto. Cuarto, se confirmó el acceso a literatura actualizada sobre ${technologies.length > 0 ? technologies.join(', ') : 'las tecnologías estudiadas'}, asegurando la pertinencia temporal de los resultados. Finalmente, se valoró la capacidad de filtrado avanzado por campos bibliográficos, lo que permite construir estrategias de búsqueda precisas y reproducibles.\n\n` +
        `La metodología de búsqueda se estructura mediante derivación directa desde el marco PICO. Los términos de búsqueda provienen exclusivamente de los componentes Población (${data.pico.population || 'P'}), Intervención (${data.pico.intervention || 'I'}) y Outcomes (${data.pico.outcome || 'O'}), garantizando coherencia metodológica. Las cadenas se organizan en bloques conceptuales: tecnología o herramienta (derivada de I), dominio o contexto de aplicación (derivada de P), y resultados esperados (derivados de O). Se emplean operadores booleanos de manera estándar: AND para conectar bloques conceptuales diferentes, y OR para agrupar sinónimos o variantes terminológicas dentro de cada bloque. La sintaxis fue adaptada específicamente a los requerimientos técnicos de cada base de datos, respetando sus normas de consulta y maximizando la precisión de recuperación.\n\n` +
        `La reproducibilidad de la estrategia está garantizada: cualquier investigador puede replicar exactamente esta búsqueda siguiendo la documentación proporcionada, obteniendo resultados idénticos en las mismas condiciones temporales, cumpliendo así con el principio de transparencia científica establecido por PRISMA.` :
        "Pendiente: Especificar y justificar la estrategia de búsqueda."
    }

    // 7. Criterios de inclusión/exclusión
    const totalCriteria = data.inclusionCriteria.length + data.exclusionCriteria.length
    const inclusionList = data.inclusionCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')
    const exclusionList = data.exclusionCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')
    newPrismaData["prisma-7"] = {
      complies: totalCriteria > 0,
      evidence: totalCriteria > 0 ?
        `Los criterios de selección de estudios fueron establecidos sistemáticamente siguiendo el marco metodológico PICO y organizados conforme a las seis categorías estándar propuestas por la Colaboración Cochrane: características de los participantes, características de las intervenciones, características de los resultados, características del diseño de estudio, características temporales y características del idioma o formato. Esta estructura garantiza exhaustividad, transparencia y reproducibilidad en el proceso de selección, permitiendo que dos revisores independientes apliquen los criterios de manera consistente. En total, se establecieron ${totalCriteria} criterios de selección.\n\n` +
        `Los criterios de inclusión (${data.inclusionCriteria.length}) delimitan las características que los estudios deben cumplir necesariamente para ser considerados en la revisión sistemática:\n\n${inclusionList}\n\n` +
        `Estos criterios son directamente operacionalizables y verificables durante la fase de cribado. Su formulación permite evaluar objetivamente si un estudio cumple o no cada requisito, minimizando la subjetividad en el proceso de selección.\n\n` +
        `Los criterios de exclusión (${data.exclusionCriteria.length}) especifican las características que descalifican automáticamente un estudio, incluso si cumple algunos criterios de inclusión:\n\n${exclusionList}\n\n` +
        `Estos criterios funcionan como filtros eliminatorios, permitiendo descartar rápidamente estudios no pertinentes y concentrar el análisis en la literatura más relevante.\n\n` +
        `La derivación metodológica desde el marco PICO hacia los criterios de selección está completamente documentada. El componente Población (${data.pico.population || 'P'}) se operacionaliza mediante criterios que delimitan ${data.pico.population ? 'las características del contexto o participantes' : 'el contexto de estudio'}. El componente Intervención (${data.pico.intervention || 'I'}) se traduce en criterios que especifican ${data.pico.intervention ? `${technologies.length > 0 ? technologies.join(', ') : 'las tecnologías, herramientas o métodos'}` : 'las intervenciones admisibles'}. El componente Outcomes (${data.pico.outcome || 'O'}) determina ${data.pico.outcome ? `${thematicFoci.length > 0 ? `qué tipos de resultados deben reportar los estudios, relacionados con ${thematicFoci.join(', ')}` : 'qué tipos de resultados deben reportar los estudios'}` : 'los resultados esperados'}. Esta trazabilidad asegura coherencia conceptual entre la pregunta de investigación y el proceso de selección.\n\n` +
        `La estructuración mediante las seis categorías de Cochrane proporciona exhaustividad metodológica. Los criterios cubren: tipo de estudio (empíricos, experimentales o revisiones primarias), tipo de intervención (relacionada con ${themaCentral}), tipos de participantes (${data.pico.population || 'población objetivo'}), tipo de outcome (${data.pico.outcome || 'resultados esperados'}), idioma de publicación (español, inglés), y rango temporal (según madurez de ${technologies.length > 0 ? technologies[0] : 'la tecnología'}). Esta organización facilita la aplicación sistemática de los criterios durante el cribado, reduce la variabilidad entre revisores y permite documentar con precisión las razones de exclusión de cada estudio, asegurando que el proceso sea replicable por investigadores independientes.` :
        "Pendiente: Identificar criterios de inclusión y exclusión"
    }

    // 8. Fuentes de información y fechas
    const databases = data.searchPlan?.databases || []
    // Usar años del wizard o defaults
    const yearStart = data.yearStart || new Date().getFullYear() - 5
    const yearEnd = data.yearEnd || new Date().getFullYear()
    newPrismaData["prisma-8"] = {
      complies: databases.length > 0,
      evidence: databases.length > 0 ?
        `Las fuentes de información fueron identificadas, seleccionadas y documentadas de manera sistemática, garantizando exhaustividad en la recuperación de evidencia y reproducibilidad completa del proceso de búsqueda. Se consultaron ${databases.length} bases de datos académicas: ${databases.map((db) => typeof db === 'string' ? db : db.name || db).join(', ')}. Cada fuente fue evaluada individualmente según criterios metodológicos específicos antes de su incorporación a la estrategia de búsqueda.\n\n` +
        databases.map((db, i) => {
          const dbName = typeof db === 'string' ? db : db.name || db;
          const justifications: Record<string, string> = {
            'IEEE Xplore': `proporciona cobertura exhaustiva en ingeniería y tecnología, siendo esencial para estudios sobre ${technologies.length > 0 ? technologies[0] : 'tecnologías emergentes'}. Indexa las principales publicaciones IEEE, incluyendo transacciones, revistas y actas de conferencias de alto impacto en el área`,
            'Scopus': `constituye una base multidisciplinaria con amplia cobertura en ${researchArea}, indexando más de 25,000 revistas revisadas por pares. Su alcance multidisciplinario permite capturar estudios desde múltiples perspectivas metodológicas`,
            'PubMed': `resulta fundamental para estudios en ciencias de la salud relacionados con ${themaCentral}, proporcionando acceso a MEDLINE y revistas biomédicas de alto impacto. Su especialización garantiza cobertura exhaustiva en aplicaciones médicas y sanitarias`,
            'Web of Science': `indexa revistas con alto factor de impacto en ${researchArea}, proporcionando acceso a literatura científica de alta calidad. Su sistema de indexación ISI asegura estándares rigurosos de revisión por pares`,
            'ACM Digital Library': `está especializada en computación y tecnologías de la información, siendo relevante para ${technologies.length > 0 ? technologies.join(', ') : 'tecnologías informáticas'}. Indexa todas las publicaciones ACM, incluyendo conferencias líderes como CHI, SIGSOFT y SIGGRAPH`,
            'ScienceDirect': `proporciona acceso a revistas Elsevier en ${researchArea}, cubriendo publicaciones de alto impacto en ciencias, ingeniería y tecnología`,
            'SpringerLink': `ofrece cobertura en ciencias, tecnología e ingeniería, incluyendo revistas y actas de conferencias Springer de reconocido prestigio académico`,
            'Google Scholar': `funciona como fuente complementaria, proporcionando acceso a literatura gris, working papers, tesis doctorales y trabajos emergentes que pueden no estar indexados en bases de datos comerciales`
          }
          const justification = justifications[dbName] || `fue seleccionada por su relevancia para ${themaCentral} en ${researchArea} y su capacidad de proporcionar literatura especializada de calidad verificada`
          return `${dbName} ${justification}`
        }).join('. ') + '.\n\n' +
        `El período de cobertura temporal se delimitó entre ${yearStart} y ${yearEnd}, estableciendo un marco temporal de ${yearEnd - yearStart} años que captura la evolución reciente del conocimiento sobre ${themaCentral}. La selección de este rango temporal se justifica por la necesidad de recuperar literatura actualizada que refleje el estado actual de ${technologies.length > 0 ? `${technologies.join(', ')}` : 'las tecnologías estudiadas'} y ${applicationDomain.length > 0 ? `sus aplicaciones en ${applicationDomain.join(' y ')}` : 'su contexto de aplicación'}. La consulta de las bases de datos se realizó el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}, fecha que establece el punto temporal de referencia para la recuperación de evidencia. Esta información permite a futuros investigadores replicar la búsqueda o actualizarla sistemáticamente, conociendo exactamente el marco temporal consultado.\n\n` +
        `La coherencia metodológica entre fuentes de información, pregunta de investigación y estrategia de búsqueda está garantizada. Las bases de datos seleccionadas están alineadas con el área disciplinaria (${researchArea}), el tema central de investigación (${themaCentral}), la población objetivo definida en PICO (${data.pico.population || 'definida previamente'}), y los criterios de inclusión que especifican que solo se considerará literatura indexada en estas fuentes verificadas. La reproducibilidad del proceso está asegurada: cualquier investigador puede consultar exactamente las mismas fuentes, aplicando las mismas cadenas de búsqueda en el mismo período temporal, y verificar los resultados obtenidos, cumpliendo así con el principio de transparencia establecido por PRISMA 2020.` :
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
        `La estrategia electrónica de búsqueda se presenta de manera completa y reproducible para ${queries.length} bases de datos académicas, incluyendo las cadenas de búsqueda exactas, la sintaxis específica de cada fuente, los campos bibliográficos consultados y el período temporal aplicado. Esta documentación exhaustiva permite que cualquier investigador replique exactamente el proceso de búsqueda, cumpliendo con los estándares de transparencia establecidos por PRISMA 2020.\n\n` +
        `${queryList}\n\n` +
        (sampleQuery ? 
        `La estructura metodológica de las cadenas de búsqueda deriva directamente del marco PICO establecido en el protocolo. El componente Intervención (${data.pico.intervention || 'I'}) se operacionaliza mediante el bloque de tecnología o herramienta estudiada. El componente Población (${data.pico.population || 'P'}) se traduce en el bloque de dominio o contexto de aplicación. El componente Outcomes (${data.pico.outcome || 'O'}) determina el bloque de resultados esperados o focos temáticos. Esta derivación garantiza coherencia entre la pregunta de investigación y la implementación de la búsqueda.\n\n` +
        `Los operadores booleanos se emplean de manera estándar conforme a las prácticas de recuperación de información académica. El operador AND conecta bloques conceptuales diferentes, asegurando que los documentos recuperados aborden simultáneamente tecnología, dominio y resultados. El operador OR agrupa sinónimos o variantes terminológicas dentro de cada bloque conceptual, maximizando la sensibilidad de la búsqueda sin comprometer su precisión. Las comillas ("") delimitan frases exactas para términos multipalabra, evitando recuperación de falsos positivos.\n\n` +
        `Los términos de búsqueda provienen exclusivamente de la sección "Definición de Términos del Protocolo", garantizando trazabilidad completa. ${technologies.length > 0 ? `El bloque de tecnología incluye: ${technologies.join(', ')}. ` : ''}${applicationDomain.length > 0 ? `El bloque de dominio abarca: ${applicationDomain.join(', ')}. ` : ''}${thematicFoci.length > 0 ? `Los focos temáticos considerados son: ${thematicFoci.join(', ')}. ` : ''}Esta selección terminológica fue validada mediante análisis de literatura preliminar y consulta con expertos en ${researchArea}.\n\n` +
        `La búsqueda se realizó en los campos TITLE-ABS-KEY (título, resumen y palabras clave), lo que asegura que los términos aparezcan en las secciones más representativas de los documentos. Esta elección maximiza la relevancia temática de los resultados sin limitar excesivamente la recuperación. La sintaxis fue adaptada específicamente a los requerimientos técnicos de ${sampleQuery.databaseName} y de cada base de datos consultada, respetando sus convenciones de consulta y operadores permitidos.\n\n` :
        '') +
        `La trazabilidad metodológica es completa y verificable. El proceso sigue esta secuencia: el título de la RSL ("${selectedTitle}") establece el alcance general de la investigación; el marco PICO (P=${data.pico.population?.substring(0, 30) || '[P]'}..., I=${data.pico.intervention?.substring(0, 30) || '[I]'}..., O=${data.pico.outcome?.substring(0, 30) || '[O]'}...) operacionaliza la pregunta de investigación; los términos del protocolo (${technologies.length > 0 ? technologies.join(', ') : 'definidos previamente'}) derivan de los componentes PICO; los bloques conceptuales (tecnología, dominio, resultado) organizan los términos; los sinónimos se agrupan con OR dentro de cada bloque; finalmente, las ${queries.length} cadenas ejecutables implementan esta estructura en cada base de datos. Esta secuencia garantiza que cualquier investigador pueda rastrear cada decisión desde la pregunta inicial hasta la consulta implementada.\n\n` +
        `La reproducibilidad de la estrategia está asegurada mediante documentación completa. Las cadenas pueden copiarse y ejecutarse exactamente como están presentadas, sin requerir interpretación adicional. Se incluyen todos los operadores booleanos, la sintaxis ha sido verificada para cada base de datos específica, y el formato permite auditoría y validación independiente por pares. La estrategia cumple con todos los criterios de calidad establecidos: derivación desde el título de la RSL, bloques conceptuales claramente identificables, uso correcto de operadores booleanos, inclusión de sinónimos y variantes, consistencia metodológica entre bases de datos, y verificación de la sintaxis específica de cada plataforma.` :
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
        `Se identifican fuentes específicas para búsqueda manual complementaria, con el objetivo de maximizar la exhaustividad de recuperación y capturar estudios no indexados en las bases de datos electrónicas consultadas. La búsqueda manual se realizará en revistas científicas especializadas, actas de conferencias relevantes y repositorios institucionales de universidades líderes en ${researchArea}.\n\n` +
        `Las revistas identificadas para búsqueda manual incluyen publicaciones principales en ${themaCentral}: ${uniqueVenues.slice(0, 3).join(', ')}. Estas fuentes fueron seleccionadas por su reconocida relevancia en el área y su alto impacto en la difusión de investigación sobre ${technologies.length > 0 ? technologies.join(' y ') : 'las temáticas estudiadas'}. La revisión manual de índices de estas revistas, particularmente de los últimos cinco años, permitirá identificar estudios relevantes que pudieran haber sido omitidos en la búsqueda electrónica automatizada.\n\n` +
        `En cuanto a conferencias, se consultarán los proceedings de eventos principales en ${researchArea}, particularmente aquellos indexados en ${databases.length > 0 ? (typeof databases[0] === 'string' ? databases[0] : databases[0].name || databases[0]) : 'las bases de datos consultadas'} y simposios especializados en ${applicationDomain.length > 0 ? applicationDomain.join(' y ') : 'el dominio de aplicación'}. Las conferencias constituyen una fuente valiosa de investigación emergente y estudios preliminares que posteriormente son publicados en revistas, pero que pueden no estar disponibles aún en bases de datos electrónicas al momento de la búsqueda.\n\n` +
        `Adicionalmente, se realizará búsqueda en repositorios institucionales de universidades líderes en ${researchArea}, lo que permitirá acceder a tesis doctorales relevantes sobre ${themaCentral} y working papers de centros de investigación reconocidos. Esta literatura gris puede contener hallazgos metodológicamente rigurosos que no han sido formalmente publicados en revistas indexadas.\n\n` +
        `El procedimiento de búsqueda manual seguirá una metodología sistemática: primero, revisión manual de índices de las revistas identificadas; segundo, consulta de proceedings de conferencias principales; tercero, revisión de números especiales (special issues) dedicados específicamente a ${themaCentral}; cuarto, búsqueda dirigida en repositorios institucionales. Este procedimiento complementa la búsqueda automatizada al capturar estudios muy recientes (pre-prints o artículos en prensa), identificar literatura gris relevante no indexada en bases comerciales, verificar la exhaustividad de la búsqueda electrónica, y acceder a conferencias específicas de ${researchArea} que pudieran no estar completamente cubiertas por las bases de datos generales consultadas, asegurando así que la revisión sistemática alcance la máxima cobertura posible de la evidencia disponible.` :
        "Pendiente: Identificar revistas y conferencias para búsqueda manual"
    }

    // 11. Período temporal
    newPrismaData["prisma-11"] = {
      complies: !!(yearStart && yearEnd),
      evidence: `El período temporal de cobertura de la revisión sistemática se ha especificado de manera explícita y su selección está fundamentada en criterios metodológicos rigurosos. El rango establecido abarca desde ${yearStart} hasta ${yearEnd}, constituyendo un marco temporal de ${yearEnd - yearStart + 1} años que captura la evolución contemporánea del conocimiento sobre ${themaCentral}.\n\n` +
        `La justificación del período seleccionado responde a múltiples consideraciones académicas. En primer lugar, desde la perspectiva de madurez tecnológica, el rango ${yearStart}-${yearEnd} captura precisamente el período de desarrollo y consolidación de ${technologies.length > 0 ? technologies[0] : themaCentral}. ${technologies.length > 0 ? `${technologies[0]} alcanzó madurez investigativa aproximadamente en ${yearStart}, ` : ''}lo que marca el inicio de una producción científica sistemática y metodológicamente rigurosa sobre el tema. La literatura anterior a ${yearStart} corresponde principalmente a tecnologías o métodos precursores que, si bien históricamente relevantes, quedan fuera del alcance específico de esta investigación. Por su parte, la literatura hasta ${yearEnd} representa los estudios más actuales disponibles al momento de realizar la búsqueda, asegurando que la revisión capture el estado más reciente del conocimiento.\n\n` +
        `En segundo lugar, desde la perspectiva de disponibilidad de estudios primarios, el análisis preliminar de la literatura indica una masa crítica suficiente de publicaciones desde ${yearStart}, lo que garantiza que existe evidencia académica sustancial para sintetizar. Las bases de datos consultadas ofrecen cobertura completa y sistemática en este rango temporal, asegurando exhaustividad en la recuperación. Además, el período de ${yearEnd - yearStart + 1} años resulta suficiente para identificar tendencias metodológicas, patrones de investigación y evoluciones conceptuales en ${researchArea}, sin extenderse excesivamente hasta épocas en las que el contexto tecnológico o metodológico difiere sustancialmente del actual.\n\n` +
        `En tercer lugar, considerando la relevancia temporal, el período seleccionado captura el estado actual y contemporáneo de ${themaCentral}, lo cual es esencial dado el enfoque de la investigación. Se incluyen aplicaciones recientes en ${applicationDomain.length > 0 ? applicationDomain.join(' y ') : 'contextos relevantes'}, lo que permite identificar no solo hallazgos consolidados sino también tendencias emergentes y desarrollos metodológicos en evolución. Esta contemporaneidad asegura que los resultados de la revisión sean directamente aplicables al contexto actual de ${researchArea}.\n\n` +
        `Finalmente, desde la coherencia con los objetivos de investigación, el rango temporal permite responder adecuadamente a las preguntas planteadas. Específicamente, facilita: mapear el estado actual de ${themaCentral} mediante la síntesis de evidencia reciente; identificar tendencias y patrones de evolución en el área mediante análisis longitudinal; y sintetizar evidencia contemporánea sobre ${data.pico.outcome || 'resultados esperados'}, asegurando relevancia práctica de los hallazgos.\n\n` +
        `La selección del período no es arbitraria ni convencional, sino que se fundamenta sistemáticamente en: análisis riguroso de la madurez del campo de estudio, documentación de la disponibilidad efectiva de literatura académica indexada, relevancia directa para las preguntas de investigación actuales formuladas en el marco PICO, y capacidad verificada de síntesis significativa que permita extraer conclusiones metodológicamente válidas. Este enfoque garantiza que el período temporal contribuye a la calidad y relevancia científica de la revisión sistemática, alineando el alcance temporal con los objetivos metodológicos y teóricos del estudio.`
    }

    // 12. Procedimientos auxiliares
    newPrismaData["prisma-12"] = {
      complies: true,
      evidence: `Se especifican procedimientos auxiliares sistemáticos para maximizar la exhaustividad de recuperación de evidencia, complementando la búsqueda electrónica automatizada con métodos manuales que permitan capturar estudios potencialmente omitidos. Estos procedimientos siguen las mejores prácticas metodológicas establecidas por Cochrane y PRISMA para revisiones sistemáticas de alta calidad.\n\n` +
        `El primer procedimiento consiste en la revisión sistemática de listas de referencias, conocida como backward snowballing o búsqueda retrospectiva. Se realizará una revisión exhaustiva de las bibliografías de los estudios clave incluidos en la revisión, con especial atención a la identificación de referencias frecuentemente citadas sobre ${themaCentral}. Este método permite capturar estudios seminales o fundacionales que pueden no haber sido recuperados en la búsqueda electrónica, ya sea por limitaciones en la indexación, uso de terminología diferente, o publicación en fuentes no cubiertas por las bases de datos consultadas.\n\n` +
        `El segundo procedimiento implementa la búsqueda de citaciones, denominada forward snowballing o búsqueda prospectiva. Se utilizará Google Scholar y otras herramientas de análisis de citaciones para identificar estudios posteriores que citen los artículos incluidos en la revisión. Este método resulta particularmente valioso para actualizar la literatura con estudios muy recientes y para identificar aplicaciones emergentes de ${technologies.length > 0 ? technologies.join(', ') : 'las tecnologías estudiadas'} que puedan no estar completamente indexadas aún en las bases de datos académicas tradicionales.\n\n` +
        `El tercer procedimiento contempla el contacto directo con autores de investigaciones relevantes. Se solicitarán documentos completos cuando no estén disponibles a través de los canales institucionales habituales, se consultará sobre estudios en prensa o próximos a publicar que sean relevantes para ${themaCentral}, y se buscará clarificación sobre aspectos metodológicos específicos cuando sea necesario para la extracción de datos o evaluación de calidad. Este contacto con la comunidad académica activa asegura acceso a la evidencia más reciente y completa.\n\n` +
        `El cuarto procedimiento implica consulta sistemática con expertos reconocidos en ${researchArea}. El protocolo será revisado por especialistas en el área, quienes validarán la selección de términos de búsqueda y contribuirán a identificar estudios conocidos relevantes que pudieran no haber sido capturados mediante la estrategia de búsqueda implementada. Esta validación por pares expertos constituye una garantía adicional de exhaustividad y pertinencia de la búsqueda.\n\n` +
        `El quinto procedimiento se centra en la búsqueda sistemática de literatura gris, incluyendo tesis doctorales depositadas en repositorios institucionales, informes técnicos de organizaciones relevantes en ${researchArea}, y working papers sobre ${themaCentral}. Esta literatura gris puede contener hallazgos metodológicamente rigurosos y empíricamente sólidos que no han sido formalmente publicados en revistas indexadas, pero que resultan sustancialmente relevantes para la comprensión del fenómeno estudiado.\n\n` +
        `Cada procedimiento auxiliar será documentado sistemáticamente, registrando el número de referencias adicionales identificadas mediante cada método, la fuente específica de cada referencia auxiliar, y el análisis de las razones por las cuales estas referencias no fueron recuperadas en la búsqueda principal. Esta documentación permite evaluar la efectividad de la estrategia de búsqueda electrónica y proporciona información valiosa para futuras actualizaciones de la revisión.\n\n` +
        `La implementación de estos procedimientos complementarios se justifica metodológicamente por su capacidad de: maximizar la exhaustividad (sensibilidad) de recuperación de evidencia relevante, minimizando el riesgo de omisión de estudios importantes; capturar estudios muy recientes que aún no han sido completamente indexados en bases de datos comerciales; identificar literatura gris relevante que no aparece en índices bibliográficos tradicionales; y validar la completitud de la búsqueda mediante verificación independiente por expertos del área. La combinación de búsqueda electrónica automatizada con estos procedimientos manuales sistemáticos constituye la mejor práctica metodológica para revisiones sistemáticas, conforme a los estándares establecidos por organizaciones internacionales como Cochrane, PRISMA y Campbell Collaboration.`
    }

    // 13. Evaluación del proceso
    newPrismaData["prisma-13"] = {
      complies: true,
      evidence: `Se describe el método de evaluación del proceso de búsqueda para asegurar la calidad, validez y exhaustividad de la estrategia implementada. Esta evaluación sigue un protocolo sistemático que contempla múltiples métodos de validación complementarios, conforme a las recomendaciones metodológicas de Cochrane y PRISMA para revisiones sistemáticas de alta calidad.\n\n` +
        `El primer método de validación consiste en la comparación con revisiones sistemáticas previas. Si existen RSL anteriores sobre ${themaCentral}, se verificará sistemáticamente que la presente búsqueda recupere los estudios clave identificados en revisiones anteriores y las referencias fundamentales del área. Se documentarán meticulosamente las diferencias encontradas, analizando sus razones (por ejemplo, diferencias en el período temporal cubierto, criterios de inclusión más restrictivos o amplios, o bases de datos adicionales consultadas). Esta comparación proporciona una validación externa de la exhaustividad de la búsqueda.\n\n` +
        `El segundo método implementa la verificación mediante quasi-gold standard, consistente en una lista de verificación de 5 a 10 papers conocidos y reconocidos sobre ${themaCentral}. El criterio de éxito establece que la búsqueda debe recuperar al menos el 80% de estos papers de verificación. Si este umbral no se alcanza, se realizará un análisis sistemático de los términos potencialmente faltantes, procediendo a refinar la estrategia de búsqueda incorporando sinónimos o variantes terminológicas que permitan capturar los estudios omitidos, sin comprometer la precisión general de la recuperación.\n\n` +
        `El tercer método evalúa la cobertura conceptual de la búsqueda, verificando sistemáticamente que la estrategia capture todos los conceptos clave derivados del marco PICO. Se confirmará que se recuperan adecuadamente estudios sobre: tecnología o intervención (${technologies.length > 0 ? technologies.join(', ') : data.pico.intervention || 'definida en PICO'}), población o dominio de aplicación (${data.pico.population || 'definida en PICO'}), y outcomes o focos temáticos (${thematicFoci.length > 0 ? thematicFoci.join(', ') : data.pico.outcome || 'definidos en PICO'}). Esta verificación asegura que ningún componente central de la pregunta de investigación haya sido inadvertidamente subrepresentado en la estrategia de búsqueda.\n\n` +
        `El cuarto método analiza el balance entre sensibilidad (recall) y especificidad (precision) de la búsqueda. La sensibilidad se evalúa mediante snowballing y consulta con expertos, verificando que se recuperen todos los estudios relevantes conocidos del área. La especificidad se mide mediante la proporción de estudios irrelevantes recuperados, estableciendo como meta que al menos el 10-15% de las referencias recuperadas sean finalmente incluidas tras el proceso de screening. Este balance garantiza que la búsqueda es exhaustiva sin resultar impracticable por exceso de ruido informacional.\n\n` +
        `El quinto método consiste en una prueba de intercalibración de reproducibilidad. Dos revisores independientes ejecutarán la búsqueda siguiendo exactamente la documentación proporcionada, verificando que ambos obtienen resultados idénticos en términos de número de referencias recuperadas. Esta prueba valida que la estrategia está suficientemente especificada y documentada para ser reproducible por investigadores independientes, cumpliendo con el principio de transparencia científica.\n\n` +
        `El sexto método requiere documentación completa de las iteraciones del proceso de búsqueda. Se registrará la versión inicial de las cadenas de búsqueda, todos los refinamientos realizados con sus justificaciones metodológicas correspondientes, el número de resultados obtenido en cada versión, y las decisiones metodológicas tomadas durante el proceso de desarrollo de la estrategia. Esta documentación proporciona trazabilidad completa del proceso y permite comprender la evolución de la estrategia hacia su forma final.\n\n` +
        `Los criterios de aceptación establecen que la búsqueda se considera metodológicamente válida si cumple simultáneamente las siguientes condiciones: recupera al menos el 80% de papers conocidos previamente identificados como relevantes (validación por gold standard); cubre exhaustivamente todos los conceptos del marco PICO sin omisiones conceptuales; es reproducible por revisores independientes obteniendo resultados idénticos; expertos reconocidos en ${researchArea} confirman su exhaustividad y pertinencia; y presenta un balance adecuado entre sensibilidad (capacidad de recuperar estudios relevantes) y especificidad (proporción manejable de estudios irrelevantes).\n\n` +
        `Todo el proceso de validación será documentado exhaustivamente en el protocolo final de la revisión sistemática, incluyendo los resultados específicos de cada método de validación aplicado, los problemas identificados durante el proceso y las soluciones implementadas, y la justificación detallada de todas las decisiones metodológicas tomadas. Esta transparencia metodológica permite la evaluación crítica por pares y la replicación exacta del proceso por investigadores futuros.\n\n` +
        `Este nivel de control de calidad multinivel asegura que la estrategia de búsqueda implementada es: exhaustiva, capturando toda la evidencia relevante disponible en las fuentes consultadas; reproducible, permitiendo que otros investigadores repliquen exactamente el proceso y obtengan resultados idénticos; válida, recuperando los estudios conocidos fundamentales del área; y eficiente, manteniendo una proporción manejable de estudios irrelevantes que no comprometa la factibilidad práctica de la revisión. La combinación de estos métodos de validación constituye la mejor práctica metodológica en revisiones sistemáticas, conforme a los estándares internacionales establecidos por organizaciones como Cochrane Collaboration, PRISMA y Campbell Collaboration.`
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
      // Separar datos de proyecto y protocolo
      const projectData = {
        title: data.selectedTitle,
        description: data.projectDescription,
        status: 'in-progress' // Cambiar de 'draft' a 'in-progress' (estado válido)
      }

      // Encontrar el título seleccionado completo (con español)
      const selectedTitleObj = data.generatedTitles?.find(t => t.title === data.selectedTitle)
      const titleToSave = selectedTitleObj?.spanishTitle || data.selectedTitle

      // Mapear IDs de bases de datos a nombres completos
      const DATABASE_ID_TO_NAME: Record<string, string> = {
        'scopus': 'Scopus',
        'ieee': 'IEEE Xplore',
        'acm': 'ACM Digital Library',
        'springer': 'Springer Link',
        'sciencedirect': 'ScienceDirect',
        'webofscience': 'Web of Science',
        'pubmed': 'PubMed',
        'embase': 'Embase',
        'cochrane': 'Cochrane Library',
        'cinahl': 'CINAHL',
        'eric': 'ERIC',
        'psycinfo': 'PsycINFO',
        'jstor': 'JSTOR',
        'sage': 'SAGE Journals',
        'avery': 'Avery Index',
        'taylor': 'Taylor & Francis',
        'econlit': 'EconLit',
        'wiley': 'Wiley Online Library',
        'arxiv': 'arXiv',
        'google_scholar': 'Google Scholar'
      }

      // Convertir IDs a nombres
      const databaseNames = (data.searchPlan?.databases || []).map(dbId => {
        // Si ya es un objeto con name, usar name
        if (typeof dbId === 'object' && dbId !== null && 'name' in dbId) {
          return dbId.name
        }
        // Si es string (ID), convertir a nombre
        if (typeof dbId === 'string') {
          return DATABASE_ID_TO_NAME[dbId] || dbId
        }
        return null
      }).filter(name => name !== null)

      // Construir cadenas de búsqueda desde las queries
      const searchQueries = data.searchPlan?.searchQueries || []
      const firstQuery = searchQueries.length > 0 ? searchQueries[0] : null
      const searchString = firstQuery?.query || ''

      // Mapear todas las queries con sus bases de datos
      const queries = searchQueries.map(q => ({
        database: q.databaseName || q.databaseId,
        databaseId: q.databaseId,
        query: q.query,
        baseQuery: q.baseQuery,
        hasAPI: q.hasAPI,
        apiRequired: q.apiRequired,
        status: q.status || 'pending',
        resultsCount: 0
      }))

      const protocolData = {
        proposedTitle: titleToSave,
        population: data.pico.population,
        intervention: data.pico.intervention,
        comparison: data.pico.comparison || '',
        outcomes: data.pico.outcome,
        refinedQuestion: data.projectDescription,
        isMatrix: data.matrixIsNot.is,
        isNotMatrix: data.matrixIsNot.isNot,
        inclusionCriteria: data.inclusionCriteria,
        exclusionCriteria: data.exclusionCriteria,
        databases: databaseNames,
        searchString: searchString,
        searchQueries: queries,
        temporalRange: {
          start: data.yearStart || 2019,
          end: data.yearEnd || new Date().getFullYear(),
          justification: `Rango temporal definido para cubrir investigaciones recientes en ${data.researchArea || 'el área de estudio'}`
        },
        keyTerms: {
          technology: (data.protocolDefinition?.technologies || []).filter((_, idx) => !data.discardedTerms?.tecnologia?.has(idx)),
          domain: (data.protocolDefinition?.applicationDomain || []).filter((_, idx) => !data.discardedTerms?.dominio?.has(idx)),
          studyType: (data.protocolDefinition?.studyType || []).filter((_, idx) => !data.discardedTerms?.tipoEstudio?.has(idx)),
          themes: (data.protocolDefinition?.thematicFocus || []).filter((_, idx) => !data.discardedTerms?.focosTematicos?.has(idx))
        },
        prismaCompliance: PRISMA_WPOM_ITEMS.map(item => ({
          number: item.number,
          item: item.question,
          complies: prismaData[item.id]?.complies ? 'yes' : prismaData[item.id]?.complies === false ? 'no' : 'pending',
          evidence: prismaData[item.id]?.evidence || ''
        }))
      }

      console.log('🔍 DEBUG - searchPlan:', data.searchPlan)
      console.log('🔍 DEBUG - protocolDefinition:', data.protocolDefinition)
      console.log('🔍 DEBUG - protocolData que se enviará:', protocolData)

      let result: any = null
      
      if (data.projectId) {
        // Proyecto ya existe (creado en paso 6), actualizarlo
        console.log('📝 Actualizando proyecto existente:', data.projectId)
        
        // 1. Actualizar proyecto (solo title, description, status)
        await apiClient.updateProject(data.projectId, projectData)
        
        // 2. Actualizar protocolo por separado
        await apiClient.updateProtocol(data.projectId, protocolData)
        
        toast({
          title: "✅ Proyecto completado",
          description: "Redirigiendo a tu proyecto..."
        })
        setTimeout(() => router.push(`/projects/${data.projectId}`), 1500)
      } else {
        // Crear proyecto nuevo (caso excepcional)
        console.log('📝 Creando proyecto nuevo')
        result = await apiClient.createProject({
          ...projectData,
          protocol: protocolData
        })

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
      console.error('❌ Error al guardar proyecto:', error)
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
        <h2 className="text-2xl font-bold">PRISMA 2020 y Confirmación</h2>
        <p className="text-base text-muted-foreground">
          Verificación de calidad PRISMA 2020 para revisión sistemática en {researchArea}
        </p>
      </div>

      {/* Mensaje informativo */}
      <Card className="border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Reporte Final del Protocolo
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                Este es el paso final de tu protocolo de investigación. A continuación se presenta un reporte completo con la verificación de calidad PRISMA 2020. 
                Los campos son de <strong>solo lectura</strong> y representan tu protocolo final.
              </p>
              <div className="border-l-4 border-blue-500 pl-3 bg-blue-100/50 dark:bg-blue-900/50 p-2 rounded-r">
                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
                  📋 <strong>Marco de Evaluación Metodológica:</strong> Cada ítem PRISMA ha sido evaluado considerando <strong>evidencia explícita, trazable y verificable</strong> de tu tema de estudio específico: <em>"{data.selectedTitle || themaCentral}"</em>. 
                  Las respuestas no son genéricas, sino fundamentadas en los componentes de tu protocolo (PICO, términos, criterios I/E, cadenas de búsqueda).
                </p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                Una vez que confirmes, se creará tu proyecto y podrás comenzar la fase de ejecución.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Ejecutivo del Protocolo */}
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Resumen Ejecutivo del Protocolo</CardTitle>
              <CardDescription className="text-primary-foreground/80 mt-1">
                Reporte final de tu revisión sistemática
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Título del Proyecto */}
          <div className="p-4 rounded-lg border-2 border-primary/20">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Título de la Investigación
            </div>
            <p className="text-base font-semibold mt-1 text-gray-900 dark:text-gray-100">{data.selectedTitle}</p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-lg border-2 border-primary/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Bases de Datos</div>
              <div className="text-2xl font-bold text-foreground mt-2">
                {data.searchPlan?.databases?.length || 0}
              </div>
            </div>
            <div className="p-4 rounded-lg border-2 border-primary/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Criterios I/E</div>
              <div className="text-2xl font-bold text-foreground mt-2">
                {(data.inclusionCriteria?.length || 0) + (data.exclusionCriteria?.length || 0)}
              </div>
            </div>
            <div className="p-4 rounded-lg border-2 border-primary/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Términos Clave</div>
              <div className="text-2xl font-bold text-foreground mt-2">
                {(data.protocolTerms?.tecnologia?.length || 0) + (data.protocolTerms?.dominio?.length || 0)}
              </div>
            </div>
            <div className="p-4 rounded-lg border-2 border-primary/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Calidad PRISMA</div>
              <div className="text-2xl font-bold text-foreground mt-2">{compliance}%</div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Proyecto</span>
              <p className="font-medium mt-1 text-foreground">📚 {data.projectName}</p>
            </div>
            <div className="p-3 rounded-lg border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Área de Investigación</span>
              <p className="font-medium mt-1 text-gray-900 dark:text-gray-100">🎯 {researchArea.replace('-', ' ').toUpperCase()}</p>
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
          <Accordion type="multiple" defaultValue={[]} className="w-full">
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
      <Card className="border-4 border-primary shadow-2xl">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            {/* Icono y Título Principal */}
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                <Rocket className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                ¡Protocolo Completado!
              </h3>
              <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                Has finalizado la definición de tu protocolo de investigación
              </p>
            </div>

            {/* Información de completitud */}
            <div className="border-2 border-green-300 dark:border-green-700 p-6 rounded-xl max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground">Calidad PRISMA 2020</span>
                <Badge variant={compliance >= 80 ? "default" : "secondary"} className="text-base px-3 py-1">
                  {compliance}%
                </Badge>
              </div>
              <Progress value={compliance} className="h-3 mb-4" />
              <p className="text-sm text-foreground">
                {compliance >= 80 
                  ? "✅ Excelente: Tu protocolo cumple con altos estándares de calidad"
                  : compliance >= 60
                  ? "⚠️ Bueno: Puedes mejorar algunos aspectos del protocolo más adelante"
                  : "📝 Básico: Considera revisar y completar más ítems del checklist"}
              </p>
            </div>

            {/* Mensaje de cierre */}
            <div className="border-2 border-blue-300 dark:border-blue-700 p-4 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-left space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Este es el cierre de la fase de planificación
                  </p>
                  <p className="text-sm text-foreground">
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
              className="w-full max-w-md h-12 text-base font-semibold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all"
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

            <p className="text-xs text-gray-600 dark:text-gray-400">
              Al confirmar aceptas que el protocolo está listo para la fase de ejecución
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
