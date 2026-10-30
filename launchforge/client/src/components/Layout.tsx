import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useAuth } from '../lib/auth'
import { Plus } from 'lucide-react'

const nav = [
  { label: 'Overview', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Analytics', to: '/analytics' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col">
        <div className="p-5 border-b border-[var(--border)]">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forge-500 to-forge-700 flex items-center justify-center font-bold">
              L
            </div>
            <span className="font-semibold text-lg">LaunchForge</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'block px-3 py-2 rounded-lg text-sm transition-colors',
                  active ? 'bg-forge-500/10 text-forge-400' : 'text-[var(--text-dim)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-[var(--border)]">
          <div className="px-3 py-2 text-sm text-[var(--text-dim)]">
            <div className="text-[var(--text)] font-medium">{user?.name || 'Local User'}</div>
            <div className="text-xs">Local-only account</div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--text-dim)] hover:bg-[var(--surface-2)]"
          >
            Sign out (local)
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              {nav.find((n) => n.to === location.pathname)?.label || 'LaunchForge'}
            </h1>
            <p className="text-xs text-[var(--text-dim)]">Local deployment platform</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-dim)]">Running on 127.0.0.1 only</span>
            <button
              onClick={() => navigate('/projects/new')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white text-black rounded-md hover:bg-gray-200 transition font-medium"
            >
              <Plus size={14} />
              New
            </button>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}