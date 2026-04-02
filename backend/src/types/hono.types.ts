import type { User, Workspace } from '../db/schema/index.js'

export type UserRole = 'owner' | 'manager' | 'staff'

export type AppVariables = {
  user: User & { workspace?: Workspace }
  workspaceId: string
}

// Extend Hono's context type
declare module 'hono' {
  interface ContextVariableMap extends AppVariables {}
}
