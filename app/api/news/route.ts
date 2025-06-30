import { NextResponse } from "next/server"

const ALPHA_VANTAGE_API_KEY = "U45UN27R15DBONFW"

export async function GET() {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${ALPHA_VANTAGE_API_KEY}&limit=20`,
    )

    const data = await response.json()

    if (data["Information"]) {
      // API limit reached, return fallback news
      return NextResponse.json({
        articles: [],
        message: "News service temporarily unavailable - API limit reached",
      })
    }

    const articles =
      data.feed?.slice(0, 10).map((article: any) => ({
        id: article.url,
        title: article.title,
        summary: article.summary.substring(0, 200) + "...",
        source: article.source,
        url: article.url,
        publishedAt: article.time_published,
        sentiment: article.overall_sentiment_label?.toLowerCase() || "neutral",
        relevanceScore: Number.parseFloat(article.relevance_score || "0.5"),
      })) || []

    return NextResponse.json({
      articles,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("News API Error:", error)
    return NextResponse.json(
      {
        articles: [],
        error: "Failed to fetch news",
      },
      { status: 500 },
    )
  }
}
