import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Trash2, Pencil, Folder, Settings, Rocket, FileText, Globe, Layout } from 'lucide-react'
import { statusBadge, formatDate } from '../lib/utils'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Toast } from '../components/Toast'

export default function Projects() {
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', search],
    queryFn: () => api.get(`/projects${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      setToast({ msg: 'Project deleted', type: 'success' })
    },
    onError: (err: any) => setToast({ msg: err.message, type: 'error' }),
  })

  const projects = data?.projects || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-[var(--text-dim)] text-sm">Manage your projects and deployments</p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 bg-forge-600 hover:bg-forge-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} />
          New Project
        </Link>
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-forge-500"
        />
      </div>

      {isLoading && <div className="text-[var(--text-dim)]">Loading projects...</div>}
      {error && <div className="text-red-400 text-sm mb-4">Failed to load projects</div>}

      {!isLoading && projects.length === 0 && (
        <div className="card p-12 text-center">
          <Folder size={48} className="mx-auto mb-3 text-[var(--text-dim)] opacity-50" />
          <h3 className="font-semibold mb-1">No projects yet</h3>
          <p className="text-[var(--text-dim)] text-sm mb-4">Create your first project to get started</p>
          <Link to="/projects/new" className="inline-flex items-center gap-2 bg-forge-600 hover:bg-forge-500 text-white px-4 py-2 rounded-lg text-sm">
            <Plus size={16} /> Create Project
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="card p-4 hover:border-forge-500/50 transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-forge-500/10 flex items-center justify-center">
                  <Folder size={18} className="text-forge-400" />
                </div>
                <div>
                  <Link to={`/projects/${p.id}`} className="font-semibold hover:text-forge-400">{p.name}</Link>
                  <div className="text-xs text-[var(--text-dim)]">{p.framework || 'unknown'}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setDeleteId(p.id)}
                  className="p-1.5 rounded hover:bg-red-500/10 text-[var(--text-dim)] hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="text-xs text-[var(--text-dim)] mb-3">Created {formatDate(p.created_at)}</div>
            <div className="flex gap-2">
              <Link to={`/projects/${p.id}`} className="text-xs px-3 py-1.5 rounded bg-[var(--surface-2)] hover:bg-[var(--border)] transition">
                Open
              </Link>
              <Link to={`/projects/${p.id}/settings`} className="text-xs px-3 py-1.5 rounded bg-[var(--surface-2)] hover:bg-[var(--border)] transition flex items-center gap-1">
                <Settings size={12} /> Settings
              </Link>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete project"
        message="This will permanently delete the project and all its deployments, environment variables, and domains. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}