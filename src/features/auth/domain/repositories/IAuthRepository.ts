/**
 * Repository Interface: IAuthRepository
 * 
 * Define el contrato para operaciones de autenticación.
 * Esta interfaz pertenece al dominio y NO tiene dependencias externas.
 */

import { User } from "../entities/User"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  /**
   * Optional as only 'researcher' role is allowed; defaults to 'researcher'
   */
  role?: "researcher"
  institution?: string
}

export interface IAuthRepository {
  /**
   * Autentica un usuario con email y contraseña
   */
  login(credentials: LoginCredentials): Promise<User>

  /**
   * Autentica un usuario con Google OAuth
   */
  loginWithGoogle(): Promise<User>

  /**
   * Registra un nuevo usuario en el sistema
   */
  register(data: RegisterData): Promise<User>

  /**
   * Cierra la sesión del usuario actual
   */
  logout(): Promise<void>

  /**
   * Obtiene el usuario actualmente autenticado
   */
  getCurrentUser(): Promise<User | null>

  /**
   * Verifica si hay una sesión activa
   */
  isAuthenticated(): Promise<boolean>
}
