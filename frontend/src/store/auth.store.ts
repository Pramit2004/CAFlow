import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  clerkId: string
  name: string
  email?: string
  role: 'owner' | 'manager' | 'staff'
  workspaceId: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'caflow-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
)
