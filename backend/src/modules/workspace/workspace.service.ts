import { eq, and } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { workspaces, users } from '../../db/schema/index.js'
import { NotFoundError } from '../../lib/errors.js'
import type { UpdateWorkspaceInput } from './workspace.schema.js'

// ──────────────────────────────────────────────────
// Get workspace by id
// ──────────────────────────────────────────────────
export async function getWorkspace(workspaceId: string) {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1)

  if (!workspace) throw new NotFoundError('Workspace')
  return workspace
}

// ──────────────────────────────────────────────────
// Update workspace settings
// ──────────────────────────────────────────────────
export async function updateWorkspace(workspaceId: string, data: UpdateWorkspaceInput) {
  const [updated] = await db
    .update(workspaces)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(workspaces.id, workspaceId))
    .returning()

  return updated
}

// ──────────────────────────────────────────────────
// List team members for the workspace
// ──────────────────────────────────────────────────
export async function listTeamMembers(workspaceId: string) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      isActive: users.isActive,
      lastActiveAt: users.lastActiveAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.workspaceId, workspaceId), eq(users.isActive, true)))
    .orderBy(users.name)
}

// ──────────────────────────────────────────────────
// Update team member role
// ──────────────────────────────────────────────────
export async function updateTeamMemberRole(
  workspaceId: string,
  memberId: string,
  role: 'manager' | 'staff',
) {
  const [member] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, memberId), eq(users.workspaceId, workspaceId)))
    .limit(1)

  if (!member) throw new NotFoundError('Team member')

  const [updated] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(and(eq(users.id, memberId), eq(users.workspaceId, workspaceId)))
    .returning()

  return updated
}

// ──────────────────────────────────────────────────
// Deactivate team member
// ──────────────────────────────────────────────────
export async function deactivateTeamMember(workspaceId: string, memberId: string) {
  const [member] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, memberId), eq(users.workspaceId, workspaceId)))
    .limit(1)

  if (!member) throw new NotFoundError('Team member')
  if (member.role === 'owner') throw new Error('Cannot deactivate workspace owner')

  await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(users.id, memberId), eq(users.workspaceId, workspaceId)))
}
