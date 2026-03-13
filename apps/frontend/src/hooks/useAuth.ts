/**
 * hooks/useAuth.ts
 * 인증 상태(token, user)를 localStorage 기반으로 관리하는 훅.
 * localStorage 직접 접근을 모든 컴포넌트에서 제거하고 이 훅으로 통일합니다.
 */

import { useState, useCallback } from 'react'
import type { User } from '../types'
import { api } from '../lib/api'

export function useAuth() {
    const [user, setUser] = useState<User | null>(() => {
        const raw = localStorage.getItem('user')
        return raw ? JSON.parse(raw) : null
    })

    const saveSession = useCallback((token: string, userData: User) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }, [])

    const clearSession = useCallback(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }, [])

    const getToken = useCallback(() => localStorage.getItem('token'), [])

    /** PrivateRoute에서 세션 유효성 검증 시 사용 */
    const verifySession = useCallback(async (): Promise<boolean> => {
        try {
            const data = await api.get<{ user: User }>('/auth/me')
            localStorage.setItem('user', JSON.stringify(data.user))
            setUser(data.user)
            return true
        } catch {
            clearSession()
            return false
        }
    }, [clearSession])

    return { user, saveSession, clearSession, getToken, verifySession }
}
