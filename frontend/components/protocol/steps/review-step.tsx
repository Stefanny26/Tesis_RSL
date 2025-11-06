"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

interface ReviewStepProps {
  data: any
}

export function ReviewStep({ data }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Revisión del Protocolo</h3>
        <p className="text-sm text-muted-foreground">
          Revisa todos los componentes de tu protocolo antes de finalizar. Podrás editarlo más tarde si es necesario.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Matriz Es/No Es
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">ES (Incluye):</p>
              <div className="space-y-1">
                {data.isNotMatrix.is.length > 0 ? (
                  data.isNotMatrix.is.map((item: string, i: number) => (
                    <Badge key={i} variant="secondary" className="mr-2">
                      {item}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No definido</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">NO ES (Excluye):</p>
              <div className="space-y-1">
                {data.isNotMatrix.isNot.length > 0 ? (
                  data.isNotMatrix.isNot.map((item: string, i: number) => (
                    <Badge key={i} variant="outline" className="mr-2">
                      {item}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No definido</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Framework PICO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Población:</p>
              <p className="text-sm text-muted-foreground">{data.pico.population || "No definido"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Intervención:</p>
              <p className="text-sm text-muted-foreground">{data.pico.intervention || "No definido"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Comparación:</p>
              <p className="text-sm text-muted-foreground">{data.pico.comparison || "No definido"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Resultado:</p>
              <p className="text-sm text-muted-foreground">{data.pico.outcome || "No definido"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Preguntas de Investigación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              {data.researchQuestions.filter((q: string) => q.trim()).length > 0 ? (
                data.researchQuestions
                  .filter((q: string) => q.trim())
                  .map((question: string, i: number) => (
                    <li key={i} className="text-sm">
                      {question}
                    </li>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No definidas</p>
              )}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Criterios de Selección
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Inclusión:</p>
              <ul className="list-disc list-inside space-y-1">
                {data.inclusionCriteria.filter((c: string) => c.trim()).length > 0 ? (
                  data.inclusionCriteria
                    .filter((c: string) => c.trim())
                    .map((criterion: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {criterion}
                      </li>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No definidos</p>
                )}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Exclusión:</p>
              <ul className="list-disc list-inside space-y-1">
                {data.exclusionCriteria.filter((c: string) => c.trim()).length > 0 ? (
                  data.exclusionCriteria
                    .filter((c: string) => c.trim())
                    .map((criterion: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {criterion}
                      </li>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No definidos</p>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Estrategia de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Bases de Datos:</p>
              <div className="flex flex-wrap gap-2">
                {data.searchStrategy.databases.length > 0 ? (
                  data.searchStrategy.databases.map((db: string, i: number) => (
                    <Badge key={i} variant="secondary">
                      {db}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No seleccionadas</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Cadena de Búsqueda:</p>
              <p className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded">
                {data.searchStrategy.searchString || "No definida"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
