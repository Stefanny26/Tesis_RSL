import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle } from "lucide-react"

interface ArticleStatsProps {
  wordCount: number
  lastSaved: Date
  completionPercentage: number
}

export function ArticleStats({ wordCount, lastSaved, completionPercentage }: ArticleStatsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-2">
      <Card>
        <CardHeader className="pb-0.5 pt-1.5 px-2.5">
          <CardTitle className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Palabras
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2.5">
          <div className="text-base font-bold">{wordCount.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0.5 pt-1.5 px-2.5">
          <CardTitle className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Última Modificación
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2.5 pb-1.5">
          <div className="text-[11px] font-medium">{lastSaved.toLocaleString("es-ES")}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0.5 pt-1.5 px-2.5">
          <CardTitle className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completado
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2.5 pb-1.5">
          <div className="text-base font-bold">{completionPercentage}%</div>
        </CardContent>
      </Card>
    </div>
  )
}
