/**
 * hooks/useUsers.ts
 * /users 엔드포인트 관련 API 로직을 캡슐화한 훅.
 */

import { useState, useEffect, useCallback } from 'react'
import type { User } from '../types'
import { api } from '../lib/api'

export function useUsers() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await api.get<{ users: User[] }>('/users')
            setUsers(data.users)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const createUser = useCallback(async (name: string, email: string) => {
        await api.post('/users', { name, email })
        await fetchUsers()
    }, [fetchUsers])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    return { users, loading, error, createUser, refetch: fetchUsers }
}
