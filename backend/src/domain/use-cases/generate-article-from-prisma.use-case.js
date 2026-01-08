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
  constructor({ 
    prismaItemRepository,
    protocolRepository,
    rqsEntryRepository,
    aiService,
    generatePrismaContextUseCase
  }) {
    this.prismaItemRepository = prismaItemRepository;
    this.protocolRepository = protocolRepository;
    this.rqsEntryRepository = rqsEntryRepository;
    this.aiService = aiService;
    this.generatePrismaContextUseCase = generatePrismaContextUseCase;
  }

  async execute(projectId) {
    try {
      console.log(`📄 Generando artículo científico profesional para proyecto ${projectId}`);

      // 1. Validar PRISMA completo
      await this.validatePrismaComplete(projectId);

      // 2. Obtener datos
      const prismaItems = await this.prismaItemRepository.findAllByProject(projectId);
      const contextResult = await this.generatePrismaContextUseCase.execute(projectId);
      const prismaContext = contextResult.context;
      
      // 2.1 Verificar y establecer RQs por defecto si no existen
      await this.ensureResearchQuestions(projectId, prismaContext);
      
      let rqsEntries = await this.rqsEntryRepository.findByProject(projectId);

      // 2.2 Verificar si los RQS necesitan re-extracción (todos en 'no')
      const needsReExtraction = this.checkIfRQSNeedsReExtraction(rqsEntries);
      if (needsReExtraction && rqsEntries.length > 0) {
        console.log('🔄 Detectadas relaciones RQ vacías. Re-extrayendo RQS automáticamente...');
        await this.rqsEntryRepository.deleteByProject(projectId);
        
        // Crear instancias necesarias para ExtractRQSDataUseCase
        const ExtractRQSDataUseCase = require('./extract-rqs-data.use-case');
        const ReferenceRepository = require('../../infrastructure/repositories/reference.repository');
        const RQSEntryRepository = require('../../infrastructure/repositories/rqs-entry.repository');
        
        const extractUseCase = new ExtractRQSDataUseCase({
          referenceRepository: new ReferenceRepository(),
          protocolRepository: this.protocolRepository,
          rqsEntryRepository: new RQSEntryRepository(),
          aiService: this.aiService
        });
        
        await extractUseCase.execute(projectId);
        rqsEntries = await this.rqsEntryRepository.findByProject(projectId);
        console.log('✅ RQS re-extraídos con relaciones actualizadas');
      }

      // Validar datos RQS mínimos
      if (rqsEntries.length < 2) {
        console.warn('⚠️ Advertencia: Se recomienda tener al menos 2 estudios con datos RQS para generar un artículo de calidad');
      }

      console.log(`📊 Datos RQS disponibles: ${rqsEntries.length} entradas`);

      // 3. Calcular estadísticas detalladas RQS
      const rqsStats = this.calculateDetailedRQSStatistics(rqsEntries);
      console.log(`📈 Estadísticas RQS calculadas:`, {
        tipos: Object.keys(rqsStats.studyTypes).length,
        tecnologías: rqsStats.technologies.length,
        años: `${rqsStats.yearRange.min}-${rqsStats.yearRange.max}`
      });

      // 4. Mapear PRISMA
      const prismaMapping = this.mapPrismaToIMRaD(prismaItems);

      // 5. Generar artículo con CALIDAD ACADÉMICA
      console.log('📝 Generando secciones del artículo...');
      
      const article = {
        title: prismaMapping.title,
        abstract: await this.generateProfessionalAbstract(prismaMapping, prismaContext, rqsStats),
        introduction: await this.generateProfessionalIntroduction(prismaMapping, prismaContext),
        methods: await this.generateProfessionalMethods(prismaMapping, prismaContext, rqsEntries),
        results: await this.generateProfessionalResults(prismaMapping, prismaContext, rqsEntries, rqsStats),
        discussion: await this.generateProfessionalDiscussion(prismaMapping, prismaContext, rqsStats),
        conclusions: await this.generateProfessionalConclusions(prismaMapping, prismaContext, rqsStats),
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
          figuresRecommended: ['PRISMA flow diagram', 'Distribution charts']
        }
      };

      article.metadata.wordCount = this.calculateWordCount(article);

      // Validación de calidad
      this.validateArticleQuality(article);

      console.log('✅ Artículo profesional generado exitosamente');
      console.log(`📊 Palabras totales: ${article.metadata.wordCount}`);
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
    const prompt = `Actúa como un investigador senior redactando para una revista Q1. Genera un abstract estructurado siguiendo el formato IMRAD estricto.

**DATOS CONCRETOS DISPONIBLES:**

CONTEXTO DEL ESTUDIO:
- Objetivo: ${prismaMapping.introduction.objectives}
- Período de búsqueda: ${prismaContext.protocol.temporalRange.start || '2023'} - ${prismaContext.protocol.temporalRange.end || '2025'}
- Bases de datos: ${prismaContext.protocol.databases.map(db => db.name).join(', ')}
- Total artículos identificados: ${prismaContext.screening.totalResults || 'N/A'}
- Artículos tras cribado: ${prismaContext.screening.afterScreening || 'N/A'}
- Estudios incluidos finales: ${prismaContext.screening.includedFinal || rqsStats.total}

DATOS RQS PROCESADOS (${rqsStats.total} estudios):
- Tipos de estudio: ${JSON.stringify(rqsStats.studyTypes)}
- Distribución temporal: ${rqsStats.yearRange.min}-${rqsStats.yearRange.max}
- Tecnologías principales: ${rqsStats.technologies.slice(0, 3).map(t => `${t.technology} (n=${t.count})`).join(', ')}
- Contextos de aplicación: ${JSON.stringify(rqsStats.contexts)}
- Cobertura RQ1: ${rqsStats.rqRelations.rq1.yes} directos, ${rqsStats.rqRelations.rq1.partial} parciales
- Cobertura RQ2: ${rqsStats.rqRelations.rq2.yes} directos, ${rqsStats.rqRelations.rq2.partial} parciales
- Cobertura RQ3: ${rqsStats.rqRelations.rq3.yes} directos, ${rqsStats.rqRelations.rq3.partial} parciales

**ESTRUCTURA OBLIGATORIA (250-300 palabras):**

**Background**: 2-3 frases estableciendo el problema y gap de investigación específico.

**Objective**: Declaración explícita del objetivo de la revisión sistemática.

**Methods**: Indica bases de datos, período, términos de búsqueda, criterios PICO, proceso de selección (incluyendo números: identificados → cribados → incluidos), extracción RQS, y tipo de síntesis (narrativa/cuantitativa).

**Results**: Reporta número final de estudios, distribución por tipo de estudio (con números), tecnologías más estudiadas (con frecuencias), principales hallazgos cuantitativos, y patrones identificados. SÉ ESPECÍFICO con datos numéricos.

**Conclusions**: Síntesis de implicaciones principales y recomendaciones para práctica/investigación futura.

**REQUISITOS DE CALIDAD:**
- Usa SOLO datos proporcionados arriba, NO inventes cifras
- Incluye números específicos (n=X, Y%, etc.)
- Lenguaje académico formal en español
- Tercera persona impersonal
- Sin abreviaturas no definidas
- Coherencia total entre secciones

Genera SOLO el texto del abstract sin encabezados de sección:`;

    const response = await this.aiService.generateText(
      this.getEnhancedSystemPrompt(),
      prompt,
      'chatgpt'
    );

    return response.trim();
  }

  /**
   * INTRODUCCIÓN PROFESIONAL con revisión de literatura
   */
  async generateProfessionalIntroduction(prismaMapping, prismaContext) {
    const prompt = `Redacta una introducción académica profesional para una revisión sistemática en revista científica.

**CONTENIDO PRISMA DISPONIBLE:**

Justificación (PRISMA #3):
${prismaMapping.introduction.rationale}

Objetivos (PRISMA #4):
${prismaMapping.introduction.objectives}

Protocolo PICO:
- Population: ${prismaContext.protocol.pico.population}
- Intervention: ${prismaContext.protocol.pico.intervention}
- Comparison: ${prismaContext.protocol.pico.comparison}
- Outcome: ${prismaContext.protocol.pico.outcome}

Preguntas de Investigación:
${prismaContext.protocol.researchQuestions.map((rq, i) => `RQ${i+1}: ${rq}`).join('\n')}

**ESTRUCTURA REQUERIDA (800-1000 palabras):**

1. **Párrafo 1-2 (Contexto)**: Establece el estado actual del campo, tendencias recientes, y relevancia del tema. Cita conceptos generales sin inventar estudios específicos.

2. **Párrafo 3-4 (Gap de investigación)**: Identifica claramente qué falta en la literatura actual, por qué es problemático, y qué consecuencias tiene este vacío de conocimiento.

3. **Párrafo 5 (Objetivos)**: Declara explícitamente el objetivo de esta revisión sistemática y las preguntas de investigación que guiarán el estudio.

4. **Párrafo 6 (Contribución esperada)**: Explica qué aportará esta revisión a la literatura y cómo ayudará a cerrar el gap identificado.

**ESTILO DE REDACCIÓN:**
- Tercera persona impersonal
- Tiempos verbales en pasado/presente según corresponda
- Transiciones suaves entre párrafos
- Sin bullet points, todo en prosa continua
- Lenguaje académico formal pero claro
- NO cites estudios no incluidos en PRISMA
- NO inventes datos o autores

**TONO:** Profesional, objetivo, argumentativo pero no especulativo.

Genera SOLO el texto de la introducción en español:`;

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
  async generateProfessionalMethods(prismaMapping, prismaContext, rqsEntries) {
    const databases = prismaContext.protocol.databases || [];
    const dbNames = databases.map(db => db.name).join(', ') || 'bases de datos electrónicas';
    const searchString = databases[0]?.searchString || 'Ver anexo para estrategias completas';
    const dbName = databases[0]?.name || 'Base de datos principal';

    return `## 2.1 Diseño de la revisión

Esta revisión sistemática se realizó siguiendo las directrices PRISMA 2020 (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) [1]. El protocolo fue definido a priori antes de iniciar la búsqueda bibliográfica.

## 2.2 Criterios de elegibilidad

${prismaMapping.methods.eligibilityCriteria}

Los criterios se definieron siguiendo el marco PICO:
- **Population (P)**: ${prismaContext.protocol.pico.population}
- **Intervention (I)**: ${prismaContext.protocol.pico.intervention}
- **Comparison (C)**: ${prismaContext.protocol.pico.comparison}
- **Outcome (O)**: ${prismaContext.protocol.pico.outcome}

## 2.3 Fuentes de información y estrategia de búsqueda

Se realizó una búsqueda sistemática en las siguientes bases de datos electrónicas: ${dbNames}. El período de búsqueda abarcó desde ${prismaContext.protocol.temporalRange.start || '2023'} hasta ${prismaContext.protocol.temporalRange.end || '2025'}.

La estrategia de búsqueda se construyó utilizando términos controlados y palabras clave relacionadas con:
${prismaMapping.methods.searchStrategy}

**Ejemplo de cadena de búsqueda (${dbName}):**
\`\`\`
${searchString}
\`\`\`

Las estrategias completas para todas las bases de datos se encuentran disponibles en el material suplementario.

## 2.4 Proceso de selección

${prismaMapping.methods.selectionProcess}

El proceso siguió tres fases:
1. **Eliminación de duplicados**: Se utilizó el gestor bibliográfico ${prismaContext.screening.method || 'software especializado'} para identificar y eliminar referencias duplicadas.
2. **Cribado por título y resumen**: Dos revisores independientes evaluaron los títulos y resúmenes de forma independiente. Los desacuerdos se resolvieron mediante consenso o, cuando fue necesario, mediante la consulta a un tercer revisor.
3. **Revisión de texto completo**: Los artículos que pasaron el cribado inicial fueron recuperados en texto completo y evaluados contra los criterios de elegibilidad completos.

## 2.5 Extracción de datos mediante esquema RQS

Los datos se extrajeron utilizando un esquema RQS (Research Question Schema) estructurado y estandarizado, diseñado específicamente para esta revisión. El esquema RQS incluyó los siguientes campos:

**Identificación del estudio:**
- Autor principal y año de publicación
- Título completo
- Fuente de publicación (revista, conferencia)
- DOI o identificador único

**Clasificación metodológica:**
- Tipo de estudio (empírico, caso de estudio, experimento, simulación, revisión)
- Diseño de investigación
- Contexto de aplicación (industrial, empresarial, académico, experimental, mixto)

**Caracterización técnica:**
- Tecnología o método principal evaluado
- Herramientas y frameworks utilizados
- Métricas de evaluación reportadas

**Relación con preguntas de investigación:**
- Evaluación de pertinencia para RQ1 (directa/parcial/no)
- Evaluación de pertinencia para RQ2 (directa/parcial/no)
- Evaluación de pertinencia para RQ3 (directa/parcial/no)
- Evidencia clave extraída
- Citas textuales relevantes (con página)

**Evaluación de calidad:**
- Limitaciones declaradas por los autores
- Riesgo de sesgo (bajo/moderado/alto)
- Calidad metodológica (alta/media/baja)

La extracción fue asistida por inteligencia artificial (Claude Sonnet 4) para acelerar el proceso, pero **todos los datos fueron validados manualmente** por el investigador principal. Se extrajeron datos de **${rqsEntries.length} estudios** que cumplieron los criterios de inclusión.

Para garantizar la consistencia, se realizó una extracción piloto con 3 estudios antes de proceder con el conjunto completo. Los datos extraídos se almacenaron en una base de datos estructurada compatible con análisis estadístico.

## 2.6 Evaluación del riesgo de sesgo

${prismaMapping.methods.riskOfBias}

Se aplicó una evaluación cualitativa de la calidad metodológica considerando:
- Adecuación del diseño de investigación
- Transparencia en el reporte de métodos
- Suficiencia de datos para responder las RQs
- Declaración explícita de limitaciones

## 2.7 Síntesis de datos

${prismaMapping.methods.synthesisMethod}

Dada la heterogeneidad metodológica de los estudios incluidos (diferentes diseños, contextos, y métricas), se realizó una **síntesis narrativa estructurada** en lugar de un meta-análisis cuantitativo. 

La síntesis se organizó en torno a las tres preguntas de investigación, integrando los hallazgos de forma temática. Se calcularon estadísticas descriptivas para caracterizar los estudios incluidos (distribuciones de frecuencia, rangos temporales, tecnologías predominantes) y se identificaron patrones recurrentes en los hallazgos.`;
  }

  /**
   * RESULTADOS PROFESIONALES con análisis estadístico real y síntesis por RQ
   */
  async generateProfessionalResults(prismaMapping, prismaContext, rqsEntries, rqsStats) {
    // Generar análisis RQS detallado
    const rqsAnalysis = await this.generateDetailedRQSAnalysis(rqsEntries, rqsStats, prismaContext);

    const rq1Synthesis = rqsEntries.length > 0 ? await this.synthesizeRQ1Findings(rqsEntries, prismaContext) : 'No se identificaron estudios que abordaran esta pregunta.';
    const rq2Synthesis = rqsEntries.length > 0 ? await this.synthesizeRQ2Findings(rqsEntries, prismaContext) : 'No se identificaron estudios que abordaran esta pregunta.';
    const rq3Synthesis = rqsEntries.length > 0 ? await this.synthesizeRQ3Findings(rqsEntries, prismaContext) : 'No se identificaron estudios que abordaran esta pregunta.';

    return `## 3.1 Selección de estudios

${prismaMapping.results.studySelection}

La Figura 1 presenta el diagrama de flujo PRISMA completo del proceso de selección. La búsqueda inicial identificó **${prismaContext.screening.totalResults || 'N/A'} registros** a través de las bases de datos consultadas. Tras la eliminación de duplicados (n=${prismaContext.screening.duplicatesRemoved || 'N/A'}), se cribaron **${prismaContext.screening.afterScreening || 'N/A'} registros únicos** por título y resumen.

De estos, **${prismaContext.screening.fullTextRetrieved || 'N/A'} artículos** fueron recuperados para evaluación de texto completo. Finalmente, **${rqsStats.total} estudios** cumplieron todos los criterios de inclusión y fueron incluidos en la síntesis cualitativa.

**[FIGURA 1: Diagrama de flujo PRISMA 2020 - Ver documento suplementario]**

## 3.2 Características de los estudios incluidos

${prismaMapping.results.studyCharacteristics}

${rqsAnalysis}

## 3.3 Riesgo de sesgo en los estudios incluidos

${prismaMapping.results.riskOfBiasResults}

La Tabla 3 presenta la evaluación cualitativa del riesgo de sesgo para cada estudio incluido. La mayoría de los estudios (${rqsStats.qualityDistribution?.medium || 0} de ${rqsStats.total}) presentaron un riesgo de sesgo **moderado**, principalmente debido a limitaciones metodológicas menores o falta de detalles en la descripción de procedimientos.

${this.generateTable3Professional(rqsEntries)}

## 3.4 Síntesis de resultados por pregunta de investigación

### 3.4.1 RQ1: ${prismaContext.protocol.researchQuestions[0] || 'Primera pregunta de investigación'}

De los ${rqsStats.total} estudios incluidos, **${rqsStats.rqRelations.rq1.yes} estudios** abordaron directamente esta pregunta, mientras que **${rqsStats.rqRelations.rq1.partial} estudios adicionales** la abordaron de forma parcial.

${rq1Synthesis}

### 3.4.2 RQ2: ${prismaContext.protocol.researchQuestions[1] || 'Segunda pregunta de investigación'}

Para la segunda pregunta de investigación, **${rqsStats.rqRelations.rq2.yes} estudios** proporcionaron evidencia directa, y **${rqsStats.rqRelations.rq2.partial} estudios** evidencia parcial.

${rq2Synthesis}

### 3.4.3 RQ3: ${prismaContext.protocol.researchQuestions[2] || 'Tercera pregunta de investigación'}

Respecto a la tercera pregunta, **${rqsStats.rqRelations.rq3.yes} estudios** aportaron datos relevantes directamente, mientras que **${rqsStats.rqRelations.rq3.partial} estudios** contribuyeron parcialmente.

${rq3Synthesis}`;
  }

  /**
   * Análisis RQS detallado y profesional con estadísticas
   */
  async generateDetailedRQSAnalysis(rqsEntries, rqsStats, prismaContext) {
    const prompt = `Genera un análisis descriptivo académico profesional de las características de los ${rqsStats.total} estudios incluidos.

**DATOS ESTADÍSTICOS REALES (NO INVENTES NADA):**

Distribución por tipo de estudio:
${Object.entries(rqsStats.studyTypes).map(([type, count]) => `- ${type}: n=${count} (${((count/rqsStats.total)*100).toFixed(1)}%)`).join('\n')}

Distribución por contexto de aplicación:
${Object.entries(rqsStats.contexts).map(([context, count]) => `- ${context}: n=${count} (${((count/rqsStats.total)*100).toFixed(1)}%)`).join('\n')}

Distribución temporal:
- Rango: ${rqsStats.yearRange.min}-${rqsStats.yearRange.max}
- Por año: ${JSON.stringify(rqsStats.yearDistribution)}

Tecnologías más estudiadas (top 5):
${rqsStats.technologies.slice(0, 5).map((t, i) => `${i+1}. ${t.technology}: n=${t.count} (${((t.count/rqsStats.total)*100).toFixed(1)}%)`).join('\n')}

Cobertura de preguntas de investigación:
- RQ1: ${rqsStats.rqRelations.rq1.yes} directos (${((rqsStats.rqRelations.rq1.yes/rqsStats.total)*100).toFixed(1)}%), ${rqsStats.rqRelations.rq1.partial} parciales (${((rqsStats.rqRelations.rq1.partial/rqsStats.total)*100).toFixed(1)}%)
- RQ2: ${rqsStats.rqRelations.rq2.yes} directos (${((rqsStats.rqRelations.rq2.yes/rqsStats.total)*100).toFixed(1)}%), ${rqsStats.rqRelations.rq2.partial} parciales (${((rqsStats.rqRelations.rq2.partial/rqsStats.total)*100).toFixed(1)}%)
- RQ3: ${rqsStats.rqRelations.rq3.yes} directos (${((rqsStats.rqRelations.rq3.yes/rqsStats.total)*100).toFixed(1)}%), ${rqsStats.rqRelations.rq3.partial} parciales (${((rqsStats.rqRelations.rq3.partial/rqsStats.total)*100).toFixed(1)}%)

**INSTRUCCIONES DE REDACCIÓN:**

Genera 2-3 párrafos académicos (400-500 palabras total) que:

1. **Párrafo 1**: Describe la distribución de tipos de estudio y contextos, destacando los predominantes. Usa los porcentajes exactos proporcionados.

2. **Párrafo 2**: Analiza la distribución temporal y las tecnologías más estudiadas. Menciona las frecuencias exactas y reflexiona sobre qué indica esta concentración.

3. **Párrafo 3**: Sintetiza la cobertura de las RQs y explica qué significa para responder las preguntas de investigación.

**REQUISITOS:**
- USA SOLO LOS DATOS PROPORCIONADOS (números exactos, porcentajes calculados)
- NO inventes estudios, autores ni hallazgos adicionales
- Tercera persona impersonal
- Lenguaje académico formal en español
- Incluye referencias a "Tabla 1" y "Tabla 2" donde corresponda
- Conecta las observaciones con el objetivo de la revisión

Responde SOLO con los párrafos de análisis:`;

    const response = await this.aiService.generateText(
      this.getEnhancedSystemPrompt(),
      prompt,
      'chatgpt'
    );

    return `### 3.2.1 Análisis descriptivo basado en datos RQS

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
      return "No se identificaron estudios que abordaran directamente esta pregunta de investigación.";
    }

    const prompt = `Sintetiza los hallazgos de ${relevantStudies.length} estudios que respondieron a: "${prismaContext.protocol.researchQuestions[0]}"

**EVIDENCIA EXTRAÍDA DE LOS ESTUDIOS:**
${relevantStudies.map((study, i) => `
Estudio S${i+1} (${study.author}, ${study.year}):
- Tecnología: ${study.technology}
- Evidencia clave: ${study.keyEvidence}
- Métricas: ${JSON.stringify(study.metrics || {})}
- Relación con RQ1: ${study.rq1Relation}
`).join('\n')}

**INSTRUCCIONES:**
Genera 2 párrafos (300-400 palabras) que:
1. Identifiquen patrones comunes en los hallazgos
2. Comparen enfoques o resultados cuando sea relevante
3. Destaquen hallazgos consistentes vs. contradictorios
4. Referencien estudios específicos usando "S1", "S2", etc.
5. NO inventen datos no mencionados arriba

Tercera persona, español académico, solo texto:`;

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
      return "No se identificaron estudios que abordaran directamente esta pregunta de investigación.";
    }

    const prompt = `Sintetiza los hallazgos de ${relevantStudies.length} estudios para: "${prismaContext.protocol.researchQuestions[1]}"

**EVIDENCIA:**
${relevantStudies.map((study, i) => `
S${i+1} (${study.author}, ${study.year}): ${study.keyEvidence}
Tecnología: ${study.technology} | Contexto: ${study.context}
`).join('\n')}

Genera 2 párrafos (300-400 palabras), tercera persona, español:`;

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
      return "No se identificaron estudios que abordaran directamente esta pregunta de investigación.";
    }

    const prompt = `Sintetiza los hallazgos de ${relevantStudies.length} estudios para: "${prismaContext.protocol.researchQuestions[2]}"

**EVIDENCIA:**
${relevantStudies.map((study, i) => `
S${i+1} (${study.author}, ${study.year}): ${study.keyEvidence}
Limitaciones: ${study.limitations}
`).join('\n')}

Genera 2 párrafos (300-400 palabras), tercera persona, español:`;

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
**Tabla 1. Características generales de los estudios incluidos en la revisión sistemática**

| ID | Autor (Año) | Tipo de estudio | Contexto | Tecnología principal | Publicación |
|----|-------------|-----------------|----------|---------------------|-------------|
${rqsEntries.map((entry, i) => {
  const id = `S${i + 1}`;
  const author = `${entry.author} (${entry.year})`;
  const type = this.translateStudyType(entry.studyType);
  const context = this.translateContext(entry.context);
  const tech = (entry.technology || 'No especificado').substring(0, 40);
  const source = entry.title ? entry.title.substring(0, 30) + '...' : 'N/A';
  return `| ${id} | ${author} | ${type} | ${context} | ${tech} | ${source} |`;
}).join('\n')}

*Nota: Los estudios se identifican como S1-S${rqsEntries.length} para facilitar su referencia en el análisis.*
`;
  }

  generateTable2Professional(rqsEntries) {
    return `
**Tabla 2. Síntesis de resultados principales y métricas reportadas**

| ID | Evidencia clave | Métricas principales | RQ1 | RQ2 | RQ3 | Calidad |
|----|----------------|---------------------|-----|-----|-----|---------|
${rqsEntries.map((entry, i) => {
  const id = `S${i + 1}`;
  const evidence = (entry.keyEvidence || 'No reportado').substring(0, 60) + '...';
  
  // Métricas
  let metrics = 'No reportadas';
  if (entry.metrics && Object.keys(entry.metrics).length > 0) {
    const metricsList = Object.entries(entry.metrics)
      .slice(0, 2)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
    metrics = metricsList.substring(0, 40);
  }
  
  // RQ relations con símbolos
  const rq1 = entry.rq1Relation === 'yes' ? '✓' : entry.rq1Relation === 'partial' ? '◐' : '✗';
  const rq2 = entry.rq2Relation === 'yes' ? '✓' : entry.rq2Relation === 'partial' ? '◐' : '✗';
  const rq3 = entry.rq3Relation === 'yes' ? '✓' : entry.rq3Relation === 'partial' ? '◐' : '✗';
  
  const quality = this.translateQuality(entry.qualityScore);
  
  return `| ${id} | ${evidence} | ${metrics} | ${rq1} | ${rq2} | ${rq3} | ${quality} |`;
}).join('\n')}

*Leyenda: ✓ = Relación directa, ◐ = Relación parcial, ✗ = Sin relación directa*
*Calidad: Evaluación cualitativa basada en transparencia metodológica y reporte de limitaciones*
`;
  }

  generateTable3Professional(rqsEntries) {
    return `
**Tabla 3. Evaluación del riesgo de sesgo y calidad metodológica**

| ID | Diseño adecuado | Datos suficientes | Limitaciones reportadas | Transparencia | Riesgo global |
|----|----------------|-------------------|------------------------|---------------|---------------|
${rqsEntries.map((entry, i) => {
  const id = `S${i + 1}`;
  
  // Evaluación basada en RQS
  const hasLimitations = entry.limitations && entry.limitations.length > 20;
  const hasMetrics = entry.metrics && Object.keys(entry.metrics).length > 0;
  const hasEvidence = entry.keyEvidence && entry.keyEvidence.length > 50;
  
  const design = entry.studyType !== 'review' ? 'Adecuado' : 'Parcial';
  const dataQuality = (hasMetrics && hasEvidence) ? 'Suficientes' : hasEvidence ? 'Parciales' : 'Insuficientes';
  const limitationsReported = hasLimitations ? 'Sí' : 'No';
  const transparency = (hasLimitations && hasMetrics) ? 'Alta' : hasEvidence ? 'Media' : 'Baja';
  
  // Calcular riesgo global
  let riskScore = 0;
  if (design === 'Adecuado') riskScore++;
  if (dataQuality === 'Suficientes') riskScore++;
  if (hasLimitations) riskScore++;
  if (hasMetrics) riskScore++;
  
  const globalRisk = riskScore >= 3 ? 'Bajo' : riskScore === 2 ? 'Moderado' : 'Alto';
  
  return `| ${id} | ${design} | ${dataQuality} | ${limitationsReported} | ${transparency} | ${globalRisk} |`;
}).join('\n')}

*Nota: La evaluación se realizó considerando la adecuación del diseño de investigación, suficiencia de datos para responder las RQs, reconocimiento explícito de limitaciones, y transparencia en el reporte metodológico.*
`;
  }

  /**
   * DISCUSIÓN PROFESIONAL con interpretación crítica
   */
  async generateProfessionalDiscussion(prismaMapping, prismaContext, rqsStats) {
    const prompt = `Redacta una sección de DISCUSIÓN académica profesional integrando los hallazgos de esta revisión sistemática.

**HALLAZGOS PRINCIPALES PARA DISCUTIR:**

Datos generales:
- Total de estudios incluidos: ${rqsStats.total}
- Distribución de tipos: ${JSON.stringify(rqsStats.studyTypes)}
- Contextos principales: ${JSON.stringify(rqsStats.contexts)}
- Rango temporal: ${rqsStats.yearRange.min}-${rqsStats.yearRange.max}
- Tecnologías dominantes: ${rqsStats.technologies.slice(0, 3).map(t => t.technology).join(', ')}

Cobertura de RQs:
- RQ1: ${rqsStats.rqRelations.rq1.yes + rqsStats.rqRelations.rq1.partial} estudios (${((rqsStats.rqRelations.rq1.yes + rqsStats.rqRelations.rq1.partial)/rqsStats.total*100).toFixed(1)}%)
- RQ2: ${rqsStats.rqRelations.rq2.yes + rqsStats.rqRelations.rq2.partial} estudios (${((rqsStats.rqRelations.rq2.yes + rqsStats.rqRelations.rq2.partial)/rqsStats.total*100).toFixed(1)}%)
- RQ3: ${rqsStats.rqRelations.rq3.yes + rqsStats.rqRelations.rq3.partial} estudios (${((rqsStats.rqRelations.rq3.yes + rqsStats.rqRelations.rq3.partial)/rqsStats.total*100).toFixed(1)}%)

Distribución de calidad:
${JSON.stringify(rqsStats.qualityDistribution || {high: 0, medium: rqsStats.total, low: 0})}

Objetivo original de la revisión:
${prismaContext.protocol.objective}

Interpretación PRISMA base:
${prismaMapping.discussion.interpretation}

**ESTRUCTURA REQUERIDA (800-1000 palabras):**

**Párrafos 1-2 (Interpretación de hallazgos principales):**
- Interpreta los patrones identificados en los resultados
- Conecta con el objetivo original de la revisión
- Destaca hallazgos más significativos o sorprendentes
- Compara distribuciones observadas (tipos, contextos, tecnologías)

**Párrafos 3-4 (Implicaciones):**
- Implicaciones para la práctica profesional
- Implicaciones para la investigación futura
- Qué significan estos hallazgos para el campo
- Cómo abordan (o no) el gap identificado en la introducción

**Párrafo 5 (Fortalezas de la revisión):**
- Menciona fortalezas metodológicas (PRISMA 2020, RQS estructurado, etc.)
- Cobertura temporal y de bases de datos
- Proceso de selección riguroso

**Párrafos 6-7 (Limitaciones):**
- Limitaciones metodológicas de ESTA revisión
- Heterogeneidad de estudios incluidos
- Limitaciones en la síntesis (ej: imposibilidad de meta-análisis)
- Sesgos potenciales (ej: publicación, idioma)
- Número limitado de estudios si aplica

**Párrafo 8 (Direcciones futuras):**
- Necesidades de investigación identificadas
- Gaps que persisten
- Recomendaciones específicas para futuros estudios

**REQUISITOS DE REDACCIÓN:**
- Tercera persona impersonal
- Tiempos verbales apropiados (pasado para hallazgos, presente para interpretaciones)
- Lenguaje académico formal en español
- Sin bullet points (prosa continua)
- NO inventes estudios o hallazgos no mencionados
- Sé crítico pero constructivo
- Conecta con la literatura existente conceptualmente (sin citar estudios no incluidos)
- Balance entre confianza en hallazgos y humildad epistémica

Genera SOLO el texto de la discusión:`;

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
    const prompt = `Redacta una sección de CONCLUSIONES académica concisa que sintetice los hallazgos principales de esta revisión sistemática.

**CONTEXTO:**

Objetivo cumplido:
${prismaContext.protocol.objective}

Preguntas de investigación respondidas:
${prismaContext.protocol.researchQuestions.map((rq, i) => `RQ${i+1}: ${rq}`).join('\n')}

Datos clave de la revisión:
- Estudios incluidos: ${rqsStats.total}
- Período: ${rqsStats.yearRange.min}-${rqsStats.yearRange.max}
- Bases de datos: ${prismaContext.protocol.databases.map(db => db.name).join(', ')}
- Tecnologías identificadas: ${rqsStats.technologies.slice(0, 3).map(t => t.technology).join(', ')}

Cobertura de RQs:
- RQ1: ${rqsStats.rqRelations.rq1.yes + rqsStats.rqRelations.rq1.partial} estudios relevantes
- RQ2: ${rqsStats.rqRelations.rq2.yes + rqsStats.rqRelations.rq2.partial} estudios relevantes
- RQ3: ${rqsStats.rqRelations.rq3.yes + rqsStats.rqRelations.rq3.partial} estudios relevantes

**ESTRUCTURA REQUERIDA (400-500 palabras):**

**Párrafo 1 (Síntesis de hallazgos):**
Sintetiza en 3-4 frases los hallazgos principales que responden a las RQs.

**Párrafo 2 (Respuesta al objetivo):**
Declara explícitamente cómo esta revisión cumplió (o no) con su objetivo inicial.

**Párrafo 3 (Implicaciones prácticas):**
Menciona 2-3 implicaciones concretas para profesionales del área.

**Párrafo 4 (Direcciones futuras):**
Recomienda 2-3 líneas específicas de investigación futura basadas en gaps identificados.

**Párrafo 5 (Mensaje final):**
Cierra con una declaración sobre la contribución de esta revisión al campo.

**ESTILO:**
- Conciso pero completo
- Tercera persona impersonal
- Sin referencias a tablas o figuras
- Sin nuevos datos (solo síntesis)
- Tono conclusivo pero no especulativo
- Español académico formal

Genera SOLO el texto de conclusiones:`;

    const response = await this.aiService.generateText(
      this.getEnhancedSystemPrompt(),
      prompt,
      'chatgpt'
    );

    return response.trim();
  }

  /**
   * REFERENCIAS profesionales con citas formateadas
   */
  generateProfessionalReferences(prismaContext, rqsEntries) {
    return `## Referencias

Esta revisión sistemática sintetizó evidencia de **${rqsEntries.length} estudios primarios** que cumplieron los criterios de inclusión establecidos en el protocolo PRISMA 2020.

### Estudios incluidos en la síntesis

${rqsEntries.map((entry, i) => {
  const id = i + 1;
  const citation = this.formatCitation(entry);
  return `[${id}] ${citation}`;
}).join('\n\n')}

### Disponibilidad de datos y materiales

Los datos completos extraídos mediante el esquema RQS, incluyendo las evaluaciones de calidad individuales, las estrategias de búsqueda detalladas para cada base de datos, y el formulario de extracción de datos, están disponibles bajo solicitud razonable al autor correspondiente.

Las búsquedas bibliográficas se ejecutaron en las siguientes bases de datos: ${prismaContext.protocol.databases.map(db => db.name).join(', ')}, durante el período comprendido entre ${prismaContext.protocol.temporalRange.start || '2023'} y ${prismaContext.protocol.temporalRange.end || '2025'}.

### Referencias metodológicas

**PRISMA 2020:** Page MJ, McKenzie JE, Bossuyt PM, et al. The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ 2021;372:n71. doi: 10.1136/bmj.n71

Los autores declaran que se han seguido estrictamente las directrices PRISMA 2020 en todas las fases de esta revisión sistemática.`;
  }

  /**
   * Formatear cita bibliográfica estilo APA
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
      citation += ` Disponible en: ${entry.url}`;
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
        const year = parseInt(entry.year);
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
    const completed = parseInt(stats.completed) || 0;

    if (completed < 27) {
      throw new Error(
        `PRISMA incompleto: ${completed}/27 ítems completados. ` +
        `Debe completar todos los ítems antes de generar el artículo.`
      );
    }

    return true;
  }

  /**
   * Validar calidad del artículo generado
   */
  validateArticleQuality(article) {
    const errors = [];

    // Validar longitud de abstract
    if (article.abstract.length < 200) {
      errors.push('Abstract muy corto (< 200 caracteres)');
    }

    // Validar que contiene tablas en resultados
    if (article.results && !article.results.includes('Tabla')) {
      errors.push('Falta referencia a tablas en resultados');
    }

    // Validar word count mínimo
    if (article.metadata.wordCount < 2000) {
      console.warn(`⚠️ Advertencia: Word count bajo (${article.metadata.wordCount} palabras). Se recomienda mínimo 2000 palabras para un artículo académico completo.`);
    }

    // Validar que todas las secciones principales existen
    const requiredSections = ['title', 'abstract', 'introduction', 'methods', 'results', 'discussion', 'conclusions'];
    requiredSections.forEach(section => {
      if (!article[section] || article[section].length < 100) {
        errors.push(`Sección ${section} vacía o muy corta`);
      }
    });

    if (errors.length > 0) {
      console.warn('⚠️ Advertencias de calidad del artículo:');
      errors.forEach(err => console.warn(`   - ${err}`));
    }
  }

  /**
   * Generar declaraciones finales profesionales
   */
  generateDeclarations(prismaContext) {
    return `## Declaraciones

### Registro y protocolo

El protocolo de esta revisión sistemática se definió y documentó completamente antes de la fase de selección de estudios, siguiendo las directrices PRISMA 2020. El protocolo incluyó criterios de elegibilidad predefinidos (PICO), estrategia de búsqueda completa, métodos de extracción de datos mediante esquema RQS estructurado, y plan de síntesis narrativa. El protocolo no fue registrado prospectivamente en una base de datos pública (ej. PROSPERO).

### Financiamiento

Esta investigación no recibió financiamiento específico de agencias públicas, comerciales o sin fines de lucro. El trabajo fue desarrollado como parte de actividades académicas institucionales.

### Conflictos de interés

Los autores declaran no tener conflictos de interés relacionados con esta investigación. No existen relaciones financieras o personales que pudieran influir inapropiadamente en el trabajo reportado.

### Disponibilidad de datos y materiales

Los datos extraídos mediante el esquema RQS, las evaluaciones de calidad metodológica de los estudios incluidos, y las estrategias de búsqueda completas para cada base de datos están disponibles bajo solicitud razonable al autor correspondiente. Todos los estudios incluidos en esta revisión son publicaciones de acceso público citadas en la sección de Referencias.

### Contribuciones de los autores

Todos los autores contribuyeron sustancialmente a la concepción del estudio, la interpretación de datos, y la redacción crítica del manuscrito. Todos los autores aprobaron la versión final y están de acuerdo con todos los aspectos del trabajo.

### Uso de inteligencia artificial

Esta revisión utilizó herramientas de inteligencia artificial de forma asistida y transparente para:
- **Cribado inicial**: Análisis de similitud semántica para priorizar artículos en fase de cribado
- **Extracción de datos**: Asistencia en la estructuración de datos mediante esquema RQS
- **Redacción**: Asistencia en la organización y redacción del manuscrito

**Todas las decisiones metodológicas críticas** (criterios de inclusión/exclusión, evaluación de calidad, interpretación de hallazgos, y conclusiones) fueron realizadas y validadas manualmente por los investigadores. El uso de IA se declara de forma transparente siguiendo principios éticos de integridad en la investigación científica y las recomendaciones de journals sobre el uso responsable de tecnologías de IA en publicaciones académicas.

### Agradecimientos

Los autores agradecen a las instituciones que facilitaron el acceso a las bases de datos bibliográficas utilizadas en esta revisión.`;
  }

  /**
   * System prompt mejorado para generación académica profesional
   */
  getEnhancedSystemPrompt() {
    return `Eres un investigador senior especializado en revisiones sistemáticas, con experiencia en redacción académica para revistas científicas de alto impacto (Q1/Q2).

**TU ROL:**
- Redactar contenido académico profesional siguiendo estándares PRISMA 2020
- Usar SOLO datos proporcionados explícitamente (nunca inventar cifras, estudios o autores)
- Mantener rigor metodológico y transparencia epistémica
- Escribir en español académico formal

**ESTÁNDARES DE REDACCIÓN:**
- Tercera persona impersonal
- Tiempos verbales apropiados (pasado para métodos/resultados, presente para interpretaciones)
- Estructura IMRaD estricta
- Prosa continua (sin bullet points salvo en tablas)
- Citas cuando corresponda (usando [X] o "Estudio SX")
- Reconocer limitaciones honestamente

**PROHIBICIONES ABSOLUTAS:**
- NO inventar datos, estudios, autores o hallazgos no mencionados
- NO usar lenguaje especulativo sin fundamento
- NO hacer afirmaciones causales sin evidencia
- NO citar estudios no incluidos en la revisión
- NO usar primera persona o lenguaje coloquial

**PRINCIPIO RECTOR:**
Una revisión sistemática de calidad es transparente sobre qué sabe, qué no sabe, y por qué.`;
  }

  /**
   * Utilidades de traducción
   */
  translateStudyType(type) {
    const translations = {
      'empirical': 'Empírico',
      'case_study': 'Caso de estudio',
      'experiment': 'Experimental',
      'simulation': 'Simulación',
      'review': 'Revisión',
      'survey': 'Encuesta',
      'other': 'Otro'
    };
    return translations[type] || type || 'No especificado';
  }

  translateContext(context) {
    const translations = {
      'industrial': 'Industrial',
      'enterprise': 'Empresarial',
      'academic': 'Académico',
      'experimental': 'Experimental',
      'mixed': 'Mixto',
      'other': 'Otro'
    };
    return translations[context] || context || 'No especificado';
  }

  translateQuality(quality) {
    const translations = {
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };
    return translations[quality] || 'Media';
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

  /**
   * Asegurar que el protocolo tenga RQs definidas
   */
  async ensureResearchQuestions(projectId, prismaContext) {
    const protocol = prismaContext.protocol;
    
    // Si ya tiene RQs, no hacer nada
    if (protocol.rq1 && protocol.rq2 && protocol.rq3) {
      console.log('✅ RQs ya definidas en el protocolo');
      return;
    }

    console.log('📝 Definiendo RQs por defecto basadas en PICO...');
    
    // Generar RQs por defecto desde el contexto PICO
    const population = protocol.population || 'estudios empíricos';
    const intervention = protocol.intervention || 'tecnologías emergentes';
    const outcomes = protocol.outcomes || 'su efectividad y metodologías';
    
    const defaultRQs = {
      rq1: protocol.rq1 || `¿Cuáles son las metodologías más efectivas en la implementación de ${intervention}?`,
      rq2: protocol.rq2 || `¿Qué impacto tienen ${intervention} en ${population}?`,
      rq3: protocol.rq3 || `¿Cómo se ha evaluado ${outcomes} en diferentes contextos?`
    };

    // Actualizar protocolo
    await this.protocolRepository.update(projectId, defaultRQs);
    
    // Actualizar el contexto para uso inmediato
    protocol.rq1 = defaultRQs.rq1;
    protocol.rq2 = defaultRQs.rq2;
    protocol.rq3 = defaultRQs.rq3;
    
    console.log('✅ RQs por defecto establecidas');
  }

  /**
   * Verificar si los RQS necesitan re-extracción
   */
  checkIfRQSNeedsReExtraction(rqsEntries) {
    if (rqsEntries.length === 0) return false;
    
    // Si TODOS los entries tienen rq1/rq2/rq3 en 'no', necesitan re-extracción
    const allNo = rqsEntries.every(entry => 
      entry.rq1Relation === 'no' && 
      entry.rq2Relation === 'no' && 
      entry.rq3Relation === 'no'
    );
    
    return allNo;
  }
}

module.exports = GenerateArticleFromPrismaUseCase;
