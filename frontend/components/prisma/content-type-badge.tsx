"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Bot, User, UserCog, Clock } from "lucide-react"
import type { PrismaContentType } from "@/lib/prisma-items"

interface ContentTypeBadgeProps {
  contentType: PrismaContentType
  dataSource?: string
  className?: string
}

export function ContentTypeBadge({ contentType, dataSource, className }: ContentTypeBadgeProps) {
  const badgeConfig = {
    automated: {
      label: "Automatizado",
      icon: Bot,
      variant: "default" as const,
      color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200",
      tooltip: "Contenido generado automáticamente desde datos del sistema. Declarado como 'AI-assisted' en cumplimiento metodológico PRISMA."
    },
    human: {
      label: "Manual",
      icon: User,
      variant: "default" as const,
      color: "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-200",
      tooltip: "Contenido escrito completamente por el investigador. Sin intervención automatizada."
    },
    hybrid: {
      label: "Híbrido",
      icon: UserCog,
      variant: "default" as const,
      color: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-200",
      tooltip: "Contenido generado automáticamente y posteriormente editado/validado por el investigador. Decisión final: humana."
    },
    pending: {
      label: "Pendiente",
      icon: Clock,
      variant: "outline" as const,
      color: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-900 dark:text-gray-400",
      tooltip: "Ítem pendiente de completar. Requiere contenido o validación."
    }
  }

  const config = badgeConfig[contentType]
  const Icon = config.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={config.variant}
            className={`${config.color} ${className} cursor-help transition-all hover:scale-105`}
          >
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{config.tooltip}</p>
          {dataSource && (
            <p className="text-xs text-muted-foreground mt-1">
              Fuente: {dataSource}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
