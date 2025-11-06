"use client"

import { useEffect, useState } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProtocolWizard } from "@/components/protocol/protocol-wizard"
import { apiClient } from "@/lib/api-client"
import { Loader2 } from "lucide-react"
import type { Project } from "@/lib/types"

export default function ProtocolPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await apiClient.getProject(params.id)
        setProject(data)
      } catch (error) {
        console.error("Error cargando proyecto:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProject()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Cargando proyecto...</span>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Proyecto no encontrado</h2>
          <p className="text-muted-foreground">No se pudo cargar el proyecto solicitado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <ProtocolWizard
          projectId={params.id}
          projectTitle={project.title}
          projectDescription={project.description || ""}
        />
      </main>
    </div>
  )
}
