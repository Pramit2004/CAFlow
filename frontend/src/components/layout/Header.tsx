import { useState } from 'react'
import { Search, Bell, Command } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useUIStore } from '@/store/ui.store'

export function Header() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 flex-shrink-0 items-center gap-3',
        'border-b border-[var(--border)] bg-[var(--bg)]/90 px-5',
        'backdrop-blur-md',
        'transition-all duration-300',
      )}
    >
      {/* Search bar */}
      <div
        className={cn(
          'relative flex flex-1 items-center transition-all duration-200',
          'max-w-[420px]',
        )}
      >
        <Search
          className={cn(
            'absolute left-3 h-[14px] w-[14px] transition-colors duration-150',
            searchFocused ? 'text-brand-600 dark:text-brand-400' : 'text-[var(--text-tertiary)]',
          )}
        />
        <input
          type="text"
          placeholder="Search clients, cases, documents…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={cn(
            'h-8 w-full rounded-lg border pl-8 pr-12 text-[13px] outline-none transition-all duration-150',
            'bg-[var(--surface)] placeholder:text-[var(--text-tertiary)]',
            'text-[var(--text-primary)]',
            searchFocused
              ? 'border-brand-400 shadow-[0_0_0_3px_rgba(18,110,71,0.12)] dark:border-brand-600'
              : 'border-[var(--border)] hover:border-[var(--border-strong)]',
          )}
        />
        <kbd
          className={cn(
            'absolute right-2.5 hidden items-center gap-0.5 rounded-md border px-1.5 py-0.5 sm:flex',
            'border-[var(--border)] bg-[var(--bg-subtle)]',
            'text-[9px] font-[500] text-[var(--text-tertiary)]',
            'transition-opacity duration-150',
            searchFocused ? 'opacity-0' : 'opacity-100',
          )}
        >
          <Command className="h-2.5 w-2.5" />
          <span>K</span>
        </kbd>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle variant="icon" />

        {/* Notifications */}
        <button
          className={cn(
            'relative flex h-8 w-8 items-center justify-center rounded-lg',
            'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
            'transition-all duration-150',
          )}
        >
          <Bell className="h-[15px] w-[15px]" strokeWidth={1.8} />
          {/* Unread dot */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-[var(--bg)] bg-brand-500" />
        </button>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-[var(--border)]" />

        {/* Current page breadcrumb slot — injected by PageHeader */}
        <div id="header-breadcrumb" />
      </div>
    </header>
  )
}
