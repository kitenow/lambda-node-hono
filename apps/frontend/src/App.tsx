import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Layout from './components/Layout'
import Home from './pages/Home'
import Invest from './pages/Invest'
import Snippet from './pages/Snippet'
import Me from './pages/Me'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          localStorage.setItem('user', JSON.stringify(data.user))
          setAuthorized(true)
        } else {
          setAuthorized(false)
        }
      } catch (err) {
        setAuthorized(false)
      }
    }
    checkAuth()
  }, [])

  if (authorized === null) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  return authorized ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="invest" element={<Invest />} />
          <Route path="snippet" element={<Snippet />} />
          <Route path="me" element={<Me />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
