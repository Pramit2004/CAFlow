import { z } from 'zod'

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  icaiNumber: z.string().max(50).optional(),
  gstin: z.string().max(15).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  address: z.string().optional(),
  pincode: z.string().max(10).optional(),
  phone: z.string().max(15).optional(),
  email: z.string().email().optional(),
  logoUrl: z.string().url().optional(),
  defaultLanguage: z.enum(['en', 'gu', 'hi']).optional(),
})

export const updateTeamMemberRoleSchema = z.object({
  role: z.enum(['manager', 'staff']),
})

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>
export type UpdateTeamMemberRoleInput = z.infer<typeof updateTeamMemberRoleSchema>
