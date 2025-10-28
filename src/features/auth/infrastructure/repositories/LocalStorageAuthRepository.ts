/**
 * Infrastructure: LocalStorage Auth Repository
 * 
 * Implementación del repositorio de autenticación usando LocalStorage.
 * Esta es una implementación temporal que será reemplazada por Supabase.
 */

import { User } from "../../domain/entities/User"
import { 
  IAuthRepository, 
  LoginCredentials, 
  RegisterData 
} from "../../domain/repositories/IAuthRepository"

export class LocalStorageAuthRepository implements IAuthRepository {
  private readonly STORAGE_KEY = "rsl_user"

  async login(credentials: LoginCredentials): Promise<User> {
    // Mock authentication - En producción esto se conectará a Supabase
    // Simulamos un delay de red
    await this.delay(500)

    // Validación simple para demo
    if (credentials.email && credentials.password) {
      const user = new User({
        id: Date.now().toString(),
        email: credentials.email,
        name: credentials.email.split("@")[0],
        role: "researcher",
        institution: "Universidad de las Fuerzas Armadas ESPE",
      })

      this.saveUser(user)
      return user
    }

    throw new Error("Credenciales inválidas")
  }

  async loginWithGoogle(): Promise<User> {
    // Mock Google OAuth - En producción: supabase.auth.signInWithOAuth({ provider: 'google' })
    await this.delay(800)

    const user = new User({
      id: Date.now().toString(),
      email: "usuario@gmail.com",
      name: "Usuario Google",
      role: "researcher",
      institution: "Universidad de las Fuerzas Armadas ESPE",
    })

    this.saveUser(user)
    return user
  }

  async register(data: RegisterData): Promise<User> {
    // Mock registration - En producción: supabase.auth.signUp()
    await this.delay(600)

    const user = new User({
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: "researcher",
      institution: data.institution || "Universidad de las Fuerzas Armadas ESPE",
    })

    this.saveUser(user)
    return user
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = localStorage.getItem(this.STORAGE_KEY)
    
    if (!userJson) {
      return null
    }

    try {
      return User.fromJSON(JSON.parse(userJson))
    } catch (error) {
      // Si hay error al parsear, limpiamos el storage
      localStorage.removeItem(this.STORAGE_KEY)
      return null
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  // Métodos privados auxiliares
  private saveUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user.toJSON()))
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
