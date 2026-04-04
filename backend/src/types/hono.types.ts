export type UserRole = 'owner' | 'manager' | 'staff'

export type AppVariables = {
  userId: string
  workspaceId: string
  role: UserRole
}

// Extend Hono's context type
declare module 'hono' {
  interface ContextVariableMap extends AppVariables {}
}
