'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Iniciando callback de OAuth...')
        
        // Obtener el token de la URL
        const token = searchParams.get('token')
        console.log('Token recibido:', token ? 'Sí ✅' : 'No ❌')
        
        if (!token) {
          throw new Error('No se recibió token de autenticación')
        }

        // Guardar el token
        console.log('💾 Guardando token...')
        apiClient.setToken(token)

        // Obtener los datos del usuario para verificar
        console.log('👤 Obteniendo datos del usuario...')
        const userData = await apiClient.getMe()
        console.log('✅ Usuario obtenido:', userData)

        // Limpiar la URL
        window.history.replaceState({}, '', '/dashboard')

        // Esperar un momento antes de redirigir para asegurar que todo está guardado
        await new Promise(resolve => setTimeout(resolve, 100))

        // Redirigir al dashboard con reemplazo de ruta (no agregar al historial)
        console.log('🚀 Redirigiendo al dashboard...')
        router.replace('/dashboard')
      } catch (err: any) {
        console.error('❌ Error en callback de OAuth:', err)
        setError(err.message || 'Error al procesar autenticación')
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

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
