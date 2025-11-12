"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, CheckCircle2, XCircle, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ScreeningStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  const [filter, setFilter] = useState<'all' | 'pending' | 'included' | 'excluded' | 'doubt'>('all')

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Esperamos formato: array de { title, authors, year, abstract }
      const references = data.map((ref: any, index: number) => ({
        id: `ref-${index}`,
        title: ref.title || "",
        authors: ref.authors || "",
        year: ref.year || 2024,
        abstract: ref.abstract || "",
        status: 'pending' as const,
        aiScore: undefined
      }))

      updateData({
        references,
        screeningStats: {
          total: references.length,
          pending: references.length,
          included: 0,
          excluded: 0,
          doubt: 0
        }
      })

      toast({
        title: "✅ Importación exitosa",
        description: `${references.length} referencias cargadas`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo importar el archivo. Verifica el formato JSON",
        variant: "destructive"
      })
    }
  }

  const updateReferenceStatus = (id: string, status: 'included' | 'excluded' | 'doubt') => {
    const newReferences = data.references.map(ref =>
      ref.id === id ? { ...ref, status } : ref
    )

    const stats = {
      total: newReferences.length,
      pending: newReferences.filter(r => r.status === 'pending').length,
      included: newReferences.filter(r => r.status === 'included').length,
      excluded: newReferences.filter(r => r.status === 'excluded').length,
      doubt: newReferences.filter(r => r.status === 'doubt').length
    }

    updateData({ references: newReferences, screeningStats: stats })
  }

  const filteredReferences = data.references.filter(ref =>
    filter === 'all' || ref.status === filter
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">Cribado de Referencias (Screening)</h2>
        <p className="text-lg text-muted-foreground">
          Importa resultados de búsqueda y etiqueta cada referencia
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{data.screeningStats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardHeader className="pb-3">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-3xl text-yellow-700">{data.screeningStats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardDescription>Incluidos</CardDescription>
            <CardTitle className="text-3xl text-green-700">{data.screeningStats.included}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-3">
            <CardDescription>Excluidos</CardDescription>
            <CardTitle className="text-3xl text-red-700">{data.screeningStats.excluded}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardDescription>Dudosos</CardDescription>
            <CardTitle className="text-3xl text-blue-700">{data.screeningStats.doubt}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Import Section */}
      {data.references.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Importar Referencias</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sube un archivo JSON con los resultados de tu búsqueda
                </p>
              </div>
              <div>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="max-w-xs mx-auto"
                  id="file-import"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Formato esperado: [{`{ "title": "...", "authors": "...", "year": 2024, "abstract": "..." }`}]
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* References List */}
      {data.references.length > 0 && (
        <>
          <Tabs value={filter} onValueChange={(v: any) => setFilter(v)}>
            <TabsList>
              <TabsTrigger value="all">Todas ({data.screeningStats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pendientes ({data.screeningStats.pending})</TabsTrigger>
              <TabsTrigger value="included">Incluidas ({data.screeningStats.included})</TabsTrigger>
              <TabsTrigger value="excluded">Excluidas ({data.screeningStats.excluded})</TabsTrigger>
              <TabsTrigger value="doubt">Dudosas ({data.screeningStats.doubt})</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-3 mt-4">
              {filteredReferences.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No hay referencias en esta categoría
                </p>
              )}
              {filteredReferences.map((reference) => (
                <Card key={reference.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-2">
                          {reference.title}
                        </CardTitle>
                        <CardDescription>
                          {reference.authors} ({reference.year})
                        </CardDescription>
                      </div>
                      {reference.status !== 'pending' && (
                        <Badge
                          variant={
                            reference.status === 'included' ? 'default' :
                            reference.status === 'excluded' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {reference.status === 'included' ? 'Incluido' :
                           reference.status === 'excluded' ? 'Excluido' :
                           'Dudoso'}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {reference.abstract}
                    </p>
                    
                    {reference.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-700 hover:bg-green-50"
                          onClick={() => updateReferenceStatus(reference.id, 'included')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Incluir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-700 hover:bg-red-50"
                          onClick={() => updateReferenceStatus(reference.id, 'excluded')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-500 text-blue-700 hover:bg-blue-50"
                          onClick={() => updateReferenceStatus(reference.id, 'doubt')}
                        >
                          <HelpCircle className="h-4 w-4 mr-1" />
                          Dudoso
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
