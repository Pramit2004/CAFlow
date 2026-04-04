import { z } from 'zod'

export const upcomingDeadlinesSchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
})
