import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, FolderOpen, FileText, Settings,
} from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useUIStore } from '@/store/ui.store'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

export function AppShell() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [isMobile, setSidebarOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar — desktop only */}
      {!isMobile && <Sidebar />}

      {/* Mobile sidebar sheet */}
      {isMobile && sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(26,21,18,0.35)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar />
        </>
      )}

      {/* Main */}
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          !isMobile && (sidebarOpen ? 'ml-[232px]' : 'ml-[60px]'),
        )}
        style={isMobile ? { marginLeft: 0, paddingBottom: '60px' } : {}}
      >
        <Header />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom bar */}
      {isMobile && <MobileBottomNav />}
    </div>
  )
}

const MOBILE_TABS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/cases', icon: FolderOpen, label: 'Cases' },
  { href: '/documents', icon: FileText, label: 'Docs' },
  { href: '/settings/firm', icon: Settings, label: 'More' },
]

function MobileBottomNav() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 flex h-[60px] items-center justify-around"
      style={{
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid #EDE8E1',
        paddingBottom: 'max(env(safe-area-inset-bottom), 4px)',
      }}
    >
      {MOBILE_TABS.map(({ href, icon: Icon, label }) => {
        const isActive =
          location.pathname === href ||
          (href !== '/dashboard' && location.pathname.startsWith(href))
        return (
          <NavLink
            key={href}
            to={href}
            className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-150 min-w-0"
            style={{ color: isActive ? '#C84B0F' : '#A09890' }}
          >
            {isActive && (
              <span
                className="absolute -top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-b-full"
                style={{ background: '#C84B0F' }}
              />
            )}
            <Icon
              className="h-[19px] w-[19px] transition-all duration-150"
              strokeWidth={isActive ? 2.3 : 1.8}
            />
            <span
              className="text-[10px] leading-none transition-all duration-150"
              style={{ fontWeight: isActive ? 600 : 500 }}
            >
              {label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
