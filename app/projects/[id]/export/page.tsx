"use client"

import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ExportDialog } from "@/components/export/export-dialog"
import { PrismaFlowDiagram } from "@/components/export/prisma-flow-diagram"
import { ProjectReport } from "@/components/export/project-report"
import { ReferenceExport } from "@/components/export/reference-export"
import { mockProjects } from "@/lib/mock-data"

export default function ExportPage({ params }: { params: { id: string } }) {
  const project = mockProjects.find((p) => p.id === params.id) || mockProjects[0]

  const prismaData = {
    identification: {
      databaseRecords: 240,
      otherSources: 5,
      duplicatesRemoved: 58,
    },
    screening: {
      recordsScreened: 187,
      recordsExcluded: 142,
    },
    eligibility: {
      fullTextAssessed: 45,
      fullTextExcluded: 12,
      exclusionReasons: [
        { reason: "No cumple criterios PICO", count: 5 },
        { reason: "Metodología inadecuada", count: 4 },
        { reason: "Datos insuficientes", count: 3 },
      ],
    },
    included: {
      studiesIncluded: 33,
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Exportación y Reportes</h1>
              <p className="text-muted-foreground">Genera reportes y exporta tu proyecto en múltiples formatos</p>
            </div>
            <ExportDialog projectId={project.id} projectTitle={project.title} />
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <ProjectReport project={project} />
              <ReferenceExport
                totalReferences={project.references?.total || 0}
                includedReferences={project.references?.included || 0}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <PrismaFlowDiagram data={prismaData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
