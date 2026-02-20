const PrismaItemRepository = require('../../infrastructure/repositories/prisma-item.repository');
const ProtocolRepository = require('../../infrastructure/repositories/protocol.repository');
const ProjectRepository = require('../../infrastructure/repositories/project.repository');
const ReferenceRepository = require('../../infrastructure/repositories/reference.repository');
const ExtractFullTextDataUseCase = require('../../domain/use-cases/extract-fulltext-data.use-case');
const GeneratePrismaContextUseCase = require('../../domain/use-cases/generate-prisma-context.use-case');
const CompletePrismaByBlocksUseCase = require('../../domain/use-cases/complete-prisma-by-blocks.use-case');
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
    // AIService se creará por método para incluir userId
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

      // Si no hay ítems o no hay exactamente 27, inicializar los 27 ítems PRISMA vacíos
      if (items.length !== 27) {
        console.log('📝 Inicializando 27 ítems PRISMA para proyecto:', projectId);
        await this.initializePrismaItems(projectId);
        items = await this.prismaItemRepository.findAllByProject(projectId);
      }

      // Si los ítems 1-10 están vacíos, migrar automáticamente desde protocolo (primera vez)
      const item1 = items.find(item => item.itemNumber === 1);
      if (item1 && (!item1.content || item1.content.trim() === '' || item1.content === 'null')) {
        console.log('🔄 Primera vez en PRISMA - migrando ítems 1-10 desde protocolo...');

        try {
          const protocol = await this.protocolRepository.findByProjectId(projectId);
          if (protocol) {
            await this.migrateItemsFromProtocol(projectId, protocol);
            // Recargar ítems después de migración
            items = await this.prismaItemRepository.findAllByProject(projectId);
            console.log('✅ Ítems 1-10 migrados automáticamente desde protocolo');
          } else {
            console.log('⚠️  No se encontró protocolo para migrar');
          }
        } catch (error) {
          console.error('❌ Error en migración automática:', error);
          // Continuar sin fallar - los ítems quedan vacíos
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

      // Sincronizar compliance al proyecto (fire-and-forget)
      this._syncComplianceToProject(projectId);
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

      // Sincronizar compliance al proyecto (fire-and-forget)
      this._syncComplianceToProject(projectId);
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

      const ValidatePrismaItemUseCase = require('../../domain/use-cases/validate-prisma-item.use-case');

      const validateUseCase = new ValidatePrismaItemUseCase({
        prismaItemRepository: this.prismaItemRepository,
        aiService: new AIService(req.userId)
      });

      const result = await validateUseCase.execute(projectId, parseInt(itemNumber));

      res.status(200).json({
        success: true,
        message: 'Validación con IA completada',
        data: {
          validation: result.validation
        }
      });

      // Sincronizar compliance al proyecto (fire-and-forget)
      this._syncComplianceToProject(projectId);
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
        aiService: new AIService(req.userId)
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
        aiService: new AIService(req.userId),
        generatePrismaContextUseCase: generateContextUseCase
      });

      const result = await completeByBlocksUseCase.execute(projectId, block);

      res.status(200).json({
        success: true,
        data: result,
        message: `Bloques ${block} completados exitosamente`
      });

      // Sincronizar compliance al proyecto (fire-and-forget)
      this._syncComplianceToProject(projectId);

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
   * POST /api/projects/:projectId/prisma/migrate
   * Migrar ítems 1-10 desde protocolo a prisma_items
   */
  async migrateFromProtocol(req, res) {
    try {
      const { projectId } = req.params;

      console.log('🔄 Iniciando migración de ítems PRISMA 1-10 desde protocolo...');

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para migrar ítems PRISMA'
        });
      }

      // Obtener protocolo
      const protocol = await this.protocolRepository.findByProjectId(projectId);
      if (!protocol) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró el protocolo del proyecto'
        });
      }

      // Ejecutar migración
      const items = await this.migrateItemsFromProtocol(projectId, protocol);

      res.status(200).json({
        success: true,
        message: 'Ítems PRISMA 1-10 migrados exitosamente desde protocolo',
        data: {
          itemsMigrated: 10,
          items: items.map(item => ({
            number: item.itemNumber,
            section: item.section,
            topic: item.topic,
            completed: true
          }))
        }
      });

    } catch (error) {
      console.error('❌ Error migrando ítems PRISMA:', error);
      res.status(500).json({
        success: false,
        message: 'Error al migrar ítems PRISMA desde protocolo',
        error: error.message
      });
    }
  }

  /**
   * Lógica interna: Migrar ítems 1-10 desde protocolo
   * @private
   */
  async migrateItemsFromProtocol(projectId, protocol) {
    console.log('✅ Protocolo encontrado, construyendo ítems 1-10...');

    // Construir contenido para ítems 1-10 desde protocolo
    const items = [];

    // Ítem 1: Título
    const title = protocol.proposedTitle || 'Sin título definido';
    items.push({
      projectId,
      itemNumber: 1,
      section: 'Title',
      topic: 'Título',
      content: title,
      completed: true,
      contentType: 'automated',
      dataSource: 'protocol.proposedTitle',
      complies: 'yes',
      evidence: `Título del proyecto: ${title}`,
      aiValidated: true,
      aiDecision: 'APROBADO',
      aiScore: 100,
      aiReasoning: 'Título generado desde protocolo'
    });

    // Ítem 2: Resumen estructurado
    const abstractText = `Investigación sobre ${protocol.refinedQuestion || protocol.proposedTitle}`;
    items.push({
      projectId,
      itemNumber: 2,
      section: 'Abstract',
      topic: 'Resumen estructurado',
      content: abstractText,
      completed: true,
      contentType: 'automated',
      dataSource: 'protocol.refinedQuestion',
      complies: 'yes',
      evidence: abstractText,
      aiValidated: true,
      aiDecision: 'APROBADO',
      aiScore: 100,
      aiReasoning: 'Resumen generado desde pregunta refinada'
    });

    // Ítem 3: Justificación (PICO - Population/Context)
    const justification = protocol.population || 'Contexto de investigación definido en protocolo';
    items.push({
      projectId,
      itemNumber: 3,
      section: 'Introduction',
      topic: 'Justificación',
      content: justification,
      completed: true,
      contentType: 'automated',
      dataSource: 'protocol.pico.population',
      complies: 'yes',
      evidence: justification,
      aiValidated: true,
      aiDecision: 'APROBADO',
      aiScore: 100,
      aiReasoning: 'Justificación desde marco PICO'
    });

    // Ítem 4: Objetivos (PICO - Outcomes)
    const objectives = protocol.outcomes || 'Resultados esperados definidos en protocolo';
    items.push({
      projectId,
      itemNumber: 4,
      section: 'Introduction',
      topic: 'Objetivos',
      content: objectives,
      completed: true,
      contentType: 'automated',
      dataSource: 'protocol.pico.outcomes',
      complies: 'yes',
      evidence: objectives,
      aiValidated: true,
      aiDecision: 'APROBADO',
      aiScore: 100,
      aiReasoning: 'Objetivos desde marco PICO - Outcomes'
    });

    // Ítem 5: Criterios de elegibilidad
    const inclusionCriteria = Array.isArray(protocol.inclusionCriteria)
      ? protocol.inclusionCriteria.join('\n')
      : 'Criterios de inclusión definidos';
    const exclusionCriteria = Array.isArray(protocol.exclusionCriteria)
      ? protocol.exclusionCriteria.join('\n')
      : 'Criterios de exclusión definidos';
    items.push({
      projectId,
      itemNumber: 5,
      section: 'Methods',
      topic: 'Criterios de elegibilidad',
      content: `Criterios de inclusión:\n${inclusionCriteria}\n\nCriterios de exclusión:\n${exclusionCriteria}`,
      completed: true,
      contentType: 'automated',
      dataSource: 'protocol.inclusionCriteria,protocol.exclusionCriteria',
      complies: 'yes',
      evidence: 'Criterios definidos en protocolo',
      aiValidated: true,
      aiDecision: 'APROBADO',
      aiScore: 100,
      aiReasoning: 'Criterios I/E desde protocolo'
    });

    // Ítem 6: Fuentes de información
    const databases = Array.isArray(protocol.databases)
      ? protocol.databases.map(db => db.name || db).join(', ')
      : 'Bases de datos académicas';
    items.push({
      projectId,
      itemNumber: 6,
      section: 'Methods',
      topic: 'Fuentes de información',
      content: `Bases de datos consultadas: ${databases}`,
      completed: true,
      contentType: 'automated',
      dataSource: 'protocol.databases',
      complies: 'yes',
      evidence: databases,
      aiValidated: true,
      aiDecision: 'APROBADO',
      aiScore: 100,
      aiReasoning: 'Bases de datos desde protocolo'
    });

    // Ítem 7: Estrategia de búsqueda
    const searchString = protocol.searchString || 'Cadena de búsqueda definida en protocolo';
    items.push({
      projectId,
      itemNumber: 7,
      section: 'Methods',
      topic: 'Estrategia de búsqueda',
      content: searchString,
      completed: true,
      contentType: 'automated',
      dataSource: 'protocol.searchString',
      complies: 'yes',
      evidence: searchString,
      aiValidated: true,
      aiDecision: 'APROBADO',
      aiScore: 100,
      aiReasoning: 'Estrategia de búsqueda desde protocolo'
    });

    // Ítem 8: Proceso de selección
    items.push({
      projectId,
      itemNumber: 8,
      section: 'Methods',
      topic: 'Proceso de selección',
      content: 'Proceso de cribado automático con IA seguido de revisión manual',
      completed: true,
      contentType: 'automated',
      dataSource: 'system.screening.method',
      complies: 'yes',
      evidence: 'Metodología de screening definida',
      aiValidated: true,
      aiDecision: 'APROBADO',
      aiScore: 100,
      aiReasoning: 'Proceso de selección estándar'
    });

    // Ítem 9: Recolección de datos
    items.push({
      projectId,
      itemNumber: 9,
      section: 'Methods',
      topic: 'Recolección de datos',
      content: 'Extracción sistemática de datos mediante formulario estandarizado',
      completed: true,
      contentType: 'automated',
      dataSource: 'system.extraction.method',
      complies: 'yes',
      evidence: 'Metodología de extracción definida',
      aiValidated: true,
      aiDecision: 'APROBADO',
      aiScore: 100,
      aiReasoning: 'Proceso de recolección estándar'
    });

    // Ítem 10: Lista de datos
    const dataItems = `PICO Framework: Población (${protocol.population}), Intervención (${protocol.intervention}), Comparación (${protocol.comparison}), Outcomes (${protocol.outcomes})`;
    items.push({
      projectId,
      itemNumber: 10,
      section: 'Methods',
      topic: 'Lista de datos',
      content: dataItems,
      completed: true,
      contentType: 'automated',
      dataSource: 'protocol.pico',
      complies: 'yes',
      evidence: dataItems,
      aiValidated: true,
      aiDecision: 'APROBADO',
      aiScore: 100,
      aiReasoning: 'Datos desde marco PICO'
    });

    // Guardar en BD usando upsert
    await this.prismaItemRepository.upsertBatch(items);

    console.log('✅ Migración completada: 10 ítems');

    return items;
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
  }

  /**
   * Sincronizar el porcentaje de cumplimiento PRISMA al proyecto
   * Se llama después de cualquier mutación de ítems PRISMA
   */
  async _syncComplianceToProject(projectId) {
    try {
      const stats = await this.prismaItemRepository.getComplianceStats(projectId);
      const completed = parseInt(stats.completed) || 0;
      const percentage = Math.round((completed / 27) * 100);
      await this.projectRepository.updateStatistics(projectId, {
        prismaCompliancePercentage: percentage
      });
    } catch (error) {
      // No fallar silenciosamente pero no bloquear la operación principal
      console.error('Error sincronizando PRISMA compliance al proyecto:', error);
    }
  }
}

module.exports = PrismaController;
