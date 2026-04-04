import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  footer?: React.ReactNode
  className?: string
  persistent?: boolean
}

const sizes = {
  sm:   'max-w-md',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-3xl',
  full: 'max-w-[92vw]',
}

export function Modal({
  open, onClose, title, description, children, size = 'md',
  footer, className, persistent = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !persistent) onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose, persistent])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-4 sm:pb-0" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-in fade-in-0 duration-200"
        style={{ background: 'rgba(26,21,18,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={() => !persistent && onClose()}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'relative z-10 w-full bg-white',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-250',
          sizes[size], className,
        )}
        style={{
          borderRadius: 20,
          border: '1px solid #EDE8E1',
          boxShadow: '0 32px 80px -12px rgba(26,21,18,0.22), 0 8px 24px -4px rgba(26,21,18,0.12)',
        }}
      >
        {(title || description) && (
          <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: '1px solid #EDE8E1' }}>
            <div>
              {title && (
                <h2 className="text-[17px] font-[800] tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
                  {title}
                </h2>
              )}
              {description && <p className="mt-1 text-[13px]" style={{ color: '#6B6258' }}>{description}</p>}
            </div>
            <button
              type="button" onClick={onClose}
              className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-150"
              style={{ background: '#F5F2EE', color: '#6B6258' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#EDE8E1' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F2EE' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid #EDE8E1' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Drawer (slide-in from right) ──────────────────────────────────────────
interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  width?: string
  footer?: React.ReactNode
}

export function Drawer({ open, onClose, title, description, children, width = 'w-[480px]', footer }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in-0 duration-200"
        onClick={onClose}
      />
      <div className={cn(
        'relative z-10 flex h-full flex-col bg-[var(--surface)] shadow-2xl',
        'border-l border-[var(--border)]',
        'animate-in slide-in-from-right duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        width, 'max-w-full',
      )}>
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-[var(--border)] px-6 py-4 flex-shrink-0">
            <div>
              {title && (
                <h2 className="text-[16px] font-[700] text-[var(--text-primary)]"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-[12.5px] text-[var(--text-tertiary)]">{description}</p>
              )}
            </div>
            <button type="button" onClick={onClose}
              className="ml-4 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] px-6 py-4 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
