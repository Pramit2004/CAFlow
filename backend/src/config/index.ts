import { z } from 'zod'
import { config } from 'dotenv'

config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8000').transform(Number),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SUPABASE_URL: z.string().min(1, 'SUPABASE_URL is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Clerk
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_WEBHOOK_SECRET: z.string().min(1, 'CLERK_WEBHOOK_SECRET is required'),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().default('caflow-files'),
  R2_PUBLIC_URL: z.string().min(1),

  // Upstash Redis
  UPSTASH_REDIS_URL: z.string().min(1),
  UPSTASH_REDIS_TOKEN: z.string().min(1),

  // Resend
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().default('noreply@caflow.app'),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

  // SMS
  FAST2SMS_API_KEY: z.string().optional(),

  // App
  APP_URL: z.string().default('http://localhost:5173'),
  CLIENT_PORTAL_URL: z.string().default('http://localhost:5174'),
  TOKEN_SECRET: z.string().min(32, 'TOKEN_SECRET must be at least 32 characters'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env
