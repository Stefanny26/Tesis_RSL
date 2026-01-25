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
    <div className="bg-background border-b pb-3 mb-4">
      <div className="space-y-3">
        {/* Header con título y descripción más compacto */}
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <h1 className="text-xl font-bold tracking-tight leading-tight">{project.title}</h1>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {project.protocol?.picoFramework?.population
                ? `Investigación sobre ${project.protocol.picoFramework.population}`
                : project.description?.substring(0, 120) || 'Proyecto de revisión sistemática'}
            </p>
          </div>
          <Badge variant={project.status === "completed" ? "outline" : "default"} className="shrink-0 text-xs">
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

        {/* Navigation Tabs más compactos */}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            asChild
            variant={isActive(`/projects/${projectId}`) ? "default" : "outline"}
            size="sm"
            className="h-auto py-2 flex-col gap-1"
          >
            <Link href={`/projects/${projectId}`}>
              <Settings className="h-4 w-4" />
              <span className="text-xs">Protocolo</span>
            </Link>
          </Button>
          <Button 
            asChild
            variant={isActive(`/projects/${projectId}/screening`) ? "default" : "outline"}
            size="sm"
            className="h-auto py-2 flex-col gap-1"
          >
            <Link href={`/projects/${projectId}/screening`}>
              <Filter className="h-4 w-4" />
              <span className="text-xs">Cribado</span>
            </Link>
          </Button>
          <Button 
            asChild
            variant={isActive(`/projects/${projectId}/article`) ? "default" : "outline"}
            size="sm"
            className="h-auto py-2 flex-col gap-1"
          >
            <Link href={`/projects/${projectId}/article`}>
              <FileEdit className="h-4 w-4" />
              <span className="text-xs">Artículo</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
