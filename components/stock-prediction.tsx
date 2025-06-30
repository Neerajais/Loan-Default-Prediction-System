"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Brain } from "lucide-react"

interface PredictionProps {
  symbol: string
}

interface PredictionData {
  date: string
  actual?: number
  predicted: number
  confidence: number
}

export default function StockPrediction({ symbol }: PredictionProps) {
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accuracy, setAccuracy] = useState(0)

  useEffect(() => {
    const generatePredictions = () => {
      const data: PredictionData[] = []
      const basePrice = Math.random() * 200 + 50

      // Historical data with actual prices
      for (let i = 7; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const price = basePrice + (Math.random() - 0.5) * 20

        data.push({
          date: date.toISOString().split("T")[0],
          actual: Number(price.toFixed(2)),
          predicted: Number((price + (Math.random() - 0.5) * 5).toFixed(2)),
          confidence: Math.random() * 30 + 70,
        })
      }

      // Future predictions
      for (let i = 1; i <= 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        const trend = (Math.random() - 0.5) * 0.1
        const lastPrice = data[data.length - 1].actual || basePrice
        const predicted = lastPrice * (1 + trend)

        data.push({
          date: date.toISOString().split("T")[0],
          predicted: Number(predicted.toFixed(2)),
          confidence: Math.max(90 - i * 5, 60),
        })
      }

      return data
    }

    setIsLoading(true)
    setTimeout(() => {
      const data = generatePredictions()
      setPredictions(data)
      setAccuracy(Math.random() * 20 + 75) // 75-95% accuracy
      setIsLoading(false)
    }, 1500)
  }, [symbol])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Prediction Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  const futureData = predictions.filter((p) => !p.actual)
  const nextWeekPrediction = futureData[6]?.predicted || 0
  const currentPrice = predictions.find((p) => p.actual)?.actual || 0
  const predictedChange = ((nextWeekPrediction - currentPrice) / currentPrice) * 100

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
              <Badge variant="secondary">Accuracy: {accuracy.toFixed(1)}%</Badge>
              <div className={`flex items-center gap-1 ${predictedChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {predictedChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="font-medium">
                  7-day outlook: {predictedChange >= 0 ? "+" : ""}
                  {predictedChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`,
                  name === "actual" ? "Actual Price" : "Predicted Price",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Actual Price"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                name="Predicted Price"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Next Day</p>
            <p className="font-bold text-lg">${futureData[0]?.predicted.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{futureData[0]?.confidence.toFixed(0)}% confidence</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Next Week</p>
            <p className="font-bold text-lg">${nextWeekPrediction.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{futureData[6]?.confidence.toFixed(0)}% confidence</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trend</p>
            <p className={`font-bold text-lg ${predictedChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {predictedChange >= 0 ? "Bullish" : "Bearish"}
            </p>
            <p className="text-xs text-gray-500">AI Analysis</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
