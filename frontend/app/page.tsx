import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain, CheckCircle, FileText, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold text-xl">RSL Manager</span>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-balance">
            Gestión Inteligente de Revisiones Sistemáticas de Literatura
          </h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Sistema web con validación automatizada mediante IA para optimizar tu proceso de investigación académica
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground pt-2">Universidad de las Fuerzas Armadas ESPE</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Características Principales</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Validación con IA</CardTitle>
              <CardDescription>
                Validación automatizada de protocolos PRISMA y clasificación inteligente de referencias
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Protocolo PICO</CardTitle>
              <CardDescription>
                Asistente guiado para definir población, intervención, comparación y resultados
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Cribado Automático</CardTitle>
              <CardDescription>
                Clasificación automática de referencias usando embeddings y similitud semántica
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Checklist PRISMA</CardTitle>
              <CardDescription>Validación de los 27 ítems PRISMA con sugerencias de mejora por IA</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Colaboración</CardTitle>
              <CardDescription>
                Trabajo en equipo con roles diferenciados: investigadores, revisores y administradores
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Generación de Artículos</CardTitle>
              <CardDescription>Generación automática de borradores con control de versiones integrado</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Universidad de las Fuerzas Armadas ESPE - Sistema de Gestión de Revisiones Sistemáticas</p>
        </div>
      </footer>
    </div>
  )
}
