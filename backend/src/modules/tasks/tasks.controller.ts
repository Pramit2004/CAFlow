import type { Context } from 'hono'
import { createTaskSchema, updateTaskSchema, listTasksSchema } from './tasks.schema.js'
import * as taskService from './tasks.service.js'
import { ok, created, noContent, paginate } from '../../lib/response.js'

export async function listTasksHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const query = listTasksSchema.parse(c.req.query())
  const { rows, total } = await taskService.listTasks(workspaceId, query)
  return paginate(c, rows, total, query.page, query.limit)
}

export async function getTaskHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  const task = await taskService.getTask(workspaceId, id)
  return ok(c, task)
}

export async function createTaskHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const userId = c.get('userId')
  const body = await c.req.json()
  const data = createTaskSchema.parse(body)
  const task = await taskService.createTask(workspaceId, userId, data)
  return created(c, task)
}

export async function updateTaskHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  const body = await c.req.json()
  const data = updateTaskSchema.parse(body)
  const task = await taskService.updateTask(workspaceId, id, data)
  return ok(c, task)
}

export async function deleteTaskHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { id } = c.req.param()
  await taskService.deleteTask(workspaceId, id)
  return noContent(c)
}
