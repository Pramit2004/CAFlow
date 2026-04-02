import { z } from 'zod'
import { uuidSchema } from '../../lib/validators.js'
import { FILE } from '../../config/constants.js'

export const addDocumentSlotSchema = z.object({
  label: z.string().min(1).max(255),
  direction: z.enum(['inbound', 'outbound']).default('inbound'),
  isRequired: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const bulkAddDocumentSlotsSchema = z.object({
  documents: z.array(addDocumentSlotSchema).min(1).max(20),
})

export const requestPresignedUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().refine(
    (m) => FILE.ALLOWED_MIME_TYPES.includes(m as any),
    { message: 'File type not allowed. Allowed: PDF, JPG, PNG, WEBP, HEIC, DOC, DOCX, XLS, XLSX' },
  ),
  fileSizeBytes: z.number().int().positive().max(FILE.MAX_SIZE_BYTES, 'File too large (max 50 MB)'),
})

export const confirmUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string(),
  fileSizeBytes: z.number().int().positive(),
  fileKey: z.string().min(1),
})

export const reviewDocumentSchema = z.object({
  action: z.enum(['accept', 'reject']),
  rejectionReason: z.enum([
    'blurry', 'wrong_document', 'wrong_year', 'password_protected', 'incomplete', 'other',
  ]).optional(),
  rejectionNote: z.string().max(500).optional(),
}).refine(
  (d) => d.action !== 'reject' || !!d.rejectionReason,
  { message: 'Rejection reason required when rejecting', path: ['rejectionReason'] },
)

export const generatePortalTokenSchema = z.object({
  caseId: uuidSchema,
  purpose: z.enum(['upload', 'download']),
  expiryDays: z.number().int().min(1).max(90).default(14),
})

export type AddDocumentSlotInput       = z.infer<typeof addDocumentSlotSchema>
export type BulkAddDocumentSlotsInput  = z.infer<typeof bulkAddDocumentSlotsSchema>
export type RequestPresignedUploadInput = z.infer<typeof requestPresignedUploadSchema>
export type ConfirmUploadInput         = z.infer<typeof confirmUploadSchema>
export type ReviewDocumentInput        = z.infer<typeof reviewDocumentSchema>
export type GeneratePortalTokenInput   = z.infer<typeof generatePortalTokenSchema>

