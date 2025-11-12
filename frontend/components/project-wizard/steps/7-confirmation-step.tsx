"use client"

import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, FileDown, Share2, Save, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

export function ConfirmationStep() {
  const { data, updateData } = useWizard()
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProject = async () => {
    setIsSaving(true)
    try {
      console.log('📊 Datos del wizard antes de guardar:', {
        inclusionCriteria: data.inclusionCriteria,
        exclusionCriteria: data.exclusionCriteria,
        inclusionCount: data.inclusionCriteria?.length,
        exclusionCount: data.exclusionCriteria?.length
      });
      
      // Crear proyecto con toda la información
      const projectData = {
        title: data.selectedTitle,
        description: data.projectDescription,
        // Datos estructurados del protocolo
        protocol: {
          proposedTitle: data.selectedTitle,
          // PICO Framework (campos individuales para el backend)
          population: data.pico.population,
          intervention: data.pico.intervention,
          comparison: data.pico.comparison || '',
          outcomes: data.pico.outcome,
          // Matriz Es/No Es
          isMatrix: data.matrixIsNot.is,
          isNotMatrix: data.matrixIsNot.isNot,
          // Criterios
          inclusionCriteria: data.inclusionCriteria,
          exclusionCriteria: data.exclusionCriteria,
          // Búsqueda
          databases: data.searchPlan.databases.map(db => db.name),
          searchString: data.searchPlan.databases.map(db => db.searchString).filter(s => s).join(' OR ') || '',
          temporalRange: data.searchPlan.temporalRange,
          // Términos clave
          keyTerms: {
            technology: data.protocolDefinition?.technologies || [],
            domain: data.protocolDefinition?.applicationDomain || [],
            studyType: data.protocolDefinition?.studyType || [],
            themes: data.protocolDefinition?.thematicFocus || []
          },
          // PRISMA
          prismaCompliance: data.prismaItems.map(item => ({
            number: item.number,
            item: item.description,
            complies: item.complies ? 'si' : 'no',
            evidence: item.evidence || ''
          }))
        }
      }

      const result = await apiClient.createProject(projectData)

      if (result.success && result.data?.project?.id) {
        toast({
          title: "✅ Proyecto creado exitosamente",
          description: "Redirigiendo al resumen del proyecto..."
        })

        // Guardar timestamp
        updateData({ lastSaved: new Date() })

        // Redireccionar a la página del proyecto (resumen)
        setTimeout(() => {
          router.push(`/projects/${result.data.project.id}`)
        }, 1500)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el proyecto",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportData = () => {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        projectName: data.projectName,
        aiProvider: data.aiProvider
      },
      project: {
        title: data.selectedTitle,
        description: data.projectDescription,
        pico: data.pico,
        matrix: data.matrixIsNot
      },
      search: {
        databases: data.searchPlan.databases,
        temporalRange: data.searchPlan.temporalRange,
        criteria: {
          inclusion: data.inclusionCriteria,
          exclusion: data.exclusionCriteria
        }
      },
      screening: {
        stats: data.screeningStats,
        references: data.references
      },
      prisma: {
        items: data.prismaItems,
        compliance: Math.round((data.prismaItems.filter(i => i.complies).length / data.prismaItems.length) * 100)
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.projectName.replace(/\s+/g, '-')}-protocol.json`
    a.click()

    toast({
      title: "✅ Exportado",
      description: "Archivo JSON descargado"
    })
  }

  const prismaCompliance = Math.round(
    (data.prismaItems.filter(i => i.complies).length / data.prismaItems.length) * 100
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header con icono de check grande */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h2 className="text-4xl font-bold">¡Protocolo Completado!</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tu protocolo de revisión sistemática está listo. Revisa el resumen antes de guardar.
        </p>
      </div>

      {/* Main Summary Card */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="text-2xl">{data.selectedTitle}</CardTitle>
          <CardDescription className="text-base mt-2">{data.projectName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* PICO Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              Marco PICO
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="font-semibold text-sm text-primary uppercase tracking-wide">Población</p>
                <p className="text-sm leading-relaxed">{data.pico.population}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-sm text-primary uppercase tracking-wide">Intervención</p>
                <p className="text-sm leading-relaxed">{data.pico.intervention}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-sm text-primary uppercase tracking-wide">Comparación</p>
                <p className="text-sm leading-relaxed">{data.pico.comparison || 'No aplica'}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-sm text-primary uppercase tracking-wide">Resultado</p>
                <p className="text-sm leading-relaxed">{data.pico.outcome}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Matriz Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <div className="rounded-full bg-purple-100 p-2">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              </div>
              Matriz Es/No Es
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-sm text-green-700 mb-3">ES (Incluye):</p>
                <div className="flex flex-wrap gap-2">
                  {data.matrixIsNot.is.map((item, i) => (
                    <Badge key={i} className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm text-red-700 mb-3">NO ES (Excluye):</p>
                <div className="flex flex-wrap gap-2">
                  {data.matrixIsNot.isNot.map((item, i) => (
                    <Badge key={i} className="bg-red-50 text-red-800 hover:bg-red-100 border border-red-300">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Statistics */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Estadísticas del Protocolo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3 pt-4">
                  <CardDescription className="text-xs font-medium">Bases de Datos</CardDescription>
                  <CardTitle className="text-3xl font-bold text-blue-600">{data.searchPlan.databases.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3 pt-4">
                  <CardDescription className="text-xs font-medium">Criterios I/E</CardDescription>
                  <CardTitle className="text-3xl font-bold text-purple-600">{data.inclusionCriteria.length + data.exclusionCriteria.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3 pt-4">
                  <CardDescription className="text-xs font-medium">Definiciones</CardDescription>
                  <CardTitle className="text-3xl font-bold text-green-600">
                    {(data.protocolDefinition?.technologies.length || 0) + 
                     (data.protocolDefinition?.thematicFocus.length || 0)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3 pt-4">
                  <CardDescription className="text-xs font-medium">Cumplimiento PRISMA</CardDescription>
                  <CardTitle className="text-3xl font-bold text-orange-600">{prismaCompliance}%</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t pt-6 -mx-6 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
            <div className="flex gap-3 flex-1">
              <Button
                variant="outline"
                size="lg"
                onClick={handleExportData}
                className="flex-1"
              >
                <FileDown className="h-5 w-5 mr-2" />
                Exportar JSON
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                disabled
              >
                <Share2 className="h-5 w-5 mr-2" />
                Compartir
                <Badge variant="secondary" className="ml-2 text-xs">Próximamente</Badge>
              </Button>
            </div>
            <Button
              size="lg"
              onClick={handleSaveProject}
              disabled={isSaving}
              className="flex-1 md:flex-none md:min-w-[300px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSaving ? (
                <>
                  <Save className="h-5 w-5 mr-2 animate-pulse" />
                  Guardando protocolo...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Guardar y Crear Proyecto
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
