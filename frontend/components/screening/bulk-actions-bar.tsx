"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Trash2 } from "lucide-react"

interface BulkActionsBarProps {
  selectedCount: number
  onIncludeAll: () => void
  onExcludeAll: () => void
  onClearSelection: () => void
}

export function BulkActionsBar({ selectedCount, onIncludeAll, onExcludeAll, onClearSelection }: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-lg px-6 py-4 flex items-center gap-4">
        <span className="font-medium">{selectedCount} referencias seleccionadas</span>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onIncludeAll}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Incluir Todas
          </Button>
          <Button size="sm" variant="secondary" onClick={onExcludeAll}>
            <XCircle className="mr-2 h-4 w-4" />
            Excluir Todas
          </Button>
          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
