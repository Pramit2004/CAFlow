import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'
import { corsMiddleware } from './middleware/cors.middleware.js'
import { requestLogger } from './middleware/logger.middleware.js'
import { errorHandler } from './middleware/errorHandler.middleware.js'
import { router } from './routes/index.js'

const app = new Hono()

// ── Global middleware ──────────────────────────────────────────────────────
app.use('*', corsMiddleware)
app.use('*', secureHeaders())
app.use('*', requestLogger)

if (process.env.NODE_ENV !== 'production') {
  app.use('*', prettyJSON())
}

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ── API routes ─────────────────────────────────────────────────────────────
app.route('/api', router)

// ── 404 handler ───────────────────────────────────────────────────────────
app.notFound((c) => c.json({ success: false, error: 'Route not found' }, 404))

// ── Error handler ─────────────────────────────────────────────────────────
app.onError(errorHandler)

export default app
