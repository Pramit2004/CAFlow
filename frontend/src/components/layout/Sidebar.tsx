import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, FolderOpen, FileText, Calendar,
  Receipt, MessageSquare, Users2, Settings, ChevronLeft,
  ChevronRight, Sparkles, LogOut, CheckSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui.store'
import { useWorkspaceStore } from '@/store/workspace.store'
import { useAuthStore } from '@/store/auth.store'
import { getInitials } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number | string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'My Tasks', href: '/tasks', icon: CheckSquare },
    ],
  },
  {
    label: 'Practice',
    items: [
      { label: 'Clients', href: '/clients', icon: Users },
      { label: 'Cases', href: '/cases', icon: FolderOpen },
      { label: 'Documents', href: '/documents', icon: FileText },
      { label: 'Compliance', href: '/calendar', icon: Calendar },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Fees & Billing', href: '/fees/invoices', icon: Receipt },
      { label: 'Communications', href: '/communications', icon: MessageSquare },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Team', href: '/team', icon: Users2 },
      { label: 'Settings', href: '/settings/firm', icon: Settings },
    ],
  },
]

function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
      <path d="M8 20C8 20 10 14 16 11C22 8 24 12 24 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M11 24C11 24 13 18 19 16C22 15 24 16 24 16" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="12" r="2.5" fill="white" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#126E47" />
          <stop offset="1" stopColor="#3BBE87" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const workspace = useWorkspaceStore((s) => s.workspace)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col',
        'transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'bg-[var(--surface)] border-r border-[var(--border)]',
        sidebarOpen ? 'w-[240px]' : 'w-[60px]',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-14 flex-shrink-0 items-center border-b border-[var(--border)]',
        sidebarOpen ? 'px-4 gap-3' : 'justify-center px-3.5',
      )}>
        <LogoMark size={30} />
        {sidebarOpen && (
          <div className="min-w-0 animate-fade-in">
            <span className="block text-[15px] font-[700] tracking-tight text-[var(--text-primary)]"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
              CA<span className="text-brand-600 dark:text-brand-400">Flow</span>
            </span>
            {workspace && (
              <span className="block truncate text-[10px] font-[500] text-[var(--text-tertiary)] leading-tight mt-0.5">
                {workspace.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            {sidebarOpen && (
              <p className="mb-1 px-2.5 text-[9px] font-[600] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                {group.label}
              </p>
            )}
            {!sidebarOpen && <div className="mb-2 h-px bg-[var(--border)] mx-2" />}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      title={!sidebarOpen ? item.label : undefined}
                      className={cn(
                        'group relative flex items-center rounded-lg text-[13px] transition-all duration-150',
                        sidebarOpen ? 'h-8 gap-2.5 px-2.5' : 'h-9 w-9 justify-center mx-auto',
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
                      )}
                    >
                      {isActive && !sidebarOpen && (
                        <span className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-brand-600 dark:bg-brand-400" />
                      )}
                      <item.icon
                        className={cn(
                          'flex-shrink-0 transition-colors duration-150',
                          sidebarOpen ? 'h-[14px] w-[14px]' : 'h-[15px] w-[15px]',
                          isActive ? 'text-brand-600 dark:text-brand-400' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]',
                        )}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 truncate font-[500] leading-none">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-100 px-1 text-[9px] font-[700] text-brand-700 dark:bg-brand-900/50 dark:text-brand-400">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Upgrade banner */}
      {sidebarOpen && workspace?.plan === 'starter' && (
        <div className="mx-2.5 mb-2.5 rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-[#f0faf5] p-3 dark:border-brand-900/50 dark:from-brand-950/40 dark:to-brand-900/20 dark:bg-none">
          <p className="text-[11.5px] font-[600] text-brand-700 dark:text-brand-400 mb-1"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
            Upgrade to Growth
          </p>
          <p className="text-[10.5px] leading-snug text-brand-600/70 dark:text-brand-500/80 mb-2">
            Deadlines, billing &amp; team features.
          </p>
          <button className="w-full rounded-lg bg-brand-600 px-3 py-1.5 text-[11.5px] font-[600] text-white transition-all duration-150 hover:bg-brand-700 active:scale-[0.98]">
            Upgrade — ₹1,999/mo
          </button>
        </div>
      )}

      {/* User footer */}
      <div className={cn(
        'flex-shrink-0 border-t border-[var(--border)] p-2',
        !sidebarOpen && 'flex justify-center',
      )}>
        {sidebarOpen ? (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-[var(--bg-subtle)] transition-colors duration-150 cursor-pointer group">
            <UserAvatar name={user?.name ?? 'User'} role={user?.role} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-[600] text-[var(--text-primary)]"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                {user?.name ?? 'User'}
              </p>
              <p className="text-[10px] capitalize text-[var(--text-tertiary)]">{user?.role ?? 'staff'}</p>
            </div>
            <LogOut className="h-3.5 w-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
          </div>
        ) : (
          <div className="py-1">
            <UserAvatar name={user?.name ?? 'U'} size="sm" />
          </div>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-[11px] top-[70px] flex h-[22px] w-[22px] items-center justify-center',
          'rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-sm',
          'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:shadow-md hover:scale-110',
          'transition-all duration-200 z-50',
        )}
      >
        {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
    </aside>
  )
}

function UserAvatar({ name, role, size = 'md' }: { name: string; role?: string; size?: 'sm' | 'md' }) {
  const initials = getInitials(name)
  return (
    <div className={cn(
      'relative flex-shrink-0 rounded-full flex items-center justify-center text-white font-[600]',
      'bg-gradient-to-br from-brand-500 to-brand-700',
      size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-8 w-8 text-[11px]',
    )}
      style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {initials}
      {role === 'owner' && size !== 'sm' && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-amber-500" />
      )}
    </div>
  )
}
