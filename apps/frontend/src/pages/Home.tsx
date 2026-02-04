import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/users`, {
        credentials: 'include'
      })
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return

    try {
      await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
        credentials: 'include',
      })
      setName('')
      setEmail('')
      fetchUsers()
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-500 text-sm">Manage your team members and their roles</p>
            </div>
            <div className="bg-indigo-50 px-4 py-2 rounded-lg">
              <span className="text-indigo-600 font-semibold">{users.length} Users</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-xl mb-8">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
            >
              Add User
            </button>
          </form>

          <div className="overflow-x-auto">
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
        </div>
      </div>
    </div>
  )
}
