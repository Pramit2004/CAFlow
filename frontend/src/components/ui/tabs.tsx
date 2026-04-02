import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
  variant?: 'line' | 'pill'
  className?: string
}

export function Tabs({ tabs, active, onChange, variant = 'line', className }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div className={cn('flex items-center gap-1 rounded-lg bg-[var(--bg-subtle)] p-1', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-[500] transition-all duration-150',
              active === tab.id
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}
          >
            {tab.icon && <span className="text-current">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-[600] leading-none',
                active === tab.id ? 'bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300' : 'bg-[var(--border)] text-[var(--text-tertiary)]',
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  // line variant (default)
  return (
    <div className={cn('flex border-b border-[var(--border)]', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-[500] transition-colors duration-150',
            active === tab.id
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          )}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
          {tab.badge !== undefined && (
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-[600] leading-none',
              active === tab.id ? 'bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300' : 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)]',
            )}>
              {tab.badge}
            </span>
          )}
          {/* Active indicator */}
          {active === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-brand-500" />
          )}
        </button>
      ))}
    </div>
  )
}
