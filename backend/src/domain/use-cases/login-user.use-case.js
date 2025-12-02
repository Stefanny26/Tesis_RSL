const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../../infrastructure/repositories/user.repository');

/**
 * Caso de uso: Login de usuario
 */
class LoginUserUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(credentials) {
    const { email, password } = credentials;

    // Validaciones
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Buscar usuario
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Si el usuario se registró con Google OAuth, no tiene contraseña
    if (!user.passwordHash) {
      throw new Error('Esta cuenta fue creada con Google. Usa "Continuar con Google" para iniciar sesión.');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      user: user.toJSON(),
      token
    };
  }
}

module.exports = LoginUserUseCase;

