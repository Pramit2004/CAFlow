import { Resend } from 'resend'
import { sign, verify } from 'hono/jwt'
import { eq } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { redis } from '../../config/redis.js'
import { env } from '../../config/index.js'
import { users } from '../../db/schema/users.js'
import { workspaces } from '../../db/schema/workspaces.js'
import { UnauthorizedError, ValidationError } from '../../lib/errors.js'
import type { SendOtpInput, VerifyOtpInput, OnboardingInput } from './auth.schema.js'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!env.RESEND_API_KEY) throw new ValidationError('Email service not configured')
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY)
  return _resend
}
const OTP_TTL = 10 * 60 // 10 minutes in seconds

// ── Helpers ────────────────────────────────────────────────────────────────

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function otpKey(email: string): string {
  return `otp:${email.toLowerCase()}`
}

async function signToken(userId: string, workspaceId: string, role: string): Promise<string> {
  return sign(
    {
      sub: userId,
      workspaceId,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    },
    env.TOKEN_SECRET,
  )
}

// ── Service methods ────────────────────────────────────────────────────────

export async function sendOtp(input: SendOtpInput) {
  const cooldownKey = `otp_sent:${input.email}`
  const rateCheck = await redis.get<string>(cooldownKey)
  if (rateCheck) {
    throw new ValidationError('OTP already sent. Please wait 60 seconds before requesting again.')
  }

  const otp = generateOtp()
  await redis.set(otpKey(input.email), otp, { ex: OTP_TTL })
  await redis.set(cooldownKey, '1', { ex: 60 })

  await getResend().emails.send({
    from: env.EMAIL_FROM || 'CAFlow <onboarding@resend.dev>',
    to: input.email,
    subject: 'Your CAFlow sign-in code',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#f9f7f5;font-family:Inter,-apple-system,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f5;padding:40px 16px;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #ede9e3;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#1a1512 0%,#3d2010 60%,#c84b0f 100%);padding:32px 40px;text-align:center;">
                  <div style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">CA<span style="color:#f5a623;">Flow</span></div>
                  <p style="color:rgba(255,255,255,0.65);margin:8px 0 0;font-size:13px;">Practice Management for Indian CAs</p>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1512;">Your sign-in code</h2>
                  <p style="margin:0 0 32px;font-size:14px;color:#6b6560;line-height:1.6;">
                    Enter this 6-digit code to access your CAFlow account. It expires in 10 minutes.
                  </p>
                  <div style="background:#fff7ed;border:2px dashed #f5a623;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
                    <span style="font-size:44px;font-weight:800;letter-spacing:14px;color:#c84b0f;font-family:'Courier New',monospace;">${otp}</span>
                  </div>
                  <p style="margin:0;font-size:12px;color:#9e9890;line-height:1.7;">
                    If you didn't request this code, you can safely ignore this email.<br>
                    Someone may have entered your email address by mistake.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 40px;background:#f9f7f5;border-top:1px solid #ede9e3;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#9e9890;">CAFlow · India's #1 CA Practice Management Tool</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  })

  return { message: 'OTP sent to your email address' }
}

export async function verifyOtp(input: VerifyOtpInput) {
  const storedOtp = await redis.get<string>(otpKey(input.email))

  if (!storedOtp) {
    throw new ValidationError('OTP expired or not found. Please request a new one.')
  }
  if (storedOtp !== input.otp) {
    throw new UnauthorizedError('Invalid OTP. Please check and try again.')
  }

  await redis.del(otpKey(input.email))
  await redis.del(`otp_sent:${input.email}`)

  const [existingUser] = await db
    .select({ id: users.id, workspaceId: users.workspaceId, role: users.role, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1)

  if (!existingUser) {
    const pendingToken = await sign(
      {
        sub: 'pending',
        email: input.email,
        purpose: 'onboarding',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 60,
      },
      env.TOKEN_SECRET,
    )
    return { needsOnboarding: true, token: pendingToken, user: null }
  }

  await db.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, existingUser.id))

  const token = await signToken(existingUser.id, existingUser.workspaceId, existingUser.role)
  return {
    needsOnboarding: false,
    token,
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      workspaceId: existingUser.workspaceId,
    },
  }
}

export async function completeOnboarding(email: string, input: OnboardingInput) {
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing) throw new ValidationError('Account already set up. Please sign in.')

  const slug =
    input.firmName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 70) +
    '-' +
    Date.now().toString(36)

  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: input.firmName,
      slug,
      icaiNumber: input.icaiNumber,
      city: input.city,
      state: input.state,
      phone: input.phone,
      email,
      plan: 'starter',
      planStatus: 'trialing',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    .returning()

  const [user] = await db
    .insert(users)
    .values({ workspaceId: workspace.id, name: input.name, email, phone: input.phone, role: 'owner' })
    .returning()

  const token = await signToken(user.id, workspace.id, user.role)
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, workspaceId: user.workspaceId },
    workspace: { id: workspace.id, name: workspace.name, plan: workspace.plan, planStatus: workspace.planStatus },
  }
}

export async function getMe(userId: string) {
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, workspaceId: users.workspaceId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) throw new UnauthorizedError('User not found')

  const [workspace] = await db
    .select({ id: workspaces.id, name: workspaces.name, plan: workspaces.plan, planStatus: workspaces.planStatus, logoUrl: workspaces.logoUrl })
    .from(workspaces)
    .where(eq(workspaces.id, user.workspaceId))
    .limit(1)

  return { user, workspace }
}

export async function verifyToken(token: string) {
  try {
    const payload = await verify(token, env.TOKEN_SECRET, 'HS256')
    return payload as { sub: string; workspaceId: string; role: string; purpose?: string; email?: string }
  } catch {
    throw new UnauthorizedError('Invalid or expired token')
  }
}
