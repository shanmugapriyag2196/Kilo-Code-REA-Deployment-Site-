import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2, Folder, Rocket, Layout, Eye, Copy, Check, ExternalLink, Settings, Globe, FileText, Terminal, AlertTriangle } from 'lucide-react'
import { useToast } from '../components/ToastProvider'
import { ProjectCard } from '../components/ProjectCard'
import { NewProjectModal } from '../components/NewProjectModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Header } from '../components/Header'

export default function Projects() {
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { addToast } = useToast()
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['projects', search],
    queryFn: () => api.get('/projects' + (search ? '?search=' + encodeURIComponent(search) : '')),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/projects', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      addToast('Project created', 'success')
    },
    onError: (e: any) => addToast(e.message, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete('/projects/' + id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      addToast('Project deleted', 'success')
    },
    onError: (e: any) => addToast(e.message, 'error'),
  })

  const deployMutation = useMutation({
    mutationFn: (id: string) => api.post('/deployments/' + id + '/deploy', {}),
    onSuccess: (r: any) => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      addToast('Deployment ' + r.status, r.status === 'ready' ? 'success' : 'error')
    },
    onError: (e: any) => addToast(e.message, 'error'),
  })

  const projects = data?.projects || []

  return (
    <div className="page-enter">
      <Header onNewProject={() => setShowNew(true)} onSearch={setSearch} searchQuery={search} />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Projects</h1>
            <p className="text-sm text-[#888888] mt-0.5">{projects.length} projects</p>
          </div>
        </div>

        {isLoading && <div className="text-[#555555] text-sm py-12 text-center">Loading projects...</div>}

        {!isLoading && projects.length === 0 && (
          <div className="card p-12 text-center border-dashed">
            <Folder size={40} className="mx-auto text-[#333333] mb-3" />
            <h3 className="text-white font-medium mb-1">No projects yet</h3>
            <p className="text-sm text-[#555555] mb-4">Create your first project to get started</p>
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-white text-black rounded-md hover:bg-gray-200 transition font-medium"
            >
              <Plus size={14} /> New Project
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((p: any) => (
            <ProjectCard
              key={p.id}
              project={p}
              onDeploy={deployMutation.mutate}
              onOpen={(id) => navigate('/projects/' + id)}
              onDelete={setDeleteId}
              onOpenSettings={(id) => navigate('/projects/' + id + '/settings')}
            />
          ))}
        </div>
      </div>

      <NewProjectModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onSubmit={(data) => createMutation.mutate(data)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete project"
        message="This will permanently delete the project and all its deployments. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
        variant="danger"
      />
    </div>
  )
}