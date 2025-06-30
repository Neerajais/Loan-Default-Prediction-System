import { Suspense } from "react"
import EnhancedRealTimeStockChart from "@/components/enhanced-real-time-stock-chart"
import AIStockPrediction from "@/components/ai-stock-prediction"
import StockInfo from "@/components/stock-info"
import TechnicalIndicators from "@/components/technical-indicators"
import { ErrorBoundary } from "@/components/error-boundary"

interface StockPageProps {
  params: {
    symbol: string
  }
}

export default function StockPage({ params }: StockPageProps) {
  const symbol = params.symbol.toUpperCase()

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{symbol} Stock Analysis</h1>
            <p className="text-gray-600">Real-time data and AI-powered predictions</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ErrorBoundary>
                <EnhancedRealTimeStockChart symbol={symbol} />
              </ErrorBoundary>

              <ErrorBoundary>
                <Suspense fallback={<div className="h-64 bg-white rounded-lg animate-pulse" />}>
                  <AIStockPrediction symbol={symbol} />
                </Suspense>
              </ErrorBoundary>
            </div>

            <div className="space-y-6">
              <ErrorBoundary>
                <Suspense fallback={<div className="h-48 bg-white rounded-lg animate-pulse" />}>
                  <StockInfo symbol={symbol} />
                </Suspense>
              </ErrorBoundary>

              <ErrorBoundary>
                <Suspense fallback={<div className="h-64 bg-white rounded-lg animate-pulse" />}>
                  <TechnicalIndicators symbol={symbol} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
