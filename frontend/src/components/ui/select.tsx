import { forwardRef, useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ options, value, onChange, placeholder = 'Select...', label, error, hint, disabled, required, className }, _ref) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selected = options.find((o) => o.value === value)

    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }, [])

    const inputId = label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div ref={containerRef} className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[12.5px] font-[500] text-[var(--text-primary)]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <button
            type="button"
            id={inputId}
            disabled={disabled}
            onClick={() => !disabled && setOpen((o) => !o)}
            className={cn(
              'flex h-8 w-full items-center justify-between rounded-lg border px-3 text-[13px] outline-none transition-all duration-150',
              'bg-[var(--surface)] text-left',
              disabled && 'cursor-not-allowed opacity-50',
              error
                ? 'border-red-400 focus:border-red-500'
                : open
                  ? 'border-brand-400 shadow-[0_0_0_3px_rgba(200,75,15,0.12)]'
                  : 'border-[var(--border)] hover:border-[var(--border-strong)]',
            )}
          >
            <span className={cn(selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]')}>
              {selected ? (
                <span className="flex items-center gap-2">
                  {selected.icon}
                  {selected.label}
                </span>
              ) : (
                placeholder
              )}
            </span>
            <ChevronDown
              className={cn('h-3.5 w-3.5 flex-shrink-0 text-[var(--text-tertiary)] transition-transform duration-150', open && 'rotate-180')}
            />
          </button>

          {open && (
            <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange?.(opt.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-[13px] transition-colors duration-75',
                    'hover:bg-[var(--bg-subtle)]',
                    value === opt.value
                      ? 'bg-brand-50 text-brand-700 '
                      : 'text-[var(--text-primary)]',
                  )}
                >
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    {opt.label}
                  </span>
                  {value === opt.value && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && <p className="text-[11.5px] text-red-500">{error}</p>}
        {hint && !error && <p className="text-[11.5px] text-[var(--text-tertiary)]">{hint}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'

// ── Multi-select tag input ─────────────────────────────────────────────────
interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  label?: string
  placeholder?: string
  error?: string
  suggestions?: string[]
}

export function TagInput({ value, onChange, label, placeholder = 'Add tag...', error, suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase()
    if (t && !value.includes(t)) {
      onChange([...value, t])
    }
    setInput('')
    setShowSuggestions(false)
  }

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag))

  const filtered = suggestions.filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s))

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[12.5px] font-[500] text-[var(--text-primary)]"
          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
          {label}
        </label>
      )}
      <div className={cn(
        'min-h-[32px] w-full flex-wrap flex items-center gap-1.5 rounded-lg border px-2 py-1 transition-all duration-150',
        'bg-[var(--surface)]',
        error ? 'border-red-400' : 'border-[var(--border)] focus-within:border-brand-400 focus-within:shadow-[0_0_0_3px_rgba(200,75,15,0.12)]',
      )}>
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-[11.5px] font-[500] text-brand-700 ">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="leading-none opacity-60 hover:opacity-100">×</button>
          </span>
        ))}
        <div className="relative flex-1">
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowSuggestions(true) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input) }
              if (e.key === 'Backspace' && !input && value.length > 0) removeTag(value[value.length - 1])
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={value.length === 0 ? placeholder : ''}
            className="w-full min-w-[80px] bg-transparent text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
          />
          {showSuggestions && filtered.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg">
              {filtered.slice(0, 5).map((s) => (
                <button key={s} type="button" onMouseDown={() => addTag(s)}
                  className="w-full px-3 py-1.5 text-left text-[12.5px] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-[11.5px] text-red-500">{error}</p>}
    </div>
  )
}
