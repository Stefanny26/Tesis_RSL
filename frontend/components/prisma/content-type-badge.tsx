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
      color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
      tooltip: "Contenido generado automáticamente desde datos del protocolo y referencias"
    },
    human: {
      label: "Manual",
      icon: User,
      variant: "default" as const,
      color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
      tooltip: "Contenido escrito manualmente por el investigador"
    },
    hybrid: {
      label: "Híbrido",
      icon: UserCog,
      variant: "default" as const,
      color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
      tooltip: "Contenido generado automáticamente y editado por el investigador"
    },
    pending: {
      label: "Pendiente",
      icon: Clock,
      variant: "outline" as const,
      color: "bg-gray-50 text-gray-600 border-gray-300 dark:bg-gray-900 dark:text-gray-400",
      tooltip: "Ítem pendiente de completar"
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
            className={`${config.color} ${className} cursor-help transition-all hover:scale-105 text-[10px] px-1.5 py-0`}
          >
            <Icon className="h-2.5 w-2.5 mr-0.5" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-[11px]">{config.tooltip}</p>
          {dataSource && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Fuente: {dataSource}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
