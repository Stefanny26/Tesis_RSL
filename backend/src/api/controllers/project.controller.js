const CreateProjectUseCase = require('../../domain/use-cases/create-project.use-case');
const GetUserProjectsUseCase = require('../../domain/use-cases/get-user-projects.use-case');
const ProjectRepository = require('../../infrastructure/repositories/project.repository');

/**
 * Controlador de proyectos
 */
class ProjectController {
  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  /**
   * GET /api/projects
   * Listar proyectos del usuario
   */
  async list(req, res) {
    try {
      const { limit, offset } = req.query;
      const getUserProjectsUseCase = new GetUserProjectsUseCase();
      
      const result = await getUserProjectsUseCase.execute(req.userId, {
        limit: limit ? Number.parseInt(limit) : undefined,
        offset: offset ? Number.parseInt(offset) : undefined
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error listando proyectos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar proyectos'
      });
    }
  }

  /**
   * GET /api/projects/:id
   * Obtener un proyecto específico con su protocolo
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const project = await this.projectRepository.findById(id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }

      // Verificar que el usuario sea el dueño
      if (project.ownerId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver este proyecto'
        });
      }

      // Cargar el protocolo asociado si existe
      const ProtocolRepository = require('../../infrastructure/repositories/protocol.repository');
      const protocolRepository = new ProtocolRepository();
      const protocol = await protocolRepository.findByProjectId(id);

      const projectData = project.toJSON();
      if (protocol) {
        projectData.protocol = protocol.toJSON();
      }

      res.status(200).json({
        success: true,
        data: { project: projectData }
      });
    } catch (error) {
      console.error('Error obteniendo proyecto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener proyecto'
      });
    }
  }

  /**
   * POST /api/projects
   * Crear nuevo proyecto
   */
  async create(req, res) {
    try {
      const createProjectUseCase = new CreateProjectUseCase();
      const project = await createProjectUseCase.execute(req.body, req.userId);

      res.status(201).json({
        success: true,
        message: 'Proyecto creado exitosamente',
        data: { project }
      });
    } catch (error) {
      console.error('Error creando proyecto:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear proyecto'
      });
    }
  }

  /**
   * PUT /api/projects/:id
   * Actualizar proyecto
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(id, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para actualizar este proyecto'
        });
      }

      const project = await this.projectRepository.update(id, req.body);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Proyecto actualizado exitosamente',
        data: { project: project.toJSON() }
      });
    } catch (error) {
      console.error('Error actualizando proyecto:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar proyecto'
      });
    }
  }

  /**
   * DELETE /api/projects/:id
   * Eliminar proyecto
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(id, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar este proyecto'
        });
      }

      await this.projectRepository.delete(id);

      res.status(200).json({
        success: true,
        message: 'Proyecto eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando proyecto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar proyecto'
      });
    }
  }

  /**
   * POST /api/cleanup-temporary-project
   * Limpiar proyecto temporal al abandonar wizard
   */
  async cleanupTemporary(req, res) {
    try {
      const { projectId } = req.body;

      // Verificar que el proyecto existe y es del usuario
      const project = await this.projectRepository.findById(projectId);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar este proyecto'
        });
      }

      // Solo eliminar si es temporal
      if (project.status === 'temporary' || project.title?.startsWith('[TEMPORAL]')) {
        console.log(`🧹 Eliminando proyecto temporal: ${projectId} (${project.title})`);
        await this.projectRepository.delete(projectId);
        
        res.status(200).json({
          success: true,
          message: 'Proyecto temporal eliminado exitosamente'
        });
      } else {
        console.log(`⏭️ Proyecto no es temporal, no se elimina: ${projectId} (status: ${project.status})`);
        res.status(200).json({
          success: true,
          message: 'Proyecto no requiere limpieza'
        });
      }
    } catch (error) {
      console.error('Error limpiando proyecto temporal:', error);
      res.status(500).json({
        success: false,
        message: 'Error al limpiar proyecto temporal'
      });
    }
  }
}

module.exports = new ProjectController();
