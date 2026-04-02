import { serve } from '@hono/node-server'
import app from './app.js'
import { env } from './config/index.js'
import { logger } from './lib/logger.js'

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    logger.info(`🚀 CAFlow API running on http://localhost:${info.port}`)
    logger.info(`🌍 Environment: ${env.NODE_ENV}`)
  },
)

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down server...')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
