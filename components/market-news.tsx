"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Newspaper, ExternalLink, Clock } from "lucide-react"

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  timestamp: string
  category: "market" | "earnings" | "analysis" | "breaking"
  sentiment: "positive" | "negative" | "neutral"
}

export default function MarketNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateMockNews = (): NewsItem[] => {
      const mockNews = [
        {
          id: "1",
          title: "Tech Stocks Rally on AI Optimism",
          summary:
            "Major technology companies see significant gains as investors remain bullish on artificial intelligence developments.",
          source: "MarketWatch",
          timestamp: "2 hours ago",
          category: "market" as const,
          sentiment: "positive" as const,
        },
        {
          id: "2",
          title: "Federal Reserve Signals Potential Rate Changes",
          summary:
            "Fed officials hint at possible monetary policy adjustments in upcoming meetings based on inflation data.",
          source: "Reuters",
          timestamp: "4 hours ago",
          category: "breaking" as const,
          sentiment: "neutral" as const,
        },
        {
          id: "3",
          title: "Q4 Earnings Season Shows Mixed Results",
          summary: "Corporate earnings reports reveal varied performance across sectors, with energy leading gains.",
          source: "Bloomberg",
          timestamp: "6 hours ago",
          category: "earnings" as const,
          sentiment: "neutral" as const,
        },
        {
          id: "4",
          title: "Cryptocurrency Market Volatility Continues",
          summary:
            "Digital assets experience significant price swings amid regulatory uncertainty and institutional adoption.",
          source: "CoinDesk",
          timestamp: "8 hours ago",
          category: "market" as const,
          sentiment: "negative" as const,
        },
        {
          id: "5",
          title: "Green Energy Stocks Surge on Policy News",
          summary: "Renewable energy companies rally following new government incentives and climate initiatives.",
          source: "Financial Times",
          timestamp: "1 day ago",
          category: "analysis" as const,
          sentiment: "positive" as const,
        },
      ]

      return mockNews
    }

    setIsLoading(true)
    setTimeout(() => {
      setNews(generateMockNews())
      setIsLoading(false)
    }, 1000)
  }, [])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breaking":
        return "bg-red-100 text-red-800"
      case "earnings":
        return "bg-blue-100 text-blue-800"
      case "analysis":
        return "bg-purple-100 text-purple-800"
      case "market":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      case "neutral":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Market News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2 p-4 border rounded animate-pulse">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
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
          <Newspaper className="h-5 w-5" />
          Market News
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {news.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge className={getCategoryColor(item.category)}>{item.category.toUpperCase()}</Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {item.timestamp}
                </div>
              </div>

              <h3 className="font-semibold text-sm mb-2 leading-tight">{item.title}</h3>

              <p className="text-xs text-gray-600 mb-3 leading-relaxed">{item.summary}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">{item.source}</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.sentiment === "positive"
                        ? "bg-green-500"
                        : item.sentiment === "negative"
                          ? "bg-red-500"
                          : "bg-gray-500"
                    }`}
                  />
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">News updates every 15 minutes</p>
        </div>
      </CardContent>
    </Card>
  )
}
