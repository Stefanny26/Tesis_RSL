import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle } from "lucide-react"

interface ArticleStatsProps {
  wordCount: number
  lastSaved: Date
  completionPercentage: number
}

export function ArticleStats({ wordCount, lastSaved, completionPercentage }: ArticleStatsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Palabras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{wordCount.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Última Modificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">{lastSaved.toLocaleString("es-ES")}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionPercentage}%</div>
        </CardContent>
      </Card>
    </div>
  )
}
