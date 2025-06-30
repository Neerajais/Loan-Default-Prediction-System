"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Brain, RefreshCw, AlertTriangle } from "lucide-react"

interface AIPredictionProps {
  symbol: string
}

interface PredictionData {
  symbol: string
  predictions: {
    date: string
    price: number
    confidence: number
  }[]
  technicalIndicators: {
    sma20: number
    sma50: number
    rsi: number
    volatility: number
  }
  signals: {
    trend: string
    momentum: string
    macd: string
  }
  recommendation: string
  accuracy: number
  algorithm: string
  lastUpdated: string
}

export default function AIStockPrediction({ symbol }: AIPredictionProps) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const generatePrediction = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First get stock data
      const stockResponse = await fetch(`/api/stock/${symbol}`)
      const stockData = await stockResponse.json()

      if (!stockData || stockData.error) {
        throw new Error("Unable to fetch stock data for prediction")
      }

      // Generate prediction based on historical data
      const response = await fetch(`/api/stock/${symbol}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ historicalData: stockData.historicalData }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate prediction")
      }

      const data = await response.json()
      setPrediction(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      console.error("Prediction error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    generatePrediction()
  }, [symbol])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Prediction Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={generatePrediction} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Prediction
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Generating AI Prediction...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-600">Analyzing market data and generating predictions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!prediction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Prediction Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No prediction data available</p>
        </CardContent>
      </Card>
    )
  }

  // Create chart data
  const chartData = prediction.predictions.map((pred, index) => ({
    date: pred.date,
    predicted: pred.price,
    confidence: pred.confidence,
    day: index + 1,
  }))

  const nextWeekPrediction = prediction.predictions[6]?.price || 0
  const currentPrice = prediction.predictions[0]?.price || 0
  const predictedChange = ((nextWeekPrediction - currentPrice) / currentPrice) * 100

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "BUY":
        return "bg-green-100 text-green-800"
      case "SELL":
        return "bg-red-100 text-red-800"
      case "HOLD":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Prediction Analysis
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="secondary">Accuracy: {prediction.accuracy}%</Badge>
              <Badge className={getRecommendationColor(prediction.recommendation)}>{prediction.recommendation}</Badge>
              <div className={`flex items-center gap-1 ${predictedChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {predictedChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="font-medium">
                  7-day outlook: {predictedChange >= 0 ? "+" : ""}
                  {predictedChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={generatePrediction} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} tickFormatter={(value) => `Day ${value}`} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value.toFixed(0)}`} />
              <Tooltip
                labelFormatter={(value) => `Day ${value}`}
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`,
                  name === "predicted" ? "Predicted Price" : name,
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                name="AI Prediction"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Technical Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">SMA 20</p>
            <p className="font-bold">${prediction.technicalIndicators.sma20.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">RSI</p>
            <p className="font-bold">{prediction.technicalIndicators.rsi.toFixed(1)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Volatility</p>
            <p className="font-bold">{prediction.technicalIndicators.volatility.toFixed(1)}%</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Trend</p>
            <p className={`font-bold ${prediction.signals.trend === "BULLISH" ? "text-green-600" : "text-red-600"}`}>
              {prediction.signals.trend}
            </p>
          </div>
        </div>

        {/* Prediction Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Tomorrow</p>
            <p className="font-bold text-lg">${prediction.predictions[0]?.price.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{prediction.predictions[0]?.confidence.toFixed(0)}% confidence</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Next Week</p>
            <p className="font-bold text-lg">${nextWeekPrediction.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{prediction.predictions[6]?.confidence.toFixed(0)}% confidence</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Algorithm</p>
            <p className="font-bold text-sm">{prediction.algorithm}</p>
            <p className="text-xs text-gray-500">
              Last updated: {new Date(prediction.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Disclaimer:</strong> Predictions are based on historical data and technical analysis. Past
            performance does not guarantee future results. Always do your own research before making investment
            decisions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
