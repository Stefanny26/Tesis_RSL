"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"

interface ScreeningFiltersProps {
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  methodFilter?: string
  onMethodFilterChange?: (value: string) => void
}

export function ScreeningFilters({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  methodFilter = 'all',
  onMethodFilterChange,
}: ScreeningFiltersProps) {
  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="search">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Buscar por título, autor, abstract..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="w-48 space-y-2">
        <Label>Estado</Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="included">Incluidos</SelectItem>
            <SelectItem value="excluded">Excluidos</SelectItem>
            <SelectItem value="duplicate">Duplicados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {onMethodFilterChange && (
        <div className="w-48 space-y-2">
          <Label>Clasificación</Label>
          <Select value={methodFilter} onValueChange={onMethodFilterChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="embeddings">🤖 Solo Embeddings</SelectItem>
              <SelectItem value="chatgpt">🧠 Solo ChatGPT</SelectItem>
              <SelectItem value="hybrid">🔀 Híbrido</SelectItem>
              <SelectItem value="manual">👤 Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
