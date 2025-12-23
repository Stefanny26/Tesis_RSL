"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, Database, Search, FileText, CheckCircle } from "lucide-react"

interface PrismaFlowDiagramProps {
  stats: {
    identified: number
    duplicates: number
    afterDedup: number
    screenedTitleAbstract: number
    excludedTitleAbstract: number
    fullTextAssessed: number
    excludedFullText: number
    includedFinal: number
  }
}

export function PrismaFlowDiagram({ stats }: PrismaFlowDiagramProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Diagrama de Flujo PRISMA 2020
        </CardTitle>
        <CardDescription>
          Visualización del proceso de selección de estudios según directrices PRISMA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Fase 1: Identificación */}
          <div className="relative">
            <div className="border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-lg">Identificación</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Búsqueda en bases de datos académicas</p>
              <div className="bg-muted/50 rounded-lg p-4 inline-block">
                <p className="text-3xl font-bold text-foreground">{stats.identified}</p>
                <p className="text-sm text-muted-foreground">Referencias identificadas</p>
              </div>
            </div>
            <div className="flex justify-center my-2">
              <ArrowDown className="h-6 w-6 text-gray-400" />
            </div>
          </div>

          {/* Duplicados */}
          <div className="relative">
            <div className="border-2 border-primary/30 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.duplicates}</p>
                  <p className="text-sm text-muted-foreground">Duplicados eliminados</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.afterDedup}</p>
                  <p className="text-sm text-muted-foreground">Referencias únicas</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center my-2">
              <ArrowDown className="h-6 w-6 text-gray-400" />
            </div>
          </div>

          {/* Fase 2: Cribado */}
          <div className="relative">
            <div className="border-2 border-purple-300 dark:border-purple-700 rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-lg">Cribado</h3>
                <Badge variant="secondary">Fase 1: Título/Resumen</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center border border-purple-300 dark:border-purple-700">
                  <p className="text-2xl font-bold text-foreground">{stats.screenedTitleAbstract}</p>
                  <p className="text-sm text-muted-foreground">Evaluadas</p>
                </div>
                <div className="border border-red-300 dark:border-red-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.excludedTitleAbstract}</p>
                  <p className="text-sm text-red-700 dark:text-red-400">❌ Excluidas</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center my-2">
              <ArrowDown className="h-6 w-6 text-gray-400" />
            </div>
          </div>

          {/* Fase 3: Elegibilidad */}
          <div className="relative">
            <div className="border-2 border-orange-300 dark:border-orange-700 rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h3 className="font-semibold text-lg">Elegibilidad</h3>
                <Badge variant="secondary">Fase 2: Texto Completo</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center border border-orange-300 dark:border-orange-700">
                  <p className="text-2xl font-bold text-foreground">{stats.fullTextAssessed}</p>
                  <p className="text-sm text-muted-foreground">Evaluadas</p>
                </div>
                <div className="border border-red-300 dark:border-red-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.excludedFullText}</p>
                  <p className="text-sm text-red-700 dark:text-red-400">❌ Excluidas</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center my-2">
              <ArrowDown className="h-6 w-6 text-gray-400" />
            </div>
          </div>

          {/* Resultado Final */}
          <div className="relative">
            <div className="border-2 border-green-400 dark:border-green-600 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-xl">Incluidas</h3>
              </div>
              <div className="bg-muted/50 rounded-lg p-6 inline-block border-2 border-green-400 dark:border-green-600">
                <p className="text-4xl font-bold text-foreground mb-2">{stats.includedFinal}</p>
                <p className="text-sm text-muted-foreground">Estudios incluidos en la síntesis</p>
                <div className="mt-4 pt-4 border-t border-green-300 dark:border-green-700">
                  <p className="text-xs text-green-700 dark:text-green-400">
                    {stats.identified > 0 
                      ? `${((stats.includedFinal / stats.identified) * 100).toFixed(1)}% del total identificado`
                      : 'Pendiente de búsqueda'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen Estadístico */}
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-6">
            <h4 className="font-semibold mb-4 text-center">📊 Resumen del Proceso</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tasa de duplicados</p>
                <p className="text-lg font-semibold">
                  {stats.identified > 0 ? `${((stats.duplicates / stats.identified) * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tasa exclusión título</p>
                <p className="text-lg font-semibold">
                  {stats.afterDedup > 0 ? `${((stats.excludedTitleAbstract / stats.afterDedup) * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tasa exclusión completo</p>
                <p className="text-lg font-semibold">
                  {stats.fullTextAssessed > 0 ? `${((stats.excludedFullText / stats.fullTextAssessed) * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tasa inclusión final</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {stats.identified > 0 ? `${((stats.includedFinal / stats.identified) * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
