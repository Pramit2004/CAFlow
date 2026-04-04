import { useState } from 'react'
import { Search, Bell, Command } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui.store'

export function Header() {
  useUIStore()
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-[56px] flex-shrink-0 items-center gap-3 px-5',
        'transition-all duration-300',
      )}
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #EDE8E1',
      }}
    >
      {/* Search */}
      <div className="relative flex flex-1 items-center max-w-[440px]">
        <Search
          className="absolute left-3 h-[13px] w-[13px] transition-colors duration-150 pointer-events-none"
          style={{ color: searchFocused ? '#C84B0F' : '#C9BFB3' }}
          strokeWidth={2}
        />
        <input
          type="text"
          placeholder="Search clients, cases, documents…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="h-[34px] w-full rounded-lg pl-8 pr-12 text-[13px] outline-none transition-all duration-150"
          style={{
            background: searchFocused ? '#FFFFFF' : '#F5F2EE',
            border: searchFocused ? '1.5px solid #C84B0F' : '1.5px solid transparent',
            boxShadow: searchFocused ? '0 0 0 3px rgba(200,75,15,0.12)' : 'none',
            color: '#1A1512',
          }}
        />
        <kbd
          className={cn(
            'absolute right-2.5 hidden items-center gap-0.5 rounded-md px-1.5 py-0.5 sm:flex transition-opacity duration-150',
            searchFocused ? 'opacity-0' : 'opacity-100',
          )}
          style={{ background: '#EDE8E1', border: '1px solid #D9D1C7', fontSize: '9px', fontWeight: 500, color: '#A09890' }}
        >
          <Command className="h-2.5 w-2.5" />
          <span>K</span>
        </kbd>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-1">
        {/* Notifications */}
        <button
          className="relative flex h-[34px] w-[34px] items-center justify-center rounded-lg transition-all duration-150"
          style={{ color: '#6B6258' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F2EE'; e.currentTarget.style.color = '#1A1512' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B6258' }}
        >
          <Bell className="h-[15px] w-[15px]" strokeWidth={1.8} />
          <span
            className="absolute right-[7px] top-[7px] h-[7px] w-[7px] rounded-full"
            style={{ background: '#C84B0F', border: '1.5px solid #FFFFFF' }}
          />
        </button>

        <div className="mx-1 h-5 w-px" style={{ background: '#EDE8E1' }} />

        <div id="header-breadcrumb" />
      </div>
    </header>
  )
}
