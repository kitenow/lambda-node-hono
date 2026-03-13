import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import type { User } from '../types'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { saveSession } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password })
            saveSession(data.token, data.user)
            navigate('/')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
            {/* Animated Background */}
            <div
                className="absolute inset-0 z-0 animate-flyover bg-cover bg-center"
                style={{ backgroundImage: "url('/background-nature-high.png')" }}
            />
            {/* Content Overlay */}
            <div className="relative z-10 w-full max-w-md px-6 animate-fade-in flex flex-col items-center">
                <div className="bg-white p-10 rounded-[2rem] w-full shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
                    <div className="flex flex-col items-center mb-10">
                        <div className="bg-blue-50 p-4 rounded-2xl mb-4">
                            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
                        <p className="text-gray-400 text-sm mt-1">Welcome back, Please login</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-500 text-xs text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="login-input-container">
                                <svg className="w-5 h-5 login-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <input
                                    type="email"
                                    required
                                    className="login-input"
                                    placeholder="User Name"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="login-input-container">
                                <svg className="w-5 h-5 login-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="login-input"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[13px] px-1">
                            <label className="flex items-center text-gray-500 cursor-pointer group">
                                <input type="checkbox" className="mr-2 rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                                <span className="group-hover:text-gray-700 transition-colors">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" disabled={loading} className="btn-signin shadow-lg shadow-blue-500/30">
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-bold transition-colors ml-1">
                                Create New Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
