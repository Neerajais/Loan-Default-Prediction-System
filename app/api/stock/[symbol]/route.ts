import { type NextRequest, NextResponse } from "next/server"

const ALPHA_VANTAGE_API_KEY = "U45UN27R15DBONFW"
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

// Enhanced cache with longer duration
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

// Generate realistic mock data as fallback
function generateMockStockData(symbol: string) {
  const basePrice = Math.random() * 200 + 50
  const change = (Math.random() - 0.5) * 10
  const changePercent = (change / basePrice) * 100

  // Generate historical data
  const historicalData = []
  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const price = basePrice + (Math.random() - 0.5) * 20
    historicalData.push({
      date: date.toISOString().split("T")[0],
      open: Number((price * 0.99).toFixed(2)),
      high: Number((price * 1.02).toFixed(2)),
      low: Number((price * 0.98).toFixed(2)),
      close: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
    })
  }

  const companyNames: Record<string, string> = {
    AAPL: "Apple Inc.",
    GOOGL: "Alphabet Inc.",
    MSFT: "Microsoft Corporation",
    TSLA: "Tesla, Inc.",
    AMZN: "Amazon.com, Inc.",
    NVDA: "NVIDIA Corporation",
    META: "Meta Platforms, Inc.",
    NFLX: "Netflix, Inc.",
    HDFC: "HDFC Bank Limited",
  }

  return {
    symbol,
    currentPrice: Number(basePrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 50000000) + 5000000,
    previousClose: Number((basePrice - change).toFixed(2)),
    lastUpdated: new Date().toISOString().split("T")[0],
    historicalData,
    companyInfo: {
      name: companyNames[symbol] || `${symbol} Corporation`,
      sector: "Technology",
      industry: "Software",
      marketCap: `$${(Math.random() * 2000 + 100).toFixed(0)}B`,
      peRatio: (Math.random() * 30 + 10).toFixed(2),
      dividendYield: (Math.random() * 5).toFixed(2),
      description: `${companyNames[symbol] || symbol} is a leading company in its sector.`,
      employees: `${(Math.random() * 500 + 50).toFixed(0)}K`,
    },
    dataSource: "mock_data",
    cached: false,
    note: "Using demo data - API limit reached or service unavailable",
  }
}

export async function GET(request: NextRequest, { params }: { params: { symbol: string } }) {
  try {
    const symbol = params.symbol.toUpperCase()
    const cacheKey = `stock_${symbol}`

    // Check cache first
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      return NextResponse.json({ ...cachedData, cached: true })
    }

    // Validate symbol format
    if (!/^[A-Z]{1,5}(\.[A-Z]{1,3})?$/.test(symbol)) {
      return NextResponse.json(
        {
          error: "INVALID_SYMBOL",
          message: "Invalid stock symbol format",
          symbol,
        },
        { status: 400 },
      )
    }

    try {
      console.log(`Fetching data for ${symbol} from Alpha Vantage...`)

      // Try to get real data from Alpha Vantage
      const quoteResponse = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
      )

      const quoteData = await quoteResponse.json()
      console.log("Alpha Vantage response:", JSON.stringify(quoteData, null, 2))

      // Check for API limit or errors
      if (quoteData.Note || quoteData["Error Message"] || !quoteData["Global Quote"]) {
        console.log("API limit reached or error, using mock data")
        const mockData = generateMockStockData(symbol)
        setCachedData(cacheKey, mockData)
        return NextResponse.json(mockData)
      }

      const quote = quoteData["Global Quote"]

      // Validate we have real data
      if (!quote["05. price"] || isNaN(Number.parseFloat(quote["05. price"]))) {
        console.log("Invalid price data, using mock data")
        const mockData = generateMockStockData(symbol)
        setCachedData(cacheKey, mockData)
        return NextResponse.json(mockData)
      }

      // Get time series data
      const timeSeriesResponse = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
      )

      const timeSeriesData = await timeSeriesResponse.json()
      const timeSeries = timeSeriesData["Time Series (Daily)"] || {}

      // Process historical data
      const dates = Object.keys(timeSeries).slice(0, 100).reverse()
      const historicalData =
        dates.length > 0
          ? dates.map((date) => ({
              date,
              open: Number.parseFloat(timeSeries[date]["1. open"]),
              high: Number.parseFloat(timeSeries[date]["2. high"]),
              low: Number.parseFloat(timeSeries[date]["3. low"]),
              close: Number.parseFloat(timeSeries[date]["4. close"]),
              volume: Number.parseInt(timeSeries[date]["5. volume"]) || 0,
            }))
          : generateMockStockData(symbol).historicalData

      // Get company overview
      const overviewResponse = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
      )

      const overview = await overviewResponse.json()

      const response = {
        symbol,
        currentPrice: Number.parseFloat(quote["05. price"]),
        change: Number.parseFloat(quote["09. change"]),
        changePercent: Number.parseFloat(quote["10. change percent"]?.replace("%", "") || "0"),
        volume: Number.parseInt(quote["06. volume"]) || 0,
        previousClose: Number.parseFloat(quote["08. previous close"]) || 0,
        lastUpdated: quote["07. latest trading day"] || new Date().toISOString().split("T")[0],
        historicalData,
        companyInfo: {
          name: overview.Name || `${symbol} Corporation`,
          sector: overview.Sector || "Technology",
          industry: overview.Industry || "Software",
          marketCap: overview.MarketCapitalization || "N/A",
          peRatio: overview.PERatio || "N/A",
          dividendYield: overview.DividendYield || "0",
          description: overview.Description || "No description available",
          employees: overview.FullTimeEmployees || "N/A",
        },
        dataSource: "alpha_vantage",
        cached: false,
      }

      setCachedData(cacheKey, response)
      return NextResponse.json(response)
    } catch (error: any) {
      console.error("API Error:", error)
      // Return mock data on any error
      const mockData = generateMockStockData(symbol)
      setCachedData(cacheKey, mockData)
      return NextResponse.json(mockData)
    }
  } catch (error) {
    console.error("Server Error:", error)
    // Final fallback - return mock data
    const mockData = generateMockStockData(params.symbol.toUpperCase())
    return NextResponse.json(mockData)
  }
}
