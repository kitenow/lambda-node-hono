/** 런타임에 모듈이 비어있지 않도록 더미 상수 추가 */
export const TYPE_MODULE_LOADED = true

// ─── Auth & User ───────────────────────────────────────────────
export interface User {
    id: string
    name: string
    email: string
}

// ─── Snippets ──────────────────────────────────────────────────
export interface Snippet {
    id: string
    title: string
    code: string
    language: string
    createdAt: string
}

// ─── Bookmarks ─────────────────────────────────────────────────
export interface Bookmark {
    id: string
    title: string
    url: string
}

// ─── Todos ─────────────────────────────────────────────────────
export interface Todo {
    id: string
    task: string
    completed: boolean
    createdAt?: string
}
