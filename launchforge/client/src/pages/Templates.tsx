import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useToast } from '../components/ToastProvider'
import { GitFork, Bot, Activity, Layout, FlaskConical, FileText, Image, Gamepad2, Calculator, Mail } from 'lucide-react'

const TEMPLATES = [
  { key: 'contact-form', name: 'Contact Form', description: 'A simple contact form with name, email, and message fields', icon: Mail, framework: 'vite', color: 'from-[#00a3ff] to-[#0066ff]' },
  { key: 'image-editor', name: 'Image Editor', description: 'Crop, resize, and filter images in the browser', icon: Image, framework: 'vite', color: 'from-[#a855f7] to-[#7c3aed]' },
  { key: 'mini-game', name: 'Mini Game', description: 'A browser-based mini game built with HTML5 Canvas', icon: Gamepad2, framework: 'vite', color: 'from-[#ff6b6b] to-[#ee0979]' },
  { key: 'finance-calculator', name: 'Finance Calculator', description: 'EMI, ROI, and compound interest calculator', icon: Calculator, framework: 'vite', color: 'from-[#00ff88] to-[#00a3ff]' },
  { key: 'agent', name: 'Build an agent', description: 'Deploy an agent in a minute on Vercel', icon: Bot, framework: 'vite', color: 'from-[#00a3ff] to-[#0066ff]' },
  { key: 'ticket-router', name: 'Ticket router with Jev', description: 'Route ticket submissions by context using Jev and AI SDK', icon: Activity, framework: 'vite', color: 'from-[#00ff88] to-[#00a3ff]' },
  { key: 'nextjs', name: 'Next.js Boilerplate', description: 'Get started with Next.js and React in seconds', icon: Layout, framework: 'next', color: 'from-white to-[#a3a3a3]' },
  { key: 'flask', name: 'Flask Python Boilerplate', description: 'Deploy Python Flask applications with zero configuration', icon: FlaskConical, framework: 'node', color: 'from-[#ffb020] to-[#ff6b00]' },
  { key: 'empty', name: 'Empty project', description: 'Start from a blank canvas', icon: FileText, framework: 'static', color: 'from-[#222222] to-[#111111]' },
]

export default function Templates() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { addToast } = useToast()

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/projects', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      addToast('Project created from template', 'success')
      navigate('/projects')
    },
    onError: (e: any) => addToast(e.message, 'error'),
  })

  return (
    <div className="page-enter">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">Let's build something new</h2>
        <p className="text-sm text-[#888888] mt-1">Ask v0 to build or enter a Git repository URL…</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {TEMPLATES.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => createMutation.mutate({ name: t.name, framework: t.framework, template: t.key })}
              className="card p-5 text-left hover:border-white transition group"
            >
              <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center mb-4`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">{t.name}</h3>
              <p className="text-xs text-[#888888] leading-relaxed">{t.description}</p>
              <span className="inline-block mt-3 text-xs text-white/60 group-hover:text-white transition">
                Use template →
              </span>
            </button>
          )
        })}
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center">
            <GitFork size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Import from Git Repository</h3>
            <p className="text-xs text-[#888888]">Clone a public GitHub repo and deploy it instantly</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="github.com/owner/repo"
            id="gh-repo-input"
            className="flex-1 bg-[#0a0a0a] border border-[#222222] rounded-md px-3 py-2 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-white transition font-mono"
          />
          <button
            onClick={() => {
              const input = document.getElementById('gh-repo-input') as HTMLInputElement
              const repo = input?.value?.trim()
              if (!repo) { addToast('Enter a GitHub repo URL', 'error'); return }
              addToast('Importing from GitHub...', 'info')
              // TODO: wire api.post('/github', { repo })
              api.post('/github', { repo }).then(() => {
                qc.invalidateQueries({ queryKey: ['projects'] })
                addToast('Imported from GitHub', 'success')
                navigate('/projects')
              }).catch((e: any) => addToast(e.message, 'error'))
            }}
            className="px-4 py-2 text-sm bg-white text-black rounded-md hover:bg-gray-200 transition font-medium"
          >
            Import & Deploy
          </button>
        </div>
      </div>
    </div>
  )
}