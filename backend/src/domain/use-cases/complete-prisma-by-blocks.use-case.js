/**
 * Use Case: Completar Ítems PRISMA por Bloques
 * 
 * Genera automáticamente los ítems PRISMA pendientes usando prompt académico estructurado
 * conforme a PRISMA 2020, sin inferir datos, solo describiendo lo existente.
 * 
 * BLOQUES:
 * 1. MÉTODOS (Ítems 11-15)
 * 2. RESULTADOS (Ítems 16-20)
 * 3. DISCUSIÓN (Ítem 23)
 * 4. OTRA INFORMACIÓN (Ítems 24-27)
 */

class CompletePrismaByBlocksUseCase {
  constructor({ 
    prismaItemRepository,
    protocolRepository,
    aiService,
    generatePrismaContextUseCase
  }) {
    this.prismaItemRepository = prismaItemRepository;
    this.protocolRepository = protocolRepository;
    this.aiService = aiService;
    this.generatePrismaContextUseCase = generatePrismaContextUseCase;
  }

  /**
   * Ejecutar completitud por bloques
   */
  async execute(projectId, block = 'all') {
    try {
      console.log(`🔄 Completando PRISMA - Bloque: ${block}`);

      // 1. Generar PRISMA Context
      const contextResult = await this.generatePrismaContextUseCase.execute(projectId);
      if (!contextResult.success) {
        throw new Error('No se pudo generar el contexto PRISMA');
      }

      const prismaContext = contextResult.context;

      // 2. Determinar qué bloques ejecutar
      const blocks = block === 'all' 
        ? ['title', 'abstract', 'introduction', 'methods', 'results', 'discussion', 'other']
        : [block];

      const results = {};

      // 3. Ejecutar cada bloque secuencialmente
      for (const blockName of blocks) {
        console.log(`📝 Procesando bloque: ${blockName.toUpperCase()}`);
        const blockResult = await this.processBlock(projectId, blockName, prismaContext);
        results[blockName] = blockResult;
      }

      // 4. Obtener estadísticas actualizadas
      const stats = await this.prismaItemRepository.getComplianceStats(projectId);

      return {
        success: true,
        blocksProcessed: blocks,
        results,
        stats: {
          completed: parseInt(stats.completed) || 0,
          total: 27,
          completionPercentage: Math.round((parseInt(stats.completed) / 27) * 100)
        }
      };

    } catch (error) {
      console.error('❌ Error completando PRISMA por bloques:', error);
      throw error;
    }
  }

  /**
   * Procesar un bloque específico
   */
  async processBlock(projectId, blockName, prismaContext) {
    const blockConfig = this.getBlockConfig(blockName);
    
    // Generar prompt académico
    const prompt = this.generateAcademicPrompt(blockConfig, prismaContext);
    
    // Llamar a IA (prioridad ChatGPT)
    console.log(`🤖 Consultando IA para bloque: ${blockName}`);
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.generateAcademicPrompt(blockConfig, prismaContext);
    
    const aiResponse = await this.aiService.generateText(systemPrompt, userPrompt, 'chatgpt');
    console.log(`✅ Respuesta recibida de IA (${aiResponse.length} caracteres)`);

    // Parsear respuesta
    let itemsData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        itemsData = JSON.parse(jsonMatch[0]);
      } else {
        itemsData = JSON.parse(aiResponse);
      }
      console.log(`✅ JSON parseado: ${itemsData.items?.length || 0} ítems`);
    } catch (error) {
      console.error('❌ Error parseando respuesta de IA:', error);
      console.error('📄 Respuesta completa:', aiResponse.substring(0, 500));
      throw new Error('La IA no devolvió JSON válido');
    }

    // Guardar ítems en BD
    const savedItems = [];
    for (const itemData of itemsData.items || []) {
      console.log(`💾 Guardando ítem ${itemData.itemNumber}...`);
      const saved = await this.prismaItemRepository.updateContent(
        projectId,
        itemData.itemNumber,
        itemData.content,
        false // No marcar como editado manualmente
      );
      savedItems.push(saved);
    }
    
    console.log(`✅ Bloque ${blockName}: ${savedItems.length} ítems guardados`);

    return {
      success: true,
      itemsGenerated: savedItems.length,
      items: savedItems
    };
  }

  /**
   * System Prompt académico (aplicado a todos los bloques)
   */
  getSystemPrompt() {
    return `Actúas como un REVISOR METODOLÓGICO EXPERTO en revisiones sistemáticas PRISMA 2020, con estándares de excelencia académica (8-10/10).

PRINCIPIO FUNDAMENTAL: PRISMA NO ANALIZA, PRISMA DOCUMENTA.

Tu tarea es DOCUMENTAR con máximo rigor lo que YA ocurrió en el proceso de revisión, NO ejecutar análisis nuevos.

REGLAS OBLIGATORIAS (CUMPLIMIENTO ESTRICTO):
1. ❌ NO inventes datos, métricas, números ni procedimientos que no estén en el contexto
2. ❌ NO uses frases vagas como "evaluación cualitativa" sin definir criterios exactos aplicados
3. ❌ NO digas "no se proporciona información" sin antes BUSCAR exhaustivamente en el contexto
4. ❌ PRISMA NO decide, NO clasifica, NO extrae, NO interpreta - solo REPORTA lo que ya se hizo
5. ✅ SÉ ESPECÍFICO: Usa números reales del sistema (277 registros, 48 excluidos, etc.)
6. ✅ DOCUMENTA PROCESOS: Quién realizó, cómo, con qué herramientas, con qué criterios
7. ✅ USA pasado metodológico: "se identificaron", "se evaluaron", "se incluyeron" (nunca futuro)
8. ✅ EXTRAE del contexto: Años de publicación, tipos de estudio, contextos de aplicación, tecnologías
9. ✅ Si usaste IA, documenta: "evaluación sistemática asistida por IA con validación manual"
10. ✅ MITIGA limitaciones en lugar de admitirlas: "el riesgo fue mitigado mediante..." vs "no se pudo evaluar"
11. ✅ CONECTA números entre secciones: Los números en #16 deben coincidir con el diagrama de flujo PRISMA
12. ✅ JUSTIFICA niveles de confianza: "confianza moderada debido a [criterios explícitos]"

NIVEL ESPERADO: Un revisor experto debe poder:
- Reproducir el proceso con tu documentación
- Verificar coherencia numérica entre secciones
- Validar que NO hay inferencias injustificadas
- Calificar el trabajo como 8-10/10 en rigor metodológico`;
  }

  /**
   * Configuración de bloques PRISMA
   */
  getBlockConfig(blockName) {
    const configs = {
      title: {
        name: 'TÍTULO',
        items: [
          {
            number: 1,
            section: 'Title',
            topic: 'Identificar el reporte como una revisión sistemática',
            guidance: 'Generar un título académico que identifique claramente que es una revisión sistemática. Usar el objetivo de la revisión y el tema principal. Ejemplo: "Implementación de Inteligencia Artificial en el Cultivo de Fresas: Una Revisión Sistemática sobre Eficiencia Agrícola Basada en Datos".'
          }
        ]
      },
      abstract: {
        name: 'RESUMEN',
        items: [
          {
            number: 2,
            section: 'Abstract',
            topic: 'Resumen estructurado',
            guidance: 'Generar un resumen estructurado de 250-300 palabras con las secciones: ANTECEDENTES (contexto y problema), OBJETIVO (pregunta de investigación), MÉTODOS (bases de datos, criterios, análisis), RESULTADOS (número de estudios, hallazgos principales), CONCLUSIONES (implicaciones). Usar números reales del contexto PRISMA.'
          }
        ]
      },
      introduction: {
        name: 'INTRODUCCIÓN',
        items: [
          {
            number: 3,
            section: 'Introduction',
            topic: 'Justificación',
            guidance: 'Explicar por qué esta revisión es necesaria en el contexto del conocimiento actual. Incluir: importancia del tema, vacíos en el conocimiento, necesidad de síntesis sistemática.'
          },
          {
            number: 4,
            section: 'Introduction',
            topic: 'Objetivos',
            guidance: 'Declarar explícitamente el objetivo general de la revisión sistemática y los objetivos específicos si existen. Usar el marco PICO si está disponible en el contexto.'
          },
          {
            number: 5,
            section: 'Introduction',
            topic: 'Criterios de elegibilidad',
            guidance: 'Describir los criterios de inclusión y exclusión aplicados. Incluir: tipos de estudio, población, intervención, comparadores, outcomes, restricciones (año, idioma, etc.). Extraer del protocolo.'
          },
          {
            number: 6,
            section: 'Introduction',
            topic: 'Fuentes de información',
            guidance: 'Enumerar todas las bases de datos y fuentes consultadas con fechas de búsqueda. Incluir estrategia de búsqueda en literatura gris si aplica.'
          },
          {
            number: 7,
            section: 'Introduction',
            topic: 'Estrategia de búsqueda',
            guidance: 'Presentar la cadena de búsqueda completa para al menos una base de datos. Incluir términos clave, operadores booleanos, y adaptaciones por base de datos.'
          },
          {
            number: 8,
            section: 'Introduction',
            topic: 'Proceso de selección de estudios',
            guidance: 'Describir el proceso de selección: número de revisores, método de resolución de desacuerdos, herramientas utilizadas (ej: Covidence, Rayyan, sistema propio), fases de cribado (título/resumen, texto completo).'
          },
          {
            number: 9,
            section: 'Introduction',
            topic: 'Proceso de extracción de datos',
            guidance: 'Describir qué datos se extrajeron de cada estudio y cómo. Incluir: variables extraídas, herramientas usadas, validación de extracción.'
          },
          {
            number: 10,
            section: 'Introduction',
            topic: 'Datos extraídos',
            guidance: 'Listar específicamente las variables/datos extraídos de los estudios: autor, año, país, diseño del estudio, muestra, intervención, outcomes medidos, resultados principales.'
          }
        ]
      },
      methods: {
        name: 'MÉTODOS',
        items: [
          {
            number: 11,
            section: 'MÉTODOS',
            topic: 'Evaluación del riesgo de sesgo',
            guidance: 'CRÍTICO: Describir DETALLADAMENTE el método de evaluación del riesgo de sesgo. DEBE incluir: (1) Quién realizó la evaluación (único revisor/múltiples), (2) Dimensiones evaluadas (diseño del estudio, validez interna, claridad metodológica), (3) Procedimiento seguido (lectura crítica, criterios aplicados), (4) Si se usó IA como apoyo, especificar exactamente su rol. NO usar frases genéricas como "evaluación cualitativa" sin más detalle. Ser explícito sobre criterios aplicados.'
          },
          {
            number: 12,
            section: 'MÉTODOS',
            topic: 'Medidas de efecto',
            guidance: 'Describir las métricas o variables observadas en los estudios. En ingeniería de software, pueden ser métricas de rendimiento, escalabilidad, o usabilidad. Si no hay meta-análisis, declarar síntesis narrativa.'
          },
          {
            number: 13,
            section: 'MÉTODOS',
            topic: 'Métodos de síntesis',
            guidance: 'Describir los métodos utilizados para sintetizar los resultados de los estudios incluidos. Especificar si se realizó síntesis narrativa, tabulación de datos, o meta-análisis. Incluir justificación metodológica de la elección.'
          },
          {
            number: 14,
            section: 'MÉTODOS',
            topic: 'Evaluación del sesgo de reporte',
            guidance: 'Describir métodos para evaluar sesgo de publicación o reporte selectivo. Si NO se realizó evaluación formal (funnel plot, Egger test), JUSTIFICAR METODOLÓGICAMENTE por qué (ej: número insuficiente de estudios, naturaleza tecnológica del tema). Declarar explícitamente como limitación si aplica.'
          },
          {
            number: 15,
            section: 'MÉTODOS',
            topic: 'Evaluación de la certeza de la evidencia',
            guidance: 'Describir evaluación de certeza/calidad de la evidencia. Si NO se usó GRADE u otro framework formal, JUSTIFICAR por qué es apropiado en este contexto (ej: estudios tecnológicos primarios, enfoque exploratorio). Explicar criterios alternativos considerados (rigor metodológico, replicabilidad, coherencia entre estudios). NO simplemente decir "no se aplicó".'
          }
        ]
      },
      results: {
        name: 'RESULTADOS',
        items: [
          {
            number: 16,
            section: 'RESULTADOS',
            topic: 'Selección de estudios',
            guidance: 'CRÍTICO: USAR NÚMEROS REALES DEL SISTEMA. Describir el proceso COMPLETO con cifras exactas: (1) Registros identificados en búsquedas, (2) Duplicados eliminados, (3) Registros evaluados en título/resumen, (4) Excluidos en cribado inicial, (5) Evaluados en texto completo, (6) Excluidos en texto completo con MOTIVOS PRINCIPALES, (7) Estudios incluidos en síntesis final. EJEMPLO: "Se identificaron 277 registros. Tras eliminar 0 duplicados, se evaluaron 277 títulos/resúmenes. Se excluyeron 48 por [motivos]. Los 229 restantes se evaluaron en texto completo, excluyéndose 3 por [motivos específicos], resultando en 226 estudios incluidos." Los números deben coincidir EXACTAMENTE con el diagrama de flujo PRISMA.'
          },
          {
            number: 17,
            section: 'RESULTADOS',
            topic: 'Características de los estudios',
            guidance: 'Presentar características ESPECÍFICAS extraídas del análisis de cribado: (1) DISTRIBUCIÓN TEMPORAL: Rango de años (ej: 2018-2024) con concentración en períodos específicos, (2) TIPOS DE ESTUDIO: Proporciones de estudios empíricos, casos de estudio, simulaciones, revisiones, (3) CONTEXTOS DE APLICACIÓN: Industrial, empresarial, académico/experimental con ejemplos concretos (ej: "45% en contexto industrial, principalmente manufactura y logística"), (4) TECNOLOGÍAS PREDOMINANTES: Nombrar tecnologías específicas con frecuencias (ej: "5G fue la tecnología más estudiada (67%), seguida de IoT (23%)"), (5) FUENTES: Principales journals/conferencias. Incluir tabla resumen si es apropiado. SER ESPECÍFICO CON NÚMEROS Y CATEGORÍAS.'
          },
          {
            number: 18,
            section: 'RESULTADOS',
            topic: 'Riesgo de sesgo en los estudios',
            guidance: 'Presentar evaluación del riesgo de sesgo POR ESTUDIO o agregada. Incluir: (1) Proporción de estudios con bajo/medio/alto riesgo, (2) Dominios más problemáticos (diseño, validez, reporting), (3) Patrones observados. Si es evaluación cualitativa, especificar criterios aplicados y hallazgos principales. NO ser vago.'
          },
          {
            number: 19,
            section: 'RESULTADOS',
            topic: 'Resultados de estudios individuales',
            guidance: 'CRÍTICO: DAR CONTENIDO ESPECÍFICO. Presentar resultados clave de AL MENOS 3-5 estudios representativos con: (1) Autor y año, (2) Hallazgo principal reportado (ej: "MongoDB mostró 40% mejor rendimiento en escrituras vs PostgreSQL"), (3) Contexto del hallazgo. NO decir "no se proporciona información específica". Extraer de referencias disponibles. Si no hay datos, declarar explícitamente por qué (ej: PDFs no disponibles, estudios secundarios sin datos primarios).'
          },
          {
            number: 20,
            section: 'RESULTADOS',
            topic: 'Resultados de las síntesis',
            guidance: 'Presentar síntesis narrativa de hallazgos. Identificar tendencias, consistencias o patrones observados. No realizar inferencias causales si no hay análisis estadístico.'
          },
          {
            number: 21,
            section: 'RESULTADOS',
            topic: 'Sesgo de reporte en los resultados',
            guidance: 'REDACCIÓN ROBUSTA REQUERIDA. NO admitir debilidad, sino explicar mitigación. USAR ESTA ESTRUCTURA: "No se realizó una evaluación formal del sesgo de publicación mediante métodos estadísticos (por ejemplo, funnel plots), dado que la revisión se basó en una síntesis narrativa. No obstante, el riesgo de sesgo de reporte fue mitigado mediante: (i) la aplicación de criterios de inclusión y exclusión explícitos, (ii) la búsqueda en múltiples bases de datos académicas reconocidas [NOMBRAR: Scopus, IEEE, etc.], y (iii) la evaluación sistemática de títulos, resúmenes y textos completos apoyada por un sistema de cribado asistido por inteligencia artificial. Estas medidas reducen la probabilidad de omisión selectiva de resultados relevantes." ADAPTAR al contexto específico pero mantener tono de mitigación, no de limitación.'
          },
          {
            number: 22,
            section: 'RESULTADOS',
            topic: 'Certeza de la evidencia',
            guidance: 'Evaluar certeza/calidad de la evidencia con CRITERIOS EXPLÍCITOS. Si se afirma "confianza moderada/alta/baja", JUSTIFICAR con: (1) CONSISTENCIA: Grado de concordancia entre estudios en hallazgos principales, (2) RIGOR METODOLÓGICO: Calidad del diseño, validez interna, reporting completo, (3) LIMITACIONES IDENTIFICADAS: Sesgos, tamaños de muestra, contextos limitados, (4) FACTORES MODULADORES: Replicación de resultados, heterogeneidad metodológica, disponibilidad de datos primarios. NO afirmar niveles sin justificación. Si no hay marco formal (GRADE, etc.), usar criterios narrativos pero SIEMPRE explícitos y vinculados a evidencia específica observada en los estudios.'
          }
        ]
      },
      discussion: {
        name: 'DISCUSIÓN',
        items: [
          {
            number: 23,
            section: 'DISCUSIÓN',
            topic: 'Interpretación',
            guidance: 'Interpretar resultados en el contexto del objetivo de la revisión. Incluir: interpretación general, limitaciones de estudios incluidos, limitaciones del proceso de revisión, implicaciones para práctica e investigación futura. No introducir datos nuevos.'
          }
        ]
      },
      other: {
        name: 'OTRA INFORMACIÓN',
        items: [
          {
            number: 24,
            section: 'OTRA INFORMACIÓN',
            topic: 'Registro y protocolo',
            guidance: 'REDACCIÓN ROBUSTA REQUERIDA. NO simplemente decir "no fue registrado". USAR ESTA ESTRUCTURA: "El protocolo de esta revisión sistemática no fue registrado previamente en plataformas públicas como PROSPERO u OSF. No obstante, se desarrolló un protocolo metodológico interno que definió los objetivos de la revisión, la estrategia de búsqueda, los criterios de inclusión y exclusión, y el proceso de selección de estudios, siguiendo las directrices establecidas por PRISMA 2020." ADAPTAR mencionando elementos específicos del protocolo disponible en el contexto (PICO, criterios I/E, bases de datos). Demostrar que SÍ hubo planificación metodológica rigurosa, aunque no hubo registro público.'
          },
          {
            number: 25,
            section: 'OTRA INFORMACIÓN',
            topic: 'Financiamiento',
            guidance: 'REDACCIÓN ESTÁNDAR ACADÉMICA. Si no hubo financiamiento, usar tono que refuerza independencia: "Este estudio no recibió financiamiento externo. La revisión sistemática se realizó utilizando recursos académicos disponibles institucionalmente y herramientas de apoyo para el análisis de la literatura, sin la participación de entidades financiadoras públicas o privadas." Si hubo financiamiento, nombrar fuente, número de grant, y declarar rol del financiador en diseño/análisis. PRISMA exige transparencia, no financiamiento.'
          },
          {
            number: 26,
            section: 'OTRA INFORMACIÓN',
            topic: 'Conflictos de interés',
            guidance: 'Declarar conflictos de interés. Si no existen conflictos, declararlo explícitamente.'
          },
          {
            number: 27,
            section: 'OTRA INFORMACIÓN',
            topic: 'Disponibilidad de datos y código',
            guidance: 'Declarar disponibilidad de datos, materiales suplementarios y código usado. Indicar uso de IA en el proceso si aplica.'
          }
        ]
      }
    };

    return configs[blockName];
  }

  /**
   * Generar prompt académico para un bloque
   */
  generateAcademicPrompt(blockConfig, prismaContext) {
    const itemsList = blockConfig.items
      .map(item => `- Ítem ${item.number}: ${item.topic}\n  Guía: ${item.guidance}`)
      .join('\n\n');

    // Extraer números clave del contexto para destacarlos
    const screeningNumbers = prismaContext.screening ? `
NÚMEROS REALES DEL SISTEMA (USAR EXACTAMENTE ESTOS):
- Registros identificados: ${prismaContext.screening.identified}
- Duplicados eliminados: ${prismaContext.screening.duplicatesRemoved}
- Evaluados en título/resumen: ${prismaContext.screening.screenedTitleAbstract}
- Excluidos en cribado inicial: ${prismaContext.screening.excludedTitleAbstract}
- Evaluados en texto completo: ${prismaContext.screening.fullTextAssessed}
- Excluidos en texto completo: ${prismaContext.screening.excludedFullText}
- INCLUIDOS FINALES: ${prismaContext.screening.includedFinal}
` : '';

    return `Utilizando exclusivamente la información del PRISMA Context proporcionado, completa los ítems de la sección ${blockConfig.name}.

⚠️ RECORDATORIO CRÍTICO: PRISMA DOCUMENTA LO QUE YA OCURRIÓ, NO ANALIZA NI DECIDE.
${screeningNumbers}

CONTEXTO PRISMA (FUENTE ÚNICA DE VERDAD):
${JSON.stringify(prismaContext, null, 2)}

ÍTEMS A COMPLETAR:
${itemsList}

FORMATO DE RESPUESTA (JSON válido, sin texto adicional):
{
  "items": [
    {
      "itemNumber": 16,
      "section": "RESULTADOS",
      "content": "Se identificaron 277 registros a través de las bases de datos seleccionadas (Scopus, IEEE Xplore, Web of Science). Tras eliminar 0 duplicados, se evaluaron 277 títulos y resúmenes. Se excluyeron 48 registros en esta fase por no cumplir los criterios de inclusión relacionados con [especificar motivos principales]. Los 229 registros restantes fueron evaluados en texto completo, de los cuales 3 fueron excluidos por [motivos específicos: metodología inadecuada, datos insuficientes, etc.]. Finalmente, 226 estudios cumplieron todos los criterios de inclusión y fueron incorporados en la síntesis narrativa.",
      "dataSource": "screening.identified, screening.excludedTitleAbstract, screening.excludedFullText, screening.includedFinal"
    }
  ]
}

EJEMPLOS DE REDACCIÓN ACADÉMICA:

Para Ítem #16 (Selección):
"Se identificaron ${prismaContext.screening?.identified || 'N'} registros a través de las bases de datos seleccionadas. Tras eliminar ${prismaContext.screening?.duplicatesRemoved || '0'} duplicados, se evaluaron ${prismaContext.screening?.screenedTitleAbstract || 'N'} títulos y resúmenes. Se excluyeron ${prismaContext.screening?.excludedTitleAbstract || 'N'} registros en cribado inicial por [extraer motivos de exclusionCriteria]. Los ${prismaContext.screening?.fullTextAssessed || 'N'} restantes fueron evaluados en texto completo, excluyéndose ${prismaContext.screening?.excludedFullText || 'N'} por [motivos específicos]. Finalmente, ${prismaContext.screening?.includedFinal || 'N'} estudios fueron incluidos en la síntesis."

Para Ítem #21 (Sesgo de reporte):
"No se realizó una evaluación formal del sesgo de publicación mediante métodos estadísticos (por ejemplo, funnel plots), dado que la revisión se basó en una síntesis narrativa. No obstante, el riesgo de sesgo de reporte fue mitigado mediante: (i) la aplicación de criterios de inclusión y exclusión explícitos, (ii) la búsqueda en múltiples bases de datos académicas reconocidas [EXTRAER DE protocol.databases], y (iii) la evaluación sistemática de títulos, resúmenes y textos completos apoyada por ${prismaContext.screening?.screeningMethod || 'un sistema de cribado riguroso'}. Estas medidas reducen la probabilidad de omisión selectiva de resultados relevantes."

Para Ítem #24 (Registro y protocolo):
"El protocolo de esta revisión sistemática no fue registrado previamente en plataformas públicas como PROSPERO u OSF. No obstante, se desarrolló un protocolo metodológico interno que definió los objetivos de la revisión [EXTRAER DE protocol.objective], la estrategia de búsqueda en [EXTRAER databases], los criterios de inclusión y exclusión [MENCIONAR], y el proceso de selección de estudios, siguiendo las directrices establecidas por PRISMA 2020."

Para Ítem #25 (Financiamiento):
"Este estudio no recibió financiamiento externo. La revisión sistemática se realizó utilizando recursos académicos disponibles institucionalmente y herramientas de apoyo para el análisis de la literatura, sin la participación de entidades financiadoras públicas o privadas."

Genera ahora el contenido para los ${blockConfig.items.length} ítems de ${blockConfig.name}.`;
  }
}

module.exports = CompletePrismaByBlocksUseCase;
