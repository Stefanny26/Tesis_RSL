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

      // 5. Calcular estadísticas PRISMA — SINGLE SOURCE OF TRUTH
      // Este es el ÚNICO lugar donde se calculan las estadísticas PRISMA
      // Todos los demás componentes deben consumir estos valores
      //
      // LÓGICA CORRECTA (debe coincidir con el frontend screening/page.tsx):
      //   - selectedForFullText (del protocolo) = referencias seleccionadas para revisión manual
      //   - manualReviewStatus = decisión de revisión manual (included/excluded)
      //   - Las NO seleccionadas = excluidas en fase título/abstract
      //   - Las seleccionadas con manualReviewStatus = 'excluded' → excluidas en full-text
      //   - Las seleccionadas con manualReviewStatus = 'included' → incluidas finales
      
      // Referencias totales en la BD
      const totalRefsInDB = allReferences.length;
      
      // Duplicados: la columna is_duplicate no existe en la BD, siempre es 0
      const duplicates = 0;
      
      // Identificados = total de referencias
      const identified = totalRefsInDB;
      
      // Después de eliminar duplicados
      const afterDedup = identified - duplicates;
      
      // === USAR selectedForFullText del protocolo (misma lógica que el frontend) ===
      const selectedForFullTextIds = protocol.selectedForFullText || [];
      const selectedForFullTextSet = new Set(selectedForFullTextIds);
      
      // Referencias seleccionadas para revisión de texto completo
      const selectedRefs = allReferences.filter(ref => selectedForFullTextSet.has(ref.id));
      
      // Full-text assessed = cuántos se seleccionaron para revisión manual
      const fullTextAssessed = selectedRefs.length;
      
      // Excluidos en fase título/abstract = total tras dedup - seleccionados para full-text
      const screenedOut = afterDedup - fullTextAssessed;
      
      // Usar manualReviewStatus para las decisiones de revisión manual
      const getManualStatus = (ref) => ref.manualReviewStatus || ref.manual_review_status || null;
      
      // Incluidos finales = seleccionados con manualReviewStatus = 'included'
      const included = selectedRefs.filter(ref => getManualStatus(ref) === 'included').length;
      
      // Excluidos en full-text = seleccionados con manualReviewStatus = 'excluded'
      const excludedFT = selectedRefs.filter(ref => getManualStatus(ref) === 'excluded').length;
      
      // Pendientes = seleccionados SIN decisión manual
      const pending = selectedRefs.filter(ref => {
        const ms = getManualStatus(ref);
        return !ms || ms === 'pending';
      }).length;
      
      console.log('📊 PRISMA CALCULATIONS (Single Source of Truth):');
      console.log('  identified:', identified);
      console.log('  duplicates:', duplicates);
      console.log('  afterDedup:', afterDedup);
      console.log('  selectedForFullText:', selectedForFullTextIds.length);
      console.log('  screenedOut (title/abstract):', screenedOut, '=', afterDedup, '-', fullTextAssessed);
      console.log('  fullTextAssessed:', fullTextAssessed);
      console.log('  excludedFT (manual review):', excludedFT);
      console.log('  included (manual review):', included);
      console.log('  pending (no decision yet):', pending);
      
      // Recopilar razones de exclusión de la revisión manual (full-text)
      const exclusionReasons = {};
      selectedRefs.filter(ref => getManualStatus(ref) === 'excluded').forEach(ref => {
        const reason = (ref.exclusionReason || ref.exclusion_reason || 'Sin razón especificada').trim();
        exclusionReasons[reason] = (exclusionReasons[reason] || 0) + 1;
      });

      // Desglose de motivos de exclusión en cribado título/abstract (Fase 1)
      const screeningExclusionReasons = {};
      const notSelectedRefs = allReferences.filter(ref => !selectedForFullTextSet.has(ref.id));
      notSelectedRefs.forEach(ref => {
        const excReason = (ref.exclusionReason || ref.exclusion_reason || '').trim();
        const aiClass = ref.aiClassification || ref.ai_classification || ref.classification_method || '';
        const matchedCriteria = ref.matchedCriteria || ref.matched_criteria || [];
        
        if (excReason) {
          screeningExclusionReasons[excReason] = (screeningExclusionReasons[excReason] || 0) + 1;
        } else if (Array.isArray(matchedCriteria) && matchedCriteria.length > 0) {
          matchedCriteria.forEach(criteria => {
            const reason = `No cumple: ${String(criteria).trim()}`;
            screeningExclusionReasons[reason] = (screeningExclusionReasons[reason] || 0) + 1;
          });
        } else if (aiClass === 'exclude') {
          const reason = 'No cumple criterios de inclusión (IA)';
          screeningExclusionReasons[reason] = (screeningExclusionReasons[reason] || 0) + 1;
        } else {
          const reason = 'Baja relevancia temática (score insuficiente)';
          screeningExclusionReasons[reason] = (screeningExclusionReasons[reason] || 0) + 1;
        }
      });

      // Criterios de exclusión del protocolo (para mostrar categorías aun cuando n=0)
      const protocolExclusionCriteria = protocol.exclusionCriteria || [];

      // 6. Obtener información del método de cribado
      const screeningMethod = this.determineScreeningMethod(screeningResults);

      // 7. Analizar datos extraídos de PDFs (si existen)
      const fullTextAnalysis = await this.analyzeFullTextData(allReferences);

      // 8. Calcular referencias por fuente (source) para PRISMA diagram
      const referencesBySource = allReferences.reduce((acc, ref) => {
        const source = (ref.source || 'Unknown').trim();
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});
      
      console.log('🔍 DEBUG - referencesBySource calculated:', referencesBySource);
      console.log('🔍 DEBUG - Sample reference sources from DB:', 
        allReferences.slice(0, 3).map(r => ({ 
          title: r.title?.substring(0, 30), 
          source: r.source 
        }))
      );

      // 9. Construir PRISMA Context Object
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
          searchString: protocol.searchString || '',

          keyTerms: protocol.keyTerms || {}
        },

        screening: {
          // Números PRISMA — consistentes con la sección "Resultados Detallado" del frontend
          identified: identified,
          duplicatesRemoved: duplicates,
          screenedTitleAbstract: afterDedup,
          excludedTitleAbstract: screenedOut,
          fullTextAssessed: fullTextAssessed,
          excludedFullText: excludedFT,
          exclusionReasons: exclusionReasons,
          screeningExclusionReasons: screeningExclusionReasons,
          protocolExclusionCriteria: protocolExclusionCriteria,
          includedFinal: included,

          // Referencias reales por fuente (para PRISMA diagram)
          referencesBySource: referencesBySource,

          // Campos para el artículo
          totalResults: identified,
          afterScreening: afterDedup,
          fullTextRetrieved: fullTextAssessed,

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
      console.log(`📊 Referencias: ${identified} identificadas → ${included} incluidas`);

      return {
        success: true,
        context: prismaContext,
        summary: {
          totalReferences: identified,
          excluded: screenedOut + excludedFT,
          included: included,
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
    // Calcular hits por source REAL (referencias importadas)
    const hitsBySource = allReferences.reduce((acc, ref) => {
      const source = (ref.source || 'Unknown').trim();
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // Si no hay bases de datos configuradas, devolver solo las fuentes reales
    if (!databases || databases.length === 0) {
      return Object.entries(hitsBySource).map(([name, hits]) => ({
        name,
        searchString: null,
        hits
      }));
    }

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
    }).filter(db => db.hits > 0); // Descartar bases de datos sin referencias cargadas
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
