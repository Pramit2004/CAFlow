import type { Context } from 'hono'
import { ZodError } from 'zod'
import { isAppError } from '../lib/errors.js'
import { logger } from '../lib/logger.js'

export const errorHandler = (err: Error, c: Context) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: 'Validation error',
        details: err.flatten().fieldErrors,
      },
      400,
    )
  }

  // Known application errors
  if (isAppError(err)) {
    return c.json(
      {
        success: false,
        error: err.message,
        code: err.code,
      },
      err.statusCode as never,
    )
  }

  // Unknown errors — log and return generic message
  logger.error({ err }, 'Unhandled error')
  return c.json(
    {
      success: false,
      error: 'Internal server error',
    },
    500,
  )
}
