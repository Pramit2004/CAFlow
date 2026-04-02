import { cors } from 'hono/cors'
import { env } from '../config/index.js'

export const corsMiddleware = cors({
  origin: [env.APP_URL, env.CLIENT_PORTAL_URL],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
  credentials: true,
})
