"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, BarChart3 } from "lucide-react"

interface TechnicalIndicatorsProps {
  symbol: string
}

interface Indicator {
  name: string
  value: number
  signal: "BUY" | "SELL" | "NEUTRAL"
  description: string
}

export default function TechnicalIndicators({ symbol }: TechnicalIndicatorsProps) {
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateIndicators = (): Indicator[] => {
      return [
        {
          name: "RSI (14)",
          value: Math.random() * 100,
          signal: Math.random() > 0.5 ? "BUY" : Math.random() > 0.5 ? "SELL" : "NEUTRAL",
          description: "Relative Strength Index",
        },
        {
          name: "MACD",
          value: (Math.random() - 0.5) * 10,
          signal: Math.random() > 0.5 ? "BUY" : Math.random() > 0.5 ? "SELL" : "NEUTRAL",
          description: "Moving Average Convergence Divergence",
        },
        {
          name: "SMA (20)",
          value: Math.random() * 200 + 50,
          signal: Math.random() > 0.5 ? "BUY" : Math.random() > 0.5 ? "SELL" : "NEUTRAL",
          description: "Simple Moving Average",
        },
        {
          name: "Bollinger Bands",
          value: Math.random() * 100,
          signal: Math.random() > 0.5 ? "BUY" : Math.random() > 0.5 ? "SELL" : "NEUTRAL",
          description: "Price volatility indicator",
        },
        {
          name: "Stochastic",
          value: Math.random() * 100,
          signal: Math.random() > 0.5 ? "BUY" : Math.random() > 0.5 ? "SELL" : "NEUTRAL",
          description: "Momentum oscillator",
        },
      ]
    }

    setIsLoading(true)
    setTimeout(() => {
      setIndicators(generateIndicators())
      setIsLoading(false)
    }, 1000)
  }, [symbol])

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY":
        return "bg-green-100 text-green-800"
      case "SELL":
        return "bg-red-100 text-red-800"
      case "NEUTRAL":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Technical Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-2 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const buySignals = indicators.filter((i) => i.signal === "BUY").length
  const sellSignals = indicators.filter((i) => i.signal === "SELL").length
  const neutralSignals = indicators.filter((i) => i.signal === "NEUTRAL").length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Technical Indicators
        </CardTitle>
        <div className="flex gap-2 mt-2">
          <Badge className="bg-green-100 text-green-800">{buySignals} BUY</Badge>
          <Badge className="bg-red-100 text-red-800">{sellSignals} SELL</Badge>
          <Badge className="bg-gray-100 text-gray-800">{neutralSignals} NEUTRAL</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {indicators.map((indicator, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{indicator.name}</p>
                <p className="text-xs text-gray-600">{indicator.description}</p>
              </div>
              <Badge className={getSignalColor(indicator.signal)}>{indicator.signal}</Badge>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Value: {indicator.value.toFixed(2)}</span>
              </div>
              <Progress value={Math.abs(indicator.value) % 100} className="h-2" />
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4" />
            <span className="font-medium text-sm">Overall Signal</span>
          </div>
          <div className="text-center">
            {buySignals > sellSignals ? (
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">BULLISH</Badge>
            ) : sellSignals > buySignals ? (
              <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">BEARISH</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800 text-lg px-4 py-2">NEUTRAL</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
