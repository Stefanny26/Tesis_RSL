import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Verificar si hay token JWT en las cookies
  const authToken = request.cookies.get("authToken")

  const isAuthPage = request.nextUrl.pathname.startsWith("/login")

  const isCallbackPage = request.nextUrl.pathname.startsWith("/auth/callback")

  const isProtectedPage = request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/projects")

  // Permitir acceso a la página de callback sin autenticación
  if (isCallbackPage) {
    return NextResponse.next()
  }

  // Redirigir al login si se intenta acceder a una página protegida sin token
  if (isProtectedPage && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirigir al dashboard si se intenta acceder a páginas de auth con token
  if (isAuthPage && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/login", "/auth/callback"],
}
