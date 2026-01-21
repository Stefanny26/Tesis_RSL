import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileCheck, AlertTriangle, CheckCircle2 } from "lucide-react"

interface PrismaProgressProps {
  completedItems: number
  totalItems: number
}

export function PrismaProgress({ completedItems, totalItems }: PrismaProgressProps) {
  const percentage = (completedItems / totalItems) * 100
  const pendingItems = totalItems - completedItems

  return (
    <Card className="border-t-4 border-t-blue-600">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Lista de Verificación PRISMA 2020</CardTitle>
            <CardDescription className="mt-1">Estado de cumplimiento de la guía de reporte</CardDescription>
          </div>
          <FileCheck className="h-8 w-8 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barra de progreso principal */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso General</span>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {completedItems}<span className="text-xl text-gray-500">/{totalItems}</span>
            </span>
          </div>
          <Progress value={percentage} className="h-2.5" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{percentage.toFixed(1)}% completado</span>
            <span>{pendingItems} ítems pendientes</span>
          </div>
        </div>

        {/* Estadísticas en grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Completados</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{completedItems}</p>
          </div>
          <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">Pendientes</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pendingItems}</p>
          </div>
        </div>

        {/* Mensajes de estado */}
        {percentage < 100 && (
          <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-r">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 dark:text-amber-200">
              <p className="font-medium mb-1">Cumplimiento incompleto</p>
              <p className="text-xs leading-relaxed">
                Se requiere completar los {pendingItems} ítems restantes para cumplir con los estándares PRISMA 2020
                y asegurar la transparencia metodológica de la revisión sistemática.
              </p>
            </div>
          </div>
        )}

        {percentage === 100 && (
          <div className="flex gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-600 rounded-r">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-900 dark:text-emerald-200">
              <p className="font-medium mb-1">Lista de verificación completa</p>
              <p className="text-xs leading-relaxed">
                Se han completado todos los ítems requeridos por PRISMA 2020.
                El documento cumple con los estándares de reporte para revisiones sistemáticas.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
