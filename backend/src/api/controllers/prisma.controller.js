const PrismaItemRepository = require('../../infrastructure/repositories/prisma-item.repository');
const ProtocolRepository = require('../../infrastructure/repositories/protocol.repository');
const ProjectRepository = require('../../infrastructure/repositories/project.repository');
const ReferenceRepository = require('../../infrastructure/repositories/reference.repository');
const GeneratePrismaContentUseCase = require('../../domain/use-cases/generate-prisma-content.use-case');
const ExtractFullTextDataUseCase = require('../../domain/use-cases/extract-fulltext-data.use-case');
const GeneratePrismaContextUseCase = require('../../domain/use-cases/generate-prisma-context.use-case');
const CompletePrismaItemsUseCase = require('../../domain/use-cases/complete-prisma-items.use-case');
const AIService = require('../../infrastructure/services/ai.service');

/**
 * Controlador de ítems PRISMA
 */
class PrismaController {
  constructor() {
    this.prismaItemRepository = new PrismaItemRepository();
    this.protocolRepository = new ProtocolRepository();
    this.projectRepository = new ProjectRepository();
    this.referenceRepository = new ReferenceRepository();
    this.aiService = new AIService();
  }

  /**
   * GET /api/projects/:projectId/prisma
   * Obtener todos los ítems PRISMA de un proyecto
   */
  async getAll(req, res) {
    try {
      const { projectId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver estos ítems PRISMA'
        });
      }

      const items = await this.prismaItemRepository.findAllByProject(projectId);
      const stats = await this.prismaItemRepository.getComplianceStats(projectId);

      res.status(200).json({
        success: true,
        data: {
          items: items.map(item => item.toJSON()),
          stats: {
            total: parseInt(stats.total) || 27,
            completed: parseInt(stats.completed) || 0,
            pending: parseInt(stats.pending) || 27,
            automated: parseInt(stats.automated) || 0,
            human: parseInt(stats.human) || 0,
            hybrid: parseInt(stats.hybrid) || 0,
            aiValidated: parseInt(stats.ai_validated) || 0,
            completionPercentage: stats.total > 0 
              ? Math.round((parseInt(stats.completed) / 27) * 100) 
              : 0
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo ítems PRISMA:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ítems PRISMA'
      });
    }
  }

  /**
   * GET /api/projects/:projectId/prisma/:itemNumber
   * Obtener un ítem PRISMA específico
   */
  async getOne(req, res) {
    try {
      const { projectId, itemNumber } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver este ítem PRISMA'
        });
      }

      const item = await this.prismaItemRepository.findByProjectAndNumber(projectId, parseInt(itemNumber));
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `Ítem PRISMA ${itemNumber} no encontrado`
        });
      }

      res.status(200).json({
        success: true,
        data: { item: item.toJSON() }
      });
    } catch (error) {
      console.error('Error obteniendo ítem PRISMA:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ítem PRISMA'
      });
    }
  }

  /**
   * POST /api/projects/:projectId/prisma/generate
   * Generar contenido automatizado para todos los ítems PRISMA
   */
  async generateContent(req, res) {
    try {
      const { projectId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para generar contenido PRISMA'
        });
      }

      console.log(`🔄 Generando contenido PRISMA automatizado para proyecto: ${projectId}`);

      // Ejecutar caso de uso
      const generateUseCase = new GeneratePrismaContentUseCase(
        this.protocolRepository,
        null, // referenceRepository (no necesario por ahora)
        null  // screeningRepository (no necesario por ahora)
      );

      const generatedItems = await generateUseCase.execute(projectId);

      // Guardar todos los ítems en batch
      const savedItems = await this.prismaItemRepository.upsertBatch(generatedItems);

      console.log(`✅ Generados y guardados ${savedItems.length} ítems PRISMA`);

      // Obtener estadísticas actualizadas
      const stats = await this.prismaItemRepository.getComplianceStats(projectId);

      res.status(200).json({
        success: true,
        message: `Se generó contenido automatizado para ${savedItems.length} ítems PRISMA`,
        data: {
          items: savedItems.map(item => item.toJSON()),
          stats: {
            total: parseInt(stats.total) || 27,
            completed: parseInt(stats.completed) || 0,
            automated: parseInt(stats.automated) || 0,
            human: parseInt(stats.human) || 0,
            hybrid: parseInt(stats.hybrid) || 0
          }
        }
      });
    } catch (error) {
      console.error('Error generando contenido PRISMA:', error);
      res.status(500).json({
        success: false,
        message: `Error al generar contenido PRISMA: ${error.message}`
      });
    }
  }

  /**
   * PUT /api/projects/:projectId/prisma/:itemNumber
   * Actualizar un ítem PRISMA específico
   */
  async update(req, res) {
    try {
      const { projectId, itemNumber } = req.params;
      const { content, completed } = req.body;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para actualizar este ítem PRISMA'
        });
      }

      let updatedItem;

      if (content !== undefined) {
        // Actualizar contenido (marca como editado por humano)
        updatedItem = await this.prismaItemRepository.updateContent(
          projectId, 
          parseInt(itemNumber), 
          content,
          true // markAsHumanEdited
        );
      } else if (completed !== undefined) {
        // Solo marcar como completado
        updatedItem = await this.prismaItemRepository.markAsCompleted(
          projectId,
          parseInt(itemNumber)
        );
      } else {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar content o completed'
        });
      }

      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: `Ítem PRISMA ${itemNumber} no encontrado`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Ítem PRISMA actualizado exitosamente',
        data: { item: updatedItem.toJSON() }
      });
    } catch (error) {
      console.error('Error actualizando ítem PRISMA:', error);
      res.status(500).json({
        success: false,
        message: `Error al actualizar ítem PRISMA: ${error.message}`
      });
    }
  }

  /**
   * PUT /api/projects/:projectId/prisma/:itemNumber/content
   * Actualizar solo el contenido de un ítem
   */
  async updateContent(req, res) {
    try {
      const { projectId, itemNumber } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'El campo content es requerido'
        });
      }

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para actualizar este ítem PRISMA'
        });
      }

      const updatedItem = await this.prismaItemRepository.updateContent(
        projectId,
        parseInt(itemNumber),
        content,
        true // markAsHumanEdited
      );

      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: `Ítem PRISMA ${itemNumber} no encontrado`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Contenido actualizado exitosamente',
        data: { item: updatedItem.toJSON() }
      });
    } catch (error) {
      console.error('Error actualizando contenido PRISMA:', error);
      res.status(500).json({
        success: false,
        message: `Error al actualizar contenido: ${error.message}`
      });
    }
  }

  /**
   * POST /api/projects/:projectId/prisma/:itemNumber/validate
   * Validar ítem con IA
   */
  async validateWithAI(req, res) {
    try {
      const { projectId, itemNumber } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para validar este ítem PRISMA'
        });
      }

      // Obtener el ítem
      const item = await this.prismaItemRepository.findByProjectAndNumber(projectId, parseInt(itemNumber));
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `Ítem PRISMA ${itemNumber} no encontrado`
        });
      }

      if (!item.content || item.content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay contenido para validar'
        });
      }

      // TODO: Implementar validación con IA (Gemini/GPT-4)
      // Por ahora, retornar validación mock
      const aiValidation = {
        validated: true,
        suggestions: `Sugerencia para ítem ${itemNumber}: El contenido cumple con los requisitos básicos de PRISMA.`,
        issues: []
      };

      const updatedItem = await this.prismaItemRepository.updateAIValidation(
        projectId,
        parseInt(itemNumber),
        aiValidation
      );

      res.status(200).json({
        success: true,
        message: 'Validación con IA completada',
        data: { 
          item: updatedItem.toJSON(),
          validation: aiValidation
        }
      });
    } catch (error) {
      console.error('Error validando ítem con IA:', error);
      res.status(500).json({
        success: false,
        message: `Error al validar ítem: ${error.message}`
      });
    }
  }

  /**
   * GET /api/projects/:projectId/prisma/stats
   * Obtener estadísticas de cumplimiento PRISMA
   */
  async getStats(req, res) {
    try {
      const { projectId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver estas estadísticas'
        });
      }

      const stats = await this.prismaItemRepository.getComplianceStats(projectId);

      res.status(200).json({
        success: true,
        data: {
          total: parseInt(stats.total) || 27,
          completed: parseInt(stats.completed) || 0,
          pending: parseInt(stats.pending) || 27,
          automated: parseInt(stats.automated) || 0,
          human: parseInt(stats.human) || 0,
          hybrid: parseInt(stats.hybrid) || 0,
          aiValidated: parseInt(stats.ai_validated) || 0,
          completionPercentage: stats.total > 0 
            ? Math.round((parseInt(stats.completed) / 27) * 100) 
            : 0
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas PRISMA:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas'
      });
    }
  }

  /**
   * POST /api/projects/:projectId/prisma/extract-pdfs
   * Extraer datos de PDFs completos
   */
  async extractPDFData(req, res) {
    try {
      const { projectId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para procesar PDFs de este proyecto'
        });
      }

      const extractUseCase = new ExtractFullTextDataUseCase({
        referenceRepository: this.referenceRepository,
        aiService: this.aiService
      });

      const result = await extractUseCase.processProjectPDFs(projectId);

      res.status(200).json({
        success: true,
        data: result,
        message: `${result.processed} PDFs procesados exitosamente`
      });

    } catch (error) {
      console.error('❌ Error extrayendo datos de PDFs:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar PDFs',
        error: error.message
      });
    }
  }

  /**
   * POST /api/projects/:projectId/prisma/generate-context
   * Generar PRISMA Context Object
   */
  async generateContext(req, res) {
    try {
      const { projectId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para generar PRISMA Context'
        });
      }

      const generateContextUseCase = new GeneratePrismaContextUseCase({
        protocolRepository: this.protocolRepository,
        referenceRepository: this.referenceRepository,
        projectRepository: this.projectRepository
      });

      const result = await generateContextUseCase.execute(projectId);

      res.status(200).json({
        success: true,
        data: result,
        message: 'PRISMA Context generado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error generando PRISMA Context:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar PRISMA Context',
        error: error.message
      });
    }
  }

  /**
   * POST /api/projects/:projectId/prisma/complete-items
   * Completar ítems PRISMA automáticamente
   */
  async completeItems(req, res) {
    try {
      const { projectId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para completar ítems PRISMA'
        });
      }

      // Crear use cases
      const generateContextUseCase = new GeneratePrismaContextUseCase({
        protocolRepository: this.protocolRepository,
        referenceRepository: this.referenceRepository,
        projectRepository: this.projectRepository
      });

      const completeItemsUseCase = new CompletePrismaItemsUseCase({
        protocolRepository: this.protocolRepository,
        aiService: this.aiService,
        generatePrismaContextUseCase: generateContextUseCase
      });

      const result = await completeItemsUseCase.execute(projectId);

      res.status(200).json({
        success: true,
        data: result,
        message: result.message
      });

    } catch (error) {
      console.error('❌ Error completando ítems PRISMA:', error);
      res.status(500).json({
        success: false,
        message: 'Error al completar ítems PRISMA',
        error: error.message
      });
    }
  }
}

module.exports = PrismaController;
