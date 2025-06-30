"use client"

import { useState, useEffect } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StockChartProps {
  symbol: string
}

interface StockData {
  date: string
  price: number
  volume: number
  change: number
}

export default function StockChart({ symbol }: StockChartProps) {
  const [data, setData] = useState<StockData[]>([])
  const [timeframe, setTimeframe] = useState("1M")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateMockData = () => {
      const days = timeframe === "1D" ? 1 : timeframe === "1W" ? 7 : timeframe === "1M" ? 30 : 90
      const basePrice = Math.random() * 200 + 50
      const mockData: StockData[] = []

      for (let i = days; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        const randomChange = (Math.random() - 0.5) * 10
        const price = Math.max(basePrice + (randomChange * (days - i)) / days, 10)

        mockData.push({
          date: date.toISOString().split("T")[0],
          price: Number(price.toFixed(2)),
          volume: Math.floor(Math.random() * 1000000) + 100000,
          change: randomChange,
        })
      }

      return mockData
    }

    setIsLoading(true)
    setTimeout(() => {
      setData(generateMockData())
      setIsLoading(false)
    }, 1000)
  }, [symbol, timeframe])

  const currentPrice = data[data.length - 1]?.price || 0
  const previousPrice = data[data.length - 2]?.price || 0
  const priceChange = currentPrice - previousPrice
  const percentChange = (priceChange / previousPrice) * 100 || 0

  const timeframes = ["1D", "1W", "1M", "3M"]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading chart data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{symbol}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold">${currentPrice.toFixed(2)}</span>
              <div className={`flex items-center gap-1 ${priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="font-medium">
                  {priceChange >= 0 ? "+" : ""}
                  {priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
                </span>
              </div>
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
            <AreaChart data={data}>
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
              <YAxis tick={{ fontSize: 12 }} domain={["dataMin - 5", "dataMax + 5"]} />
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
      </CardContent>
    </Card>
  )
}
