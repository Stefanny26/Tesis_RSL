// Tipos de contenido PRISMA
export type PrismaContentType = 'automated' | 'human' | 'hybrid' | 'pending'

export interface PrismaItem {
  id: number
  section: string
  item: string
  description: string
  location: string
}

export interface PrismaItemData {
  id?: string
  projectId: string
  itemNumber: number
  section: string
  completed: boolean
  content: string
  contentType: PrismaContentType
  dataSource?: string
  automatedContent?: string
  lastHumanEdit?: string
  aiValidation?: {
    validated: boolean
    suggestions?: string
    issues?: string[]
  }
  completedAt?: string
  updatedAt?: string
}

export interface PrismaStats {
  total: number
  completed: number
  pending: number
  automated: number
  human: number
  hybrid: number
  aiValidated: number
  completionPercentage: number
}

export const prismaChecklist: PrismaItem[] = [
  // TÍTULO
  {
    id: 1,
    section: "TÍTULO",
    item: "Título",
    description: "Identifique el informe como una revisión sistemática.",
    location: "Título",
  },
  // RESUMEN
  {
    id: 2,
    section: "RESUMEN",
    item: "Resumen estructurado",
    description:
      "Proporcione un resumen estructurado que incluya antecedentes, objetivos, fuentes de datos, criterios de elegibilidad, métodos, resultados, limitaciones, conclusiones e implicaciones de los hallazgos clave.",
    location: "Resumen",
  },
  // INTRODUCCIÓN
  {
    id: 3,
    section: "INTRODUCCIÓN",
    item: "Justificación",
    description: "Describa la justificación de la revisión en el contexto del conocimiento existente.",
    location: "Introducción",
  },
  {
    id: 4,
    section: "INTRODUCCIÓN",
    item: "Objetivos",
    description:
      "Proporcione una declaración explícita de las preguntas que la revisión aborda, referenciadas a participantes, intervenciones, comparaciones, resultados y diseño de estudio (PICOS).",
    location: "Introducción",
  },
  // MÉTODOS
  {
    id: 5,
    section: "MÉTODOS",
    item: "Criterios de elegibilidad",
    description:
      "Especifique los criterios de inclusión y exclusión de la revisión y cómo se agruparon los estudios para las síntesis.",
    location: "Métodos",
  },
  {
    id: 6,
    section: "MÉTODOS",
    item: "Fuentes de información",
    description:
      "Especifique todas las bases de datos, registros, sitios web, organizaciones, listas de referencias y otras fuentes buscadas o consultadas para identificar estudios. Especifique la fecha en que cada fuente fue buscada o consultada por última vez.",
    location: "Métodos",
  },
  {
    id: 7,
    section: "MÉTODOS",
    item: "Estrategia de búsqueda",
    description:
      "Presente las estrategias de búsqueda completas para todas las bases de datos, registros y sitios web, incluidos los filtros y límites utilizados.",
    location: "Métodos",
  },
  {
    id: 8,
    section: "MÉTODOS",
    item: "Proceso de selección",
    description:
      "Especifique los métodos utilizados para decidir si un estudio cumplía con los criterios de inclusión, incluyendo: número de revisores, si trabajaron de forma independiente y las herramientas de automatización utilizadas.",
    location: "Métodos",
  },
  {
    id: 9,
    section: "MÉTODOS",
    item: "Proceso de recopilación de datos",
    description:
      "Especifique los métodos utilizados para recopilar datos de los informes, incluyendo: número de revisores, si trabajaron de forma independiente y las herramientas de automatización utilizadas.",
    location: "Métodos",
  },
  {
    id: 10,
    section: "MÉTODOS",
    item: "Elementos de datos",
    description:
      "Liste y defina todos los resultados y otras variables para las cuales se buscaron datos.",
    location: "Métodos",
  },
  {
    id: 11,
    section: "MÉTODOS",
    item: "Evaluación del riesgo de sesgo en los estudios",
    description:
      "Especifique los métodos utilizados para evaluar el riesgo de sesgo en los estudios incluidos.",
    location: "Métodos",
  },
  {
    id: 12,
    section: "MÉTODOS",
    item: "Medidas de efecto",
    description:
      "Especifique para cada resultado la(s) medida(s) de efecto utilizadas en la síntesis o presentación de resultados.",
    location: "Métodos",
  },
  {
    id: 13,
    section: "MÉTODOS",
    item: "Métodos de síntesis",
    description:
      "Describa los procesos utilizados para decidir qué estudios eran elegibles para cada síntesis y los métodos utilizados para preparar y sintetizar los datos.",
    location: "Métodos",
  },
  {
    id: 14,
    section: "MÉTODOS",
    item: "Evaluación del sesgo de informe",
    description:
      "Describa cualquier método utilizado para evaluar el riesgo de sesgo debido a resultados faltantes (sesgo de informe).",
    location: "Métodos",
  },
  {
    id: 15,
    section: "MÉTODOS",
    item: "Evaluación de la certeza",
    description:
      "Describa cualquier método utilizado para evaluar la certeza (o confianza) en el cuerpo de evidencia para un resultado.",
    location: "Métodos",
  },
  // RESULTADOS
  {
    id: 16,
    section: "RESULTADOS",
    item: "Selección de estudios",
    description:
      "Describa los resultados del proceso de búsqueda y selección, incluido el número de estudios cribados, evaluados para elegibilidad e incluidos, idealmente mediante un diagrama de flujo.",
    location: "Resultados",
  },
  {
    id: 17,
    section: "RESULTADOS",
    item: "Características de los estudios",
    description:
      "Cite cada estudio incluido y presente sus características.",
    location: "Resultados",
  },
  {
    id: 18,
    section: "RESULTADOS",
    item: "Riesgo de sesgo en los estudios",
    description:
      "Presente las evaluaciones del riesgo de sesgo para cada estudio incluido.",
    location: "Resultados",
  },
  {
    id: 19,
    section: "RESULTADOS",
    item: "Resultados de estudios individuales",
    description:
      "Para todos los resultados, presente estadísticas resumidas para cada estudio.",
    location: "Resultados",
  },
  {
    id: 20,
    section: "RESULTADOS",
    item: "Resultados de las síntesis",
    description:
      "Presente los resultados de todas las síntesis realizadas, incluidos los intervalos de confianza cuando corresponda.",
    location: "Resultados",
  },
  {
    id: 21,
    section: "RESULTADOS",
    item: "Sesgos de informe",
    description:
      "Presente las evaluaciones del riesgo de sesgo debido a resultados faltantes.",
    location: "Resultados",
  },
  {
    id: 22,
    section: "RESULTADOS",
    item: "Certeza de la evidencia",
    description:
      "Presente las evaluaciones de la certeza (o confianza) en el cuerpo de evidencia.",
    location: "Resultados",
  },
  // DISCUSIÓN
  {
    id: 23,
    section: "DISCUSIÓN",
    item: "Discusión",
    description:
      "Proporcione una interpretación general de los resultados en el contexto de otra evidencia y discuta las limitaciones.",
    location: "Discusión",
  },
  // OTRA INFORMACIÓN
  {
    id: 24,
    section: "OTRA INFORMACIÓN",
    item: "Registro y protocolo",
    description:
      "Proporcione información de registro de la revisión, incluido el nombre del registro y el número de registro, o indique que no se registró un protocolo.",
    location: "Otra información",
  },
  {
    id: 25,
    section: "OTRA INFORMACIÓN",
    item: "Apoyo",
    description:
      "Describa las fuentes de apoyo financiero o no financiero.",
    location: "Otra información",
  },
  {
    id: 26,
    section: "OTRA INFORMACIÓN",
    item: "Intereses en competencia",
    description:
      "Declare cualquier interés en competencia de los autores de la revisión.",
    location: "Otra información",
  },
  {
    id: 27,
    section: "OTRA INFORMACIÓN",
    item: "Disponibilidad de datos, código y otros materiales",
    description:
      "Informe cuáles de los siguientes están disponibles públicamente y dónde: formularios de extracción de datos, datos extraídos, código analítico, otros materiales utilizados en la revisión.",
    location: "Otra información",
  },
]
