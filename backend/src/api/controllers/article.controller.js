const ProjectRepository = require('../../infrastructure/repositories/project.repository');
const PrismaItemRepository = require('../../infrastructure/repositories/prisma-item.repository');
const ProtocolRepository = require('../../infrastructure/repositories/protocol.repository');
const ReferenceRepository = require('../../infrastructure/repositories/reference.repository');
const RQSEntryRepository = require('../../infrastructure/repositories/rqs-entry.repository');
const ArticleVersionRepository = require('../../infrastructure/repositories/article-version.repository');
const ScreeningRecordRepository = require('../../infrastructure/repositories/screening-record.repository');
const PythonGraphService = require('../../infrastructure/services/python-graph.service');
const GenerateArticleFromPrismaUseCase = require('../../domain/use-cases/generate-article-from-prisma.use-case');
const GeneratePrismaContextUseCase = require('../../domain/use-cases/generate-prisma-context.use-case');
const AIService = require('../../infrastructure/services/ai.service');
const ArticleVersion = require('../../domain/models/article-version.model');
const { v4: uuidv4 } = require('uuid');
const database = require('../../config/database');

/**
 * Controlador de Artículo Científico
 */
class ArticleController {
  constructor() {
    this.projectRepository = new ProjectRepository();
    this.prismaItemRepository = new PrismaItemRepository();
    this.protocolRepository = new ProtocolRepository();
    this.referenceRepository = new ReferenceRepository();
    this.rqsEntryRepository = new RQSEntryRepository();
    this.articleVersionRepository = new ArticleVersionRepository(database);
    this.screeningRecordRepository = new ScreeningRecordRepository();
    this.pythonGraphService = new PythonGraphService();
    // AIService se creará por método para incluir userId
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
        rqsEntryRepository: this.rqsEntryRepository,
        screeningRecordRepository: this.screeningRecordRepository,
        aiService: new AIService(req.userId),
        pythonGraphService: this.pythonGraphService,
        generatePrismaContextUseCase: generateContextUseCase
      });

      const result = await generateArticleUseCase.execute(projectId);

      // Transformar a formato esperado por frontend (claves en inglés)
      const article = result.article;
      const sections = {
        abstract: article.abstract,
        introduction: article.introduction,
        methods: article.methods,
        results: article.results,
        discussion: article.discussion,
        conclusions: article.conclusions,
        references: article.references,
        declarations: article.declarations || ''
      };

      res.status(200).json({
        success: true,
        data: {
          title: article.title,
          sections: sections,
          metadata: article.metadata
        },
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
        rqsEntryRepository: this.rqsEntryRepository,
        screeningRecordRepository: this.screeningRecordRepository,
        aiService: new AIService(req.userId),
        pythonGraphService: this.pythonGraphService,
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

  /**
   * POST /api/projects/:projectId/article/versions
   * Guardar una versión del artículo
   */
  async saveVersion(req, res) {
    try {
      const { projectId } = req.params;
      const { title, sections, changeDescription } = req.body;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para guardar versiones de este artículo'
        });
      }

      // Obtener siguiente número de versión
      const nextVersion = await this.articleVersionRepository.getNextVersionNumber(projectId);

      // Crear objeto de versión
      const versionData = {
        id: uuidv4(),
        projectId,
        versionNumber: nextVersion,
        title,
        abstract: sections.abstract || '',
        introduction: sections.introduction || '',
        methods: sections.methods || '',
        results: sections.results || '',
        discussion: sections.discussion || '',
        conclusions: sections.conclusions || '',
        referencesSection: sections.references || '',
        declarations: sections.declarations || '',
        description: changeDescription || `Versión ${nextVersion}`,
        wordCount: 0,
        createdBy: req.userId,
        createdAt: new Date()
      };

      const articleVersion = new ArticleVersion(versionData);
      articleVersion.calculateWordCount();

      // Guardar en la base de datos
      const savedVersion = await this.articleVersionRepository.create(articleVersion);

      res.status(201).json({
        success: true,
        data: savedVersion.toJSON()
      });
    } catch (error) {
      console.error('Error al guardar versión del artículo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al guardar versión del artículo',
        error: error.message
      });
    }
  }

  /**
   * GET /api/projects/:projectId/article/versions
   * Obtener todas las versiones del artículo
   */
  async getVersions(req, res) {
    try {
      const { projectId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para acceder a las versiones de este artículo'
        });
      }

      // Obtener versiones
      const versions = await this.articleVersionRepository.findByProject(projectId);

      res.status(200).json({
        success: true,
        data: versions.map(v => v.toJSON())
      });
    } catch (error) {
      console.error('Error al obtener versiones del artículo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener versiones del artículo',
        error: error.message
      });
    }
  }

  /**
   * GET /api/projects/:projectId/article/versions/:versionId
   * Obtener una versión específica del artículo
   */
  async getVersion(req, res) {
    try {
      const { projectId, versionId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para acceder a esta versión del artículo'
        });
      }

      // Obtener versión
      const version = await this.articleVersionRepository.findById(versionId);

      if (!version) {
        return res.status(404).json({
          success: false,
          message: 'Versión no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        data: version.toJSON()
      });
    } catch (error) {
      console.error('Error al obtener versión del artículo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener versión del artículo',
        error: error.message
      });
    }
  }

  /**
   * PUT /api/projects/:projectId/article/versions/:versionId
   * Actualizar una versión del artículo
   */
  async updateVersion(req, res) {
    try {
      const { projectId, versionId } = req.params;
      const { title, sections } = req.body;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para actualizar esta versión del artículo'
        });
      }

      // Actualizar versión
      const updatedVersion = await this.articleVersionRepository.update(versionId, {
        title,
        sections
      });

      if (!updatedVersion) {
        return res.status(404).json({
          success: false,
          message: 'Versión no encontrada'
        });
      }

      // Recalcular palabras
      updatedVersion.calculateWordCount();
      await this.articleVersionRepository.update(versionId, {
        wordCount: updatedVersion.wordCount
      });

      res.status(200).json({
        success: true,
        data: updatedVersion.toJSON()
      });
    } catch (error) {
      console.error('Error al actualizar versión del artículo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar versión del artículo',
        error: error.message
      });
    }
  }

}

module.exports = ArticleController;
