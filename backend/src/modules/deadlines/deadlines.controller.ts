import type { Context } from 'hono'
import * as deadlineService from './deadlines.service.js'
import { ok } from '../../lib/response.js'

export async function getUpcomingDeadlinesHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const days = Number(c.req.query('days') ?? 30)
  const rows = await deadlineService.getUpcomingDeadlines(workspaceId, days)
  return ok(c, rows)
}

export async function getOverdueDeadlinesHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const rows = await deadlineService.getOverdueDeadlines(workspaceId)
  return ok(c, rows)
}

export async function getDeadlineSummaryHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const summary = await deadlineService.getDeadlineSummary(workspaceId)
  return ok(c, summary)
}
