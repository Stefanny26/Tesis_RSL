/**
 * Presentation Layer: Clean Auth Provider
 * 
 * Provider de autenticación usando Clean Architecture.
 * Este provider usa casos de uso en lugar de lógica directa.
 */

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { User } from "@domain/entities"
import { 
  LoginUseCase, 
  LoginWithGoogleUseCase, 
  RegisterUseCase, 
  LogoutUseCase,
  GetCurrentUserUseCase 
} from "@application/use-cases/auth"
import { LocalStorageAuthRepository } from "@infrastructure/repositories"
// Roles removed: application only supports researcher profile

interface CleanAuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const CleanAuthContext = createContext<CleanAuthContextType | undefined>(undefined)

// Instanciar repositorio y casos de uso
const authRepository = new LocalStorageAuthRepository()
const loginUseCase = new LoginUseCase(authRepository)
const loginWithGoogleUseCase = new LoginWithGoogleUseCase(authRepository)
const registerUseCase = new RegisterUseCase(authRepository)
const logoutUseCase = new LogoutUseCase(authRepository)
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository)

export function CleanAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar usuario actual al iniciar
    const loadCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUserUseCase.execute()
        setUser(currentUser)
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCurrentUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const loggedUser = await loginUseCase.execute({ email, password })
      setUser(loggedUser)
    } catch (error) {
      throw error
    }
  }

  const loginWithGoogle = async () => {
    try {
      const loggedUser = await loginWithGoogleUseCase.execute()
      setUser(loggedUser)
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const newUser = await registerUseCase.execute({ email, password, name })
      setUser(newUser)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    await logoutUseCase.execute()
    setUser(null)
  }

  return (
    <CleanAuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, isLoading }}>
      {children}
    </CleanAuthContext.Provider>
  )
}

export function useCleanAuth() {
  const context = useContext(CleanAuthContext)
  if (context === undefined) {
    throw new Error("useCleanAuth must be used within a CleanAuthProvider")
  }
  return context
}
