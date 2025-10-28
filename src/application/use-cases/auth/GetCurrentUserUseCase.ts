/**
 * Use Case: Get Current User
 * 
 * Obtiene el usuario actualmente autenticado.
 */

import { User } from "../../../domain/entities/User"
import { IAuthRepository } from "../../../domain/repositories/IAuthRepository"

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<User | null> {
    return await this.authRepository.getCurrentUser()
  }
}
