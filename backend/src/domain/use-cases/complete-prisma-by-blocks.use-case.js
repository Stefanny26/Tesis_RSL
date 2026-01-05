/**
 * Use Case: Completar Ítems PRISMA por Bloques
 * 
 * Genera automáticamente los ítems PRISMA pendientes usando prompt académico estructurado
 * conforme a PRISMA 2020, sin inferir datos, solo describiendo lo existente.
 * 
 * BLOQUES:
 * 1. MÉTODOS (Ítems 11-12)
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
        ? ['methods', 'results', 'discussion', 'other']
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
    
    // Llamar a IA
    console.log(`🤖 Consultando IA para bloque: ${blockName}`);
    const aiResponse = await this.aiService.chatCompletion([
      {
        role: 'system',
        content: this.getSystemPrompt()
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.3, // Bajo para consistencia académica
      max_tokens: 2000
    });

    // Parsear respuesta
    let itemsData;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        itemsData = JSON.parse(jsonMatch[0]);
      } else {
        itemsData = JSON.parse(aiResponse.content);
      }
    } catch (error) {
      console.error('Error parseando respuesta de IA:', error);
      throw new Error('La IA no devolvió JSON válido');
    }

    // Guardar ítems en BD
    const savedItems = [];
    for (const itemData of itemsData.items || []) {
      const saved = await this.prismaItemRepository.updateItemContent(
        projectId,
        itemData.itemNumber,
        {
          content: itemData.content,
          completed: true,
          content_type: 'automated',
          data_source: itemData.dataSource || 'prisma_context',
          automated_content: itemData.content
        }
      );
      savedItems.push(saved);
    }

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
    return `Actúas como un experto metodológico en revisiones sistemáticas conforme a PRISMA 2020, con experiencia en ingeniería, ciencias de la computación y tecnología.

Tu tarea es redactar secciones PRISMA únicamente a partir de los datos proporcionados, sin introducir información nueva, sin inferencias no respaldadas y sin suposiciones.

REGLAS OBLIGATORIAS:
1. No inventes datos, métricas, números ni procedimientos
2. No asumas prácticas no explícitamente descritas
3. Si un elemento no está disponible, indícalo de forma explícita y académica
4. Usa redacción formal, impersonal y académica en ESPAÑOL
5. Respeta estrictamente la estructura PRISMA 2020
6. No repitas información ya reportada en otros ítems
7. No realices interpretación crítica fuera de la sección DISCUSIÓN
8. Usa pasado metodológico: "se identificaron", "se evaluaron", "se incluyeron"`;
  }

  /**
   * Configuración de bloques PRISMA
   */
  getBlockConfig(blockName) {
    const configs = {
      methods: {
        name: 'MÉTODOS',
        items: [
          {
            number: 11,
            section: 'MÉTODOS',
            topic: 'Evaluación del riesgo de sesgo',
            guidance: 'Especificar el método utilizado para evaluar el riesgo de sesgo de los estudios incluidos. Si se usó IA asistida, declararlo explícitamente. Si no se realizó evaluación cuantitativa, declarar evaluación cualitativa.'
          },
          {
            number: 12,
            section: 'MÉTODOS',
            topic: 'Medidas de efecto',
            guidance: 'Describir las métricas o variables observadas en los estudios. En ingeniería de software, pueden ser métricas de rendimiento, escalabilidad, o usabilidad. Si no hay meta-análisis, declarar síntesis narrativa.'
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
            guidance: 'Describir los resultados del proceso de búsqueda y selección, desde el número de registros identificados hasta los estudios incluidos en la revisión. Usar los números exactos del diagrama PRISMA.'
          },
          {
            number: 17,
            section: 'RESULTADOS',
            topic: 'Características de los estudios',
            guidance: 'Presentar características de los estudios incluidos: tecnologías evaluadas, contextos de aplicación, tipos de estudio. Basarse en datos extraídos de PDFs si existen.'
          },
          {
            number: 18,
            section: 'RESULTADOS',
            topic: 'Riesgo de sesgo en los estudios',
            guidance: 'Presentar evaluación del riesgo de sesgo por estudio. Si no hay scoring cuantitativo, declarar evaluación cualitativa sin riesgos críticos evidentes.'
          },
          {
            number: 19,
            section: 'RESULTADOS',
            topic: 'Resultados de estudios individuales',
            guidance: 'Presentar resultados reportados por cada estudio incluido. No comparar entre estudios, solo reportar lo que cada uno encontró.'
          },
          {
            number: 20,
            section: 'RESULTADOS',
            topic: 'Resultados de las síntesis',
            guidance: 'Presentar síntesis narrativa de hallazgos. Identificar tendencias, consistencias o patrones observados. No realizar inferencias causales si no hay análisis estadístico.'
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
            guidance: 'Declarar si el protocolo fue registrado previamente. Si no fue registrado, declararlo explícitamente.'
          },
          {
            number: 25,
            section: 'OTRA INFORMACIÓN',
            topic: 'Financiamiento',
            guidance: 'Declarar fuentes de financiamiento. Si no hubo financiamiento externo, declararlo explícitamente.'
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

    return `Utilizando exclusivamente la información del PRISMA Context proporcionado, completa los ítems de la sección ${blockConfig.name}.

CONTEXTO PRISMA (FUENTE ÚNICA DE VERDAD):
${JSON.stringify(prismaContext, null, 2)}

ÍTEMS A COMPLETAR:
${itemsList}

FORMATO DE RESPUESTA (JSON válido, sin texto adicional):
{
  "items": [
    {
      "itemNumber": 11,
      "section": "MÉTODOS",
      "content": "Texto académico formal en español aquí...",
      "dataSource": "screening.screeningMethod, screening.aiAssisted"
    }
  ]
}

EJEMPLO DE REDACCIÓN ACADÉMICA CORRECTA:
"Se identificaron un total de 20 registros a través de las bases de datos seleccionadas (Scopus, IEEE Xplore). Tras el cribado por título y resumen, se excluyó 1 referencia por no cumplir los criterios de inclusión. Posteriormente, 19 estudios fueron evaluados en texto completo, sin exclusiones adicionales. Finalmente, 19 estudios cumplieron los criterios de inclusión y fueron incorporados en la síntesis final."

EJEMPLO DE DECLARACIÓN CUANDO FALTA INFORMACIÓN:
"No se realizó registro prospectivo del protocolo de revisión en una base de datos pública. El protocolo fue desarrollado internamente siguiendo las directrices PRISMA 2020."

Genera ahora el contenido para los ${blockConfig.items.length} ítems de ${blockConfig.name}.`;
  }
}

module.exports = CompletePrismaByBlocksUseCase;
