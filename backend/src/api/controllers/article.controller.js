const ProjectRepository = require('../../infrastructure/repositories/project.repository');
const PrismaItemRepository = require('../../infrastructure/repositories/prisma-item.repository');
const ProtocolRepository = require('../../infrastructure/repositories/protocol.repository');
const ReferenceRepository = require('../../infrastructure/repositories/reference.repository');
const GenerateArticleFromPrismaUseCase = require('../../domain/use-cases/generate-article-from-prisma.use-case');
const GeneratePrismaContextUseCase = require('../../domain/use-cases/generate-prisma-context.use-case');
const AIService = require('../../infrastructure/services/ai.service');

/**
 * Controlador de Artículo Científico
 */
class ArticleController {
  constructor() {
    this.projectRepository = new ProjectRepository();
    this.prismaItemRepository = new PrismaItemRepository();
    this.protocolRepository = new ProtocolRepository();
    this.referenceRepository = new ReferenceRepository();
    this.aiService = new AIService();
  }

  /**
   * GET /api/projects/:projectId/article/status
   * Verificar si el artículo puede ser generado
   */
  async getStatus(req, res) {
    try {
      const { projectId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para acceder a este artículo'
        });
      }

      // Verificar estado de PRISMA
      const stats = await this.prismaItemRepository.getComplianceStats(projectId);
      const completed = parseInt(stats.completed) || 0;
      const isPrismaComplete = completed === 27;

      res.status(200).json({
        success: true,
        data: {
          canGenerate: isPrismaComplete,
          prismaCompleted: completed,
          prismaTotal: 27,
          message: isPrismaComplete
            ? 'PRISMA completo. El artículo puede ser generado.'
            : `Debe completar PRISMA primero: ${completed}/27 ítems completados.`,
          blockingReason: isPrismaComplete ? null : 'PRISMA_INCOMPLETE'
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo estado del artículo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar estado del artículo',
        error: error.message
      });
    }
  }

  /**
   * POST /api/projects/:projectId/article/generate
   * Generar artículo científico completo desde PRISMA cerrado
   */
  async generate(req, res) {
    try {
      const { projectId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para generar artículo'
        });
      }

      console.log(`📄 Iniciando generación de artículo para proyecto ${projectId}`);

      // Crear use cases
      const generateContextUseCase = new GeneratePrismaContextUseCase({
        protocolRepository: this.protocolRepository,
        referenceRepository: this.referenceRepository,
        projectRepository: this.projectRepository
      });

      const generateArticleUseCase = new GenerateArticleFromPrismaUseCase({
        prismaItemRepository: this.prismaItemRepository,
        protocolRepository: this.protocolRepository,
        aiService: this.aiService,
        generatePrismaContextUseCase: generateContextUseCase
      });

      // Generar artículo
      const result = await generateArticleUseCase.execute(projectId);

      res.status(200).json({
        success: true,
        data: result.article,
        message: 'Artículo científico generado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error generando artículo:', error);
      
      // Error específico si PRISMA incompleto
      if (error.message.includes('PRISMA incompleto')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          code: 'PRISMA_INCOMPLETE'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al generar artículo científico',
        error: error.message
      });
    }
  }

  /**
   * POST /api/projects/:projectId/article/generate-section
   * Generar una sección específica del artículo
   * Body: { section: 'introduction' | 'methods' | 'results' | 'discussion' | 'conclusions' }
   */
  async generateSection(req, res) {
    try {
      const { projectId } = req.params;
      const { section } = req.body;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para generar secciones'
        });
      }

      // Validar sección
      const validSections = ['introduction', 'methods', 'results', 'discussion', 'conclusions'];
      if (!validSections.includes(section)) {
        return res.status(400).json({
          success: false,
          message: `Sección inválida. Debe ser una de: ${validSections.join(', ')}`
        });
      }

      // Crear use cases
      const generateContextUseCase = new GeneratePrismaContextUseCase({
        protocolRepository: this.protocolRepository,
        referenceRepository: this.referenceRepository,
        projectRepository: this.projectRepository
      });

      const generateArticleUseCase = new GenerateArticleFromPrismaUseCase({
        prismaItemRepository: this.prismaItemRepository,
        protocolRepository: this.protocolRepository,
        aiService: this.aiService,
        generatePrismaContextUseCase: generateContextUseCase
      });

      // Validar PRISMA completo
      await generateArticleUseCase.validatePrismaComplete(projectId);

      // Obtener datos necesarios
      const prismaItems = await this.prismaItemRepository.findAllByProject(projectId);
      const contextResult = await generateContextUseCase.execute(projectId);
      const prismaMapping = generateArticleUseCase.mapPrismaToIMRaD(prismaItems);

      // Generar solo la sección solicitada
      let content;
      switch (section) {
        case 'introduction':
          content = await generateArticleUseCase.generateIntroduction(prismaMapping, contextResult.context);
          break;
        case 'methods':
          content = await generateArticleUseCase.generateMethods(prismaMapping, contextResult.context);
          break;
        case 'results':
          content = await generateArticleUseCase.generateResults(prismaMapping, contextResult.context);
          break;
        case 'discussion':
          content = await generateArticleUseCase.generateDiscussion(prismaMapping, contextResult.context);
          break;
        case 'conclusions':
          content = await generateArticleUseCase.generateConclusions(prismaMapping, contextResult.context);
          break;
      }

      res.status(200).json({
        success: true,
        data: {
          section,
          content,
          wordCount: content.split(/\s+/).filter(w => w.length > 0).length
        },
        message: `Sección ${section} generada exitosamente`
      });

    } catch (error) {
      console.error(`❌ Error generando sección ${req.body.section}:`, error);
      
      if (error.message.includes('PRISMA incompleto')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          code: 'PRISMA_INCOMPLETE'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al generar sección del artículo',
        error: error.message
      });
    }
  }
}

module.exports = ArticleController;
