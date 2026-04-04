import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { allRoles, managerAndAbove, ownerOnly } from '../../middleware/rbac.middleware.js'
import {
  getWorkspaceHandler,
  updateWorkspaceHandler,
  listTeamMembersHandler,
  updateTeamMemberRoleHandler,
  deactivateTeamMemberHandler,
} from './workspace.controller.js'

export const workspaceRoutes = new Hono()

workspaceRoutes.use('*', requireAuth)

// Workspace settings
workspaceRoutes.get('/me', allRoles, getWorkspaceHandler)
workspaceRoutes.patch('/me', ownerOnly, updateWorkspaceHandler)

// Team management
workspaceRoutes.get('/me/team', allRoles, listTeamMembersHandler)
workspaceRoutes.patch('/me/team/:memberId/role', ownerOnly, updateTeamMemberRoleHandler)
workspaceRoutes.delete('/me/team/:memberId', ownerOnly, deactivateTeamMemberHandler)
