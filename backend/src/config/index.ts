import { z } from 'zod'
import { config } from 'dotenv'

config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8000').transform(Number),

  // Database (required)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').default('postgresql://localhost:5432/caflow'),
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),

  // Clerk (optional in dev — demo mode bypasses Clerk)
  CLERK_SECRET_KEY: z.string().optional().default(''),
  CLERK_WEBHOOK_SECRET: z.string().optional().default(''),

  // Cloudflare R2 (optional — document features disabled if missing)
  R2_ACCOUNT_ID: z.string().optional().default(''),
  R2_ACCESS_KEY_ID: z.string().optional().default(''),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(''),
  R2_BUCKET_NAME: z.string().default('caflow-files'),
  R2_PUBLIC_URL: z.string().optional().default(''),

  // Upstash Redis (optional — queues disabled if missing)
  UPSTASH_REDIS_URL: z.string().optional().default(''),
  UPSTASH_REDIS_TOKEN: z.string().optional().default(''),

  // Resend (optional — email disabled if missing)
  RESEND_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('noreply@caflow.app'),

  // Razorpay (optional — payments disabled if missing)
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),

  // SMS
  FAST2SMS_API_KEY: z.string().optional(),

  // App
  APP_URL: z.string().default('http://localhost:5173'),
  CLIENT_PORTAL_URL: z.string().default('http://localhost:5174'),
  TOKEN_SECRET: z.string().default('dev-secret-at-least-32-chars-long-here'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env
