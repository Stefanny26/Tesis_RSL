/**
 * Controller: RQS (Research Question Schema)
 * 
 * Gestiona la extracción y visualización de datos estructurados RQS
 * desde estudios incluidos en la revisión sistemática.
 */

const ExtractRQSDataUseCase = require('../../domain/use-cases/extract-rqs-data.use-case');
const RQSEntryRepository = require('../../infrastructure/repositories/rqs-entry.repository');
const ReferenceRepository = require('../../infrastructure/repositories/reference.repository');
const ProtocolRepository = require('../../infrastructure/repositories/protocol.repository');
const AIService = require('../../infrastructure/services/ai.service');

class RQSController {
  /**
   * Obtener todas las entradas RQS de un proyecto
   * GET /api/projects/:projectId/rqs
   */
  async getAll(req, res) {
    try {
      const { projectId } = req.params;

      const rqsRepository = new RQSEntryRepository();
      const entries = await rqsRepository.findByProject(projectId);

      // Obtener estadísticas
      const stats = await rqsRepository.getStats(projectId);

      res.json({
        success: true,
        entries,
        stats,
        count: entries.length
      });

    } catch (error) {
      console.error('Error obteniendo entradas RQS:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener datos RQS',
        error: error.message
      });
    }
  }

  /**
   * Extraer datos RQS de todas las referencias incluidas
   * POST /api/projects/:projectId/rqs/extract
   */
  async extractAll(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id || req.user?.user_id;

      console.log(`🔍 Iniciando extracción RQS para proyecto ${projectId}`);

      const extractUseCase = new ExtractRQSDataUseCase({
        rqsEntryRepository: new RQSEntryRepository(),
        referenceRepository: new ReferenceRepository(),
        protocolRepository: new ProtocolRepository(),
        aiService: new AIService(userId)
      });

      const result = await extractUseCase.execute(projectId, userId);

      res.json({
        success: true,
        message: `Extracción completada: ${result.extracted} estudios procesados`,
        extracted: result.extracted,
        errors: result.errors,
        details: result.details
      });

    } catch (error) {
      console.error('Error en extracción RQS:', error);
      res.status(500).json({
        success: false,
        message: 'Error al extraer datos RQS',
        error: error.message
      });
    }
  }

  /**
   * Extraer datos RQS de una referencia específica
   * POST /api/projects/:projectId/rqs/extract/:referenceId
   */
  async extractSingle(req, res) {
    try {
      const { projectId, referenceId } = req.params;
      const userId = req.user?.id || req.user?.user_id;

      console.log(`🔍 Extrayendo RQS para referencia ${referenceId}`);

      const extractUseCase = new ExtractRQSDataUseCase({
        rqsEntryRepository: new RQSEntryRepository(),
        referenceRepository: new ReferenceRepository(),
        protocolRepository: new ProtocolRepository(),
        aiService: new AIService(userId)
      });

      const result = await extractUseCase.extractSingle(projectId, referenceId, userId);

      res.json({
        success: true,
        message: result.alreadyExists ? 'Ya existe entrada RQS para esta referencia' : 'Datos RQS extraídos exitosamente',
        rqsEntry: result.rqsEntry,
        alreadyExists: result.alreadyExists
      });

    } catch (error) {
      console.error('Error en extracción RQS individual:', error);
      res.status(500).json({
        success: false,
        message: 'Error al extraer datos RQS',
        error: error.message
      });
    }
  }

  /**
   * Actualizar entrada RQS (validación manual)
   * PUT /api/projects/:projectId/rqs/:rqsId
   */
  async update(req, res) {
    try {
      const { rqsId } = req.params;
      const updates = req.body;
      const userId = req.user?.id || req.user?.user_id;

      const rqsRepository = new RQSEntryRepository();

      // Si se está validando, agregar metadata
      if (updates.validated === true) {
        updates.validatedBy = userId;
        updates.validatedAt = new Date();
      }

      const updated = await rqsRepository.update(rqsId, updates);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Entrada RQS no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Entrada RQS actualizada exitosamente',
        rqsEntry: updated
      });

    } catch (error) {
      console.error('Error actualizando entrada RQS:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar entrada RQS',
        error: error.message
      });
    }
  }

  /**
   * Eliminar entrada RQS
   * DELETE /api/projects/:projectId/rqs/:rqsId
   */
  async delete(req, res) {
    try {
      const { rqsId } = req.params;

      const rqsRepository = new RQSEntryRepository();
      await rqsRepository.delete(rqsId);

      res.json({
        success: true,
        message: 'Entrada RQS eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando entrada RQS:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar entrada RQS',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas RQS del proyecto
   * GET /api/projects/:projectId/rqs/stats
   */
  async getStats(req, res) {
    try {
      const { projectId } = req.params;

      const rqsRepository = new RQSEntryRepository();
      const stats = await rqsRepository.getStats(projectId);

      // Calcular estadísticas adicionales
      const entries = await rqsRepository.findByProject(projectId);
      
      const detailedStats = {
        ...stats,
        completionRate: entries.length > 0 ? (Number.parseInt(stats.validated) / entries.length * 100).toFixed(1) : 0,
        studyTypeDistribution: this.calculateDistribution(entries, 'studyType'),
        contextDistribution: this.calculateDistribution(entries, 'context'),
        technologyDistribution: this.calculateTopTechnologies(entries, 5),
        yearDistribution: this.calculateYearDistribution(entries)
      };

      res.json({
        success: true,
        stats: detailedStats
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas RQS:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas RQS',
        error: error.message
      });
    }
  }

  /**
   * Exportar tabla RQS a CSV
   * GET /api/projects/:projectId/rqs/export/csv
   */
  async exportCSV(req, res) {
    try {
      const { projectId } = req.params;

      const rqsRepository = new RQSEntryRepository();
      const entries = await rqsRepository.findByProject(projectId);

      if (entries.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No hay datos RQS para exportar'
        });
      }

      // Generar CSV
      const csv = this.generateCSV(entries);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="rqs-data-project-${projectId}.csv"`);
      res.send(csv);

    } catch (error) {
      console.error('Error exportando RQS a CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Error al exportar datos RQS',
        error: error.message
      });
    }
  }

  // ============ MÉTODOS AUXILIARES ============

  calculateDistribution(entries, field) {
    const distribution = {};
    entries.forEach(entry => {
      const value = entry[field] || 'Unknown';
      distribution[value] = (distribution[value] || 0) + 1;
    });
    return distribution;
  }

  calculateTopTechnologies(entries, limit = 5) {
    const techCount = {};
    entries.forEach(entry => {
      if (entry.technology) {
        techCount[entry.technology] = (techCount[entry.technology] || 0) + 1;
      }
    });

    return Object.entries(techCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tech, count]) => ({ technology: tech, count }));
  }

  calculateYearDistribution(entries) {
    const years = {};
    entries.forEach(entry => {
      if (entry.year) {
        years[entry.year] = (years[entry.year] || 0) + 1;
      }
    });

    return Object.entries(years)
      .sort((a, b) => Number.parseInt(b[0]) - Number.parseInt(a[0]))
      .reduce((obj, [year, count]) => {
        obj[year] = count;
        return obj;
      }, {});
  }

  generateCSV(entries) {
    // Cabeceras
    const headers = [
      'ID', 'Author', 'Year', 'Title', 'Source', 'Study Type', 'Technology', 
      'Context', 'Key Evidence', 'RQ1', 'RQ2', 'RQ3', 'Limitations', 
      'Quality Score', 'Validated', 'Extraction Method'
    ];

    const rows = entries.map(entry => [
      entry.id,
      `"${(entry.author || '').replaceAll('"', '""')}"`,
      entry.year,
      `"${(entry.title || '').replaceAll('"', '""')}"`,
      `"${(entry.source || '').replaceAll('"', '""')}"`,
      entry.studyType || '',
      entry.technology || '',
      entry.context || '',
      `"${(entry.keyEvidence || '').replaceAll('"', '""')}"`,
      entry.rq1Relation || '',
      entry.rq2Relation || '',
      entry.rq3Relation || '',
      `"${(entry.limitations || '').replaceAll('"', '""')}"`,
      entry.qualityScore || '',
      entry.validated ? 'Yes' : 'No',
      entry.extractionMethod || ''
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }
}

module.exports = new RQSController();
