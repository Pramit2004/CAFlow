import { z } from 'zod'

export const sendOtpSchema = z.object({
  email: z.string().email('Enter a valid email address').toLowerCase().trim(),
})

export const verifyOtpSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
})

export const onboardingSchema = z.object({
  firmName: z.string().min(2, 'Firm name is required').max(255).trim(),
  name: z.string().min(2, 'Your name is required').max(255).trim(),
  icaiNumber: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
})

export type SendOtpInput = z.infer<typeof sendOtpSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type OnboardingInput = z.infer<typeof onboardingSchema>
