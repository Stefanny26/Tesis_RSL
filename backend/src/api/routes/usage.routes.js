const express = require('express');
const ApiUsageController = require('../controllers/api-usage.controller');
const { authMiddleware } = require('../../infrastructure/middlewares/auth.middleware');

const router = express.Router();
const controller = new ApiUsageController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/usage/stats - Obtener estadísticas de uso
router.get('/stats', (req, res) => controller.getStats(req, res));

// GET /api/usage/recent - Obtener uso reciente
router.get('/recent', (req, res) => controller.getRecent(req, res));

// POST /api/usage/track - Registrar uso de API
router.post('/track', (req, res) => controller.track(req, res));

module.exports = router;
