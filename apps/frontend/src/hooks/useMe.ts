/**
 * hooks/useMe.ts
 * /me 엔드포인트의 북마크 및 투두 관련 API 로직을 캡슐화한 훅.
 */

import { useState, useEffect, useCallback } from 'react'
import type { Bookmark, Todo } from '../types'
import { api } from '../lib/api'

export function useMe() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [todos, setTodos] = useState<Todo[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const [bData, tData] = await Promise.all([
                api.get<{ bookmarks: Bookmark[] }>('/me/bookmarks'),
                api.get<{ todos: Todo[] }>('/me/todos'),
            ])
            setBookmarks(bData.bookmarks)
            setTodos(tData.todos)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    // ─── Bookmarks ──────────────────────────────────────────────
    const addBookmark = useCallback(async (title: string, url: string) => {
        await api.post('/me/bookmarks', { title, url })
        await fetchAll()
    }, [fetchAll])

    const deleteBookmark = useCallback(async (id: string) => {
        await api.delete(`/me/bookmarks/${id}`)
        await fetchAll()
    }, [fetchAll])

    // ─── Todos ──────────────────────────────────────────────────
    const addTodo = useCallback(async (task: string) => {
        await api.post('/me/todos', { task })
        await fetchAll()
    }, [fetchAll])

    const toggleTodo = useCallback(async (id: string, completed: boolean) => {
        await api.put(`/me/todos/${id}`, { completed: !completed })
        await fetchAll()
    }, [fetchAll])

    const deleteTodo = useCallback(async (id: string) => {
        await api.delete(`/me/todos/${id}`)
        await fetchAll()
    }, [fetchAll])

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    return {
        bookmarks,
        todos,
        loading,
        error,
        addBookmark,
        deleteBookmark,
        addTodo,
        toggleTodo,
        deleteTodo,
        refetch: fetchAll,
    }
}
