"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Check, Circle } from "lucide-react"

interface SectionSummaryProps {
  sections: {
    name: string
    total: number
    completed: number
  }[]
}

export function SectionSummary({ sections }: SectionSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {sections.map((section) => {
        const percentage = section.total > 0 ? (section.completed / section.total) * 100 : 0
        const isComplete = section.completed === section.total
        
        return (
          <Card 
            key={section.name} 
            className={`border-2 transition-all ${
              isComplete 
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                : 'border-gray-200 hover:border-blue-400'
            }`}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {section.name}
                </span>
                {isComplete ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {section.completed}
                  </span>
                  <span className="text-sm text-gray-500">/ {section.total}</span>
                </div>
                
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      isComplete ? 'bg-emerald-600' : 'bg-blue-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <p className="text-xs text-gray-500">{percentage.toFixed(0)}%</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
