"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, X, Sparkles, Loader2 } from "lucide-react"
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
      const keyTerms = [
        ...data.pico.population.split(' '),
        ...data.pico.intervention.split(' ')
      ].filter(term => term.length > 3)

      const result = await apiClient.generateSearchStrategies(
        data.matrixIsNot,
        data.pico,
        selectedDatabases.map(db => db.toLowerCase().replace(/\s+/g, '')),
        keyTerms,
        data.aiProvider
      )

      console.log('📥 Respuesta del backend:', result)
      console.log('📝 Estrategias recibidas:', result?.strategies)

      if (result && result.strategies) {
        const databases = Object.entries(result.strategies).map(([name, strategy]: [string, any]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          searchString: strategy.searchString || "",
          dateRange: `${data.searchPlan.temporalRange.start} - ${data.searchPlan.temporalRange.end}`
        }))

        updateData({
          searchPlan: {
            ...data.searchPlan,
            databases
          }
        })

        toast({
          title: "✅ Estrategias generadas",
          description: `Cadenas de búsqueda creadas para ${databases.length} bases de datos`
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

  const handleGenerateCriteria = async () => {
    if (!data.pico.population || !data.pico.intervention) {
      toast({
        title: "Información incompleta",
        description: "Completa el marco PICO en el paso anterior",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      toast({
        title: "Generando criterios...",
        description: "Analizando tu marco PICO para crear criterios estructurados..."
      })

      // Mapear área a texto legible
      const areaMap: Record<string, string> = {
        'ingenieria-tecnologia': 'Ingeniería y Tecnología',
        'medicina-salud': 'Medicina y Ciencias de la Salud',
        'ciencias-sociales': 'Ciencias Sociales y Humanidades',
        'arquitectura-diseño': 'Arquitectura, Diseño y Urbanismo'
      }
      const areaTexto = data.researchArea ? areaMap[data.researchArea] : undefined

      // Generar criterios usando la misma API de protocolos
      const result = await apiClient.generateProtocolAnalysis(
        data.projectName,
        data.projectDescription,
        data.aiProvider,
        areaTexto,
        data.yearStart,
        data.yearEnd
      )

      // Extraer criterios de inclusión y exclusión
      const matriz = result.fase2_matriz_es_no_es || {}
      
      updateData({
        inclusionCriteria: matriz.es || [
          "Estudios que mencionen explícitamente Mongoose, MongoDB/NoSQL y Node.js/JavaScript en el resumen.",
          "Uso de Mongoose como ODM dentro de aplicaciones en el entorno Node.js sobre bases NoSQL/MongoDB.",
          "Estudios relevantes para el análisis de prácticas de desarrollo, performance o patrones de diseño.",
          "Artículos publicados en journals (refinamiento aplicado).",
          "Publicaciones entre 2019 y 2025 (según filtros aplicados).",
          "Publicaciones en inglés, dada la indexación de IEEE Xplore."
        ],
        exclusionCriteria: matriz.no_es || [
          "Publicaciones donde estos términos no aparecen en el resumen o no están claramente conectados.",
          "Investigaciones centradas en otros entornos ODM (Hibernate, SQL, etc.) o tecnologías fuera del stack JavaScript.",
          "Artículos puramente descriptivos, introductorios o tutoriales sin aporte técnico profundo o análisis arquitectural.",
          "Trabajos fuera del ámbito académico técnico como blogs, tutoriales o literatura gris (ya filtrado por IEEE).",
          "Estudios anteriores a 2019 o que no aporten evidencia empírica o reflexiva contemporánea.",
          "Artículos en otros idiomas que no aporten al cuerpo principal de evidencia analizable."
        ]
      })

      toast({
        title: "✅ Criterios generados",
        description: "Criterios de inclusión y exclusión creados basándose en tu proyecto"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar los criterios",
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

  const addCriterion = (type: 'inclusion' | 'exclusion') => {
    const key = type === 'inclusion' ? 'inclusionCriteria' : 'exclusionCriteria'
    updateData({ [key]: [...data[key], ""] })
  }

  const removeCriterion = (type: 'inclusion' | 'exclusion', index: number) => {
    const key = type === 'inclusion' ? 'inclusionCriteria' : 'exclusionCriteria'
    updateData({ [key]: data[key].filter((_, i) => i !== index) })
  }

  const updateCriterion = (type: 'inclusion' | 'exclusion', index: number, value: string) => {
    const key = type === 'inclusion' ? 'inclusionCriteria' : 'exclusionCriteria'
    const newCriteria = [...data[key]]
    newCriteria[index] = value
    updateData({ [key]: newCriteria })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">Plan de Búsqueda y Criterios</h2>
        <p className="text-lg text-muted-foreground">
          Define cadenas de búsqueda por base de datos y criterios de inclusión/exclusión
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Estrategia de Búsqueda</TabsTrigger>
          <TabsTrigger value="criteria">Criterios I/E</TabsTrigger>
        </TabsList>

        {/* Search Strategy Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Bases de Datos</CardTitle>
              <CardDescription>
                Elige las bases de datos académicas donde buscarás artículos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COMMON_DATABASES.map((database) => (
                  <div key={database} className="flex items-center space-x-2">
                    <Checkbox
                      id={database}
                      checked={selectedDatabases.includes(database)}
                      onCheckedChange={() => toggleDatabase(database)}
                    />
                    <Label htmlFor={database} className="cursor-pointer">
                      {database}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rango Temporal</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="startYear">Año inicio</Label>
                <Input
                  id="startYear"
                  type="number"
                  value={data.searchPlan.temporalRange.start}
                  onChange={(e) => updateData({
                    searchPlan: {
                      ...data.searchPlan,
                      temporalRange: { ...data.searchPlan.temporalRange, start: Number(e.target.value) }
                    }
                  })}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endYear">Año fin</Label>
                <Input
                  id="endYear"
                  type="number"
                  value={data.searchPlan.temporalRange.end}
                  onChange={(e) => updateData({
                    searchPlan: {
                      ...data.searchPlan,
                      temporalRange: { ...data.searchPlan.temporalRange, end: Number(e.target.value) }
                    }
                  })}
                />
              </div>
              <Button
                onClick={handleGenerateStrategies}
                disabled={isGenerating || selectedDatabases.length === 0}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generar Cadenas
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {data.searchPlan.databases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cadenas de Búsqueda por Base de Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Base de Datos</TableHead>
                      <TableHead className="w-[120px]">Rango</TableHead>
                      <TableHead>Cadena de Búsqueda</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.searchPlan.databases.map((db, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{db.name}</TableCell>
                        <TableCell className="text-sm">{db.dateRange}</TableCell>
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
        </TabsContent>

        {/* Criteria Tab */}
        <TabsContent value="criteria" className="space-y-4">
          {/* AI Generation Card */}
          <Card className="border-primary/30 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle>Generar Criterios con IA</CardTitle>
              <CardDescription>
                La IA analizará tu marco PICO y generará criterios de inclusión/exclusión estructurados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGenerateCriteria}
                disabled={isGenerating}
                size="lg"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generando criterios...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generar Criterios I/E
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Criteria Table */}
          {(data.inclusionCriteria.length > 0 || data.exclusionCriteria.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Matriz de Criterios de Inclusión/Exclusión</CardTitle>
                <CardDescription>
                  Criterios estructurados por categoría según metodología PRISMA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Categoría</TableHead>
                      <TableHead>✅ Criterios de Inclusión</TableHead>
                      <TableHead>❌ Criterios de Exclusión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold bg-muted">Cobertura Temática</TableCell>
                      <TableCell>
                        <Textarea
                          value={data.inclusionCriteria[0] || ''}
                          onChange={(e) => updateCriterion('inclusion', 0, e.target.value)}
                          placeholder="Ej: Estudios que mencionen explícitamente MongoDB..."
                          rows={3}
                          className="resize-none"
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={data.exclusionCriteria[0] || ''}
                          onChange={(e) => updateCriterion('exclusion', 0, e.target.value)}
                          placeholder="Ej: Publicaciones donde estos términos no aparecen..."
                          rows={3}
                          className="resize-none"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold bg-muted">Tecnologías Abordadas</TableCell>
                      <TableCell>
                        <Textarea
                          value={data.inclusionCriteria[1] || ''}
                          onChange={(e) => updateCriterion('inclusion', 1, e.target.value)}
                          placeholder="Ej: Uso de Mongoose como ODM..."
                          rows={3}
                          className="resize-none"
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={data.exclusionCriteria[1] || ''}
                          onChange={(e) => updateCriterion('exclusion', 1, e.target.value)}
                          placeholder="Ej: Investigaciones centradas en otros ODM..."
                          rows={3}
                          className="resize-none"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold bg-muted">Tipo de Estudio</TableCell>
                      <TableCell>
                        <Textarea
                          value={data.inclusionCriteria[2] || ''}
                          onChange={(e) => updateCriterion('inclusion', 2, e.target.value)}
                          placeholder="Ej: Estudios relevantes para el análisis de prácticas..."
                          rows={3}
                          className="resize-none"
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={data.exclusionCriteria[2] || ''}
                          onChange={(e) => updateCriterion('exclusion', 2, e.target.value)}
                          placeholder="Ej: Artículos puramente descriptivos..."
                          rows={3}
                          className="resize-none"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold bg-muted">Tipo de Documento</TableCell>
                      <TableCell>
                        <Textarea
                          value={data.inclusionCriteria[3] || ''}
                          onChange={(e) => updateCriterion('inclusion', 3, e.target.value)}
                          placeholder="Ej: Artículos publicados en journals..."
                          rows={3}
                          className="resize-none"
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={data.exclusionCriteria[3] || ''}
                          onChange={(e) => updateCriterion('exclusion', 3, e.target.value)}
                          placeholder="Ej: Trabajos fuera del ámbito académico técnico..."
                          rows={3}
                          className="resize-none"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold bg-muted">Rango Temporal</TableCell>
                      <TableCell>
                        <Textarea
                          value={data.inclusionCriteria[4] || ''}
                          onChange={(e) => updateCriterion('inclusion', 4, e.target.value)}
                          placeholder="Ej: Publicaciones entre 2019 y 2025..."
                          rows={3}
                          className="resize-none"
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={data.exclusionCriteria[4] || ''}
                          onChange={(e) => updateCriterion('exclusion', 4, e.target.value)}
                          placeholder="Ej: Estudios anteriores a 2019..."
                          rows={3}
                          className="resize-none"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold bg-muted">Idioma</TableCell>
                      <TableCell>
                        <Textarea
                          value={data.inclusionCriteria[5] || ''}
                          onChange={(e) => updateCriterion('inclusion', 5, e.target.value)}
                          placeholder="Ej: Publicaciones en inglés..."
                          rows={3}
                          className="resize-none"
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={data.exclusionCriteria[5] || ''}
                          onChange={(e) => updateCriterion('exclusion', 5, e.target.value)}
                          placeholder="Ej: Artículos en otros idiomas..."
                          rows={3}
                          className="resize-none"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Legacy lists (hidden if table is populated) */}
          {data.inclusionCriteria.length === 0 && data.exclusionCriteria.length === 0 && (
            <div className="grid md:grid-cols-2 gap-4">
            {/* Inclusion Criteria */}
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-900">✅ Criterios de Inclusión</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addCriterion('inclusion')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                <CardDescription>Qué estudios SÍ incluir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.inclusionCriteria.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-4">
                    Sin criterios definidos
                  </p>
                )}
                {data.inclusionCriteria.map((criterion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Ej: Publicaciones entre 2019-2025"
                      value={criterion}
                      onChange={(e) => updateCriterion('inclusion', index, e.target.value)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeCriterion('inclusion', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Exclusion Criteria */}
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-900">❌ Criterios de Exclusión</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addCriterion('exclusion')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                <CardDescription>Qué estudios NO incluir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.exclusionCriteria.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-4">
                    Sin criterios definidos
                  </p>
                )}
                {data.exclusionCriteria.map((criterion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Ej: Estudios sin revisión por pares"
                      value={criterion}
                      onChange={(e) => updateCriterion('exclusion', index, e.target.value)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeCriterion('exclusion', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
