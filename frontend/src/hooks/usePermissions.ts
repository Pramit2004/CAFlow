import { useAuthStore } from '@/store/auth.store'

type Role = 'owner' | 'manager' | 'staff'

const HIERARCHY: Record<Role, number> = { owner: 3, manager: 2, staff: 1 }

export function usePermissions() {
  const role = useAuthStore((s) => s.user?.role) as Role | undefined

  const hasRole = (...roles: Role[]) => {
    if (!role) return false
    return roles.includes(role)
  }

  const isAtLeast = (minRole: Role) => {
    if (!role) return false
    return HIERARCHY[role] >= HIERARCHY[minRole]
  }

  return {
    role,
    isOwner: role === 'owner',
    isManager: isAtLeast('manager'),
    isStaff: !!role,
    hasRole,
    isAtLeast,
    canSeeFees: isAtLeast('manager'),
    canManageTeam: role === 'owner',
    canDeleteClients: isAtLeast('manager'),
  }
}
