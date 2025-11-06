"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "El título es requerido",
        variant: "destructive"
      })
      return
    }

    setIsCreating(true)
    
    try {
      const response = await apiClient.createProject({
        title: title.trim(),
        description: description.trim()
      })

      if (response.success) {
        toast({
          title: "¡Proyecto creado!",
          description: "Ahora puedes configurar tu protocolo PRISMA",
        })
        
        setOpen(false)
        setTitle("")
        setDescription("")
        
        // Redirigir al wizard de protocolo
        router.push(`/projects/${response.data.project.id}/protocol`)
        router.refresh() // Recargar para actualizar la lista
      }
    } catch (error: any) {
      console.error('Error creando proyecto:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el proyecto",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto RSL</DialogTitle>
          <DialogDescription>
            Ingresa los detalles básicos de tu revisión sistemática. Podrás configurar el protocolo en el siguiente
            paso.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Proyecto</Label>
            <Input
              id="title"
              placeholder="Ej: Inteligencia Artificial en Educación Superior"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe brevemente el objetivo de tu revisión sistemática..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isCreating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear y Configurar Protocolo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
