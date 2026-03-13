import { useState } from 'react'
import { useSnippets } from '../hooks/useSnippets'

export default function Snippet() {
    const { snippets, loading, createSnippet, deleteSnippet } = useSnippets()
    const [isAdding, setIsAdding] = useState(false)
    const [title, setTitle] = useState('')
    const [code, setCode] = useState('')
    const [language, setLanguage] = useState('javascript')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !code) return
        await createSnippet({ title, code, language })
        setTitle('')
        setCode('')
        setIsAdding(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this snippet?')) return
        await deleteSnippet(id)
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Code Snippets</h1>
                    <p className="text-gray-500 text-sm">Store and manage your useful code snippets</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                >
                    {isAdding ? 'Cancel' : 'Add Snippet'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-fade-in">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. React Hook for Local Storage"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="python">Python</option>
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                    <option value="sql">SQL</option>
                                    <option value="bash">Bash</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                placeholder="Paste your code here..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Save Snippet
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <p className="text-gray-500">Loading snippets...</p>
                ) : snippets.length > 0 ? (
                    snippets.map((snippet) => (
                        <div key={snippet.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="font-bold text-gray-900">{snippet.title}</h3>
                                    <span className="text-xs text-indigo-600 font-semibold uppercase">{snippet.language}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(snippet.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    🗑️
                                </button>
                            </div>
                            <div className="p-4 flex-1 bg-gray-900">
                                <pre className="text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-48">
                                    <code>{snippet.code}</code>
                                </pre>
                            </div>
                            <div className="p-3 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-xs text-gray-400">
                                    {new Date(snippet.createdAt).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(snippet.code)
                                        alert('Code copied to clipboard!')
                                    }}
                                    className="text-xs text-indigo-600 font-medium hover:underline"
                                >
                                    Copy Code
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 italic">No snippets found. Add your first one!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
