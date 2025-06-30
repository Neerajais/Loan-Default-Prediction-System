import { Suspense } from "react"
import EnhancedStockSearch from "@/components/enhanced-stock-search"
import PopularStocks from "@/components/popular-stocks"
import RealTimeMarketOverview from "@/components/real-time-market-overview"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Stock Prediction Platform</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time stock analysis with AI-powered predictions and live market data
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<div>Loading search...</div>}>
              <EnhancedStockSearch />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<div>Loading market data...</div>}>
              <RealTimeMarketOverview />
            </Suspense>
          </div>
        </div>

        <div className="mt-12">
          <Suspense fallback={<div>Loading popular stocks...</div>}>
            <PopularStocks />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
