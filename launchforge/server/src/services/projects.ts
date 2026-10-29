import { randomUUID } from 'node:crypto'
import { mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { getDb } from '../db'
import { env, paths } from '../config'
import { ArchiveService } from './archive'
import { FRAMEWORK_DEFAULTS, Framework, Project } from '../types'
import { isSafeRelativePath, safeJoin } from '../security'

export interface CreateProjectOptions {
  name: string
  framework?: Framework
  buildCommand?: string
  installCommand?: string
  outputDir?: string
  rootDir?: string
  repoPath?: string
  template?: string
}

export class ProjectService {
  private archive = new ArchiveService()

  async create(options: CreateProjectOptions): Promise<Project> {
    const db = getDb()
    const id = randomUUID()
    const slug = this.slugify(options.name)
    const framework = options.framework || 'unknown'
    const defaults = FRAMEWORK_DEFAULTS[framework]

    const project: Project = {
      id,
      name: options.name,
      slug,
      framework,
      build_command: options.buildCommand ?? defaults.build_command,
      install_command: options.installCommand ?? defaults.install_command,
      output_dir: options.outputDir ?? defaults.output_dir,
      root_dir: options.rootDir ?? '.',
      repo_path: options.repoPath ?? null,
      created_at: Date.now(),
      updated_at: Date.now(),
      settings: {},
    }

    if (options.template) {
      await this.applyTemplate(project, options.template)
    }

    db.prepare(`
      INSERT INTO projects (id, name, slug, framework, build_command, install_command, output_dir, root_dir, repo_path, created_at, updated_at, settings)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      project.id,
      project.name,
      project.slug,
      project.framework,
      project.build_command,
      project.install_command,
      project.output_dir,
      project.root_dir,
      project.repo_path,
      project.created_at,
      project.updated_at,
      JSON.stringify(project.settings)
    )

    return project
  }

  async importFromArchive(buffer: Buffer, options: { name?: string; rootDir?: string; buildCommand?: string; installCommand?: string; outputDir?: string }): Promise<Project> {
    const extracted = await this.archive.importArchive(buffer, {
      name: options.name,
      rootDir: options.rootDir,
    })

    return this.create({
      name: extracted.name,
      framework: options.buildCommand ? 'unknown' : extracted.detectedFramework,
      buildCommand: options.buildCommand,
      installCommand: options.installCommand,
      outputDir: options.outputDir,
      rootDir: extracted.rootDir,
      repoPath: extracted.repoPath,
    })
  }

  list(search?: string): Project[] {
    const db = getDb()
    if (search) {
      return db.prepare('SELECT * FROM projects WHERE name LIKE ? ORDER BY created_at DESC').all(`%${search}%`) as Project[]
    }
    return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as Project[]
  }

  get(id: string): Project | null {
    const db = getDb()
    return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | null
  }

  getBySlug(slug: string): Project | null {
    const db = getDb()
    return db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as Project | null
  }

  update(id: string, updates: Partial<Omit<Project, 'id' | 'created_at'>>): Project | null {
    const db = getDb()
    const existing = this.get(id)
    if (!existing) return null

    const fields: string[] = []
    const values: any[] = []
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) continue
      fields.push(`${key} = ?`)
      values.push(typeof value === 'object' ? JSON.stringify(value) : value)
    }
    if (fields.length === 0) return existing
    fields.push('updated_at = ?')
    values.push(Date.now())
    values.push(id)

    db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    return this.get(id)
  }

  delete(id: string): boolean {
    const db = getDb()
    const project = this.get(id)
    if (!project) return false
    if (project.repo_path && existsSync(project.repo_path)) {
      rmSync(project.repo_path, { recursive: true, force: true })
    }
    db.prepare('DELETE FROM projects WHERE id = ?').run(id)
    return true
  }

  private async applyTemplate(project: Project, templateKey: string): Promise<void> {
    const { TemplateService } = await import('./templates')
    const templates = new TemplateService()
    const template = templates.get(templateKey)
    if (!template) throw new Error(`Template not found: ${templateKey}`)
    const targetDir = join(paths.root, 'repos', project.id)
    mkdirSync(targetDir, { recursive: true })
    await template.apply(targetDir)
    project.repo_path = targetDir
    project.framework = template.framework
    project.build_command = template.build_command
    project.install_command = template.install_command
    project.output_dir = template.output_dir
    project.root_dir = '.'
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}