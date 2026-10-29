import { join, normalize, extname } from 'node:path'
import { existsSync } from 'node:fs'

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webp': 'image/webp',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

export class PreviewService {
  resolve(deploymentDir: string, pathname: string): { filePath: string; mime: string; status?: number } {
    const normalized = normalize(pathname).replace(/^\//, '')
    if (normalized === '' || normalized === '/') {
      return { filePath: join(deploymentDir, 'index.html'), mime: MIME['.html'] || 'text/html; charset=utf-8' }
    }
    const filePath = join(deploymentDir, normalized)
    const baseResolved = normalize(deploymentDir)
    const fileResolved = normalize(filePath)
    if (!fileResolved.startsWith(baseResolved + '/') && fileResolved !== baseResolved) {
      return { filePath, mime: 'text/plain', status: 403 }
    }
    if (!existsSync(filePath)) {
      const index = join(deploymentDir, 'index.html')
      if (existsSync(index)) {
        return { filePath: index, mime: MIME['.html'] || 'text/html; charset=utf-8' }
      }
      return { filePath, mime: 'text/plain', status: 404 }
    }
    const ext = extname(filePath).toLowerCase()
    return { filePath, mime: MIME[ext] || 'application/octet-stream' }
  }
}