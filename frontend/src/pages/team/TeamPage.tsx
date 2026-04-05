import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Users2, Shield, UserCheck, Mail, MoreHorizontal,
  UserPlus, Crown,
} from 'lucide-react'
import { api } from '@/services/api'
import { getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

// ── Types ──────────────────────────────────────────────────────────────────

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'manager' | 'staff'
  isActive: boolean
  createdAt: string
}

const ROLE_CFG: Record<string, { label: string; bg: string; color: string; border: string; icon: React.ElementType }> = {
  owner:   { label: 'Owner',   bg: '#FFF4EE', color: '#C84B0F', border: '#FED7AA',  icon: Crown },
  manager: { label: 'Manager', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE',  icon: Shield },
  staff:   { label: 'Staff',   bg: '#F9F7F4', color: '#6B6258', border: '#EDE8E1',  icon: UserCheck },
}

// ── Hooks ──────────────────────────────────────────────────────────────────

function useTeam() {
  return useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: TeamMember[] }>('/api/workspaces/members')
      return res.data.data
    },
    staleTime: 60_000,
  })
}

function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const res = await api.patch(`/api/workspaces/members/${memberId}/role`, { role })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      toast.success('Role updated')
    },
    onError: () => toast.error('Failed to update role'),
  })
}

function useDeactivateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (memberId: string) => {
      await api.patch(`/api/workspaces/members/${memberId}/deactivate`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      toast.success('Member deactivated')
    },
    onError: () => toast.error('Failed to deactivate member'),
  })
}

// ── Avatar ─────────────────────────────────────────────────────────────────

function MemberAvatar({ name, role }: { name: string; role: string }) {
  const initials = getInitials(name)
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue = (hash * 37) % 360

  return (
    <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-[700] text-white"
      style={{ background: `linear-gradient(135deg, hsl(${hue},60%,42%) 0%, hsl(${(hue + 40) % 360},65%,52%) 100%)` }}>
      {initials}
      {role === 'owner' && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full"
          style={{ background: '#F59E0B', border: '1.5px solid white' }}>
          <Crown className="h-2.5 w-2.5 text-white" strokeWidth={2} />
        </span>
      )}
    </div>
  )
}

// ── Member row menu ────────────────────────────────────────────────────────

function MemberMenu({ member, currentUserId }: { member: TeamMember; currentUserId: string }) {
  const [open, setOpen] = useState(false)
  const { mutate: updateRole } = useUpdateRole()
  const { mutate: deactivate } = useDeactivateMember()

  if (member.id === currentUserId || member.role === 'owner') return null

  return (
    <div className="relative">
      <button type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className="flex h-7 w-7 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-100"
        style={{ color: '#6B6258' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F2EE' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden"
            style={{ borderRadius: 12, border: '1px solid #EDE8E1', background: 'white', boxShadow: '0 16px 40px -6px rgba(26,21,18,0.16)' }}>
            {member.role !== 'manager' && (
              <button type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false); updateRole({ memberId: member.id, role: 'manager' }) }}
                className="w-full px-4 py-2.5 text-left text-[13px]"
                style={{ color: '#1A1512' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F9F7F4' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                Make Manager
              </button>
            )}
            {member.role !== 'staff' && (
              <button type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false); updateRole({ memberId: member.id, role: 'staff' }) }}
                className="w-full px-4 py-2.5 text-left text-[13px]"
                style={{ color: '#1A1512' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F9F7F4' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                Set as Staff
              </button>
            )}
            <div style={{ height: 1, background: '#F5F2EE' }} />
            <button type="button"
              onClick={(e) => {
                e.stopPropagation(); setOpen(false)
                if (window.confirm(`Deactivate ${member.name}?`)) deactivate(member.id)
              }}
              className="w-full px-4 py-2.5 text-left text-[13px]"
              style={{ color: '#DC2626' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              Deactivate
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function TeamSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 p-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border px-4 py-3.5 animate-pulse"
          style={{ background: 'white', borderColor: '#EDE8E1', opacity: 1 - i * 0.15 }}>
          <div className="h-10 w-10 rounded-full flex-shrink-0" style={{ background: '#F0ECE7' }} />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 rounded-full" style={{ background: '#F0ECE7' }} />
            <div className="h-3 w-44 rounded-full" style={{ background: '#F5F2EE' }} />
          </div>
          <div className="h-6 w-16 rounded-full" style={{ background: '#F0ECE7' }} />
        </div>
      ))}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function TeamPage() {
  const currentUser = useAuthStore((s) => s.user)
  const { data: members = [], isLoading } = useTeam()

  const active = members.filter((m) => m.isActive)
  const inactive = members.filter((m) => !m.isActive)

  const countByRole = active.reduce((acc, m) => {
    acc[m.role] = (acc[m.role] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex h-full flex-col" style={{ background: '#F9F7F4' }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-[800] tracking-tight"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
              Team
            </h1>
            <p className="mt-0.5 text-[13px]" style={{ color: '#6B6258' }}>
              Manage your practice's team members and roles
            </p>
          </div>
          <button
            onClick={() => toast('Invite member coming soon')}
            className="flex h-9 items-center gap-2 rounded-xl px-4 text-[13px] font-[700] text-white transition-all duration-150 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #C84B0F 0%, #F97316 100%)',
              boxShadow: '0 4px 14px rgba(200,75,15,0.30)',
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(200,75,15,0.42)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(200,75,15,0.30)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <UserPlus className="h-4 w-4" strokeWidth={2.2} /> Invite Member
          </button>
        </div>

        {/* Role pills */}
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(ROLE_CFG).map(([role, cfg]) => {
            const Icon = cfg.icon
            const count = countByRole[role] ?? 0
            return (
              <div key={role} className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                style={{ background: 'white', border: `1px solid ${cfg.border}`, boxShadow: '0 1px 4px rgba(26,21,18,0.05)' }}>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: cfg.bg }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[18px] font-[800] leading-none"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: cfg.color }}>
                    {isLoading ? '—' : count}
                  </p>
                  <p className="text-[10.5px] font-[500]" style={{ color: '#A09890' }}>{cfg.label}</p>
                </div>
              </div>
            )
          })}
          <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
            style={{ background: 'white', border: '1px solid #EDE8E1', boxShadow: '0 1px 4px rgba(26,21,18,0.05)' }}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: '#F9F7F4' }}>
              <Users2 className="h-3.5 w-3.5" style={{ color: '#6B6258' }} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[18px] font-[800] leading-none"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
                {isLoading ? '—' : active.length}
              </p>
              <p className="text-[10.5px] font-[500]" style={{ color: '#A09890' }}>Total Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Members card ── */}
      <div className="mx-6 mb-6 flex flex-1 flex-col overflow-hidden rounded-2xl"
        style={{
          background: 'white',
          border: '1px solid #EDE8E1',
          boxShadow: '0 4px 24px -4px rgba(26,21,18,0.10), 0 1px 4px rgba(26,21,18,0.06)',
        }}
      >
        <div className="flex-shrink-0 px-5 py-3.5" style={{ borderBottom: '1px solid #F5F2EE' }}>
          <p className="text-[10.5px] font-[700] uppercase tracking-wider"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#A09890' }}>
            Active Members ({active.length})
          </p>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <TeamSkeleton />
          ) : active.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#F5F2EE' }}>
                <Users2 className="h-7 w-7" style={{ color: '#A09890' }} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[14px] font-[700]" style={{ color: '#1A1512', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  No team members yet
                </p>
                <p className="mt-1 text-[13px]" style={{ color: '#A09890' }}>
                  Invite members to collaborate on your practice.
                </p>
              </div>
            </div>
          ) : (
            active.map((member, idx) => {
              const roleCfg = ROLE_CFG[member.role] ?? ROLE_CFG.staff
              const RoleIcon = roleCfg.icon
              const isMe = member.id === currentUser?.id
              const isLast = idx === active.length - 1

              return (
                <div key={member.id}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors duration-100"
                  style={{ borderBottom: isLast ? 'none' : '1px solid #F9F7F4' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAF8' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <MemberAvatar name={member.name} role={member.role} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13.5px] font-[600]" style={{ color: '#1A1512' }}>
                        {member.name}
                      </p>
                      {isMe && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-[700]"
                          style={{ background: '#F5F2EE', color: '#6B6258' }}>
                          You
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1.5 text-[12px] mt-0.5" style={{ color: '#A09890' }}>
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-[700]"
                    style={{ background: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.border}` }}>
                    <RoleIcon className="h-3 w-3" />
                    {roleCfg.label}
                  </span>

                  <p className="hidden text-[11px] sm:block" style={{ color: '#A09890' }}>
                    Joined {new Date(member.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </p>

                  <MemberMenu member={member} currentUserId={currentUser?.id ?? ''} />
                </div>
              )
            })
          )}

          {/* Inactive section */}
          {inactive.length > 0 && (
            <>
              <div className="px-5 py-2.5" style={{ background: '#FAFAF8', borderTop: '1px solid #F5F2EE', borderBottom: '1px solid #F5F2EE' }}>
                <p className="text-[10.5px] font-[700] uppercase tracking-wider"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#A09890' }}>
                  Inactive ({inactive.length})
                </p>
              </div>
              {inactive.map((member, idx) => (
                <div key={member.id}
                  className="flex items-center gap-4 px-5 py-4 opacity-50"
                  style={{ borderBottom: idx === inactive.length - 1 ? 'none' : '1px solid #F9F7F4' }}
                >
                  <MemberAvatar name={member.name} role={member.role} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-[600] line-through" style={{ color: '#1A1512' }}>{member.name}</p>
                    <p className="text-[12px]" style={{ color: '#A09890' }}>{member.email}</p>
                  </div>
                  <span className="text-[11px]" style={{ color: '#A09890' }}>Deactivated</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
