"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { DollarSign, TrendingUp, TrendingDown, PieChartIcon } from "lucide-react"

interface PortfolioHolding {
  symbol: string
  shares: number
  avgPrice: number
  currentPrice: number
  value: number
  gainLoss: number
  gainLossPercent: number
}

interface PortfolioData {
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  holdings: PortfolioHolding[]
}

export default function PortfolioOverview() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generatePortfolio = (): PortfolioData => {
      const holdings: PortfolioHolding[] = [
        { symbol: "AAPL", shares: 50, avgPrice: 150, currentPrice: 0, value: 0, gainLoss: 0, gainLossPercent: 0 },
        { symbol: "GOOGL", shares: 20, avgPrice: 2500, currentPrice: 0, value: 0, gainLoss: 0, gainLossPercent: 0 },
        { symbol: "MSFT", shares: 30, avgPrice: 300, currentPrice: 0, value: 0, gainLoss: 0, gainLossPercent: 0 },
        { symbol: "TSLA", shares: 15, avgPrice: 800, currentPrice: 0, value: 0, gainLoss: 0, gainLossPercent: 0 },
      ]

      holdings.forEach((holding) => {
        holding.currentPrice = holding.avgPrice * (0.8 + Math.random() * 0.4) // ±20% from avg price
        holding.value = holding.shares * holding.currentPrice
        holding.gainLoss = holding.value - holding.shares * holding.avgPrice
        holding.gainLossPercent = (holding.gainLoss / (holding.shares * holding.avgPrice)) * 100
      })

      const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
      const totalCost = holdings.reduce((sum, h) => sum + h.shares * h.avgPrice, 0)
      const totalGainLoss = totalValue - totalCost
      const totalGainLossPercent = (totalGainLoss / totalCost) * 100

      return {
        totalValue,
        totalGainLoss,
        totalGainLossPercent,
        holdings,
      }
    }

    setIsLoading(true)
    setTimeout(() => {
      setPortfolio(generatePortfolio())
      setIsLoading(false)
    }, 1200)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!portfolio) return null

  const pieData = portfolio.holdings.map((holding) => ({
    name: holding.symbol,
    value: holding.value,
    percentage: (holding.value / portfolio.totalValue) * 100,
  }))

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Portfolio Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${portfolio.totalValue.toFixed(0)}</p>
              </div>

              <div
                className={`text-center p-4 rounded-lg ${portfolio.totalGainLoss >= 0 ? "bg-green-50" : "bg-red-50"}`}
              >
                {portfolio.totalGainLoss >= 0 ? (
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
                )}
                <p className="text-sm text-gray-600">Total P&L</p>
                <p className={`text-2xl font-bold ${portfolio.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {portfolio.totalGainLoss >= 0 ? "+" : ""}${portfolio.totalGainLoss.toFixed(0)}
                </p>
                <p className={`text-sm ${portfolio.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ({portfolio.totalGainLossPercent >= 0 ? "+" : ""}
                  {portfolio.totalGainLossPercent.toFixed(2)}%)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Holdings</h3>
              {portfolio.holdings.map((holding) => (
                <div key={holding.symbol} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{holding.symbol}</p>
                    <p className="text-sm text-gray-600">{holding.shares} shares</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${holding.value.toFixed(0)}</p>
                    <Badge
                      variant="outline"
                      className={
                        holding.gainLoss >= 0 ? "border-green-600 text-green-600" : "border-red-600 text-red-600"
                      }
                    >
                      {holding.gainLoss >= 0 ? "+" : ""}
                      {holding.gainLossPercent.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Asset Allocation</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toFixed(0)}`, "Value"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm">
                      {entry.name} ({entry.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
