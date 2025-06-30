"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StockSearch() {
  const [symbol, setSymbol] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!symbol.trim()) return

    setIsLoading(true)
    // Simulate API validation
    await new Promise((resolve) => setTimeout(resolve, 500))
    router.push(`/stock/${symbol.toUpperCase()}`)
    setIsLoading(false)
  }

  const quickSearchStocks = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA"]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Stock Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Enter stock symbol (e.g., AAPL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : "Analyze"}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3">Quick search:</p>
          <div className="flex flex-wrap gap-2">
            {quickSearchStocks.map((stock) => (
              <Button key={stock} variant="outline" size="sm" onClick={() => router.push(`/stock/${stock}`)}>
                {stock}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
