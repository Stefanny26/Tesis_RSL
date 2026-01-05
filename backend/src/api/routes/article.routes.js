const express = require('express');
const router = express.Router();
const ArticleController = require('../controllers/article.controller');

const controller = new ArticleController();

/**
 * Rutas de Artículo Científico
 * Todas requieren autenticación (middleware aplicado en server.js)
 */

// GET /api/projects/:projectId/article/status - Verificar si puede generar artículo
router.get('/projects/:projectId/article/status', (req, res) => controller.getStatus(req, res));

// POST /api/projects/:projectId/article/generate - Generar artículo completo
router.post('/projects/:projectId/article/generate', (req, res) => controller.generate(req, res));

// POST /api/projects/:projectId/article/generate-section - Generar sección específica
router.post('/projects/:projectId/article/generate-section', (req, res) => controller.generateSection(req, res));

module.exports = router;
