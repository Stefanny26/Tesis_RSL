"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

const COMMON_DATABASES = [
  "IEEE Xplore",
  "ACM Digital Library",
  "Scopus",
  "Web of Science",
  "Google Scholar",
  "Springer Link",
  "ScienceDirect"
]

export function SearchPlanStep() {
  const { data, updateData } = useWizard()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>(
    data.searchPlan.databases.map(db => db.name)
  )

  const handleGenerateStrategies = async () => {
    if (selectedDatabases.length === 0) {
      toast({
        title: "Selecciona bases de datos",
        description: "Debes seleccionar al menos una base de datos",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      // Verificar que tenemos términos del protocolo
      if (!data.protocolTerms || Object.keys(data.protocolTerms).length === 0) {
        toast({
          title: "Términos del protocolo requeridos",
          description: "Debes completar el Paso 3 (Definición) primero para generar los términos del protocolo",
          variant: "destructive"
        })
        return
      }

      const result = await apiClient.generateSearchStrategies(
        data.protocolTerms,
        data.pico,
        selectedDatabases.map(db => db.toLowerCase().replace(/\s+/g, '')),
        'ingenieria-tecnologia', // Área de investigación por defecto
        data.aiProvider
      )

      console.log('📥 Respuesta completa del backend:', result)
      console.log('📝 Tipo de result:', typeof result)
      console.log('📝 Tiene queries?', result?.queries)
      console.log('📝 Queries es array?', Array.isArray(result?.queries))

      if (result?.queries && Array.isArray(result.queries)) {
        console.log('🔄 Procesando queries recibidas:', result.queries)
        
        const databases = result.queries.map((query: any) => {
          const dbObj = {
            name: query.database.charAt(0).toUpperCase() + query.database.slice(1),
            searchString: query.query || "",
            explanation: query.explanation || "",
            dateRange: `${data.searchPlan.temporalRange.start} - ${data.searchPlan.temporalRange.end}`
          }
          console.log('📝 Database mapeado:', dbObj)
          return dbObj
        })

        console.log('💾 Guardando databases en context:', databases)
        console.log('📊 searchPlan actual:', data.searchPlan)

        updateData({
          searchPlan: {
            ...data.searchPlan,
            databases
          }
        })

        console.log('✅ Datos actualizados en wizard context')

        toast({
          title: "✅ Estrategias generadas",
          description: `Cadenas de búsqueda creadas para ${databases.length} bases de datos`
        })
      } else {
        console.error('❌ No se recibieron queries válidas')
        console.error('Result recibido:', result)
        toast({
          title: "Error en el formato",
          description: "La respuesta del servidor no tiene el formato esperado",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar las estrategias",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleDatabase = (database: string) => {
    setSelectedDatabases(prev =>
      prev.includes(database)
        ? prev.filter(db => db !== database)
        : [...prev, database]
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">Estrategia de Búsqueda</h2>
        <p className="text-lg text-muted-foreground">
          Define las bases de datos académicas y las cadenas de búsqueda para tu revisión
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Bases de Datos</CardTitle>
          <CardDescription>
            Elige las bases de datos académicas donde buscarás artículos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {COMMON_DATABASES.map((db) => (
              <div key={db} className="flex items-center space-x-2">
                <Checkbox
                  id={db}
                  checked={selectedDatabases.includes(db)}
                  onCheckedChange={() => toggleDatabase(db)}
                />
                <label
                  htmlFor={db}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {db}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDatabases.length > 0 && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle>Generar Cadenas de Búsqueda</CardTitle>
            <CardDescription>
              La IA creará cadenas de búsqueda específicas para cada base de datos seleccionada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateStrategies}
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generando estrategias...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generar Cadenas de Búsqueda
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Debug info */}
      {console.log('🔍 searchPlan.databases actual:', data.searchPlan?.databases)}
      {console.log('🔍 searchPlan.databases.length:', data.searchPlan?.databases?.length)}

      {data.searchPlan?.databases && data.searchPlan.databases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cadenas de Búsqueda por Base de Datos</CardTitle>
            <CardDescription>
              Edita las cadenas de búsqueda según la sintaxis de cada base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] bg-muted">Base de Datos</TableHead>
                  <TableHead className="bg-muted">Cadena de Búsqueda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.searchPlan.databases.map((db, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-semibold align-top">{db.name}</TableCell>
                    <TableCell>
                      <Textarea
                        value={db.searchString}
                        onChange={(e) => {
                          const newDatabases = [...data.searchPlan.databases]
                          newDatabases[index].searchString = e.target.value
                          updateData({
                            searchPlan: { ...data.searchPlan, databases: newDatabases }
                          })
                        }}
                        rows={3}
                        className="font-mono text-xs"
                      />
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
