import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'

export default function Home() {
  const { users, loading, createUser } = useUsers()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return
    await createUser(name, email)
    setName('')
    setEmail('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-500 text-sm mt-0.5">Manage your team members and their roles</p>
            </div>
            <div className="self-start sm:self-auto bg-indigo-50 px-4 py-2 rounded-lg">
              <span className="text-indigo-600 font-semibold text-sm">{users.length} Users</span>
            </div>
          </div>

          {/* Add User Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:grid sm:grid-cols-3 gap-3 p-4 md:p-6 bg-gray-50 rounded-xl mb-6 md:mb-8">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-all shadow-sm text-sm"
            >
              Add User
            </button>
          </form>

          {/* User Table — desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Name</th>
                  <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Email</th>
                  <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider text-right">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">Loading users...</td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="py-4 text-gray-600">{user.email}</td>
                      <td className="py-4 text-right">
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {user.id.slice(0, 8)}...
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400 italic">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* User Cards — mobile */}
          <div className="sm:hidden space-y-3">
            {loading ? (
              <p className="py-8 text-center text-gray-500 text-sm">Loading users...</p>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-gray-900 truncate text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <span className="text-xs font-mono text-gray-400 bg-gray-200 px-2 py-1 rounded flex-shrink-0">
                    {user.id.slice(0, 6)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-gray-400 italic text-sm">No users found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
