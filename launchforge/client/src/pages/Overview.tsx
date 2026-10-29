import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'
import { Plus, Folder, Rocket, Activity, TrendingUp, Clock } from 'lucide-react'
import { statusBadge, formatDate, formatDuration } from '../lib/utils'

export default function Overview() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics'),
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects'),
  })

  const projects = projectsData?.projects || []
  const a = analytics

  if (isLoading) {
    return <div className="text-[var(--text-dim)]">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Overview</h2>
          <p className="text-[var(--text-dim)] text-sm">Your deployment activity</p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 bg-forge-600 hover:bg-forge-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} />
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-dim)] text-sm">Projects</span>
            <Folder size={18} className="text-forge-400" />
          </div>
          <div className="text-3xl font-bold mt-2">{a?.total_projects ?? 0}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-dim)] text-sm">Deployments</span>
            <Rocket size={18} className="text-blue-400" />
          </div>
          <div className="text-3xl font-bold mt-2">{a?.total_deployments ?? 0}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-dim)] text-sm">Success Rate</span>
            <TrendingUp size={18} className="text-green-400" />
          </div>
          <div className="text-3xl font-bold mt-2">
            {a?.success_rate != null ? `${a.success_rate}%` : '—'}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-dim)] text-sm">Avg Build</span>
            <Clock size={18} className="text-yellow-400" />
          </div>
          <div className="text-3xl font-bold mt-2">
            {a?.avg_build_duration_ms != null ? formatDuration(a.avg_build_duration_ms) : '—'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity size={16} /> Recent Deployments
          </h3>
          {a?.recent_deployments && a.recent_deployments.length > 0 ? (
            <div className="space-y-2">
              {a.recent_deployments.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-2)]">
                  <div>
                    <span className={statusBadge(d.status) + ' text-xs px-2 py-0.5 rounded-full border'}>{d.status}</span>
                    <span className="text-[var(--text-dim)] text-xs ml-2">{formatDate(d.created_at)}</span>
                  </div>
                  <span className="text-[var(--text-dim)] text-xs">
                    {d.duration_ms ? formatDuration(d.duration_ms) : '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--text-dim)]">
              <Activity size={32} className="mx-auto mb-2 opacity-50" />
              <p>No deployments yet</p>
              <p className="text-xs mt-1">Create a project and deploy to see activity</p>
            </div>
          )}
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Recent Projects</h3>
          {projects.length > 0 ? (
            <div className="space-y-2">
              {projects.slice(0, 5).map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`} className="block p-3 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)] transition">
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-[var(--text-dim)] text-xs">{p.framework || 'unknown'}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--text-dim)]">
              <Folder size={32} className="mx-auto mb-2 opacity-50" />
              <p>No projects yet</p>
              <Link to="/projects/new" className="text-forge-400 text-xs hover:underline">Create one →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}