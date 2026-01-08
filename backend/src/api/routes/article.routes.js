const express = require('express');
const router = express.Router();
const ArticleController = require('../controllers/article.controller');

const controller = new ArticleController();

/**
 * Rutas de Artículo Científico
 * Todas requieren autenticación (middleware aplicado en server.js)
 * Prefijo: /api/projects
 */

// GET /api/projects/:projectId/article/status - Verificar si puede generar artículo
router.get('/:projectId/article/status', (req, res) => controller.getStatus(req, res));

// POST /api/projects/:projectId/article/generate - Generar artículo completo
router.post('/:projectId/article/generate', (req, res) => controller.generate(req, res));

// POST /api/projects/:projectId/article/generate-section - Generar sección específica
router.post('/:projectId/article/generate-section', (req, res) => controller.generateSection(req, res));

// POST /api/projects/:projectId/article/versions - Guardar versión del artículo
router.post('/:projectId/article/versions', (req, res) => controller.saveVersion(req, res));

// GET /api/projects/:projectId/article/versions - Obtener todas las versiones
router.get('/:projectId/article/versions', (req, res) => controller.getVersions(req, res));

// GET /api/projects/:projectId/article/versions/:versionId - Obtener versión específica
router.get('/:projectId/article/versions/:versionId', (req, res) => controller.getVersion(req, res));

// PUT /api/projects/:projectId/article/versions/:versionId - Actualizar versión
router.put('/:projectId/article/versions/:versionId', (req, res) => controller.updateVersion(req, res));

module.exports = router;
