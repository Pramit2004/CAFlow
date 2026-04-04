import type { Context } from 'hono'
import { updateWorkspaceSchema, updateTeamMemberRoleSchema } from './workspace.schema.js'
import * as workspaceService from './workspace.service.js'
import { ok, noContent } from '../../lib/response.js'

export async function getWorkspaceHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const workspace = await workspaceService.getWorkspace(workspaceId)
  return ok(c, workspace)
}

export async function updateWorkspaceHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const body = await c.req.json()
  const data = updateWorkspaceSchema.parse(body)
  const workspace = await workspaceService.updateWorkspace(workspaceId, data)
  return ok(c, workspace)
}

export async function listTeamMembersHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const members = await workspaceService.listTeamMembers(workspaceId)
  return ok(c, members)
}

export async function updateTeamMemberRoleHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { memberId } = c.req.param()
  const body = await c.req.json()
  const { role } = updateTeamMemberRoleSchema.parse(body)
  const member = await workspaceService.updateTeamMemberRole(workspaceId, memberId, role)
  return ok(c, member)
}

export async function deactivateTeamMemberHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const { memberId } = c.req.param()
  await workspaceService.deactivateTeamMember(workspaceId, memberId)
  return noContent(c)
}
