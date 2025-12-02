"use client"

import { CheckCircle2, Circle, FileText, Search, Filter, ClipboardCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectPhase {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  status: "completed" | "current" | "pending"
  href: string
}

interface ProjectPhaseIndicatorProps {
  currentPhase: "protocol" | "search" | "screening" | "validation"
  projectId: string
  completedPhases?: string[]
}

export function ProjectPhaseIndicator({
  currentPhase,
  projectId,
  completedPhases = [],
}: ProjectPhaseIndicatorProps) {
  const phases: ProjectPhase[] = [
    {
      id: "protocol",
      label: "Protocolo PICO",
      icon: FileText,
      status: currentPhase === "protocol" ? "current" : completedPhases.includes("protocol") ? "completed" : "pending",
      href: `/projects/${projectId}/protocol`,
    },
    {
      id: "search",
      label: "Búsqueda",
      icon: Search,
      status: currentPhase === "search" ? "current" : completedPhases.includes("search") ? "completed" : "pending",
      href: `/projects/${projectId}/screening`,
    },
    {
      id: "screening",
      label: "Cribado",
      icon: Filter,
      status: currentPhase === "screening" ? "current" : completedPhases.includes("screening") ? "completed" : "pending",
      href: `/projects/${projectId}/screening`,
    },
    {
      id: "validation",
      label: "Validación PRISMA",
      icon: ClipboardCheck,
      status: currentPhase === "validation" ? "current" : completedPhases.includes("validation") ? "completed" : "pending",
      href: `/projects/${projectId}/prisma`,
    },
  ]

  return (
    <div className="mb-8">
      <div className="grid grid-cols-4 gap-3">
        {phases.map((phase) => {
          const Icon = phase.icon

          return (
            <div
              key={phase.id}
              className={cn(
                "relative rounded-lg border-2 p-4 transition-all duration-300",
                {
                  "bg-primary/5 border-primary shadow-sm": phase.status === "completed",
                  "bg-primary/10 border-primary shadow-md ring-2 ring-primary/20": phase.status === "current",
                  "bg-muted/30 border-muted-foreground/20": phase.status === "pending",
                }
              )}
            >
              {/* Status Badge */}
              {phase.status === "completed" && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}

              {/* Icon */}
              <div
                className={cn("flex items-center justify-center w-10 h-10 rounded-full mb-3 mx-auto", {
                  "bg-primary text-primary-foreground": phase.status === "completed",
                  "bg-primary/20 text-primary": phase.status === "current",
                  "bg-muted text-muted-foreground": phase.status === "pending",
                })}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Label */}
              <p
                className={cn("text-sm font-medium text-center", {
                  "text-foreground": phase.status === "current" || phase.status === "completed",
                  "text-muted-foreground": phase.status === "pending",
                })}
              >
                {phase.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
