/**
 * Use Case: Generar Artículo Científico desde PRISMA Cerrado
 * 
 * Transforma un PRISMA completo y validado en un artículo científico estructurado (IMRaD)
 * sin introducir datos nuevos, solo reexpresando PRISMA en formato de paper.
 * 
 * REGLA DE ORO: El artículo NO puede contener información que no exista en PRISMA.
 */

class GenerateArticleFromPrismaUseCase {
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
   * Validar que PRISMA está completo y cerrado
   */
  async validatePrismaComplete(projectId) {
    const stats = await this.prismaItemRepository.getComplianceStats(projectId);
    const completed = parseInt(stats.completed) || 0;

    if (completed < 27) {
      throw new Error(`PRISMA incompleto: ${completed}/27 ítems completados. Debe completar todos los ítems antes de generar el artículo.`);
    }

    return true;
  }

  /**
   * Mapear ítems PRISMA a secciones IMRaD
   */
  mapPrismaToIMRaD(prismaItems) {
    const itemsObj = {};
    prismaItems.forEach(item => {
      itemsObj[item.item_number] = item.content || '';
    });

    return {
      title: itemsObj[1] || '',
      abstract: itemsObj[2] || '',
      introduction: {
        rationale: itemsObj[3] || '',
        objectives: itemsObj[4] || ''
      },
      methods: {
        eligibilityCriteria: itemsObj[5] || '',
        informationSources: itemsObj[6] || '',
        searchStrategy: itemsObj[7] || '',
        selectionProcess: itemsObj[8] || '',
        dataCollection: itemsObj[9] || '',
        dataItems: itemsObj[10] || '',
        riskOfBias: itemsObj[11] || '',
        effectMeasures: itemsObj[12] || '',
        synthesisMethod: itemsObj[13] || '',
        reportingBias: itemsObj[14] || '',
        certainty: itemsObj[15] || ''
      },
      results: {
        studySelection: itemsObj[16] || '',
        studyCharacteristics: itemsObj[17] || '',
        riskOfBiasResults: itemsObj[18] || '',
        individualResults: itemsObj[19] || '',
        synthesisResults: itemsObj[20] || '',
        reportingBiasResults: itemsObj[21] || '',
        certaintyResults: itemsObj[22] || ''
      },
      discussion: {
        interpretation: itemsObj[23] || ''
      },
      other: {
        registration: itemsObj[24] || '',
        funding: itemsObj[25] || '',
        conflicts: itemsObj[26] || '',
        availability: itemsObj[27] || ''
      }
    };
  }

  /**
   * Generar artículo completo
   */
  async execute(projectId) {
    try {
      console.log(`📄 Generando artículo científico para proyecto ${projectId}`);

      // 1. Validar que PRISMA está completo
      await this.validatePrismaComplete(projectId);

      // 2. Obtener todos los ítems PRISMA
      const prismaItems = await this.prismaItemRepository.findAllByProject(projectId);
      
      // 3. Obtener PRISMA Context
      const contextResult = await this.generatePrismaContextUseCase.execute(projectId);
      const prismaContext = contextResult.context;

      // 4. Mapear PRISMA a estructura IMRaD
      const prismaMapping = this.mapPrismaToIMRaD(prismaItems);

      // 5. Generar cada sección del artículo
      const article = {
        title: prismaMapping.title,
        abstract: await this.generateAbstract(prismaMapping, prismaContext),
        introduction: await this.generateIntroduction(prismaMapping, prismaContext),
        methods: await this.generateMethods(prismaMapping, prismaContext),
        results: await this.generateResults(prismaMapping, prismaContext),
        discussion: await this.generateDiscussion(prismaMapping, prismaContext),
        conclusions: await this.generateConclusions(prismaMapping, prismaContext),
        references: await this.generateReferences(prismaContext),
        metadata: {
          generatedAt: new Date().toISOString(),
          wordCount: 0, // Se calculará después
          version: 1,
          prismaCompliant: true
        }
      };

      // 6. Calcular word count
      article.metadata.wordCount = this.calculateWordCount(article);

      console.log('✅ Artículo generado exitosamente');
      console.log(`📊 Palabras totales: ${article.metadata.wordCount}`);

      return {
        success: true,
        article
      };

    } catch (error) {
      console.error('❌ Error generando artículo:', error);
      throw error;
    }
  }

  /**
   * Generar resumen estructurado
   */
  async generateAbstract(prismaMapping, prismaContext) {
    // El resumen ya está en PRISMA ítem 2
    return prismaMapping.abstract;
  }

  /**
   * Generar introducción
   */
  async generateIntroduction(prismaMapping, prismaContext) {
    const prompt = `Basándote en los siguientes ítems PRISMA, genera una introducción académica coherente que integre la justificación y objetivos en un formato de artículo científico.

NO INVENTES DATOS. Solo reorganiza el contenido existente en formato de introducción académica.

PRISMA ÍTEM 3 - JUSTIFICACIÓN:
${prismaMapping.introduction.rationale}

PRISMA ÍTEM 4 - OBJETIVOS:
${prismaMapping.introduction.objectives}

CONTEXTO ADICIONAL:
${JSON.stringify(prismaContext.protocol.pico, null, 2)}

Genera una introducción en ESPAÑOL que:
1. Presente el contexto del problema
2. Justifique la necesidad de la revisión
3. Establezca los objetivos claramente
4. Mantenga lenguaje académico formal
5. No exceda 800 palabras

Responde SOLO con el texto de la introducción, sin encabezados adicionales.`;

    const response = await this.aiService.chatCompletion([
      {
        role: 'system',
        content: this.getSystemPrompt()
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.4,
      max_tokens: 1200
    });

    return response.content.trim();
  }

  /**
   * Generar métodos
   */
  async generateMethods(prismaMapping, prismaContext) {
    return `## 2.1 Diseño de la revisión

Esta revisión sistemática se realizó siguiendo las directrices PRISMA 2020 (Preferred Reporting Items for Systematic Reviews and Meta-Analyses).

## 2.2 Criterios de elegibilidad

${prismaMapping.methods.eligibilityCriteria}

## 2.3 Fuentes de información

${prismaMapping.methods.informationSources}

## 2.4 Estrategia de búsqueda

${prismaMapping.methods.searchStrategy}

## 2.5 Proceso de selección

${prismaMapping.methods.selectionProcess}

## 2.6 Extracción de datos

${prismaMapping.methods.dataCollection}

${prismaMapping.methods.dataItems}

## 2.7 Evaluación de riesgo de sesgo

${prismaMapping.methods.riskOfBias}

## 2.8 Síntesis de datos

${prismaMapping.methods.synthesisMethod}`;
  }

  /**
   * Generar resultados
   */
  async generateResults(prismaMapping, prismaContext) {
    return `## 3.1 Selección de estudios

${prismaMapping.results.studySelection}

## 3.2 Características de los estudios incluidos

${prismaMapping.results.studyCharacteristics}

## 3.3 Riesgo de sesgo

${prismaMapping.results.riskOfBiasResults}

## 3.4 Resultados individuales

${prismaMapping.results.individualResults}

## 3.5 Síntesis de resultados

${prismaMapping.results.synthesisResults}`;
  }

  /**
   * Generar discusión
   */
  async generateDiscussion(prismaMapping, prismaContext) {
    return prismaMapping.discussion.interpretation;
  }

  /**
   * Generar conclusiones
   */
  async generateConclusions(prismaMapping, prismaContext) {
    const prompt = `Basándote en la discusión PRISMA proporcionada, genera una sección de CONCLUSIONES concisa que:

1. Resuma los hallazgos principales
2. Responda a los objetivos planteados
3. Indique implicaciones para la práctica
4. Sugiera direcciones futuras
5. Máximo 400 palabras

NO INVENTES DATOS NUEVOS. Solo sintetiza lo ya discutido.

DISCUSIÓN PRISMA:
${prismaMapping.discussion.interpretation}

OBJETIVOS:
${prismaContext.protocol.objective}

Responde en ESPAÑOL, solo con el texto de conclusiones.`;

    const response = await this.aiService.chatCompletion([
      {
        role: 'system',
        content: this.getSystemPrompt()
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.4,
      max_tokens: 600
    });

    return response.content.trim();
  }

  /**
   * Generar lista de referencias
   */
  async generateReferences(prismaContext) {
    return `Las referencias bibliográficas incluyen los ${prismaContext.screening.includedFinal} estudios incluidos en esta revisión sistemática.

${prismaContext.other.availability}`;
  }

  /**
   * System prompt para generación de artículo
   */
  getSystemPrompt() {
    return `Eres un autor académico experto en revisiones sistemáticas, siguiendo estándares PRISMA 2020 e IMRaD.

Tu tarea es redactar un artículo científico a partir de un PRISMA cerrado, sin introducir datos nuevos.

REGLAS ESTRICTAS:
1. No inventes resultados, métricas ni análisis
2. No modifiques decisiones metodológicas ya cerradas
3. Usa redacción académica, impersonal y formal en ESPAÑOL
4. Cada sección debe corresponder directamente a ítems PRISMA
5. Declara limitaciones cuando corresponda
6. No cites estudios no incluidos en la síntesis
7. Mantén coherencia total entre todas las secciones`;
  }

  /**
   * Calcular word count del artículo
   */
  calculateWordCount(article) {
    const allText = [
      article.title,
      article.abstract,
      article.introduction,
      article.methods,
      article.results,
      article.discussion,
      article.conclusions
    ].join(' ');

    return allText.split(/\s+/).filter(w => w.length > 0).length;
  }
}

module.exports = GenerateArticleFromPrismaUseCase;
