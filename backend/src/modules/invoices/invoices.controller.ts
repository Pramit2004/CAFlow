import type { Context } from 'hono'
import { createInvoiceSchema, updateInvoiceSchema, listInvoicesSchema } from './invoices.schema.js'
import * as invoiceService from './invoices.service.js'
import { ok, created, noContent, paginate } from '../../lib/response.js'

export async function listInvoicesHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const query = listInvoicesSchema.parse(c.req.query())
  const { rows, total } = await invoiceService.listInvoices(workspaceId, query)
  return paginate(c, rows, total, query.page, query.limit)
}

export async function getInvoiceHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  const invoice = await invoiceService.getInvoice(workspaceId, id)
  return ok(c, invoice)
}

export async function createInvoiceHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const body = await c.req.json()
  const data = createInvoiceSchema.parse(body)
  const invoice = await invoiceService.createInvoice(workspaceId, data)
  return created(c, invoice)
}

export async function updateInvoiceHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  const body = await c.req.json()
  const data = updateInvoiceSchema.parse(body)
  const invoice = await invoiceService.updateInvoice(workspaceId, id, data)
  return ok(c, invoice)
}

export async function deleteInvoiceHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  await invoiceService.deleteInvoice(workspaceId, id)
  return noContent(c)
}
