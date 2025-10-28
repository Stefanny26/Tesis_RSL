"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ImageIcon } from "lucide-react"

interface PrismaFlowData {
  identification: {
    databaseRecords: number
    otherSources: number
    duplicatesRemoved: number
  }
  screening: {
    recordsScreened: number
    recordsExcluded: number
  }
  eligibility: {
    fullTextAssessed: number
    fullTextExcluded: number
    exclusionReasons: { reason: string; count: number }[]
  }
  included: {
    studiesIncluded: number
  }
}

interface PrismaFlowDiagramProps {
  data: PrismaFlowData
}

export function PrismaFlowDiagram({ data }: PrismaFlowDiagramProps) {
  const handleExport = () => {
    // Mock export functionality
    console.log("[v0] Exporting PRISMA diagram")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Diagrama de Flujo PRISMA
            </CardTitle>
            <CardDescription>Visualización del proceso de selección de estudios</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Identification */}
          <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
            <h3 className="font-semibold mb-2">Identificación</h3>
            <div className="space-y-1 text-sm">
              <p>Registros identificados en bases de datos: {data.identification.databaseRecords}</p>
              <p>Registros de otras fuentes: {data.identification.otherSources}</p>
              <p className="font-medium pt-2 border-t">
                Total después de eliminar duplicados:{" "}
                {data.identification.databaseRecords +
                  data.identification.otherSources -
                  data.identification.duplicatesRemoved}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-border" />
          </div>

          {/* Screening */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <h3 className="font-semibold mb-2">Cribado</h3>
              <div className="space-y-1 text-sm">
                <p>Registros cribados: {data.screening.recordsScreened}</p>
              </div>
            </div>
            <div className="border-2 border-destructive rounded-lg p-4 bg-destructive/5">
              <h3 className="font-semibold mb-2">Excluidos</h3>
              <div className="space-y-1 text-sm">
                <p>Registros excluidos: {data.screening.recordsExcluded}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-border" />
          </div>

          {/* Eligibility */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <h3 className="font-semibold mb-2">Elegibilidad</h3>
              <div className="space-y-1 text-sm">
                <p>Artículos completos evaluados: {data.eligibility.fullTextAssessed}</p>
              </div>
            </div>
            <div className="border-2 border-destructive rounded-lg p-4 bg-destructive/5">
              <h3 className="font-semibold mb-2">Excluidos</h3>
              <div className="space-y-1 text-sm">
                <p>Artículos completos excluidos: {data.eligibility.fullTextExcluded}</p>
                <div className="pt-2 border-t mt-2">
                  <p className="font-medium mb-1">Razones:</p>
                  {data.eligibility.exclusionReasons.map((reason, i) => (
                    <p key={i} className="text-xs">
                      • {reason.reason}: {reason.count}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-border" />
          </div>

          {/* Included */}
          <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold mb-2">Incluidos</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-lg">Estudios incluidos en la síntesis: {data.included.studiesIncluded}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
