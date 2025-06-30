"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, RefreshCw, Search, Clock, Ban } from "lucide-react"

interface StockErrorDisplayProps {
  error: {
    error: string
    message: string
    symbol: string
    retryAfter?: number
  }
  onRetry?: () => void
  onSearch?: () => void
}

export default function StockErrorDisplay({ error, onRetry, onSearch }: StockErrorDisplayProps) {
  const getErrorIcon = () => {
    switch (error.error) {
      case "API_LIMIT_REACHED":
        return <Clock className="h-8 w-8 text-yellow-600" />
      case "SYMBOL_NOT_FOUND":
        return <Search className="h-8 w-8 text-blue-600" />
      case "INVALID_SYMBOL":
        return <Ban className="h-8 w-8 text-red-600" />
      default:
        return <AlertTriangle className="h-8 w-8 text-red-600" />
    }
  }

  const getErrorColor = () => {
    switch (error.error) {
      case "API_LIMIT_REACHED":
        return "border-yellow-200 bg-yellow-50"
      case "SYMBOL_NOT_FOUND":
        return "border-blue-200 bg-blue-50"
      case "INVALID_SYMBOL":
        return "border-red-200 bg-red-50"
      default:
        return "border-red-200 bg-red-50"
    }
  }

  const getErrorTitle = () => {
    switch (error.error) {
      case "API_LIMIT_REACHED":
        return "API Rate Limit Reached"
      case "SYMBOL_NOT_FOUND":
        return "Stock Symbol Not Found"
      case "INVALID_SYMBOL":
        return "Invalid Stock Symbol"
      case "NO_DATA":
        return "No Data Available"
      case "INVALID_DATA":
        return "Invalid Data Received"
      default:
        return "Error Loading Stock Data"
    }
  }

  const getErrorDescription = () => {
    switch (error.error) {
      case "API_LIMIT_REACHED":
        return "We've reached our daily API limit. The service will be available again soon. Try again in a few minutes."
      case "SYMBOL_NOT_FOUND":
        return `The stock symbol "${error.symbol}" was not found. Please check the symbol and try again.`
      case "INVALID_SYMBOL":
        return `"${error.symbol}" is not a valid stock symbol format. Please use standard symbols like AAPL, GOOGL, etc.`
      case "NO_DATA":
        return "No market data is available for this symbol at the moment."
      case "INVALID_DATA":
        return "The data received was incomplete or invalid. This might be a temporary issue."
      default:
        return error.message || "An unexpected error occurred while loading stock data."
    }
  }

  const getSuggestions = () => {
    switch (error.error) {
      case "API_LIMIT_REACHED":
        return ["Try again in a few minutes", "The service resets daily", "Consider upgrading to premium API access"]
      case "SYMBOL_NOT_FOUND":
        return [
          "Check the stock symbol spelling",
          "Try searching for the company name",
          "Use popular symbols like AAPL, GOOGL, MSFT",
        ]
      case "INVALID_SYMBOL":
        return ["Use standard format (e.g., AAPL)", "Avoid special characters", "Check if it's a valid exchange symbol"]
      default:
        return ["Try refreshing the page", "Check your internet connection", "Try a different stock symbol"]
    }
  }

  return (
    <Card className={`${getErrorColor()} border-2`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {getErrorIcon()}
          <div>
            <CardTitle className="text-lg">{getErrorTitle()}</CardTitle>
            <Badge variant="outline" className="mt-1">
              Symbol: {error.symbol}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{getErrorDescription()}</p>

        <div className="bg-white/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Suggestions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {getSuggestions().map((suggestion, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="flex items-center gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Try Again
              {error.retryAfter && (
                <Badge variant="secondary" className="ml-2">
                  {error.retryAfter}s
                </Badge>
              )}
            </Button>
          )}

          {onSearch && (
            <Button onClick={onSearch} variant="default" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Stocks
            </Button>
          )}
        </div>

        {error.error === "API_LIMIT_REACHED" && (
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> We're using a free API service with daily limits. The app will work normally once
              the limit resets.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
