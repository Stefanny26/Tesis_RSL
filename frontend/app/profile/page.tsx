"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Zap, Brain, Cpu, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface ApiUsageStats {
  summary: {
    chatgpt: ApiProviderStats
    gemini: ApiProviderStats
    embeddings: ApiProviderStats
  }
}

interface ApiProviderStats {
  provider: string
  model: string
  dailyRequestLimit: number
  dailyTokenLimit: number
  status: string
  usage: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    totalTokens: number
    recentRequests24h: number
  }
  remaining: {
    dailyRequests: number
    dailyTokens: number
    percentUsed: number
  }
  lastUsed?: string
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<ApiUsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await apiClient.getApiUsageStats()
        setStats(response)
      } catch (error: any) {
        console.error('Error cargando estadísticas:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas de uso",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadStats()
    }
  }, [user, toast])

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (percentUsed: number) => {
    if (percentUsed >= 90) return <Badge variant="destructive">Crítico</Badge>
    if (percentUsed >= 70) return <Badge variant="outline" className="border-orange-500 text-orange-500">Advertencia</Badge>
    if (percentUsed >= 50) return <Badge variant="secondary">Moderado</Badge>
    return <Badge variant="default" className="bg-green-600">Óptimo</Badge>
  }

  const getProgressColor = (percentUsed: number) => {
    if (percentUsed >= 90) return "bg-red-500"
    if (percentUsed >= 70) return "bg-orange-500"
    if (percentUsed >= 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Información de tu cuenta y uso de APIs de Inteligencia Artificial
          </p>
        </div>

        {/* User Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre Completo</p>
                <p className="font-medium">{user.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Correo Electrónico</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <p className="font-medium">Investigador</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Miembro desde</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Usage Stats */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Uso de APIs de IA</h2>
          <p className="text-muted-foreground mb-6">
            Monitorea tu consumo de créditos de ChatGPT y Gemini para evitar exceder los límites gratuitos
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando estadísticas...</span>
          </div>
        ) : !stats || !stats.summary ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay estadísticas disponibles</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Las estadísticas de uso de APIs se generarán una vez que comiences a usar las funcionalidades de IA del sistema.
              </p>
            </CardContent>
          </Card>
        ) : stats ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* ChatGPT Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    <CardTitle>ChatGPT</CardTitle>
                  </div>
                  {getStatusBadge(stats.summary.chatgpt.remaining.percentUsed)}
                </div>
                <CardDescription>{stats.summary.chatgpt.model}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Requests (24h)</span>
                    <span className="font-medium">
                      {stats.summary.chatgpt.usage.recentRequests24h} / {stats.summary.chatgpt.dailyRequestLimit}
                    </span>
                  </div>
                  <Progress 
                    value={stats.summary.chatgpt.remaining.percentUsed} 
                    className="h-2"
                  />
                  <div className={`w-full h-2 rounded-full mt-[-8px] ${getProgressColor(stats.summary.chatgpt.remaining.percentUsed)}`} 
                       style={{ width: `${stats.summary.chatgpt.remaining.percentUsed}%` }} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Exitosas</p>
                    <p className="font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {stats.summary.chatgpt.usage.successfulRequests}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fallidas</p>
                    <p className="font-medium flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      {stats.summary.chatgpt.usage.failedRequests}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Requests restantes (hoy)</p>
                  <p className="text-2xl font-bold">{stats.summary.chatgpt.remaining.dailyRequests}</p>
                </div>

                {stats.summary.chatgpt.usage.failedRequests > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium text-red-600">Cuota agotada</p>
                      <p className="text-red-600/80">API sin créditos disponibles</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gemini Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <CardTitle>Gemini</CardTitle>
                  </div>
                  {getStatusBadge(stats.summary.gemini.remaining.percentUsed)}
                </div>
                <CardDescription>{stats.summary.gemini.model}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Requests (24h)</span>
                    <span className="font-medium">
                      {stats.summary.gemini.usage.recentRequests24h} / {stats.summary.gemini.dailyRequestLimit}
                    </span>
                  </div>
                  <Progress 
                    value={stats.summary.gemini.remaining.percentUsed} 
                    className="h-2"
                  />
                  <div className={`w-full h-2 rounded-full mt-[-8px] ${getProgressColor(stats.summary.gemini.remaining.percentUsed)}`} 
                       style={{ width: `${stats.summary.gemini.remaining.percentUsed}%` }} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Exitosas</p>
                    <p className="font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {stats.summary.gemini.usage.successfulRequests}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fallidas</p>
                    <p className="font-medium flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      {stats.summary.gemini.usage.failedRequests}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Requests restantes (hoy)</p>
                  <p className="text-2xl font-bold">{stats.summary.gemini.remaining.dailyRequests}</p>
                </div>

                {stats.summary.gemini.usage.failedRequests > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium text-red-600">Cuota agotada</p>
                      <p className="text-red-600/80">API sin créditos disponibles</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Embeddings Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-purple-600" />
                    <CardTitle>Embeddings</CardTitle>
                  </div>
                  <Badge variant="default" className="bg-purple-600">Sin Límite</Badge>
                </div>
                <CardDescription>{stats.summary.embeddings.model}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Requests totales</span>
                    <span className="font-medium">
                      {stats.summary.embeddings.usage.totalRequests}
                    </span>
                  </div>
                  <Progress value={0} className="h-2 bg-purple-100 dark:bg-purple-950" />
                  <p className="text-xs text-muted-foreground mt-1">Procesamiento local - Sin límites</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Exitosas</p>
                    <p className="font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {stats.summary.embeddings.usage.successfulRequests}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Últimas 24h</p>
                    <p className="font-medium flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      {stats.summary.embeddings.usage.recentRequests24h}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Estado del servicio</p>
                  <p className="text-lg font-bold text-purple-600">Ilimitado ✓</p>
                </div>

                <div className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-medium text-purple-600">Modelo local</p>
                    <p className="text-purple-600/80">No consume créditos de APIs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay estadísticas disponibles</p>
          </div>
        )}

        {/* Recommendations */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones</CardTitle>
              <CardDescription>Optimiza el uso de tus APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {stats.summary.chatgpt.remaining.percentUsed >= 70 && (
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium">ChatGPT cerca del límite</p>
                      <p className="text-sm text-muted-foreground">
                        Considera usar Gemini o Embeddings para tareas de cribado y análisis
                      </p>
                    </div>
                  </li>
                )}
                {stats.summary.gemini.remaining.percentUsed >= 70 && (
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Gemini cerca del límite</p>
                      <p className="text-sm text-muted-foreground">
                        Los límites se resetean cada 24 horas. Considera usar Embeddings para cribado.
                      </p>
                    </div>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Usa Embeddings para cribado masivo</p>
                    <p className="text-sm text-muted-foreground">
                      El modelo de embeddings local no tiene límites y es ideal para analizar grandes volúmenes de referencias
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
