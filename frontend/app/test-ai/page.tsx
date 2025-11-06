"use client"

import { useState, useEffect } from 'react'
import { AIGeneratorPanel } from '@/components/protocol/ai-protocol-generator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AITestPage() {
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [showGenerator, setShowGenerator] = useState(false)

  // Cargar ejemplo
  useEffect(() => {
    const example = {
      title: 'Object Document Mapping with Mongoose in Node.js Applications',
      description: 'Esta revisión sistemática tiene como objetivo analizar y sintetizar la literatura existente sobre el uso de Mongoose ODM en aplicaciones Node.js. Se enfocará en identificar patrones de diseño comunes, mejores prácticas de desarrollo, consideraciones de rendimiento, y casos de uso específicos.'
    }
    setProjectTitle(example.title)
    setProjectDescription(example.description)
  }, [])

  const handleAnalysisComplete = (analysis: any) => {
    console.log('Análisis completo:', analysis)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Prueba de Generador de IA</h1>
            <p className="text-muted-foreground mt-2">
              Prueba el generador de protocolos PRISMA con ChatGPT y Gemini
            </p>
          </div>

          {!showGenerator ? (
            <Card>
              <CardHeader>
                <CardTitle>Información del Proyecto</CardTitle>
                <CardDescription>
                  Ingresa el título y descripción de tu proyecto para generar el protocolo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Título del Proyecto
                  </label>
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Ej: Object Document Mapping with Mongoose..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descripción del Proyecto
                  </label>
                  <Textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe los objetivos y alcance de tu revisión sistemática..."
                    rows={6}
                  />
                </div>

                <Button 
                  onClick={() => setShowGenerator(true)}
                  disabled={!projectTitle || !projectDescription}
                  size="lg"
                  className="w-full"
                >
                  Continuar al Generador de IA
                </Button>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    💡 <strong>Tip:</strong> Ya hay un ejemplo cargado. Solo haz clic en "Continuar" para probar.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowGenerator(false)}
                className="mb-4"
              >
                ← Editar Información del Proyecto
              </Button>

              <AIGeneratorPanel
                projectTitle={projectTitle}
                projectDescription={projectDescription}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </>
          )}

          {/* Información adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ℹ️ Información de Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                • <strong>ChatGPT</strong>: Mejor para análisis profundos y complejos (30-60 segundos)
              </p>
              <p>
                • <strong>Gemini</strong>: Más rápido y económico (15-30 segundos)
              </p>
              <p>
                • Los resultados se muestran en la misma página
              </p>
              <p>
                • Puedes ver el JSON completo al final de los resultados
              </p>
              <p>
                • El análisis incluye todas las 7 fases del protocolo PRISMA
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
