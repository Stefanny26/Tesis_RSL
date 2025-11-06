import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Project } from "@/lib/types"
import { Calendar, Users, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

const statusConfig = {
  draft: { label: "Borrador", variant: "secondary" as const },
  "in-progress": { label: "En Progreso", variant: "default" as const },
  screening: { label: "Cribado", variant: "default" as const },
  analysis: { label: "Análisis", variant: "default" as const },
  completed: { label: "Completado", variant: "outline" as const },
}

export function ProjectCard({ project }: { project: Project }) {
  const statusInfo = statusConfig[project.status]
  const screeningProgress = project.references ? (project.references.screened / project.references.total) * 100 || 0 : 0

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.references && project.references.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso de Cribado</span>
              <span className="font-medium">
                {project.references.screened}/{project.references.total}
              </span>
            </div>
            <Progress value={screeningProgress} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{project.references?.total || 0} referencias</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{(project.collaborators?.length || 0) + 1} miembros</span>
          </div>
        </div>

        {project.prismaCompliance !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cumplimiento PRISMA</span>
            <span className="font-medium">{project.prismaCompliance}%</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Actualizado {new Date(project.updatedAt).toLocaleDateString("es-ES")}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href={`/projects/${project.id}`}>
            Ver Proyecto
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
