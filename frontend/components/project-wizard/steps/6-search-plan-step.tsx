"use client"

import { useState, useEffect } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

import { 
  Sparkles, 
  Loader2, 
  Search, 
  Copy, 
  AlertCircle,
  CheckCircle2,
  Database
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { ImportReferencesButton } from "@/components/screening/import-references-button"

// Mapa de iconos para bases de datos
const DATABASE_ICONS: Record<string, string> = {
  scopus: "🔵",
  ieee: "⚡",
  acm: "💻",
  springer: "📚",
  arxiv: "📄",
  pubmed: "🏥",
  embase: "💊",
  cochrane: "🩺",
  eric: "📖",
  psycinfo: "🧠",
  webofscience: "🌐",
  google_scholar: "🔍",
  sciencedirect: "🔬",
  cinahl: "💉",
  econlit: "💰",
  jstor: "📜",
  sage: "📘",
  avery: "🏛️",
  taylor: "📗",
  wiley: "📙"
}

// Nombres de áreas (para display)
const ACADEMIC_DATABASES: Record<string, { name: string }> = {
  'ingenieria-tecnologia': { name: '🟦 Ingeniería y Tecnología' },
  'medicina-salud': { name: '🟥 Medicina y Ciencias de la Salud' },
  'ciencias-sociales': { name: '🟩 Ciencias Sociales y Humanidades' },
  'arquitectura-diseño': { name: '🟪 Arquitectura, Diseño y Urbanismo' }
}

export function SearchPlanStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>(data.searchPlan?.databases || [])
  const [queries, setQueries] = useState<any[]>(data.searchPlan?.searchQueries || [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [countingDatabases, setCountingDatabases] = useState<Set<string>>(new Set())
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [availableDatabases, setAvailableDatabases] = useState<any[]>([])
  const [loadingDatabases, setLoadingDatabases] = useState(false)
  const [detectedArea, setDetectedArea] = useState<string>("")

  // 🔍 LOG INICIAL
  console.log('📊 SearchPlanStep - Estado inicial:', {
    researchArea: data.researchArea,
    projectDescription: data.projectDescription,
    projectName: data.projectName
  })

  // Cargar bases de datos filtradas por área de investigación
  useEffect(() => {
    const fetchDatabasesByArea = async () => {
      if (!data.researchArea) {
        console.warn('⚠️ No hay researchArea definido. Data completo:', JSON.stringify(data, null, 2))
        toast({
          title: "⚠️ Falta seleccionar área",
          description: "Por favor, volvé al Paso 1 y seleccioná un área de investigación del dropdown",
          variant: "destructive",
          duration: 5000
        })
        setLoadingDatabases(false)
        return
      }

      console.log('🔍 Cargando bases de datos para área:', data.researchArea)
      setLoadingDatabases(true)
      
      try {
        console.log('📡 Enviando petición a backend:', {
          researchArea: data.researchArea,
          description: data.projectDescription?.substring(0, 50)
        })
        
        const result = await apiClient.request('/api/ai/detect-research-area', {
          method: 'POST',
          body: JSON.stringify({
            researchArea: data.researchArea,
            description: data.projectDescription
          })
        })
        
        console.log('✅ Respuesta del backend:', result)
        
        if (result.success && result.data) {
          setDetectedArea(result.data.detectedArea)
          setAvailableDatabases(result.data.databases.map((db: any) => ({
            id: db.id,
            name: db.name,
            url: db.url,
            icon: DATABASE_ICONS[db.id] || "📚",
            hasAPI: ['scopus', 'ieee', 'pubmed', 'springer'].includes(db.id)
          })))
          
          console.log('📊 Área detectada:', result.data.detectedArea)
          console.log('📚 Bases de datos disponibles:', result.data.databases.length)
        }
      } catch (error) {
        console.error('⚠️ Error llamando al backend, usando bases de datos locales:', error)
        
        // FALLBACK: Usar bases de datos predefinidas localmente
        const localDatabases = getLocalDatabasesByArea(data.researchArea)
        setDetectedArea(data.researchArea)
        setAvailableDatabases(localDatabases)
        
        console.log('✅ Usando bases de datos locales:', localDatabases.length)
        
        toast({
          title: "📚 Bases de datos cargadas",
          description: `Se cargaron ${localDatabases.length} bases de datos para ${ACADEMIC_DATABASES[data.researchArea]?.name || data.researchArea}`,
          duration: 3000
        })
      } finally {
        setLoadingDatabases(false)
      }
    }

    fetchDatabasesByArea()
  }, [data.researchArea])
  
  // Función fallback para obtener bases de datos localmente
  const getLocalDatabasesByArea = (area: string) => {
    const databasesByArea: Record<string, any[]> = {
      'ingenieria-tecnologia': [
        { id: 'scopus', name: 'Scopus', url: 'https://www.scopus.com', hasAPI: true },
        { id: 'ieee', name: 'IEEE Xplore', url: 'https://ieeexplore.ieee.org', hasAPI: true },
        { id: 'acm', name: 'ACM Digital Library', url: 'https://dl.acm.org', hasAPI: false },
        { id: 'springer', name: 'Springer Link', url: 'https://link.springer.com', hasAPI: true },
        { id: 'sciencedirect', name: 'ScienceDirect', url: 'https://www.sciencedirect.com', hasAPI: false },
        { id: 'webofscience', name: 'Web of Science', url: 'https://www.webofscience.com', hasAPI: false }
      ],
      'medicina-salud': [
        { id: 'pubmed', name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', hasAPI: true },
        { id: 'scopus', name: 'Scopus', url: 'https://www.scopus.com', hasAPI: true },
        { id: 'embase', name: 'Embase', url: 'https://www.embase.com', hasAPI: false },
        { id: 'cochrane', name: 'Cochrane Library', url: 'https://www.cochranelibrary.com', hasAPI: false },
        { id: 'cinahl', name: 'CINAHL', url: 'https://www.ebsco.com/products/research-databases/cinahl-database', hasAPI: false },
        { id: 'webofscience', name: 'Web of Science', url: 'https://www.webofscience.com', hasAPI: false }
      ],
      'ciencias-sociales': [
        { id: 'scopus', name: 'Scopus', url: 'https://www.scopus.com', hasAPI: true },
        { id: 'webofscience', name: 'Web of Science', url: 'https://www.webofscience.com', hasAPI: false },
        { id: 'eric', name: 'ERIC', url: 'https://eric.ed.gov', hasAPI: false },
        { id: 'psycinfo', name: 'PsycINFO', url: 'https://www.apa.org/pubs/databases/psycinfo', hasAPI: false },
        { id: 'jstor', name: 'JSTOR', url: 'https://www.jstor.org', hasAPI: false },
        { id: 'sage', name: 'SAGE Journals', url: 'https://journals.sagepub.com', hasAPI: false }
      ],
      'arquitectura-diseño': [
        { id: 'scopus', name: 'Scopus', url: 'https://www.scopus.com', hasAPI: true },
        { id: 'avery', name: 'Avery Index', url: 'https://www.averyindex.com', hasAPI: false },
        { id: 'jstor', name: 'JSTOR', url: 'https://www.jstor.org', hasAPI: false },
        { id: 'taylor', name: 'Taylor & Francis', url: 'https://www.tandfonline.com', hasAPI: false },
        { id: 'springer', name: 'Springer Link', url: 'https://link.springer.com', hasAPI: true },
        { id: 'webofscience', name: 'Web of Science', url: 'https://www.webofscience.com', hasAPI: false }
      ]
    }
    
    const databases = databasesByArea[area] || databasesByArea['ingenieria-tecnologia']
    
    return databases.map(db => ({
      ...db,
      icon: DATABASE_ICONS[db.id] || "📚"
    }))
  }

  // Crear proyecto temporal al llegar a este paso (si no existe)
  useEffect(() => {
    const createTemporaryProject = async () => {
      // Si ya existe projectId, no crear otro
      if (data.projectId || isCreatingProject) return
      
      // Validar que tengamos datos mínimos para crear el proyecto
      if (!data.selectedTitle || !data.projectDescription) return

      setIsCreatingProject(true)
      try {
        const projectData = {
          title: data.selectedTitle,
          description: data.projectDescription,
          protocol: {
            proposedTitle: data.selectedTitle,
            population: data.pico.population,
            intervention: data.pico.intervention,
            comparison: data.pico.comparison || '',
            outcomes: data.pico.outcome,
            isMatrix: data.matrixIsNot.is,
            isNotMatrix: data.matrixIsNot.isNot,
            inclusionCriteria: data.inclusionCriteria,
            exclusionCriteria: data.exclusionCriteria,
            databases: selectedDatabases,
            searchString: '',
            temporalRange: '',
            keyTerms: {
              technology: data.protocolDefinition?.technologies || [],
              domain: data.protocolDefinition?.applicationDomain || [],
              studyType: data.protocolDefinition?.studyType || [],
              themes: data.protocolDefinition?.thematicFocus || []
            }
          }
        }

        const result = await apiClient.createProject(projectData)
        
        if (result.success && result.data?.project?.id) {
          updateData({ projectId: result.data.project.id })
          
          toast({
            title: "✅ Proyecto guardado",
            description: "Ahora puedes importar referencias desde las bases de datos"
          })
        }
      } catch (error: any) {
        console.error('Error creando proyecto temporal:', error)
        // No mostrar error al usuario, es silencioso
      } finally {
        setIsCreatingProject(false)
      }
    }

    createTemporaryProject()
  }, []) // Solo ejecutar al montar el componente

  // Sincronizar con context
  useEffect(() => {
    if (queries.length > 0) {
      updateData({
        searchPlan: {
          ...data.searchPlan,
          databases: selectedDatabases,
          searchQueries: queries
        }
      })
    }
  }, [queries, selectedDatabases])

  const toggleDatabase = (dbId: string) => {
    setSelectedDatabases(prev =>
      prev.includes(dbId) ? prev.filter(id => id !== dbId) : [...prev, dbId]
    )
  }

  const handleGenerateQueries = async () => {
    if (selectedDatabases.length === 0) {
      toast({
        title: "⚠️ Selecciona bases de datos",
        description: "Debes seleccionar al menos una base de datos",
        variant: "destructive"
      })
      return
    }

    if (!data.protocolTerms?.tecnologia?.length && !data.protocolTerms?.dominio?.length) {
      toast({
        title: "⚠️ Faltan términos del protocolo",
        description: "Debes completar el Paso 4 (Definición) primero",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      toast({
        title: "🔄 Generando cadenas de búsqueda...",
        description: `Para ${selectedDatabases.length} bases de datos`
      })

      console.log('📡 Llamando a generateSearchQueries...')
      console.log('📊 Datos enviados:')
      console.log('   - Bases de datos:', selectedDatabases)
      console.log('   - Términos del protocolo:', data.protocolTerms)
      console.log('   - PICO:', data.pico)
      console.log('   - Área de investigación:', data.researchArea)
      console.log('   - Matriz Is/Not:', data.matrixIsNot)
      
      const result = await apiClient.generateSearchQueries(
        data.protocolTerms,
        data.pico,
        selectedDatabases,
        data.researchArea,
        data.matrixIsNot
      )

      console.log('📥 Respuesta de generateSearchQueries:', result)
      console.log('📝 Queries recibidas:', result?.queries)
      
      // Log de cada query individual
      if (result?.queries) {
        result.queries.forEach((q: any, i: number) => {
          console.log(`\n   Query ${i + 1} (${q.database}):`)
          console.log(`   - Texto: ${q.query}`)
          console.log(`   - Longitud: ${q.query?.length} caracteres`)
          console.log(`   - Explicación: ${q.explanation}`)
        })
      }

      if (result?.queries && Array.isArray(result.queries)) {
        // Transformar la respuesta del backend
        const formattedQueries = result.queries.map((q: any) => {
          const dbId = q.database.toLowerCase().replace(/\s+/g, '_')
          const formatted = {
            databaseId: dbId,
            databaseName: q.database,
            query: q.query,
            explanation: q.explanation || '',
            terms: q.terms || [],
            filters: q.filters || [],
            estimatedResults: null,
            status: null,
            resultCount: null,
            hasAPI: availableDatabases.find(db => db.id === dbId)?.hasAPI || false
          }
          console.log('📝 Query formateada:', formatted)
          return formatted
        })
        
        console.log('💾 Guardando queries:', formattedQueries)
        setQueries(formattedQueries)
        
        // También actualizar el wizard context
        updateData({
          searchPlan: {
            ...data.searchPlan,
            searchQueries: formattedQueries
          }
        })
        
        toast({
          title: "✅ Cadenas generadas exitosamente",
          description: `${formattedQueries.length} consultas listas para usar`
        })
      } else {
        console.error('❌ Formato de respuesta inválido:', result)
        toast({
          title: "❌ Error de formato",
          description: "La respuesta del servidor no tiene el formato esperado",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error("Error generando queries:", error)
      toast({
        title: "❌ Error",
        description: error.message || "No se pudieron generar las cadenas",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCountResults = async (query: any) => {
    console.log('🔢 Iniciando conteo para:', query)
    console.log('   Database ID:', query.databaseId)
    console.log('   Query completa:', query.query)

    setCountingDatabases(prev => new Set(prev).add(query.databaseId))
    
    try {
      toast({
        title: "🔍 Contando resultados...",
        description: `Consultando ${query.databaseName}`
      })

      let result
      if (query.databaseId === 'scopus') {
        result = await apiClient.scopusCount(query.query)
      } else if (query.databaseId === 'google_scholar') {
        result = await apiClient.googleScholarCount(query.query, 2019, new Date().getFullYear())
      } else {
        toast({
          title: "ℹ️ No disponible",
          description: `${query.databaseName} no tiene API implementada`,
          variant: "default"
        })
        setCountingDatabases(prev => {
          const next = new Set(prev)
          next.delete(query.databaseId)
          return next
        })
        return
      }
      
      console.log('📥 Respuesta de API:', result)
      console.log('📊 result.count:', result.count, 'tipo:', typeof result.count)

      if (result.success && result.count !== undefined && result.count !== null) {
        const countValue = Number(result.count) || 0
        
        // Actualizar el query con el conteo
        setQueries(prev => {
          const updated = prev.map(q => 
            q.databaseId === query.databaseId
              ? { 
                  ...q, 
                  resultCount: countValue, 
                  lastSearched: result.searchedAt || new Date().toISOString(),
                  status: 'completed' 
                }
              : q
          )
          console.log('🔄 Queries actualizadas:', updated)
          return updated
        })

        toast({
          title: "✅ Resultados obtenidos",
          description: `${countValue.toLocaleString()} artículos encontrados en ${query.databaseName}`
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error("Error contando:", error)
      
      setQueries(prev => prev.map(q => 
        q.databaseId === query.databaseId
          ? { ...q, status: 'error' }
          : q
      ))

      toast({
        title: "❌ Error en la búsqueda",
        description: error.message || "No se pudo conectar con la base de datos",
        variant: "destructive"
      })
    } finally {
      setCountingDatabases(prev => {
        const next = new Set(prev)
        next.delete(query.databaseId)
        return next
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "📋 Copiado",
      description: "Cadena de búsqueda copiada al portapapeles"
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">Estrategia de Búsqueda</h2>
        <p className="text-lg text-muted-foreground">
          Define las bases de datos académicas y las cadenas de búsqueda para tu revisión
        </p>
      </div>

      {/* SELECCIÓN DE BASES DE DATOS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Seleccionar Bases de Datos
          </CardTitle>
          <CardDescription>
            {detectedArea && (
              <Badge variant="outline" className="mr-2">
                Área: {detectedArea.replace('-', ' ')}
              </Badge>
            )}
            Bases de datos recomendadas para tu área de investigación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDatabases ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Cargando bases de datos...</span>
            </div>
          ) : availableDatabases.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No se encontraron bases de datos. Por favor, verifica que hayas seleccionado un área de investigación en el paso 1.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableDatabases.map((db) => (
              <div 
                key={db.id} 
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                  selectedDatabases.includes(db.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleDatabase(db.id)}
                onKeyDown={(e) => e.key === 'Enter' && toggleDatabase(db.id)}
                role="button"
                tabIndex={0}
              >
                <Checkbox
                  id={db.id}
                  checked={selectedDatabases.includes(db.id)}
                  onCheckedChange={() => toggleDatabase(db.id)}
                />
                <label
                  htmlFor={db.id}
                  className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                >
                  <span>{db.icon}</span>
                  <span>{db.name}</span>
                </label>
              </div>
            ))}
            </div>
          )}

          {selectedDatabases.length > 0 && (
            <div className="mt-6">
              <Button
                onClick={handleGenerateQueries}
                disabled={isGenerating}
                size="lg"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generando cadenas...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generar Cadenas de Búsqueda ({selectedDatabases.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TABLA DE CADENAS DE BÚSQUEDA */}
      {queries.length > 0 && (
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="h-6 w-6 text-primary" />
              </div>
              Cadenas de Búsqueda por Base de Datos
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2">
              {detectedArea && (
                <Badge variant="outline" className="bg-primary/5 border-primary/20">
                  📊 Área: {ACADEMIC_DATABASES[detectedArea]?.name || detectedArea}
                </Badge>
              )}
              <span className="text-sm">Queries optimizadas para cada base de datos académica</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Base de Datos</TableHead>
                  <TableHead>Cadena de Búsqueda</TableHead>
                  <TableHead className="w-[140px] text-center"># Artículos</TableHead>
                  <TableHead className="w-[120px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries.map((query) => (
                  <TableRow key={query.databaseId} className="hover:bg-muted/50">
                    <TableCell className="align-top">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {availableDatabases.find(db => db.id === query.databaseId)?.icon || DATABASE_ICONS[query.databaseId] || "📚"}
                        </span>
                        <div>
                          <div className="font-semibold">{query.databaseName}</div>
                          {query.hasAPI ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs mt-1">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              API
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs mt-1">Manual</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(query.query)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            <span className="text-xs">Copiar</span>
                          </Button>
                        </div>
                        <Textarea
                          value={query.query}
                          readOnly
                          rows={4}
                          className="text-xs font-mono resize-none bg-muted/50 border-muted-foreground/20"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-center">
                      {query.hasAPI && (query.databaseId === 'scopus' || query.databaseId === 'google_scholar') ? (
                        countingDatabases.has(query.databaseId) ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                            <span className="text-xs text-muted-foreground">Contando...</span>
                          </div>
                        ) : query.resultCount !== null && query.resultCount !== undefined && typeof query.resultCount === 'number' ? (
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {query.resultCount.toLocaleString()}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs mt-1"
                              onClick={() => handleCountResults(query)}
                            >
                              <Search className="h-3 w-3 mr-1" />
                              Actualizar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCountResults(query)}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Contar
                          </Button>
                        )
                      ) : (
                        <div className="text-sm text-muted-foreground italic">Manual</div>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-center">
                      {data.projectId ? (
                        <ImportReferencesButton
                          projectId={data.projectId}
                          databaseName={query.databaseName}
                          variant="default"
                          size="sm"
                          showLabel={false}
                          onImportComplete={(count) => {
                            toast({
                              title: "✅ Referencias importadas",
                              description: `${count} referencias de ${query.databaseName} agregadas`
                            })
                          }}
                        />
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled
                        >
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cargar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
