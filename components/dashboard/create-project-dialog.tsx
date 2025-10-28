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
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const router = useRouter()

  const handleCreate = () => {
    // Mock project creation - will be replaced with actual API call
    const newProjectId = Date.now().toString()
    setOpen(false)
    router.push(`/projects/${newProjectId}/protocol`)
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>
            Crear y Configurar Protocolo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
