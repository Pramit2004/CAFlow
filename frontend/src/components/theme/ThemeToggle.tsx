import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'icon' | 'full'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  if (variant === 'icon') {
    return (
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={cn(
          'group relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
          'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          'hover:bg-[var(--bg-subtle)]',
          className,
        )}
        aria-label="Toggle theme"
      >
        <Sun
          className={cn(
            'absolute h-4 w-4 transition-all duration-300',
            resolvedTheme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90',
          )}
        />
        <Moon
          className={cn(
            'absolute h-4 w-4 transition-all duration-300',
            resolvedTheme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90',
          )}
        />
      </button>
    )
  }

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-lg p-0.5',
        'bg-[var(--bg-subtle)] border border-[var(--border)]',
        className,
      )}
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
            theme === value
              ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          )}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
