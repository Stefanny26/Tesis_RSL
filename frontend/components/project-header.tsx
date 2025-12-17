"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Filter, ClipboardCheck, FileEdit } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Project } from "@/lib/types"

interface ProjectHeaderProps {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const pathname = usePathname()
  const projectId = project.id

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="sticky top-16 z-20 bg-background border-b pb-4 mb-6 -mx-4 px-4">
      <div className="space-y-4">
        {/* Header con título y descripción */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 mr-4">
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-muted-foreground">
              {project.protocol?.picoFramework?.population
                ? `Investigación sobre ${project.protocol.picoFramework.population}`
                : project.description?.substring(0, 200) || 'Proyecto de revisión sistemática'}
              {project.description && project.description.length > 200 && '...'}
            </p>
          </div>
          <Badge variant={project.status === "completed" ? "outline" : "default"}>
            {project.status === "draft"
              ? "Borrador"
              : project.status === "in-progress"
                ? "En Progreso"
                : project.status === "screening"
                  ? "Cribado"
                  : project.status === "analysis"
                    ? "Análisis"
                    : "Completado"}
          </Badge>
        </div>

        {/* Navigation Tabs */}
        <div className="grid md:grid-cols-4 gap-4">
          <Button 
            asChild
            variant={isActive(`/projects/${projectId}`) ? "default" : "outline"}
            className="h-auto py-4 flex-col gap-2"
          >
            <Link href={`/projects/${projectId}`}>
              <Settings className="h-5 w-5" />
              <span>Protocolo</span>
            </Link>
          </Button>
          <Button 
            asChild
            variant={isActive(`/projects/${projectId}/screening`) ? "default" : "outline"}
            className="h-auto py-4 flex-col gap-2"
          >
            <Link href={`/projects/${projectId}/screening`}>
              <Filter className="h-5 w-5" />
              <span>Cribado</span>
            </Link>
          </Button>
          <Button 
            asChild
            variant={isActive(`/projects/${projectId}/prisma`) ? "default" : "outline"}
            className="h-auto py-4 flex-col gap-2"
          >
            <Link href={`/projects/${projectId}/prisma`}>
              <ClipboardCheck className="h-5 w-5" />
              <span>PRISMA</span>
            </Link>
          </Button>
          <Button 
            asChild
            variant={isActive(`/projects/${projectId}/article`) ? "default" : "outline"}
            className="h-auto py-4 flex-col gap-2"
          >
            <Link href={`/projects/${projectId}/article`}>
              <FileEdit className="h-5 w-5" />
              <span>Artículo</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
