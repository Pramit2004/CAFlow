import { eq, and, desc, asc, count, sql } from 'drizzle-orm'
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'
import { db } from '../../config/database.js'
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '../../config/r2.js'
import { caseDocuments, cases, clients, clientTokens } from '../../db/schema/index.js'
import { NotFoundError, ForbiddenError } from '../../lib/errors.js'
import { generateToken, getTokenExpiry } from '../../lib/tokens.js'
import { TOKEN_EXPIRY } from '../../config/constants.js'
import type {
  AddDocumentSlotInput, BulkAddDocumentSlotsInput,
  RequestPresignedUploadInput, ConfirmUploadInput,
  ReviewDocumentInput, GeneratePortalTokenInput,
} from './documents.schema.js'

// ── Get all documents for a case ──────────────────────────────────────────

export async function getCaseDocuments(workspaceId: string, caseId: string) {
  const [caseRow] = await db.select({ id: cases.id })
    .from(cases)
    .where(and(eq(cases.id, caseId), eq(cases.workspaceId, workspaceId)))
    .limit(1)

  if (!caseRow) throw new NotFoundError('Case not found')

  return db.select().from(caseDocuments)
    .where(and(eq(caseDocuments.caseId, caseId), eq(caseDocuments.workspaceId, workspaceId)))
    .orderBy(asc(caseDocuments.sortOrder), asc(caseDocuments.createdAt))
}

// ── Add document slots to a case ──────────────────────────────────────────

export async function addDocumentSlots(
  workspaceId: string,
  caseId: string,
  data: BulkAddDocumentSlotsInput,
) {
  const [caseRow] = await db.select({ id: cases.id })
    .from(cases).where(and(eq(cases.id, caseId), eq(cases.workspaceId, workspaceId))).limit(1)

  if (!caseRow) throw new NotFoundError('Case not found')

  const inserted = await db.insert(caseDocuments).values(
    data.documents.map((d, i) => ({
      caseId,
      workspaceId,
      label: d.label,
      direction: d.direction,
      isRequired: d.isRequired,
      sortOrder: d.sortOrder ?? i,
      status: 'PENDING' as const,
    })),
  ).returning()

  return inserted
}

// ── Request presigned upload URL (for CA) ─────────────────────────────────

export async function requestPresignedUpload(
  workspaceId: string,
  documentId: string,
  data: RequestPresignedUploadInput,
) {
  const [doc] = await db.select().from(caseDocuments)
    .where(and(eq(caseDocuments.id, documentId), eq(caseDocuments.workspaceId, workspaceId)))
    .limit(1)

  if (!doc) throw new NotFoundError('Document slot not found')

  const ext = data.fileName.split('.').pop()?.toLowerCase() ?? 'bin'
  const fileKey = `${workspaceId}/cases/${doc.caseId}/${documentId}/${nanoid()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
    ContentType: data.mimeType,
    ContentLength: data.fileSizeBytes,
    Metadata: {
      workspaceId,
      documentId,
      caseId: doc.caseId,
      originalName: encodeURIComponent(data.fileName),
    },
  })

  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: TOKEN_EXPIRY.SIGNED_URL,
  })

  return { presignedUrl, fileKey }
}

// ── Confirm upload (after client-side PUT to R2) ──────────────────────────

export async function confirmUpload(
  workspaceId: string,
  documentId: string,
  data: ConfirmUploadInput,
  uploadedBy: string,
) {
  const [doc] = await db.select().from(caseDocuments)
    .where(and(eq(caseDocuments.id, documentId), eq(caseDocuments.workspaceId, workspaceId)))
    .limit(1)

  if (!doc) throw new NotFoundError('Document slot not found')

  const [updated] = await db.update(caseDocuments).set({
    status: 'UPLOADED',
    fileKey: data.fileKey,
    fileName: data.fileName,
    fileMimeType: data.mimeType,
    fileSizeBytes: data.fileSizeBytes,
    uploadedBy,
    uploadedAt: new Date(),
    updatedAt: new Date(),
  })
    .where(and(eq(caseDocuments.id, documentId), eq(caseDocuments.workspaceId, workspaceId)))
    .returning()

  return updated
}

// ── Generate signed download URL ──────────────────────────────────────────

export async function getDocumentDownloadUrl(workspaceId: string, documentId: string) {
  const [doc] = await db.select().from(caseDocuments)
    .where(and(eq(caseDocuments.id, documentId), eq(caseDocuments.workspaceId, workspaceId)))
    .limit(1)

  if (!doc) throw new NotFoundError('Document not found')
  if (!doc.fileKey) throw new NotFoundError('No file uploaded yet')

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: doc.fileKey,
    ResponseContentDisposition: `attachment; filename="${doc.fileName ?? 'document'}"`,
  })

  const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 })
  return { url, fileName: doc.fileName, mimeType: doc.fileMimeType }
}

// ── Review document (accept / reject) ────────────────────────────────────

export async function reviewDocument(
  workspaceId: string,
  documentId: string,
  data: ReviewDocumentInput,
  reviewerId: string,
) {
  const [doc] = await db.select().from(caseDocuments)
    .where(and(eq(caseDocuments.id, documentId), eq(caseDocuments.workspaceId, workspaceId)))
    .limit(1)

  if (!doc) throw new NotFoundError('Document not found')
  if (doc.status !== 'UPLOADED') throw new ForbiddenError('Document must be uploaded before review')

  const newStatus = data.action === 'accept' ? 'ACCEPTED' : 'REJECTED'

  const [updated] = await db.update(caseDocuments).set({
    status: newStatus as any,
    rejectionReason: data.action === 'reject' ? (data.rejectionReason as any) : null,
    rejectionNote: data.action === 'reject' ? data.rejectionNote : null,
    verifiedBy: data.action === 'accept' ? reviewerId : null,
    verifiedAt: data.action === 'accept' ? new Date() : null,
    updatedAt: new Date(),
  })
    .where(and(eq(caseDocuments.id, documentId), eq(caseDocuments.workspaceId, workspaceId)))
    .returning()

  return updated
}

// ── Delete document slot ──────────────────────────────────────────────────

export async function deleteDocumentSlot(workspaceId: string, documentId: string) {
  const [doc] = await db.select().from(caseDocuments)
    .where(and(eq(caseDocuments.id, documentId), eq(caseDocuments.workspaceId, workspaceId)))
    .limit(1)

  if (!doc) throw new NotFoundError('Document not found')

  // Delete from R2 if file exists
  if (doc.fileKey) {
    try {
      await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: doc.fileKey }))
    } catch { /* ignore R2 errors */ }
  }

  await db.delete(caseDocuments)
    .where(and(eq(caseDocuments.id, documentId), eq(caseDocuments.workspaceId, workspaceId)))
}

// ── Generate portal token (send to client) ───────────────────────────────

export async function generatePortalToken(
  workspaceId: string,
  data: GeneratePortalTokenInput,
) {
  // Validate case belongs to workspace
  const [caseRow] = await db.select({ id: cases.id, clientId: cases.clientId })
    .from(cases).where(and(eq(cases.id, data.caseId), eq(cases.workspaceId, workspaceId))).limit(1)

  if (!caseRow) throw new NotFoundError('Case not found')

  const token = generateToken(32)
  const expiresAt = new Date(Date.now() + data.expiryDays * 24 * 60 * 60 * 1000)

  const [created] = await db.insert(clientTokens).values({
    token,
    workspaceId,
    clientId: caseRow.clientId,
    caseId: data.caseId,
    purpose: data.purpose,
    expiresAt,
  }).returning()

  return {
    token: created.token,
    portalUrl: `${process.env.APP_URL}/c/${token}`,
    expiresAt: created.expiresAt,
  }
}

// ── Document inbox — all pending docs for workspace ───────────────────────

export async function getDocumentInbox(workspaceId: string) {
  const rows = await db
    .select({
      doc: caseDocuments,
      caseTitle: cases.title,
      caseServiceType: cases.serviceType,
      caseFinancialYear: cases.financialYear,
      clientName: clients.name,
      clientPhone: clients.phone,
    })
    .from(caseDocuments)
    .innerJoin(cases, eq(caseDocuments.caseId, cases.id))
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .where(
      and(
        eq(caseDocuments.workspaceId, workspaceId),
        sql`${caseDocuments.status} IN ('PENDING', 'UPLOADED')`,
        eq(caseDocuments.direction, 'inbound'),
      ),
    )
    .orderBy(desc(caseDocuments.updatedAt))

  return rows.map(({ doc, caseTitle, caseServiceType, caseFinancialYear, clientName, clientPhone }) => ({
    ...doc,
    case: { title: caseTitle, serviceType: caseServiceType, financialYear: caseFinancialYear },
    client: { name: clientName, phone: clientPhone },
  }))
}

