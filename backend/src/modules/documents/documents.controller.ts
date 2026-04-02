import type { Context } from 'hono'
import {
  bulkAddDocumentSlotsSchema, requestPresignedUploadSchema,
  confirmUploadSchema, reviewDocumentSchema, generatePortalTokenSchema,
} from './documents.schema.js'
import * as svc from './documents.service.js'
import { ok, created, noContent } from '../../lib/response.js'

export async function getCaseDocumentsHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { caseId } = c.req.param()
  const docs = await svc.getCaseDocuments(workspaceId, caseId)
  return ok(c, docs)
}

export async function addDocumentSlotsHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { caseId } = c.req.param()
  const body = bulkAddDocumentSlotsSchema.parse(await c.req.json())
  const docs = await svc.addDocumentSlots(workspaceId, caseId, body)
  return created(c, docs)
}

export async function requestPresignedUploadHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  const body = requestPresignedUploadSchema.parse(await c.req.json())
  const result = await svc.requestPresignedUpload(workspaceId, id, body)
  return ok(c, result)
}

export async function confirmUploadHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const user = c.get('user')
  const { id } = c.req.param()
  const body = confirmUploadSchema.parse(await c.req.json())
  const doc = await svc.confirmUpload(workspaceId, id, body, user.id)
  return ok(c, doc)
}

export async function getDownloadUrlHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  const result = await svc.getDocumentDownloadUrl(workspaceId, id)
  return ok(c, result)
}

export async function reviewDocumentHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const user = c.get('user')
  const { id } = c.req.param()
  const body = reviewDocumentSchema.parse(await c.req.json())
  const doc = await svc.reviewDocument(workspaceId, id, body, user.id)
  return ok(c, doc)
}

export async function deleteDocumentSlotHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  await svc.deleteDocumentSlot(workspaceId, id)
  return noContent(c)
}

export async function generatePortalTokenHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const body = generatePortalTokenSchema.parse(await c.req.json())
  const result = await svc.generatePortalToken(workspaceId, body)
  return created(c, result)
}

export async function getDocumentInboxHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const docs = await svc.getDocumentInbox(workspaceId)
  return ok(c, docs)
}

