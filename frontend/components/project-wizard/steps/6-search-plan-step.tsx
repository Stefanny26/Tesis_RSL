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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { 
  Sparkles, 
  Loader2, 
  Search, 
  Copy, 
  AlertCircle,
  CheckCircle2,
  Database,
  Upload,
  Save,
  Edit,
  Check,
  X
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

// URLs de búsqueda avanzada por base de datos
const DATABASE_ADVANCED_SEARCH_URLS: Record<string, string> = {
  // Ingeniería y Tecnología
  ieee: "https://ieeexplore.ieee.org/search/advanced",
  acm: "https://dl.acm.org/search/advanced",
  scopus: "https://www.scopus.com/search/form.uri?display=advanced",
  sciencedirect: "https://www.sciencedirect.com/search/advanced",
  springer: "https://link.springer.com/advanced-search",
  wiley: "https://onlinelibrary.wiley.com/advanced/search",
  webofscience: "https://www.webofscience.com/wos/woscc/advanced-search",
  
  // Medicina y Ciencias de la Salud
  pubmed: "https://pubmed.ncbi.nlm.nih.gov/advanced/",
  cinahl: "https://www.ebsco.com/products/research-databases/cinahl-database",
  cochrane: "https://www.cochranelibrary.com/advanced-search",
  embase: "https://www.embase.com/search/advanced",
  lilacs: "https://lilacs.bvsalud.org/en/",
  psycinfo: "https://www.apa.org/pubs/databases/psycinfo",
  
  // Ciencias Sociales y Humanidades
  eric: "https://eric.ed.gov/?advanced",
  jstor: "https://www.jstor.org/action/doAdvancedSearch",
  sage: "https://journals.sagepub.com/action/doSearch",
  taylor: "https://www.tandfonline.com/action/advancedSearch",
  econlit: "https://www.aeaweb.org/econlit",
  sociological: "https://journals.sagepub.com/home/abs",
  
  // Arquitectura, Diseño y Urbanismo
  avery: "https://library.columbia.edu/libraries/avery.html",
  artbibliographies: "https://about.proquest.com/en/products-services/art_sales/",
  designandapplied: "https://about.proquest.com/en/products-services/daai/",
  
  // Generales
  google_scholar: "https://scholar.google.com/advanced_scholar_search",
  doaj: "https://doaj.org/search",
  arxiv: "https://arxiv.org/search/advanced"
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
  const [availableDatabases, setAvailableDatabases] = useState<any[]>([])
  const [loadingDatabases, setLoadingDatabases] = useState(false)
  const [detectedArea, setDetectedArea] = useState<string>("")
  const [importedCounts, setImportedCounts] = useState<Record<string, number>>({})
  const [editedQueries, setEditedQueries] = useState<Set<string>>(new Set())
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [editingQueries, setEditingQueries] = useState<Set<string>>(new Set())

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
            hasAPI: ['scopus', 'ieee', 'pubmed', 'springer'].includes(db.id),
            requiresPremium: db.requiresPremium || false,
            premiumNote: db.premiumNote || null
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
        { id: 'scopus', name: 'Scopus', url: 'https://www.scopus.com', hasAPI: false },
        { id: 'ieee', name: 'IEEE Xplore', url: 'https://ieeexplore.ieee.org', hasAPI: false },
        { id: 'acm', name: 'ACM Digital Library', url: 'https://dl.acm.org', hasAPI: false },
        { id: 'springer', name: 'Springer Link', url: 'https://link.springer.com', hasAPI: false },
        { id: 'sciencedirect', name: 'ScienceDirect', url: 'https://www.sciencedirect.com', hasAPI: false },
        { id: 'webofscience', name: 'Web of Science', url: 'https://www.webofscience.com', hasAPI: false }
      ],
      'medicina-salud': [
        { id: 'pubmed', name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', hasAPI: false },
        { id: 'scopus', name: 'Scopus', url: 'https://www.scopus.com', hasAPI: false },
        { id: 'embase', name: 'Embase', url: 'https://www.embase.com', hasAPI: false },
        { id: 'cochrane', name: 'Cochrane Library', url: 'https://www.cochranelibrary.com', hasAPI: false },
        { id: 'cinahl', name: 'CINAHL', url: 'https://www.ebsco.com/products/research-databases/cinahl-database', hasAPI: false },
        { id: 'webofscience', name: 'Web of Science', url: 'https://www.webofscience.com', hasAPI: false }
      ],
      'ciencias-sociales': [
        { id: 'scopus', name: 'Scopus', url: 'https://www.scopus.com', hasAPI: false },
        { id: 'webofscience', name: 'Web of Science', url: 'https://www.webofscience.com', hasAPI: false },
        { id: 'eric', name: 'ERIC', url: 'https://eric.ed.gov', hasAPI: false },
        { id: 'psycinfo', name: 'PsycINFO', url: 'https://www.apa.org/pubs/databases/psycinfo', hasAPI: false },
        { id: 'jstor', name: 'JSTOR', url: 'https://www.jstor.org', hasAPI: false },
        { id: 'sage', name: 'SAGE Journals', url: 'https://journals.sagepub.com', hasAPI: false }
      ],
      'arquitectura-diseño': [
        { id: 'scopus', name: 'Scopus', url: 'https://www.scopus.com', hasAPI: false },
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

  // Crear proyecto al llegar al paso 6 si aún no existe (para poder importar referencias)
  // Este proyecto se actualizará con información completa en el paso 7
  useEffect(() => {
    const createProjectForReferences = async () => {
      // Solo crear si:
      // 1. No existe projectId todavía
      // 2. Tenemos datos mínimos necesarios
      // 3. Tenemos queries generadas (usuario está listo para importar)
      
      console.log('🔍 Verificando condiciones para crear proyecto:', {
        hasProjectId: !!data.projectId,
        hasProjectName: !!data.projectName,
        hasSelectedTitle: !!data.selectedTitle,
        queriesCount: queries.length
      })

      if (data.projectId) {
        console.log('⏭️ Proyecto ya existe:', data.projectId)
        return
      }

      if (!data.projectName || !data.selectedTitle) {
        console.log('⏭️ Faltan datos del proyecto (nombre o título)')
        return
      }

      if (queries.length === 0) {
        console.log('⏭️ No hay queries generadas todavía')
        return
      }

      try {
        console.log('📝 Creando proyecto para importación de referencias...')
        
        const projectData = {
          title: data.projectName || data.selectedTitle || 'Proyecto RSL',
          description: data.projectDescription || `RSL: ${data.selectedTitle}`,
          status: 'draft' // Marcarlo como borrador
        }

        const result = await apiClient.createProject(projectData)
        
        if (result && result.data?.project?.id) {
          console.log('✅ Proyecto borrador creado:', result.data.project.id)
          updateData({ projectId: result.data.project.id })
          
          toast({
            title: "✅ Proyecto creado",
            description: "Ahora puedes importar referencias de las bases de datos"
          })
        } else {
          console.error('❌ No se recibió ID del proyecto:', result)
          toast({
            title: "⚠️ Error al crear proyecto",
            description: "No se pudo habilitar la importación de referencias",
            variant: "destructive"
          })
        }
      } catch (error: any) {
        console.error('❌ Error creando proyecto:', error)
        toast({
          title: "❌ Error al crear proyecto",
          description: error.message || "No se pudo crear el proyecto para importar referencias",
          variant: "destructive"
        })
      }
    }

    createProjectForReferences()
  }, [queries.length, data.projectId, data.projectName, data.selectedTitle])

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
      console.log('   - Título RSL seleccionado:', data.selectedTitle)
      console.log('   - 📅 Año inicio:', data.yearStart, '(tipo:', typeof data.yearStart, ')')
      console.log('   - 📅 Año fin:', data.yearEnd, '(tipo:', typeof data.yearEnd, ')')
      
      const result = await apiClient.generateSearchQueries(
        data.protocolTerms,
        data.pico,
        selectedDatabases,
        data.researchArea,
        data.matrixIsNot,
        data.yearStart,
        data.yearEnd,
        data.selectedTitle
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
          // Buscar el ID correcto desde availableDatabases comparando el nombre
          const matchedDb = availableDatabases.find(db => 
            db.name.toLowerCase() === q.database.toLowerCase() ||
            db.id.toLowerCase() === q.database.toLowerCase().replace(/\s+/g, '')
          )
          const dbId = matchedDb?.id || q.database.toLowerCase().replace(/\s+/g, '_')
          
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
            hasAPI: matchedDb?.hasAPI || false
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

  // Funcionalidad de conteo API deshabilitada - importación manual
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "📋 Copiado",
      description: "Cadena de búsqueda copiada al portapapeles"
    })
  }

  const enableEditMode = (databaseId: string) => {
    setEditingQueries(prev => new Set(prev).add(databaseId))
  }

  const cancelEditMode = (databaseId: string) => {
    setEditingQueries(prev => {
      const newSet = new Set(prev)
      newSet.delete(databaseId)
      return newSet
    })
    // Recargar el query original si no se guardó
    const originalQuery = data.searchPlan?.searchQueries?.find(q => q.databaseId === databaseId)
    if (originalQuery) {
      setQueries(prev => prev.map(q => 
        q.databaseId === databaseId ? originalQuery : q
      ))
    }
  }

  const saveEditedQuery = (databaseId: string) => {
    const currentQuery = queries.find(q => q.databaseId === databaseId)
    if (currentQuery) {
      // Marcar como editado
      setEditedQueries(prev => new Set(prev).add(databaseId))
      
      // Guardar en el context
      updateData({
        searchPlan: {
          ...data.searchPlan,
          searchQueries: queries
        }
      })
      
      toast({
        title: "✅ Cambios guardados",
        description: `Cadena de ${currentQuery.databaseName} actualizada`
      })
    }
    
    // Salir del modo edición
    setEditingQueries(prev => {
      const newSet = new Set(prev)
      newSet.delete(databaseId)
      return newSet
    })
  }

  const handleQueryEdit = (databaseId: string, newQuery: string) => {
    // Actualizar el query en el estado local (temporal hasta que se guarde)
    const updatedQueries = queries.map(q => 
      q.databaseId === databaseId ? { ...q, query: newQuery } : q
    )
    setQueries(updatedQueries)
  }

  const handleRegenerateConfirmation = () => {
    if (queries.length > 0 && editedQueries.size > 0) {
      setShowRegenerateDialog(true)
    } else {
      handleGenerateQueries()
    }
  }

  const handleConfirmedRegenerate = () => {
    setShowRegenerateDialog(false)
    setEditedQueries(new Set()) // Limpiar ediciones
    handleGenerateQueries()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-2xl font-bold">Estrategia de Búsqueda</h2>
        <p className="text-base text-muted-foreground">
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
                className={`flex flex-col space-y-2 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                  selectedDatabases.includes(db.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleDatabase(db.id)}
                onKeyDown={(e) => e.key === 'Enter' && toggleDatabase(db.id)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center space-x-3">
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
                {db.requiresPremium && (
                  <div className="ml-8 text-xs text-amber-600 flex items-center gap-1">
                    <span>🔐</span>
                    <span>{db.premiumNote}</span>
                  </div>
                )}
              </div>
            ))}
            </div>
          )}

          {selectedDatabases.length > 0 && (
            <div className="mt-6">
              <Button
                onClick={handleRegenerateConfirmation}
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
                    {queries.length > 0 ? 'Regenerar Cadenas de Búsqueda' : 'Generar Cadenas de Búsqueda'} ({selectedDatabases.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TABLA DE CADENAS DE BÚSQUEDA */}
      {queries.length > 0 && (
        <>
          {/* Alert de validación - debe cargar referencias */}
          {(!data.searchPlan?.uploadedFiles || data.searchPlan.uploadedFiles.length === 0) && (
            <Alert className="border-amber-300 dark:border-amber-700">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-foreground">
                <strong>⚠️ Acción requerida:</strong> Debes cargar las referencias desde al menos una base de datos antes de continuar al siguiente paso.
                <br /><br />
                <strong>Instrucciones:</strong>
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  <li>Haz clic en el botón <strong>"Ir al sitio oficial"</strong> de la base de datos que deseas consultar</li>
                  <li>Copia y pega la <strong>cadena de búsqueda</strong> proporcionada en el campo de búsqueda avanzada del sitio</li>
                  <li>Ejecuta la búsqueda y <strong>exporta las referencias</strong> en formato CSV, RIS o BibTeX desde el sitio oficial</li>
                  <li>Regresa aquí y usa el botón <strong>"Cargar Referencias"</strong> para importar el archivo descargado</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-3 text-xl">
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
              {data.searchPlan?.uploadedFiles && data.searchPlan.uploadedFiles.length > 0 && (
                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                  ✓ {data.searchPlan.uploadedFiles.reduce((sum, f) => sum + f.recordCount, 0)} referencias cargadas
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
                  <TableHead className="w-[140px] text-center">Búsqueda Avanzada</TableHead>
                  <TableHead className="w-[120px] text-center">Referencias</TableHead>
                  <TableHead className="w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries.map((query) => (
                  <TableRow key={query.databaseId} className="hover:bg-muted/50">
                    <TableCell className="align-top">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {availableDatabases.find(db => db.id === query.databaseId)?.icon || DATABASE_ICONS[query.databaseId] || "📚"}
                        </span>
                        <div>
                          <div className="font-semibold">{query.databaseName}</div>
                          <Badge variant="secondary" className="text-xs mt-1">Importación Manual</Badge>
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
                          
                          {!editingQueries.has(query.databaseId) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => enableEditMode(query.databaseId)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              <span className="text-xs">Editar</span>
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-green-600 hover:text-green-700"
                                onClick={() => saveEditedQuery(query.databaseId)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                <span className="text-xs">Guardar</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-red-600 hover:text-red-700"
                                onClick={() => cancelEditMode(query.databaseId)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                <span className="text-xs">Cancelar</span>
                              </Button>
                            </>
                          )}
                          
                          {editedQueries.has(query.databaseId) && !editingQueries.has(query.databaseId) && (
                            <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                              ✏️ Editada
                            </Badge>
                          )}
                        </div>
                        <Textarea
                          value={query.query}
                          onChange={(e) => handleQueryEdit(query.databaseId, e.target.value)}
                          readOnly={!editingQueries.has(query.databaseId)}
                          rows={4}
                          className={`text-xs font-mono resize-none ${
                            editingQueries.has(query.databaseId)
                              ? 'bg-background border-primary focus:border-primary ring-2 ring-primary/20'
                              : 'bg-muted/50 border-muted-foreground/20 cursor-default'
                          }`}
                          placeholder="Edita la cadena de búsqueda aquí..."
                        />
                        {editingQueries.has(query.databaseId) ? (
                          <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Modo edición: modifica el texto y haz clic en "Guardar"
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            💡 Haz clic en "Editar" para modificar esta cadena
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-center">
                      {DATABASE_ADVANCED_SEARCH_URLS[query.databaseId] ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(DATABASE_ADVANCED_SEARCH_URLS[query.databaseId], '_blank')}
                          className="w-full"
                        >
                          <Search className="h-3 w-3 mr-1" />
                          <span className="text-xs">Ir al sitio oficial</span>
                        </Button>
                      ) : (
                        <div className="text-xs text-muted-foreground italic">
                          No disponible
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-center">
                      {importedCounts[query.databaseId] ? (
                        <div>
                          <div className="text-xl font-bold text-blue-600">
                            {importedCounts[query.databaseId].toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">importadas</div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic">
                          Pendiente
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-center">
                      {data.projectId ? (
                        <ImportReferencesButton
                          projectId={data.projectId}
                          size="sm"
                          showLabel={true}
                          onImportSuccess={(count: number, fileInfo?: any) => {
                            // Actualizar contador local
                            setImportedCounts(prev => ({
                              ...prev,
                              [query.databaseId]: (prev[query.databaseId] || 0) + count
                            }))
                            
                            // Actualizar uploadedFiles en el context
                            const newUploadedFile = {
                              filename: fileInfo?.filename || `import_${query.databaseName}.csv`,
                              format: fileInfo?.format || 'csv',
                              recordCount: count,
                              uploadedAt: new Date().toISOString(),
                              databaseId: query.databaseId,
                              databaseName: query.databaseName,
                              data: []
                            }
                            
                            updateData({
                              searchPlan: {
                                ...data.searchPlan,
                                uploadedFiles: [
                                  ...(data.searchPlan?.uploadedFiles || []),
                                  newUploadedFile
                                ]
                              }
                            })
                            
                            toast({
                              title: "✅ Referencias importadas",
                              description: `${count} referencias cargadas de ${query.databaseName}`
                            })
                          }}
                        />
                      ) : queries.length > 0 ? (
                        <div className="text-center space-y-2">
                          <div className="text-xs text-muted-foreground italic mb-1">
                            Proyecto no creado
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={async () => {
                              try {
                                const projectData = {
                                  title: data.projectName || data.selectedTitle || 'Proyecto RSL',
                                  description: data.projectDescription || `RSL: ${data.selectedTitle}`,
                                  status: 'draft'
                                }
                                const result = await apiClient.createProject(projectData)
                                if (result?.data?.project?.id) {
                                  updateData({ projectId: result.data.project.id })
                                  toast({
                                    title: "✅ Proyecto creado",
                                    description: "Ahora puedes importar referencias"
                                  })
                                }
                              } catch (error: any) {
                                toast({
                                  title: "❌ Error",
                                  description: error.message,
                                  variant: "destructive"
                                })
                              }
                            }}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Crear Proyecto
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground italic mb-1">
                            Genera queries primero
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            disabled
                            className="text-xs"
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Cargar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </>
      )}

      {/* DIÁLOGO DE CONFIRMACIÓN PARA REGENERAR */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              ¿Regenerar cadenas de búsqueda?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Has editado manualmente <strong>{editedQueries.size}</strong> cadena{editedQueries.size > 1 ? 's' : ''} de búsqueda.
              </p>
              <p className="text-foreground font-medium">
                ¿Qué deseas hacer?
              </p>
              <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <div>
                    <strong>Mantener:</strong> Conservar tus ediciones actuales (recomendado si ya ajustaste las cadenas)
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">⚠️</span>
                  <div>
                    <strong>Regenerar:</strong> Crear nuevas cadenas desde cero (perderás todos los cambios manuales)
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mantener mis ediciones
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmedRegenerate}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Regenerar todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
