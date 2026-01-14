"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Reference } from "@/lib/types"
import { Download, Search, Filter, FileText, Eye, Info, XCircle, CheckCircle } from "lucide-react"
import { ReferenceDetailDialog } from "./reference-detail-dialog"

interface ExclusionReasonsTableProps {
  references: Reference[]
  onExport?: () => void
}

export function ExclusionReasonsTable({ references, onExport }: ExclusionReasonsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [stageFilter, setStageFilter] = useState("all")
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedReasonRef, setSelectedReasonRef] = useState<Reference | null>(null)

  // Filtrar solo referencias excluidas
  const excludedReferences = references.filter(r => r.status === 'excluded')

  // Parsear razonamiento de IA
  const parseAIReasoning = (reasoning: string) => {
    const sections = {
      embeddings: '',
      chatgpt: '',
      cumple: [] as string[],
      noCumple: [] as string[]
    }

    if (reasoning.includes('🤖 Embeddings')) {
      const embeddingsMatch = reasoning.match(/🤖 Embeddings[^🧠]*/)?.[0]
      sections.embeddings = embeddingsMatch || ''
    }

    if (reasoning.includes('🧠 CHATGPT')) {
      const chatgptMatch = reasoning.match(/🧠 CHATGPT.*?(?=✅|$)/s)?.[0]
      sections.chatgpt = chatgptMatch || ''
    }

    if (reasoning.includes('✅ Cumple:')) {
      const cumpleMatch = reasoning.match(/✅ Cumple:(.*?)(?=❌|$)/s)?.[1]
      if (cumpleMatch && cumpleMatch.trim()) {
        sections.cumple = cumpleMatch.split(',').map(s => s.trim()).filter(s => s)
      }
    }

    if (reasoning.includes('❌ No cumple:')) {
      const noCumpleMatch = reasoning.match(/❌ No cumple:(.*?)$/s)?.[1]
      if (noCumpleMatch && noCumpleMatch.trim()) {
        sections.noCumple = noCumpleMatch.split(',').map(s => s.trim()).filter(s => s)
      }
    }

    return sections
  }

  // Determinar la etapa de exclusión basándose en los campos de IA
  const getExclusionStage = (ref: Reference) => {
    // Fase 3: Texto completo (se identifica por screeningStatus)
    if (ref.screeningStatus?.includes('fulltext')) {
      return 'Fase 3: Texto Completo (Manual)'
    }
    
    // Fase 1 y 2: Basarse en aiReasoning
    if (ref.aiClassification === 'exclude' && ref.aiReasoning) {
      if (ref.aiReasoning.includes('🤖 Embeddings') && !ref.aiReasoning.includes('🧠 CHATGPT')) {
        return 'Fase 1: Embeddings (Automático)'
      } else if (ref.aiReasoning.includes('🧠 CHATGPT')) {
        return 'Fase 2: ChatGPT (Automático)'
      }
    }
    return 'Fase 2: Revisión Manual'
  }

  const openReasoningDialog = (ref: Reference) => {
    setSelectedReasonRef(ref)
    setDetailDialogOpen(true)
  }

  // Aplicar filtros
  const filteredReferences = excludedReferences.filter(ref => {
    const matchesSearch = searchQuery === "" ||
      ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ref.exclusionReason || '').toLowerCase().includes(searchQuery.toLowerCase())

    const stage = getExclusionStage(ref)
    const matchesStage = stageFilter === "all" ||
      (stageFilter === "fase1" && stage.includes("Fase 1")) ||
      (stageFilter === "fase2" && stage.includes("Fase 2")) ||
      (stageFilter === "fase3" && stage.includes("Fase 3"))

    return matchesSearch && matchesStage
  })

  // Función para exportar a CSV
  const handleExportCSV = () => {
    const headers = ['DOI', 'Título', 'Autores', 'Año', 'Fuente', 'Etapa de Exclusión', 'Motivo', 'Razonamiento IA', 'Score IA']
    const rows = filteredReferences.map(ref => [
      ref.doi || 'N/A',
      `"${ref.title.replace(/"/g, '""')}"`,
      `"${ref.authors.join('; ').replace(/"/g, '""')}"`,
      ref.year || 'N/A',
      ref.source || 'N/A',
      getExclusionStage(ref),
      `"${(ref.exclusionReason || 'Sin motivo especificado').replace(/"/g, '""')}"`,
      `"${(ref.aiReasoning || 'N/A').replace(/"/g, '""')}"`,
      ref.screeningScore ? `${Math.round(ref.screeningScore * 100)}%` : 'N/A'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `referencias-excluidas-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Estadísticas por etapa
  const stats = {
    fase1Embeddings: excludedReferences.filter(r => {
      const stage = getExclusionStage(r)
      return stage.includes('Embeddings')
    }).length,
    fase2ChatGPT: excludedReferences.filter(r => {
      const stage = getExclusionStage(r)
      return stage.includes('ChatGPT')
    }).length,
    fase2Manual: excludedReferences.filter(r => {
      const stage = getExclusionStage(r)
      return stage.includes('Revisión Manual')
    }).length,
    fase3FullText: excludedReferences.filter(r => {
      const stage = getExclusionStage(r)
      return stage.includes('Texto Completo')
    }).length,
    total: excludedReferences.length
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Tabla de Motivos de Exclusión
              </CardTitle>
              <CardDescription>
                Registro detallado de las {excludedReferences.length} referencias excluidas durante el proceso de cribado
              </CardDescription>
            </div>
            <Button onClick={handleExportCSV} variant="ghost" size="sm" className="text-gray-600">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Excluidas - Card Principal */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-red-700">Total Excluidas</p>
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-5xl font-bold text-red-900 mb-1">{stats.total}</p>
                <p className="text-xs text-red-600">
                  {((stats.total / references.length) * 100).toFixed(1)}% del total de referencias
                </p>
              </div>
            </div>

            {/* Distribución por Fases */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Distribución por Fase</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.fase1Embeddings > 0 && (
                    <div className="text-center">
                      <div className="bg-purple-100 rounded-lg p-4 mb-2">
                        <p className="text-xl font-bold text-purple-900">{stats.fase1Embeddings}</p>
                      </div>
                      <p className="text-xs font-medium text-purple-700">Fase 1: Embeddings</p>
                      <p className="text-xs text-gray-500">Automático</p>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-lg p-4 mb-2">
                      <p className="text-xl font-bold text-blue-900">{stats.fase2ChatGPT}</p>
                    </div>
                    <p className="text-xs font-medium text-blue-700">Fase 2: ChatGPT</p>
                    <p className="text-xs text-gray-500">Automático</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-100 rounded-lg p-4 mb-2">
                      <p className="text-xl font-bold text-orange-900">{stats.fase2Manual}</p>
                    </div>
                    <p className="text-xs font-medium text-orange-700">Fase 2: Manual</p>
                    <p className="text-xs text-gray-500">Revisión usuario</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 rounded-lg p-4 mb-2">
                      <p className="text-xl font-bold text-green-900">{stats.fase3FullText}</p>
                    </div>
                    <p className="text-xs font-medium text-green-700">Fase 3: Completo</p>
                    <p className="text-xs text-gray-500">Evaluación manual</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Progreso Visual */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Progreso de Exclusión por Fase</h4>
              <span className="text-xs text-gray-500">{stats.total} de {references.length} referencias</span>
            </div>
            <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden flex">
              {stats.fase1Embeddings > 0 && (
                <div 
                  className="bg-purple-500 flex items-center justify-center text-xs font-semibold text-white"
                  style={{ width: `${(stats.fase1Embeddings / stats.total) * 100}%` }}
                  title={`Fase 1: ${stats.fase1Embeddings}`}
                >
                  {stats.fase1Embeddings > 0 && `${stats.fase1Embeddings}`}
                </div>
              )}
              <div 
                className="bg-blue-500 flex items-center justify-center text-xs font-semibold text-white"
                style={{ width: `${(stats.fase2ChatGPT / stats.total) * 100}%` }}
                title={`Fase 2 ChatGPT: ${stats.fase2ChatGPT}`}
              >
                {stats.fase2ChatGPT > 0 && `${stats.fase2ChatGPT}`}
              </div>
              <div 
                className="bg-orange-500 flex items-center justify-center text-xs font-semibold text-white"
                style={{ width: `${(stats.fase2Manual / stats.total) * 100}%` }}
                title={`Fase 2 Manual: ${stats.fase2Manual}`}
              >
                {stats.fase2Manual > 0 && `${stats.fase2Manual}`}
              </div>
              {stats.fase3FullText > 0 && (
                <div 
                  className="bg-green-500 flex items-center justify-center text-xs font-semibold text-white"
                  style={{ width: `${(stats.fase3FullText / stats.total) * 100}%` }}
                  title={`Fase 3: ${stats.fase3FullText}`}
                >
                  {stats.fase3FullText}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
              <span>🤖 Automático: {stats.fase1Embeddings + stats.fase2ChatGPT}</span>
              <span>👤 Manual: {stats.fase2Manual + stats.fase3FullText}</span>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, autor o motivo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etapas</SelectItem>
                {stats.fase1Embeddings > 0 && <SelectItem value="fase1">Fase 1: Embeddings ({stats.fase1Embeddings})</SelectItem>}
                <SelectItem value="fase2">Fase 2: ChatGPT + Manual ({stats.fase2ChatGPT + stats.fase2Manual})</SelectItem>
                {stats.fase3FullText > 0 && <SelectItem value="fase3">Fase 3: Texto Completo ({stats.fase3FullText})</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {/* Resumen Rápido */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">Resumen de Exclusiones</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 font-medium">Tasa de Exclusión</p>
                    <p className="text-2xl font-bold text-blue-900">{((stats.total / references.length) * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Automáticas</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.fase1Embeddings + stats.fase2ChatGPT}</p>
                    <p className="text-xs text-blue-600">{(((stats.fase1Embeddings + stats.fase2ChatGPT) / stats.total) * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Manuales</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.fase2Manual + stats.fase3FullText}</p>
                    <p className="text-xs text-blue-600">{(((stats.fase2Manual + stats.fase3FullText) / stats.total) * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Incluidas</p>
                    <p className="text-2xl font-bold text-green-900">{references.length - stats.total}</p>
                    <p className="text-xs text-green-600">{(((references.length - stats.total) / references.length) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Motivos de Exclusión */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>🏷️</span>
              Principales Motivos de Exclusión
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                // Analizar motivos más comunes
                const reasonCounts: Record<string, number> = {}
                excludedReferences.forEach(ref => {
                  let reason = 'Sin especificar'
                  if (ref.exclusionReason) {
                    reason = ref.exclusionReason
                  } else if (ref.aiReasoning) {
                    // Extraer razón principal del razonamiento de IA
                    if (ref.aiReasoning.includes('no menciona explícitamente')) {
                      reason = 'No menciona tecnologías clave (Raspberry Pi, .NET, Python)'
                    } else if (ref.aiReasoning.includes('no se relaciona')) {
                      reason = 'No relacionado con el contexto educativo'
                    } else if (ref.aiReasoning.includes('Baja similitud')) {
                      reason = 'Baja similitud semántica'
                    } else {
                      reason = 'Otros criterios de exclusión'
                    }
                  }
                  reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
                })
                
                const topReasons = Object.entries(reasonCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                
                return topReasons.map(([reason, count]) => (
                  <div key={reason} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-700 flex-1">{reason}</p>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-gray-900">{count}</p>
                        <p className="text-xs text-gray-500">{((count / stats.total) * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>

          {/* Grid de Cards */}
          {filteredReferences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReferences.map((ref) => {
                const stage = getExclusionStage(ref)
                const isAutomatic = stage.includes('Automático')
                const hasAIReasoning = !!ref.aiReasoning
                
                return (
                  <Card 
                    key={ref.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => hasAIReasoning ? openReasoningDialog(ref) : setSelectedReference(ref)}
                  >
                    <CardContent className="p-5">
                      {/* Header con badges */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={isAutomatic ? "secondary" : "outline"} className="text-xs">
                            {isAutomatic ? '🤖 Automático' : '👤 Manual'}
                          </Badge>
                          {ref.screeningScore && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                ref.screeningScore >= 0.3 ? 'bg-green-50 text-green-700 border-green-300' :
                                ref.screeningScore >= 0.2 ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                                'bg-red-50 text-red-700 border-red-300'
                              }`}
                            >
                              {Math.round(ref.screeningScore * 100)}%
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs text-gray-600">
                            {ref.year || 'N/A'}
                          </Badge>
                        </div>
                        {hasAIReasoning && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              openReasoningDialog(ref)
                            }}
                          >
                            <Info className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                      </div>

                      {/* Título */}
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
                        {ref.title}
                      </h4>

                      {/* Autores */}
                      <p className="text-sm text-gray-600 mb-3">
                        {ref.authors.length > 0 
                          ? ref.authors.slice(0, 3).join(', ') + (ref.authors.length > 3 ? ' et al.' : '')
                          : 'Autores no especificados'}
                      </p>

                      {/* Etapa y DOI */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b">
                        <span className="font-medium">{stage.split('(')[0].trim()}</span>
                        {ref.doi && (
                          <span className="truncate max-w-[200px]" title={ref.doi}>
                            DOI: {ref.doi}
                          </span>
                        )}
                      </div>

                      {/* Motivo resumen */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        {ref.exclusionReason ? (
                          <p className="text-sm text-gray-700 line-clamp-2">
                            <span className="font-medium text-red-600">Motivo:</span> {ref.exclusionReason}
                          </p>
                        ) : hasAIReasoning ? (
                          <p className="text-sm text-blue-600 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            <span>Haz clic para ver análisis completo de IA</span>
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Sin motivo especificado</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron referencias excluidas</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {excludedReferences.length === 0 
                  ? 'Aún no se han excluido referencias. Completa la Fase 1: Clasificación IA y la Fase 2: Revisión Manual para ver las referencias excluidas aquí.'
                  : 'No hay referencias excluidas que coincidan con tu búsqueda.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedReference && (
        <ReferenceDetailDialog
          reference={selectedReference}
          open={!!selectedReference}
          onOpenChange={(open) => !open && setSelectedReference(null)}
        />
      )}

      {/* Diálogo de Razonamiento Detallado */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Detalle de Exclusión
            </DialogTitle>
            <DialogDescription>
              Análisis completo del motivo de exclusión de esta referencia
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedReasonRef && (
              <div className="space-y-6">
                {/* Información de la referencia */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{selectedReasonRef.title}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Autores:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedReasonRef.authors.slice(0, 3).join(', ')}
                        {selectedReasonRef.authors.length > 3 && ' et al.'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Año:</span>
                      <span className="ml-2 text-gray-900">{selectedReasonRef.year}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fase:</span>
                      <span className="ml-2">
                        <Badge variant="outline">{getExclusionStage(selectedReasonRef)}</Badge>
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Score:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedReasonRef.screeningScore 
                          ? `${Math.round(selectedReasonRef.screeningScore * 100)}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Análisis de IA */}
                {selectedReasonRef.aiReasoning && (() => {
                  const parsed = parseAIReasoning(selectedReasonRef.aiReasoning)
                  return (
                    <>
                      {/* Embeddings */}
                      {parsed.embeddings && (
                        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                          <h5 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                            🤖 Análisis por Embeddings
                          </h5>
                          <p className="text-sm text-purple-800 whitespace-pre-line">
                            {parsed.embeddings.replace('🤖 Embeddings', '').trim()}
                          </p>
                        </div>
                      )}

                      {/* ChatGPT */}
                      {parsed.chatgpt && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            🧠 Análisis por ChatGPT
                          </h5>
                          <p className="text-sm text-blue-800 whitespace-pre-line">
                            {parsed.chatgpt.replace('🧠 CHATGPT', '').trim()}
                          </p>
                        </div>
                      )}

                      {/* Criterios que cumple */}
                      {parsed.cumple.length > 0 && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                          <h5 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Criterios que Cumple
                          </h5>
                          <ul className="space-y-2">
                            {parsed.cumple.map((criterio, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>{criterio}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Criterios que NO cumple */}
                      {parsed.noCumple.length > 0 && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                          <h5 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            Criterios que NO Cumple (Motivo de Exclusión)
                          </h5>
                          <ul className="space-y-2">
                            {parsed.noCumple.map((criterio, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                                <span className="text-red-600 mt-0.5">✗</span>
                                <span>{criterio}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )
                })()}

                {/* Motivo manual si existe */}
                {selectedReasonRef.exclusionReason && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                    <h5 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      👤 Motivo Manual
                    </h5>
                    <p className="text-sm text-orange-800">
                      {selectedReasonRef.exclusionReason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
