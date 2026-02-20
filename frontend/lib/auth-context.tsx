"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient } from "./api-client"
import { useRouter } from "next/navigation"

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => void
  logout: () => void
  refreshUser: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Solo intentar cargar usuario si hay un token guardado
    const token = apiClient.getToken()
    if (token) {
      loadUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const userData = await apiClient.getMe()
      setUser(userData)
    } catch (error) {
      // Si falla, limpiar token inválido
      apiClient.clearToken()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { user: userData } = await apiClient.login(email, password)
      setUser(userData)
      router.push('/dashboard')
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  const loginWithGoogle = () => {
    // Redirigir al endpoint de Google OAuth del backend
    const googleAuthUrl = apiClient.getGoogleAuthUrl()
    window.location.href = googleAuthUrl
  }

  // DEPRECATED: El registro directo ya no se usa, solo OAuth Google
  // const register = async (email: string, password: string, name: string) => {
  //   try {
  //     const { user: userData } = await apiClient.register(email, name, password)
  //     setUser(userData)
  //     router.push('/dashboard')
  //   } catch (error: any) {
  //     throw new Error(error.message || 'Error al registrar usuario')
  //   }
  // }

  const refreshUser = async () => {
    try {
      setIsLoading(true)
      const userData = await apiClient.getMe()
      setUser(userData)
    } catch (error) {
      apiClient.clearToken()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    apiClient.clearToken()
    setUser(null)
    // Forzar redirección completa al login (no usar router.push para evitar caché de sesión)
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, refreshUser, isLoading }}>
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
