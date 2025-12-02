"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface RankingItem {
  referenceId: string
  referenceTitle: string
  avgSimilarity: number
  rankings: Array<{
    model: string
    similarity: number
  }>
}

interface RankingViewProps {
  rankings: RankingItem[]
  threshold: number
  onAccept: (referenceId: string) => void
  onReject: (referenceId: string) => void
}

export function RankingView({ rankings, threshold, onAccept, onReject }: RankingViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getScoreColor = (similarity: number) => {
    if (similarity >= threshold) return "text-green-600"
    if (similarity >= threshold - 0.1) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (similarity: number): "default" | "secondary" | "destructive" => {
    if (similarity >= threshold) return "default"
    if (similarity >= threshold - 0.1) return "secondary"
    return "destructive"
  }

  const getRecommendationIcon = (similarity: number) => {
    if (similarity >= threshold) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (similarity >= threshold - 0.1) return <AlertCircle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const getRecommendation = (similarity: number) => {
    if (similarity >= threshold) return "Incluir"
    if (similarity >= threshold - 0.1) return "Revisar"
    return "Excluir"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Ranking de Referencias por Similitud
        </CardTitle>
        <CardDescription>
          Referencias ordenadas por similitud semántica con tu protocolo PICO
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {rankings.map((item, index) => (
              <Card key={item.referenceId} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Ranking Number */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className={`text-2xl font-bold ${
                        index < 3 ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        #{index + 1}
                      </div>
                      {index < 3 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          TOP {index + 1}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      {/* Title */}
                      <div>
                        <h4 className="font-semibold line-clamp-2 mb-2">
                          {item.referenceTitle}
                        </h4>
                      </div>

                      {/* Similarity Score */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Similitud Promedio:</span>
                            <span className={`text-lg font-bold ${getScoreColor(item.avgSimilarity)}`}>
                              {(item.avgSimilarity * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRecommendationIcon(item.avgSimilarity)}
                            <Badge variant={getScoreBadgeVariant(item.avgSimilarity)}>
                              {getRecommendation(item.avgSimilarity)}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={item.avgSimilarity * 100} className="h-2" />
                      </div>

                      {/* Model Details (Expandable) */}
                      {item.rankings.length > 1 && (
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedId(expandedId === item.referenceId ? null : item.referenceId)}
                          >
                            <BarChart3 className="h-3 w-3 mr-1" />
                            {expandedId === item.referenceId ? 'Ocultar' : 'Ver'} detalles por modelo
                          </Button>
                          
                          {expandedId === item.referenceId && (
                            <div className="mt-2 space-y-2 pl-4 border-l-2 border-muted">
                              {item.rankings.map((ranking, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground font-mono text-xs">
                                    {ranking.model.split('/').pop()}
                                  </span>
                                  <span className={`font-medium ${getScoreColor(ranking.similarity)}`}>
                                    {(ranking.similarity * 100).toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => onAccept(item.referenceId)}
                          disabled={item.avgSimilarity < threshold - 0.1}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Incluir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReject(item.referenceId)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Summary */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{rankings.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">A Incluir</div>
              <div className="text-2xl font-bold text-green-600">
                {rankings.filter(r => r.avgSimilarity >= threshold).length}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">A Revisar</div>
              <div className="text-2xl font-bold text-yellow-600">
                {rankings.filter(r => r.avgSimilarity >= threshold - 0.1 && r.avgSimilarity < threshold).length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
