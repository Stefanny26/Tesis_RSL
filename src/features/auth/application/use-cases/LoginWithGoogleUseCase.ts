/**
 * Use Case: Login with Google
 * 
 * Gestiona la lógica de negocio para autenticación con Google OAuth.
 */

import { User } from "../../domain/entities/User"
import { IAuthRepository } from "../../domain/repositories/IAuthRepository"

export class LoginWithGoogleUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<User> {
    // Delegar al repositorio (deja propagar el error original)
    const user = await this.authRepository.loginWithGoogle()
    return user
  }
}
