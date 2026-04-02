import { z } from 'zod'

// Common reusable validators
export const uuidSchema = z.string().uuid()

export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
})

export const indianPhoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number (10 digits, starts with 6-9)')

export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format')
  .optional()

export const gstinSchema = z
  .string()
  .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GSTIN format')
  .optional()

export const financialYearSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Financial year must be in format YYYY-YY (e.g. 2024-25)')
  .optional()
