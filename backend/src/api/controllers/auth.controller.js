const RegisterUserUseCase = require('../../domain/use-cases/register-user.use-case');
const LoginUserUseCase = require('../../domain/use-cases/login-user.use-case');
const UserRepository = require('../../infrastructure/repositories/user.repository');

/**
 * Controlador de autenticación
 */
class AuthController {
  /**
   * POST /api/auth/register
   * Registro de nuevo usuario
   */
  async register(req, res) {
    try {
      const registerUseCase = new RegisterUserUseCase();
      const result = await registerUseCase.execute(req.body);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al registrar usuario'
      });
    }
  }

  /**
   * POST /api/auth/login
   * Login con email y contraseña
   */
  async login(req, res) {
    try {
      const loginUseCase = new LoginUserUseCase();
      const result = await loginUseCase.execute(req.body);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Credenciales inválidas'
      });
    }
  }

  /**
   * GET /api/auth/me
   * Obtener usuario actual (requiere autenticación)
   */
  async getMe(req, res) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user.toJSON()
        }
      });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario'
      });
    }
  }

  /**
   * GET /api/auth/google/callback
   * Callback de Google OAuth
   */
  async googleCallback(req, res) {
    try {
      // El usuario y token vienen de Passport
      const { user, token } = req.user;

      // Redirigir al frontend con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Error en callback de Google:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }
}

module.exports = new AuthController();
