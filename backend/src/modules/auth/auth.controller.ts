import type { Context } from 'hono'
import { ok, created, badRequest, unauthorized } from '../../lib/response.js'
import { sendOtpSchema, verifyOtpSchema, onboardingSchema } from './auth.schema.js'
import { sendOtp, verifyOtp, completeOnboarding, getMe, verifyToken } from './auth.service.js'

export async function handleSendOtp(c: Context) {
  const body = await c.req.json()
  const parsed = sendOtpSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest(c, parsed.error.errors[0]?.message ?? 'Invalid input')
  }
  const result = await sendOtp(parsed.data)
  return ok(c, result)
}

export async function handleVerifyOtp(c: Context) {
  const body = await c.req.json()
  const parsed = verifyOtpSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest(c, parsed.error.errors[0]?.message ?? 'Invalid input')
  }
  const result = await verifyOtp(parsed.data)
  return ok(c, result)
}

export async function handleOnboarding(c: Context) {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.split(' ')[1]
  if (!token) return unauthorized(c)

  const payload = await verifyToken(token)
  if (payload.purpose !== 'onboarding' || !payload.email) {
    return unauthorized(c, 'Invalid onboarding token')
  }

  const body = await c.req.json()
  const parsed = onboardingSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest(c, parsed.error.errors[0]?.message ?? 'Invalid input')
  }

  const result = await completeOnboarding(payload.email, parsed.data)
  return created(c, result)
}

export async function handleGetMe(c: Context) {
  const userId = c.get('userId') as string
  const data = await getMe(userId)
  return ok(c, data)
}
