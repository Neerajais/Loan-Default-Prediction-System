"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Globe, RefreshCw } from "lucide-react"

interface MarketIndex {
  name: string
  symbol: string
  value: number
  change: number
  changePercent: number
  volume: number
  lastUpdated: string
  error?: string
}

interface MarketData {
  indices: MarketIndex[]
  marketStatus: string
  lastUpdated: string
}

export default function RealTimeMarketOverview() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMarketData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/market/overview")

      if (!response.ok) {
        throw new Error("Failed to fetch market data")
      }

      const data = await response.json()
      setMarketData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      console.error("Market data error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Globe className="h-5 w-5" />
            Market Overview - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchMarketData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

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

  if (!marketData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No market data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Market Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={marketData.marketStatus === "OPEN" ? "default" : "secondary"}
              className={marketData.marketStatus === "OPEN" ? "bg-green-600" : ""}
            >
              {marketData.marketStatus}
            </Badge>
            <Button variant="ghost" size="sm" onClick={fetchMarketData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {marketData.indices.map((index, i) => (
          <div key={i} className="border-b pb-4 last:border-b-0">
            {index.error ? (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500">{index.name}</p>
                <p className="text-xs text-red-600">{index.error}</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{index.name}</h3>
                    <p className="text-xs text-gray-500">({index.symbol})</p>
                  </div>
                  {index.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>

                <p className="text-2xl font-bold mb-1">${index.value.toFixed(2)}</p>

                <div className={`flex items-center gap-2 ${index.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  <span className="font-medium">
                    {index.change >= 0 ? "+" : ""}
                    {index.change.toFixed(2)}
                  </span>
                  <Badge
                    variant="outline"
                    className={index.change >= 0 ? "border-green-600 text-green-600" : "border-red-600 text-red-600"}
                  >
                    {index.changePercent >= 0 ? "+" : ""}
                    {index.changePercent.toFixed(2)}%
                  </Badge>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  <p>Volume: {index.volume.toLocaleString()}</p>
                  <p>Updated: {new Date(index.lastUpdated).toLocaleDateString()}</p>
                </div>
              </>
            )}
          </div>
        ))}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Market Status:</strong>{" "}
            {marketData.marketStatus === "OPEN" ? "Markets are currently open" : "Markets are currently closed"}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Last updated: {new Date(marketData.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
