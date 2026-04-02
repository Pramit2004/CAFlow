import type { Context } from 'hono'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export const ok = <T>(c: Context, data: T, meta?: ApiResponse['meta']) => {
  return c.json<ApiResponse<T>>({ success: true, data, meta }, 200)
}

export const created = <T>(c: Context, data: T) => {
  return c.json<ApiResponse<T>>({ success: true, data }, 201)
}

export const noContent = (c: Context) => {
  return c.body(null, 204)
}

export const badRequest = (c: Context, error: string) => {
  return c.json<ApiResponse>({ success: false, error }, 400)
}

export const unauthorized = (c: Context, error = 'Unauthorized') => {
  return c.json<ApiResponse>({ success: false, error }, 401)
}

export const forbidden = (c: Context, error = 'Forbidden') => {
  return c.json<ApiResponse>({ success: false, error }, 403)
}

export const notFound = (c: Context, error = 'Not found') => {
  return c.json<ApiResponse>({ success: false, error }, 404)
}

export const conflict = (c: Context, error: string) => {
  return c.json<ApiResponse>({ success: false, error }, 409)
}

export const serverError = (c: Context, error = 'Internal server error') => {
  return c.json<ApiResponse>({ success: false, error }, 500)
}

export const paginate = <T>(
  c: Context,
  data: T[],
  total: number,
  page: number,
  limit: number,
) => {
  return ok(c, data, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })
}
