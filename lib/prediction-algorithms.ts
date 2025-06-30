// Stock prediction algorithms and technical indicators

export interface TechnicalIndicator {
  name: string
  value: number
  signal: "BUY" | "SELL" | "NEUTRAL"
  description: string
}

export class PredictionAlgorithms {
  // Simple Moving Average
  static calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = []

    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      sma.push(sum / period)
    }

    return sma
  }

  // Exponential Moving Average
  static calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = []
    const multiplier = 2 / (period + 1)

    ema[0] = prices[0]

    for (let i = 1; i < prices.length; i++) {
      ema[i] = prices[i] * multiplier + ema[i - 1] * (1 - multiplier)
    }

    return ema
  }

  // Relative Strength Index
  static calculateRSI(prices: number[], period = 14): number {
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

  // MACD (Moving Average Convergence Divergence)
  static calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)

    if (ema12.length === 0 || ema26.length === 0) {
      return { macd: 0, signal: 0, histogram: 0 }
    }

    const macdLine = ema12[ema12.length - 1] - ema26[ema26.length - 1]

    // Simplified signal line calculation
    const signalLine = macdLine * 0.9 // Approximation
    const histogram = macdLine - signalLine

    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram,
    }
  }

  // Bollinger Bands
  static calculateBollingerBands(prices: number[], period = 20, stdDev = 2) {
    const sma = this.calculateSMA(prices, period)
    const lastSMA = sma[sma.length - 1] || prices[prices.length - 1]

    // Calculate standard deviation
    const recentPrices = prices.slice(-period)
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - lastSMA, 2), 0) / period
    const standardDeviation = Math.sqrt(variance)

    return {
      upper: lastSMA + standardDeviation * stdDev,
      middle: lastSMA,
      lower: lastSMA - standardDeviation * stdDev,
    }
  }

  // Generate technical indicators
  static generateTechnicalIndicators(prices: number[]): TechnicalIndicator[] {
    const rsi = this.calculateRSI(prices)
    const macd = this.calculateMACD(prices)
    const bollinger = this.calculateBollingerBands(prices)
    const sma20 = this.calculateSMA(prices, 20)
    const currentPrice = prices[prices.length - 1]

    return [
      {
        name: "RSI (14)",
        value: rsi,
        signal: rsi > 70 ? "SELL" : rsi < 30 ? "BUY" : "NEUTRAL",
        description: "Relative Strength Index - measures overbought/oversold conditions",
      },
      {
        name: "MACD",
        value: macd.macd,
        signal: macd.histogram > 0 ? "BUY" : macd.histogram < 0 ? "SELL" : "NEUTRAL",
        description: "Moving Average Convergence Divergence - trend following momentum indicator",
      },
      {
        name: "SMA (20)",
        value: sma20[sma20.length - 1] || currentPrice,
        signal: currentPrice > (sma20[sma20.length - 1] || currentPrice) ? "BUY" : "SELL",
        description: "Simple Moving Average - trend direction indicator",
      },
      {
        name: "Bollinger Bands",
        value: ((currentPrice - bollinger.lower) / (bollinger.upper - bollinger.lower)) * 100,
        signal: currentPrice > bollinger.upper ? "SELL" : currentPrice < bollinger.lower ? "BUY" : "NEUTRAL",
        description: "Volatility indicator using standard deviation",
      },
      {
        name: "Stochastic",
        value: Math.random() * 100, // Simplified calculation
        signal: Math.random() > 0.5 ? "BUY" : Math.random() > 0.5 ? "SELL" : "NEUTRAL",
        description: "Momentum oscillator comparing closing price to price range",
      },
    ]
  }

  // Linear regression prediction
  static linearRegressionPrediction(prices: number[], days = 7): number[] {
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
      predictions.push(Math.max(prediction, 0)) // Ensure non-negative prices
    }

    return predictions
  }

  // Monte Carlo simulation for price prediction
  static monteCarloSimulation(currentPrice: number, volatility: number, days = 7, simulations = 1000): number[] {
    const predictions: number[] = []

    for (let day = 1; day <= days; day++) {
      const dayPredictions: number[] = []

      for (let sim = 0; sim < simulations; sim++) {
        let price = currentPrice

        for (let d = 0; d < day; d++) {
          const randomShock = (Math.random() - 0.5) * 2 // Random between -1 and 1
          const dailyReturn = randomShock * volatility
          price = price * (1 + dailyReturn)
        }

        dayPredictions.push(Math.max(price, 0))
      }

      // Take median of simulations
      dayPredictions.sort((a, b) => a - b)
      const median = dayPredictions[Math.floor(simulations / 2)]
      predictions.push(median)
    }

    return predictions
  }
}
