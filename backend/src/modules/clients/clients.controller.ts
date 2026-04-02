import type { Context } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createClientSchema, updateClientSchema, listClientsSchema } from './clients.schema.js'
import * as clientService from './clients.service.js'
import { ok, created, noContent, paginate } from '../../lib/response.js'

export async function listClientsHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const query = listClientsSchema.parse(c.req.query())
  const { rows, total } = await clientService.listClients(workspaceId, query)
  return paginate(c, rows, total, query.page, query.limit)
}

export async function getClientHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  const client = await clientService.getClientWithStats(workspaceId, id)
  return ok(c, client)
}

export async function createClientHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const user = c.get('user')
  const body = await c.req.json()
  const data = createClientSchema.parse(body)

  // Pass workspace plan for limit checking
  const workspacePlan = (user as any).workspace?.plan ?? 'starter'
  const client = await clientService.createClient(workspaceId, data, workspacePlan)
  return created(c, client)
}

export async function updateClientHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  const body = await c.req.json()
  const data = updateClientSchema.parse(body)
  const client = await clientService.updateClient(workspaceId, id, data)
  return ok(c, client)
}

export async function deleteClientHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  await clientService.deleteClient(workspaceId, id)
  return noContent(c)
}

export async function getClientCasesHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  const clientCases = await clientService.getClientCases(workspaceId, id)
  return ok(c, clientCases)
}

export async function exportClientsHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const csv = await clientService.exportClientsCSV(workspaceId)

  c.header('Content-Type', 'text/csv')
  c.header('Content-Disposition', `attachment; filename="clients-${Date.now()}.csv"`)
  return c.body(csv)
}
