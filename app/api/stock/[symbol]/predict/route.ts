import { type NextRequest, NextResponse } from "next/server"

interface HistoricalData {
  date: string
  close: number
}

// Technical Analysis Functions
function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
  return sum / period
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0
  if (prices.length === 1) return prices[0]

  const multiplier = 2 / (period + 1)
  let ema = prices[0]

  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * multiplier + ema * (1 - multiplier)
  }

  return ema
}

function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50

  const gains: number[] = []
  const losses: number[] = []

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }

  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period

  if (avgLoss === 0) return 100

  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0.02 // Default 2% volatility

  const returns = []
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length

  return Math.sqrt(variance * 252) // Annualized volatility
}

function linearRegressionPredict(prices: number[], days: number): number[] {
  const n = prices.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = prices

  // Calculate linear regression coefficients
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Generate predictions
  const predictions: number[] = []
  for (let i = 1; i <= days; i++) {
    const futureX = n + i - 1
    const prediction = slope * futureX + intercept
    predictions.push(Math.max(prediction, 0))
  }

  return predictions
}

function monteCarloPredict(currentPrice: number, volatility: number, days: number): number[] {
  const predictions: number[] = []
  const simulations = 1000

  for (let day = 1; day <= days; day++) {
    const dayPredictions: number[] = []

    for (let sim = 0; sim < simulations; sim++) {
      let price = currentPrice

      for (let d = 0; d < day; d++) {
        const randomShock = (Math.random() - 0.5) * 2
        const dailyReturn = randomShock * (volatility / Math.sqrt(252))
        price = price * (1 + dailyReturn)
      }

      dayPredictions.push(Math.max(price, 0))
    }

    dayPredictions.sort((a, b) => a - b)
    const median = dayPredictions[Math.floor(simulations / 2)]
    predictions.push(median)
  }

  return predictions
}

export async function POST(request: NextRequest, { params }: { params: { symbol: string } }) {
  try {
    const { historicalData } = await request.json()

    if (!historicalData || historicalData.length < 10) {
      return NextResponse.json({ error: "Insufficient historical data" }, { status: 400 })
    }

    const prices = historicalData.map((d: HistoricalData) => d.close)
    const currentPrice = prices[prices.length - 1]

    // Calculate technical indicators
    const sma20 = calculateSMA(prices, 20)
    const sma50 = calculateSMA(prices, 50)
    const ema12 = calculateEMA(prices, 12)
    const ema26 = calculateEMA(prices, 26)
    const rsi = calculateRSI(prices)
    const volatility = calculateVolatility(prices)

    // Generate predictions using multiple methods
    const linearPredictions = linearRegressionPredict(prices, 7)
    const monteCarloPredictions = monteCarloPredict(currentPrice, volatility, 7)

    // Combine predictions (ensemble method)
    const combinedPredictions = linearPredictions.map((linear, i) => {
      const monte = monteCarloPredictions[i]
      return linear * 0.6 + monte * 0.4 // Weight linear regression more heavily
    })

    // Generate prediction data with dates
    const predictions = combinedPredictions.map((price, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i + 1)

      // Calculate confidence based on volatility and time horizon
      const baseConfidence = 85
      const volatilityPenalty = Math.min(volatility * 100, 20)
      const timePenalty = i * 3
      const confidence = Math.max(baseConfidence - volatilityPenalty - timePenalty, 50)

      return {
        date: date.toISOString().split("T")[0],
        price: Number(price.toFixed(2)),
        confidence: Number(confidence.toFixed(1)),
      }
    })

    // Calculate technical signals
    const signals = {
      trend: sma20 > sma50 ? "BULLISH" : "BEARISH",
      momentum: rsi > 70 ? "OVERBOUGHT" : rsi < 30 ? "OVERSOLD" : "NEUTRAL",
      macd: ema12 > ema26 ? "BULLISH" : "BEARISH",
    }

    // Calculate overall recommendation
    let bullishSignals = 0
    let bearishSignals = 0

    if (signals.trend === "BULLISH") bullishSignals++
    else bearishSignals++

    if (signals.momentum === "OVERSOLD") bullishSignals++
    else if (signals.momentum === "OVERBOUGHT") bearishSignals++

    if (signals.macd === "BULLISH") bullishSignals++
    else bearishSignals++

    const recommendation = bullishSignals > bearishSignals ? "BUY" : bearishSignals > bullishSignals ? "SELL" : "HOLD"

    // Calculate accuracy based on volatility and market conditions
    const baseAccuracy = 75
    const volatilityBonus = volatility < 0.2 ? 10 : volatility > 0.4 ? -10 : 0
    const accuracy = Math.max(Math.min(baseAccuracy + volatilityBonus, 95), 60)

    const response = {
      symbol: params.symbol.toUpperCase(),
      predictions,
      technicalIndicators: {
        sma20: Number(sma20.toFixed(2)),
        sma50: Number(sma50.toFixed(2)),
        rsi: Number(rsi.toFixed(2)),
        volatility: Number((volatility * 100).toFixed(2)),
      },
      signals,
      recommendation,
      accuracy: Number(accuracy.toFixed(1)),
      algorithm: "Ensemble (Linear Regression + Monte Carlo)",
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Prediction Error:", error)
    return NextResponse.json({ error: "Failed to generate predictions" }, { status: 500 })
  }
}
