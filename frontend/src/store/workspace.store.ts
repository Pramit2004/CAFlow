import { create } from 'zustand'

interface Workspace {
  id: string
  name: string
  slug: string
  plan: 'starter' | 'growth' | 'pro'
  logoUrl?: string
}

interface WorkspaceState {
  workspace: Workspace | null
  setWorkspace: (workspace: Workspace) => void
  clearWorkspace: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspace: null,
  setWorkspace: (workspace) => set({ workspace }),
  clearWorkspace: () => set({ workspace: null }),
}))
