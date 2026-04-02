import type { Context } from 'hono'
import {
  createCaseSchema, updateCaseSchema, moveCaseSchema,
  listCasesSchema, createTaskSchema, updateTaskSchema,
} from './cases.schema.js'
import * as svc from './cases.service.js'
import { ok, created, noContent, paginate } from '../../lib/response.js'

export async function listCasesHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const query = listCasesSchema.parse(c.req.query())
  const { rows, total } = await svc.listCases(workspaceId, query)
  return paginate(c, rows, total, query.page, query.limit)
}

export async function getKanbanHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const fy = c.req.query('financialYear')
  const board = await svc.getKanbanCases(workspaceId, fy)
  return ok(c, board)
}

export async function getCaseHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  const data = await svc.getCase(workspaceId, id)
  return ok(c, data)
}

export async function createCaseHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const body = createCaseSchema.parse(await c.req.json())
  const data = await svc.createCase(workspaceId, body)
  return created(c, data)
}

export async function updateCaseHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  const body = updateCaseSchema.parse(await c.req.json())
  const data = await svc.updateCase(workspaceId, id, body)
  return ok(c, data)
}

export async function moveCaseHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  const body = moveCaseSchema.parse(await c.req.json())
  const data = await svc.moveCase(workspaceId, id, body)
  return ok(c, data)
}

export async function deleteCaseHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  await svc.deleteCase(workspaceId, id)
  return noContent(c)
}

export async function createTaskHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const user = c.get('user')
  const { id: caseId } = c.req.param()
  const body = createTaskSchema.parse(await c.req.json())
  const task = await svc.createTask(workspaceId, caseId, body, user.id)
  return created(c, task)
}

export async function updateTaskHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const user = c.get('user')
  const { id: caseId, taskId } = c.req.param()
  const body = updateTaskSchema.parse(await c.req.json())
  const task = await svc.updateTask(workspaceId, caseId, taskId, body, user.id)
  return ok(c, task)
}

export async function deleteTaskHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id: caseId, taskId } = c.req.param()
  await svc.deleteTask(workspaceId, caseId, taskId)
  return noContent(c)
}
