import { randomUUID } from 'node:crypto'
import { getDb } from '../db'
import { EnvVar } from '../types'

const KEY_RE = /^[A-Z_][A-Z0-9_]*$/i

export class EnvVarService {
  list(projectId: string): EnvVar[] {
    const db = getDb()
    return db.prepare('SELECT * FROM env_vars WHERE project_id = ? ORDER BY key').all(projectId) as EnvVar[]
  }

  get(projectId: string, key: string): EnvVar | null {
    const db = getDb()
    return db.prepare('SELECT * FROM env_vars WHERE project_id = ? AND key = ?').get(projectId, key) as EnvVar | null
  }

  create(projectId: string, input: { key: string; value: string; is_secret?: boolean; scope?: 'development' | 'build' | 'runtime' }): EnvVar {
    if (!KEY_RE.test(input.key)) {
      throw new Error(`Invalid environment variable name: ${input.key}. Must match [A-Z0-9_]`)
    }
    const db = getDb()
    const id = randomUUID()
    const now = Date.now()
    const record: EnvVar = {
      id,
      project_id: projectId,
      key: input.key,
      value: input.value,
      is_secret: input.is_secret ?? false,
      scope: input.scope || 'build',
      created_at: now,
      updated_at: now,
    }
    db.prepare(`
      INSERT INTO env_vars (id, project_id, key, value, is_secret, scope, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, projectId, input.key, input.value, record.is_secret ? 1 : 0, record.scope, now, now)
    return record
  }

  update(projectId: string, key: string, input: Partial<{ value: string; is_secret: boolean; scope: 'development' | 'build' | 'runtime' }>): EnvVar | null {
    const db = getDb()
    const existing = this.get(projectId, key)
    if (!existing) return null
    const fields: string[] = []
    const values: any[] = []
    if (input.value !== undefined) { fields.push('value = ?'); values.push(input.value) }
    if (input.is_secret !== undefined) { fields.push('is_secret = ?'); values.push(input.is_secret ? 1 : 0) }
    if (input.scope !== undefined) { fields.push('scope = ?'); values.push(input.scope) }
    if (fields.length === 0) return existing
    fields.push('updated_at = ?')
    values.push(Date.now())
    values.push(projectId)
    values.push(key)
    db.prepare(`UPDATE env_vars SET ${fields.join(', ')} WHERE project_id = ? AND key = ?`).run(...values)
    return this.get(projectId, key)
  }

  delete(projectId: string, key: string): boolean {
    const db = getDb()
    const result = db.prepare('DELETE FROM env_vars WHERE project_id = ? AND key = ?').run(projectId, key)
    return result.changes > 0
  }

  maskedList(projectId: string): Array<Omit<EnvVar, 'value'> & { masked_value: string }> {
    return this.list(projectId).map((v) => ({
      ...v,
      masked_value: v.is_secret ? '••••••••' : v.value,
    }))
  }
}