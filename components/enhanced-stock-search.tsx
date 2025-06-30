"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, TrendingUp, Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  symbol: string
  name: string
  type: string
  region: string
  currency: string
}

interface SearchResponse {
  results: SearchResult[]
  note?: string
  source?: string
  error?: string
}

export default function EnhancedStockSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<string>("")
  const [statusNote, setStatusNote] = useState<string>("")
  const router = useRouter()

  const searchStocks = async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setResults([])
      setShowResults(false)
      setSearchError(null)
      setDataSource("")
      setStatusNote("")
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      console.log(`🔍 Searching for: "${searchQuery}"`)

      const response = await fetch(`/api/stock/search?q=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`)
      }

      const data: SearchResponse = await response.json()

      console.log("📊 Search response:", data)

      if (data.error && !data.results?.length) {
        setSearchError(data.error)
        setResults([])
        setShowResults(false)
        return
      }

      setResults(data.results || [])
      setShowResults(true)
      setDataSource(data.source || "unknown")
      setStatusNote(data.note || "")

      // Log what type of data we got
      if (data.source === "alpha_vantage") {
        console.log("✅ Got real-time data from Alpha Vantage!")
      } else {
        console.log("⚠️ Using fallback data")
      }
    } catch (err) {
      console.error("❌ Search error:", err)
      setSearchError("Search service temporarily unavailable")
      setResults([])
      setShowResults(false)
      setDataSource("error")
      setStatusNote("")
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchStocks(query)
      }
    }, 500) // Increased debounce to reduce API calls

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleStockSelect = (symbol: string) => {
    setShowResults(false)
    setQuery("")
    router.push(`/stock/${symbol}`)
  }

  const handleDirectSearch = () => {
    if (query.trim()) {
      router.push(`/stock/${query.trim().toUpperCase()}`)
    }
  }

  const quickSearchStocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
  ]

  const getStatusIcon = () => {
    if (dataSource === "alpha_vantage") {
      return <Wifi className="h-4 w-4 text-green-600" />
    } else if (dataSource === "fallback") {
      return <WifiOff className="h-4 w-4 text-yellow-600" />
    }
    return null
  }

  const getStatusColor = () => {
    if (dataSource === "alpha_vantage") {
      return "bg-green-50 border-green-200 text-green-800"
    } else if (dataSource === "fallback") {
      return "bg-yellow-50 border-yellow-200 text-yellow-800"
    }
    return "bg-blue-50 border-blue-200 text-blue-800"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Real-Time Stock Search
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search stocks by symbol or company name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDirectSearch()}
                className="pl-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
            <Button onClick={handleDirectSearch} disabled={!query.trim()}>
              Analyze
            </Button>
          </div>

          {/* Status Indicator */}
          {statusNote && (
            <div className={`mt-2 p-2 border rounded flex items-center gap-2 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="text-sm">{statusNote}</span>
            </div>
          )}

          {/* Search Error */}
          {searchError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{searchError}</span>
            </div>
          )}

          {/* Search Results Dropdown */}
          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.symbol}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleStockSelect(result.symbol)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{result.symbol}</p>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                        {dataSource === "alpha_vantage" && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Live</Badge>
                        )}
                        {dataSource === "fallback" && (
                          <Badge variant="secondary" className="text-xs">
                            Cached
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate max-w-xs mt-1">{result.name}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-xs text-gray-500">{result.region}</p>
                      <p className="text-xs text-gray-500">{result.currency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {showResults && results.length === 0 && !isSearching && !searchError && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 p-4 text-center">
              <p className="text-sm text-gray-600">No stocks found for "{query}"</p>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={handleDirectSearch}>
                Search "{query}" anyway
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3">Popular stocks:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quickSearchStocks.map((stock) => (
              <Button
                key={stock.symbol}
                variant="outline"
                size="sm"
                onClick={() => handleStockSelect(stock.symbol)}
                className="justify-start text-left h-auto p-2"
              >
                <div>
                  <div className="font-semibold text-xs">{stock.symbol}</div>
                  <div className="text-xs text-gray-500 truncate">{stock.name}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            🔍 <strong>Smart Search:</strong> Real-time symbol lookup from Alpha Vantage
          </p>
          <p className="text-sm text-blue-800 mt-1">
            📊 <strong>Live Data:</strong> Current market prices and company information
          </p>
          <p className="text-sm text-blue-800 mt-1">
            🛡️ <strong>Fallback:</strong> Cached results when API limits are reached
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
