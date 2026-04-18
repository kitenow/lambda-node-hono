import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface IndexData {
    name: string
    symbol: string
    price: number
    change: number
    changePercent: number
    marketState: string
    currency: string
}

interface FearAndGreed {
    value: string
    classification: string
    timestamp: string
}

interface InvestData {
    indices: IndexData[]
    fearAndGreed: FearAndGreed
}

export default function Invest() {
    const [data, setData] = useState<InvestData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const result = await api.get<InvestData>('/invest')
                setData(result)
                setError(null)
            } catch (err: any) {
                console.error('Failed to fetch invest data:', err)
                setError('Failed to load investment data. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        const interval = setInterval(fetchData, 60000) // Refresh every minute
        return () => clearInterval(interval)
    }, [])

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                {error}
            </div>
        )
    }

    const formatValue = (val: number, name: string) => {
        if (name === 'Bitcoin') return val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
        if (name === '10Y Treasury') return val.toFixed(3)
        return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const isKoreanStock = (name: string) => name === 'KOSPI'

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Investment</h1>
                <p className="text-gray-500 text-sm">Real-time market indices and global economic indicators</p>
            </div>

            {data?.fearAndGreed && (
                <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Fear & Greed Index</h2>
                        <span className="text-xs text-gray-400">Source: Alternative.me (Crypto)</span>
                    </div>
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <div>
                                <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                                    parseInt(data.fearAndGreed.value) < 25 ? 'text-red-600 bg-red-100' :
                                    parseInt(data.fearAndGreed.value) < 45 ? 'text-orange-600 bg-orange-100' :
                                    parseInt(data.fearAndGreed.value) < 55 ? 'text-yellow-600 bg-yellow-100' :
                                    parseInt(data.fearAndGreed.value) < 75 ? 'text-green-600 bg-green-100' :
                                    'text-emerald-600 bg-emerald-100'
                                }`}>
                                    {data.fearAndGreed.classification}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold inline-block text-indigo-600">
                                    {data.fearAndGreed.value} / 100
                                </span>
                            </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                            <div style={{ width: `${data.fearAndGreed.value}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                parseInt(data.fearAndGreed.value) < 25 ? 'bg-red-500' :
                                parseInt(data.fearAndGreed.value) < 45 ? 'bg-orange-500' :
                                parseInt(data.fearAndGreed.value) < 55 ? 'bg-yellow-500' :
                                parseInt(data.fearAndGreed.value) < 75 ? 'bg-green-500' :
                                'bg-emerald-500'
                            }`}></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data?.indices.map((index) => {
                    const isUp = index.change >= 0
                    const colorClass = isKoreanStock(index.name)
                        ? (isUp ? 'text-red-600' : 'text-blue-600')
                        : (isUp ? 'text-green-600' : 'text-red-600')
                    const bgColorClass = isKoreanStock(index.name)
                        ? (isUp ? 'bg-red-50' : 'bg-blue-50')
                        : (isUp ? 'bg-green-50' : 'bg-red-50')

                    return (
                        <div key={index.symbol} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-medium text-gray-500">{index.name}</h3>
                                <div className={`px-2 py-0.5 rounded-lg text-xs font-bold ${bgColorClass} ${colorClass}`}>
                                    {isUp ? '▲' : '▼'} {Math.abs(index.changePercent).toFixed(2)}%
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <p className="text-xl font-bold text-gray-900">{formatValue(index.price, index.name)}</p>
                                <span className="text-[10px] text-gray-400 font-medium">{index.currency}</span>
                            </div>
                            <div className={`text-xs mt-1 ${colorClass}`}>
                                {isUp ? '+' : ''}{index.change.toFixed(2)}
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                    index.marketState === 'REGULAR' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {index.marketState}
                                </span>
                                <span className="text-[10px] text-gray-400">1m ago</span>
                            </div>
                        </div>
                    )
                })}
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
