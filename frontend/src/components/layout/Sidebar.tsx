import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, FolderOpen, FileText, Calendar,
  Receipt, MessageSquare, Users2, Settings, ChevronLeft,
  ChevronRight, Zap, LogOut, CheckSquare,
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
      <rect width="32" height="32" rx="9" fill="url(#sbLogoGrad)" />
      <path d="M8 21C8 21 10.5 14.5 16.5 11.5C22.5 8.5 24.5 12.5 24.5 12.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M11.5 25C11.5 25 13.5 19 19.5 16.5C22.5 15 24.5 16 24.5 16" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="24.5" cy="12.5" r="2.5" fill="white" />
      <defs>
        <linearGradient id="sbLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7D2D09" />
          <stop offset="1" stopColor="#F97316" />
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
        'fixed inset-y-0 left-0 z-40 flex flex-col select-none',
        'transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        sidebarOpen ? 'w-[232px]' : 'w-[60px]',
      )}
      style={{ background: '#FAFAF8', borderRight: '1px solid #EDE8E1' }}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-[56px] flex-shrink-0 items-center',
          sidebarOpen ? 'px-4 gap-3' : 'justify-center px-3.5',
        )}
        style={{ borderBottom: '1px solid #EDE8E1' }}
      >
        <LogoMark size={30} />
        {sidebarOpen && (
          <div className="min-w-0 animate-fade-in-fast">
            <span
              className="block text-[15px] font-[800] tracking-tight text-[#1A1512]"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
            >
              CA<span className="text-brand-600">Flow</span>
            </span>
            {workspace && (
              <span className="block truncate text-[10.5px] font-[500] leading-tight mt-0.5" style={{ color: '#A09890' }}>
                {workspace.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            {sidebarOpen ? (
              <p className="mb-1 px-2.5 text-[9.5px] font-[700] uppercase tracking-[0.14em]" style={{ color: '#C9BFB3' }}>
                {group.label}
              </p>
            ) : (
              <div className="mb-2 mx-2 h-px" style={{ background: '#EDE8E1' }} />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      title={!sidebarOpen ? item.label : undefined}
                      className={cn(
                        'group relative flex items-center rounded-[10px] text-[13px] transition-all duration-150 outline-none',
                        sidebarOpen ? 'h-[34px] gap-2.5 px-2.5' : 'h-[36px] w-[36px] justify-center mx-auto',
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'hover:bg-[#F0ECE7] hover:text-[#1A1512]',
                      )}
                      style={!isActive ? { color: '#6B6258' } : {}}
                    >
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full bg-brand-600"
                        />
                      )}
                      <item.icon
                        className={cn(
                          'flex-shrink-0 transition-colors duration-150',
                          sidebarOpen ? 'h-[14px] w-[14px]' : 'h-[15px] w-[15px]',
                          isActive
                            ? 'text-brand-600'
                            : 'text-[#C9BFB3] group-hover:text-[#6B6258]',
                        )}
                        strokeWidth={isActive ? 2.3 : 1.8}
                      />
                      {sidebarOpen && (
                        <>
                          <span className={cn('flex-1 truncate leading-none', isActive ? 'font-[600]' : 'font-[500]')}>
                            {item.label}
                          </span>
                          {item.badge !== undefined && (
                            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-100 px-1.5 text-[9.5px] font-[700] text-brand-700">
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
        <div className="mx-2.5 mb-2.5 rounded-xl overflow-hidden" style={{ border: '1px solid #FFE4D0' }}>
          <div className="p-3.5" style={{ background: 'linear-gradient(135deg, #FFF4EE 0%, #FFE4D0 100%)' }}>
            <div className="flex items-start gap-2.5 mb-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-600">
                <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2} />
              </div>
              <div>
                <p
                  className="text-[11.5px] font-[700] leading-tight"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#7D2D09' }}
                >
                  Upgrade to Growth
                </p>
                <p className="text-[10.5px] leading-snug mt-0.5" style={{ color: '#A33A0C', opacity: 0.75 }}>
                  Unlock billing, deadlines &amp; team.
                </p>
              </div>
            </div>
            <button
              className="w-full rounded-lg px-3 py-1.5 text-[11.5px] font-[700] text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#C84B0F', boxShadow: '0 4px 12px rgba(200,75,15,0.3)' }}
            >
              Upgrade — ₹1,999/mo
            </button>
          </div>
        </div>
      )}

      {/* User footer */}
      <div
        className={cn('flex-shrink-0 p-2', !sidebarOpen && 'flex justify-center')}
        style={{ borderTop: '1px solid #EDE8E1' }}
      >
        {sidebarOpen ? (
          <div
            className="flex items-center gap-2.5 rounded-[10px] px-2 py-2 cursor-pointer group transition-colors duration-150"
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F0ECE7')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <UserAvatar name={user?.name ?? 'User'} role={user?.role} />
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[12.5px] font-[600]"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}
              >
                {user?.name ?? 'User'}
              </p>
              <p className="text-[10px] capitalize" style={{ color: '#A09890' }}>{user?.role ?? 'staff'}</p>
            </div>
            <LogOut className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ color: '#C9BFB3' }} />
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
        className="absolute -right-[11px] top-[68px] flex h-[22px] w-[22px] items-center justify-center rounded-full z-50 transition-all duration-200 hover:scale-110"
        style={{
          background: '#FFFFFF',
          border: '1px solid #EDE8E1',
          boxShadow: '0 1px 4px rgba(26,21,18,0.10)',
          color: '#A09890',
        }}
      >
        {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
    </aside>
  )
}

function UserAvatar({ name, role, size = 'md' }: { name: string; role?: string; size?: 'sm' | 'md' }) {
  const initials = getInitials(name)
  return (
    <div
      className={cn(
        'relative flex-shrink-0 rounded-full flex items-center justify-center text-white font-[700]',
        size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-[30px] w-[30px] text-[11px]',
      )}
      style={{
        background: 'linear-gradient(135deg, #C84B0F 0%, #F97316 100%)',
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      {initials}
      {role === 'owner' && size !== 'sm' && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full"
          style={{ background: '#F5A623', border: '2px solid #FAFAF8' }}
        />
      )}
    </div>
  )
}
