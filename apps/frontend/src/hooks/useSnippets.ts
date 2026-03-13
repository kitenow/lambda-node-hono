/**
 * hooks/useSnippets.ts
 * /snippets 엔드포인트 관련 API 로직을 캡슐화한 훅.
 */

import { useState, useEffect, useCallback } from 'react'
import type { Snippet } from '../types'
import { api } from '../lib/api'

interface CreateSnippetInput {
    title: string
    code: string
    language: string
}

export function useSnippets() {
    const [snippets, setSnippets] = useState<Snippet[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchSnippets = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await api.get<{ snippets: Snippet[] }>('/snippets')
            setSnippets(data.snippets)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const createSnippet = useCallback(async (input: CreateSnippetInput) => {
        await api.post('/snippets', input)
        await fetchSnippets()
    }, [fetchSnippets])

    const deleteSnippet = useCallback(async (id: string) => {
        await api.delete(`/snippets/${id}`)
        await fetchSnippets()
    }, [fetchSnippets])

    useEffect(() => {
        fetchSnippets()
    }, [fetchSnippets])

    return { snippets, loading, error, createSnippet, deleteSnippet, refetch: fetchSnippets }
}
