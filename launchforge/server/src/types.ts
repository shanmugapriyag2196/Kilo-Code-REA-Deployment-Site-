export interface Project {
  id: string
  name: string
  slug: string | null
  framework: string | null
  build_command: string | null
  install_command: string | null
  output_dir: string | null
  root_dir: string | null
  repo_path: string | null
  created_at: number
  updated_at: number
  settings: Record<string, unknown>
}

export interface Deployment {
  id: string
  project_id: string
  status: 'queued' | 'building' | 'ready' | 'failed' | 'canceled'
  build_command: string | null
  output_dir: string | null
  source: string | null
  logs: string
  exit_code: number | null
  duration_ms: number | null
  created_at: number
  updated_at: number
  preview_path: string | null
}

export interface EnvVar {
  id: string
  project_id: string
  key: string
  value: string
  is_secret: boolean
  scope: 'development' | 'build' | 'runtime'
  created_at: number
  updated_at: number
}

export interface Domain {
  id: string
  project_id: string
  name: string
  is_primary: boolean
  created_at: number
  updated_at: number
}

export interface Settings {
  [key: string]: string
}

export type Framework =
  | 'static'
  | 'vite'
  | 'next'
  | 'react'
  | 'preact'
  | 'svelte'
  | 'astro'
  | 'node'
  | 'unknown'

export const FRAMEWORK_DEFAULTS: Record<Framework, { build_command: string | null; install_command: string | null; output_dir: string }> = {
  static: { build_command: null, install_command: null, output_dir: 'public' },
  vite: { build_command: 'npm run build', install_command: 'npm install', output_dir: 'dist' },
  next: { build_command: 'npm run build', install_command: 'npm install', output_dir: 'out' },
  react: { build_command: 'npm run build', install_command: 'npm install', output_dir: 'dist' },
  preact: { build_command: 'npm run build', install_command: 'npm install', output_dir: 'build' },
  svelte: { build_command: 'npm run build', install_command: 'npm install', output_dir: 'build' },
  astro: { build_command: 'npm run build', install_command: 'npm install', output_dir: 'dist' },
  node: { build_command: null, install_command: 'npm install', output_dir: '.' },
  unknown: { build_command: null, install_command: null, output_dir: '.' },
}
