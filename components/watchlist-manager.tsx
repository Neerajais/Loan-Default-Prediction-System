"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Eye, TrendingUp, TrendingDown } from "lucide-react"

interface WatchlistStock {
  symbol: string
  name: string
  price: number
  change: number
  percentChange: number
}

export default function WatchlistManager() {
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([])
  const [newSymbol, setNewSymbol] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const generateWatchlist = (): WatchlistStock[] => {
      const symbols = ["AAPL", "GOOGL", "MSFT", "TSLA"]
      const names = ["Apple Inc.", "Alphabet Inc.", "Microsoft Corp.", "Tesla Inc."]

      return symbols.map((symbol, i) => ({
        symbol,
        name: names[i],
        price: Math.random() * 300 + 50,
        change: (Math.random() - 0.5) * 20,
        percentChange: (Math.random() - 0.5) * 5,
      }))
    }

    setIsLoading(true)
    setTimeout(() => {
      setWatchlist(generateWatchlist())
      setIsLoading(false)
    }, 1000)
  }, [])

  const addToWatchlist = () => {
    if (!newSymbol.trim()) return

    const newStock: WatchlistStock = {
      symbol: newSymbol.toUpperCase(),
      name: `${newSymbol.toUpperCase()} Corporation`,
      price: Math.random() * 300 + 50,
      change: (Math.random() - 0.5) * 20,
      percentChange: (Math.random() - 0.5) * 5,
    }

    setWatchlist([...watchlist, newStock])
    setNewSymbol("")
  }

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter((stock) => stock.symbol !== symbol))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            My Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-6 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-8" />
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
          <Eye className="h-5 w-5" />
          My Watchlist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add symbol (e.g., AAPL)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && addToWatchlist()}
          />
          <Button onClick={addToWatchlist} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {watchlist.map((stock) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/stock/${stock.symbol}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">{stock.symbol}</span>
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{stock.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold">${stock.price.toFixed(2)}</span>
                  <Badge
                    variant="outline"
                    className={stock.change >= 0 ? "border-green-600 text-green-600" : "border-red-600 text-red-600"}
                  >
                    {stock.change >= 0 ? "+" : ""}
                    {stock.percentChange.toFixed(2)}%
                  </Badge>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFromWatchlist(stock.symbol)
                }}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {watchlist.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Your watchlist is empty</p>
            <p className="text-sm">Add stocks to track their performance</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
