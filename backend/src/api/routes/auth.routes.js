const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../../infrastructure/middlewares/auth.middleware');
const { body } = require('express-validator');
const { validateRequest } = require('../validators/validators');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registro de usuario
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('fullName').notEmpty().withMessage('Nombre completo es requerido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    validateRequest
  ],
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login con email/password
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña es requerida'),
    validateRequest
  ],
  authController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private (requiere JWT)
 */
router.get('/me', authMiddleware, authController.getMe);

/**
 * @route   GET /api/auth/google
 * @desc    Iniciar autenticación con Google
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Callback de Google OAuth
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`
  }),
  authController.googleCallback
);

module.exports = router;
