"use client"

import { useWizard } from "../wizard-context"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { useEffect } from "react"

export function ConfirmationStep() {
  const { data } = useWizard()

  useEffect(() => {
    console.log('✅ Paso de confirmación - Protocolo completado')
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header con icono de check grande */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle2 className="h-24 w-24 text-green-600" />
          </div>
        </div>
        <h2 className="text-4xl font-bold">¡Protocolo Completado!</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tu protocolo de revisión sistemática ha sido verificado y está listo.
        </p>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Regresa al paso anterior (PRISMA y Confirmación) si necesitas realizar algún ajuste, o guarda el proyecto para comenzar con la búsqueda de artículos.
        </p>
      </div>

      {/* Resumen Simple */}
      <Card className="border-2 border-green-200 bg-green-50/30">
        <CardContent className="pt-8 pb-8 text-center">
          <p className="text-lg font-medium text-green-800 mb-2">
            Protocolo: <strong>{data.selectedTitle}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Todos los pasos han sido completados exitosamente.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Usa los botones de navegación para revisar cualquier sección o guardar tu proyecto en el paso anterior.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
