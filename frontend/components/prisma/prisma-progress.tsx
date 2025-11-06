import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle } from "lucide-react"

interface PrismaProgressProps {
  completedItems: number
  totalItems: number
}

export function PrismaProgress({ completedItems, totalItems }: PrismaProgressProps) {
  const percentage = (completedItems / totalItems) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Progreso PRISMA
        </CardTitle>
        <CardDescription>Cumplimiento de la lista de verificación PRISMA 2020</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ítems Completados</span>
            <span className="font-bold text-lg">
              {completedItems}/{totalItems}
            </span>
          </div>
          <Progress value={percentage} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">{percentage.toFixed(0)}% Completado</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Completados</p>
            <p className="text-2xl font-bold text-green-600">{completedItems}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{totalItems - completedItems}</p>
          </div>
        </div>

        {percentage < 100 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <p className="text-xs text-yellow-800">
              Complete todos los ítems PRISMA para asegurar la calidad y transparencia de su revisión sistemática.
            </p>
          </div>
        )}

        {percentage === 100 && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <p className="text-xs text-green-800">
              ¡Excelente! Ha completado todos los ítems de la lista de verificación PRISMA.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
