const express = require('express');
const protocolController = require('../controllers/protocol.controller');
const { authMiddleware } = require('../../infrastructure/middlewares/auth.middleware');
const { param } = require('express-validator');
const { validateRequest } = require('../validators/validators');

const router = express.Router();

router.use(authMiddleware);

/**
 * @route   GET /api/projects/:projectId/protocol
 * @desc    Obtener protocolo del proyecto
 * @access  Private
 */
router.get(
  '/:projectId/protocol',
  [
    param('projectId').isUUID().withMessage('ID de proyecto inválido'),
    validateRequest
  ],
  (req, res) => protocolController.get(req, res)
);

/**
 * @route   PUT /api/projects/:projectId/protocol
 * @desc    Actualizar protocolo
 * @access  Private
 */
router.put(
  '/:projectId/protocol',
  [
    param('projectId').isUUID().withMessage('ID de proyecto inválido'),
    validateRequest
  ],
  (req, res) => protocolController.update(req, res)
);

module.exports = router;
