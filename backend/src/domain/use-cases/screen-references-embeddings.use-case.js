const { pipeline } = require('@xenova/transformers');

/**
 * Use Case: Cribado de Referencias con Embeddings Semánticos
 * 
 * Utiliza modelos de transformers para generar embeddings y calcular similitud de coseno
 * entre el protocolo PICO y las referencias bibliográficas.
 */
class ScreenReferencesWithEmbeddingsUseCase {
  constructor() {
    this.model = null;
    this.modelName = 'Xenova/all-MiniLM-L6-v2';
  }

  /**
   * Inicializa el modelo de embeddings (lazy loading)
   */
  async initializeModel() {
    if (!this.model) {
      console.log(`🔄 Cargando modelo de embeddings: ${this.modelName}...`);
      try {
        this.model = await pipeline('feature-extraction', this.modelName);
        console.log('✅ Modelo de embeddings cargado correctamente');
      } catch (error) {
        console.error('❌ Error cargando modelo de embeddings:', error);
        throw new Error(`No se pudo cargar el modelo de embeddings: ${error.message}`);
      }
    }
    return this.model;
  }

  /**
   * Genera el embedding de un texto
   */
  async generateEmbedding(text) {
    const model = await this.initializeModel();
    
    try {
      const output = await model(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch (error) {
      console.error('❌ Error generando embedding:', error);
      throw error;
    }
  }

  /**
   * Calcula la similitud de coseno entre dos vectores
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      throw new Error('Los vectores deben tener la misma longitud');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return similarity;
  }

  /**
   * Construye el texto del protocolo para generar embedding
   */
  buildCategoryText(protocol) {
    const {
      researchQuestion = '',
      population = '',
      intervention = '',
      comparison = '',
      outcome = '',
      inclusionCriteria = [],
      exclusionCriteria = []
    } = protocol;

    return `
Pregunta de investigación: ${researchQuestion}
Población: ${population}
Intervención: ${intervention}
Comparación: ${comparison}
Resultado: ${outcome}
Criterios de inclusión: ${inclusionCriteria.join('; ')}
Criterios de exclusión: ${exclusionCriteria.join('; ')}
    `.trim();
  }

  /**
   * Construye el texto de la referencia para generar embedding
   */
  buildReferenceText(reference) {
    const {
      title = '',
      abstract = '',
      keywords = []
    } = reference;

    return `
Título: ${title}
Resumen: ${abstract}
Palabras clave: ${keywords.join(', ')}
    `.trim();
  }

  /**
   * Ejecuta el cribado de una referencia individual
   */
  async execute({ reference, protocol, threshold = 0.7 }) {
    try {
      console.log('🔍 Cribando referencia con embeddings:', reference.id);

      // Construir textos
      const categoryText = this.buildCategoryText(protocol);
      const referenceText = this.buildReferenceText(reference);

      // Generar embeddings
      const categoryEmbedding = await this.generateEmbedding(categoryText);
      const referenceEmbedding = await this.generateEmbedding(referenceText);

      // Calcular similitud
      const similarity = this.cosineSimilarity(categoryEmbedding, referenceEmbedding);

      // Determinar recomendación
      const recommendation = similarity >= threshold ? 'include' : 'exclude';
      
      // Calcular confianza normalizada
      const confidence = similarity >= threshold 
        ? (similarity - threshold) / (1 - threshold)
        : (threshold - similarity) / threshold;

      const reasoning = `La similitud semántica entre la referencia y el protocolo es de ${(similarity * 100).toFixed(2)}%. ${
        similarity >= threshold 
          ? `Supera el umbral de ${(threshold * 100).toFixed(0)}%, por lo que se recomienda INCLUIR.`
          : `No alcanza el umbral de ${(threshold * 100).toFixed(0)}%, por lo que se recomienda EXCLUIR.`
      }`;

      return {
        referenceId: reference.id,
        similarity: parseFloat(similarity.toFixed(4)),
        threshold,
        recommendation,
        confidence: parseFloat(confidence.toFixed(3)),
        reasoning,
        model: this.modelName
      };

    } catch (error) {
      console.error('❌ Error en cribado con embeddings:', error);
      throw error;
    }
  }

  /**
   * Ejecuta el cribado en lote de múltiples referencias
   */
  async executeBatch({ references, protocol, threshold = 0.7 }) {
    try {
      console.log(`🔍 Cribando ${references.length} referencias en lote con embeddings...`);
      const startTime = Date.now();

      // Generar embedding del protocolo una sola vez
      const categoryText = this.buildCategoryText(protocol);
      const categoryEmbedding = await this.generateEmbedding(categoryText);

      const results = [];
      let toInclude = 0;
      let toExclude = 0;
      let totalSimilarity = 0;

      // Procesar cada referencia
      for (const reference of references) {
        try {
          const referenceText = this.buildReferenceText(reference);
          const referenceEmbedding = await this.generateEmbedding(referenceText);
          const similarity = this.cosineSimilarity(categoryEmbedding, referenceEmbedding);
          const recommendation = similarity >= threshold ? 'include' : 'exclude';
          const confidence = similarity >= threshold 
            ? (similarity - threshold) / (1 - threshold)
            : (threshold - similarity) / threshold;

          const reasoning = `Similitud: ${(similarity * 100).toFixed(2)}%. ${
            similarity >= threshold ? 'INCLUIR' : 'EXCLUIR'
          } (umbral: ${(threshold * 100).toFixed(0)}%)`;

          results.push({
            success: true,
            referenceId: reference.id,
            similarity: parseFloat(similarity.toFixed(4)),
            threshold,
            recommendation,
            confidence: parseFloat(confidence.toFixed(3)),
            reasoning,
            model: this.modelName
          });

          totalSimilarity += similarity;
          if (recommendation === 'include') toInclude++;
          else toExclude++;

        } catch (error) {
          console.error(`❌ Error procesando referencia ${reference.id}:`, error);
          results.push({
            success: false,
            referenceId: reference.id,
            error: error.message
          });
        }
      }

      const duration = Date.now() - startTime;
      const avgSimilarity = totalSimilarity / references.length;

      console.log(`✅ Cribado completado en ${(duration / 1000).toFixed(2)}s`);
      console.log(`   Incluir: ${toInclude} | Excluir: ${toExclude}`);

      return {
        results,
        summary: {
          total: references.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          toInclude,
          toExclude,
          avgSimilarity: parseFloat(avgSimilarity.toFixed(4)),
          percentageToInclude: ((toInclude / references.length) * 100).toFixed(1),
          durationMs: duration,
          model: this.modelName
        }
      };

    } catch (error) {
      console.error('❌ Error en cribado batch con embeddings:', error);
      throw error;
    }
  }

  /**
   * Genera ranking de referencias por similitud
   */
  async generateRanking({ references, protocol, models = [this.modelName] }) {
    try {
      console.log(`🏆 Generando ranking de ${references.length} referencias...`);

      const categoryText = this.buildCategoryText(protocol);
      const categoryEmbedding = await this.generateEmbedding(categoryText);

      const rankings = [];

      for (const reference of references) {
        const referenceText = this.buildReferenceText(reference);
        const referenceEmbedding = await this.generateEmbedding(referenceText);
        const similarity = this.cosineSimilarity(categoryEmbedding, referenceEmbedding);

        rankings.push({
          referenceId: reference.id,
          referenceTitle: reference.title,
          avgSimilarity: parseFloat(similarity.toFixed(4)),
          rankings: [{
            model: this.modelName,
            similarity: parseFloat(similarity.toFixed(4))
          }]
        });
      }

      // Ordenar por similitud descendente
      rankings.sort((a, b) => b.avgSimilarity - a.avgSimilarity);

      console.log('✅ Ranking generado exitosamente');

      return {
        rankings,
        modelsUsed: [this.modelName]
      };

    } catch (error) {
      console.error('❌ Error generando ranking:', error);
      throw error;
    }
  }
}

module.exports = ScreenReferencesWithEmbeddingsUseCase;

