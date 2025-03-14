/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ExternalLink, Info } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ComparisonItem {
  element: string
  sourceContent: string
  targetContent: string
  similarityScore: number
}

interface ComparisonResponse {
  success: boolean
  sourceUrl: string
  targetUrl: string
  overallSimilarityScore: number
  comparison: ComparisonItem[]
  sourceProduct: any
  targetProduct: any
  error?: string
}

interface TextSimilarityProps {
  data: ComparisonResponse
}

export function TextSimilarityPage({ data }: TextSimilarityProps) {
  // const router = useRouter()
  const { sourceUrl, targetUrl, comparison: comparisonData, overallSimilarityScore: overallScore } = data

  const getSimilarityColor = (score: number) => {
    if (score > 80) return "text-red-500"
    if (score > 60) return "text-amber-500"
    return "text-green-500"
  }

  const getSimilarityBadge = (score: number) => {
    if (score > 80) return "bg-red-100 text-red-800 hover:bg-red-100"
    if (score > 60) return "bg-amber-100 text-amber-800 hover:bg-amber-100"
    return "bg-green-100 text-green-800 hover:bg-green-100"
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">        
        <h1 className="text-2xl font-bold">Text Similarity Analysis</h1>
        <div className="w-[100px]"></div> {/* Spacer for alignment */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Source Product</span>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => window.open(sourceUrl, "_blank")}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground truncate">{sourceUrl}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Target Product</span>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => window.open(targetUrl, "_blank")}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground truncate">{targetUrl}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Text Similarity</span>
            <Badge className={getSimilarityBadge(overallScore)}>{overallScore}% Match</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallScore} className="h-2.5" />

            <p className="text-sm text-muted-foreground">
              {overallScore > 80
                ? "These products have highly similar text content. This level of similarity suggests potential copying or close imitation."
                : overallScore > 60
                  ? "These products show moderate text similarity. Some elements appear to be similar, but there are also notable differences."
                  : "These products show low text similarity. The text content appears to be distinct with minimal overlap."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Text Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Element</TableHead>
                <TableHead>Source Content</TableHead>
                <TableHead>Target Content</TableHead>
                <TableHead className="text-right w-[120px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-end gap-1 cursor-help">
                          Similarity
                          <Info className="h-3.5 w-3.5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Similarity score is calculated using AI embeddings to measure semantic similarity between
                          texts. Higher scores indicate greater similarity.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((item) => (
                <TableRow key={item.element}>
                  <TableCell className="font-medium">{item.element}</TableCell>
                  <TableCell>
                    <div className="max-h-[150px] overflow-y-auto pr-2 text-sm">{item.sourceContent}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-h-[150px] overflow-y-auto pr-2 text-sm">{item.targetContent}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn("font-bold", getSimilarityColor(item.similarityScore))}>
                        {item.similarityScore}%
                      </span>
                      <Progress value={item.similarityScore} className="h-1.5 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
