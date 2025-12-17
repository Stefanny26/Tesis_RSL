const express = require('express');
const PrismaController = require('../controllers/prisma.controller');
const { authMiddleware } = require('../../infrastructure/middlewares/auth.middleware');
const { param, body } = require('express-validator');
const { validateRequest } = require('../validators/validators');

const router = express.Router();
const prismaController = new PrismaController();

router.use(authMiddleware);

/**
 * @route   GET /api/projects/:projectId/prisma
 * @desc    Obtener todos los ítems PRISMA de un proyecto
 * @access  Private
 */
router.get(
  '/:projectId/prisma',
  [
    param('projectId').isUUID().withMessage('ID de proyecto inválido'),
    validateRequest
  ],
  (req, res) => prismaController.getAll(req, res)
);

/**
 * @route   GET /api/projects/:projectId/prisma/stats
 * @desc    Obtener estadísticas de cumplimiento PRISMA
 * @access  Private
 */
router.get(
  '/:projectId/prisma/stats',
  [
    param('projectId').isUUID().withMessage('ID de proyecto inválido'),
    validateRequest
  ],
  (req, res) => prismaController.getStats(req, res)
);

/**
 * @route   POST /api/projects/:projectId/prisma/generate
 * @desc    Generar contenido automatizado para todos los ítems PRISMA
 * @access  Private
 */
router.post(
  '/:projectId/prisma/generate',
  [
    param('projectId').isUUID().withMessage('ID de proyecto inválido'),
    validateRequest
  ],
  (req, res) => prismaController.generateContent(req, res)
);

/**
 * @route   GET /api/projects/:projectId/prisma/:itemNumber
 * @desc    Obtener un ítem PRISMA específico
 * @access  Private
 */
router.get(
  '/:projectId/prisma/:itemNumber',
  [
    param('projectId').isUUID().withMessage('ID de proyecto inválido'),
    param('itemNumber').isInt({ min: 1, max: 27 }).withMessage('Número de ítem debe estar entre 1 y 27'),
    validateRequest
  ],
  (req, res) => prismaController.getOne(req, res)
);

/**
 * @route   PUT /api/projects/:projectId/prisma/:itemNumber
 * @desc    Actualizar un ítem PRISMA
 * @access  Private
 */
router.put(
  '/:projectId/prisma/:itemNumber',
  [
    param('projectId').isUUID().withMessage('ID de proyecto inválido'),
    param('itemNumber').isInt({ min: 1, max: 27 }).withMessage('Número de ítem debe estar entre 1 y 27'),
    validateRequest
  ],
  (req, res) => prismaController.update(req, res)
);

/**
 * @route   PUT /api/projects/:projectId/prisma/:itemNumber/content
 * @desc    Actualizar solo el contenido de un ítem PRISMA
 * @access  Private
 */
router.put(
  '/:projectId/prisma/:itemNumber/content',
  [
    param('projectId').isUUID().withMessage('ID de proyecto inválido'),
    param('itemNumber').isInt({ min: 1, max: 27 }).withMessage('Número de ítem debe estar entre 1 y 27'),
    body('content').notEmpty().withMessage('El contenido es requerido'),
    validateRequest
  ],
  (req, res) => prismaController.updateContent(req, res)
);

/**
 * @route   POST /api/projects/:projectId/prisma/:itemNumber/validate
 * @desc    Validar ítem PRISMA con IA
 * @access  Private
 */
router.post(
  '/:projectId/prisma/:itemNumber/validate',
  [
    param('projectId').isUUID().withMessage('ID de proyecto inválido'),
    param('itemNumber').isInt({ min: 1, max: 27 }).withMessage('Número de ítem debe estar entre 1 y 27'),
    validateRequest
  ],
  (req, res) => prismaController.validateWithAI(req, res)
);

module.exports = router;
