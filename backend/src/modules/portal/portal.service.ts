import { eq, and } from 'drizzle-orm'
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'
import { db } from '../../config/database.js'
import { r2Client, R2_BUCKET } from '../../config/r2.js'
import { clientTokens, caseDocuments, cases, clients, workspaces } from '../../db/schema/index.js'
import { NotFoundError, ForbiddenError } from '../../lib/errors.js'
import { isTokenExpired } from '../../lib/tokens.js'
import { TOKEN_EXPIRY } from '../../config/constants.js'
import type { PortalPresignInput, PortalConfirmInput } from './portal.schema.js'

// ── Validate token + return portal context ────────────────────────────────

export async function validateToken(token: string) {
  const [row] = await db
    .select({
      tk: clientTokens,
      client: {
        id: clients.id,
        name: clients.name,
        phone: clients.phone,
        preferredLanguage: clients.preferredLanguage,
      },
      workspace: {
        id: workspaces.id,
        name: workspaces.name,
        logoUrl: workspaces.logoUrl,
      },
    })
    .from(clientTokens)
    .innerJoin(clients, eq(clientTokens.clientId, clients.id))
    .innerJoin(workspaces, eq(clientTokens.workspaceId, workspaces.id))
    .where(eq(clientTokens.token, token))
    .limit(1)

  if (!row) throw new NotFoundError('Invalid or expired link')
  if (isTokenExpired(row.tk.expiresAt)) throw new ForbiddenError('EXPIRED')

  return row
}

// ── Get portal data (documents + case info) ───────────────────────────────

export async function getPortalData(token: string) {
  const { tk, client, workspace } = await validateToken(token)

  if (!tk.caseId) throw new NotFoundError('No case linked to this token')

  const [caseRow] = await db.select().from(cases)
    .where(eq(cases.id, tk.caseId)).limit(1)

  if (!caseRow) throw new NotFoundError('Case not found')

  const docs = await db.select().from(caseDocuments)
    .where(
      and(
        eq(caseDocuments.caseId, tk.caseId),
        eq(caseDocuments.direction, tk.purpose === 'download' ? 'outbound' : 'inbound'),
      ),
    )

  return {
    purpose: tk.purpose,
    expiresAt: tk.expiresAt,
    client,
    workspace,
    case: {
      id: caseRow.id,
      title: caseRow.title,
      serviceType: caseRow.serviceType,
      financialYear: caseRow.financialYear,
    },
    documents: docs,
  }
}

// ── Get presigned upload URL (for client) ─────────────────────────────────

export async function getPortalPresignedUpload(token: string, data: PortalPresignInput) {
  const { tk } = await validateToken(token)
  if (tk.purpose !== 'upload') throw new ForbiddenError('This link is not for uploading')

  // Verify doc belongs to this case
  const [doc] = await db.select().from(caseDocuments)
    .where(and(eq(caseDocuments.id, data.documentId), eq(caseDocuments.caseId, tk.caseId!)))
    .limit(1)

  if (!doc) throw new NotFoundError('Document not found')
  if (doc.direction !== 'inbound') throw new ForbiddenError('Cannot upload to outbound document')

  const ext = data.fileName.split('.').pop()?.toLowerCase() ?? 'bin'
  const fileKey = `${tk.workspaceId}/cases/${tk.caseId}/portal/${data.documentId}/${nanoid()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
    ContentType: data.mimeType,
    ContentLength: data.fileSizeBytes,
    Metadata: {
      uploadedBy: 'client',
      clientId: tk.clientId,
      documentId: data.documentId,
      originalName: encodeURIComponent(data.fileName),
    },
  })

  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: TOKEN_EXPIRY.SIGNED_URL,
  })

  return { presignedUrl, fileKey }
}

// ── Confirm portal upload ──────────────────────────────────────────────────

export async function confirmPortalUpload(token: string, data: PortalConfirmInput) {
  const { tk } = await validateToken(token)
  if (tk.purpose !== 'upload') throw new ForbiddenError('This link is not for uploading')

  const [doc] = await db.select().from(caseDocuments)
    .where(and(eq(caseDocuments.id, data.documentId), eq(caseDocuments.caseId, tk.caseId!)))
    .limit(1)

  if (!doc) throw new NotFoundError('Document not found')

  const [updated] = await db.update(caseDocuments).set({
    status: 'UPLOADED',
    fileKey: data.fileKey,
    fileName: data.fileName,
    fileMimeType: data.mimeType,
    fileSizeBytes: data.fileSizeBytes,
    uploadedBy: 'client',
    uploadedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(caseDocuments.id, data.documentId)).returning()

  // Increment usage count
  await db.update(clientTokens)
    .set({ usedCount: db.$count(clientTokens, eq(clientTokens.token, token)) as any })
    .where(eq(clientTokens.token, token))

  return updated
}

// ── Get presigned download URL (for client) ───────────────────────────────

export async function getPortalDownloadUrl(token: string, documentId: string) {
  const { tk } = await validateToken(token)
  if (tk.purpose !== 'download') throw new ForbiddenError('This link is not for downloading')

  const [doc] = await db.select().from(caseDocuments)
    .where(and(eq(caseDocuments.id, documentId), eq(caseDocuments.caseId, tk.caseId!)))
    .limit(1)

  if (!doc) throw new NotFoundError('Document not found')
  if (!doc.fileKey) throw new NotFoundError('File not available yet')

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: doc.fileKey,
    ResponseContentDisposition: `attachment; filename="${doc.fileName ?? 'document'}"`,
  })

  const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 })
  return { url, fileName: doc.fileName, mimeType: doc.fileMimeType }
}

