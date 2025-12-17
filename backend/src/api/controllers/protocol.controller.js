const ProtocolRepository = require('../../infrastructure/repositories/protocol.repository');
const ProjectRepository = require('../../infrastructure/repositories/project.repository');

/**
 * Controlador de protocolos
 */
class ProtocolController {
  constructor() {
    this.protocolRepository = new ProtocolRepository();
    this.projectRepository = new ProjectRepository();
  }

  /**
   * GET /api/projects/:projectId/protocol
   */
  async get(req, res) {
    try {
      const { projectId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver este protocolo'
        });
      }

      let protocol = await this.protocolRepository.findByProjectId(projectId);

      // Si no existe, crear uno vacío
      if (!protocol) {
        protocol = await this.protocolRepository.create({ projectId });
      }

      res.status(200).json({
        success: true,
        data: { protocol: protocol.toJSON() }
      });
    } catch (error) {
      console.error('Error obteniendo protocolo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener protocolo'
      });
    }
  }

  /**
   * PUT /api/projects/:projectId/protocol
   */
  async update(req, res) {
    try {
      const { projectId } = req.params;

      // Verificar permisos
      const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para actualizar este protocolo'
        });
      }

      // Verificar si el protocolo existe, si no, crearlo primero
      let protocol = await this.protocolRepository.findByProjectId(projectId);
      if (!protocol) {
        console.log('⚠️ Protocolo no existe, creándolo para proyecto:', projectId);
        protocol = await this.protocolRepository.create({ projectId });
      }

      console.log('🔍 DEBUG - Datos recibidos para actualizar protocolo:', JSON.stringify(req.body, null, 2));

      // Actualizar el protocolo
      protocol = await this.protocolRepository.update(projectId, req.body);

      if (!protocol) {
        return res.status(404).json({
          success: false,
          message: 'No se pudo actualizar el protocolo'
        });
      }

      console.log('✅ DEBUG - Protocolo actualizado y devuelto:', JSON.stringify(protocol.toJSON(), null, 2));

      res.status(200).json({
        success: true,
        message: 'Protocolo actualizado exitosamente',
        data: { protocol: protocol.toJSON() }
      });
    } catch (error) {
      console.error('Error actualizando protocolo:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar protocolo'
      });
    }
  }
}

module.exports = new ProtocolController();
