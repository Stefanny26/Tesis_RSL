const express = require('express');
const projectController = require('../controllers/project.controller');
const { authMiddleware } = require('../../infrastructure/middlewares/auth.middleware');
const { body, param } = require('express-validator');
const { validateRequest } = require('../validators/validators');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   GET /api/projects
 * @desc    Listar proyectos del usuario
 * @access  Private
 */
router.get('/', (req, res) => projectController.list(req, res));

/**
 * @route   GET /api/projects/:id
 * @desc    Obtener proyecto específico
 * @access  Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('ID de proyecto inválido'),
    validateRequest
  ],
  (req, res) => projectController.getById(req, res)
);

/**
 * @route   POST /api/projects
 * @desc    Crear nuevo proyecto
 * @access  Private
 */
router.post(
  '/',
  [
    body('title')
      .notEmpty()
      .withMessage('Título es requerido')
      .isLength({ max: 500 })
      .withMessage('Título no puede exceder 500 caracteres'),
    body('description').optional(),
    body('deadline').optional().isISO8601().withMessage('Fecha inválida'),
    validateRequest
  ],
  (req, res) => projectController.create(req, res)
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Actualizar proyecto
 * @access  Private
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('ID de proyecto inválido'),
    body('title')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Título no puede exceder 500 caracteres'),
    body('status')
      .optional()
      .isIn(['draft', 'in-progress', 'screening', 'analysis', 'completed'])
      .withMessage('Estado inválido'),
    body('deadline').optional().isISO8601().withMessage('Fecha inválida'),
    validateRequest
  ],
  (req, res) => projectController.update(req, res)
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Eliminar proyecto
 * @access  Private
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('ID de proyecto inválido'),
    validateRequest
  ],
  (req, res) => projectController.delete(req, res)
);

module.exports = router;
