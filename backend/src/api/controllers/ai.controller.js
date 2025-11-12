const GenerateProtocolAnalysisUseCase = require('../../domain/use-cases/generate-protocol-analysis.use-case');
const GenerateTitleFromQuestionUseCase = require('../../domain/use-cases/generate-title-from-question.use-case');
const ScreenReferencesWithAIUseCase = require('../../domain/use-cases/screen-references-with-ai.use-case');
const RefineSearchStringUseCase = require('../../domain/use-cases/refine-search-string.use-case');
const GenerateTitlesUseCase = require('../../domain/use-cases/generate-titles.use-case');
const GenerateSearchStrategiesUseCase = require('../../domain/use-cases/generate-search-strategies.use-case');

const generateProtocolAnalysisUseCase = new GenerateProtocolAnalysisUseCase();
const generateTitleUseCase = new GenerateTitleFromQuestionUseCase();
const screenReferencesUseCase = new ScreenReferencesWithAIUseCase();
const refineSearchStringUseCase = new RefineSearchStringUseCase();
const generateTitlesUseCase = new GenerateTitlesUseCase();
const generateSearchStrategiesUseCase = new GenerateSearchStrategiesUseCase();

/**
 * POST /api/ai/protocol-analysis
 * Genera análisis de protocolo con IA
 */
const generateProtocolAnalysis = async (req, res) => {
  try {
    const { title, description, aiProvider } = req.body;

    // Validaciones
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Título y descripción son requeridos'
      });
    }

    console.log('🤖 Generando análisis de protocolo con IA...');
    console.log('   Proveedor:', aiProvider || 'chatgpt');
    console.log('   Título:', title.substring(0, 50) + '...');

    const result = await generateProtocolAnalysisUseCase.execute({
      title,
      description,
      aiProvider: aiProvider || 'chatgpt'
    });

    console.log('✅ Análisis generado exitosamente');

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error generando análisis:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al generar análisis con IA'
    });
  }
};

/**
 * POST /api/ai/generate-title
 * Genera título basado en pregunta de investigación
 */
const generateTitle = async (req, res) => {
  try {
    const { researchQuestion, aiProvider } = req.body;

    if (!researchQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Pregunta de investigación es requerida'
      });
    }

    console.log('🤖 Generando título desde pregunta de investigación...');
    console.log('   Proveedor:', aiProvider || 'chatgpt');

    const result = await generateTitleUseCase.execute({
      researchQuestion,
      aiProvider: aiProvider || 'chatgpt'
    });

    console.log('✅ Título generado exitosamente');

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error generando título:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al generar título con IA'
    });
  }
};

/**
 * POST /api/ai/screen-reference
 * Analiza una referencia individual con IA
 */
const screenReference = async (req, res) => {
  try {
    const { reference, inclusionCriteria, exclusionCriteria, researchQuestion, aiProvider } = req.body;

    if (!reference || !reference.title) {
      return res.status(400).json({
        success: false,
        message: 'Referencia con título es requerida'
      });
    }

    console.log('🤖 Analizando referencia con IA...');
    console.log('   Título:', reference.title.substring(0, 50) + '...');
    console.log('   Proveedor:', aiProvider || 'chatgpt');

    const result = await screenReferencesUseCase.execute({
      reference,
      inclusionCriteria,
      exclusionCriteria,
      researchQuestion,
      aiProvider: aiProvider || 'chatgpt'
    });

    console.log('✅ Referencia analizada:', result.data.decision);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error en screening:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al analizar referencia con IA'
    });
  }
};

/**
 * POST /api/ai/screen-references-batch
 * Analiza múltiples referencias en lote
 */
const screenReferencesBatch = async (req, res) => {
  try {
    const { references, inclusionCriteria, exclusionCriteria, researchQuestion, aiProvider } = req.body;

    if (!references || !Array.isArray(references) || references.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array de referencias es requerido'
      });
    }

    console.log('🤖 Analizando lote de referencias con IA...');
    console.log('   Cantidad:', references.length);
    console.log('   Proveedor:', aiProvider || 'chatgpt');

    const result = await screenReferencesUseCase.executeBatch({
      references,
      inclusionCriteria,
      exclusionCriteria,
      researchQuestion,
      aiProvider: aiProvider || 'chatgpt'
    });

    console.log('✅ Lote analizado exitosamente');
    console.log('   Incluidas:', result.summary.incluidas);
    console.log('   Excluidas:', result.summary.excluidas);
    console.log('   A revisar:', result.summary.revisar_manual);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error en screening por lotes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al analizar referencias con IA'
    });
  }
};

/**
 * POST /api/ai/refine-search-string
 * Refina la cadena de búsqueda basándose en resultados
 */
const refineSearchString = async (req, res) => {
  try {
    const { currentSearchString, searchResults, researchQuestion, databases, aiProvider } = req.body;

    if (!currentSearchString) {
      return res.status(400).json({
        success: false,
        message: 'Cadena de búsqueda actual es requerida'
      });
    }

    console.log('🤖 Refinando cadena de búsqueda con IA...');
    console.log('   Proveedor:', aiProvider || 'chatgpt');
    console.log('   Resultados a analizar:', searchResults?.length || 0);

    const result = await refineSearchStringUseCase.execute({
      currentSearchString,
      searchResults,
      researchQuestion,
      databases,
      aiProvider: aiProvider || 'chatgpt'
    });

    console.log('✅ Cadena de búsqueda refinada');

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error refinando búsqueda:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al refinar cadena de búsqueda'
    });
  }
};

/**
 * POST /api/ai/generate-titles
 * Genera 5 opciones de títulos con validación Cochrane
 */
const generateTitles = async (req, res) => {
  try {
    const { matrixData, picoData, aiProvider } = req.body;

    // Validaciones básicas
    if (!matrixData && !picoData) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos matrixData o picoData'
      });
    }

    console.log('🤖 Generando 5 títulos con validación Cochrane...');
    console.log('   Proveedor:', aiProvider || 'gemini');
    console.log('   Matriz:', matrixData ? '✓' : '✗');
    console.log('   PICO:', picoData ? '✓' : '✗');

    const result = await generateTitlesUseCase.execute({
      matrixData,
      picoData,
      aiProvider: aiProvider || 'gemini'
    });

    console.log('✅ Títulos generados exitosamente');
    console.log('   Cantidad:', result.data?.titles?.length || 0);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error generando títulos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al generar títulos con IA'
    });
  }
};

/**
 * POST /api/ai/generate-search-strategies
 * Genera estrategias de búsqueda específicas por base de datos
 */
const generateSearchStrategies = async (req, res) => {
  try {
    const { matrixData, picoData, keyTerms, databases, aiProvider } = req.body;

    // Validaciones
    if (!matrixData && !picoData) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos matrixData o picoData'
      });
    }

    if (!databases || !Array.isArray(databases) || databases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de bases de datos'
      });
    }

    console.log('🤖 Generando estrategias de búsqueda por base de datos...');
    console.log('   Proveedor:', aiProvider || 'gemini');
    console.log('   Bases de datos:', databases.join(', '));

    const result = await generateSearchStrategiesUseCase.execute({
      matrixData,
      picoData,
      keyTerms,
      databases,
      aiProvider: aiProvider || 'gemini'
    });

    console.log('✅ Estrategias generadas exitosamente');
    console.log('   Bases de datos procesadas:', Object.keys(result.data?.strategies || {}).length);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error generando estrategias:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al generar estrategias de búsqueda'
    });
  }
};

module.exports = {
  generateProtocolAnalysis,
  generateTitle,
  screenReference,
  screenReferencesBatch,
  refineSearchString,
  generateTitles,
  generateSearchStrategies
};

