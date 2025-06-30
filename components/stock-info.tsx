"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, DollarSign, TrendingUp, Users } from "lucide-react"

interface StockInfoProps {
  symbol: string
}

interface CompanyInfo {
  name: string
  sector: string
  industry: string
  marketCap: string
  peRatio: string
  dividendYield: string
  description: string
  employees: string
}

export default function StockInfo({ symbol }: StockInfoProps) {
  const [info, setInfo] = useState<CompanyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStockInfo = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/stock/${symbol}`)
        const data = await response.json()

        if (data && data.companyInfo) {
          setInfo(data.companyInfo)
        }
      } catch (error) {
        console.error("Error fetching stock info:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStockInfo()
  }, [symbol])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading company info...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!info) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Info
            </CardTitle>
            <p className="text-lg font-semibold mt-1">{info.name}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Market Cap</p>
              <p className="font-semibold">{info.marketCap}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">P/E Ratio</p>
              <p className="font-semibold">{info.peRatio}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Dividend Yield</p>
              <p className="font-semibold">{info.dividendYield}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Employees</p>
              <p className="font-semibold">{info.employees}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Sector</p>
          <Badge variant="outline">{info.sector}</Badge>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Description</p>
          <p className="text-sm text-gray-700 leading-relaxed">{info.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
