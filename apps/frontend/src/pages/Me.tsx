import { useState } from 'react'
import { useMe } from '../hooks/useMe'

export default function Me() {
    const {
        bookmarks, todos,
        addBookmark, deleteBookmark,
        addTodo, toggleTodo, deleteTodo,
    } = useMe()

    const [newBookmark, setNewBookmark] = useState({ title: '', url: '' })
    const [newTodo, setNewTodo] = useState('')

    const handleAddBookmark = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBookmark.title || !newBookmark.url) return
        await addBookmark(newBookmark.title, newBookmark.url)
        setNewBookmark({ title: '', url: '' })
    }

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTodo) return
        await addTodo(newTodo)
        setNewTodo('')
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6 md:mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Personal Space</h1>
                <p className="text-gray-500 text-sm mt-0.5">Your bookmarks and tasks</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {/* Bookmarks */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                        <span>🔖</span> Bookmarks
                    </h2>

                    <form onSubmit={handleAddBookmark} className="flex flex-col sm:flex-row gap-2 mb-4 md:mb-6">
                        <input
                            type="text"
                            placeholder="Title"
                            value={newBookmark.title}
                            onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="URL"
                            value={newBookmark.url}
                            onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                            Add
                        </button>
                    </form>

                    <div className="space-y-2">
                        {bookmarks.map((b) => (
                            <div key={b.id} className="group flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                <a href={b.url} target="_blank" rel="noopener noreferrer" className="flex-1 overflow-hidden mr-2">
                                    <p className="font-medium text-gray-900 truncate text-sm">{b.title}</p>
                                    <p className="text-xs text-gray-400 truncate">{b.url}</p>
                                </a>
                                <button onClick={() => deleteBookmark(b.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1" aria-label="Delete bookmark">
                                    🗑️
                                </button>
                            </div>
                        ))}
                        {bookmarks.length === 0 && (
                            <p className="text-center text-gray-400 py-8 italic text-sm">No bookmarks yet.</p>
                        )}
                    </div>
                </div>

                {/* Todos */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                        <span>✅</span> Todo List
                    </h2>

                    <form onSubmit={handleAddTodo} className="flex gap-2 mb-4 md:mb-6">
                        <input
                            type="text"
                            placeholder="What needs to be done?"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                            Add
                        </button>
                    </form>

                    <div className="space-y-2">
                        {todos.map((t) => (
                            <div key={t.id} className="group flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <input
                                        type="checkbox"
                                        checked={t.completed}
                                        onChange={() => toggleTodo(t.id, t.completed)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0 cursor-pointer"
                                    />
                                    <span className={`text-sm truncate ${t.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                        {t.task}
                                    </span>
                                </div>
                                <button onClick={() => deleteTodo(t.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1 ml-2" aria-label="Delete todo">
                                    🗑️
                                </button>
                            </div>
                        ))}
                        {todos.length === 0 && (
                            <p className="text-center text-gray-400 py-8 italic text-sm">No tasks for today.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
