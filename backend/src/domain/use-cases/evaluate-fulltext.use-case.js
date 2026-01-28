const ScreeningRecord = require('../models/screening-record.model');

/**
 * Use Case: Evaluar Texto Completo
 * 
 * Gestiona la evaluación de texto completo de referencias con sistema de puntaje
 * de 7 criterios (0-12 puntos). Determina inclusión/exclusión y actualiza estado.
 */
class EvaluateFullTextUseCase {
  constructor({ screeningRecordRepository, referenceRepository }) {
    this.screeningRecordRepository = screeningRecordRepository;
    this.referenceRepository = referenceRepository;
  }

  /**
   * Valida que la referencia existe y pertenece al proyecto
   */
  async validateReference(referenceId, projectId) {
    const reference = await this.referenceRepository.findById(referenceId);
    
    if (!reference) {
      throw new Error(`Referencia con ID ${referenceId} no encontrada`);
    }

    if (reference.projectId !== projectId) {
      throw new Error('La referencia no pertenece al proyecto especificado');
    }

    return reference;
  }

  /**
   * Ejecuta la evaluación de texto completo
   * 
   * @param {Object} params - Parámetros de evaluación
   * @param {string} params.referenceId - ID de la referencia a evaluar
   * @param {string} params.projectId - ID del proyecto
   * @param {string} params.userId - ID del usuario que evalúa
   * @param {Object} params.scores - Puntajes de los 7 criterios
   * @param {number} params.scores.relevance - Relevancia (0-2)
   * @param {number} params.scores.interventionPresent - Intervención presente (0-2)
   * @param {number} params.scores.methodValidity - Validez metodológica (0-2)
   * @param {number} params.scores.dataReported - Datos reportados (0-2)
   * @param {number} params.scores.textAccessible - Texto accesible (0-1)
   * @param {number} params.scores.dateRange - Rango de fecha (0-1)
   * @param {number} params.scores.methodQuality - Calidad metodológica (0-2)
   * @param {number} [params.threshold=7] - Umbral de decisión (default: 7)
   * @param {string} [params.comment] - Comentarios adicionales
   * 
   * @returns {Promise<Object>} Resultado de la evaluación
   */
  async execute({
    referenceId,
    projectId,
    userId,
    scores,
    threshold = 7,
    comment = null
  }) {
    try {
      // 1. Validar que la referencia existe y pertenece al proyecto
      const reference = await this.validateReference(referenceId, projectId);

      // 2. Validar que la referencia está en estado adecuado para full-text
      if (reference.screeningStatus === 'excluded') {
        throw new Error('No se puede evaluar texto completo de una referencia excluida');
      }

      // 3. Calcular puntaje total y decisión ANTES de crear el record
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      const decision = totalScore >= threshold ? 'include' : 'exclude';

      // 4. Crear el screening record con los datos de evaluación
      const recordData = {
        referenceId,
        projectId,
        userId,
        stage: 'fulltext',
        scores,
        totalScore,
        threshold,
        decision,
        comment,
        reviewedAt: new Date()
      };

      const record = new ScreeningRecord(recordData);
      record.validate();

      // 5. Identificar motivos de exclusión si aplica
      const exclusionReasons = record.identifyExclusionReasons();

      // 6. Guardar el screening record en la base de datos
      const savedRecord = await this.screeningRecordRepository.create(record);

      // 7. Actualizar el estado de la referencia según la decisión
      const updateData = {
        screeningStatus: decision === 'include' ? 'fulltext_included' : 'fulltext_excluded',
        screeningScore: totalScore,
        aiDecision: decision,
        exclusionReason: decision === 'exclude' && exclusionReasons.length > 0 
          ? exclusionReasons[0] 
          : null
      };

      await this.referenceRepository.update(referenceId, updateData);

      // 9. Retornar resultado completo
      return {
        success: true,
        record: savedRecord.toJSON(),
        decision,
        totalScore,
        threshold,
        exclusionReasons,
        reference: {
          id: reference.id,
          title: reference.title,
          screeningStatus: updateData.screeningStatus,
          screeningScore: totalScore
        },
        message: decision === 'include' 
          ? `Referencia incluida (${totalScore}/${record.maxScore} puntos)`
          : `Referencia excluida (${totalScore}/${record.maxScore} puntos)`
      };

    } catch (error) {
      console.error('Error en evaluación de texto completo:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de evaluaciones de una referencia
   */
  async getEvaluationHistory(referenceId) {
    try {
      const records = await this.screeningRecordRepository.findByReference(referenceId);
      return {
        success: true,
        count: records.length,
        records: records.map(r => r.toJSON())
      };
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  }

  /**
   * Obtiene la última evaluación de una referencia
   */
  async getLatestEvaluation(referenceId) {
    try {
      const record = await this.screeningRecordRepository.findLatestByReference(referenceId);
      
      if (!record) {
        return {
          success: true,
          hasEvaluation: false,
          record: null
        };
      }

      return {
        success: true,
        hasEvaluation: true,
        record: record.toJSON()
      };
    } catch (error) {
      console.error('Error obteniendo última evaluación:', error);
      throw error;
    }
  }

  /**
   * Re-evalúa una referencia con nuevos puntajes
   * Actualiza el screening record existente
   */
  async reevaluate({
    recordId,
    referenceId,
    projectId,
    scores,
    threshold,
    comment
  }) {
    try {
      // 1. Validar referencia
      const reference = await this.validateReference(referenceId, projectId);

      // 2. Obtener record existente
      const existingRecord = await this.screeningRecordRepository.findById(recordId);
      
      if (!existingRecord) {
        throw new Error(`Screening record con ID ${recordId} no encontrado`);
      }

      if (existingRecord.referenceId !== referenceId) {
        throw new Error('El screening record no corresponde a la referencia especificada');
      }

      // 3. Crear nuevo record con datos actualizados
      const updatedRecordData = {
        ...existingRecord,
        scores,
        threshold: threshold || existingRecord.threshold,
        comment: comment !== undefined ? comment : existingRecord.comment,
        reviewedAt: new Date()
      };

      const updatedRecord = new ScreeningRecord(updatedRecordData);
      updatedRecord.validate();

      // 4. Calcular nuevo puntaje y decisión
      const totalScore = updatedRecord.calculateTotalScore();
      const decision = updatedRecord.determineDecision();
      const exclusionReasons = updatedRecord.identifyExclusionReasons();

      // 5. Actualizar el screening record
      const savedRecord = await this.screeningRecordRepository.update(recordId, {
        scores,
        totalScore,
        threshold: updatedRecord.threshold,
        decision,
        exclusionReasons,
        comment: updatedRecord.comment
      });

      // 6. Actualizar el estado de la referencia
      const updateData = {
        screeningStatus: decision === 'include' ? 'included' : 'excluded',
        screeningScore: totalScore,
        aiDecision: decision,
        exclusionReason: decision === 'exclude' && exclusionReasons.length > 0 
          ? exclusionReasons[0] 
          : null
      };

      await this.referenceRepository.update(referenceId, updateData);

      return {
        success: true,
        record: savedRecord.toJSON(),
        decision,
        totalScore,
        threshold: updatedRecord.threshold,
        exclusionReasons,
        message: decision === 'include' 
          ? `Re-evaluación: Referencia incluida (${totalScore}/${updatedRecord.maxScore} puntos)`
          : `Re-evaluación: Referencia excluida (${totalScore}/${updatedRecord.maxScore} puntos)`
      };

    } catch (error) {
      console.error('Error en re-evaluación:', error);
      throw error;
    }
  }

  /**
   * Elimina una evaluación y restaura el estado de la referencia
   */
  async deleteEvaluation(recordId, referenceId) {
    try {
      // 1. Obtener el record
      const record = await this.screeningRecordRepository.findById(recordId);
      
      if (!record) {
        throw new Error(`Screening record con ID ${recordId} no encontrado`);
      }

      if (record.referenceId !== referenceId) {
        throw new Error('El screening record no corresponde a la referencia especificada');
      }

      // 2. Eliminar el screening record
      await this.screeningRecordRepository.delete(recordId);

      // 3. Verificar si hay otras evaluaciones de esta referencia
      const otherRecords = await this.screeningRecordRepository.findByReference(referenceId);

      // 4. Actualizar estado de referencia
      if (otherRecords.length > 0) {
        // Usar la evaluación más reciente
        const latestRecord = otherRecords[0]; // Ya vienen ordenadas por fecha
        const updateData = {
          screeningStatus: latestRecord.decision === 'include' ? 'included' : 'excluded',
          screeningScore: latestRecord.totalScore,
          aiDecision: latestRecord.decision,
          exclusionReason: latestRecord.decision === 'exclude' && latestRecord.exclusionReasons.length > 0
            ? latestRecord.exclusionReasons[0]
            : null
        };
        await this.referenceRepository.update(referenceId, updateData);
      } else {
        // No hay más evaluaciones, restaurar a estado pendiente
        const updateData = {
          screeningStatus: 'pending',
          screeningScore: null,
          aiDecision: null,
          exclusionReason: null
        };
        await this.referenceRepository.update(referenceId, updateData);
      }

      return {
        success: true,
        message: 'Evaluación eliminada correctamente'
      };

    } catch (error) {
      console.error('Error eliminando evaluación:', error);
      throw error;
    }
  }
}

module.exports = EvaluateFullTextUseCase;
