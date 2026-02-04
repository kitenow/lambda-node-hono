interface StockData {
    name: string
    value: number
    change: number
    changePercent: number
    history: number[]
}

const mockStocks: StockData[] = [
    {
        name: 'KOSPI',
        value: 2584.55,
        change: 12.34,
        changePercent: 0.48,
        history: [2560, 2570, 2565, 2580, 2575, 2584.55]
    },
    {
        name: 'NASDAQ',
        value: 16274.94,
        change: -45.20,
        changePercent: -0.28,
        history: [16350, 16320, 16300, 16310, 16280, 16274.94]
    }
]

export default function Invest() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Investment</h1>
                <p className="text-gray-500 text-sm">Real-time market indices and your portfolio</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockStocks.map((stock) => (
                    <div key={stock.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{stock.name}</h2>
                                <p className="text-3xl font-bold mt-1">{stock.value.toLocaleString()}</p>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-sm font-bold ${stock.change >= 0 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent)}%
                            </div>
                        </div>

                        {/* Simple Sparkline Mockup */}
                        <div className="h-24 flex items-end gap-1 mb-4">
                            {stock.history.map((val, i) => {
                                const min = Math.min(...stock.history)
                                const max = Math.max(...stock.history)
                                const height = ((val - min) / (max - min)) * 100 || 50
                                return (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-t ${stock.change >= 0 ? 'bg-red-400' : 'bg-blue-400'}`}
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                    ></div>
                                )
                            })}
                        </div>

                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} today</span>
                            <span>Market Open</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Build your portfolio</h3>
                    <p className="text-indigo-200 text-sm max-w-md">
                        Track your investments, analyze performance, and get personalized insights based on your financial goals.
                    </p>
                    <button className="mt-6 bg-white text-indigo-900 px-6 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                        Get Started
                    </button>
                </div>
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full -mr-20 -mt-20 opacity-50"></div>
            </div>
        </div>
    )
}
