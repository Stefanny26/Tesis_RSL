/**
 * Use Case: Generar PRISMA Context Object
 * 
 * Construye el objeto de contexto completo que PRISMA necesita para:
 * 1. Completar ítems pendientes automáticamente
 * 2. Generar el artículo final
 * 
 * ⚠️ IMPORTANTE: Este objeto congela datos ya decididos, no toma decisiones nuevas.
 */
class GeneratePrismaContextUseCase {
  constructor({
    protocolRepository,
    referenceRepository,
    projectRepository
  }) {
    this.protocolRepository = protocolRepository;
    this.referenceRepository = referenceRepository;
    this.projectRepository = projectRepository;
  }

  /**
   * Construye el PRISMAContext completo
   */
  async execute(projectId) {
    try {
      console.log(`📊 Generando PRISMA Context para proyecto ${projectId}`);

      // 1. Obtener datos del proyecto
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new Error('Proyecto no encontrado');
      }

      // 2. Obtener datos del protocolo
      const protocol = await this.protocolRepository.findByProjectId(projectId);
      if (!protocol) {
        throw new Error('Protocolo no encontrado. Debe completar el protocolo antes de generar PRISMA.');
      }

      // 3. Obtener todas las referencias del proyecto
      const allReferences = await this.referenceRepository.findByProject(projectId);

      // 4. Analizar screening results del protocolo
      const screeningResults = protocol.screeningResults || {};

      // 5. Contar referencias por estado
      const identified = allReferences.length;
      const duplicates = 0; // Tu sistema ya maneja duplicados antes

      // Referencias excluidas en cribado inicial (título/resumen)
      const excludedTitleAbstract = allReferences.filter(ref =>
        ref.screeningStatus === 'excluded'
      ).length;

      // Referencias incluidas después del cribado inicial
      const includedAfterScreening = allReferences.filter(ref =>
        ref.screeningStatus === 'included' ||
        ref.screeningStatus === 'fulltext_included'
      ).length;

      // Referencias excluidas en texto completo (si aplica)
      const excludedFullText = allReferences.filter(ref =>
        ref.screeningStatus === 'fulltext_excluded'
      ).length;

      // Referencias finales incluidas
      const finalIncluded = allReferences.filter(ref =>
        ref.screeningStatus === 'included' ||
        ref.screeningStatus === 'fulltext_included'
      ).length;

      // 6. Obtener información del método de cribado
      const screeningMethod = this.determineScreeningMethod(screeningResults);

      // 7. Analizar datos extraídos de PDFs (si existen)
      const fullTextAnalysis = await this.analyzeFullTextData(allReferences);

      // 8. Construir PRISMA Context Object
      const prismaContext = {
        project: {
          id: project.id,
          name: project.name || project.title,
          createdAt: project.createdAt,
          status: project.status
        },

        protocol: {
          title: protocol.proposedTitle || protocol.selectedTitle || 'Sin título',
          objective: protocol.justification || protocol.refinedQuestion || '',

          pico: {
            population: protocol.population || '',
            intervention: protocol.intervention || '',
            comparison: protocol.comparison || '',
            outcomes: protocol.outcomes || ''
          },

          researchQuestions: protocol.researchQuestions || [],

          inclusionCriteria: protocol.inclusionCriteria || [],
          exclusionCriteria: protocol.exclusionCriteria || [],

          databases: this.formatDatabases(protocol.databases || [], allReferences),

          temporalRange: {
            start: protocol.temporalRange?.start || protocol.dateRangeStart || null,
            end: protocol.temporalRange?.end || protocol.dateRangeEnd || null
          },

          searchQueries: protocol.searchQueries || [],

          keyTerms: protocol.keyTerms || {}
        },

        screening: {
          // Números PRISMA
          identified: identified,
          duplicatesRemoved: duplicates,
          screenedTitleAbstract: identified,
          excludedTitleAbstract: excludedTitleAbstract,
          fullTextAssessed: includedAfterScreening,
          excludedFullText: excludedFullText,
          includedFinal: finalIncluded,

          // ✅ CORRECCIÓN: Agregar campos que faltan para evitar N/A
          totalResults: allReferences.length,
          afterScreening: allReferences.length,
          fullTextRetrieved: allReferences.filter(r => r.screeningStatus === 'included' || r.screeningStatus === 'fulltext_included').length,

          // Datos del cribado híbrido si existen
          phase1: screeningResults.phase1 || null,
          phase2: screeningResults.phase2 || null,
          hybridMethod: screeningResults.method === 'hybrid',

          // Metodología
          screeningMethod: screeningMethod.description,
          screeningPhases: screeningMethod.phases,

          // Detalles técnicos (si aplican)
          similarityThresholds: screeningResults.thresholds || null,
          cutoffMethod: screeningResults.cutoffMethod || null,

          // IA usage
          aiAssisted: screeningMethod.aiAssisted,
          aiRole: screeningMethod.aiRole,

          // Revisión manual
          manualReview: screeningMethod.manualReview,
          dualReview: false // Actualizar si implementas dual review
        },

        fullTextAnalysis: fullTextAnalysis,

        // Metadata de generación
        generatedAt: new Date().toISOString(),
        completedScreening: protocol.fase2_unlocked || false,
        prismaVersion: '2020'
      };

      console.log('✅ PRISMA Context generado exitosamente');
      console.log(`📊 Referencias: ${identified} identificadas → ${finalIncluded} incluidas`);

      return {
        success: true,
        context: prismaContext,
        summary: {
          totalReferences: identified,
          excluded: excludedTitleAbstract + excludedFullText,
          included: finalIncluded,
          screeningComplete: protocol.fase2_unlocked || false
        }
      };

    } catch (error) {
      console.error('❌ Error generando PRISMA Context:', error);
      throw error;
    }
  }

  /**
   * Determina el método de cribado usado
   */
  determineScreeningMethod(screeningResults) {
    // Analizar si se usó IA
    const usedEmbeddings = screeningResults.method?.includes('embedding') ||
      screeningResults.method?.includes('Embedding');

    const usedChatGPT = screeningResults.method?.includes('ChatGPT') ||
      screeningResults.method?.includes('GPT');

    let description = 'Cribado manual';
    let phases = ['Manual review of titles and abstracts'];
    let aiAssisted = false;
    let aiRole = null;
    let manualReview = true;

    if (usedEmbeddings && usedChatGPT) {
      description = 'Hybrid screening (Embeddings + ChatGPT + manual validation)';
      phases = [
        'Phase 1: Semantic similarity analysis using embeddings',
        'Phase 2: Contextual AI analysis using ChatGPT for gray zone references',
        'Phase 3: Manual validation by researcher'
      ];
      aiAssisted = true;
      aiRole = 'AI-assisted prioritization and analysis; final decisions made by researcher';
      manualReview = true;
    } else if (usedEmbeddings) {
      description = 'Embeddings-based semantic screening with manual validation';
      phases = [
        'Phase 1: Semantic similarity analysis using embeddings',
        'Phase 2: Manual validation by researcher'
      ];
      aiAssisted = true;
      aiRole = 'AI-assisted similarity analysis; final decisions made by researcher';
      manualReview = true;
    } else if (screeningResults.method) {
      description = screeningResults.method;
    }

    return {
      description,
      phases,
      aiAssisted,
      aiRole,
      manualReview
    };
  }

  /**
   * Formatea bases de datos para PRISMA Context
   */
  formatDatabases(databases, allReferences = []) {
    // Calcular hits por source
    const hitsBySource = allReferences.reduce((acc, ref) => {
      // Normalizar source para coincidir con nombres de DB
      const source = (ref.source || 'Unknown').trim();
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    return databases.map(db => {
      let name = 'Unknown';
      let searchString = null;

      if (typeof db === 'string') {
        name = db;
      } else {
        name = db.name || db.database || 'Unknown';
        searchString = db.searchString || db.query || null;
      }

      // Intentar coincidir source con nombre de DB (case insensitive partial match)
      // O simplemente usar el nombre exacto si coincide
      let hits = hitsBySource[name] || 0;

      // Si no hay match exacto, buscar keys que contengan el nombre o viceversa
      if (hits === 0) {
        const matchingKey = Object.keys(hitsBySource).find(key =>
          key.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(key.toLowerCase())
        );
        if (matchingKey) {
          hits = hitsBySource[matchingKey];
        }
      }

      return {
        name,
        searchString,
        hits
      };
    });
  }

  /**
   * Analiza datos extraídos de PDFs
   */
  async analyzeFullTextData(references) {
    const referencesWithData = references.filter(ref =>
      ref.fullTextExtracted && ref.fullTextData
    );

    if (referencesWithData.length === 0) {
      return {
        pdfsAnalyzed: 0,
        analysisComplete: false,
        studyTypes: {},
        contexts: {}
      };
    }

    const studyTypes = {};
    const contexts = {};

    referencesWithData.forEach(ref => {
      try {
        const data = typeof ref.fullTextData === 'string'
          ? JSON.parse(ref.fullTextData)
          : ref.fullTextData;

        if (data.study_type) {
          studyTypes[data.study_type] = (studyTypes[data.study_type] || 0) + 1;
        }

        if (data.context) {
          contexts[data.context] = (contexts[data.context] || 0) + 1;
        }
      } catch (e) {
        console.error('Error parsing fullTextData:', e);
      }
    });

    return {
      pdfsAnalyzed: referencesWithData.length,
      analysisComplete: true,
      aiAssisted: true,
      extractionPurpose: 'Data extraction and reporting only (not for inclusion/exclusion)',
      studyTypes,
      contexts
    };
  }
}

module.exports = GeneratePrismaContextUseCase;
