"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { User as DomainUser } from "@/src/features/auth/domain/entities/User"
import { 
  LoginUseCase, 
  RegisterUseCase, 
  LogoutUseCase,
  GetCurrentUserUseCase 
} from "@/src/features/auth/application/use-cases"
import { LocalStorageAuthRepository } from "@/src/features/auth/infrastructure/repositories"

// Tipo de interfaz compatible con el código existente
export interface User {
  id: string
  email: string
  name: string
  institution?: string
  image?: string // Agregar campo para la imagen del avatar
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Instanciar repositorio y casos de uso (Clean Architecture)
const authRepository = new LocalStorageAuthRepository()
const loginUseCase = new LoginUseCase(authRepository)
const registerUseCase = new RegisterUseCase(authRepository)
const logoutUseCase = new LogoutUseCase(authRepository)
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository)

// Convertir entidad del dominio a formato legacy
function domainUserToLegacy(domainUser: DomainUser): User {
  return {
    id: domainUser.id,
    email: domainUser.email,
    name: domainUser.name,
    institution: domainUser.institution,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (session?.user) {
          // Usuario autenticado con NextAuth (Google)
          const nextAuthUser: User = {
            id: session.user.id || session.user.email || "",
            email: session.user.email || "",
            name: session.user.name || "",
            image: session.user.image || undefined,
            institution: undefined, // Se puede extraer del dominio del email
          }
          setUser(nextAuthUser)
        } else {
          // Verificar sesión local (usuario registrado localmente)
          const currentUser = await getCurrentUserUseCase.execute()
          if (currentUser) {
            setUser(domainUserToLegacy(currentUser))
          }
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status !== "loading") {
      loadUser()
    }
  }, [session, status])

  const login = async (email: string, password: string) => {
    // Usar Clean Architecture: Use Case
    const domainUser = await loginUseCase.execute({ email, password })
    setUser(domainUserToLegacy(domainUser))
  }

  const loginWithGoogle = async () => {
    // Usar NextAuth para Google OAuth
    await signIn("google", { 
      callbackUrl: "/dashboard",
      redirect: true 
    })
  }

  const register = async (email: string, password: string, name: string) => {
    // Usar Clean Architecture: Use Case (set role implicitly as investigator in the use case/repository)
    const domainUser = await registerUseCase.execute({ email, password, name })
    setUser(domainUserToLegacy(domainUser))
  }

  const logout = async () => {
    if (session) {
      // Logout de NextAuth
      await signOut({ callbackUrl: "/" })
    } else {
      // Logout local
      await logoutUseCase.execute()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
