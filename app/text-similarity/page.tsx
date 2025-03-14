"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ExternalLink, Info } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function TextSimilarityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sourceUrl = searchParams.get("source") || ""
  const targetUrl = searchParams.get("target") || ""

  const [loading, setLoading] = useState(true)
  const [comparisonData, setComparisonData] = useState<ComparisonItem[]>([])

  // Simulate loading and generating comparison data
  useEffect(() => {
    if (!sourceUrl || !targetUrl) {
      router.push("/")
      return
    }

    const timer = setTimeout(() => {
      setComparisonData(generateMockComparisonData())
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [sourceUrl, targetUrl, router])

  const getOverallSimilarity = () => {
    if (comparisonData.length === 0) return 0
    return Math.round(comparisonData.reduce((sum, item) => sum + item.similarityScore, 0) / comparisonData.length)
  }

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
        <Button variant="outline" onClick={() => router.push("/")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Analysis
        </Button>
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

      {loading ? (
        <>
          {/* Overall Similarity Card Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-2.5 bg-muted rounded animate-pulse"></div>
                <div className="h-16 bg-muted/50 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Text Comparison Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                {/* Table Header Skeleton */}
                <div className="flex border-b p-3">
                  <div className="w-[150px] h-5 bg-muted rounded animate-pulse mr-4"></div>
                  <div className="flex-1 h-5 bg-muted rounded animate-pulse mr-4"></div>
                  <div className="flex-1 h-5 bg-muted rounded animate-pulse mr-4"></div>
                  <div className="w-[120px] h-5 bg-muted rounded animate-pulse"></div>
                </div>

                {/* Table Rows Skeleton */}
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="flex border-b p-3 items-start">
                    <div className="w-[150px] mr-4">
                      <div className="h-5 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="flex-1 mr-4">
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded animate-pulse w-full"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-5/6"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-4/6"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-3/6"></div>
                      </div>
                    </div>
                    <div className="flex-1 mr-4">
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded animate-pulse w-full"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-5/6"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-4/6"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-3/6"></div>
                      </div>
                    </div>
                    <div className="w-[120px] flex flex-col items-end">
                      <div className="h-5 w-12 bg-muted rounded animate-pulse mb-1"></div>
                      <div className="h-1.5 w-16 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Text Similarity</span>
                <Badge className={getSimilarityBadge(getOverallSimilarity())}>{getOverallSimilarity()}% Match</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={getOverallSimilarity()} className="h-2.5" />

                <p className="text-sm text-muted-foreground">
                  {getOverallSimilarity() > 80
                    ? "These products have highly similar text content. This level of similarity suggests potential copying or close imitation."
                    : getOverallSimilarity() > 60
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
        </>
      )}
    </main>
  )
}

interface ComparisonItem {
  element: string
  sourceContent: string
  targetContent: string
  similarityScore: number
}

// Mock data generator
function generateMockComparisonData(): ComparisonItem[] {
  return [
    {
      element: "Product Title",
      sourceContent: "Premium Wireless Noise-Cancelling Headphones - Black",
      targetContent: "Deluxe Wireless Headphones with Noise Cancellation - Black",
      similarityScore: 87,
    },
    {
      element: "Description",
      sourceContent:
        "Experience immersive sound with our premium wireless headphones. Featuring advanced noise-cancelling technology, these headphones block out ambient noise so you can focus on your music. With up to 30 hours of battery life, comfortable ear cushions, and intuitive touch controls, these headphones are perfect for travel, work, or relaxation.",
      targetContent:
        "Immerse yourself in sound with our deluxe wireless headphones. Equipped with noise-cancelling technology to eliminate background noise and enhance your listening experience. Enjoy up to 28 hours of playback time, soft cushioned ear pads for extended comfort, and easy-to-use touch controls. Ideal for commuting, office use, or enjoying music at home.",
      similarityScore: 92,
    },
    {
      element: "Price",
      sourceContent: "$299.99",
      targetContent: "$249.95",
      similarityScore: 45,
    },
    {
      element: "Features",
      sourceContent:
        "• Active Noise Cancellation\n• 30-hour battery life\n• Bluetooth 5.0\n• Voice assistant compatible\n• Foldable design\n• Carrying case included\n• Quick charge (5 min = 1 hour playback)",
      targetContent:
        "• Noise Cancellation Technology\n• 28-hour battery life\n• Bluetooth 5.0 connectivity\n• Voice assistant support\n• Compact folding design\n• Premium travel case\n• Fast charging capability",
      similarityScore: 78,
    },
    {
      element: "Variants",
      sourceContent: "Available in Black, Silver, Blue",
      targetContent: "Available in Black, White, Rose Gold",
      similarityScore: 33,
    },
    {
      element: "Warranty",
      sourceContent: "2-year limited warranty covering manufacturing defects",
      targetContent: "18-month warranty on all parts and labor",
      similarityScore: 65,
    },
  ]
}

