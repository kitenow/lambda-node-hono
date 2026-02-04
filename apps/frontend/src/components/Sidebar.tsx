import { NavLink, useNavigate } from 'react-router-dom'

export default function Sidebar() {
    const navigate = useNavigate()
    const userJson = localStorage.getItem('user')
    const currentUser = userJson ? JSON.parse(userJson) : null

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    const navItems = [
        { name: 'Home', path: '/', icon: '🏠' },
        { name: 'Invest', path: '/invest', icon: '📈' },
        { name: 'Snippet', path: '/snippet', icon: '💻' },
        { name: 'Me', path: '/me', icon: '👤' },
    ]

    return (
        <div className="w-64 bg-white h-screen shadow-lg flex flex-col">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-indigo-600">My App</h1>
                <p className="text-xs text-gray-400 mt-1">Workspace</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                isActive
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`
                        }
                    >
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {currentUser?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full mt-2 flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}
