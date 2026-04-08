import { Hono } from 'hono'
import YahooFinance from 'yahoo-finance2'

const investApp = new Hono()
const yf = new YahooFinance()

interface IndexData {
    name: string
    symbol: string
    price: number | undefined
    change: number | undefined
    changePercent: number | undefined
    marketState: string | undefined
    currency: string | undefined
}

investApp.get('/', async (c) => {
    try {
        const symbols = [
            { symbol: '^IXIC', name: 'Nasdaq' },
            { symbol: '^GSPC', name: 'S&P 500' },
            { symbol: '^KS11', name: 'KOSPI' },
            { symbol: 'GC=F', name: 'Gold' },
            { symbol: 'BTC-USD', name: 'Bitcoin' },
            { symbol: '^VIX', name: 'VIX' },
            { symbol: 'KRW=X', name: 'USD/KRW' },
            { symbol: '^TNX', name: '10Y Treasury' }
        ]

        const quotes = await yf.quote(symbols.map(s => s.symbol))

        // Fetch Fear & Greed Index from alternative.me (common for Crypto but used as a proxy or just informative)
        // CNN Fear & Greed doesn't have a public API, but alternative.me is popular for crypto.
        // For general market Fear & Greed, sometimes we have to scrape or find another source.
        // Let's use alternative.me for now as a placeholder or specifically for crypto fear & greed.
        const fgResponse = await fetch('https://api.alternative.me/fng/')
        const fgData: any = await fgResponse.json()

        const marketData = symbols.map(s => {
            const quote = quotes.find((q: any) => q.symbol === s.symbol || (s.symbol === 'KRW=X' && q.symbol === 'USDKRW=X'))
            return {
                name: s.name,
                symbol: s.symbol,
                price: quote?.regularMarketPrice,
                change: quote?.regularMarketChange,
                changePercent: quote?.regularMarketChangePercent,
                marketState: quote?.marketState,
                currency: quote?.currency
            }
        })

        return c.json({
            indices: marketData,
            fearAndGreed: {
                value: fgData.data?.[0]?.value,
                classification: fgData.data?.[0]?.value_classification,
                timestamp: fgData.data?.[0]?.timestamp
            }
        })
    } catch (error: any) {
        console.error('Error fetching invest data:', error)
        return c.json({ error: 'Failed to fetch financial data', details: error.message }, 500)
    }
})

export default investApp
