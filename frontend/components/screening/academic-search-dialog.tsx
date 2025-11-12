"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Loader2, Database, CheckCircle2, BookOpen, Info, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { 
  type DatabaseType, 
  DATABASE_FORMATS, 
  adaptSearchString, 
  getDatabaseHelp 
} from "@/lib/search-string-adapter"

interface SearchResult {
  title: string
  abstract: string
  year: string
  source: string
  doi: string
  authors: string
  url: string
  citationCount: number
  database: string
  externalId: string
}

interface AcademicSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onImportComplete?: (count: number) => void
}

export function AcademicSearchDialog({ 
  open, 
  onOpenChange, 
  projectId,
  onImportComplete 
}: AcademicSearchDialogProps) {
  // Estado de búsqueda
  const [searchQuery, setSearchQuery] = useState('')
  const [originalQuery, setOriginalQuery] = useState('') 
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseType>('scopus')
  
  // Estado de resultados
  const [isSearching, setIsSearching] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set())
  const [stats, setStats] = useState({
    totalScopus: 0,
    totalIEEE: 0,
    totalCombined: 0,
    duplicatesRemoved: 0
  })
  
  const { toast } = useToast()

  // Cargar protocolo al abrir el diálogo
  useEffect(() => {
    if (open && projectId) {
      loadProtocolData()
    }
  }, [open, projectId])

  // Adaptar cadena cuando cambia la base de datos
  useEffect(() => {
    if (originalQuery) {
      const adapted = adaptSearchString(originalQuery, selectedDatabase)
      setSearchQuery(adapted)
    }
  }, [selectedDatabase, originalQuery])

  const loadProtocolData = async () => {
    try {
      const response = await apiClient.getProtocol(projectId)
      const protocol = response.protocol
      
      if (protocol?.searchStrategy?.searchString) {
        const searchString = protocol.searchStrategy.searchString
        setOriginalQuery(searchString)
        setSearchQuery(adaptSearchString(searchString, selectedDatabase))
      }
      
      // Detectar base de datos sugerida
      if (protocol?.searchStrategy?.databases) {
        const databases = protocol.searchStrategy.databases
        if (databases.some((db: string) => db.toLowerCase().includes('ieee'))) {
          setSelectedDatabase('ieee')
        }
      }
    } catch (error) {
      console.error('Error cargando protocolo:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Ingresa una cadena de búsqueda",
        variant: "destructive"
      })
      return
    }

    setIsSearching(true)
    setResults([])
    setSelectedResults(new Set())

    try {
      console.log('🔍 Enviando búsqueda:', {
        database: selectedDatabase,
        query: searchQuery,
        queryLength: searchQuery.length
      })

      const response = await apiClient.searchAcademicReferences({
        query: searchQuery,
        database: selectedDatabase as 'scopus' | 'ieee',
        maxResultsPerSource: 50
      })

      console.log('✅ Respuesta recibida:', response)

      setResults(response.combined || [])
      setStats(response.stats || {
        totalScopus: 0,
        totalIEEE: 0,
        totalCombined: 0,
        duplicatesRemoved: 0
      })

      // Seleccionar todos por defecto
      const allIndices = new Set<number>(response.combined.map((_: any, i: number) => i))
      setSelectedResults(allIndices)

      toast({
        title: "✅ Búsqueda completada",
        description: `${response.combined.length} artículos encontrados`
      })
    } catch (error: any) {
      console.error('Error en búsqueda:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo realizar la búsqueda",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleImport = async () => {
    const selectedArticles = results.filter((_: any, index: number) => selectedResults.has(index))

    if (selectedArticles.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un artículo para importar",
        variant: "destructive"
      })
      return
    }

    setIsImporting(true)

    try {
      const references = selectedArticles.map((article: SearchResult) => ({
        title: article.title,
        authors: article.authors,
        year: Number.parseInt(article.year) || new Date().getFullYear(),
        abstract: article.abstract,
        source: article.source,
        doi: article.doi,
        url: article.url,
        screeningStatus: 'pending'
      }))

      await apiClient.createReferencesBatch(projectId, references)

      toast({
        title: "✅ Importación exitosa",
        description: `${references.length} referencias importadas correctamente`
      })

      onImportComplete?.(references.length)
      onOpenChange(false)
      
      // Reset
      setResults([])
      setSelectedResults(new Set())
      setSearchQuery('')
    } catch (error: any) {
      console.error('Error importando:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo importar las referencias",
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
    }
  }

  const toggleSelection = (index: number) => {
    const newSelection = new Set(selectedResults)
    if (newSelection.has(index)) {
      newSelection.delete(index)
    } else {
      newSelection.add(index)
    }
    setSelectedResults(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedResults.size === results.length) {
      setSelectedResults(new Set())
    } else {
      setSelectedResults(new Set(results.map((_: any, i: number) => i)))
    }
  }

  const handleCopyQuery = async () => {
    try {
      await navigator.clipboard.writeText(searchQuery)
      toast({
        title: "✅ Copiado",
        description: "Cadena de búsqueda copiada al portapapeles"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Buscar en Bases de Datos Académicas
          </DialogTitle>
          <DialogDescription>
            Busca artículos en Scopus e IEEE Xplore usando una cadena de búsqueda
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Configuración de búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración de Búsqueda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selector de base de datos */}
              <div>
                <Label>Base de Datos</Label>
                <Select value={selectedDatabase} onValueChange={(value) => setSelectedDatabase(value as DatabaseType)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona una base de datos" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DATABASE_FORMATS)
                      .filter(([key]) => key === 'scopus' || key === 'ieee') // Solo mostrar las que tienen API
                      .map(([key, format]) => (
                        <SelectItem key={key} value={key}>
                          {format.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ayuda de estructura */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <div className="font-semibold mb-1">{DATABASE_FORMATS[selectedDatabase].label}</div>
                  <div className="text-muted-foreground whitespace-pre-line">
                    {getDatabaseHelp(selectedDatabase)}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Cadena de búsqueda */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Cadena de Búsqueda</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyQuery}
                    className="h-7 text-xs"
                    disabled={!searchQuery.trim()}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copiar
                  </Button>
                </div>
                <Textarea
                  placeholder={DATABASE_FORMATS[selectedDatabase].example}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  rows={4}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {DATABASE_FORMATS[selectedDatabase].description}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  💡 Puedes copiar esta cadena y probarla directamente en {DATABASE_FORMATS[selectedDatabase].label}
                </p>
              </div>

              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="w-full"
                size="lg"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Artículos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          {results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">Scopus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalScopus}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">IEEE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.totalIEEE}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.totalCombined}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">Duplicados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.duplicatesRemoved}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Resultados */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Resultados ({results.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                    {selectedResults.size === results.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {results.map((result) => (
                      <Card key={result.externalId || result.doi || result.title} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="pt-4">
                          <div className="flex gap-3">
                            <Checkbox 
                              checked={selectedResults.has(results.indexOf(result))}
                              onCheckedChange={() => toggleSelection(results.indexOf(result))}
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-sm leading-tight">{result.title}</h4>
                                <Badge 
                                  variant={result.database === 'scopus' ? 'default' : 'secondary'}
                                  className="shrink-0"
                                >
                                  {result.database.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Autores:</span> {result.authors}
                              </p>
                              
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {result.abstract}
                              </p>
                              
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {result.year}
                                </span>
                                <span>•</span>
                                <span className="truncate">{result.source}</span>
                                {result.doi && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">DOI: {result.doi}</span>
                                  </>
                                )}
                                {result.citationCount > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{result.citationCount} citas</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Estado vacío */}
          {!isSearching && results.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Sin resultados</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Selecciona una base de datos y realiza una búsqueda para encontrar artículos académicos.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer con botón de importar */}
        {results.length > 0 && (
          <div className="border-t pt-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {selectedResults.size} de {results.length} artículos seleccionados
            </p>
            <Button 
              onClick={handleImport}
              disabled={isImporting || selectedResults.size === 0}
              size="lg"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Importar {selectedResults.size} Referencias Seleccionadas
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
