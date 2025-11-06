export interface PrismaItem {
  id: number
  section: string
  item: string
  description: string
  location: string
}

export const prismaChecklist: PrismaItem[] = [
  // Title
  {
    id: 1,
    section: "Título",
    item: "Título",
    description: "Identifique el informe como una revisión sistemática.",
    location: "Título",
  },
  // Abstract
  {
    id: 2,
    section: "Resumen",
    item: "Resumen estructurado",
    description:
      "Proporcione un resumen estructurado que incluya antecedentes, objetivos, fuentes de datos, criterios de elegibilidad, participantes, intervenciones, evaluación de estudios, métodos de síntesis, resultados, limitaciones, conclusiones e implicaciones.",
    location: "Resumen",
  },
  // Introduction
  {
    id: 3,
    section: "Introducción",
    item: "Justificación",
    description: "Describa la justificación de la revisión en el contexto del conocimiento existente.",
    location: "Introducción",
  },
  {
    id: 4,
    section: "Introducción",
    item: "Objetivos",
    description:
      "Proporcione una declaración explícita de las preguntas que se abordan con referencia a participantes, intervenciones, comparaciones, resultados y diseño de estudio (PICOS).",
    location: "Introducción",
  },
  // Methods
  {
    id: 5,
    section: "Métodos",
    item: "Protocolo y registro",
    description:
      "Indique si existe un protocolo de revisión, si y dónde se puede acceder (por ejemplo, dirección web), y, si está disponible, proporcione información de registro, incluido el número de registro.",
    location: "Métodos",
  },
  {
    id: 6,
    section: "Métodos",
    item: "Criterios de elegibilidad",
    description:
      "Especifique las características del estudio (por ejemplo, PICOS, duración del seguimiento) y las características del informe (por ejemplo, años considerados, idioma, estado de publicación) utilizadas como criterios de elegibilidad.",
    location: "Métodos",
  },
  {
    id: 7,
    section: "Métodos",
    item: "Fuentes de información",
    description:
      "Describa todas las fuentes de información (por ejemplo, bases de datos con fechas de cobertura, contacto con autores de estudios) en la búsqueda y la fecha de la última búsqueda.",
    location: "Métodos",
  },
  {
    id: 8,
    section: "Métodos",
    item: "Búsqueda",
    description:
      "Presente la estrategia de búsqueda electrónica completa para al menos una base de datos, incluidos los límites utilizados, de modo que se pueda repetir.",
    location: "Métodos",
  },
  {
    id: 9,
    section: "Métodos",
    item: "Selección de estudios",
    description:
      "Indique el proceso de selección de estudios (es decir, cribado, elegibilidad, incluidos en la revisión sistemática y, si corresponde, incluidos en el metanálisis).",
    location: "Métodos",
  },
  {
    id: 10,
    section: "Métodos",
    item: "Proceso de extracción de datos",
    description:
      "Describa el método de extracción de datos de los informes (por ejemplo, formularios piloto, independientemente, por duplicado) y cualquier proceso para obtener y confirmar datos de los investigadores.",
    location: "Métodos",
  },
  {
    id: 11,
    section: "Métodos",
    item: "Lista de datos",
    description:
      "Enumere y defina todas las variables para las que se buscaron datos (por ejemplo, PICOS, fuentes de financiación) y cualquier suposición y simplificación realizada.",
    location: "Métodos",
  },
  {
    id: 12,
    section: "Métodos",
    item: "Riesgo de sesgo en estudios individuales",
    description:
      "Describa los métodos utilizados para evaluar el riesgo de sesgo de los estudios individuales (incluida la especificación de si esto se hizo a nivel de estudio o de resultado) y cómo se utilizará esta información en cualquier síntesis de datos.",
    location: "Métodos",
  },
  {
    id: 13,
    section: "Métodos",
    item: "Medidas de resumen",
    description: "Indique las principales medidas de resumen (por ejemplo, razón de riesgo, diferencia de medias).",
    location: "Métodos",
  },
  {
    id: 14,
    section: "Métodos",
    item: "Síntesis de resultados",
    description:
      "Describa los métodos de manejo de datos y combinación de resultados de estudios, si se realizó, incluidas las medidas de consistencia (por ejemplo, I²) para cada metanálisis.",
    location: "Métodos",
  },
  {
    id: 15,
    section: "Métodos",
    item: "Riesgo de sesgo entre estudios",
    description:
      "Especifique cualquier evaluación del riesgo de sesgo que pueda afectar la evidencia acumulativa (por ejemplo, sesgo de publicación, informe selectivo dentro de los estudios).",
    location: "Métodos",
  },
  {
    id: 16,
    section: "Métodos",
    item: "Análisis adicionales",
    description:
      "Describa los métodos de análisis adicionales (por ejemplo, análisis de sensibilidad o subgrupos, metarregresión), si se realizó, indicando cuáles fueron preespecificados.",
    location: "Métodos",
  },
  // Results
  {
    id: 17,
    section: "Resultados",
    item: "Selección de estudios",
    description:
      "Proporcione números de estudios cribados, evaluados para elegibilidad e incluidos en la revisión, con razones para exclusiones en cada etapa, idealmente con un diagrama de flujo.",
    location: "Resultados",
  },
  {
    id: 18,
    section: "Resultados",
    item: "Características de los estudios",
    description:
      "Para cada estudio, presente las características para las que se extrajeron datos (por ejemplo, tamaño del estudio, PICOS, período de seguimiento) y proporcione las citas.",
    location: "Resultados",
  },
  {
    id: 19,
    section: "Resultados",
    item: "Riesgo de sesgo dentro de los estudios",
    description:
      "Presente datos sobre el riesgo de sesgo de cada estudio y, si está disponible, cualquier evaluación a nivel de resultado (ver ítem 12).",
    location: "Resultados",
  },
  {
    id: 20,
    section: "Resultados",
    item: "Resultados de estudios individuales",
    description:
      "Para todos los resultados considerados (beneficios o daños), presente, para cada estudio: (a) datos de resumen simples para cada grupo de intervención (b) estimaciones de efectos e intervalos de confianza, idealmente con un gráfico de bosque.",
    location: "Resultados",
  },
  {
    id: 21,
    section: "Resultados",
    item: "Síntesis de resultados",
    description:
      "Presente los resultados de cada metanálisis realizado, incluidos los intervalos de confianza y las medidas de consistencia.",
    location: "Resultados",
  },
  {
    id: 22,
    section: "Resultados",
    item: "Riesgo de sesgo entre estudios",
    description: "Presente los resultados de cualquier evaluación de riesgo de sesgo entre estudios (ver Ítem 15).",
    location: "Resultados",
  },
  {
    id: 23,
    section: "Resultados",
    item: "Análisis adicionales",
    description:
      "Proporcione los resultados de análisis adicionales, si se realizó (por ejemplo, análisis de sensibilidad o subgrupos, metarregresión [ver Ítem 16]).",
    location: "Resultados",
  },
  // Discussion
  {
    id: 24,
    section: "Discusión",
    item: "Resumen de la evidencia",
    description:
      "Resuma los hallazgos principales, incluida la fortaleza de la evidencia para cada resultado principal; considere su relevancia para grupos clave (por ejemplo, proveedores de atención médica, usuarios y responsables de políticas).",
    location: "Discusión",
  },
  {
    id: 25,
    section: "Discusión",
    item: "Limitaciones",
    description:
      "Discuta las limitaciones a nivel de estudio y de resultado (por ejemplo, riesgo de sesgo) y a nivel de revisión (por ejemplo, recuperación incompleta de investigación identificada, sesgo de informe).",
    location: "Discusión",
  },
  {
    id: 26,
    section: "Discusión",
    item: "Conclusiones",
    description:
      "Proporcione una interpretación general de los resultados en el contexto de otra evidencia y las implicaciones para la investigación futura.",
    location: "Discusión",
  },
  // Funding
  {
    id: 27,
    section: "Financiamiento",
    item: "Financiamiento",
    description:
      "Describa las fuentes de financiamiento para la revisión sistemática y otro apoyo (por ejemplo, suministro de datos); papel de los financiadores para la revisión sistemática.",
    location: "Financiamiento",
  },
]
