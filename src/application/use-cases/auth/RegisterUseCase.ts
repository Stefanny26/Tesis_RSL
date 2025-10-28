/**
 * Use Case: Register
 * 
 * Gestiona la lógica de negocio para registrar nuevos usuarios.
 */

import { User } from "../../../domain/entities/User"
import { IAuthRepository, RegisterData } from "../../../domain/repositories/IAuthRepository"

export class RegisterUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(data: RegisterData): Promise<User> {
    // Validaciones de negocio
    if (!data.email || data.email.trim() === "") {
      throw new Error("El email es requerido")
    }

    if (!data.password || data.password.trim() === "") {
      throw new Error("La contraseña es requerida")
    }

    if (data.password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres")
    }

    if (!data.name || data.name.trim() === "") {
      throw new Error("El nombre es requerido")
    }

    // Forzar único rol permitido
    const safeData: RegisterData = {
      ...data,
      role: "researcher",
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      throw new Error("El formato del email es inválido")
    }

    // Delegar al repositorio (deja propagar el error original)
    const user = await this.authRepository.register(safeData)
    return user
  }
}
