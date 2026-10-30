import React, { useState } from 'react'
import { useToast } from './ToastProvider'
import { X, Plus, Globe, Layout, FolderOpen, Code2, Cpu, Settings, User, LogOut, ChevronDown, Activity, Zap, Shield, BarChart3, Terminal, Eye, Copy, Check, ExternalLink, Search, Bell, Command, Trash2, Rocket } from 'lucide-react'

export function NewProjectModal({ open, onClose, onSubmit }: {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; framework: string; repoPath: string }) => void
}) {
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [framework, setFramework] = useState('static')
  const [repoPath, setRepoPath] = useState('')
  const [error, setError] = useState('')

  const frameworks = [
    { value: 'static', label: 'Static HTML', icon: '🌐' },
    { value: 'vite', label: 'Vite + React', icon: '⚡' },
    { value: 'next', label: 'Next.js', icon: '▲' },
    { value: 'node', label: 'Node.js', icon: '🟢' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Project name is required')
      return
    }
    setError('')
    addToast('Project created successfully', 'success')
    onSubmit({ name: name.trim(), framework, repoPath: repoPath.trim() })
    setName('')
    setRepoPath('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0a0a0a] border border-[#222222] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#222222]">
          <h2 className="text-lg font-semibold text-white">New Project</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#1a1a1a] text-[#888888] hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#888888] mb-1.5">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="my-awesome-app"
              className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-white transition"
            />
            {error && <p className="text-xs text-[#ff3b3b] mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#888888] mb-1.5">Framework</label>
            <div className="grid grid-cols-2 gap-2">
              {frameworks.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFramework(f.value)}
                  className={`
                    flex items-center gap-2 p-2.5 rounded-md border text-sm transition
                    ${framework === f.value
                      ? 'bg-white text-black border-white'
                      : 'bg-[#111111] text-[#888888] border-[#222222] hover:border-[#444444] hover:text-white'
                    }
                  `}
                >
                  <span>{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#888888] mb-1.5">Local Repository Path (optional)</label>
            <input
              type="text"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
              placeholder="/path/to/your/project"
              className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-white transition font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-[#111111] text-white border border-[#222222] rounded-md hover:bg-[#1a1a1a] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-white text-black rounded-md hover:bg-gray-200 transition font-medium"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}