import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        try { // Added try block
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Signup failed')

            setSuccess(true)
            setTimeout(() => {
                navigate('/login')
            }, 2000)
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
                        <p className="text-gray-400 text-sm mt-1">Join us today!</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-500 text-xs text-center font-medium">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-green-600 text-xs text-center font-medium">
                                Registration successful! Redirecting to login...
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="login-input-container">
                                <svg className="w-5 h-5 login-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <input
                                    type="text"
                                    required
                                    className="login-input"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="login-input-container">
                                <svg className="w-5 h-5 login-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <input
                                    type="email"
                                    required
                                    className="login-input"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="login-input-container">
                                <svg className="w-5 h-5 login-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    type="password"
                                    required
                                    className="login-input"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-signin shadow-lg shadow-blue-500/30 mt-2"
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-blue-500 hover:text-blue-600 font-bold transition-colors ml-1"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
