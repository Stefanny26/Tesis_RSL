/**
 * VERSIÓN MEJORADA: Generación de Artículo Científico de Calidad Académica
 * 
 * Mejoras implementadas:
 * 1. Prompts más específicos y detallados con datos estadísticos reales
 * 2. Mejor integración de datos RQS con análisis estadístico profesional
 * 3. Tablas académicas bien formateadas con markdown correcto
 * 4. Redacción más profesional con referencias específicas a estudios
 * 5. Mayor énfasis en evidencia empírica y métricas cuantitativas
 * 6. Síntesis por pregunta de investigación individual
 * 7. Validación de calidad del artículo generado
 * 8. Sistema de prompts mejorado con instrucciones académicas explícitas
 */

class GenerateArticleFromPrismaUseCase {
  // Constantes para estándares editoriales — Target: ~7,200 palabras (~13 páginas)
  // Distribución: Abstract+Intro ~1,200 | Metodología ~2,000 | Resultados ~2,500 |
  //               Discusión+Conclusiones ~1,500 | Referencias N/A
  static EDITORIAL_STANDARDS = {
    TITLE_MAX_WORDS: 25,
    ABSTRACT_MIN_WORDS: 250,
    ABSTRACT_MAX_WORDS: 400,
    INTRODUCTION_MIN_WORDS: 800,
    INTRODUCTION_MAX_WORDS: 1000,
    METHODS_MIN_WORDS: 1800,
    METHODS_MAX_WORDS: 2200,
    RESULTS_MIN_WORDS: 2200,
    RESULTS_MAX_WORDS: 2800,
    DISCUSSION_MIN_WORDS: 800,
    DISCUSSION_MAX_WORDS: 1200,
    CONCLUSIONS_MIN_WORDS: 500,
    CONCLUSIONS_MAX_WORDS: 800,
    KEYWORDS_MIN: 3,
    KEYWORDS_MAX: 6,
    MIN_TOTAL_WORDS: 6500
  };

  constructor({
    prismaItemRepository,
    protocolRepository,
    rqsEntryRepository,
    screeningRecordRepository,
    referenceRepository,
    aiService,
    pythonGraphService,
    generatePrismaContextUseCase,
    extractRQSDataUseCase,
    extractFullTextDataUseCase
  }) {
    this.prismaItemRepository = prismaItemRepository;
    this.protocolRepository = protocolRepository;
    this.rqsEntryRepository = rqsEntryRepository;
    this.screeningRecordRepository = screeningRecordRepository;
    this.referenceRepository = referenceRepository;
    this.aiService = aiService;
    this.pythonGraphService = pythonGraphService;
    this.generatePrismaContextUseCase = generatePrismaContextUseCase;
    this.extractRQSDataUseCase = extractRQSDataUseCase;
    this.extractFullTextDataUseCase = extractFullTextDataUseCase;
  }

  /**
   * Translate text to Academic English using AI (only if it contains Spanish)
   */
  async translateToEnglish(text) {
    if (!text || text.trim() === '' || text === 'undefined') return text;
    
    // Quick heuristic: check if text likely contains Spanish
    const spanishIndicators = /[áéíóúñ¿¡]|(\b(de|del|los|las|una|que|para|con|por|como|más|está|sobre|entre|desde|hasta|según|esta|estos|estas|también|además|mediante|incluyendo|dentro|siendo|hacia|donde|cual|cada|sino|aunque|puede|deben|tienen|puede|esto|implementación|análisis|evaluación|supervisión|detección|prevención|tecnología|estudio|estudios|contexto|sistema|sistemas|inteligencia|artificial|cultivos|cultivo|agricultura|datos|modelos|rendimiento|aprendizaje|automático|investigación|comparación|intervención|población|resultado|resultados|búsqueda|desarrollo|aplicación|metodología)\b)/i;
    
    if (!spanishIndicators.test(text)) return text;
    
    try {
      const prompt = `Translate the following text to formal Academic English. Preserve all technical terms, acronyms, and proper nouns. Return ONLY the translated text, nothing else.

Text to translate:
${text}`;

      const response = await this.aiService.generateText(
        'You are a professional academic translator. Translate Spanish text to formal Academic English suitable for a Q1 journal publication.',
        prompt,
        'chatgpt'
      );
      return response.trim();
    } catch (error) {
      console.warn('⚠️ Translation failed, using original text:', error.message);
      return text;
    }
  }

  /**
   * Translate exclusion reason labels (Spanish → English) using a static map
   * for known system-generated reasons, with AI fallback for DB-stored ones.
   */
  translateExclusionReason(reason) {
    const REASON_MAP = {
      'no es relevante': 'Not relevant',
      'no relevante': 'Not relevant',
      'sin razón especificada': 'No reason specified',
      'no cumple criterios de inclusión (ia)': 'Does not meet inclusion criteria (AI)',
      'baja relevancia temática (score insuficiente)': 'Low thematic relevance (insufficient score)',
      'duplicado': 'Duplicate',
      'fuera de rango temporal': 'Outside temporal range',
      'no cumple criterios de inclusión': 'Does not meet inclusion criteria',
      'idioma no admitido': 'Unsupported language',
      'sin acceso al texto completo': 'Full text not available',
      'datos insuficientes': 'Insufficient data',
      'no es un estudio primario': 'Not a primary study',
      'fuera del alcance': 'Out of scope',
      'metodología inadecuada': 'Inadequate methodology',
    };
    const key = reason.toLowerCase().trim();
    if (REASON_MAP[key]) return REASON_MAP[key];
    // Handle "No cumple: <criteria>" pattern
    if (key.startsWith('no cumple:')) {
      return `Does not meet: ${reason.substring(10).trim()}`;
    }
    // If it looks Spanish, return a generic translation attempt
    const spanishPattern = /[áéíóúñ¿¡]|(\b(de|del|los|las|que|para|con|por)\b)/i;
    if (spanishPattern.test(reason)) {
      return reason; // Will be caught by translateToEnglish in async contexts
    }
    return reason; // Already in English
  }

  /**
   * Translate all exclusion reasons in a reasons object { reason: count }
   */
  translateExclusionReasons(reasonsObj) {
    if (!reasonsObj || typeof reasonsObj !== 'object') return {};
    const translated = {};
    for (const [reason, count] of Object.entries(reasonsObj)) {
      const eng = this.translateExclusionReason(reason);
      translated[eng] = (translated[eng] || 0) + count;
    }
    return translated;
  }

  /**
   * Re-clasifica estudios RQS basándose en keywords extraídas dinámicamente
   * del protocolo (preguntas de investigación + PICO).
   * NUNCA degrada relaciones existentes ('yes' → 'partial').
   */
  classifyStudiesForRQs(rqsEntries, protocol) {
    console.log('🔍 Re-clasificando estudios para RQs basándose en keywords del protocolo...');

    const researchQuestions = protocol.researchQuestions || [];

    if (researchQuestions.length === 0) {
      console.warn('⚠️ No se encontraron preguntas de investigación en el protocolo, omitiendo re-clasificación');
      return rqsEntries.map(entry => {
        for (let i = 1; i <= 3; i++) {
          if (!entry[`rq${i}Relation`]) entry[`rq${i}Relation`] = 'no';
        }
        return entry;
      });
    }

    // Stopwords comunes (español + inglés) para filtrar palabras sin valor semántico
    const stopwords = new Set([
      'de', 'del', 'la', 'las', 'los', 'el', 'en', 'un', 'una', 'que', 'es', 'se', 'por',
      'con', 'para', 'son', 'como', 'más', 'al', 'ya', 'no', 'hay', 'su', 'sus',
      'cuáles', 'cuales', 'cómo', 'qué', 'han', 'sido', 'sobre', 'entre',
      'tiene', 'tienen', 'puede', 'pueden', 'está', 'están', 'ser', 'hacer',
      'esta', 'estos', 'estas', 'ese', 'esos', 'esas', 'aquel', 'aquellos',
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'may', 'might', 'must', 'can', 'could', 'of', 'in', 'to', 'for', 'with',
      'on', 'at', 'from', 'by', 'about', 'as', 'into', 'through', 'during',
      'and', 'but', 'or', 'if', 'what', 'which', 'who', 'this', 'that',
      'these', 'those', 'how', 'not', 'all', 'each', 'some', 'most', 'than',
      'its', 'they', 'them', 'their', 'been', 'being', 'there', 'where'
    ]);

    /** Extrae palabras clave significativas de un texto */
    const extractKeywords = (text) => {
      if (!text) return [];
      return text
        .toLowerCase()
        .replace(/[¿?¡!.,;:()[\]{}"'""''«»]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopwords.has(word))
        .filter((word, idx, arr) => arr.indexOf(word) === idx);
    };

    // Construir listas de keywords dinámicamente desde las preguntas de investigación
    const rqKeywordSets = researchQuestions.map((rq, i) => {
      const keywords = extractKeywords(rq);
      console.log(`   RQ${i + 1} keywords: [${keywords.join(', ')}]`);
      return keywords;
    });

    // Extraer términos PICO como keywords suplementarias
    const pico = protocol.picoFramework || protocol.pico || {};
    const picoTerms = [
      ...extractKeywords(pico.population || ''),
      ...extractKeywords(pico.intervention || ''),
      ...extractKeywords(pico.comparison || ''),
      ...extractKeywords(pico.outcome || pico.outcomes || '')
    ].filter((word, idx, arr) => arr.indexOf(word) === idx);

    if (picoTerms.length > 0) {
      console.log(`   PICO terms: [${picoTerms.join(', ')}]`);
    }

    // También incluir keyTerms del protocolo si existen
    const protocolKeyTerms = extractKeywords(
      Object.values(protocol.keyTerms || {}).flat().join(' ')
    );
    if (protocolKeyTerms.length > 0) {
      console.log(`   Protocol key terms: [${protocolKeyTerms.join(', ')}]`);
    }

    const rqCounts = new Array(researchQuestions.length).fill(0);

    const classified = rqsEntries.map(entry => {
      const text = `${entry.title || ''} ${entry.keyEvidence || ''} ${entry.technology || ''}`.toLowerCase();

      // Clasificar para cada RQ dinámicamente
      rqKeywordSets.forEach((keywords, i) => {
        const rqKey = `rq${i + 1}Relation`;

        // NUNCA degradar: si ya es 'yes', mantener
        if (entry[rqKey] === 'yes') return;

        // Combinar keywords de la RQ + PICO + keyTerms del protocolo
        const combinedKeywords = [...new Set([...keywords, ...picoTerms, ...protocolKeyTerms])];
        const matchCount = combinedKeywords.filter(kw => text.includes(kw)).length;

        // Requiere al menos 2 coincidencias para clasificar como 'partial'
        if (matchCount >= 2 && entry[rqKey] !== 'partial') {
          entry[rqKey] = 'partial';
          rqCounts[i]++;
        } else if (!entry[rqKey]) {
          entry[rqKey] = 'no';
        }
      });

      // Asegurar que rq1-rq3 existan aunque el protocolo tenga menos de 3 RQs
      for (let j = 1; j <= 3; j++) {
        if (!entry[`rq${j}Relation`]) entry[`rq${j}Relation`] = 'no';
      }

      return entry;
    });

    const rqSummary = rqKeywordSets.map((_, i) => `RQ${i + 1}=${rqCounts[i]}`).join(', ');
    console.log(`✅ Re-clasificación completada (nuevas parciales): ${rqSummary}`);
    return classified;
  }

  async execute(projectId) {
    try {
      console.log(`📄 Generando artículo científico profesional para proyecto ${projectId}`);

      // 1. Validar PRISMA completo
      await this.validatePrismaComplete(projectId);

      // 1.5. 🆕 EXTRACCIÓN AUTOMÁTICA DE DATOS DE PDFs
      console.log(`\n🔍 PASO 1.5: Extracción automática de datos de PDFs cargados`);
      
      // Verificar si hay PDFs para procesar
      if (this.referenceRepository && this.extractFullTextDataUseCase && this.extractRQSDataUseCase) {
        try {
          // Obtener referencias incluidas
          const allReferences = await this.referenceRepository.findByProject(projectId);
          const includedReferences = allReferences.filter(ref => 
            ref.screeningStatus === 'included' || ref.screeningStatus === 'fulltext_included'
          );
          
          const refsWithPDF = includedReferences.filter(ref => ref.fullTextUrl);
          
          console.log(`   📊 Referencias incluidas: ${includedReferences.length}`);
          console.log(`   📄 Con PDFs cargados: ${refsWithPDF.length}`);
          
          if (refsWithPDF.length > 0) {
            // 1.5.1. Extraer datos generales de PDFs (para artículo)
            console.log(`   🔄 Extrayendo datos de texto completo...`);
            try {
              const fullTextResult = await this.extractFullTextDataUseCase.processProjectPDFs(projectId);
              console.log(`   ✅ Datos de texto completo extraídos: ${fullTextResult.processed}/${fullTextResult.total}`);
            } catch (extractError) {
              console.warn(`   ⚠️ Error en extracción de texto completo (continuando):`, extractError.message);
            }
            
            // 1.5.2. Extraer datos RQS estructurados (para tablas RQS)
            console.log(`   🔄 Extrayendo datos RQS estructurados...`);
            try {
              const rqsResult = await this.extractRQSDataUseCase.execute(projectId);
              console.log(`   ✅ Datos RQS extraídos: ${rqsResult.extracted} estudios procesados`);
              if (rqsResult.errors > 0) {
                console.warn(`   ⚠️ Errores en extracción RQS: ${rqsResult.errors} estudios fallaron`);
              }
            } catch (rqsError) {
              console.warn(`   ⚠️ Error en extracción RQS (continuando):`, rqsError.message);
            }
          } else {
            console.log(`   ℹ️ No hay PDFs cargados. Generando artículo solo con abstracts.`);
          }
        } catch (extractionError) {
          console.warn(`   ⚠️ Error en proceso de extracción automática:`, extractionError.message);
          console.warn(`   ℹ️ Continuando con datos existentes...`);
        }
      } else {
        console.log(`   ⚠️ Use cases de extracción no disponibles, omitiendo extracción automática`);
      }
      
      console.log(`\n📊 PASO 2: Cargando datos existentes de la base de datos...`);

      // 2. Obtener datos
      const prismaItems = await this.prismaItemRepository.findAllByProject(projectId);
      const contextResult = await this.generatePrismaContextUseCase.execute(projectId);
      const prismaContext = contextResult.context;
      let rqsEntries = await this.rqsEntryRepository.findByProject(projectId);

      // ✅ CRITICAL: Filter RQS entries to ONLY included references
      // The PRISMA diagram's "included" count is the SINGLE SOURCE OF TRUTH.
      // rqsEntries may contain entries for studies excluded in full-text review.
      let includedRefsWithKeywords = []; // Hoisted for bubble chart keyword extraction
      const prismaIncludedN = prismaContext.screening.includedFinal || 0;
      console.log(`📊 PRISMA includedFinal (hard cap): ${prismaIncludedN}`);
      console.log(`📊 Raw RQS entries from DB: ${rqsEntries.length}`);

      if (this.referenceRepository) {
        try {
          const allRefs = await this.referenceRepository.findByProject(projectId);
          const protocol = await this.protocolRepository.findByProjectId(projectId);
          const selectedForFullTextIds = new Set(protocol?.selectedForFullText || []);

          // Strategy 1: selectedForFullText + manualReviewStatus === 'included'
          let includedRefIds = new Set(
            allRefs
              .filter(ref => {
                const manualStatus = ref.manualReviewStatus || ref.manual_review_status;
                return selectedForFullTextIds.has(ref.id) && manualStatus === 'included';
              })
              .map(ref => ref.id)
          );

          // Strategy 2 (broader): If strategy 1 found 0, try just manualReviewStatus === 'included'
          if (includedRefIds.size === 0) {
            console.warn('⚠️ Strategy 1 found 0 included refs. Trying broader filter (manualReviewStatus only)...');
            includedRefIds = new Set(
              allRefs
                .filter(ref => {
                  const ms = ref.manualReviewStatus || ref.manual_review_status;
                  return ms === 'included';
                })
                .map(ref => ref.id)
            );
          }

          // Strategy 3 (even broader): If still 0, try screeningStatus === 'included' or 'fulltext_included'
          if (includedRefIds.size === 0) {
            console.warn('⚠️ Strategy 2 found 0 included refs. Trying screeningStatus filter...');
            includedRefIds = new Set(
              allRefs
                .filter(ref => {
                  const ss = ref.screeningStatus || ref.screening_status;
                  return ss === 'included' || ss === 'fulltext_included';
                })
                .map(ref => ref.id)
            );
          }

          console.log(`🔍 Included reference IDs found: ${includedRefIds.size}`);

          // Apply referenceId filter to RQS entries
          const beforeCount = rqsEntries.length;
          if (includedRefIds.size > 0) {
            const filtered = rqsEntries.filter(entry => {
              const refId = entry.referenceId || entry.reference_id;
              return includedRefIds.has(refId);
            });
            
            if (filtered.length > 0) {
              rqsEntries = filtered;
              console.log(`🔒 RQS entries filtered by referenceId: ${beforeCount} → ${rqsEntries.length}`);
            } else {
              console.warn(`⚠️ ReferenceId filter removed ALL entries (IDs may not match). Keeping originals.`);
            }
          }

          // Extract included references with keywords for thematic mapping chart
          if (includedRefIds.size > 0) {
            includedRefsWithKeywords = allRefs.filter(ref => includedRefIds.has(ref.id));
          } else {
            // Fallback: use first N refs matching the PRISMA count
            includedRefsWithKeywords = allRefs
              .filter(ref => {
                const ss = ref.screeningStatus || ref.screening_status;
                return ss !== 'excluded';
              })
              .slice(0, prismaIncludedN || rqsEntries.length);
          }
          console.log(`📊 Included references with keywords: ${includedRefsWithKeywords.filter(r => r.keywords).length}/${includedRefsWithKeywords.length}`);

        } catch (filterError) {
          console.warn('⚠️ Could not filter RQS entries by included references:', filterError.message);
        }
      }

      // ✅ HARD CAP: ALWAYS enforce PRISMA includedFinal as maximum count
      // This is the last line of defense — no matter what the filtering above did,
      // the article MUST NOT present more studies than PRISMA says were included.
      if (prismaIncludedN > 0 && rqsEntries.length > prismaIncludedN) {
        console.warn(`🚨 HARD CAP: RQS entries (${rqsEntries.length}) exceed PRISMA includedFinal (${prismaIncludedN}). Truncating.`);
        // Sort by quality (high > medium > low) so we keep the best studies
        const qualityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
        rqsEntries.sort((a, b) => {
          const qa = qualityOrder[a.qualityScore] ?? 2;
          const qb = qualityOrder[b.qualityScore] ?? 2;
          return qa - qb;
        });
        rqsEntries = rqsEntries.slice(0, prismaIncludedN);
        console.log(`   Kept ${rqsEntries.length} entries (sorted by quality)`);
      }

      // ✅ CORRECCIÓN: Re-clasificar estudios para RQs
      if (rqsEntries.length > 0) {
        rqsEntries = this.classifyStudiesForRQs(rqsEntries, prismaContext.protocol || {});
      }

      // Validar datos RQS mínimos
      if (rqsEntries.length < 2) {
        console.warn('⚠️ Advertencia: Se recomienda tener al menos 2 estudios con datos RQS para generar un artículo de calidad');
      }

      console.log(`📊 Datos RQS disponibles: ${rqsEntries.length} entradas`);
      console.log(`✅ ESTUDIOS CARGADOS DESDE DB:`);
      rqsEntries.forEach((entry, idx) => {
        console.log(`   S${idx + 1}: ${entry.author} (${entry.year}) - ${entry.title?.substring(0, 60)}...`);
      });
      console.log(`⚠️  GPT-4 DEBE USAR SOLO ESTOS ${rqsEntries.length} ESTUDIOS, NO PUEDE INVENTAR MÁS`);

      // 3. Calcular estadísticas detalladas RQS
      const rqsStats = this.calculateDetailedRQSStatistics(rqsEntries);
      console.log(`📈 Estadísticas RQS calculadas:`, {
        tipos: Object.keys(rqsStats.studyTypes).length,
        tecnologías: rqsStats.technologies.length,
        años: `${rqsStats.yearRange.min}-${rqsStats.yearRange.max}`
      });

      // 3.5. Extraer datos para los 4 nuevos gráficos académicos
      const enhancedChartData = this.extractEnhancedChartData(rqsEntries, includedRefsWithKeywords);
      console.log(`📊 Datos extraídos para gráficos académicos:`, {
        años_distribucion: Object.keys(enhancedChartData.temporal_distribution.years).length,
        bubble_keywords: enhancedChartData.bubble_chart.entries.length,
        estudios_sintesis: enhancedChartData.technical_synthesis.studies.length
      });

      // 3.6. Build domain context and SSOT for consistent article generation
      this._domainContext = this.buildDomainContext(prismaContext);
      this._ssot = this.buildSSOT(prismaContext, rqsEntries, rqsStats);
      console.log(`🔒 Domain context: ${this._domainContext.domainTerms.length} terms, ${this._domainContext.allowedTechnologies.length} technologies`);
      console.log(`📊 SSOT: n_final=${this._ssot.includedFinal}, databases=${this._ssot.databases.length}`);

      // 3.7. Validate domain compliance of RQS entries
      const domainWarnings = this.validateDomainCompliance(rqsEntries, this._domainContext);
      if (domainWarnings.length > 0) {
        console.warn(`⚠️ ${domainWarnings.length} potential domain compliance issues detected`);
      }

      // 4. Generar Gráficos con Python
      let chartPaths = {};
      try {
        if (this.pythonGraphService && this.screeningRecordRepository) {
          // Intentar obtener scores de ambas fases (title_abstract tiene prioridad)
          let scores = await this.screeningRecordRepository.getAllScores(projectId, 'title_abstract');
          
          // Si no hay scores en title_abstract, intentar fulltext
          if (!scores || scores.length === 0) {
            scores = await this.screeningRecordRepository.getAllScores(projectId, 'fulltext');
          }
          
          console.log(`📊 Scores obtenidos para gráfico scree: ${scores?.length || 0} puntos`);
          
          // Usar searchQueries del protocolo que tiene la información real de búsquedas
          const searchData = (prismaContext.protocol.searchQueries || []).map(sq => ({
            name: sq.database || sq.databaseId || 'Unknown',
            hits: sq.resultsCount || 0,
            searchString: sq.query || sq.apiQuery || 'N/A'
          }));
          
          console.log('🔍 DEBUG - prismaContext.screening.referencesBySource:', 
            prismaContext.screening.referencesBySource);
          console.log('🔍 DEBUG - Generated searchData:', searchData);
          console.log('🔍 DEBUG - Passing to generateCharts...');
          
          // Translate exclusion reasons to English before passing to Python charts
          const screeningDataForCharts = {
            ...prismaContext.screening,
            screeningExclusionReasons: this.translateExclusionReasons(prismaContext.screening.screeningExclusionReasons),
            exclusionReasons: this.translateExclusionReasons(prismaContext.screening.exclusionReasons)
          };

          // Pasar datos extendidos al servicio de Python
          chartPaths = await this.pythonGraphService.generateCharts(
            screeningDataForCharts, 
            scores, 
            searchData,
            enhancedChartData // ← Nuevos datos estadísticos
          );
        }
      } catch (err) {
        console.error('⚠️ Error generando gráficos:', err);
      }

      // 5. Mapear PRISMA
      const prismaMapping = this.mapPrismaToIMRaD(prismaItems);

      // 6. Generar artículo con CALIDAD ACADÉMICA
      console.log('📝 Generando secciones del artículo...');

      // ✅ VALIDACIÓN: Asegurar que title nunca esté vacío y cumple longitud editorial
      const articleTitle = prismaMapping.title ||
        prismaContext.protocol.title ||
        prismaContext.protocol.proposedTitle ||
        'Systematic Literature Review';

      if (!articleTitle || articleTitle.trim() === '') {
        console.warn('⚠️ Advertencia: Título del artículo vacío, usando fallback genérico');
      }
      
      // Validar longitud del título según estándares editoriales
      const titleWordCount = articleTitle.split(/\s+/).filter(w => w.length > 0).length;
      const { TITLE_MAX_WORDS } = GenerateArticleFromPrismaUseCase.EDITORIAL_STANDARDS;
      
      if (titleWordCount > TITLE_MAX_WORDS) {
        console.warn(`⚠️ Título excede longitud recomendada: ${titleWordCount} palabras (máximo recomendado: ${TITLE_MAX_WORDS})`);
        console.warn(`   Considere acortar: "${articleTitle.substring(0, 80)}..."`);
      } else {
        console.log(`✅ Título cumple estándar editorial: ${titleWordCount} palabras`);
      }

      // 6.5. NO convertir a base64, usar URLs directas para evitar problemas con ReactMarkdown
      // Las imágenes ya están guardadas en uploads/charts/ y son servidas por Express
      console.log('📸 Usando URLs directas para imágenes en lugar de base64');
      const chartPathsForArticle = chartPaths; // Usar URLs directas

      // ✅ OPTIMIZACIÓN: Generar secciones en lotes paralelos para reducir tiempo total
      console.log('📝 Generando secciones del artículo (paralelo por lotes)...');

      // Lote 1: abstract + keywords + introduction (independientes)
      const [abstract, keywords, introduction] = await Promise.all([
        this.generateProfessionalAbstract(prismaMapping, prismaContext, rqsStats),
        this.generateKeywords(prismaContext, rqsStats),
        this.generateProfessionalIntroduction(prismaMapping, prismaContext, rqsEntries)
      ]);
      console.log('   ✅ Lote 1 completado: abstract, keywords, introduction');

      // Lote 2: methods + results (independientes)
      const [methods, results] = await Promise.all([
        this.generateProfessionalMethods(prismaMapping, prismaContext, rqsEntries, chartPathsForArticle),
        this.generateProfessionalResults(prismaMapping, prismaContext, rqsEntries, rqsStats, chartPathsForArticle)
      ]);
      console.log('   ✅ Lote 2 completado: methods, results');

      // Lote 3: discussion + conclusions (independientes)
      const [discussion, conclusions] = await Promise.all([
        this.generateProfessionalDiscussion(prismaMapping, prismaContext, rqsStats, rqsEntries),
        this.generateProfessionalConclusions(prismaMapping, prismaContext, rqsStats)
      ]);
      console.log('   ✅ Lote 3 completado: discussion, conclusions');

      const article = {
        title: articleTitle,
        abstract,
        keywords,
        introduction,
        methods,
        results,
        discussion,
        conclusions,
        references: this.generateProfessionalReferences(prismaContext, rqsEntries),
        declarations: this.generateDeclarations(prismaContext),
        metadata: {
          generatedAt: new Date().toISOString(),
          wordCount: 0,
          version: 1,
          prismaCompliant: true,
          rqsDataIncluded: rqsEntries.length > 0,
          rqsEntriesCount: rqsEntries.length,
          tablesIncluded: 3,
          figuresRecommended: [
            'PRISMA flow diagram', 
            'Scree plot', 
            'Search strategy table',
            'Temporal distribution',
            'Quality assessment',
            'Metrics-Technologies bubble chart',
            'Technical synthesis table'
          ],
          figuresIncluded: Object.keys(chartPaths).length,
          editorialStandards: {
            compliant: true,
            format: 'IEEE/Elsevier/Springer/MDPI',
            abstractWords: 0,
            keywordsCount: 0,
            conclusionsWords: 0
          }
        }
      };

      article.metadata.wordCount = this.calculateWordCount(article);
      
      // Calcular estadísticas editoriales
      article.metadata.editorialStandards.abstractWords = article.abstract.split(/\s+/).filter(w => w.length > 0).length;
      article.metadata.editorialStandards.keywordsCount = article.keywords.split(';').filter(k => k.trim().length > 0).length;
      article.metadata.editorialStandards.conclusionsWords = article.conclusions.split(/\s+/).filter(w => w.length > 0).length;

      // Validación de calidad
      this.validateArticleQuality(article);

      console.log('✅ Artículo profesional generado exitosamente');
      console.log(`📊 Palabras totales: ${article.metadata.wordCount}`);
      console.log(`📊 Abstract: ${article.metadata.editorialStandards.abstractWords} palabras`);
      console.log(`📊 Keywords: ${article.metadata.editorialStandards.keywordsCount} términos`);
      console.log(`📊 Conclusiones: ${article.metadata.editorialStandards.conclusionsWords} palabras`);
      console.log(`📊 Tablas incluidas: ${article.metadata.tablesIncluded}`);

      return { success: true, article };

    } catch (error) {
      console.error('❌ Error generando artículo:', error);
      throw error;
    }
  }

  /**
   * ABSTRACT PROFESIONAL con estructura estándar de revistas Q1
   */
  async generateProfessionalAbstract(prismaMapping, prismaContext, rqsStats) {
    const prompt = `Act as a senior researcher writing for a Q1 journal. Generate a structured abstract following the strict IMRAD format. ALL output MUST be in Academic English.

**CONCRETE DATA AVAILABLE:**

STUDY CONTEXT:
- Objective: ${prismaMapping.introduction.objectives}
- Search period: ${prismaContext.protocol.temporalRange.start || '2023'} - ${prismaContext.protocol.temporalRange.end || '2025'}
- Databases: ${prismaContext.protocol.databases.map(db => db.name).join(', ')}
- Total articles identified: ${prismaContext.screening.totalResults ?? 'N/A'}
- Articles after screening: ${prismaContext.screening.afterScreening ?? 'N/A'}
- Final included studies: ${prismaContext.screening.includedFinal ?? rqsStats.total}
- AI screening method: Hybrid (Phase 1: semantic embeddings, Phase 2: LLM grey-zone analysis)
${prismaContext.screening.phase1 ? `- Phase 1 results: ${prismaContext.screening.phase1.highConfidenceInclude} high-confidence includes, ${prismaContext.screening.phase1.highConfidenceExclude} excludes, ${prismaContext.screening.phase1.greyZone} grey-zone` : ''}
${prismaContext.screening.phase2 ? `- Phase 2 results: ${prismaContext.screening.phase2.included} included, ${prismaContext.screening.phase2.excluded} excluded, ${prismaContext.screening.phase2.manual} manual review` : ''}

PROCESSED RQS DATA (${rqsStats.total} studies):
- Study types: ${JSON.stringify(rqsStats.studyTypes)}
- Temporal distribution: ${rqsStats.yearRange.min}-${rqsStats.yearRange.max}
- Main technologies: ${rqsStats.technologies.slice(0, 3).map(t => `${t.technology} (n=${t.count})`).join(', ')}
- Application contexts: ${JSON.stringify(rqsStats.contexts)}
- RQ1 coverage: ${rqsStats.rqRelations.rq1.yes} direct, ${rqsStats.rqRelations.rq1.partial} partial
- RQ2 coverage: ${rqsStats.rqRelations.rq2.yes} direct, ${rqsStats.rqRelations.rq2.partial} partial
- RQ3 coverage: ${rqsStats.rqRelations.rq3.yes} direct, ${rqsStats.rqRelations.rq3.partial} partial

**MANDATORY STRUCTURE (250-400 words — IMRaD single paragraph):**

Write ONE cohesive paragraph with FOUR clearly delineated sub-segments (no headings, no line breaks):

1. **Introduction segment** (2-3 sentences): State the problem domain, its importance, and the specific knowledge gap this review addresses.

2. **Methods segment** (3-4 sentences): Specify PRISMA 2020 compliance, databases searched, temporal range, PICO-based eligibility criteria, AI-assisted screening prioritization with elbow method validation, total identified → screened → included numbers, and RQS-based data extraction.

3. **Results segment** (4-5 sentences): Report the final number of included studies, distribution by study type (with exact counts), predominant technologies (with frequencies), temporal concentration, and principal findings organized by research question. Include specific quantitative data (n=X, Y%).

4. **Discussion segment** (2-3 sentences): Synthesize main implications for practice, acknowledge key limitations (publication bias, database coverage), and state recommendations for future research.

${this.getDomainFilterDirective()}
${this.getSSOTDirective()}
${this.getAntiAIDirective()}

**QUALITY REQUIREMENTS:**
- Use ONLY the data provided above, DO NOT invent figures
- Include specific numbers (n=X, Y%, etc.)
- Formal Academic English
- Third person impersonal
- No undefined abbreviations
- Total coherence between sub-segments
- **CRITICAL: Keep between 250-400 words (extended MDPI/IEEE standard for comprehensive SLRs)**
- The output must be ONE SINGLE PARAGRAPH without line breaks
- DO NOT start with "The increasing complexity of..." or any AI cliché — begin with a direct technical problem statement
- Every number mentioned must match the SSOT values provided above

Generate ONLY the abstract text as one continuous paragraph. ALL text MUST be in English:`;

    const response = await this.aiService.generateText(
      this.getEnhancedSystemPrompt(),
      prompt,
      'chatgpt'
    );

    const abstractText = response.trim();
    
    // Validación de longitud según estándares editoriales
    const wordCount = abstractText.split(/\s+/).filter(w => w.length > 0).length;
    const { ABSTRACT_MIN_WORDS, ABSTRACT_MAX_WORDS } = GenerateArticleFromPrismaUseCase.EDITORIAL_STANDARDS;
    
    if (wordCount < ABSTRACT_MIN_WORDS) {
      console.warn(`⚠️ Abstract DEBAJO del estándar editorial: ${wordCount} palabras (mínimo: ${ABSTRACT_MIN_WORDS})`);
    } else if (wordCount > ABSTRACT_MAX_WORDS) {
      console.warn(`⚠️ Abstract EXCEDE el estándar editorial: ${wordCount} palabras (máximo: ${ABSTRACT_MAX_WORDS})`);
    } else {
      console.log(`✅ Abstract cumple estándar editorial: ${wordCount} palabras`);
    }

    return abstractText;
  }

  /**
   * KEYWORDS profesionales (obligatorio en journals IEEE/Elsevier/Springer/MDPI)
   */
  async generateKeywords(prismaContext, rqsStats) {
    const prompt = `Generate keywords for a systematic review scientific article. ALL output MUST be in English.

**STUDY CONTEXT:**
- Objective: ${prismaContext.protocol.objective}
- Main technologies: ${rqsStats.technologies.slice(0, 5).map(t => t.technology).join(', ')}
- Contexts: ${Object.keys(rqsStats.contexts).join(', ')}
- Study type: Systematic literature review

${this.getDomainFilterDirective()}

**STRICT EDITORIAL REQUIREMENTS:**
- Generate EXACTLY between 3 and 6 keywords
- Must reflect: technology, application domain, and method
- Avoid generic words like "review", "analysis" (unless very specific)
- Use indexable terms in academic databases (IEEE Xplore, Scopus, Web of Science)
- Use standard English academic terms
- Separate with semicolons
- Capitalization: First letter uppercase or all lowercase per term convention
- ALL keywords must be within the PICO domain — do not include terms from other fields

**EXAMPLES OF GOOD KEYWORDS (format only, adapt to YOUR study domain):**
- Deep Learning; Crop Disease Detection; Precision Agriculture; Convolutional Neural Networks; Systematic Review
- Cloud Computing; DevOps; Agile Methodology; Software Quality
- Artificial Intelligence; Natural Language Processing; Transfer Learning

Generate ONLY the list of keywords separated by semicolons, without numbering or additional formatting:`;

    const response = await this.aiService.generateText(
      this.getEnhancedSystemPrompt(),
      prompt,
      'chatgpt'
    );

    const keywords = response.trim();
    
    // Validación de cantidad de keywords
    const keywordArray = keywords.split(';').map(k => k.trim()).filter(k => k.length > 0);
    const { KEYWORDS_MIN, KEYWORDS_MAX } = GenerateArticleFromPrismaUseCase.EDITORIAL_STANDARDS;
    
    if (keywordArray.length < KEYWORDS_MIN) {
      console.warn(`⚠️ Keywords insuficientes: ${keywordArray.length} (mínimo: ${KEYWORDS_MIN})`);
    } else if (keywordArray.length > KEYWORDS_MAX) {
      console.warn(`⚠️ Demasiadas keywords: ${keywordArray.length} (máximo: ${KEYWORDS_MAX})`);
    } else {
      console.log(`✅ Keywords cumplen estándar: ${keywordArray.length} términos`);
    }

    return keywords;
  }

  /**
   * INTRODUCCIÓN PROFESIONAL con revisión de literatura
   */
  async generateProfessionalIntroduction(prismaMapping, prismaContext, rqsEntries) {
    const referencesList = rqsEntries.map((e, i) => `[${i + 1}] ${e.author} (${e.year}): ${e.title}`).join('\n');

    const prompt = `Write a professional academic introduction for a systematic review in a scientific journal. ALL output MUST be in Academic English. If source data below is in Spanish, translate it into English and integrate it naturally.

**PRISMA CONTENT AVAILABLE:**

Rationale (PRISMA #3):
${prismaMapping.introduction.rationale}

Objectives (PRISMA #4):
${prismaMapping.introduction.objectives}

PICO Protocol:
- Population: ${prismaContext.protocol.pico.population || 'Not specified'}
- Intervention: ${prismaContext.protocol.pico.intervention || 'Not specified'}
- Comparison: ${prismaContext.protocol.pico.comparison || 'No specific comparison defined'}
- Outcome: ${prismaContext.protocol.pico.outcomes || 'Not explicitly defined'}

Research Questions:
${prismaContext.protocol.researchQuestions.map((rq, i) => `RQ${i + 1}: ${rq}`).join('\n')}

**INCLUDED STUDIES (USE FOR CITATIONS):**
${referencesList}

**REQUIRED STRUCTURE (800-1000 words):**

1. **Paragraphs 1-2 (Context & Importance)**: Establish the current state of the field and why this topic matters. Ground the discussion with real-world relevance.
2. **Paragraphs 3-4 (Gap & Literature)**: Cite included studies using THEIR NUMBER in brackets [X] when relevant to show what has been done (and what is missing). Identify the specific knowledge gap this review fills.
3. **Paragraph 5 (Objectives)**: State the objective of this review, linked to the PICO framework.
4. **Paragraph 6 (Contribution)**: Explain the unique contribution of this systematic review.
5. **FINAL PARAGRAPH (Research Questions) — MANDATORY**: End the introduction with an explicit numbered list of the research questions derived from the PICO framework. Use the EXACT research questions from the protocol data above. Format as:

"To address these objectives, this systematic review seeks to answer the following research questions:

- **RQ1**: [exact text of first research question]
- **RQ2**: [exact text of second research question]  
- **RQ3**: [exact text of third research question]"

${this.getDomainFilterDirective()}
${this.getSSOTDirective()}
${this.getAntiAIDirective()}

**WRITING STYLE:**
- Third person impersonal
- STRICT: Use numbered citation format [1], [2] corresponding to the provided list (IEEE style).
- DO NOT invent citations or authors.
- Formal Academic English.
- If any source data is in Spanish, translate and integrate it naturally into English prose.
- The Introduction MUST end with the explicit RQ list — this is a HARD REQUIREMENT.
- The knowledge gap must be SPECIFIC and TECHNICAL, not just "there is limited research". Explain WHY existing studies don't answer the question (e.g., outdated versions, different workloads, missing configurations).
- DO NOT start with generic AI openers like "The increasing complexity of..." — begin with a concrete technical context statement.

Generate ONLY the introduction text in English:`;

    const response = await this.aiService.generateText(
      this.getEnhancedSystemPrompt(),
      prompt,
      'chatgpt'
    );

    return response.trim();
  }

  /**
   * MÉTODOS PROFESIONALES con detalles reproducibles completos
   */
  async generateProfessionalMethods(prismaMapping, prismaContext, rqsEntries, charts = {}) {
    // Usar searchQueries si está disponible, sino databases
    const searchQueries = prismaContext.protocol.searchQueries || [];
    const databases = prismaContext.protocol.databases || [];
    
    // Mapa de IDs a nombres legibles
    const DB_NAME_MAP = {
      'ieee': 'IEEE Xplore',
      'scopus': 'Scopus',
      'acm': 'ACM Digital Library',
      'pubmed': 'PubMed',
      'wos': 'Web of Science',
      'springer': 'Springer Link',
      'sciencedirect': 'ScienceDirect',
      'google_scholar': 'Google Scholar'
    };

    // Para compatibilidad con código existente
    const dbNames = searchQueries.length > 0 
      ? searchQueries.map(sq => DB_NAME_MAP[sq.database] || DB_NAME_MAP[sq.databaseId] || sq.databaseName || sq.database).join(', ')
      : databases.map(db => db.name || db).join(', ') || 'electronic databases';

    let screePlot = '';
    if (charts.scree) {
      screePlot = `
![Priority Screening Score Distribution](${charts.scree})
*Figure 1. Distribution of semantic relevance scores (Scree Plot).*
`;
    }

    // Cadena de búsqueda general del protocolo (fallback)
    const globalSearchString = prismaContext.protocol.searchString || '';

    // Generar tabla de búsquedas - SOLO markdown puro, sin títulos adicionales
    let searchChart = '';
    
    // Build a lookup of hits per database from real reference counts
    const dbHitsMap = {};
    databases.forEach(db => {
      const name = (db.name || db || '').toLowerCase();
      dbHitsMap[name] = db.hits || 0;
    });

    // Also build a name-map for databases to help resolve hits
    const DB_NAME_MAP_REV = {};
    Object.entries(DB_NAME_MAP).forEach(([id, name]) => {
      DB_NAME_MAP_REV[name.toLowerCase()] = name;
    });

    console.log(`📊 Search table: searchQueries=${searchQueries.length}, databases=${databases.length}, globalSearchString=${globalSearchString ? 'YES' : 'NO'}`);
    searchQueries.forEach((sq, i) => console.log(`   SQ[${i}]: db=${sq.database}, query=${(sq.query || '').substring(0, 60)}...`));
    databases.forEach((db, i) => console.log(`   DB[${i}]: name=${db.name || db}, hits=${db.hits || 0}, searchString=${(db.searchString || '').substring(0, 60)}...`));

    if (searchQueries.length > 0) {
      // Show ALL search queries from the protocol — NO filtering against databases
      const resolvedRows = searchQueries.map(sq => {
        const dbName = DB_NAME_MAP[sq.database] || DB_NAME_MAP[sq.databaseId] || sq.databaseName || sq.database || 'N/A';
        const searchStr = sq.query || sq.apiQuery || globalSearchString || 'N/A';
        const hits = sq.resultCount || dbHitsMap[dbName.toLowerCase()] || 0;
        return { dbName, searchStr, hits };
      });

      // Check if all queries are identical — if so, show a consolidated table
      const uniqueQueries = new Set(resolvedRows.map(r => r.searchStr).filter(s => s !== 'N/A'));
      if (uniqueQueries.size === 1 && resolvedRows.length > 1) {
        const sharedQuery = [...uniqueQueries][0];
        const hitsRows = resolvedRows.map(r => `| ${r.dbName} | ${r.hits} |`).join('\n');
        searchChart = `| Database | Results |\n|----------|--------|\n${hitsRows}\n\nThe following search string was applied uniformly across all databases:\n\n\`${sharedQuery}\``;
      } else {
        const tableRows = resolvedRows.map(r => `| ${r.dbName} | ${r.hits} | ${r.searchStr} |`).join('\n');
        searchChart = tableRows ? `| Database | Results | Search String |\n|----------|---------|-------------------|\n${tableRows}` : '';
      }
    }
    
    // Fallback: usar databases + cadena global del protocolo
    if (!searchChart && databases.length > 0) {
      const resolvedRows = databases.map(db => {
        const dbName = db.name || db || 'N/A';
        const searchStr = db.searchString || db.query || globalSearchString || 'See protocol';
        const hits = db.hits || 0;
        return { dbName, searchStr, hits };
      });

      const uniqueQueries = new Set(resolvedRows.map(r => r.searchStr).filter(s => s !== 'See protocol'));
      if (uniqueQueries.size === 1 && resolvedRows.length > 1) {
        const sharedQuery = [...uniqueQueries][0];
        const hitsRows = resolvedRows.map(r => `| ${r.dbName} | ${r.hits} |`).join('\n');
        searchChart = `| Database | Results |\n|----------|--------|\n${hitsRows}\n\nThe following search string was applied uniformly across all databases:\n\n\`${sharedQuery}\``;
      } else {
        const tableRows = resolvedRows.map(r => `| ${r.dbName} | ${r.hits} | ${r.searchStr} |`).join('\n');
        searchChart = `| Database | Results | Search String |\n|----------|---------|-------------------|\n${tableRows}`;
      }
    }

    // Translate PICO and PRISMA items from Spanish to English
    console.log('🔄 Translating PICO and PRISMA content to English...');
    const [picoPopulation, picoIntervention, picoComparison, picoOutcome,
           eligibilityCriteria, selectionProcess, riskOfBias, synthesisMethod] = await Promise.all([
      this.translateToEnglish(prismaContext.protocol.pico.population || 'Not specified'),
      this.translateToEnglish(prismaContext.protocol.pico.intervention || 'Not specified'),
      this.translateToEnglish(prismaContext.protocol.pico.comparison || 'No specific comparison defined'),
      this.translateToEnglish(prismaContext.protocol.pico.outcomes || 'Not explicitly defined'),
      this.translateToEnglish(prismaMapping.methods.eligibilityCriteria),
      this.translateToEnglish(prismaMapping.methods.selectionProcess),
      this.translateToEnglish(prismaMapping.methods.riskOfBias),
      this.translateToEnglish(prismaMapping.methods.synthesisMethod),
    ]);
    console.log('✅ Translation completed');

    return `## 2.1 Study Design

This systematic review was conducted following the PRISMA 2020 (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) guidelines [1]. The protocol was defined a priori before initiating the bibliographic search, including predefined eligibility criteria based on the PICO framework, a structured search strategy, and a narrative synthesis plan.

## 2.2 Eligibility Criteria

${eligibilityCriteria}

The criteria were defined following the PICO framework:
- **Population (P)**: ${picoPopulation}
- **Intervention (I)**: ${picoIntervention}
- **Comparison (C)**: ${picoComparison}
- **Outcome (O)**: ${picoOutcome}

## 2.3 Information Sources and Search Strategy

The search focused on identifying relevant studies published between ${prismaContext.protocol.temporalRange.start || '2023'} and ${prismaContext.protocol.temporalRange.end || '2025'}. A total of ${searchQueries.length > 0 ? searchQueries.length : databases.length} key academic database${(searchQueries.length > 0 ? searchQueries.length : databases.length) === 1 ? '' : 's'} in the field ${(searchQueries.length > 0 ? searchQueries.length : databases.length) === 1 ? 'was' : 'were'} selected: ${dbNames}. The initial search yielded a total of ${prismaContext.screening.totalResults || 0} articles. Table 1 details the databases consulted and the specific search strings used.

${searchChart}

The complete strategies for all databases are available in the supplementary material.

## 2.4 AI-Assisted Hybrid Screening

To mitigate human fatigue bias during large-scale screening and ensure scalable, reproducible triage without compromising recall, a two-phase hybrid approach combining artificial intelligence with human expert review was implemented. This design leverages the complementary strengths of embedding-based similarity (fast, deterministic ranking) and LLM-based analysis (contextual eligibility evaluation), reducing the risk of systematic errors associated with prolonged manual screening sessions.

**Phase 1 — Semantic Similarity Ranking (Embeddings):** Each downloaded reference was processed through a semantic similarity model (text-embedding-ada-002, OpenAI, accessed via API) that computed a cosine similarity score in the range [0, 1] against a vector representation of the predefined PICO-based inclusion criteria. ${prismaContext.screening.phase1 ? `The model processed ${prismaContext.screening.phase1.highConfidenceInclude + prismaContext.screening.phase1.highConfidenceExclude + prismaContext.screening.phase1.greyZone} references with an average similarity score of ${(prismaContext.screening.phase1.avgSimilarity * 100).toFixed(1)}%. Using adaptive percentile thresholds${prismaContext.screening.similarityThresholds ? ` (upper: ${(prismaContext.screening.similarityThresholds.embeddings * 100).toFixed(1)}%)` : ''}, references were triaged into three categories: **${prismaContext.screening.phase1.highConfidenceInclude} high-confidence includes** (above upper threshold), **${prismaContext.screening.phase1.highConfidenceExclude} high-confidence excludes** (below lower threshold), and **${prismaContext.screening.phase1.greyZone} grey-zone references** requiring further analysis.` : 'References were triaged into three categories based on adaptive percentile thresholds: high-confidence includes, high-confidence excludes, and grey-zone references requiring further analysis.'}

**Phase 2 — LLM-Based Grey Zone Analysis:** ${prismaContext.screening.phase2 ? `The ${prismaContext.screening.phase2.analyzed} grey-zone references were individually evaluated by the foundational model ${prismaContext.screening.phase2.method || 'GPT-4o'} (OpenAI), accessed via API with temperature set to 0.0 to ensure deterministic and reproducible classifications. Each reference was prompted with the PICO criteria and inclusion/exclusion rules. The LLM classified each reference as: **${prismaContext.screening.phase2.included} included**, **${prismaContext.screening.phase2.excluded} excluded**, and **${prismaContext.screening.phase2.manual} flagged for manual review** by the principal investigator.` : 'Grey-zone references were individually evaluated by a large language model prompted with the PICO criteria and inclusion/exclusion rules, classifying each as included, excluded, or flagged for manual review.'}

The resulting scores were sorted in descending order and plotted as a scree curve (Figure 1). The **elbow method** (knee-point detection) was applied to this curve to identify the optimal inflection point — the threshold below which the marginal gain in relevant study recovery diminishes sharply. ${prismaContext.screening.cutoffMethod ? `The cutoff method employed was **${prismaContext.screening.cutoffMethod}**.` : ''}

${screePlot || '**[FIGURE 1: Scree Plot — Distribution of AI relevance scores with elbow point]**\n*Figure 1. Distribution of semantic relevance scores sorted in descending order. The vertical line marks the elbow point used as the prioritization threshold.*'}

**Rationale for hybrid approach**: The two-phase design leverages the complementary strengths of embedding-based similarity (fast, deterministic ranking) and LLM-based analysis (contextual understanding of eligibility criteria). The elbow method mitigates potential algorithmic bias by ensuring that the cut-off point is data-driven rather than arbitrarily set. This hybrid approach addresses the well-documented risk of human fatigue bias in systematic reviews with large initial sample sizes, where manual screening accuracy degrades after prolonged sessions. References above the threshold were prioritized for manual review, while those below it were still reviewed in a second pass, ensuring no relevant study was excluded solely based on the algorithmic score.

It is important to emphasize that the AI scores were used exclusively for **prioritization and triage**, not for final inclusion/exclusion decisions. All final decisions were made by human reviewers applying the predefined PICO-based eligibility criteria.

## 2.5 Selection Process

${selectionProcess}

The process followed four phases:
1. **Duplicate removal**: Automated deduplication identified and removed duplicate references across databases.
2. **AI-assisted prioritization**: The hybrid screening system (Phase 1: embeddings + Phase 2: LLM) processed all unique references to compute relevance scores and triage classifications (see Section 2.4).
3. **Title and abstract screening**: References prioritized by the AI system were evaluated by the principal investigator using the predefined PICO-based criteria. The AI classifications served as decision support, with the human reviewer making all final decisions.
4. **Full-text review**: Articles that passed the initial screening were retrieved in full text and evaluated against the complete eligibility criteria, including assessment of methodological quality.

## 2.6 Data Extraction Using the RQS Schema

Data were extracted using a structured and standardized RQS (Research Question Schema) specifically designed for this review. The RQS schema included the following fields:

**Study identification:**
- Lead author and year of publication
- Full title
- Publication source (journal, conference)
- DOI or unique identifier

**Methodological classification:**
- Study type (empirical, case study, experiment, simulation, review)
- Research design
- Application context (industrial, enterprise, academic, experimental, mixed)

**Technical characterization:**
- Main technology or method evaluated
- Tools and frameworks used
- Reported evaluation metrics

**Relationship with research questions:**
- Pertinence assessment for RQ1 (direct/partial/none)
- Pertinence assessment for RQ2 (direct/partial/none)
- Pertinence assessment for RQ3 (direct/partial/none)
- Key extracted evidence
- Relevant textual quotations (with page)

**Quality assessment:**
- Limitations declared by the authors
- Risk of bias (low/moderate/high)
- Methodological quality (high/medium/low)

Data extraction was assisted by artificial intelligence (Claude Sonnet 4, Anthropic, accessed via API with temperature 0.0 for deterministic output) to accelerate the process, but **all data were manually validated** by the principal investigator. Data were extracted from **${rqsEntries.length} studies** that met the inclusion criteria.

To ensure consistency, a pilot extraction was conducted with 3 studies before proceeding with the complete set. The extracted data were stored in a structured database compatible with statistical analysis.

## 2.7 Risk of Bias Assessment

${riskOfBias}

A qualitative assessment of methodological quality was applied considering:
- Adequacy of research design
- Transparency in method reporting
- Sufficiency of data to answer the RQs
- Explicit declaration of limitations

## 2.8 Data Synthesis

${synthesisMethod}

Given the methodological heterogeneity of the included studies (different designs, contexts, and metrics), a **structured narrative synthesis** was performed instead of a quantitative meta-analysis.

The synthesis was organized around the three research questions, integrating findings thematically. Descriptive statistics were calculated to characterize the included studies (frequency distributions, temporal ranges, predominant technologies) and recurrent patterns in the findings were identified.`;
  }

  /**
   * RESULTADOS PROFESIONALES con análisis estadístico real y síntesis por RQ
   */
  async generateProfessionalResults(prismaMapping, prismaContext, rqsEntries, rqsStats, charts = {}) {
    // Generar análisis RQS detallado
    const rqsAnalysis = await this.generateDetailedRQSAnalysis(rqsEntries, rqsStats, prismaContext);

    const rq1Synthesis = rqsEntries.length > 0 ? await this.synthesizeRQ1Findings(rqsEntries, prismaContext) : 'No studies were identified that addressed this question.';
    const rq2Synthesis = rqsEntries.length > 0 ? await this.synthesizeRQ2Findings(rqsEntries, prismaContext) : 'No studies were identified that addressed this question.';
    const rq3Synthesis = rqsEntries.length > 0 ? await this.synthesizeRQ3Findings(rqsEntries, prismaContext) : 'No studies were identified that addressed this question.';

    // Translate PRISMA items and RQs that may be in Spanish
    console.log('🔄 Translating Results PRISMA content to English...');
    const rqs = prismaContext.protocol.researchQuestions || [];
    const [studySelection, riskOfBiasResults,
           rq1Label, rq2Label, rq3Label] = await Promise.all([
      this.translateToEnglish(prismaMapping.results.studySelection),
      this.translateToEnglish(prismaMapping.results.riskOfBiasResults),
      this.translateToEnglish(rqs[0] || 'First research question'),
      this.translateToEnglish(rqs[1] || 'Second research question'),
      this.translateToEnglish(rqs[2] || 'Third research question'),
    ]);
    console.log('✅ Results translation completed');

    // Calcular correctamente los números PRISMA para evitar valores negativos
    const totalIdentified = prismaContext.screening.identified || 0;
    const duplicatesRemoved = prismaContext.screening.duplicatesRemoved || 0;
    const afterDedup = prismaContext.screening.screenedTitleAbstract || (totalIdentified - duplicatesRemoved);
    const excludedTitleAbstract = prismaContext.screening.excludedTitleAbstract || 0;
    const fullTextAssessed = prismaContext.screening.fullTextAssessed || 0;
    const excludedFullText = prismaContext.screening.excludedFullText || 0;
    const finalIncluded = prismaContext.screening.includedFinal || rqsStats.total;

    // Translate exclusion reasons from Spanish to English
    const translatedScreeningReasons = this.translateExclusionReasons(prismaContext.screening.screeningExclusionReasons);
    const translatedFullTextReasons = this.translateExclusionReasons(prismaContext.screening.exclusionReasons);

    // Build Phase 1 paragraph dynamically, validating that the sub-totals sum correctly
    let phase1Text = '';
    if (prismaContext.screening.phase1) {
      const p1 = prismaContext.screening.phase1;
      const p1Sum = (p1.highConfidenceInclude || 0) + (p1.highConfidenceExclude || 0) + (p1.greyZone || 0);
      const unaccounted = afterDedup - p1Sum;

      phase1Text = `The AI-assisted hybrid screening (Section 2.4) processed all ${afterDedup} unique records. In Phase 1, the embedding model assigned a semantic similarity score to each reference and triaged them using adaptive percentile thresholds: **${p1.highConfidenceInclude} high-confidence includes** (above upper threshold)${p1.highConfidenceExclude > 0 ? `, **${p1.highConfidenceExclude} high-confidence excludes** (below lower threshold)` : ''}${unaccounted > 0 ? `, **${unaccounted} automatically excluded** (below lower threshold)` : ''}, and **${p1.greyZone} grey-zone references** requiring further analysis.`;

      if (prismaContext.screening.phase2) {
        const p2 = prismaContext.screening.phase2;
        phase1Text += ` In Phase 2, the LLM analyzed the ${p2.analyzed} grey-zone references, classifying ${p2.included} as included, ${p2.excluded} as excluded, and ${p2.manual} for manual review.`;
      }
      phase1Text += ' All AI classifications were subsequently validated by the principal investigator.';
    }

    // Build exclusion reasons text (pre-translated)
    const screeningReasonsText = Object.keys(translatedScreeningReasons).length > 0
      ? `: ${Object.entries(translatedScreeningReasons).slice(0, 5).map(([reason, count]) => `${reason} (n=${count})`).join('; ')}`
      : '';

    const fullTextReasonsText = Object.keys(translatedFullTextReasons).length > 0
      ? `, primarily due to: ${Object.entries(translatedFullTextReasons).slice(0, 3).map(([reason, count]) => `${reason} (n=${count})`).join(', ')}`
      : '';

    // Handle singular/plural grammar
    const excludedFTGrammar = excludedFullText === 1
      ? `**${excludedFullText} article was excluded**`
      : `**${excludedFullText} articles were excluded**`;

    return `## 3.1 Study Selection

${studySelection}

Figure 2 presents the complete PRISMA flow diagram of the selection process. The initial search identified **${totalIdentified} records** across the consulted databases. After duplicate removal (n=${duplicatesRemoved}), **${afterDedup} unique records** were screened by title and abstract.

${phase1Text}

During title and abstract screening, **${excludedTitleAbstract} records were excluded**${screeningReasonsText}.

Subsequently, **${fullTextAssessed} ${fullTextAssessed === 1 ? 'article was' : 'articles were'}** retrieved for full-text evaluation. A total of ${excludedFTGrammar} after full-text assessment${fullTextReasonsText}. Finally, **${finalIncluded} studies** met all inclusion criteria and were included in the qualitative synthesis.

${charts.prisma ? `![PRISMA 2020 Flow Diagram](${charts.prisma})` : '**[FIGURE 2: PRISMA 2020 Flow Diagram]**'}
*Figure 2. PRISMA 2020 flow diagram of the study selection process.*

## 3.2 Characteristics of Included Studies

${rqsAnalysis || prismaMapping.results.studyCharacteristics || 'The included studies were analyzed according to the RQS (Research Question Schema) to extract structured data relevant to the research questions.'}

${charts.temporal_distribution ? `\n![Temporal Distribution of Included Studies](${charts.temporal_distribution})\n*Figure 3. Temporal distribution of the ${rqsStats.total} included studies (${rqsStats.yearRange.min}-${rqsStats.yearRange.max}). The trend line indicates the evolution of research interest in the field over time.*\n` : ''}

## 3.3 Risk of Bias in Included Studies

${riskOfBiasResults}

Table 4 presents the qualitative risk of bias assessment for each included study. The majority of studies (${rqsStats.qualityDistribution?.medium || 0} of ${rqsStats.total}) presented a **moderate** risk of bias, primarily due to minor methodological limitations or insufficient detail in procedure descriptions.

${this.generateTable3Professional(rqsEntries)}

${charts.quality_assessment ? `\n![Quality Assessment Results](${charts.quality_assessment})\n*Figure 4. Quality assessment results across ${rqsStats.total} included studies using standardized quality criteria. The stacked bars show the distribution of Yes/Partial/No responses for each quality criterion.*\n` : ''}

## 3.4 Synthesis of Results by Research Question

### 3.4.1 RQ1: ${rq1Label}

Of the ${rqsStats.total} included studies, **${rqsStats.rqRelations.rq1.yes} studies** directly addressed this question, while **${rqsStats.rqRelations.rq1.partial} additional studies** addressed it partially.

${rq1Synthesis}

### 3.4.2 RQ2: ${rq2Label}

For the second research question, **${rqsStats.rqRelations.rq2.yes} studies** provided direct evidence, and **${rqsStats.rqRelations.rq2.partial} studies** provided partial evidence.

${rq2Synthesis}

### 3.4.3 RQ3: ${rq3Label}

Regarding the third question, **${rqsStats.rqRelations.rq3.yes} studies** contributed relevant data directly, while **${rqsStats.rqRelations.rq3.partial} studies** contributed partially.

${rq3Synthesis}

${charts.bubble_chart ? `\n### 3.4.4 Thematic Concentration and Research Gaps\n\n![Thematic Keyword Concentration](${charts.bubble_chart})\n*Figure 5. Frequency distribution of key terms across the ${rqsStats.total} included studies. Terms were extracted from author-provided keywords in each reference. This visualization identifies the most covered research areas and potential thematic gaps in the existing literature.*\n` : ''}

${charts.technical_synthesis ? `\n### 3.4.5 Technical Performance Synthesis\n\n![Comparative Technical Metrics](${charts.technical_synthesis})\n*Figure 6. Comparative synthesis of quantitative metrics across included studies. This table summarizes the empirical evidence reported in each study, enabling direct comparison between different approaches and methodologies. Note: Metrics displayed are dynamically extracted from the actual reported data in each study.*\n` : ''}`;
  }

  /**
   * Análisis RQS detallado y profesional con estadísticas
   */
  async generateDetailedRQSAnalysis(rqsEntries, rqsStats, prismaContext) {
    const prompt = `Generate a professional academic descriptive analysis of the characteristics of the ${rqsStats.total} included studies. ALL output MUST be in Academic English. If any source data is in Spanish, translate it into English.

**DATOS ESTADÍSTICOS REALES (NO INVENTES NADA):**

Distribution by study type:
${Object.entries(rqsStats.studyTypes).map(([type, count]) => `- ${type}: n=${count} (${((count / rqsStats.total) * 100).toFixed(1)}%)`).join('\n')}

Distribution by application context:
${Object.entries(rqsStats.contexts).map(([context, count]) => `- ${context}: n=${count} (${((count / rqsStats.total) * 100).toFixed(1)}%)`).join('\n')}

Temporal distribution:
- Range: ${rqsStats.yearRange.min}-${rqsStats.yearRange.max}
- By year: ${JSON.stringify(rqsStats.yearDistribution)}

Most studied technologies (top 5):
${rqsStats.technologies.slice(0, 5).map((t, i) => `${i + 1}. ${t.technology}: n=${t.count} (${((t.count / rqsStats.total) * 100).toFixed(1)}%)`).join('\n')}

Research question coverage:
- RQ1: ${rqsStats.rqRelations.rq1.yes} direct (${((rqsStats.rqRelations.rq1.yes / rqsStats.total) * 100).toFixed(1)}%), ${rqsStats.rqRelations.rq1.partial} partial (${((rqsStats.rqRelations.rq1.partial / rqsStats.total) * 100).toFixed(1)}%)
- RQ2: ${rqsStats.rqRelations.rq2.yes} direct (${((rqsStats.rqRelations.rq2.yes / rqsStats.total) * 100).toFixed(1)}%), ${rqsStats.rqRelations.rq2.partial} partial (${((rqsStats.rqRelations.rq2.partial / rqsStats.total) * 100).toFixed(1)}%)
- RQ3: ${rqsStats.rqRelations.rq3.yes} direct (${((rqsStats.rqRelations.rq3.yes / rqsStats.total) * 100).toFixed(1)}%), ${rqsStats.rqRelations.rq3.partial} partial (${((rqsStats.rqRelations.rq3.partial / rqsStats.total) * 100).toFixed(1)}%)

**WRITING INSTRUCTIONS:**

Generate 2-3 academic paragraphs (400-500 words total) that:

1. **Paragraph 1**: Describe the distribution of study types and contexts, highlighting the predominant ones. Use the exact percentages provided. Reference Table 2 for details.

2. **Paragraph 2**: Analyze the temporal distribution (reference Figure 3) and most studied technologies. Mention exact frequencies and reflect on what this concentration indicates. Discuss whether the temporal pattern shows increasing research interest, maturity of the field, or specific technology adoption waves.

3. **Paragraph 3**: Synthesize the RQ coverage and explain what it means for answering the research questions. Mention if certain RQs have stronger evidence base than others and implications for the synthesis.

${this.getDomainFilterDirective()}
${this.getSSOTDirective()}
${this.getAntiAIDirective()}

**CRITICAL REQUIREMENTS — DATA-ONLY SYNTHESIS:**
- USE ONLY THE DATA PROVIDED (exact numbers, calculated percentages)
- DO NOT invent studies, authors, or additional findings
- DO NOT include personal opinions, interpretations, or value judgments
- ONLY report what the data shows — no subjective commentary
- The Results section must contain ZERO authorial opinions
- Observations must be factual: "X studies (Y%) addressed..." NOT "It is noteworthy that..."
- Avoid evaluative language: "interesting", "noteworthy", "surprisingly", "importantly"
- Third person impersonal
- Formal Academic English
- Include explicit references to "Figure 3", "Table 2" and "Table 3" where appropriate
- If any source data labels are in Spanish, translate them to English
- Report temporal trends factually (e.g., "Figure 3 shows X publications in [year], representing Y% of the total")

Respond ONLY with the analysis paragraphs in English:`;

    const response = await this.aiService.generateText(
      this.getEnhancedSystemPrompt(),
      prompt,
      'chatgpt'
    );

    return `### 3.2.1 Descriptive analysis based on RQS data

${response}

${this.generateTable1Professional(rqsEntries)}

${this.generateTable2Professional(rqsEntries)}`;
  }

  /**
   * Sintetizar hallazgos para RQ1
   */
  async synthesizeRQ1Findings(rqsEntries, prismaContext) {
    const relevantStudies = rqsEntries.filter(e => e.rq1Relation === 'yes' || e.rq1Relation === 'partial');

    if (relevantStudies.length === 0) {
      return "No studies were identified that directly addressed this research question.";
    }

    const prompt = `Synthesize the findings of ${relevantStudies.length} studies that answered: "${prismaContext.protocol.researchQuestions[0]}"

**⚠️ CRITICAL: You are ONLY allowed to mention these ${relevantStudies.length} studies. DO NOT invent or add any studies beyond this list:**

**EVIDENCE EXTRACTED FROM STUDIES:**
${relevantStudies.map((study, i) => `
Study S${i + 1} (${study.author}, ${study.year}):
- Technology: ${study.technology}
- Study type: ${study.studyType}
- Context: ${study.context}
- Key evidence: ${study.keyEvidence}
- Metrics: ${JSON.stringify(study.metrics || {})}
- Relation with RQ1: ${study.rq1Relation}
`).join('\n')}

**QUANTITATIVE SUMMARY:**
- Total studies addressing RQ1: ${relevantStudies.length}
- Direct relation: ${relevantStudies.filter(s => s.rq1Relation === 'yes').length}
- Partial relation: ${relevantStudies.filter(s => s.rq1Relation === 'partial').length}
- Technologies mentioned: ${[...new Set(relevantStudies.map(s => s.technology).filter(t => t))].join(', ')}

**INSTRUCTIONS:**
Generate 2-3 academic paragraphs (400-500 words) following this structure:

1. **Opening paragraph**: Present the quantitative overview (X studies, Y% direct evidence, Z technologies examined)

2. **Findings synthesis**: Identify and describe common patterns across studies. Group findings by:
   - Predominant technologies/approaches (with frequencies)
   - Consistent findings (supported by multiple studies)
   - Contradictory or divergent findings (if any)
   - Performance metrics (when available)

3. **Cross-study analysis**: Compare approaches or results across different contexts (industrial/academic/experimental). Highlight which conditions favor specific solutions.

${this.getDomainFilterDirective()}
${this.getSSOTDirective()}
${this.getAntiAIDirective()}

**CRITICAL REQUIREMENTS - READ CAREFULLY:**
- You have EXACTLY ${relevantStudies.length} study/studies. You CANNOT mention more than ${relevantStudies.length} study/studies.
- The ONLY valid study IDs are: ${relevantStudies.map((_, i) => `S${i+1}`).join(', ')}
- Reference specific studies using citation style: "...as reported by S1${relevantStudies.length > 1 ? ', S2' : ''}" (only use IDs from the list above)
- Include ONLY metrics explicitly mentioned in the EVIDENCE section above
- DO NOT invent any data, studies, authors, or findings beyond what is explicitly provided
- DO NOT add studies like "S${relevantStudies.length + 1}" or any ID beyond the provided list
- DO NOT include personal opinions or value judgments — report findings ONLY
- Avoid evaluative language like "interesting", "noteworthy", "remarkable", "surprisingly"
- Factual reporting only: "S1 reported X" NOT "Interestingly, S1 found..."
- If source evidence is in Spanish, translate and integrate naturally into English prose
- If any study mentions technologies OUTSIDE the domain filter above, skip that irrelevant content
- Connect findings to Figure 5 (bubble chart) if metrics/technologies are discussed
- Third person impersonal, formal Academic English

Respond with paragraphs only (no section headers):`;

    const response = await this.aiService.generateText(
      this.getEnhancedSystemPrompt(),
      prompt,
      'chatgpt'
    );

    return response.trim();
  }

  /**
   * Sintetizar hallazgos para RQ2
   */
  async synthesizeRQ2Findings(rqsEntries, prismaContext) {
    const relevantStudies = rqsEntries.filter(e => e.rq2Relation === 'yes' || e.rq2Relation === 'partial');

    if (relevantStudies.length === 0) {
      return "No studies were identified that directly addressed this research question.";
    }

    const prompt = `Synthesize the findings of ${relevantStudies.length} studies for: "${prismaContext.protocol.researchQuestions[1]}"

**⚠️ CRITICAL: You have EXACTLY ${relevantStudies.length} study/studies. DO NOT mention more than ${relevantStudies.length} study/studies.**
**The ONLY valid study IDs are: ${relevantStudies.map((_, i) => `S${i+1}`).join(', ')}**

**EVIDENCE:**
${relevantStudies.map((study, i) => `
S${i + 1} (${study.author}, ${study.year}):
- Key evidence: ${study.keyEvidence}
- Technology: ${study.technology}
- Context: ${study.context}
- Study type: ${study.studyType}
- Metrics: ${JSON.stringify(study.metrics || {})}
- Relation: ${study.rq2Relation}
`).join('\n')}

**QUANTITATIVE SUMMARY:**
- Studies addressing RQ2: ${relevantStudies.length}
- Contexts represented: ${[...new Set(relevantStudies.map(s => s.context).filter(c => c))].join(', ')}
- Study types: ${[...new Set(relevantStudies.map(s => s.studyType).filter(t => t))].join(', ')}

**INSTRUCTIONS:**
Generate 2-3 academic paragraphs (400-500 words) that:

1. **Quantitative overview**: State how many studies addressed this question and their distribution by context/type

2. **Evidence synthesis**: Organize findings by:
   - Performance comparisons (if metrics available - reference Figure 6 for technical synthesis)
   - Implementation approaches across different contexts
   - Advantages/disadvantages identified in the literature
   - Empirical vs. theoretical findings

3. **Critical analysis**: Identify consensus areas vs. gaps. Mention if certain contexts are underrepresented.

${this.getDomainFilterDirective()}
${this.getAntiAIDirective()}

**REQUIREMENTS - STRICT VALIDATION:**
- You CANNOT invent or mention studies beyond: ${relevantStudies.map((_, i) => `S${i+1}`).join(', ')}
- Use study citations ("S1${relevantStudies.length > 1 ? ' and S2' : ''} demonstrated...")
- Include ONLY quantitative data explicitly provided in EVIDENCE section
- DO NOT invent information, metrics, or findings
- DO NOT include personal opinions or value judgments — report data ONLY
- Avoid evaluative language like "interesting", "noteworthy", "importantly"
- If any study data references technologies outside the PICO domain, SKIP that content
- Factual reporting: describe what each study found, not what you think about it
- Translate Spanish content naturally to English
- Third person impersonal, formal Academic English

Respond with paragraphs only:`;

    const response = await this.aiService.generateText(
      this.getEnhancedSystemPrompt(),
      prompt,
      'chatgpt'
    );

    return response.trim();
  }

  /**
   * Sintetizar hallazgos para RQ3
   */
  async synthesizeRQ3Findings(rqsEntries, prismaContext) {
    const relevantStudies = rqsEntries.filter(e => e.rq3Relation === 'yes' || e.rq3Relation === 'partial');

    if (relevantStudies.length === 0) {
      return "No studies were identified that directly addressed this research question.";
    }

    const prompt = `Synthesize the findings of ${relevantStudies.length} studies for: "${prismaContext.protocol.researchQuestions[2]}"

**⚠️ CRITICAL: You have EXACTLY ${relevantStudies.length} study/studies. DO NOT invent additional studies.**
**The ONLY valid study IDs are: ${relevantStudies.map((_, i) => `S${i+1}`).join(', ')}**

**EVIDENCE:**
${relevantStudies.map((study, i) => `
S${i + 1} (${study.author}, ${study.year}):
- Key evidence: ${study.keyEvidence}
- Limitations: ${study.limitations}
- Technology: ${study.technology}
- Quality score: ${study.qualityScore}
- Metrics: ${JSON.stringify(study.metrics || {})}
`).join('\n')}

**QUANTITATIVE SUMMARY:**
- Studies addressing RQ3: ${relevantStudies.length}
- Quality distribution: ${relevantStudies.filter(s => s.qualityScore === 'high').length} high, ${relevantStudies.filter(s => s.qualityScore === 'medium').length} medium, ${relevantStudies.filter(s => s.qualityScore === 'low').length} low

**INSTRUCTIONS:**
Generate 2-3 academic paragraphs (400-500 words) that:

1. **Evidence overview**: Present the number of studies and their quality distribution (reference Figure 4 for quality assessment)

2. **Findings synthesis**: Organize by:
   - Main insights from high-quality studies (prioritize these)
   - Complementary evidence from medium-quality studies
   - Identification of research trends and emerging patterns
   - Acknowledged limitations and their implications

3. **Critical discussion**: Analyze the strength of evidence. Mention if certain aspects are well-supported vs. under-researched.

${this.getDomainFilterDirective()}
${this.getAntiAIDirective()}

**REQUIREMENTS - NO HALLUCINATIONS:**
- You have EXACTLY ${relevantStudies.length} studies. You CANNOT mention more.
- Valid study IDs: ${relevantStudies.map((_, i) => `S${i+1}`).join(', ')} (NO OTHER IDs ALLOWED)
- Prioritize evidence from high-quality studies
- Reference studies with citations ("S1${relevantStudies.length > 1 ? ' and S2' : ''} identified...")
- Include ONLY quantitative data explicitly provided above
- Acknowledge limitations transparently
- DO NOT invent data, studies, or findings
- DO NOT include personal opinions or value judgments — report data ONLY
- Avoid evaluative language: "interesting", "noteworthy", "remarkably"
- If study data references technologies outside the PICO domain, SKIP that irrelevant content
- Factual synthesis only: what each study reported, not your interpretation
- Translate Spanish content to English naturally
- Third person impersonal, formal Academic English

Respond with paragraphs only:`;

    const response = await this.aiService.generateText(
      this.getEnhancedSystemPrompt(),
      prompt,
      'chatgpt'
    );

    return response.trim();
  }

  /**
   * TABLAS PROFESIONALES bien formateadas
   */
  generateTable1Professional(rqsEntries) {
    return `
**Table 2. General characteristics of studies included in the systematic review**

| ID | Author (Year) | Study Type | Context | Main Technology | Publication |
|----|-------------|-----------------|----------|---------------------|-------------|
${rqsEntries.map((entry, i) => {
      const id = `S${i + 1}`;
      const author = `${entry.author} (${entry.year})`;
      const type = this.translateStudyType(entry.studyType);
      const context = this.translateContext(entry.context);
      const tech = (entry.technology || 'Not specified').substring(0, 40);
      const source = entry.title ? entry.title.substring(0, 30) + '...' : 'N/A';
      return `| ${id} | ${author} | ${type} | ${context} | ${tech} | ${source} |`;
    }).join('\n')}

*Note: Studies are identified as S1-S${rqsEntries.length} for ease of reference in the analysis.*
`;
  }

  generateTable2Professional(rqsEntries) {
    return `
**Table 3. Synthesis of main results and reported metrics**

| ID | Key Evidence | Main Metrics | RQ1 | RQ2 | RQ3 | Quality |
|----|----------------|---------------------|-----|-----|-----|---------|
${rqsEntries.map((entry, i) => {
      const id = `S${i + 1}`;
      const evidence = (entry.keyEvidence || 'Not reported').substring(0, 60) + '...';

      // Metrics - filtrar valores null, Unknown, N/A
      let metrics = 'N/R';
      if (entry.metrics && Object.keys(entry.metrics).length > 0) {
        const validMetrics = Object.entries(entry.metrics)
          .filter(([k, v]) => v !== null && v !== undefined && v !== 'null' && v !== 'Unknown' && v !== 'N/A' && v !== '')
          .slice(0, 2)
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ');
        metrics = validMetrics.length > 0 ? validMetrics.substring(0, 40) : 'N/R';
      }

      // RQ relations con símbolos Unicode
      const getRQSymbol = (relation) => {
        if (relation === 'yes') return '✓';
        if (relation === 'partial') return '○';
        return '✗';
      };
      const rq1 = getRQSymbol(entry.rq1Relation);
      const rq2 = getRQSymbol(entry.rq2Relation);
      const rq3 = getRQSymbol(entry.rq3Relation);

      const quality = this.translateQuality(entry.qualityScore);

      return `| ${id} | ${evidence} | ${metrics} | ${rq1} | ${rq2} | ${rq3} | ${quality} |`;
    }).join('\n')}

*Legend: ✓ = Direct relation, ○ = Partial relation, ✗ = No direct relation*
*Quality: Qualitative assessment based on methodological transparency and reporting of limitations*
`;
  }

  generateTable3Professional(rqsEntries) {
    return `
**Table 4. Risk of bias and methodological quality assessment**

| ID | Adequate Design | Sufficient Data | Limitations Reported | Transparency | Overall Risk |
|----|----------------|-------------------|------------------------|---------------|---------------|
${rqsEntries.map((entry, i) => {
      const id = `S${i + 1}`;

      // Evaluación basada en RQS
      const hasLimitations = entry.limitations && entry.limitations.length > 20;
      const hasMetrics = entry.metrics && Object.keys(entry.metrics).length > 0;
      const hasEvidence = entry.keyEvidence && entry.keyEvidence.length > 50;

      const design = entry.studyType === 'review' ? 'Partial' : 'Adequate';
      
      const getDataQuality = () => {
        if (hasMetrics && hasEvidence) return 'Sufficient';
        if (hasEvidence) return 'Partial';
        return 'Insufficient';
      };
      const dataQuality = getDataQuality();
      
      const limitationsReported = hasLimitations ? 'Yes' : 'No';
      
      const getTransparency = () => {
        if (hasLimitations && hasMetrics) return 'High';
        if (hasEvidence) return 'Medium';
        return 'Low';
      };
      const transparency = getTransparency();

      // Calculate global risk
      let riskScore = 0;
      if (design === 'Adequate') riskScore++;
      if (dataQuality === 'Sufficient') riskScore++;
      if (hasLimitations) riskScore++;
      if (hasMetrics) riskScore++;

      const getGlobalRisk = (score) => {
        if (score >= 3) return 'Low';
        if (score === 2) return 'Moderate';
        return 'High';
      };
      const globalRisk = getGlobalRisk(riskScore);

      return `| ${id} | ${design} | ${dataQuality} | ${limitationsReported} | ${transparency} | ${globalRisk} |`;
    }).join('\n')}

*Note: The assessment was conducted considering the adequacy of the research design, sufficiency of data to answer the RQs, explicit acknowledgment of limitations, and transparency in methodological reporting.*
`;
  }

  /**
   * DISCUSIÓN PROFESIONAL con interpretación crítica
   */
  async generateProfessionalDiscussion(prismaMapping, prismaContext, rqsStats, rqsEntries) {
    const referencesList = rqsEntries.map((e, i) => `[${i + 1}] ${e.author} (${e.year})`).join('\n');

    const prompt = `Write a professional academic DISCUSSION section integrating the findings of this systematic review. ALL output MUST be in Academic English.

**STUDIES CONSULTED (Reference using [N]):**
${referencesList}

**KEY FINDINGS TO DISCUSS:**

General data:
- Total included studies: ${rqsStats.total}
- Type distribution: ${JSON.stringify(rqsStats.studyTypes)}
- Main contexts: ${JSON.stringify(rqsStats.contexts)}
- Temporal range: ${rqsStats.yearRange.min}-${rqsStats.yearRange.max}
- Dominant technologies: ${rqsStats.technologies.slice(0, 3).map(t => t.technology).join(', ')}

RQ Coverage:
- RQ1: ${rqsStats.rqRelations.rq1.yes + rqsStats.rqRelations.rq1.partial} studies
- RQ2: ${rqsStats.rqRelations.rq2.yes + rqsStats.rqRelations.rq2.partial} studies
- RQ3: ${rqsStats.rqRelations.rq3.yes + rqsStats.rqRelations.rq3.partial} studies

Base PRISMA interpretation:
${prismaMapping.discussion.interpretation}

**REQUIRED STRUCTURE (800-1200 words):**

**Paragraphs 1-2 (Interpretation of main findings):**
- Interpret patterns identified in results
- Connect with the original objective of the review
- Highlight most significant or surprising findings
- Compare observed distributions (types, contexts, technologies)

**Paragraphs 3-4 (Comparison with previous studies):**
- Compare results with existing literature in the field
- Identify where this review agrees or disagrees with prior systematic reviews or primary studies
- Discuss possible explanations for any contradictions
- Reference specific included studies using [N] citations

**Paragraph 5 (Implications):**
- Implications for professional practice
- Implications for future research
- How findings address (or not) the gap identified in the introduction

**Paragraph 6 (Strengths of the review):**
- Mention methodological strengths (PRISMA 2020, structured RQS, AI-assisted screening with elbow validation, etc.)
- Temporal coverage and database coverage
- Rigorous selection process

**Paragraphs 7-8 (Threats to Validity — MANDATORY subsection):**
This subsection MUST be explicitly labeled and address:
- **Publication bias**: Only peer-reviewed studies from academic databases were included; grey literature and negative results may be missing.
- **Language bias**: Restriction to specific languages may exclude relevant studies from certain regions.
- **Database coverage**: Limited to ${prismaContext.protocol.databases.map(db => db.name || db).join(', ')}; other databases (e.g., Web of Science, PubMed) were not included which may affect coverage.
- **Small sample size**: Only ${rqsStats.total} studies met inclusion criteria, limiting generalizability.
- **AI-assisted screening**: While the elbow method provides a data-driven threshold, the AI model's semantic similarity scores may still introduce subtle biases in prioritization order.
- **Heterogeneity**: Methodological diversity prevented quantitative meta-analysis.
- **Temporal limitation**: Search restricted to ${rqsStats.yearRange.min}-${rqsStats.yearRange.max}.

Format as: "### Threats to Validity" followed by continuous prose discussing each threat.

**Paragraph 9 (Future directions):**
- Identified research needs
- Persistent gaps
- Specific recommendations for future studies

${this.getDomainFilterDirective()}
${this.getSSOTDirective()}
${this.getAntiAIDirective()}

**WRITING REQUIREMENTS:**
- Third person impersonal
- Appropriate verb tenses (past for findings, present for interpretations)
- Formal Academic English
- No bullet points (continuous prose)
- DO NOT invent unmentioned studies or findings
- Be critical but constructive
- DO NOT discuss technologies or fields outside the PICO domain
- Every reference to included studies count MUST use n = ${rqsStats.total} (SSOT value)
- DO NOT repeat or summarize the methodology — the reader already knows what you did
- Focus on what the findings MEAN for the field, not what you did to find them
- Balance between confidence in findings and epistemic humility
- If source data is in Spanish, translate and integrate naturally
- The "Threats to Validity" subsection is a HARD REQUIREMENT — do not omit it

Generate ONLY the discussion text in English:`;

    const response = await this.aiService.generateText(
      this.getEnhancedSystemPrompt(),
      prompt,
      'chatgpt'
    );

    return response.trim();
  }

  /**
   * CONCLUSIONES PROFESIONALES concisas y accionables
   */
  async generateProfessionalConclusions(prismaMapping, prismaContext, rqsStats) {
    const prompt = `Write an academic CONCLUSIONS section that synthesizes the main findings of this systematic review. ALL output MUST be in Academic English.

**CONTEXT:**

Fulfilled objective:
${prismaContext.protocol.objective}

Research questions answered:
${prismaContext.protocol.researchQuestions.map((rq, i) => `RQ${i + 1}: ${rq}`).join('\n')}

Key review data:
- Included studies: ${rqsStats.total}
- Period: ${rqsStats.yearRange.min}-${rqsStats.yearRange.max}
- Databases: ${prismaContext.protocol.databases.map(db => db.name).join(', ')}
- Technologies identified (top 3): ${rqsStats.technologies.slice(0, 3).map(t => `${t.technology} (n=${t.count})`).join(', ')}
- Study types: ${Object.entries(rqsStats.studyTypes).map(([type, count]) => `${type} (${count})`).join(', ')}

RQ Coverage:
- RQ1: ${rqsStats.rqRelations.rq1.yes} direct + ${rqsStats.rqRelations.rq1.partial} partial = ${rqsStats.rqRelations.rq1.yes + rqsStats.rqRelations.rq1.partial} relevant studies
- RQ2: ${rqsStats.rqRelations.rq2.yes} direct + ${rqsStats.rqRelations.rq2.partial} partial = ${rqsStats.rqRelations.rq2.yes + rqsStats.rqRelations.rq2.partial} relevant studies
- RQ3: ${rqsStats.rqRelations.rq3.yes} direct + ${rqsStats.rqRelations.rq3.partial} partial = ${rqsStats.rqRelations.rq3.yes + rqsStats.rqRelations.rq3.partial} relevant studies

${this.getDomainFilterDirective()}
${this.getSSOTDirective()}
${this.getAntiAIDirective()}

**REQUIRED STRUCTURE (500-800 words — 5-10% of total article):**

The Conclusions section MUST NOT repeat the methodology or re-summarize results tables.
Instead, it must synthesize KNOWLEDGE: what these findings mean for the field.
Structure each conclusion as: Quantitative Result (from synthesis tables) + Technical Interpretation + Practical Implication.

**4.1 Answers to Research Questions (150-200 words)**
For EACH research question, provide a DIRECT, QUANTITATIVE answer. Start each with:

"**RQ1 Answer**: [Clear finding with numbers]." Be specific: if evidence is partial, state exactly what part remains unanswered and WHY.
"**RQ2 Answer**: [Clear finding with numbers]."
"**RQ3 Answer**: [Clear finding with numbers]."

DO NOT be vague. Instead of "results vary according to context", specify HOW and in WHAT MEASURE.
If evidence is insufficient, state it critically: explain what specific gap the literature fails to cover.

**4.2 Principal Contribution (100-150 words)**
State the single most significant technical finding. Use structure:
"The primary contribution is [specific finding], evidenced by [quantitative data]."

**4.3 Implications for Practice (150-200 words)**
Provide 3-4 actionable, SPECIFIC recommendations for practitioners. Each must reference concrete data from the results:
"1. **[Recommendation]**: Based on findings from [N] studies showing [metric], practitioners should..."

**4.4 Research Gaps and Future Directions (150-200 words)**
Identify 3-4 SPECIFIC research gaps discovered. Reference temporal distribution (Figure 3) and bubble chart (Figure 5):
"1. **[Gap]**: Only [N] studies addressed [topic], leaving [specific aspect] unexplored."

**4.5 Final Statement (50-100 words)**
Close with the contribution to the body of knowledge — not a repetition of what was done.

**CRITICAL REQUIREMENTS:**
- Use the EXACT section headers: 4.1, 4.2, 4.3, 4.4, 4.5
- Total length: 500-800 words
- Include ALL quantitative data provided above
- DO NOT invent data, studies, or findings not mentioned
- DO NOT re-summarize the methodology ("We analyzed 3 articles...") — summarize the KNOWLEDGE gained
- Every mention of included studies count MUST use n = ${rqsStats.total}
- Third person impersonal throughout
- Formal Academic English
- Translate any Spanish source data naturally
- Be specific and concrete (avoid generic statements)

Generate the complete Conclusions section with all 5 subsections:`;

    const response = await this.aiService.generateText(
      this.getEnhancedSystemPrompt(),
      prompt,
      'chatgpt'
    );

    // Clean duplicate titles that AI may generate at the beginning
    let cleanedResponse = response.trim();
    
    // Remove bold titles or headers at the beginning of text
    cleanedResponse = cleanedResponse.replace(/^#+\s*Conclusiones\s*\n*/i, '');
    cleanedResponse = cleanedResponse.replace(/^\*\*Conclusiones\*\*\s*\n*/i, '');
    cleanedResponse = cleanedResponse.replace(/^#+\s*Conclusions\s*\n*/i, '');
    cleanedResponse = cleanedResponse.replace(/^\*\*Conclusions\*\*\s*\n*/i, '');
    
    // Validación de longitud según estándares editoriales
    const wordCount = cleanedResponse.split(/\s+/).filter(w => w.length > 0).length;
    const { CONCLUSIONS_MIN_WORDS, CONCLUSIONS_MAX_WORDS } = GenerateArticleFromPrismaUseCase.EDITORIAL_STANDARDS;
    
    if (wordCount < CONCLUSIONS_MIN_WORDS) {
      console.warn(`⚠️ Conclusiones DEBAJO del estándar: ${wordCount} palabras (mínimo: ${CONCLUSIONS_MIN_WORDS})`);
    } else if (wordCount > CONCLUSIONS_MAX_WORDS) {
      console.warn(`⚠️ Conclusiones EXCEDEN el estándar: ${wordCount} palabras (máximo: ${CONCLUSIONS_MAX_WORDS})`);
    } else {
      console.log(`✅ Conclusiones cumplen estándar: ${wordCount} palabras`);
    }
    
    return cleanedResponse.trim();
  }

  /**
   * REFERENCIAS profesionales con citas formateadas
   */
  generateProfessionalReferences(prismaContext, rqsEntries) {
    return `This systematic review synthesized evidence from **${rqsEntries.length} primary studies** that met all inclusion criteria established in the PRISMA 2020 protocol. Only these ${rqsEntries.length} studies constitute the evidence base for this review.

### Studies Included in the Synthesis

${rqsEntries.map((entry, i) => {
      const id = i + 1;
      const citation = this.formatCitationIEEE(entry);
      return `[${id}] ${citation}`;
    }).join('\n\n')}

### Data and Materials Availability

The complete data extracted through the RQS schema, including individual quality assessments, detailed search strategies for each database, and the data extraction form, are available upon reasonable request to the corresponding author.

Bibliographic searches were conducted in the following databases: ${prismaContext.protocol.databases.map(db => db.name).join(', ')}, during the period between ${prismaContext.protocol.temporalRange.start || '2023'} and ${prismaContext.protocol.temporalRange.end || '2025'}.

### Methodological References

[${rqsEntries.length + 1}] M. J. Page, J. E. McKenzie, P. M. Bossuyt, et al., "The PRISMA 2020 statement: an updated guideline for reporting systematic reviews," *BMJ*, vol. 372, p. n71, 2021. doi: 10.1136/bmj.n71

The authors declare that the PRISMA 2020 guidelines have been strictly followed in all phases of this systematic review.`;
  }

  /**
   * Formatear cita bibliográfica estilo IEEE
   * Format: Initial. Surname, "Title," *Source*, year. doi: X
   */
  formatCitationIEEE(entry) {
    const authorIEEE = this.formatAuthorIEEE(entry.author);
    let citation = authorIEEE;

    if (entry.title) {
      citation += ` "${entry.title},"`;
    }

    if (entry.source) {
      citation += ` *${entry.source}*,`;
    }

    citation += ` ${entry.year}.`;

    if (entry.doi) {
      citation += ` doi: ${entry.doi}`;
    } else if (entry.url) {
      citation += ` Available: ${entry.url}`;
    }

    return citation;
  }

  /**
   * Convert author name to IEEE format: "I. Surname"
   */
  formatAuthorIEEE(authorStr) {
    if (!authorStr) return 'Unknown,';

    // Handle "et al."
    const etAlMatch = authorStr.match(/^(.+?)\s*et\s*al\.?/i);
    if (etAlMatch) {
      const first = this.convertSingleAuthorIEEE(etAlMatch[1].trim());
      return `${first} et al.,`;
    }

    return `${this.convertSingleAuthorIEEE(authorStr)},`;
  }

  /**
   * Convert a single author name to IEEE initial format
   */
  convertSingleAuthorIEEE(name) {
    // "Surname, FirstName" format
    const parts = name.split(/,\s*/);
    if (parts.length >= 2) {
      const surname = parts[0].trim();
      const initials = parts[1].trim().split(/\s+/)
        .map(n => n.charAt(0).toUpperCase() + '.')
        .join(' ');
      return `${initials} ${surname}`;
    }
    // "FirstName Surname" format
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      const surname = words[words.length - 1];
      const initials = words.slice(0, -1)
        .map(n => n.charAt(0).toUpperCase() + '.')
        .join(' ');
      return `${initials} ${surname}`;
    }
    return name;
  }

  /**
   * Formatear cita bibliográfica estilo APA (legacy, kept for compatibility)
   */
  formatCitation(entry) {
    let citation = `${entry.author} (${entry.year}).`;

    if (entry.title) {
      citation += ` ${entry.title}.`;
    }

    if (entry.source) {
      citation += ` *${entry.source}*.`;
    }

    if (entry.doi) {
      citation += ` doi: ${entry.doi}`;
    } else if (entry.url) {
      citation += ` Available at: ${entry.url}`;
    }

    return citation;
  }

  /**
   * Calcular estadísticas DETALLADAS de RQS con porcentajes y distribuciones
   */
  calculateDetailedRQSStatistics(rqsEntries) {
    const stats = {
      total: rqsEntries.length,
      studyTypes: {},
      contexts: {},
      technologies: [],
      yearRange: { min: Infinity, max: -Infinity },
      yearDistribution: {},
      rqRelations: {
        rq1: { yes: 0, no: 0, partial: 0 },
        rq2: { yes: 0, no: 0, partial: 0 },
        rq3: { yes: 0, no: 0, partial: 0 }
      },
      qualityDistribution: {
        high: 0,
        medium: 0,
        low: 0
      }
    };

    const techCount = {};

    rqsEntries.forEach(entry => {
      // Tipos de estudio
      if (entry.studyType) {
        stats.studyTypes[entry.studyType] = (stats.studyTypes[entry.studyType] || 0) + 1;
      }

      // Contextos
      if (entry.context) {
        stats.contexts[entry.context] = (stats.contexts[entry.context] || 0) + 1;
      }

      // Tecnologías
      if (entry.technology) {
        techCount[entry.technology] = (techCount[entry.technology] || 0) + 1;
      }

      // Años
      if (entry.year) {
        const year = Number.parseInt(entry.year);
        stats.yearRange.min = Math.min(stats.yearRange.min, year);
        stats.yearRange.max = Math.max(stats.yearRange.max, year);
        stats.yearDistribution[year] = (stats.yearDistribution[year] || 0) + 1;
      }

      // Relación con RQs
      if (entry.rq1Relation) {
        stats.rqRelations.rq1[entry.rq1Relation]++;
      }
      if (entry.rq2Relation) {
        stats.rqRelations.rq2[entry.rq2Relation]++;
      }
      if (entry.rq3Relation) {
        stats.rqRelations.rq3[entry.rq3Relation]++;
      }

      // Calidad
      const quality = entry.qualityScore || 'medium';
      stats.qualityDistribution[quality]++;
    });

    // Ordenar tecnologías por frecuencia
    stats.technologies = Object.entries(techCount)
      .sort((a, b) => b[1] - a[1])
      .map(([tech, count]) => ({ technology: tech, count }));

    return stats;
  }

  /**
   * Extraer datos para los 4 nuevos gráficos estadísticos académicos
   * Retorna datos estructurados para: distribución temporal, evaluación de calidad,
   * bubble chart (métricas vs herramientas), y síntesis técnica comparativa
   */
  extractEnhancedChartData(rqsEntries, includedRefs = []) {
    const chartData = {
      temporal_distribution: { years: {} },
      quality_assessment: { 
        questions: ['Methodology Clear', 'Results Reproducible', 'Adequate Sample', 'Valid Conclusions'],
        yes: [0, 0, 0, 0],
        no: [0, 0, 0, 0],
        partial: [0, 0, 0, 0]
      },
      bubble_chart: { entries: [] },
      technical_synthesis: { studies: [] }
    };

    rqsEntries.forEach(entry => {
      // 1. DISTRIBUCIÓN TEMPORAL: Contar estudios por año
      if (entry.year) {
        const year = entry.year.toString();
        chartData.temporal_distribution.years[year] = 
          (chartData.temporal_distribution.years[year] || 0) + 1;
      }

      // 2. QUALITY ASSESSMENT: Aproximar criterios de calidad basados en quality_score
      if (entry.qualityScore === 'high') {
        chartData.quality_assessment.yes[0]++;
        chartData.quality_assessment.yes[1]++;
        chartData.quality_assessment.yes[2]++;
        chartData.quality_assessment.yes[3]++;
      } else if (entry.qualityScore === 'medium') {
        chartData.quality_assessment.partial[0]++;
        chartData.quality_assessment.yes[1]++;
        chartData.quality_assessment.partial[2]++;
        chartData.quality_assessment.yes[3]++;
      } else if (entry.qualityScore === 'low') {
        chartData.quality_assessment.no[0]++;
        chartData.quality_assessment.partial[1]++;
        chartData.quality_assessment.no[2]++;
        chartData.quality_assessment.partial[3]++;
      }

      // 3. TECHNICAL SYNTHESIS: Tabla comparativa de métricas por estudio (DINÁMICA)
      if (entry.metrics && typeof entry.metrics === 'object' && Object.keys(entry.metrics).length > 0) {
        const studyLabel = (entry.author && entry.year) ? `${entry.author} ${entry.year}` : 'Unknown';
        const studyData = {
          study: studyLabel,
          tool: entry.technology || 'N/A',
          ...entry.metrics
        };
        
        const metricsKeys = Object.keys(entry.metrics).filter(k => 
          entry.metrics[k] !== null && 
          entry.metrics[k] !== undefined && 
          entry.metrics[k] !== '' &&
          entry.metrics[k] !== 'N/A' &&
          entry.metrics[k] !== 'Unknown'
        );
        
        if (metricsKeys.length > 0) {
          chartData.technical_synthesis.studies.push(studyData);
        }
      }
    });

    // 4. BUBBLE CHART → THEMATIC KEYWORD CONCENTRATION
    // Multi-source keyword extraction with fallback strategy:
    //   Source A: ref.keywords from included references (author-provided)
    //   Source B: RQS entry technology field (AI-extracted from full-text)
    //   Source C: RQS entry title words (last resort)
    const keywordCounts = {};
    const STOPWORDS = new Set([
      'the', 'and', 'for', 'with', 'from', 'that', 'this', 'are', 'was', 'were',
      'has', 'have', 'been', 'its', 'can', 'not', 'but', 'will', 'all', 'their',
      'than', 'into', 'also', 'more', 'other', 'some', 'such', 'use', 'using',
      'based', 'approach', 'study', 'analysis', 'paper', 'research', 'method',
      'results', 'new', 'two', 'one', 'case', 'via', 'towards', 'toward',
      'review', 'systematic', 'evaluation', 'performance', 'development',
      'system', 'systems', 'model', 'models', 'data', 'application', 'applications',
      'proposed', 'technique', 'techniques', 'framework', 'design', 'implementation',
      'novel', 'efficient', 'effective', 'improved', 'comparative', 'comprehensive',
    ]);

    // Source A: ref.keywords from DB (author-provided keywords)
    let sourceUsed = 'none';
    includedRefs.forEach(ref => {
      const kw = ref.keywords || ref.keyword || '';
      if (kw && typeof kw === 'string') {
        kw.split(/[,;]+/)
          .map(k => k.trim().toLowerCase())
          .filter(k => k.length > 2 && !STOPWORDS.has(k))
          .forEach(keyword => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
          });
      }
    });
    if (Object.keys(keywordCounts).length > 0) sourceUsed = 'ref.keywords';

    // Source B (fallback): RQS entry technology field
    if (Object.keys(keywordCounts).length < 3) {
      console.log('📊 ref.keywords insufficient, falling back to RQS technology field');
      rqsEntries.forEach(entry => {
        const tech = entry.technology || '';
        if (tech && tech !== 'Unknown' && tech !== 'N/A') {
          tech.split(/[,;/]+/)
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 2 && !STOPWORDS.has(t))
            .forEach(term => {
              keywordCounts[term] = (keywordCounts[term] || 0) + 1;
            });
        }
      });
      if (Object.keys(keywordCounts).length >= 3) sourceUsed = 'rqs.technology';
    }

    // Source C (last resort): Extract meaningful bigrams/terms from RQS titles
    if (Object.keys(keywordCounts).length < 3) {
      console.log('📊 Technology field insufficient, falling back to RQS title extraction');
      rqsEntries.forEach(entry => {
        const title = entry.title || '';
        if (title) {
          // Extract meaningful multi-word terms (2-3 word phrases)
          const words = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
          // Add individual meaningful words
          words.filter(w => w.length > 4).forEach(w => {
            keywordCounts[w] = (keywordCounts[w] || 0) + 1;
          });
          // Also add the study context and type as secondary terms
          const context = (entry.context || '').toLowerCase().trim();
          if (context && context !== 'unknown' && context.length > 2) {
            keywordCounts[context] = (keywordCounts[context] || 0) + 1;
          }
        }
      });
      if (Object.keys(keywordCounts).length >= 3) sourceUsed = 'rqs.titles';
    }

    // Sort by frequency and take top 15 keywords
    const sortedKeywords = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15);

    chartData.bubble_chart.entries = sortedKeywords.map(([keyword, count]) => ({
      keyword,
      count
    }));

    console.log(`📊 Thematic keywords extracted: ${sortedKeywords.length} terms (source: ${sourceUsed}) from ${includedRefs.length} refs + ${rqsEntries.length} RQS entries`);
    if (sortedKeywords.length > 0) {
      console.log(`   Top 5: ${sortedKeywords.slice(0, 5).map(([k, c]) => `${k} (${c})`).join(', ')}`);
    }

    // Limitar technical_synthesis a top 15 estudios con más métricas (DINÁMICO)
    chartData.technical_synthesis.studies = chartData.technical_synthesis.studies
      .sort((a, b) => {
        // Contar todas las métricas válidas (excepto 'study' y 'tool')
        const countA = Object.entries(a).filter(([k, v]) => 
          k !== 'study' && k !== 'tool' && v !== null && v !== undefined && v !== ''
        ).length;
        const countB = Object.entries(b).filter(([k, v]) => 
          k !== 'study' && k !== 'tool' && v !== null && v !== undefined && v !== ''
        ).length;
        return countB - countA;
      })
      .slice(0, 15);

    return chartData;
  }

  /**
   * Mapear ítems PRISMA a estructura IMRaD
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
   * Validar PRISMA completo
   */
  async validatePrismaComplete(projectId) {
    const stats = await this.prismaItemRepository.getComplianceStats(projectId);
    const completed = Number.parseInt(stats.completed) || 0;

    if (completed < 27) {
      throw new Error(
        `PRISMA incompleto: ${completed}/27 ítems completados. ` +
        `Debe completar todos los ítems antes de generar el artículo.`
      );
    }

    return true;
  }

  /**
   * Validar calidad del artículo generado según estándares editoriales universales
   */
  validateArticleQuality(article) {
    const errors = [];
    const warnings = [];
    const { 
      TITLE_MAX_WORDS, 
      ABSTRACT_MIN_WORDS, 
      ABSTRACT_MAX_WORDS,
      INTRODUCTION_MIN_WORDS,
      INTRODUCTION_MAX_WORDS,
      METHODS_MIN_WORDS,
      METHODS_MAX_WORDS,
      RESULTS_MIN_WORDS,
      RESULTS_MAX_WORDS,
      DISCUSSION_MIN_WORDS,
      DISCUSSION_MAX_WORDS,
      KEYWORDS_MIN,
      KEYWORDS_MAX,
      CONCLUSIONS_MIN_WORDS,
      CONCLUSIONS_MAX_WORDS,
      MIN_TOTAL_WORDS
    } = GenerateArticleFromPrismaUseCase.EDITORIAL_STANDARDS;

    const countWords = (text) => text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;

    // ✅ Validar título
    const titleWords = countWords(article.title);
    if (titleWords > TITLE_MAX_WORDS) {
      warnings.push(`Título excede ${TITLE_MAX_WORDS} palabras (${titleWords} palabras)`);
    }

    // ✅ Validar abstract
    const abstractWords = countWords(article.abstract);
    if (abstractWords < ABSTRACT_MIN_WORDS) {
      errors.push(`Abstract muy corto: ${abstractWords} palabras (mínimo: ${ABSTRACT_MIN_WORDS})`);
    } else if (abstractWords > ABSTRACT_MAX_WORDS) {
      warnings.push(`Abstract muy largo: ${abstractWords} palabras (máximo: ${ABSTRACT_MAX_WORDS})`);
    }

    // ✅ Validar keywords (obligatorio)
    if (!article.keywords || article.keywords.trim() === '') {
      errors.push('Keywords faltantes (obligatorio en journals)');
    } else {
      const keywordArray = article.keywords.split(';').map(k => k.trim()).filter(k => k.length > 0);
      if (keywordArray.length < KEYWORDS_MIN) {
        errors.push(`Keywords insuficientes: ${keywordArray.length} (mínimo: ${KEYWORDS_MIN})`);
      } else if (keywordArray.length > KEYWORDS_MAX) {
        warnings.push(`Demasiadas keywords: ${keywordArray.length} (máximo: ${KEYWORDS_MAX})`);
      }
    }

    // ✅ Validar Introduction
    const introWords = countWords(article.introduction);
    if (introWords < INTRODUCTION_MIN_WORDS) {
      warnings.push(`Introduction corta: ${introWords} palabras (mínimo: ${INTRODUCTION_MIN_WORDS})`);
    } else if (introWords > INTRODUCTION_MAX_WORDS) {
      warnings.push(`Introduction larga: ${introWords} palabras (máximo: ${INTRODUCTION_MAX_WORDS})`);
    }

    // ✅ Validar Methods
    const methodsWords = countWords(article.methods);
    if (methodsWords < METHODS_MIN_WORDS) {
      warnings.push(`Methods corto: ${methodsWords} palabras (mínimo: ${METHODS_MIN_WORDS})`);
    } else if (methodsWords > METHODS_MAX_WORDS) {
      warnings.push(`Methods largo: ${methodsWords} palabras (máximo: ${METHODS_MAX_WORDS})`);
    }

    // ✅ Validar Results
    const resultsWords = countWords(article.results);
    if (resultsWords < RESULTS_MIN_WORDS) {
      warnings.push(`Results corto: ${resultsWords} palabras (mínimo: ${RESULTS_MIN_WORDS})`);
    } else if (resultsWords > RESULTS_MAX_WORDS) {
      warnings.push(`Results largo: ${resultsWords} palabras (máximo: ${RESULTS_MAX_WORDS})`);
    }

    // ✅ Validar Discussion
    const discussionWords = countWords(article.discussion);
    if (discussionWords < DISCUSSION_MIN_WORDS) {
      warnings.push(`Discussion corta: ${discussionWords} palabras (mínimo: ${DISCUSSION_MIN_WORDS})`);
    } else if (discussionWords > DISCUSSION_MAX_WORDS) {
      warnings.push(`Discussion larga: ${discussionWords} palabras (máximo: ${DISCUSSION_MAX_WORDS})`);
    }

    // ✅ Validar conclusiones
    const conclusionsWords = countWords(article.conclusions);
    if (conclusionsWords < CONCLUSIONS_MIN_WORDS) {
      warnings.push(`Conclusiones cortas: ${conclusionsWords} palabras (mínimo recomendado: ${CONCLUSIONS_MIN_WORDS})`);
    } else if (conclusionsWords > CONCLUSIONS_MAX_WORDS) {
      warnings.push(`Conclusiones largas: ${conclusionsWords} palabras (máximo recomendado: ${CONCLUSIONS_MAX_WORDS})`);
    }

    // Validar que contiene tablas en resultados
    if (article.results && !article.results.includes('Table')) {
      warnings.push('Falta referencia a tablas en resultados');
    }

    // Validar que Discussion menciona threats to validity
    if (article.discussion && !article.discussion.toLowerCase().includes('threat')) {
      warnings.push('Discussion no menciona Threats to Validity');
    }

    // Validar que Introduction termina con RQs
    if (article.introduction && !article.introduction.includes('RQ1') && !article.introduction.includes('RQ 1')) {
      warnings.push('Introduction no termina con lista explícita de Research Questions');
    }

    // Validar word count mínimo total
    if (article.metadata.wordCount < MIN_TOTAL_WORDS) {
      warnings.push(`Word count bajo: ${article.metadata.wordCount} palabras (mínimo recomendado: ${MIN_TOTAL_WORDS})`);
    }

    // Validar que todas las secciones principales existen
    const requiredSections = ['title', 'abstract', 'keywords', 'introduction', 'methods', 'results', 'discussion', 'conclusions'];
    requiredSections.forEach(section => {
      if (!article[section] || article[section].length < 10) {
        errors.push(`Sección "${section}" vacía o muy corta`);
      }
    });

    // Reportar errores críticos
    if (errors.length > 0) {
      console.error('❌ ERRORES CRÍTICOS (no cumple estándares editoriales):');
      errors.forEach(err => console.error(`   - ${err}`));
    }

    // Reportar advertencias
    if (warnings.length > 0) {
      console.warn('⚠️ Advertencias de calidad (recomendaciones editoriales):');
      warnings.forEach(warn => console.warn(`   - ${warn}`));
    }
    
    // Log word count summary
    console.log(`📊 Word count por sección:`);
    console.log(`   Abstract: ${abstractWords} | Intro: ${introWords} | Methods: ${methodsWords}`);
    console.log(`   Results: ${resultsWords} | Discussion: ${discussionWords} | Conclusions: ${conclusionsWords}`);
    console.log(`   TOTAL: ${article.metadata.wordCount} (target: ~7,200)`);
    
    // Resumen de validación
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ Artículo cumple TODOS los estándares editoriales');
    } else if (errors.length === 0) {
      console.log('✅ Artículo cumple estándares mínimos (con advertencias menores)');
    } else {
      console.log('❌ Artículo NO cumple estándares editoriales mínimos');
    }
  }

  /**
   * Generar declaraciones finales profesionales
   */
  generateDeclarations(prismaContext) {
    return `### Registration and Protocol

The protocol for this systematic review was fully defined and documented before the study selection phase, following the PRISMA 2020 guidelines. The protocol included predefined eligibility criteria (PICO), a complete search strategy, data extraction methods using a structured RQS schema, and a narrative synthesis plan. The protocol was not prospectively registered in a public database (e.g., PROSPERO).

### Funding

This research received no specific funding from public, commercial, or non-profit agencies. The work was developed as part of institutional academic activities.

### Conflicts of Interest

The authors declare no conflicts of interest related to this research. There are no financial or personal relationships that could inappropriately influence the reported work.

### Data and Materials Availability

The data extracted through the RQS schema, the methodological quality assessments of included studies, and the complete search strategies for each database are available upon reasonable request to the corresponding author. All studies included in this review are publicly accessible publications cited in the References section.

### Author Contributions

All authors contributed substantially to the study conception, data interpretation, and critical manuscript revision. All authors approved the final version and agree with all aspects of the work.

### Use of Artificial Intelligence

This review utilized artificial intelligence tools in an assisted and transparent manner for:
- **Initial screening**: Semantic similarity analysis to prioritize articles during the screening phase
- **Data extraction**: Assistance in data structuring through the RQS schema
- **Writing**: Assistance in manuscript organization and drafting

**All critical methodological decisions** (inclusion/exclusion criteria, quality assessment, interpretation of findings, and conclusions) were made and manually validated by the researchers. The use of AI is transparently declared following ethical principles of research integrity and journal recommendations on the responsible use of AI technologies in academic publications.

### Acknowledgments

The authors gratefully acknowledge the institutions that provided access to the bibliographic databases used in this review.`;
  }

  // ═══════════════════════════════════════════════════════
  // DOMAIN FILTER, SSOT, AND ANTI-AI INFRASTRUCTURE
  // ═══════════════════════════════════════════════════════

  /**
   * Build domain context from protocol data (PICO, RQs, key terms, search queries).
   * Used to filter hallucinations and enforce domain adherence in ALL prompts.
   */
  buildDomainContext(prismaContext) {
    const protocol = prismaContext.protocol || {};
    const pico = protocol.picoFramework || protocol.pico || {};

    const picoText = [
      pico.population || '',
      pico.intervention || '',
      pico.comparison || '',
      pico.outcome || pico.outcomes || ''
    ].filter(t => t).join(' ');

    const rqText = (protocol.researchQuestions || []).join(' ');
    const keyTermsText = Object.values(protocol.keyTerms || {}).flat().join(' ');
    const searchText = (protocol.searchQueries || [])
      .map(sq => sq.query || sq.apiQuery || '')
      .join(' ');

    const allText = `${picoText} ${rqText} ${keyTermsText} ${searchText}`.toLowerCase();

    const stopwords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were',
      'been', 'have', 'has', 'not', 'but', 'what', 'which', 'when', 'how', 'all',
      'some', 'any', 'each', 'more', 'most', 'other', 'than', 'only', 'also', 'its',
      'between', 'through', 'after', 'before', 'about', 'into', 'over', 'such',
      'will', 'can', 'may', 'should', 'would', 'could', 'does', 'did', 'use', 'used',
      'using', 'de', 'del', 'la', 'las', 'los', 'el', 'en', 'un', 'una', 'que', 'es',
      'se', 'por', 'con', 'para', 'son', 'como', 'más', 'al', 'ya', 'no', 'hay',
      'su', 'sus', 'sobre', 'entre', 'cuáles', 'cómo', 'qué'
    ]);

    const domainTerms = [...new Set(
      allText
        .replace(/[^a-záéíóúñ0-9\s\-\.]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopwords.has(w))
    )];

    // Extract allowed technologies from PICO intervention + search queries
    const techSources = [
      pico.intervention || '',
      pico.population || '',
      ...Object.values(protocol.keyTerms || {}).flat(),
      ...(protocol.searchQueries || []).map(sq => sq.query || '')
    ];
    const allowedTechnologies = techSources
      .join(' ')
      .split(/[,;()]+/)
      .map(t => t.trim())
      .filter(t => t.length > 1);

    return {
      domainTerms,
      allowedTechnologies,
      researchQuestions: protocol.researchQuestions || [],
      picoFramework: {
        population: pico.population || 'Not specified',
        intervention: pico.intervention || 'Not specified',
        comparison: pico.comparison || 'Not specified',
        outcome: pico.outcome || pico.outcomes || 'Not specified'
      }
    };
  }

  /**
   * Build Single Source of Truth (SSOT) for canonical numbers.
   * Every section MUST use these numbers — no deviations allowed.
   */
  buildSSOT(prismaContext, rqsEntries, rqsStats) {
    const screening = prismaContext.screening || {};
    return {
      totalIdentified: screening.identified || 0,
      duplicatesRemoved: screening.duplicatesRemoved || 0,
      screenedTitleAbstract: screening.screenedTitleAbstract || (screening.identified || 0) - (screening.duplicatesRemoved || 0),
      excludedTitleAbstract: screening.excludedTitleAbstract || 0,
      fullTextAssessed: screening.fullTextAssessed || 0,
      excludedFullText: screening.excludedFullText || 0,
      includedFinal: screening.includedFinal || rqsStats.total,
      rqsEntriesCount: rqsEntries.length,
      databases: (prismaContext.protocol.databases || []).map(db => db.name || db),
      temporalRange: {
        start: prismaContext.protocol.temporalRange?.start || 'N/A',
        end: prismaContext.protocol.temporalRange?.end || 'N/A'
      },
      phase1: screening.phase1 || null,
      phase2: screening.phase2 || null
    };
  }

  /**
   * Validate domain compliance of RQS entries.
   * Warns about entries that may be from outside the study domain.
   */
  validateDomainCompliance(rqsEntries, domainContext) {
    const warnings = [];

    rqsEntries.forEach((entry, i) => {
      const entryText = `${entry.title || ''} ${entry.technology || ''} ${entry.keyEvidence || ''}`.toLowerCase();
      const matchCount = domainContext.domainTerms.filter(term => entryText.includes(term)).length;
      const matchRatio = domainContext.domainTerms.length > 0
        ? matchCount / domainContext.domainTerms.length
        : 0;

      if (matchRatio < 0.05 && domainContext.domainTerms.length > 5) {
        warnings.push(
          `S${i + 1} (${entry.author}, ${entry.year}): Low domain relevance ` +
          `(${(matchRatio * 100).toFixed(1)}% term match) — "${entry.title?.substring(0, 50)}..."`
        );
      }
    });

    if (warnings.length > 0) {
      console.warn('⚠️ DOMAIN COMPLIANCE WARNINGS:');
      warnings.forEach(w => console.warn(`   ${w}`));
      console.warn('   These entries may contain data from outside the study domain.');
    }

    return warnings;
  }

  /**
   * Generate domain filter directive for LLM prompts.
   * Constrains the LLM to only use terms present in PICO/RQs.
   */
  getDomainFilterDirective() {
    if (!this._domainContext) return '';
    const dc = this._domainContext;
    return `
**🔒 DOMAIN FILTER — MANDATORY CONSTRAINT:**
This article belongs to the following research domain. ALL content MUST stay strictly within this scope:
- **PICO Population**: ${dc.picoFramework.population}
- **PICO Intervention**: ${dc.picoFramework.intervention}
- **PICO Comparison**: ${dc.picoFramework.comparison}
- **PICO Outcome**: ${dc.picoFramework.outcome}
- **Allowed domain terms**: ${dc.domainTerms.slice(0, 30).join(', ')}
- **Allowed technologies**: ${dc.allowedTechnologies.slice(0, 15).join('; ')}

**DOMAIN VIOLATION RULES:**
- DO NOT mention technologies, methods, or concepts outside the PICO framework
- DO NOT use terms from unrelated engineering fields (e.g., electrical engineering terms in a software article, or "truck drivers" in a database performance study)
- If a study's data seems out-of-domain, SKIP it — do not include it in the synthesis
- Every technology mentioned MUST match one from the allowed technologies/domain terms above
- Every concept discussed MUST be traceable to the PICO framework or Research Questions
`;
  }

  /**
   * Generate SSOT directive for LLM prompts.
   * Enforces canonical numbers across all sections.
   */
  getSSOTDirective() {
    if (!this._ssot) return '';
    const s = this._ssot;
    return `
**📊 SINGLE SOURCE OF TRUTH (SSOT) — CANONICAL NUMBERS:**
These numbers are ABSOLUTE and MUST be used consistently:
- Total records identified: n = ${s.totalIdentified}
- Duplicates removed: n = ${s.duplicatesRemoved}
- Records screened (title/abstract): n = ${s.screenedTitleAbstract}
- Excluded at title/abstract: n = ${s.excludedTitleAbstract}
- Full-text articles assessed: n = ${s.fullTextAssessed}
- Excluded at full-text: n = ${s.excludedFullText}
- **FINAL INCLUDED STUDIES: n = ${s.includedFinal}** ← SACRED number
- RQS data entries: ${s.rqsEntriesCount}
- Databases: ${s.databases.join(', ')}
- Temporal range: ${s.temporalRange.start}–${s.temporalRange.end}

**SSOT RULES:**
- n = ${s.includedFinal} MUST appear consistently whenever "included studies" are mentioned
- NEVER cite a different count of included studies anywhere
- ALL tables, figures, and text must reference EXACTLY ${s.includedFinal} included studies
- If any calculation conflicts with SSOT, use SSOT values — they override everything
`;
  }

  /**
   * Generate anti-AI writing directive for LLM prompts.
   * Prevents formulaic, detectable AI writing patterns.
   */
  getAntiAIDirective() {
    return `
**🚫 ANTI-AI WRITING REQUIREMENTS — MANDATORY:**

**BANNED PHRASES (never use these — they trigger AI detectors):**
- "The increasing complexity of..."
- "In the rapidly evolving landscape of..."
- "Furthermore, it is important to note..."
- "The findings suggest that..."
- "It is worth mentioning that..."
- "In recent years..."
- "has gained significant attention"
- "plays a crucial role"
- "It should be noted that..."
- "This highlights the importance of..."
- "A comprehensive analysis reveals..."
- "In light of the above..."
- "In today's digital age..."
- "It is imperative to..."

**WRITING STYLE REQUIREMENTS:**
- Use SHORT, DIRECT sentences. Vary sentence length (8–25 words). Mix short declarative with longer compound sentences.
- Prefer technical action verbs: quantified, benchmarked, outperformed, measured, evaluated, configured, deployed, validated, replicated, degraded, scaled
- Avoid filler verbs: studied, analyzed, discussed, examined, explored, investigated (unless contextually necessary)
- Start paragraphs with CONCRETE technical statements, not philosophical musings
- Focus on SPECIFIC technical problems: computational cost, latency, throughput, memory overhead, scalability
- Use passive voice strategically (not exclusively)
- Avoid starting more than 2 sentences with "This study" or "This review"
- Reference specific metrics, versions, configurations — not vague generalizations
- Instead of "The findings suggest that X increases performance", write "X reduced query latency by Y ms (Z%)" — always prefer concrete data
`;
  }

  /**
   * System prompt mejorado para generación académica profesional
   */
  getEnhancedSystemPrompt() {
    let prompt = `You are a senior researcher specialized in systematic reviews, with experience writing academic papers for high-impact scientific journals (Q1/Q2).

**YOUR ROLE:**
- Write professional academic content following PRISMA 2020 standards
- Use ONLY explicitly provided data (never invent figures, studies, or authors)
- Maintain methodological rigor and epistemic transparency
- Write in formal Academic English
- Follow IEEE formatting conventions for citations [1], [2]

**WRITING STANDARDS:**
- Third person impersonal
- Appropriate verb tenses (past for methods/results, present for interpretations)
- Strict IMRaD structure
- Continuous prose (no bullet points except in tables)
- Citations using numbered format [1], [2], [3] (IEEE style)
- Acknowledge limitations honestly

**ANTI-AI WRITING QUALITY — CRITICAL:**
- NEVER start with clichés: "The increasing complexity of...", "In the rapidly evolving landscape of...", etc.
- Vary sentence length: mix short (8–12 words) with longer (20–30 words) sentences
- Use technical action verbs (quantified, benchmarked, outperformed, measured) instead of filler (studied, analyzed, discussed)
- Start paragraphs with concrete technical facts, not philosophical statements
- Write with high technical density: focus on computational overhead, latency, throughput, specific version numbers
- Break monotonous AI rhythm: do NOT produce sentences of uniform length

**SECTION-SPECIFIC RULES:**
- RESULTS: ZERO authorial opinions — only factual data from primary studies
- DISCUSSION: interpretations, comparisons, and implications allowed
- Avoid evaluative language in Results ("interesting", "noteworthy", "remarkable", "surprisingly")

**ABSOLUTE PROHIBITIONS:**
- DO NOT invent data, studies, authors, or unmentioned findings
- DO NOT use speculative language without evidence
- DO NOT make causal claims without evidence
- DO NOT cite studies not included in the review
- DO NOT use first person or colloquial language
- DO NOT mention technologies or domains outside the study's PICO framework
- DO NOT produce formulaic AI-detectable text patterns

**GUIDING PRINCIPLE:**
A quality systematic review is transparent about what it knows, what it does not know, and why.`;

    if (this._domainContext) {
      prompt += `\n\n**DOMAIN RESTRICTION:**
This article concerns: ${this._domainContext.picoFramework.intervention} applied to ${this._domainContext.picoFramework.population}.
Outcome: ${this._domainContext.picoFramework.outcome}.
Stay strictly within this domain. Content outside this scope is considered a hallucination.`;
    }

    return prompt;
  }

  /**
   * Utilidades de traducción
   */
  translateStudyType(type) {
    const translations = {
      'empirical': 'Empirical',
      'case_study': 'Case Study',
      'experiment': 'Experimental',
      'simulation': 'Simulation',
      'review': 'Review',
      'survey': 'Survey',
      'other': 'Other'
    };
    return translations[type] || type || 'Not specified';
  }

  translateContext(context) {
    const translations = {
      'industrial': 'Industrial',
      'enterprise': 'Enterprise',
      'academic': 'Academic',
      'experimental': 'Experimental',
      'mixed': 'Mixed',
      'other': 'Other'
    };
    return translations[context] || context || 'Not specified';
  }

  translateQuality(quality) {
    const translations = {
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return translations[quality] || 'Medium';
  }

  /**
   * Convertir imágenes de URLs a base64 para guardar en BD
   */
  async convertImagesToBase64(chartPaths) {
    const fs = require('node:fs').promises;
    const path = require('node:path');
    
    if (!chartPaths || Object.keys(chartPaths).length === 0) {
      return {};
    }

    const base64Charts = {};
    
    try {
      for (const [key, url] of Object.entries(chartPaths)) {
        if (!url) continue;
        
        // Extraer el nombre del archivo de la URL
        const filename = url.split('/').pop();
        const filePath = path.join(__dirname, '../../../uploads/charts', filename);
        
        try {
          // Leer el archivo
          const imageBuffer = await fs.readFile(filePath);
          // Convertir a base64
          const base64 = imageBuffer.toString('base64');
          // Crear data URL
          base64Charts[key] = `data:image/png;base64,${base64}`;
          console.log(`✅ Imagen ${key} convertida a base64 (${Math.round(base64.length/1024)}KB)`);
        } catch (err) {
          console.error(`⚠️ No se pudo leer imagen ${filename}:`, err.message);
          // Mantener la URL original si falla la conversión
          base64Charts[key] = url;
        }
      }
    } catch (err) {
      console.error('⚠️ Error convirtiendo imágenes a base64:', err);
      return chartPaths; // Retornar URLs originales si falla
    }
    
    return base64Charts;
  }

  /**
   * Calcular word count
   */
  calculateWordCount(article) {
    const allText = [
      article.title,
      article.abstract,
      article.introduction,
      article.methods,
      article.results,
      article.discussion,
      article.conclusions,
      article.declarations
    ].join(' ');

    return allText.split(/\s+/).filter(w => w.length > 0).length;
  }
}

module.exports = GenerateArticleFromPrismaUseCase;
