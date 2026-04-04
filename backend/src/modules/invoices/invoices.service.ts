import { eq, and, desc, count, sql } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { invoices } from '../../db/schema/index.js'
import { NotFoundError } from '../../lib/errors.js'
import type { CreateInvoiceInput, UpdateInvoiceInput, ListInvoicesQuery } from './invoices.schema.js'

// ──────────────────────────────────────────────────
// Generate next invoice number for workspace
// ──────────────────────────────────────────────────
async function getNextSequenceNumber(workspaceId: string): Promise<number> {
  const [result] = await db
    .select({ max: sql<number>`coalesce(max(${invoices.sequenceNumber}), 0)` })
    .from(invoices)
    .where(eq(invoices.workspaceId, workspaceId))

  return Number(result?.max ?? 0) + 1
}

function buildInvoiceNumber(seq: number): string {
  const year = new Date().getFullYear()
  return `INV-${year}-${String(seq).padStart(4, '0')}`
}

// ──────────────────────────────────────────────────
// List invoices
// ──────────────────────────────────────────────────
export async function listInvoices(workspaceId: string, query: ListInvoicesQuery) {
  const { page, limit, clientId, caseId, status } = query
  const offset = (page - 1) * limit

  const conditions: ReturnType<typeof eq>[] = [eq(invoices.workspaceId, workspaceId)]
  if (clientId) conditions.push(eq(invoices.clientId, clientId))
  if (caseId) conditions.push(eq(invoices.caseId, caseId))
  if (status) conditions.push(eq(invoices.status, status))

  const where = and(...conditions)

  const [rows, [{ value: total }]] = await Promise.all([
    db.select().from(invoices).where(where).orderBy(desc(invoices.createdAt)).limit(limit).offset(offset),
    db.select({ value: count() }).from(invoices).where(where),
  ])

  return { rows, total: Number(total) }
}

// ──────────────────────────────────────────────────
// Get single invoice
// ──────────────────────────────────────────────────
export async function getInvoice(workspaceId: string, invoiceId: string) {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)))
    .limit(1)

  if (!invoice) throw new NotFoundError('Invoice')
  return invoice
}

// ──────────────────────────────────────────────────
// Create invoice
// ──────────────────────────────────────────────────
export async function createInvoice(workspaceId: string, data: CreateInvoiceInput) {
  const seq = await getNextSequenceNumber(workspaceId)
  const invoiceNumber = buildInvoiceNumber(seq)
  const gstRate = data.gstRate ?? 18
  const gstAmount = (data.subtotal * gstRate) / 100
  const totalAmount = data.subtotal + gstAmount

  const [invoice] = await db
    .insert(invoices)
    .values({
      workspaceId,
      clientId: data.clientId,
      caseId: data.caseId,
      invoiceNumber,
      description: data.description,
      subtotal: String(data.subtotal),
      gstRate: String(gstRate),
      gstAmount: String(gstAmount),
      totalAmount: String(totalAmount),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      sequenceNumber: seq,
    })
    .returning()

  return invoice
}

// ──────────────────────────────────────────────────
// Update invoice
// ──────────────────────────────────────────────────
export async function updateInvoice(workspaceId: string, invoiceId: string, data: UpdateInvoiceInput) {
  const existing = await getInvoice(workspaceId, invoiceId)

  // Recalculate amounts if subtotal or gstRate changed
  const subtotal = data.subtotal ?? Number(existing.subtotal)
  const gstRate = data.gstRate ?? Number(existing.gstRate)
  const gstAmount = (subtotal * gstRate) / 100
  const totalAmount = subtotal + gstAmount

  const setFields: Record<string, unknown> = {
    ...data,
    subtotal: String(subtotal),
    gstRate: String(gstRate),
    gstAmount: String(gstAmount),
    totalAmount: String(totalAmount),
    updatedAt: new Date(),
  }

  if (data.dueDate !== undefined) {
    setFields.dueDate = data.dueDate ? new Date(data.dueDate) : null
  }
  if (data.paidAt !== undefined) {
    setFields.paidAt = data.paidAt ? new Date(data.paidAt) : null
  }
  if (data.status === 'sent' && !existing.issuedAt) {
    setFields.issuedAt = new Date()
  }

  const [updated] = await db
    .update(invoices)
    .set(setFields)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)))
    .returning()

  return updated
}

// ──────────────────────────────────────────────────
// Delete invoice (only drafts)
// ──────────────────────────────────────────────────
export async function deleteInvoice(workspaceId: string, invoiceId: string) {
  const invoice = await getInvoice(workspaceId, invoiceId)
  if (invoice.status !== 'draft') {
    throw new Error('Only draft invoices can be deleted')
  }

  await db
    .delete(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)))
}
