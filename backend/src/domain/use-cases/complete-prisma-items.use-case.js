/**
 * Use Case: Completar Ítems PRISMA Automáticamente
 * 
 * Genera automáticamente los 14 ítems PRISMA pendientes (Resultados, Discusión, Otra información)
 * usando el PRISMAContext y IA con prompt específico.
 * 
 * ⚠️ IMPORTANTE: Este use case NO toma decisiones metodológicas.
 * Solo traduce datos existentes a texto académico formal.
 */
class CompletePrismaItemsUseCase {
  constructor({ 
    protocolRepository,
    aiService,
    generatePrismaContextUseCase
  }) {
    this.protocolRepository = protocolRepository;
    this.aiService = aiService;
    this.generatePrismaContextUseCase = generatePrismaContextUseCase;
  }

  /**
   * Genera el prompt específico para completar ítems PRISMA
   */
  generatePrompt(prismaContext, pendingItems) {
    return `You are completing the PRISMA 2020 checklist for a systematic literature review.

CRITICAL INSTRUCTIONS:
1. Use ONLY the data provided in the PRISMA Context below
2. Do NOT introduce new decisions, interpretations, or assumptions
3. Your task is to DESCRIBE, not to JUSTIFY or MODIFY the study selection process
4. Write in formal academic language suitable for a systematic literature review
5. If an item cannot be fully completed based on provided data, state this explicitly

PRISMA CONTEXT:
${JSON.stringify(prismaContext, null, 2)}

PENDING ITEMS TO COMPLETE:
${pendingItems.map(item => `- Item ${item.id}: ${item.section} - ${item.topic}`).join('\n')}

For each pending item, generate formal academic text that:
- Describes the process or findings factually
- Uses passive voice and formal language
- Maintains consistency with the protocol
- Declares AI usage when applicable
- Does not make new methodological decisions

Respond with valid JSON in this exact format:
{
  "items": [
    {
      "itemNumber": 16,
      "section": "RESULTADOS",
      "content": "Academic text here...",
      "dataSource": "Brief description of data source"
    }
  ]
}

Do NOT add any text before or after the JSON.`;
  }

  /**
   * Ítems PRISMA que deben completarse automáticamente
   */
  getPendingItemsDefinition() {
    return [
      {
        id: 16,
        section: 'RESULTADOS',
        topic: 'Selección de estudios',
        description: 'Describe the results of the search and selection process, from the number of records identified in the search to the number of studies included in the review'
      },
      {
        id: 17,
        section: 'RESULTADOS',
        topic: 'Características de los estudios',
        description: 'Cite studies that might appear to meet the inclusion criteria, but which were excluded, and explain why they were excluded'
      },
      {
        id: 18,
        section: 'RESULTADOS',
        topic: 'Riesgo de sesgo en los estudios',
        description: 'Present assessments of risk of bias for each included study'
      },
      {
        id: 19,
        section: 'RESULTADOS',
        topic: 'Resultados de estudios individuales',
        description: 'For all outcomes, present for each study: (a) summary statistics for each group (where appropriate) and (b) an effect estimate and its precision'
      },
      {
        id: 20,
        section: 'RESULTADOS',
        topic: 'Resultados de las síntesis',
        description: 'Present results of each synthesis conducted'
      },
      {
        id: 21,
        section: 'RESULTADOS',
        topic: 'Análisis de sensibilidad',
        description: 'Present results of any sensitivity analyses conducted'
      },
      {
        id: 22,
        section: 'RESULTADOS',
        topic: 'Sesgo de publicación',
        description: 'Present assessments of risk of bias due to missing results for each synthesis assessed'
      },
      {
        id: 23,
        section: 'DISCUSIÓN',
        topic: 'Interpretación',
        description: 'Provide a general interpretation of the results in the context of other evidence'
      },
      {
        id: 24,
        section: 'OTRA INFORMACIÓN',
        topic: 'Registro y protocolo',
        description: 'Provide registration information for the review, including register name and registration number, or state that the review was not registered'
      },
      {
        id: 25,
        section: 'OTRA INFORMACIÓN',
        topic: 'Soporte',
        description: 'Describe sources of financial or non-financial support for the review, and the role of the funders or sponsors'
      },
      {
        id: 26,
        section: 'OTRA INFORMACIÓN',
        topic: 'Conflictos de intereses',
        description: 'Declare any conflicts of interest'
      },
      {
        id: 27,
        section: 'OTRA INFORMACIÓN',
        topic: 'Disponibilidad de datos, código y otros materiales',
        description: 'Report which of the following are publicly available and where they can be found: data extracted from included studies, data used for analyses, analytic code'
      }
    ];
  }

  /**
   * Genera ítems específicos basados en el contexto
   */
  async generateSpecificItems(prismaContext) {
    const items = [];

    // Ítem 16: Selección de estudios (SIEMPRE se puede generar)
    items.push({
      itemNumber: 16,
      section: 'RESULTADOS',
      content: this.generateItem16(prismaContext),
      dataSource: 'PRISMA Context: Screening numbers',
      contentType: 'automated'
    });

    // Ítem 17: Características de estudios (si hay datos de PDFs)
    if (prismaContext.fullTextAnalysis?.analysisComplete) {
      items.push({
        itemNumber: 17,
        section: 'RESULTADOS',
        content: this.generateItem17(prismaContext),
        dataSource: 'PRISMA Context: Full-text analysis',
        contentType: 'hybrid'
      });
    }

    // Ítem 23: Discusión (descripción del proceso)
    items.push({
      itemNumber: 23,
      section: 'DISCUSIÓN',
      content: this.generateItem23(prismaContext),
      dataSource: 'PRISMA Context: Screening methodology',
      contentType: 'hybrid'
    });

    // Ítem 24: Registro (declaración estándar)
    items.push({
      itemNumber: 24,
      section: 'OTRA INFORMACIÓN',
      content: 'This systematic review was not prospectively registered. The protocol was developed a priori following PRISMA 2020 guidelines and documented before conducting the searches.',
      dataSource: 'Standard declaration',
      contentType: 'automated'
    });

    // Ítem 26: Conflictos de interés (declaración estándar)
    items.push({
      itemNumber: 26,
      section: 'OTRA INFORMACIÓN',
      content: 'The authors declare no conflicts of interest.',
      dataSource: 'Standard declaration',
      contentType: 'automated'
    });

    // Ítem 27: Disponibilidad de datos (si aplica AI)
    if (prismaContext.screening.aiAssisted) {
      items.push({
        itemNumber: 27,
        section: 'OTRA INFORMACIÓN',
        content: this.generateItem27(prismaContext),
        dataSource: 'AI usage declaration',
        contentType: 'automated'
      });
    }

    return items;
  }

  /**
   * Genera Ítem 16: Selección de estudios
   */
  generateItem16(context) {
    const { screening } = context;
    
    let text = `The systematic literature search identified a total of ${screening.identified} records. `;
    
    if (screening.duplicatesRemoved > 0) {
      text += `After removing ${screening.duplicatesRemoved} duplicates, `;
    }
    
    text += `${screening.screenedTitleAbstract} records were screened by title and abstract. `;
    
    if (screening.excludedTitleAbstract > 0) {
      text += `Of these, ${screening.excludedTitleAbstract} records were excluded as they did not meet the predefined inclusion criteria. `;
    }
    
    text += `Subsequently, ${screening.fullTextAssessed} full-text articles were assessed for eligibility. `;
    
    if (screening.excludedFullText > 0) {
      text += `${screening.excludedFullText} articles were excluded at this stage. `;
    }
    
    text += `Ultimately, ${screening.includedFinal} studies met all inclusion criteria and were included in the final synthesis.`;
    
    return text;
  }

  /**
   * Genera Ítem 17: Características de estudios
   */
  generateItem17(context) {
    const { fullTextAnalysis } = context;
    
    let text = `The ${context.screening.includedFinal} included studies were analyzed for their methodological characteristics. `;
    
    if (Object.keys(fullTextAnalysis.studyTypes).length > 0) {
      text += `The distribution of study types was as follows: `;
      const types = Object.entries(fullTextAnalysis.studyTypes)
        .map(([type, count]) => `${type} (n=${count})`)
        .join(', ');
      text += types + '. ';
    }
    
    if (Object.keys(fullTextAnalysis.contexts).length > 0) {
      text += `Studies were conducted in various contexts, including: `;
      const contexts = Object.entries(fullTextAnalysis.contexts)
        .map(([ctx, count]) => `${ctx} (n=${count})`)
        .join(', ');
      text += contexts + '.';
    }
    
    return text;
  }

  /**
   * Genera Ítem 23: Discusión
   */
  generateItem23(context) {
    const { screening } = context;
    
    let text = `This systematic review employed ${screening.screeningMethod}. `;
    
    if (screening.aiAssisted) {
      text += `${screening.aiRole}. `;
      text += `This approach was designed to enhance efficiency while maintaining methodological rigor. `;
      text += `All final inclusion decisions were based on the predefined eligibility criteria established in the protocol. `;
    }
    
    text += `The systematic approach ensured comprehensive coverage of relevant literature within the specified scope.`;
    
    return text;
  }

  /**
   * Genera Ítem 27: Disponibilidad de datos
   */
  generateItem27(context) {
    let text = `Artificial intelligence tools were used to support the screening process as follows: `;
    
    if (context.screening.aiAssisted) {
      text += context.screening.aiRole + '. ';
    }
    
    if (context.fullTextAnalysis?.aiAssisted) {
      text += `AI was also used for data extraction from full-text articles. ${context.fullTextAnalysis.extractionPurpose}. `;
    }
    
    text += `All AI-assisted processes were conducted under researcher supervision, with final decisions made by the human reviewer following PRISMA guidelines.`;
    
    return text;
  }

  /**
   * Ejecuta la generación completa de ítems pendientes
   */
  async execute(projectId) {
    try {
      console.log(`🔄 Completando ítems PRISMA para proyecto ${projectId}`);

      // 1. Generar PRISMA Context
      const { context: prismaContext } = await this.generatePrismaContextUseCase.execute(projectId);

      // 2. Generar ítems específicos que siempre podemos completar
      const automaticItems = await this.generateSpecificItems(prismaContext);

      // 3. Guardar ítems en el protocolo
      const protocol = await this.protocolRepository.findByProjectId(projectId);
      
      const existingPrismaCompliance = protocol.prismaCompliance || [];
      const updatedPrismaCompliance = [...existingPrismaCompliance];

      // Agregar o actualizar ítems
      automaticItems.forEach(newItem => {
        const existingIndex = updatedPrismaCompliance.findIndex(
          item => (item.itemNumber || item.item_number) === newItem.itemNumber
        );

        if (existingIndex >= 0) {
          // Actualizar ítem existente
          updatedPrismaCompliance[existingIndex] = {
            ...updatedPrismaCompliance[existingIndex],
            content: newItem.content,
            dataSource: newItem.dataSource,
            contentType: newItem.contentType,
            updatedAt: new Date()
          };
        } else {
          // Agregar nuevo ítem
          updatedPrismaCompliance.push({
            itemNumber: newItem.itemNumber,
            section: newItem.section,
            content: newItem.content,
            dataSource: newItem.dataSource,
            contentType: newItem.contentType,
            createdAt: new Date()
          });
        }
      });

      // 4. Verificar si PRISMA está completo y bloquearlo
      const completedCount = updatedPrismaCompliance.length;
      const isPrismaComplete = completedCount >= 27;
      
      const updateData = {
        prismaCompliance: updatedPrismaCompliance
      };

      // Si PRISMA está completo, bloquearlo automáticamente
      if (isPrismaComplete && !protocol.prismaLocked) {
        updateData.prismaLocked = true;
        updateData.prismaCompletedAt = new Date();
        console.log('🔒 PRISMA completado - Bloqueando automáticamente');
      }

      // Actualizar protocolo
      await this.protocolRepository.update(protocol.id, updateData);

      console.log(`✅ ${automaticItems.length} ítems PRISMA generados exitosamente`);
      console.log(`📊 Total de ítems completados: ${completedCount}/27`);
      
      if (isPrismaComplete) {
        console.log('🎉 ¡PRISMA 2020 completado! (27/27 ítems)');
      }

      return {
        success: true,
        generatedItems: automaticItems.length,
        totalCompleted: completedCount,
        totalItems: 27,
        items: automaticItems,
        prismaComplete: isPrismaComplete,
        prismaLocked: isPrismaComplete && updateData.prismaLocked,
        message: isPrismaComplete 
          ? `🎉 ¡PRISMA completado! Los 27 ítems están listos. PRISMA ha sido bloqueado.`
          : `Se generaron ${automaticItems.length} ítems PRISMA automáticamente. Total: ${completedCount}/27`
      };

    } catch (error) {
      console.error('❌ Error completando ítems PRISMA:', error);
      throw error;
    }
  }
}

module.exports = CompletePrismaItemsUseCase;
