"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Star } from "lucide-react"

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  percentChange: number
  volume: string
}

export default function PopularStocks() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const generateMockStocks = (): Stock[] => {
      const stockList = [
        { symbol: "AAPL", name: "Apple Inc." },
        { symbol: "GOOGL", name: "Alphabet Inc." },
        { symbol: "MSFT", name: "Microsoft Corp." },
        { symbol: "TSLA", name: "Tesla Inc." },
        { symbol: "AMZN", name: "Amazon.com Inc." },
        { symbol: "NVDA", name: "NVIDIA Corp." },
        { symbol: "META", name: "Meta Platforms" },
        { symbol: "NFLX", name: "Netflix Inc." },
      ]

      return stockList.map((stock) => {
        const price = Math.random() * 300 + 50
        const change = (Math.random() - 0.5) * 20
        const percentChange = (change / price) * 100

        return {
          ...stock,
          price: Number(price.toFixed(2)),
          change: Number(change.toFixed(2)),
          percentChange: Number(percentChange.toFixed(2)),
          volume: `${(Math.random() * 100 + 10).toFixed(1)}M`,
        }
      })
    }

    setIsLoading(true)
    setTimeout(() => {
      setStocks(generateMockStocks())
      setIsLoading(false)
    }, 1200)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Popular Stocks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-6 bg-gray-200 rounded mb-2" />
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
          <Star className="h-5 w-5" />
          Popular Stocks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/stock/${stock.symbol}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{stock.symbol}</h3>
                  <p className="text-sm text-gray-600 truncate">{stock.name}</p>
                </div>
                {stock.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xl font-bold">${stock.price.toFixed(2)}</p>
                <div
                  className={`flex items-center gap-1 text-sm ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  <span>
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change.toFixed(2)}
                  </span>
                  <span>
                    ({stock.percentChange >= 0 ? "+" : ""}
                    {stock.percentChange.toFixed(2)}%)
                  </span>
                </div>
                <p className="text-xs text-gray-500">Vol: {stock.volume}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
