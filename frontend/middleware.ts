import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Validación básica de estructura JWT (3 partes base64).
 * No verifica firma (eso lo hace el backend), pero descarta cookies vacías/corruptas.
 */
function isValidJwtFormat(token: string): boolean {
  if (!token || token.length < 10) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  try {
    // Decodificar payload para verificar expiración
    const payload = JSON.parse(atob(parts[1]))
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false // Token expirado
    }
    return true
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("authToken")
  const tokenValue = authToken?.value || ''
  const hasValidToken = !!tokenValue && isValidJwtFormat(tokenValue)

  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
  const isCallbackPage = request.nextUrl.pathname.startsWith("/auth/callback")
  const isProtectedPage = request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/projects")

  // Permitir acceso a la página de callback sin autenticación
  if (isCallbackPage) {
    return NextResponse.next()
  }

  // Redirigir al login si se intenta acceder a una página protegida sin token válido
  if (isProtectedPage && !hasValidToken) {
    // Limpiar cookie inválida/expirada si existe
    const response = NextResponse.redirect(new URL("/login", request.url))
    if (authToken) {
      response.cookies.delete('authToken')
    }
    return response
  }

  // Solo redirigir al dashboard si el token tiene formato válido y no está expirado
  if (isAuthPage && hasValidToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Si estamos en login con token inválido, limpiar la cookie
  if (isAuthPage && authToken && !hasValidToken) {
    const response = NextResponse.next()
    response.cookies.delete('authToken')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/login", "/auth/callback"],
}