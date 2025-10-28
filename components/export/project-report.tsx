"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/lib/types"
import { Download, BarChart3 } from "lucide-react"

interface ProjectReportProps {
  project: Project
}

export function ProjectReport({ project }: ProjectReportProps) {
  const handleExportReport = () => {
    console.log("[v0] Exporting project report")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reporte del Proyecto
            </CardTitle>
            <CardDescription>Resumen ejecutivo y estadísticas</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{project.title}</h3>
          <p className="text-sm text-muted-foreground">{project.description}</p>
          <div className="flex gap-2">
            <Badge>{project.status}</Badge>
            <Badge variant="outline">{project.collaborators.length + 1} colaboradores</Badge>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Referencias Totales</p>
            <p className="text-2xl font-bold">{project.references?.total || 0}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Referencias Incluidas</p>
            <p className="text-2xl font-bold text-green-600">{project.references?.included || 0}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Referencias Excluidas</p>
            <p className="text-2xl font-bold text-red-600">{project.references?.excluded || 0}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Cumplimiento PRISMA</p>
            <p className="text-2xl font-bold">{project.prismaCompliance || 0}%</p>
          </div>
        </div>

        {/* Protocol Summary */}
        {project.protocol && (
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-semibold">Protocolo PICO</h4>
            {project.protocol.picoFramework && (
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="font-medium">Población:</span>{" "}
                  <span className="text-muted-foreground">{project.protocol.picoFramework.population}</span>
                </div>
                <div>
                  <span className="font-medium">Intervención:</span>{" "}
                  <span className="text-muted-foreground">{project.protocol.picoFramework.intervention}</span>
                </div>
                <div>
                  <span className="font-medium">Comparación:</span>{" "}
                  <span className="text-muted-foreground">{project.protocol.picoFramework.comparison}</span>
                </div>
                <div>
                  <span className="font-medium">Resultado:</span>{" "}
                  <span className="text-muted-foreground">{project.protocol.picoFramework.outcome}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-2 p-4 border rounded-lg">
          <h4 className="font-semibold">Línea de Tiempo</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha de creación:</span>
              <span>{project.createdAt.toLocaleDateString("es-ES")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última actualización:</span>
              <span>{project.updatedAt.toLocaleDateString("es-ES")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duración:</span>
              <span>
                {Math.ceil((project.updatedAt.getTime() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24))} días
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
