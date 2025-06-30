"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, RefreshCw, ArrowLeft } from "lucide-react"
import StockErrorDisplay from "./stock-error-display"
import { ErrorBoundary } from "./error-boundary"

interface EnhancedRealTimeStockChartProps {
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
  cached?: boolean
}

interface StockError {
  error: string
  message: string
  symbol: string
  retryAfter?: number
}

export default function EnhancedRealTimeStockChart({ symbol }: EnhancedRealTimeStockChartProps) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [error, setError] = useState<StockError | null>(null)
  const [timeframe, setTimeframe] = useState("30D")
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const router = useRouter()

  const fetchStockData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true)
      }
      setError(null)

      // Use relative URL for client-side fetching
      const response = await fetch(`/api/stock/${symbol}`)

      // Check content type
      const contentType = response.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        throw new Error("Invalid response format")
      }

      const data = await response.json()

      if (!response.ok) {
        setError(data)
        setStockData(null)
        return
      }

      setStockData(data)
      setLastRefresh(new Date())
    } catch (err) {
      console.error("Error fetching stock data:", err)
      setError({
        error: "FETCH_ERROR",
        message: "Failed to load stock data. Please check your connection and try again.",
        symbol,
      })
      setStockData(null)
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  const handleRetry = () => {
    fetchStockData()
  }

  const handleSearch = () => {
    router.push("/")
  }

  useEffect(() => {
    fetchStockData()

    // Auto-refresh every 5 minutes during market hours
    const interval = setInterval(
      () => {
        if (!error || error.error !== "API_LIMIT_REACHED") {
          const now = new Date()
          const hour = now.getHours()
          const day = now.getDay()

          // Only auto-refresh during market hours (simplified)
          if (day >= 1 && day <= 5 && hour >= 9 && hour < 16) {
            fetchStockData(false)
          }
        }
      },
      5 * 60 * 1000,
    )

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
      <ErrorBoundary>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
          </div>
          <StockErrorDisplay error={error} onRetry={handleRetry} onSearch={handleSearch} />
        </div>
      </ErrorBoundary>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Loading {symbol}...</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Fetching real-time data</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-600">Loading market data...</p>
            </div>
          </div>
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
          <Button onClick={handleRetry} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const chartData = getChartData()

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <CardTitle className="text-2xl">{symbol}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => fetchStockData()} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
                {stockData.cached && (
                  <Badge variant="outline" className="text-xs">
                    Cached
                  </Badge>
                )}
              </div>
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
              {stockData.cached ? "Cached data" : "Real-time data"} • Last refresh: {lastRefresh.toLocaleTimeString()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
