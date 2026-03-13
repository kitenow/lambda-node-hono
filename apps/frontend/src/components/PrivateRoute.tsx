/**
 * components/PrivateRoute.tsx
 * 인증이 필요한 라우트를 보호하는 컴포넌트.
 * 세션 유효성 검증 후 실패 시 /login으로 리다이렉트합니다.
 */

import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface PrivateRouteProps {
    children: React.ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
    const [authorized, setAuthorized] = useState<boolean | null>(null)
    const { verifySession } = useAuth()

    useEffect(() => {
        verifySession().then(setAuthorized)
    }, [verifySession])

    if (authorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        )
    }

    return authorized ? <>{children}</> : <Navigate to="/login" replace />
}
