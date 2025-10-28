/**
 * Use Case: Login
 * 
 * Gestiona la lógica de negocio para autenticar usuarios.
 * No depende de frameworks, solo del dominio.
 */

import { User } from "../../domain/entities/User"
import { IAuthRepository, LoginCredentials } from "../../domain/repositories/IAuthRepository"

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<User> {
    // Validaciones de negocio
    if (!credentials.email || credentials.email.trim() === "") {
      throw new Error("El email es requerido")
    }

    if (!credentials.password || credentials.password.trim() === "") {
      throw new Error("La contraseña es requerida")
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(credentials.email)) {
      throw new Error("El formato del email es inválido")
    }

    // Delegar al repositorio (deja propagar el error original)
    const user = await this.authRepository.login(credentials)
    return user
  }
}
