import { useState, useEffect } from 'react'

interface Bookmark {
    id: string
    title: string
    url: string
}

interface Todo {
    id: string
    task: string
    completed: boolean
}

export default function Me() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [todos, setTodos] = useState<Todo[]>([])
    const [newBookmark, setNewBookmark] = useState({ title: '', url: '' })
    const [newTodo, setNewTodo] = useState('')

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const fetchData = async () => {
        try {
            const [bRes, tRes] = await Promise.all([
                fetch(`${API_URL}/me/bookmarks`, { credentials: 'include' }),
                fetch(`${API_URL}/me/todos`, { credentials: 'include' })
            ])
            const bData = await bRes.json()
            const tData = await tRes.json()
            setBookmarks(bData.bookmarks || [])
            setTodos(tData.todos || [])
        } catch (err) {
            console.error(err)
        }
    }

    const addBookmark = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBookmark.title || !newBookmark.url) return
        try {
            await fetch(`${API_URL}/me/bookmarks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBookmark),
                credentials: 'include'
            })
            setNewBookmark({ title: '', url: '' })
            fetchData()
        } catch (err) { console.error(err) }
    }

    const deleteBookmark = async (id: string) => {
        try {
            await fetch(`${API_URL}/me/bookmarks/${id}`, { method: 'DELETE', credentials: 'include' })
            fetchData()
        } catch (err) { console.error(err) }
    }

    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTodo) return
        try {
            await fetch(`${API_URL}/me/todos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: newTodo }),
                credentials: 'include'
            })
            setNewTodo('')
            fetchData()
        } catch (err) { console.error(err) }
    }

    const toggleTodo = async (id: string, completed: boolean) => {
        try {
            await fetch(`${API_URL}/me/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !completed }),
                credentials: 'include'
            })
            fetchData()
        } catch (err) { console.error(err) }
    }

    const deleteTodo = async (id: string) => {
        try {
            await fetch(`${API_URL}/me/todos/${id}`, { method: 'DELETE', credentials: 'include' })
            fetchData()
        } catch (err) { console.error(err) }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Personal Space</h1>
                <p className="text-gray-500 text-sm">Your bookmarks and tasks</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bookmarks Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span>🔖</span> Bookmarks
                    </h2>

                    <form onSubmit={addBookmark} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            placeholder="Title"
                            value={newBookmark.title}
                            onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="URL"
                            value={newBookmark.url}
                            onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                            Add
                        </button>
                    </form>

                    <div className="space-y-3">
                        {bookmarks.map((b) => (
                            <div key={b.id} className="group flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                <a href={b.url} target="_blank" rel="noopener noreferrer" className="flex-1 overflow-hidden">
                                    <p className="font-medium text-gray-900 truncate">{b.title}</p>
                                    <p className="text-xs text-gray-400 truncate">{b.url}</p>
                                </a>
                                <button onClick={() => deleteBookmark(b.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    🗑️
                                </button>
                            </div>
                        ))}
                        {bookmarks.length === 0 && <p className="text-center text-gray-400 py-8 italic text-sm">No bookmarks yet.</p>}
                    </div>
                </div>

                {/* Todo Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span>✅</span> Todo List
                    </h2>

                    <form onSubmit={addTodo} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            placeholder="What needs to be done?"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                            Add
                        </button>
                    </form>

                    <div className="space-y-2">
                        {todos.map((t) => (
                            <div key={t.id} className="group flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="flex items-center gap-3 flex-1">
                                    <input
                                        type="checkbox"
                                        checked={t.completed}
                                        onChange={() => toggleTodo(t.id, t.completed)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className={`text-sm ${t.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                        {t.task}
                                    </span>
                                </div>
                                <button onClick={() => deleteTodo(t.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    🗑️
                                </button>
                            </div>
                        ))}
                        {todos.length === 0 && <p className="text-center text-gray-400 py-8 italic text-sm">No tasks for today.</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}
