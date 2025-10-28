"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { IsNotMatrixStep } from "./steps/is-not-matrix-step"
import { PicoFrameworkStep } from "./steps/pico-framework-step"
import { ResearchQuestionsStep } from "./steps/research-questions-step"
import { CriteriaStep } from "./steps/criteria-step"
import { SearchStrategyStep } from "./steps/search-strategy-step"
import { ReviewStep } from "./steps/review-step"

const steps = [
  { id: 1, title: "Matriz Es/No Es", description: "Define el alcance de tu investigación" },
  { id: 2, title: "Framework PICO", description: "Estructura tu pregunta de investigación" },
  { id: 3, title: "Preguntas de Investigación", description: "Define tus preguntas principales" },
  { id: 4, title: "Criterios de Inclusión/Exclusión", description: "Establece los criterios de selección" },
  { id: 5, title: "Estrategia de Búsqueda", description: "Define tu estrategia de búsqueda" },
  { id: 6, title: "Revisión", description: "Revisa y confirma tu protocolo" },
]

export function ProtocolWizard({ projectId }: { projectId: string }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [protocolData, setProtocolData] = useState({
    isNotMatrix: { is: [], isNot: [] },
    pico: { population: "", intervention: "", comparison: "", outcome: "" },
    researchQuestions: [""],
    inclusionCriteria: [""],
    exclusionCriteria: [""],
    searchStrategy: { databases: [], keywords: [], searchString: "" },
  })

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Save protocol and redirect to project
    console.log("[v0] Protocol completed:", protocolData)
    window.location.href = `/projects/${projectId}`
  }

  const updateProtocolData = (field: string, value: any) => {
    setProtocolData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Paso {currentStep} de {steps.length}
            </div>
          </div>
          <Progress value={progress} />
        </CardHeader>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <IsNotMatrixStep
              data={protocolData.isNotMatrix}
              onChange={(data) => updateProtocolData("isNotMatrix", data)}
            />
          )}
          {currentStep === 2 && (
            <PicoFrameworkStep data={protocolData.pico} onChange={(data) => updateProtocolData("pico", data)} />
          )}
          {currentStep === 3 && (
            <ResearchQuestionsStep
              data={protocolData.researchQuestions}
              onChange={(data) => updateProtocolData("researchQuestions", data)}
            />
          )}
          {currentStep === 4 && (
            <CriteriaStep
              inclusionCriteria={protocolData.inclusionCriteria}
              exclusionCriteria={protocolData.exclusionCriteria}
              onInclusionChange={(data) => updateProtocolData("inclusionCriteria", data)}
              onExclusionChange={(data) => updateProtocolData("exclusionCriteria", data)}
            />
          )}
          {currentStep === 5 && (
            <SearchStrategyStep
              data={protocolData.searchStrategy}
              onChange={(data) => updateProtocolData("searchStrategy", data)}
            />
          )}
          {currentStep === 6 && <ReviewStep data={protocolData} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        {currentStep < steps.length ? (
          <Button onClick={handleNext}>
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleComplete}>
            <Check className="mr-2 h-4 w-4" />
            Completar Protocolo
          </Button>
        )}
      </div>

      {/* Steps Indicator */}
      <div className="flex justify-center gap-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`h-2 w-12 rounded-full transition-colors ${
              step.id === currentStep ? "bg-primary" : step.id < currentStep ? "bg-primary/50" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
