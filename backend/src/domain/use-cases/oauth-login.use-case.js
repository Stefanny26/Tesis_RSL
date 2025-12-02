const jwt = require('jsonwebtoken');
const UserRepository = require('../../infrastructure/repositories/user.repository');

/**
 * Caso de uso: Login con Google OAuth
 */
class OAuthLoginUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(profile) {
    const { id: googleId, emails, displayName, photos } = profile;

    // Validaciones
    if (!googleId || !emails || !emails[0]) {
      throw new Error('Perfil de Google incompleto');
    }

    const email = emails[0].value;
    const fullName = displayName || 'Usuario Google';
    const avatarUrl = photos && photos[0] ? photos[0].value : null;

    // Buscar usuario existente por Google ID
    let user = await this.userRepository.findByGoogleId(googleId);

    if (!user) {
      // Buscar por email (vincular cuenta existente)
      user = await this.userRepository.findByEmail(email);

      if (user) {
        // Vincular cuenta existente con Google
        user = await this.userRepository.update(user.id, {
          googleId,
          avatarUrl: avatarUrl || user.avatarUrl
        });
      } else {
        // Crear nuevo usuario OAuth con rol por defecto
        user = await this.userRepository.create({
          email,
          fullName,
          avatarUrl,
          googleId,
          role: 'researcher' // Rol por defecto para usuarios OAuth
        });
      }
    } else {
      // Actualizar avatar si cambió
      if (avatarUrl && user.avatarUrl !== avatarUrl) {
        user = await this.userRepository.update(user.id, { avatarUrl });
      }
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

module.exports = OAuthLoginUseCase;

