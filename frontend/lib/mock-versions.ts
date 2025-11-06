import type { ArticleVersion } from "./article-types"

export const mockVersions: ArticleVersion[] = [
  {
    id: "v3",
    projectId: "1",
    version: 3,
    title: "Inteligencia Artificial en Educación Superior: Una Revisión Sistemática",
    content: {
      abstract:
        "Esta revisión sistemática examina el impacto de las tecnologías de inteligencia artificial en los resultados de aprendizaje de la educación superior. Se analizaron 45 estudios publicados entre 2018-2023, enfocándose en sistemas de tutoría con IA, plataformas de aprendizaje adaptativo y herramientas de evaluación automatizada. Los resultados indican mejoras significativas en el compromiso estudiantil y el rendimiento académico, con un tamaño de efecto promedio de d=0.68.",
      introduction:
        "La integración de la inteligencia artificial (IA) en la educación superior ha experimentado un crecimiento exponencial en la última década. Las instituciones educativas están adoptando cada vez más tecnologías basadas en IA para personalizar la experiencia de aprendizaje, automatizar tareas administrativas y proporcionar retroalimentación instantánea a los estudiantes...",
      methods:
        "Se realizó una búsqueda sistemática en IEEE Xplore, ACM Digital Library, Scopus y Web of Science. Los criterios de inclusión fueron: (1) estudios empíricos publicados entre 2018-2023, (2) enfoque en educación superior, (3) implementación de tecnologías de IA, (4) medición de resultados de aprendizaje. Se utilizó el framework PICO para estructurar la pregunta de investigación...",
      results:
        "De 245 referencias iniciales, 45 estudios cumplieron los criterios de inclusión. Los estudios se distribuyeron en tres categorías principales: sistemas de tutoría inteligente (n=18), plataformas de aprendizaje adaptativo (n=15) y herramientas de evaluación automatizada (n=12). El análisis reveló mejoras significativas en el rendimiento académico...",
      discussion:
        "Los hallazgos de esta revisión sistemática demuestran que la implementación de tecnologías de IA en educación superior tiene un impacto positivo en los resultados de aprendizaje. Sin embargo, es importante considerar las limitaciones metodológicas de los estudios incluidos y las variaciones en los contextos de implementación...",
      conclusions:
        "Esta revisión sistemática proporciona evidencia sólida del impacto positivo de la IA en la educación superior. Se recomienda que las instituciones educativas consideren la adopción de estas tecnologías con un enfoque centrado en el estudiante y con evaluación continua de su efectividad.",
      references:
        "1. Smith, J., et al. (2023). AI in Higher Education. IEEE Xplore.\n2. García, A., et al. (2022). Machine Learning Applications. ACM Digital Library.",
    },
    createdAt: new Date("2024-03-20T14:30:00"),
    createdBy: "Juan Pérez",
    changeDescription: "Revisión completa de la sección de resultados y actualización de estadísticas",
    wordCount: 3450,
    isPublished: false,
  },
  {
    id: "v2",
    projectId: "1",
    version: 2,
    title: "Inteligencia Artificial en Educación Superior: Una Revisión Sistemática",
    content: {
      abstract:
        "Esta revisión sistemática examina el impacto de las tecnologías de inteligencia artificial en los resultados de aprendizaje de la educación superior. Se analizaron 42 estudios publicados entre 2018-2023.",
      introduction:
        "La integración de la inteligencia artificial (IA) en la educación superior ha experimentado un crecimiento exponencial en la última década...",
      methods: "Se realizó una búsqueda sistemática en IEEE Xplore, ACM Digital Library, Scopus y Web of Science...",
      results: "De 245 referencias iniciales, 42 estudios cumplieron los criterios de inclusión...",
      discussion: "Los hallazgos de esta revisión sistemática demuestran un impacto positivo...",
      conclusions: "Esta revisión sistemática proporciona evidencia del impacto de la IA en educación superior.",
      references: "1. Smith, J., et al. (2023). AI in Higher Education. IEEE Xplore.",
    },
    createdAt: new Date("2024-03-15T10:15:00"),
    createdBy: "Juan Pérez",
    changeDescription: "Agregada sección de discusión y refinamiento del abstract",
    wordCount: 2890,
    isPublished: false,
  },
  {
    id: "v1",
    projectId: "1",
    version: 1,
    title: "Inteligencia Artificial en Educación Superior",
    content: {
      abstract: "Borrador inicial del abstract...",
      introduction: "Introducción preliminar...",
      methods: "Métodos en desarrollo...",
      results: "Resultados pendientes...",
      discussion: "",
      conclusions: "",
      references: "",
    },
    createdAt: new Date("2024-03-10T09:00:00"),
    createdBy: "Juan Pérez",
    changeDescription: "Versión inicial generada automáticamente por IA",
    wordCount: 850,
    isPublished: false,
  },
]
