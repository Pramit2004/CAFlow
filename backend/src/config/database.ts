import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from './index.js'
import * as schema from '../db/schema/index.js'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err)
})

export const db = drizzle(pool, { schema, logger: env.NODE_ENV === 'development' })
export type DB = typeof db
