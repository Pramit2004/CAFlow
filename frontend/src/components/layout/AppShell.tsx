import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useUIStore } from '@/store/ui.store'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

export function AppShell() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const isMobile = useIsMobile()

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [isMobile, setSidebarOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <Sidebar />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          sidebarOpen ? 'ml-[240px]' : 'ml-[60px]',
          isMobile && 'ml-0',
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] p-5 md:p-6 lg:p-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
