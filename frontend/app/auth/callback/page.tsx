'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const processedRef = useRef(false)

  useEffect(() => {
    // Evitar doble ejecución en React StrictMode
    if (processedRef.current) return
    processedRef.current = true

    const handleCallback = async () => {
      try {
        // Obtener el token de la URL
        const token = searchParams.get('token')
        
        if (!token) {
          throw new Error('No se recibió token de autenticación')
        }

        // Guardar el token
        apiClient.setToken(token)

        // Cargar usuario en el AuthContext (valida token con backend)
        await refreshUser()

        // Limpiar la URL (no exponer token en historial del navegador)
        window.history.replaceState({}, '', '/dashboard')

        // Esperar un momento antes de redirigir para asegurar que todo está guardado
        await new Promise(resolve => setTimeout(resolve, 100))

        // Redirigir al dashboard
        router.replace('/dashboard')
      } catch (err: any) {
        setError(err.message || 'Error al procesar autenticación')
        apiClient.clearToken()
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams, router, refreshUser])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Error de Autenticación
          </h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Redirigiendo al login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Autenticando...</h1>
        <p className="text-muted-foreground">
          Por favor espera mientras completamos tu autenticación con Google.
        </p>
      </div>
    </div>
  )
}
