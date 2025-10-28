"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ReferenceTable } from "@/components/screening/reference-table"
import { AIScreeningPanel } from "@/components/screening/ai-screening-panel"
import { BulkActionsBar } from "@/components/screening/bulk-actions-bar"
import { ScreeningFilters } from "@/components/screening/screening-filters"
import { mockReferences } from "@/lib/mock-references"
import type { Reference } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileDown } from "lucide-react"

export default function ScreeningPage({ params }: { params: { id: string } }) {
  const [references, setReferences] = useState<Reference[]>(mockReferences)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const handleStatusChange = (id: string, status: Reference["status"]) => {
    setReferences((prev) => prev.map((ref) => (ref.id === id ? { ...ref, status } : ref)))
  }

  const handleBulkInclude = () => {
    setReferences((prev) =>
      prev.map((ref) => (selectedIds.includes(ref.id) ? { ...ref, status: "included" as const } : ref)),
    )
    setSelectedIds([])
  }

  const handleBulkExclude = () => {
    setReferences((prev) =>
      prev.map((ref) => (selectedIds.includes(ref.id) ? { ...ref, status: "excluded" as const } : ref)),
    )
    setSelectedIds([])
  }

  const handleRunScreening = (threshold: number) => {
    // Mock AI screening - in production, this would call the AI API
    setReferences((prev) =>
      prev.map((ref) => {
        if (ref.status === "pending" && ref.screeningScore) {
          if (ref.screeningScore >= threshold) {
            return { ...ref, status: "included" as const }
          } else if (ref.screeningScore < 0.5) {
            return { ...ref, status: "excluded" as const }
          }
        }
        return ref
      }),
    )
  }

  // Filter references
  const filteredReferences = references.filter((ref) => {
    const matchesStatus = statusFilter === "all" || ref.status === statusFilter
    const matchesSearch =
      searchQuery === "" ||
      ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.authors.some((author) => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ref.abstract.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: references.length,
    pending: references.filter((r) => r.status === "pending").length,
    included: references.filter((r) => r.status === "included").length,
    excluded: references.filter((r) => r.status === "excluded").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cribado de Referencias</h1>
              <p className="text-muted-foreground">Revisa y clasifica referencias con asistencia de IA</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Incluidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.included}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Excluidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.excluded}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Referencias</CardTitle>
                  <CardDescription>
                    {filteredReferences.length} de {references.length} referencias
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScreeningFilters
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                  />
                  <ReferenceTable
                    references={filteredReferences}
                    onStatusChange={handleStatusChange}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <AIScreeningPanel
                totalReferences={stats.total}
                pendingReferences={stats.pending}
                onRunScreening={handleRunScreening}
              />
            </div>
          </div>
        </div>
      </main>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onIncludeAll={handleBulkInclude}
        onExcludeAll={handleBulkExclude}
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  )
}
