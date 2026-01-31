import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return setError('Invalid token')
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Reset failed')

            setMessage('Password updated! Redirecting to login...')
            setTimeout(() => navigate('/login'), 2000)
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">New Password</h1>
                        <p className="text-gray-400 text-sm mt-1 text-center">Please set a strong password</p>
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

                        {!token ? (
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-500 text-sm text-center font-medium">
                                Invalid or missing reset token.
                            </div>
                        ) : (
                            <div className="login-input-container">
                                <svg className="w-5 h-5 login-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    type="password"
                                    required
                                    className="login-input"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="btn-signin shadow-lg shadow-blue-500/30"
                        >
                            {loading ? 'Resetting...' : 'Reset password'}
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
