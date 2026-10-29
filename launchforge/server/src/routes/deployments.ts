import { Router } from 'express'
import { getDb } from '../db'
import { BuildService } from '../services/build'
import { ProjectService } from '../services/projects'
import { z } from 'zod'

const router = Router()
const projectService = new ProjectService()
const buildService = new BuildService()

const DeploySchema = z.object({
  buildCommand: z.string().nullable().optional(),
  installCommand: z.string().nullable().optional(),
  outputDir: z.string().nullable().optional(),
  rootDir: z.string().optional(),
})

router.get('/', (req, res) => {
  const projectId = typeof req.query.project_id === 'string' ? req.query.project_id : undefined
  const db = getDb()
  const rows = projectId
    ? db.prepare('SELECT * FROM deployments WHERE project_id = ? ORDER BY created_at DESC').all(projectId)
    : db.prepare('SELECT * FROM deployments ORDER BY created_at DESC LIMIT 100').all()
  res.json({ deployments: rows })
})

router.get('/:id', (req, res) => {
  const db = getDb()
  const row = db.prepare('SELECT * FROM deployments WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Deployment not found' })
  res.json({ deployment: row })
})

router.post('/:projectId/deploy', async (req, res) => {
  const project = projectService.get(req.params.projectId)
  if (!project) return res.status(404).json({ error: 'Project not found' })
  const parsed = DeploySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues })
  try {
    const result = await buildService.build(project, parsed.data)
    res.status(201).json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router