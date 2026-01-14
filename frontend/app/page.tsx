import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeSwitch } from "@/components/ui/theme-switch"
import { BookOpen, Brain, CheckCircle, FileText, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <div className="flex flex-col">
              <span className="font-bold text-xl">PRISMA AI</span>
              <span className="text-xs text-muted-foreground">Systematic Review Manager</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <ThemeSwitch />
            <Button asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <CheckCircle className="h-4 w-4" />
            Validación automática con estándar PRISMA 2020
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-balance">
            Sistema Web para Gestión de Revisiones Sistemáticas con Validación por IA
          </h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            Plataforma que optimiza cada fase de tu Revisión Sistemática de Literatura: desde la planificación PICO hasta la validación secuencial de los 27 ítems PRISMA mediante un <span className="font-semibold text-foreground">AI Gatekeeper</span>
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/login">Comenzar Revisión</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#prisma">Conocer PRISMA 2020</Link>
            </Button>
          </div>
          <div className="pt-4 space-y-1">
            <p className="text-sm font-medium">Universidad de las Fuerzas Armadas ESPE</p>
            <p className="text-xs text-muted-foreground">Departamento de Ciencias de la Computación</p>
            <p className="text-xs text-muted-foreground">Ingeniería en Tecnologías de la Información</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-xl font-bold text-center mb-4">Características del Sistema</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Diseñado para guiar investigadores en el cumplimiento riguroso de metodologías Cochrane y PRISMA
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>AI Gatekeeper</CardTitle>
              <CardDescription>
                Validación secuencial de los 27 ítems PRISMA 2020 con retroalimentación inteligente para garantizar calidad metodológica
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Protocolo PICO</CardTitle>
              <CardDescription>
                Asistente guiado para definir criterios de elegibilidad: Población, Intervención, Comparación y Outcomes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Cribado Inteligente</CardTitle>
              <CardDescription>
                Embeddings semánticos (MiniLM-L6-v2) y LLMs (Gemini/ChatGPT) para clasificación automática de estudios
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Cumplimiento PRISMA</CardTitle>
              <CardDescription>
                Checklist interactivo de 27 ítems con validación automática y sugerencias textuales generadas por IA
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Revisión por Pares</CardTitle>
              <CardDescription>
                Flujo de trabajo colaborativo para validación dual de referencias según metodología Cochrane
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Generación de Cadenas de Búsqueda</CardTitle>
              <CardDescription>
                Asistente con IA para crear estrategias de búsqueda optimizadas para bases de datos académicas
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* PRISMA 2020 Section */}
      <section id="prisma" className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-4">Estándar PRISMA 2020</h2>
          <p className="text-center text-muted-foreground mb-8">
            Preferred Reporting Items for Systematic Reviews and Meta-Analyses
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Qué es PRISMA?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  PRISMA 2020 es un estándar internacional que proporciona una guía basada en evidencia para reportar revisiones sistemáticas de manera transparente y completa.
                </p>
                <p>
                  Consta de un <strong>checklist de 27 ítems</strong> que cubren todas las secciones de una revisión sistemática, desde el título hasta la disponibilidad de datos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nuestro Enfoque Innovador</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Este sistema implementa un <strong className="text-foreground">mecanismo de "gatekeeper"</strong> que utiliza IA generativa para verificar secuencialmente que cada ítem PRISMA cumpla con los estándares de calidad.
                </p>
                <p>
                  La validación automática no solo controla la calidad, sino que también <strong className="text-foreground">forma al investigador</strong> con retroalimentación contextual.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Secciones PRISMA 2020</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    Estructura del Reporte
                  </h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Título e Identificación (Ítem 1)</li>
                    <li>• Resumen Estructurado (Ítem 2)</li>
                    <li>• Introducción: Rationale y Objetivos (Ítems 3-4)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    Métodos
                  </h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Criterios de elegibilidad (Ítem 5)</li>
                    <li>• Fuentes de información (Ítem 6)</li>
                    <li>• Estrategia de búsqueda (Ítem 7)</li>
                    <li>• Proceso de selección (Ítem 8)</li>
                    <li>• Evaluación de riesgo de sesgo (Ítem 11)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    Resultados
                  </h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Selección de estudios (Ítems 16a-b)</li>
                    <li>• Características de estudios (Ítem 17)</li>
                    <li>• Riesgo de sesgo (Ítem 18)</li>
                    <li>• Síntesis de resultados (Ítems 20a-d)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    Discusión y Otros
                  </h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Interpretación y limitaciones (Ítems 23a-c)</li>
                    <li>• Implicaciones (Ítem 23d)</li>
                    <li>• Registro y protocolo (Ítems 24a-c)</li>
                    <li>• Disponibilidad de datos (Ítem 27)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-bold">Comienza tu Revisión Sistemática Hoy</h2>
          <p className="text-muted-foreground">
            Optimiza tu investigación con asistencia inteligente y garantiza el cumplimiento de los más altos estándares metodológicos
          </p>
          <Button size="lg" asChild>
            <Link href="/login">Acceder al Sistema</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                PRISMA AI
              </h3>
              <p className="text-sm text-muted-foreground">
                Sistema Web para la Gestión de Revisiones Sistemáticas con Validación Automatizada mediante IA
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Autoras</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Stefanny Mishel Hernández Buenaño</li>
                <li>Adriana Pamela González Orellana</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Tutor: Paulo César Galarza Sánchez
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Institución</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Universidad de las Fuerzas Armadas ESPE</li>
                <li>Departamento de Ciencias de la Computación</li>
                <li>Carrera: Ingeniería en Tecnologías de la Información</li>
                <li className="pt-2">Sangolquí, Ecuador - 2025</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>Trabajo de Integración Curricular - Metodología: Design Science Research (DSR)</p>
            <p className="mt-1">© 2025 ESPE. Sistema desarrollado bajo licencia académica.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
