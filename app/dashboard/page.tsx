import { Suspense } from "react"
import WatchlistManager from "@/components/watchlist-manager"
import PortfolioOverview from "@/components/portfolio-overview"
import MarketNews from "@/components/market-news"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Dashboard</h1>
          <p className="text-gray-600">Monitor your portfolio and market trends</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<div className="h-64 bg-white rounded-lg animate-pulse" />}>
              <PortfolioOverview />
            </Suspense>

            <Suspense fallback={<div className="h-96 bg-white rounded-lg animate-pulse" />}>
              <WatchlistManager />
            </Suspense>
          </div>

          <div>
            <Suspense fallback={<div className="h-full bg-white rounded-lg animate-pulse" />}>
              <MarketNews />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
