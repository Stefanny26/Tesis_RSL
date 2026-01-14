"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Project } from "@/lib/types"
import { Calendar, Users, FileText, ArrowRight, MoreVertical, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getEffectiveProjectStatus, statusLabels, statusVariants } from "@/lib/project-status-utils"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export function ProjectCard({ project, onDelete }: { readonly project: Project; readonly onDelete?: (id: string) => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Detectar el estado efectivo usando la utilidad compartida
  const effectiveStatus = getEffectiveProjectStatus(project);
  const statusLabel = statusLabels[effectiveStatus];
  const statusVariant = statusVariants[effectiveStatus];
  const screeningProgress = project.references ? (project.references.screened / project.references.total) * 100 || 0 : 0;

  const handleDeleteProject = async () => {
    setIsDeleting(true)
    try {
      await apiClient.deleteProject(project.id)
      toast({
        title: "✅ Proyecto eliminado",
        description: "El proyecto ha sido eliminado exitosamente"
      })
      setShowDeleteDialog(false)
      
      // Si hay callback onDelete, llamarlo, sino recargar la página
      if (onDelete) {
        onDelete(project.id)
      } else {
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "❌ Error al eliminar",
        description: error.message || "No se pudo eliminar el proyecto",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 pr-2">
            <CardTitle className="text-base font-semibold line-clamp-1">{project.title}</CardTitle>
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowDeleteDialog(true)
              }}
              title="Eliminar proyecto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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

        {/* PRISMA compliance ahora se obtiene desde API /api/projects/:id/prisma */}

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

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto
              {' '}<span className="font-semibold">&quot;{project.title}&quot;</span>{' '}
              y todos sus datos asociados (protocolo, referencias, análisis, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
