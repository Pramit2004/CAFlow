import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name: string
  src?: string
  size?: AvatarSize
  role?: string
  className?: string
}

const SIZE_MAP: Record<AvatarSize, { wrapper: string; text: string; badge: string }> = {
  xs: { wrapper: 'h-5 w-5', text: 'text-[8px]', badge: 'h-2 w-2 border' },
  sm: { wrapper: 'h-6 w-6', text: 'text-[9px]', badge: 'h-2.5 w-2.5 border' },
  md: { wrapper: 'h-8 w-8', text: 'text-[11px]', badge: 'h-3 w-3 border-2' },
  lg: { wrapper: 'h-10 w-10', text: 'text-[13px]', badge: 'h-3.5 w-3.5 border-2' },
  xl: { wrapper: 'h-12 w-12', text: 'text-[15px]', badge: 'h-4 w-4 border-2' },
}

export function Avatar({ name, src, size = 'md', role, className }: AvatarProps) {
  const { wrapper, text, badge } = SIZE_MAP[size]
  const initials = getInitials(name)

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-[600] overflow-hidden',
          'bg-gradient-to-br from-brand-400 to-brand-700 text-white',
          wrapper,
          text,
        )}
        style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {role === 'owner' && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-[var(--surface)] bg-amber-400',
            badge,
          )}
        />
      )}
    </div>
  )
}

export function AvatarGroup({
  users,
  max = 4,
  size = 'sm',
}: {
  users: { name: string; src?: string }[]
  max?: number
  size?: AvatarSize
}) {
  const shown = users.slice(0, max)
  const overflow = users.length - max

  return (
    <div className="flex -space-x-1.5">
      {shown.map((user, i) => (
        <div key={i} className="ring-2 ring-[var(--surface)] rounded-full">
          <Avatar name={user.name} src={user.src} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full ring-2 ring-[var(--surface)]',
            'bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-[600]',
            SIZE_MAP[size].wrapper,
            SIZE_MAP[size].text,
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
