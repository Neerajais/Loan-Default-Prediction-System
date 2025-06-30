"use client"

import { useState, useEffect } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"

interface RealTimeStockChartProps {
  symbol: string
}

interface StockData {
  symbol: string
  currentPrice: number
  change: number
  changePercent: number
  volume: number
  lastUpdated: string
  historicalData: {
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }[]
}

export default function RealTimeStockChart({ symbol }: RealTimeStockChartProps) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [timeframe, setTimeframe] = useState("30D")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchStockData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/stock/${symbol}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch stock data")
      }

      const data = await response.json()
      setStockData(data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      console.error("Error fetching stock data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStockData()

    // Auto-refresh every 5 minutes during market hours
    const interval = setInterval(
      () => {
        const now = new Date()
        const hour = now.getHours()
        const day = now.getDay()

        // Only auto-refresh during market hours (simplified)
        if (day >= 1 && day <= 5 && hour >= 9 && hour < 16) {
          fetchStockData()
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [symbol])

  const getChartData = () => {
    if (!stockData?.historicalData) return []

    const days = timeframe === "7D" ? 7 : timeframe === "30D" ? 30 : timeframe === "90D" ? 90 : 365
    return stockData.historicalData.slice(-days).map((item) => ({
      date: item.date,
      price: item.close,
      volume: item.volume,
      high: item.high,
      low: item.low,
    }))
  }

  const timeframes = ["7D", "30D", "90D", "1Y"]

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Stock Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchStockData} variant="outline">
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
          <CardTitle>Loading real-time data for {symbol}...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (!stockData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to load stock data for {symbol}</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = getChartData()

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              {symbol}
              <Button variant="ghost" size="sm" onClick={fetchStockData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold">${stockData.currentPrice.toFixed(2)}</span>
              <div className={`flex items-center gap-1 ${stockData.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stockData.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="font-medium">
                  {stockData.change >= 0 ? "+" : ""}
                  {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>Volume: {stockData.volume.toLocaleString()}</span>
              <span>Last Updated: {new Date(stockData.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-1">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={["dataMin - 2", "dataMax + 2"]}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 text-center">
          <Badge variant="outline" className="text-xs">
            Real-time data • Last refresh: {lastRefresh.toLocaleTimeString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
