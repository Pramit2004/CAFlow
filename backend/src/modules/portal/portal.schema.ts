import { z } from 'zod'
import { FILE } from '../../config/constants.js'

export const portalPresignSchema = z.object({
  documentId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().refine(
    (m) => FILE.ALLOWED_MIME_TYPES.includes(m as any),
    { message: 'File type not supported. Please upload PDF, JPG, PNG, or HEIC.' },
  ),
  fileSizeBytes: z.number().int().positive().max(FILE.MAX_SIZE_BYTES, 'File too large (max 50 MB)'),
})

export const portalConfirmSchema = z.object({
  documentId: z.string().uuid(),
  fileKey: z.string().min(1),
  fileName: z.string().min(1).max(255),
  mimeType: z.string(),
  fileSizeBytes: z.number().int().positive(),
})

export type PortalPresignInput  = z.infer<typeof portalPresignSchema>
export type PortalConfirmInput  = z.infer<typeof portalConfirmSchema>

