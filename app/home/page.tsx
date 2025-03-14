/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
// import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Search, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { TextSimilarityPage } from "@/app/text-similarity/similarity-page"

import "../scanner.css"
import { ComparisonItem } from "@/lib/types"

type ComparisonResponse = {
  success: boolean
  error?: string
  comparison: any
  overallSimilarityScore: number
}

export default function Home() {
  const [sourceUrl, setSourceUrl] = useState("")
  const [targetUrl, setTargetUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const [comparisonData, setComparisonData] = useState<ComparisonItem[] | null>(null)
  const [overallScore, setOverallScore] = useState<number>(0)

  const sourceCanvasRef = useRef<HTMLCanvasElement>(null)
  const targetCanvasRef = useRef<HTMLCanvasElement>(null)

  // Matrix rain effect
  useEffect(() => {
    if (!showScanner) return

    const setupMatrixRain = (canvasRef: React.RefObject<HTMLCanvasElement>, color: string) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      const fontSize = 10
      const columns = Math.floor(canvas.width / fontSize)

      // Characters to display (numbers, letters, symbols)
      const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"

      // Array to track the y position of each column
      const drops: number[] = []
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100
      }

      const draw = () => {
        if (!showScanner) return

        // Semi-transparent black to create fade effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = color
        ctx.font = `${fontSize}px monospace`

        for (let i = 0; i < drops.length; i++) {
          // Random character
          const text = chars[Math.floor(Math.random() * chars.length)]

          // x = i * fontSize, y = drops[i] * fontSize
          ctx.fillText(text, i * fontSize, drops[i] * fontSize)

          // Send the drop back to the top randomly after it crosses the screen
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0
          }

          // Increment y coordinate
          drops[i]++
        }

        requestAnimationFrame(draw)
      }

      draw()
    }

    if (sourceCanvasRef.current) {
      setupMatrixRain({ current: sourceCanvasRef.current }, "#0099ff")
    }
    
    if (targetCanvasRef.current) {
      setupMatrixRain({ current: targetCanvasRef.current }, "#9900ff") 
    }

    // Cleanup
    return () => {
      // Animation will stop when showScanner is false
    }
  }, [showScanner])

  // Control scanner visibility
  useEffect(() => {
    if (isAnalyzing) {
      setShowScanner(true)
    } else {
      if (showScanner) {
        const timer = setTimeout(() => {
          setShowScanner(false)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [isAnalyzing, showScanner])

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const analyzeSimilarity = async () => {
    // Validate URLs
    if (!isValidUrl(sourceUrl) || !isValidUrl(targetUrl)) {
      setError("Please enter valid URLs for both source and target products.")
      return
    }

    setError("")
    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/compare-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceUrl,
          targetUrl,
        }),
      })

      const data: ComparisonResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to compare products")
      }

      setComparisonData(data.comparison)
      setOverallScore(data.overallSimilarityScore)
      setShowResults(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsAnalyzing(false)
    }
  }

 

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Product Similarity Analyzer</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Source Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter source product URL"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>

              {sourceUrl && isValidUrl(sourceUrl) && (
                <div className="border rounded-md overflow-hidden h-[300px] relative">
                  <iframe
                    src={sourceUrl}
                    className="w-full h-full"
                    title="Source Product"
                    onError={() => document.getElementById("source-error")?.classList.remove("hidden")}
                  />
                  <div
                    id="source-error"
                    className="hidden absolute inset-0 flex flex-col items-center justify-center p-4 bg-muted/50"
                  >
                    <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-center font-medium">This website cannot be displayed in an iframe</p>
                    <p className="text-center text-sm text-muted-foreground mt-1">
                      Many websites block embedding due to security restrictions
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => window.open(sourceUrl, "_blank")}
                    >
                      Open in New Tab
                    </Button>
                  </div>
                  {showScanner && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Matrix digital rain canvas */}
                      <canvas ref={sourceCanvasRef} className="absolute inset-0 w-full h-full opacity-70"></canvas>

                      {/* Scanning line */}
                      <div className="absolute left-0 w-full h-[2px] animate-[scanner_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-blue-400 to-transparent z-10"></div>

                      {/* Corner brackets for targeting effect */}
                      <div className="absolute top-0 left-0 w-[20px] h-[20px] border-t-2 border-l-2 border-blue-400"></div>
                      <div className="absolute top-0 right-0 w-[20px] h-[20px] border-t-2 border-r-2 border-blue-400"></div>
                      <div className="absolute bottom-0 left-0 w-[20px] h-[20px] border-b-2 border-l-2 border-blue-400"></div>
                      <div className="absolute bottom-0 right-0 w-[20px] h-[20px] border-b-2 border-r-2 border-blue-400"></div>

                      {/* Text overlay */}
                      <div className="absolute bottom-2 left-2 text-xs text-blue-400 font-mono z-20">SCANNING...</div>

                      {/* Status text */}
                      <div className="absolute top-2 right-2 text-xs text-blue-400 font-mono z-20 text-right">
                        <div>ANALYZING DATA</div>
                        <div>PATTERN MATCHING: ACTIVE</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter target product URL"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>

              {targetUrl && isValidUrl(targetUrl) && (
                <div className="border rounded-md overflow-hidden h-[300px] relative">
                  <iframe
                    src={targetUrl}
                    className="w-full h-full"
                    title="Target Product"
                    onError={() => document.getElementById("target-error")?.classList.remove("hidden")}
                  />
                  <div
                    id="target-error"
                    className="hidden absolute inset-0 flex flex-col items-center justify-center p-4 bg-muted/50"
                  >
                    <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-center font-medium">This website cannot be displayed in an iframe</p>
                    <p className="text-center font-medium">This website cannot be displayed in an iframe</p>
                    <p className="text-center text-sm text-muted-foreground mt-1">
                      Many websites block embedding due to security restrictions
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => window.open(targetUrl, "_blank")}
                    >
                      Open in New Tab
                    </Button>
                  </div>
                  {showScanner && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Matrix digital rain canvas */}
                      <canvas ref={targetCanvasRef} className="absolute inset-0 w-full h-full opacity-70"></canvas>

                      {/* Scanning line */}
                      <div className="absolute left-0 w-full h-[2px] animate-[scanner_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-purple-400 to-transparent z-10"></div>

                      {/* Corner brackets for targeting effect */}
                      <div className="absolute top-0 left-0 w-[20px] h-[20px] border-t-2 border-l-2 border-purple-400"></div>
                      <div className="absolute top-0 right-0 w-[20px] h-[20px] border-t-2 border-r-2 border-purple-400"></div>
                      <div className="absolute bottom-0 left-0 w-[20px] h-[20px] border-b-2 border-l-2 border-purple-400"></div>
                      <div className="absolute bottom-0 right-0 w-[20px] h-[20px] border-b-2 border-r-2 border-purple-400"></div>

                      {/* Text overlay */}
                      <div className="absolute bottom-2 left-2 text-xs text-purple-400 font-mono z-20">SCANNING...</div>

                      {/* Status text */}
                      <div className="absolute top-2 right-2 text-xs text-purple-400 font-mono z-20 text-right">
                        <div>ANALYZING DATA</div>
                        <div>PATTERN MATCHING: ACTIVE</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center mb-8">
        <Button size="lg" onClick={analyzeSimilarity} disabled={isAnalyzing || !sourceUrl || !targetUrl}>
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Similarity...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Check Similarity
            </>
          )}
        </Button>
      </div>

      {isAnalyzing && (
        <Card className="mb-8 overflow-hidden">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-center">Analyzing Products</h3>
              <div className="relative">
                <Progress value={Math.random() * 100} className="h-2" />
                <div
                  className={cn(
                    "absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30",
                    "animate-pulse",
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div
                  className={cn("border rounded-md p-4 bg-gradient-to-br from-blue-50 to-purple-50", "animate-pulse")}
                >
                  <p className="text-center text-sm text-muted-foreground">Analyzing text content...</p>
                </div>
                <div
                  className={cn("border rounded-md p-4 bg-gradient-to-br from-purple-50 to-pink-50", "animate-pulse")}
                >
                  <p className="text-center text-sm text-muted-foreground">Analyzing visual elements...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && (
        <TextSimilarityPage data={{
          success: true,
          sourceUrl,
          targetUrl,
          overallSimilarityScore: overallScore,
          comparison: comparisonData ?? [],
          sourceProduct: null,
          targetProduct: null,
        }} />
      )}
    </main>
  )
}

// interface SimilarityCardProps {
//   title: string
//   score: number
//   description: string
//   isOverall?: boolean
//   onViewDetails?: () => void
//   icon?: React.ReactNode
// }

// function SimilarityCard({ title, score, description, isOverall = false, onViewDetails, icon }: SimilarityCardProps) {
//   const getColorClass = () => {
//     if (score > 75) return "text-red-500"
//     if (score > 50) return "text-amber-500"
//     return "text-green-500"
//   }

//   const getBgClass = () => {
//     if (score > 75) return "from-red-50 to-red-100"
//     if (score > 50) return "from-amber-50 to-amber-100"
//     return "from-green-50 to-green-100"
//   }

//   return (
//     <div
//       className={cn(
//         "border rounded-md p-4",
//         isOverall ? "bg-gradient-to-br from-blue-50 to-purple-100" : `bg-gradient-to-br ${getBgClass()}`,
//       )}
//     >
//       <h3 className="font-medium text-center mb-2">{title}</h3>
//       <div className="flex justify-center items-center mb-2">
//         <div className={cn("text-4xl font-bold", isOverall ? "text-primary" : getColorClass())}>{score}%</div>
//       </div>
//       <Progress value={score} className={cn("h-2 mb-2", isOverall ? "bg-blue-100" : "")} />
//       <p className="text-xs text-center text-muted-foreground mb-3">{description}</p>

//       {onViewDetails && (
//         <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={onViewDetails}>
//           {icon}
//           View Detailed Analysis
//         </Button>
//       )}
//     </div>
//   )
// }

