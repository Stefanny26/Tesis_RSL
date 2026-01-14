/**
 * Use Case: Analizar Resultados de Cribado
 * 
 * Analiza y genera estadísticas sobre los resultados del cribado
 * de referencias de un proyecto.
 */
class AnalyzeScreeningResultsUseCase {
  constructor({ referenceRepository }) {
    this.referenceRepository = referenceRepository;
  }

  /**
   * Analiza los resultados de cribado de un proyecto
   */
  async execute(projectId) {
    try {
      console.log(`📊 Analizando resultados de cribado para proyecto ${projectId}...`);

      // Obtener todas las referencias del proyecto
      const allReferences = await this.referenceRepository.getByProject(projectId);

      // Calcular estadísticas
      const stats = {
        total: allReferences.length,
        byStatus: {
          pending: 0,
          included: 0,
          excluded: 0,
          maybe: 0
        },
        byAIRecommendation: {
          include: 0,
          exclude: 0,
          maybe: 0,
          none: 0
        },
        withAI: 0,
        withoutAI: 0,
        avgConfidence: 0,
        avgSimilarity: 0,
        disagreements: 0 // Cuando la decisión humana difiere de la IA
      };

      let totalConfidence = 0;
      let totalSimilarity = 0;
      let confidenceCount = 0;
      let similarityCount = 0;

      for (const ref of allReferences) {
        // Contar por estado
        const status = ref.screening_status || 'pending';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        // Contar por recomendación de IA
        if (ref.ai_recommendation) {
          stats.byAIRecommendation[ref.ai_recommendation]++;
          stats.withAI++;

          // Calcular promedios
          if (ref.ai_confidence != null) {
            totalConfidence += ref.ai_confidence;
            confidenceCount++;
          }

          if (ref.similarity_score != null) {
            totalSimilarity += ref.similarity_score;
            similarityCount++;
          }

          // Detectar desacuerdos
          if (status !== 'pending' && status !== ref.ai_recommendation) {
            stats.disagreements++;
          }
        } else {
          stats.byAIRecommendation.none++;
          stats.withoutAI++;
        }
      }

      // Calcular promedios
      stats.avgConfidence = confidenceCount > 0 
        ? parseFloat((totalConfidence / confidenceCount).toFixed(3))
        : 0;
      
      stats.avgSimilarity = similarityCount > 0
        ? parseFloat((totalSimilarity / similarityCount).toFixed(4))
        : 0;

      // Calcular porcentajes
      stats.percentages = {
        pending: ((stats.byStatus.pending / stats.total) * 100).toFixed(1),
        included: ((stats.byStatus.included / stats.total) * 100).toFixed(1),
        excluded: ((stats.byStatus.excluded / stats.total) * 100).toFixed(1),
        withAI: ((stats.withAI / stats.total) * 100).toFixed(1),
        disagreementRate: stats.withAI > 0 
          ? ((stats.disagreements / stats.withAI) * 100).toFixed(1)
          : 0
      };

      // Generar insights
      stats.insights = this.generateInsights(stats);

      console.log('✅ Análisis completado');
      console.log(`   Total: ${stats.total} | Pendientes: ${stats.byStatus.pending} | Incluidas: ${stats.byStatus.included} | Excluidas: ${stats.byStatus.excluded}`);

      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('❌ Error analizando resultados:', error);
      throw error;
    }
  }

  /**
   * Genera insights basados en las estadísticas
   */
  generateInsights(stats) {
    const insights = [];

    // Insight sobre progreso
    if (stats.byStatus.pending > 0) {
      insights.push({
        type: 'info',
        message: `Tienes ${stats.byStatus.pending} referencias pendientes de revisar (${stats.percentages.pending}%).`
      });
    } else {
      insights.push({
        type: 'success',
        message: 'Has completado la revisión de todas las referencias.'
      });
    }

    // Insight sobre uso de IA
    if (stats.withAI > 0) {
      insights.push({
        type: 'info',
        message: `${stats.percentages.withAI}% de las referencias tienen recomendación de IA.`
      });
    }

    // Insight sobre confianza promedio
    if (stats.avgConfidence > 0) {
      if (stats.avgConfidence >= 0.8) {
        insights.push({
          type: 'success',
          message: `Confianza promedio alta: ${(stats.avgConfidence * 100).toFixed(0)}%`
        });
      } else if (stats.avgConfidence < 0.5) {
        insights.push({
          type: 'warning',
          message: `Confianza promedio baja: ${(stats.avgConfidence * 100).toFixed(0)}%. Revisa manualmente.`
        });
      }
    }

    // Insight sobre desacuerdos
    if (stats.disagreements > 0) {
      const rate = parseFloat(stats.percentages.disagreementRate);
      if (rate > 20) {
        insights.push({
          type: 'warning',
          message: `Alta tasa de desacuerdo con IA (${rate}%). Considera ajustar el umbral.`
        });
      }
    }

    // Insight sobre similitud promedio
    if (stats.avgSimilarity > 0) {
      if (stats.avgSimilarity < 0.6) {
        insights.push({
          type: 'info',
          message: 'Similitud promedio baja. Las referencias pueden no estar bien alineadas con el protocolo.'
        });
      }
    }

    return insights;
  }
}

module.exports = AnalyzeScreeningResultsUseCase;

