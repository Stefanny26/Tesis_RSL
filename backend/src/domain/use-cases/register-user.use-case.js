const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../../infrastructure/repositories/user.repository');

/**
 * Caso de uso: Registro de usuario
 */
class RegisterUserUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(userData) {
    const { email, fullName, password } = userData;

    // Validaciones
    if (!email || !fullName || !password) {
      throw new Error('Email, nombre completo y contraseña son requeridos');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await this.userRepository.create({
      email,
      fullName,
      passwordHash
    });

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

module.exports = RegisterUserUseCase;
