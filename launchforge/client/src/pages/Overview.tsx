import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'
import { Plus, Folder, Rocket, Activity, TrendingUp, Clock, Eye, Zap, Layout, Code2, FileText, Cpu, FlaskConical, Bot } from 'lucide-react'
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
    return <div className="text-[#888888]">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Overview</h2>
          <p className="text-[#888888] text-sm">Your deployment activity</p>
        </div>
        <Link
          to="/templates"
          className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} />
          Create New
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[#888888] text-sm">Projects</span>
            <Folder size={18} className="text-white" />
          </div>
          <div className="text-3xl font-bold mt-2 text-white">{a?.total_projects ?? 0}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[#888888] text-sm">Deployments</span>
            <Rocket size={18} className="text-[#00a3ff]" />
          </div>
          <div className="text-3xl font-bold mt-2 text-white">{a?.total_deployments ?? 0}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[#888888] text-sm">Success Rate</span>
            <TrendingUp size={18} className="text-[#00ff88]" />
          </div>
          <div className="text-3xl font-bold mt-2 text-white">
            {a?.success_rate != null ? `${a.success_rate}%` : '—'}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[#888888] text-sm">Avg Build</span>
            <Clock size={18} className="text-[#ffb020]" />
          </div>
          <div className="text-3xl font-bold mt-2 text-white">
            {a?.avg_build_duration_ms != null ? formatDuration(a.avg_build_duration_ms) : '—'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
            <Activity size={16} /> Recent Deployments
          </h3>
          {a?.recent_deployments && a.recent_deployments.length > 0 ? (
            <div className="space-y-2">
              {a.recent_deployments.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-[#111111]">
                  <div>
                    <span className={statusBadge(d.status) + ' text-xs px-2 py-0.5 rounded-full border'}>{d.status}</span>
                    <span className="text-[#888888] text-xs ml-2">{formatDate(d.created_at)}</span>
                  </div>
                  <span className="text-[#888888] text-xs">
                    {d.duration_ms ? formatDuration(d.duration_ms) : '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#888888]">
              <Activity size={32} className="mx-auto mb-2 opacity-50" />
              <p>No deployments yet</p>
              <p className="text-xs mt-1">Create a project and deploy to see activity</p>
            </div>
          )}
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-4 text-white">Projects</h3>
          {projects.length > 0 ? (
            <div className="space-y-2">
              {projects.slice(0, 5).map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`} className="block p-3 rounded-lg bg-[#111111] hover:bg-[#222222] transition">
                  <div className="font-medium text-sm text-white">{p.name}</div>
                  <div className="text-[#888888] text-xs">{p.framework || 'unknown'}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#888888]">
              <Folder size={32} className="mx-auto mb-2 opacity-50" />
              <p>No projects yet</p>
              <Link to="/templates" className="text-white text-xs hover:underline">Create one →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}