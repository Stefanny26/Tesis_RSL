import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "PRISMA AI - Sistema de Gestión de Revisiones Sistemáticas",
  description: "Plataforma web para la gestión de Revisiones Sistemáticas de Literatura con validación automatizada mediante IA según estándar PRISMA 2020 - Universidad de las Fuerzas Armadas ESPE",
  generator: "ESPE - Dpto. Ciencias de la Computación",
  authors: [
    { name: "Stefanny Mishel Hernández Buenaño" },
    { name: "Adriana Pamela González Orellana" }
  ],
  keywords: ["Revisión Sistemática", "PRISMA 2020", "Inteligencia Artificial", "LLM", "RSL", "Research"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div>Loading...</div>}>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
