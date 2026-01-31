import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [token, setToken] = useState('') // For demo display

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Request failed')

            setMessage('If your email is in our system, you will receive a reset link.')
            if (data.resetToken) {
                setToken(data.resetToken) // Demo: show the token
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('/sun_park_bg.png')" }}
        >
            <div className="w-full max-w-md px-6 animate-fade-in flex flex-col items-center">
                <div className="bg-white p-10 rounded-[2rem] w-full shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
                    <div className="flex flex-col items-center mb-10">
                        <div className="bg-blue-50 p-4 rounded-2xl mb-4">
                            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
                        <p className="text-gray-400 text-sm mt-1 text-center">Enter your email and we'll help you out.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-500 text-xs text-center font-medium">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-green-600 text-xs text-center font-medium">
                                {message}
                            </div>
                        )}

                        <div className="login-input-container">
                            <svg className="w-5 h-5 login-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="email"
                                required
                                className="login-input"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {token && (
                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 animate-pulse">
                                <p className="text-[10px] text-blue-400 font-bold mb-2 uppercase tracking-wider">Demo Mode - Reset Token</p>
                                <p className="text-xs font-mono break-all text-blue-900 bg-white/50 p-2 rounded-lg border border-blue-200 shadow-sm">{token}</p>
                                <Link to={`/reset-password?token=${token}`} className="text-sm text-blue-600 hover:text-blue-700 mt-3 block font-bold text-center bg-white py-2 rounded-xl shadow-sm border border-blue-100">
                                    Go to Reset Page →
                                </Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-signin shadow-lg shadow-blue-500/30"
                        >
                            {loading ? 'Sending...' : 'Send reset link'}
                        </button>
                    </form>
                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors">
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
