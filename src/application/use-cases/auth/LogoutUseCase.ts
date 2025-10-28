/**
 * Use Case: Logout
 * 
 * Gestiona la lógica de negocio para cerrar sesión.
 */

import { IAuthRepository } from "../../../domain/repositories/IAuthRepository"

export class LogoutUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.logout()
  }
}
