"use client"

import { useParams } from "next/navigation"
import { SimilarityDistributionAnalysis } from "@/components/screening/similarity-distribution-analysis"

export default function AnalysisPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Análisis de Distribución de Similitudes</h1>
        <p className="text-muted-foreground mt-2">
          Análisis estadístico completo para determinar el umbral óptimo de inclusión
        </p>
      </div>

      <SimilarityDistributionAnalysis 
        projectId={projectId}
        onAnalysisComplete={(threshold) => {
          console.log('Umbral recomendado:', threshold)
        }}
      />
    </div>
  )
}
