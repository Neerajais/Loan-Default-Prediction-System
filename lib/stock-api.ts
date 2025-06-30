// Mock API functions for stock data
// In a real application, these would connect to actual stock APIs

export interface StockQuote {
  symbol: string
  price: number
  change: number
  percentChange: number
  volume: number
  marketCap: string
  peRatio: number
}

export interface HistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface PredictionResult {
  symbol: string
  predictions: {
    date: string
    price: number
    confidence: number
  }[]
  accuracy: number
  algorithm: string
}

export class StockAPI {
  private static instance: StockAPI

  static getInstance(): StockAPI {
    if (!StockAPI.instance) {
      StockAPI.instance = new StockAPI()
    }
    return StockAPI.instance
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const basePrice = Math.random() * 300 + 50
    const change = (Math.random() - 0.5) * 20

    return {
      symbol: symbol.toUpperCase(),
      price: Number(basePrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      percentChange: Number(((change / basePrice) * 100).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: `$${(Math.random() * 2000 + 100).toFixed(0)}B`,
      peRatio: Number((Math.random() * 30 + 10).toFixed(2)),
    }
  }

  async getHistoricalData(symbol: string, days = 30): Promise<HistoricalData[]> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const data: HistoricalData[] = []
    const basePrice = Math.random() * 200 + 50

    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const price = basePrice + ((Math.random() - 0.5) * 20 * (days - i)) / days
      const volatility = Math.random() * 5

      data.push({
        date: date.toISOString().split("T")[0],
        open: Number((price - volatility).toFixed(2)),
        high: Number((price + volatility).toFixed(2)),
        low: Number((price - volatility * 1.5).toFixed(2)),
        close: Number(price.toFixed(2)),
        volume: Math.floor(Math.random() * 5000000) + 500000,
      })
    }

    return data
  }

  async getPrediction(symbol: string): Promise<PredictionResult> {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const predictions = []
    const basePrice = Math.random() * 200 + 50

    for (let i = 1; i <= 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)

      const trend = (Math.random() - 0.5) * 0.1
      const price = basePrice * (1 + (trend * i) / 7)

      predictions.push({
        date: date.toISOString().split("T")[0],
        price: Number(price.toFixed(2)),
        confidence: Math.max(95 - i * 5, 60),
      })
    }

    return {
      symbol: symbol.toUpperCase(),
      predictions,
      accuracy: Math.random() * 20 + 75,
      algorithm: "LSTM Neural Network",
    }
  }

  async searchStocks(query: string): Promise<{ symbol: string; name: string }[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const mockResults = [
      { symbol: "AAPL", name: "Apple Inc." },
      { symbol: "GOOGL", name: "Alphabet Inc." },
      { symbol: "MSFT", name: "Microsoft Corporation" },
      { symbol: "TSLA", name: "Tesla, Inc." },
      { symbol: "AMZN", name: "Amazon.com, Inc." },
      { symbol: "NVDA", name: "NVIDIA Corporation" },
      { symbol: "META", name: "Meta Platforms, Inc." },
      { symbol: "NFLX", name: "Netflix, Inc." },
    ]

    return mockResults
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 5)
  }
}

export const stockAPI = StockAPI.getInstance()
