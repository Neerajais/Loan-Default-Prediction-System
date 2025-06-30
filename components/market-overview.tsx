"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Globe } from "lucide-react"

interface MarketIndex {
  name: string
  value: number
  change: number
  percentChange: number
}

export default function MarketOverview() {
  const [indices, setIndices] = useState<MarketIndex[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateMarketData = (): MarketIndex[] => {
      return [
        {
          name: "S&P 500",
          value: 4200 + Math.random() * 400,
          change: (Math.random() - 0.5) * 100,
          percentChange: (Math.random() - 0.5) * 3,
        },
        {
          name: "NASDAQ",
          value: 13000 + Math.random() * 2000,
          change: (Math.random() - 0.5) * 200,
          percentChange: (Math.random() - 0.5) * 4,
        },
        {
          name: "DOW JONES",
          value: 34000 + Math.random() * 3000,
          change: (Math.random() - 0.5) * 300,
          percentChange: (Math.random() - 0.5) * 2,
        },
      ]
    }

    setIsLoading(true)
    setTimeout(() => {
      setIndices(generateMarketData())
      setIsLoading(false)
    }, 800)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-6 bg-gray-200 rounded mb-1" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {indices.map((index, i) => (
          <div key={i} className="border-b pb-4 last:border-b-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{index.name}</h3>
              {index.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>

            <p className="text-2xl font-bold mb-1">{index.value.toFixed(2)}</p>

            <div className={`flex items-center gap-2 ${index.change >= 0 ? "text-green-600" : "text-red-600"}`}>
              <span className="font-medium">
                {index.change >= 0 ? "+" : ""}
                {index.change.toFixed(2)}
              </span>
              <Badge
                variant="outline"
                className={index.change >= 0 ? "border-green-600 text-green-600" : "border-red-600 text-red-600"}
              >
                {index.percentChange >= 0 ? "+" : ""}
                {index.percentChange.toFixed(2)}%
              </Badge>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Market Status:</strong> Markets are currently open
          </p>
          <p className="text-xs text-blue-600 mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
