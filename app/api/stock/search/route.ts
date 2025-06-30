import { type NextRequest, NextResponse } from "next/server"

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "U45UN27R15DBONFW"

// Enhanced mock search results as fallback only
const mockSearchResults = [
  { symbol: "AAPL", name: "Apple Inc.", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "MSFT", name: "Microsoft Corporation", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "TSLA", name: "Tesla, Inc.", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "META", name: "Meta Platforms, Inc.", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "NFLX", name: "Netflix, Inc.", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "HDFC", name: "HDFC Bank Limited", type: "Equity", region: "India", currency: "INR" },
  { symbol: "TCS", name: "Tata Consultancy Services", type: "Equity", region: "India", currency: "INR" },
  { symbol: "RELIANCE", name: "Reliance Industries Limited", type: "Equity", region: "India", currency: "INR" },
  { symbol: "INFY", name: "Infosys Limited", type: "Equity", region: "India", currency: "INR" },
  { symbol: "ICICIBANK", name: "ICICI Bank Limited", type: "Equity", region: "India", currency: "INR" },
  { symbol: "SBIN", name: "State Bank of India", type: "Equity", region: "India", currency: "INR" },
  { symbol: "ITC", name: "ITC Limited", type: "Equity", region: "India", currency: "INR" },
  { symbol: "HDFCBANK", name: "HDFC Bank Limited", type: "Equity", region: "India", currency: "INR" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Limited", type: "Equity", region: "India", currency: "INR" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Limited", type: "Equity", region: "India", currency: "INR" },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter required" }, { status: 400 })
  }

  console.log(`🔍 Searching for: "${query}" using Alpha Vantage API...`)

  try {
    // Try Alpha Vantage Symbol Search API first
    const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`

    console.log(`📡 Fetching from: ${searchUrl}`)

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "StockPredictionApp/1.0",
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`Alpha Vantage API returned ${response.status}`)
    }

    const data = await response.json()
    console.log(`📊 Alpha Vantage response:`, JSON.stringify(data, null, 2))

    // Check for API limit message
    if (data.Note && data.Note.includes("API call frequency")) {
      console.log("⚠️ API rate limit reached, using fallback")
      const results = mockSearchResults
        .filter(
          (stock) =>
            stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
            stock.name.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 8)

      return NextResponse.json({
        results,
        note: "API rate limit reached - showing cached results",
        source: "fallback",
      })
    }

    // Check for valid search results
    if (data.bestMatches && Array.isArray(data.bestMatches) && data.bestMatches.length > 0) {
      console.log(`✅ Found ${data.bestMatches.length} real results from Alpha Vantage`)

      const results = data.bestMatches.slice(0, 10).map((match: any) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"],
        currency: match["8. currency"],
      }))

      return NextResponse.json({
        results,
        source: "alpha_vantage",
        note: "Live data from Alpha Vantage",
      })
    }

    // No results from API, but no error - try fallback
    console.log("⚠️ No results from Alpha Vantage, using fallback search")
    const results = mockSearchResults
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 8)

    return NextResponse.json({
      results,
      note: results.length > 0 ? "No live results found - showing popular stocks" : "No results found",
      source: "fallback",
    })
  } catch (error: any) {
    console.error("❌ Search API Error:", error.message)

    // Return fallback results on any error
    const results = mockSearchResults
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 8)

    return NextResponse.json({
      results,
      note: "Search service temporarily unavailable - showing popular stocks",
      source: "fallback",
      error: "API temporarily unavailable",
    })
  }
}
