import { NextResponse } from "next/server"

const ALPHA_VANTAGE_API_KEY = "U45UN27R15DBONFW"

// Mock market data generator
function generateMockMarketData() {
  return [
    {
      name: "S&P 500",
      symbol: "SPY",
      value: 4200 + Math.random() * 400,
      change: (Math.random() - 0.5) * 50,
      changePercent: (Math.random() - 0.5) * 2,
      volume: Math.floor(Math.random() * 100000000) + 50000000,
      lastUpdated: new Date().toISOString().split("T")[0],
    },
    {
      name: "NASDAQ",
      symbol: "QQQ",
      value: 350 + Math.random() * 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 3,
      volume: Math.floor(Math.random() * 80000000) + 40000000,
      lastUpdated: new Date().toISOString().split("T")[0],
    },
    {
      name: "Dow Jones",
      symbol: "DIA",
      value: 340 + Math.random() * 40,
      change: (Math.random() - 0.5) * 8,
      changePercent: (Math.random() - 0.5) * 1.5,
      volume: Math.floor(Math.random() * 30000000) + 15000000,
      lastUpdated: new Date().toISOString().split("T")[0],
    },
  ]
}

export async function GET() {
  try {
    // Try to get real data first
    const indices = ["SPY", "QQQ", "DIA"]
    const indexNames = ["S&P 500", "NASDAQ", "Dow Jones"]

    const marketData = await Promise.all(
      indices.map(async (symbol, index) => {
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
            { next: { revalidate: 300 } },
          )
          const data = await response.json()
          const quote = data["Global Quote"]

          if (!quote || !quote["05. price"]) {
            throw new Error("No data available")
          }

          return {
            name: indexNames[index],
            symbol,
            value: Number.parseFloat(quote["05. price"]),
            change: Number.parseFloat(quote["09. change"]),
            changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
            volume: Number.parseInt(quote["06. volume"]),
            lastUpdated: quote["07. latest trading day"],
          }
        } catch (error) {
          // Return mock data for this index
          const mockData = generateMockMarketData()[index]
          return {
            ...mockData,
            note: "Demo data - API unavailable",
          }
        }
      }),
    )

    // Market status
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()
    const isMarketOpen = day >= 1 && day <= 5 && hour >= 9 && hour < 16

    return NextResponse.json({
      indices: marketData,
      marketStatus: isMarketOpen ? "OPEN" : "CLOSED",
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Market Overview Error:", error)

    // Return mock data on error
    const mockData = generateMockMarketData()
    return NextResponse.json({
      indices: mockData.map((item) => ({ ...item, note: "Demo data - API unavailable" })),
      marketStatus: "OPEN",
      lastUpdated: new Date().toISOString(),
    })
  }
}
