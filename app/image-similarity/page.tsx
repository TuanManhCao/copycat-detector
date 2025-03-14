"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ExternalLink, Info, Maximize2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function ImageSimilarityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sourceUrl = searchParams.get("source") || ""
  const targetUrl = searchParams.get("target") || ""

  const [loading, setLoading] = useState(true)
  const [comparisonData, setComparisonData] = useState<ImageComparisonItem[]>([])

  // Simulate loading and generating comparison data
  useEffect(() => {
    if (!sourceUrl || !targetUrl) {
      router.push("/")
      return
    }

    const timer = setTimeout(() => {
      setComparisonData(generateMockImageComparisonData())
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
        <h1 className="text-2xl font-bold">Image Similarity Analysis</h1>
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

          {/* Detailed Image Comparison Skeleton */}
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
                  <div key={item} className="flex border-b p-3 items-center">
                    <div className="w-[150px] mr-4">
                      <div className="h-5 bg-muted rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-3/4 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="flex-1 mr-4">
                      <div className="h-[120px] bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="flex-1 mr-4">
                      <div className="h-[120px] bg-muted rounded animate-pulse"></div>
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
                <span>Overall Image Similarity</span>
                <Badge className={getSimilarityBadge(getOverallSimilarity())}>{getOverallSimilarity()}% Match</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={getOverallSimilarity()} className="h-2.5" />

                <p className="text-sm text-muted-foreground">
                  {getOverallSimilarity() > 80
                    ? "These products have highly similar visual elements. This level of visual similarity suggests potential copying or close imitation of design."
                    : getOverallSimilarity() > 60
                      ? "These products show moderate visual similarity. Some design elements appear to be similar, but there are also notable differences."
                      : "These products show low visual similarity. The design and visual elements appear to be distinct with minimal resemblance."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Image Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Element</TableHead>
                    <TableHead>Source Image</TableHead>
                    <TableHead>Target Image</TableHead>
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
                              Image similarity is calculated using computer vision algorithms that analyze shapes,
                              colors, and patterns. Higher scores indicate greater visual similarity.
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
                      <TableCell className="font-medium">
                        <div className="flex flex-col gap-1">
                          <span>{item.element}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative group">
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="relative cursor-pointer group">
                                <img
                                  src={item.sourceImage || "/placeholder.svg"}
                                  alt={`Source ${item.element}`}
                                  className="w-full h-auto max-h-[120px] object-contain border rounded-md"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <Maximize2 className="h-5 w-5 text-white drop-shadow-md" />
                                </div>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Source: {item.element}</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center">
                                <img
                                  src={item.sourceImage || "/placeholder.svg"}
                                  alt={`Source ${item.element}`}
                                  className="max-h-[70vh] max-w-full object-contain"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative group">
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="relative cursor-pointer group">
                                <img
                                  src={item.targetImage || "/placeholder.svg"}
                                  alt={`Target ${item.element}`}
                                  className="w-full h-auto max-h-[120px] object-contain border rounded-md"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <Maximize2 className="h-5 w-5 text-white drop-shadow-md" />
                                </div>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Target: {item.element}</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center">
                                <img
                                  src={item.targetImage || "/placeholder.svg"}
                                  alt={`Target ${item.element}`}
                                  className="max-h-[70vh] max-w-full object-contain"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
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

interface ImageComparisonItem {
  element: string
  description: string
  sourceImage: string
  targetImage: string
  similarityScore: number
}

// Mock data generator
function generateMockImageComparisonData(): ImageComparisonItem[] {
  return [
    {
      element: "Main Product Image",
      description: "Primary product photo",
      sourceImage: "/placeholder.svg?height=300&width=300",
      targetImage: "/placeholder.svg?height=300&width=300",
      similarityScore: 82,
    },
    {
      element: "Product Angle Views",
      description: "Side and perspective views",
      sourceImage: "/placeholder.svg?height=300&width=400",
      targetImage: "/placeholder.svg?height=300&width=400",
      similarityScore: 68,
    },
    {
      element: "Color Variants",
      description: "Available color options",
      sourceImage: "/placeholder.svg?height=200&width=400",
      targetImage: "/placeholder.svg?height=200&width=400",
      similarityScore: 45,
    },
    {
      element: "Product Logo",
      description: "Brand logo placement",
      sourceImage: "/placeholder.svg?height=150&width=300",
      targetImage: "/placeholder.svg?height=150&width=300",
      similarityScore: 91,
    },
    {
      element: "Product UI/Controls",
      description: "Buttons, switches, interfaces",
      sourceImage: "/placeholder.svg?height=250&width=250",
      targetImage: "/placeholder.svg?height=250&width=250",
      similarityScore: 76,
    },
    {
      element: "Packaging Design",
      description: "Box/container design",
      sourceImage: "/placeholder.svg?height=300&width=300",
      targetImage: "/placeholder.svg?height=300&width=300",
      similarityScore: 58,
    },
  ]
}

