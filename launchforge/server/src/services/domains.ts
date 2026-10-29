import { randomUUID } from 'node:crypto'
import { getDb } from '../db'
import { Domain } from '../types'

const DOMAIN_RE = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

export class DomainService {
  list(projectId: string): Domain[] {
    const db = getDb()
    return db.prepare('SELECT * FROM domains WHERE project_id = ? ORDER BY created_at').all(projectId) as Domain[]
  }

  create(projectId: string, input: { name: string; is_primary?: boolean }): Domain {
    if (!DOMAIN_RE.test(input.name)) {
      throw new Error(`Invalid domain: ${input.name}`)
    }
    const db = getDb()
    const id = randomUUID()
    const now = Date.now()
    db.prepare(`
      INSERT INTO domains (id, project_id, name, is_primary, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, projectId, input.name, input.is_primary ? 1 : 0, now, now)
    return { id, project_id: projectId, name: input.name, is_primary: input.is_primary ?? false, created_at: now, updated_at: now }
  }

  delete(projectId: string, name: string): boolean {
    const db = getDb()
    const result = db.prepare('DELETE FROM domains WHERE project_id = ? AND name = ?').run(projectId, name)
    return result.changes > 0
  }
}