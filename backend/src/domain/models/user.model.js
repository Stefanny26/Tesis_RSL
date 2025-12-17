/**
 * Modelo de dominio: Usuario
 * Representa un usuario del sistema
 */
class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.fullName = data.name || data.fullName;
    this.avatarUrl = data.avatar_url || data.avatarUrl;
    this.googleId = data.google_id || data.googleId;
    this.passwordHash = data.password_hash || data.passwordHash;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  /**
   * Convierte el modelo a un objeto plano para respuestas API
   * @param {boolean} includePassword - Si incluir el hash de contraseña
   */
  toJSON(includePassword = false) {
    const json = {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      avatarUrl: this.avatarUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    if (includePassword && this.passwordHash) {
      json.passwordHash = this.passwordHash;
    }

    return json;
  }

  /**
   * Convierte a formato snake_case para PostgreSQL
   */
  toDatabase() {
    return {
      id: this.id,
      email: this.email,
      name: this.fullName,
      avatar_url: this.avatarUrl,
      google_id: this.googleId,
      password_hash: this.passwordHash,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  /**
   * Valida que el usuario tenga los campos requeridos
   */
  validate() {
    if (!this.email) {
      throw new Error('Email es requerido');
    }

    if (!this.fullName) {
      throw new Error('Nombre completo es requerido');
    }

    // Validar email con regex básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error('Email no es válido');
    }

    return true;
  }
}

module.exports = User;
