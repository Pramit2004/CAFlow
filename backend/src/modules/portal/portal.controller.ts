import type { Context } from 'hono'
import { portalPresignSchema, portalConfirmSchema } from './portal.schema.js'
import * as svc from './portal.service.js'
import { ok } from '../../lib/response.js'
import { ForbiddenError } from '../../lib/errors.js'

export async function getPortalDataHandler(c: Context) {
  const { token } = c.req.param()
  try {
    const data = await svc.getPortalData(token)
    return ok(c, data)
  } catch (e: any) {
    if (e?.message === 'EXPIRED') {
      return c.json({ success: false, error: 'EXPIRED' }, 410)
    }
    throw e
  }
}

export async function portalPresignUploadHandler(c: Context) {
  const { token } = c.req.param()
  const body = portalPresignSchema.parse(await c.req.json())
  const result = await svc.getPortalPresignedUpload(token, body)
  return ok(c, result)
}

export async function portalConfirmUploadHandler(c: Context) {
  const { token } = c.req.param()
  const body = portalConfirmSchema.parse(await c.req.json())
  const doc = await svc.confirmPortalUpload(token, body)
  return ok(c, doc)
}

export async function portalDownloadUrlHandler(c: Context) {
  const { token, documentId } = c.req.param()
  const result = await svc.getPortalDownloadUrl(token, documentId)
  return ok(c, result)
}

