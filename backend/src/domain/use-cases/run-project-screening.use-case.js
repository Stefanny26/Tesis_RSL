const ReferenceRepository = require('../../infrastructure/repositories/reference.repository');
const ScreenReferencesWithAIUseCase = require('./screen-references-with-ai.use-case');
const ScreenReferencesWithEmbeddingsUseCase = require('./screen-references-embeddings.use-case');

/**
 * Use Case: Ejecutar Cribado Completo de Proyecto
 * 
 * Ejecuta el cribado automático de todas las referencias pendientes
 * de un proyecto utilizando IA (LLM o Embeddings).
 */
class RunProjectScreeningUseCase {
  constructor() {
    this.referenceRepository = new ReferenceRepository();
    this.screenAIUseCase = new ScreenReferencesWithAIUseCase();
    this.screenEmbeddingsUseCase = new ScreenReferencesWithEmbeddingsUseCase();
  }

  /**
   * Ejecuta cribado con embeddings para todo el proyecto
   */
  async executeEmbeddings({ projectId, protocol, threshold = 0.7 }) {
    try {
      console.log(`🔍 Ejecutando cribado con embeddings para proyecto ${projectId}...`);

      // Obtener referencias pendientes
      const references = await this.referenceRepository.getPendingReferences(projectId);
      
      if (references.length === 0) {
        return {
          success: true,
          message: 'No hay referencias pendientes para cribar',
          summary: {
            total: 0,
            processed: 0,
            included: 0,
            excluded: 0
          }
        };
      }

      console.log(`📚 Encontradas ${references.length} referencias pendientes`);

      // Ejecutar cribado batch con embeddings
      const result = await this.screenEmbeddingsUseCase.executeBatch({
        references,
        protocol,
        threshold
      });

      // Actualizar referencias en la base de datos
      let included = 0;
      let excluded = 0;

      for (const screening of result.results) {
        if (screening.success) {
          await this.referenceRepository.updateScreeningResult({
            referenceId: screening.referenceId,
            aiRecommendation: screening.recommendation,
            aiReasoning: screening.reasoning,
            aiConfidence: screening.confidence,
            similarityScore: screening.similarity,
            screeningStatus: 'pending' // El usuario debe revisar
          });

          if (screening.recommendation === 'include') included++;
          else excluded++;
        }
      }

      console.log(`✅ Cribado completado: ${included} incluir, ${excluded} excluir`);

      return {
        success: true,
        summary: {
          total: references.length,
          processed: result.summary.successful,
          failed: result.summary.failed,
          included,
          excluded,
          avgSimilarity: result.summary.avgSimilarity,
          durationMs: result.summary.durationMs
        }
      };

    } catch (error) {
      console.error('❌ Error ejecutando cribado con embeddings:', error);
      throw error;
    }
  }

  /**
   * Ejecuta cribado con LLM para todo el proyecto
   */
  async executeLLM({ projectId, protocol, model = 'gemini-2.0-flash-exp' }) {
    try {
      console.log(`🔍 Ejecutando cribado con LLM para proyecto ${projectId}...`);

      // Obtener referencias pendientes
      const references = await this.referenceRepository.getPendingReferences(projectId);
      
      if (references.length === 0) {
        return {
          success: true,
          message: 'No hay referencias pendientes para cribar',
          summary: {
            total: 0,
            processed: 0,
            included: 0,
            excluded: 0
          }
        };
      }

      console.log(`📚 Encontradas ${references.length} referencias pendientes`);

      // Procesar referencias una por una con LLM
      let included = 0;
      let excluded = 0;
      let processed = 0;
      const errors = [];

      for (const reference of references) {
        try {
          const result = await this.screenAIUseCase.execute({
            reference,
            protocol,
            model
          });

          await this.referenceRepository.updateScreeningResult({
            referenceId: reference.id,
            aiRecommendation: result.recommendation,
            aiReasoning: result.reasoning,
            aiConfidence: result.confidence,
            screeningStatus: 'pending'
          });

          if (result.recommendation === 'include') included++;
          else excluded++;
          processed++;

          console.log(`✓ ${processed}/${references.length}: ${reference.title.substring(0, 50)}...`);

        } catch (error) {
          console.error(`❌ Error procesando referencia ${reference.id}:`, error);
          errors.push({ referenceId: reference.id, error: error.message });
        }
      }

      console.log(`✅ Cribado completado: ${included} incluir, ${excluded} excluir`);

      return {
        success: true,
        summary: {
          total: references.length,
          processed,
          failed: errors.length,
          included,
          excluded
        },
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('❌ Error ejecutando cribado con LLM:', error);
      throw error;
    }
  }
}

module.exports = RunProjectScreeningUseCase;

