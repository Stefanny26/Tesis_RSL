const PrismaItemRepository = require('../../infrastructure/repositories/prisma-item.repository');
const ProtocolRepository = require('../../infrastructure/repositories/protocol.repository');
const ProjectRepository = require('../../infrastructure/repositories/project.repository');
const ReferenceRepository = require('../../infrastructure/repositories/reference.repository');
const GeneratePrismaContentUseCase = require('../../domain/use-cases/generate-prisma-content.use-case');
const ExtractFullTextDataUseCase = require('../../domain/use-cases/extract-fulltext-data.use-case');
const GeneratePrismaContextUseCase = require('../../domain/use-cases/generate-prisma-context.use-case');
const CompletePrismaItemsUseCase = require('../../domain/use-cases/complete-prisma-items.use-case');
const CompletePrismaByBlocksUseCase = require('../../domain/use-cases/complete-prisma-by-blocks.use-case');
const AIService = require('../../infrastructure/services/ai.service');
const { buildValidationPrompt, validateAIResponse } = require('../../config/prisma-validation-prompts');

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

      let items = await this.prismaItemRepository.findAllByProject(projectId);
      
      // Si no hay ítems o no hay exactamente 27, inicializar/actualizar los 27 ítems PRISMA
      if (items.length !== 27) {
        console.log('Inicializando/actualizando 27 ítems PRISMA para proyecto:', projectId);
        await this.initializePrismaItems(projectId);
        items = await this.prismaItemRepository.findAllByProject(projectId);
        
        // Generar contenido automático para items 1-10 desde el protocolo
        console.log('Generando contenido inicial automático desde protocolo...');
        try {
          const generateUseCase = new GeneratePrismaContentUseCase(
            this.protocolRepository,
            null,
            null
          );
          const allGeneratedItems = await generateUseCase.execute(projectId);
          
          // Solo guardar los primeros 10 ítems (TITLE → DATA COLLECTION)
          const initialItems = allGeneratedItems.slice(0, 10);
          await this.prismaItemRepository.upsertBatch(initialItems);
          console.log(`Contenido inicial generado para ${initialItems.length} ítems (1-10)`);
          items = await this.prismaItemRepository.findAllByProject(projectId);
        } catch (error) {
          console.log('No se pudo generar contenido inicial:', error.message);
        }
      }
      
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

      console.log(`Generando contenido PRISMA automatizado para proyecto: ${projectId}`);

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
   * Validar ítem con IA usando prompts especializados del gatekeeper
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
          message: 'No hay contenido para validar. Por favor completa el ítem primero.'
        });
      }

      console.log(`Validando ítem ${itemNumber} con IA Gatekeeper...`);

      try {
        // Obtener prompt de validación específico para este ítem
        const promptConfig = buildValidationPrompt(parseInt(itemNumber), item.content);
        
        // Llamar a la IA con el prompt especializado
        const aiResponse = await this.aiService.generateText(
          promptConfig.systemPrompt,
          promptConfig.userPrompt,
          'openai' // Usar OpenAI (ChatGPT)
        );

        console.log('Respuesta raw de IA:', aiResponse.substring(0, 200));

        // Intentar parsear respuesta JSON
        let validation;
        try {
          // Limpiar respuesta (quitar markdown code blocks si existen)
          const cleanResponse = aiResponse
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          
          validation = JSON.parse(cleanResponse);
          
          // Validar estructura de respuesta
          validateAIResponse(validation, parseInt(itemNumber));
          
        } catch (parseError) {
          console.error('Error parseando respuesta de IA:', parseError);
          console.error('Respuesta completa:', aiResponse);
          
          // Fallback: crear respuesta estructurada básica
          validation = {
            decision: 'NECESITA_MEJORAS',
            score: 50,
            reasoning: 'La IA no pudo evaluar correctamente el contenido. Revisa manualmente.',
            issues: ['Error en el procesamiento de validación'],
            suggestions: ['Por favor revisa el contenido manualmente'],
            criteriaChecklist: {}
          };
        }

        // Preparar datos para guardar
        const aiValidation = {
          validated: validation.decision === 'APROBADO',
          suggestions: validation.suggestions && validation.suggestions.length > 0 
            ? validation.suggestions.join('\n') 
            : null,
          issues: validation.issues || [],
          score: validation.score,
          decision: validation.decision,
          reasoning: validation.reasoning,
          criteriaChecklist: validation.criteriaChecklist
        };

        // Guardar validación en la base de datos
        const updatedItem = await this.prismaItemRepository.updateAIValidation(
          projectId,
          parseInt(itemNumber),
          aiValidation
        );

        console.log(`Validación completada: ${validation.decision} (${validation.score}%)`);

        res.status(200).json({
          success: true,
          message: 'Validación con IA completada',
          data: { 
            item: updatedItem.toJSON(),
            validation: {
              decision: validation.decision,
              score: validation.score,
              reasoning: validation.reasoning,
              issues: validation.issues,
              suggestions: validation.suggestions,
              criteriaChecklist: validation.criteriaChecklist
            }
          }
        });

      } catch (aiError) {
        console.error('Error llamando a IA:', aiError);
        
        // Si falla la IA, devolver error claro
        return res.status(500).json({
          success: false,
          message: `Error al validar con IA: ${aiError.message}`,
          error: {
            type: 'AI_ERROR',
            details: aiError.message
          }
        });
      }

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

      const extractFullTextUseCase = new ExtractFullTextDataUseCase({
        referenceRepository: this.referenceRepository,
        aiService: this.aiService
      });

      const completeItemsUseCase = new CompletePrismaItemsUseCase({
        protocolRepository: this.protocolRepository,
        aiService: this.aiService,
        generatePrismaContextUseCase: generateContextUseCase,
        extractFullTextDataUseCase: extractFullTextUseCase
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

  /**
   * POST /api/projects/:projectId/prisma/complete-by-blocks
   * Completar ítems PRISMA por bloques académicos
   * Body: { block: 'all' | 'methods' | 'results' | 'discussion' | 'other' }
   */
  async completeByBlocks(req, res) {
    try {
      const { projectId } = req.params;
      const { block = 'all' } = req.body;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para completar ítems PRISMA'
        });
      }

      // Validar bloque
      const validBlocks = ['all', 'methods', 'results', 'discussion', 'other'];
      if (!validBlocks.includes(block)) {
        return res.status(400).json({
          success: false,
          message: `Bloque inválido. Debe ser uno de: ${validBlocks.join(', ')}`
        });
      }

      // Crear use case
      const generateContextUseCase = new GeneratePrismaContextUseCase({
        protocolRepository: this.protocolRepository,
        referenceRepository: this.referenceRepository,
        projectRepository: this.projectRepository
      });

      const completeByBlocksUseCase = new CompletePrismaByBlocksUseCase({
        prismaItemRepository: this.prismaItemRepository,
        protocolRepository: this.protocolRepository,
        aiService: this.aiService,
        generatePrismaContextUseCase: generateContextUseCase
      });

      const result = await completeByBlocksUseCase.execute(projectId, block);

      res.status(200).json({
        success: true,
        data: result,
        message: `Bloques ${block} completados exitosamente`
      });

    } catch (error) {
      console.error('❌ Error completando bloques PRISMA:', error);
      res.status(500).json({
        success: false,
        message: 'Error al completar bloques PRISMA',
        error: error.message
      });
    }
  }

  /**
   * GET /api/projects/:projectId/prisma/status
   * Verificar si PRISMA está completo y listo para artículo
   */
  async getStatus(req, res) {
    try {
      const { projectId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver el estado de PRISMA'
        });
      }

      const stats = await this.prismaItemRepository.getComplianceStats(projectId);
      const completed = parseInt(stats.completed) || 0;
      const isPrismaComplete = completed === 27;

      res.status(200).json({
        success: true,
        data: {
          completed,
          total: 27,
          isPrismaComplete,
          canGenerateArticle: isPrismaComplete,
          completionPercentage: Math.round((completed / 27) * 100),
          message: isPrismaComplete 
            ? 'PRISMA completo. Puede generar el artículo científico.' 
            : `PRISMA incompleto: ${completed}/27 ítems completados.`
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo estado PRISMA:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estado de PRISMA',
        error: error.message
      });
    }
  }

  /**
   * Inicializar los 27 ítems PRISMA vacíos
   */
  async initializePrismaItems(projectId) {
    const prismaStructure = [
      { number: 1, section: 'Title', topic: 'Título' },
      { number: 2, section: 'Abstract', topic: 'Resumen estructurado' },
      { number: 3, section: 'Introduction', topic: 'Justificación' },
      { number: 4, section: 'Introduction', topic: 'Objetivos' },
      { number: 5, section: 'Methods', topic: 'Criterios de elegibilidad' },
      { number: 6, section: 'Methods', topic: 'Fuentes de información' },
      { number: 7, section: 'Methods', topic: 'Estrategia de búsqueda' },
      { number: 8, section: 'Methods', topic: 'Proceso de selección' },
      { number: 9, section: 'Methods', topic: 'Recolección de datos' },
      { number: 10, section: 'Methods', topic: 'Lista de datos' },
      { number: 11, section: 'Methods', topic: 'Riesgo de sesgo' },
      { number: 12, section: 'Methods', topic: 'Medidas de efecto' },
      { number: 13, section: 'Methods', topic: 'Métodos de síntesis' },
      { number: 14, section: 'Methods', topic: 'Sesgo de reporte' },
      { number: 15, section: 'Methods', topic: 'Evaluación de certeza' },
      { number: 16, section: 'Results', topic: 'Selección de estudios' },
      { number: 17, section: 'Results', topic: 'Características de estudios' },
      { number: 18, section: 'Results', topic: 'Riesgo de sesgo en estudios' },
      { number: 19, section: 'Results', topic: 'Resultados individuales' },
      { number: 20, section: 'Results', topic: 'Resultados de síntesis' },
      { number: 21, section: 'Results', topic: 'Sesgo de reporte (resultados)' },
      { number: 22, section: 'Results', topic: 'Certeza de evidencia' },
      { number: 23, section: 'Discussion', topic: 'Interpretación y discusión' },
      { number: 24, section: 'Funding', topic: 'Registro y protocolo' },
      { number: 25, section: 'Funding', topic: 'Financiamiento' },
      { number: 26, section: 'Funding', topic: 'Conflictos de interés' },
      { number: 27, section: 'Funding', topic: 'Disponibilidad de datos' }
    ];

    const items = prismaStructure.map(item => ({
      projectId,
      itemNumber: item.number,
      section: item.section,
      topic: item.topic,
      completed: false,
      content: null,
      contentType: 'pending',
      dataSource: null,
      automatedContent: null,
      lastHumanEdit: null,
      aiValidated: false,
      aiSuggestions: null,
      aiIssues: []
    }));

    await this.prismaItemRepository.upsertBatch(items);
    console.log('✅ 27 ítems PRISMA inicializados');
  }
}

module.exports = PrismaController;
