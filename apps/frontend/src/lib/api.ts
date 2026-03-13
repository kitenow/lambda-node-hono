/**
 * lib/api.ts
 * 모든 API 호출의 기반이 되는 fetch 래퍼.
 * - 공통 헤더(Authorization, Content-Type) 자동 주입
 * - credentials: 'include' 기본 설정 (HttpOnly 쿠키 지원)
 * - 4xx/5xx 응답 시 Error throw
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, headers, ...rest } = options

    const response = await fetch(`${BASE_URL}${path}`, {
        ...rest,
        credentials: 'include',
        headers: {
            ...getAuthHeaders(),
            ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || `Request failed: ${response.status}`)
    }

    return data as T
}

// ─── HTTP method helpers ────────────────────────────────────────
export const api = {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
    put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
