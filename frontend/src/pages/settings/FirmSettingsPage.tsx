import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Save, Loader2, CheckCircle2, Globe, Mail, Phone, MapPin } from 'lucide-react'
import { api } from '@/services/api'
import { useWorkspaceStore } from '@/store/workspace.store'

// ── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  name:    z.string().min(2, 'Name required').max(255),
  email:   z.string().email('Invalid email').optional().or(z.literal('')),
  phone:   z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city:    z.string().optional().or(z.literal('')),
  state:   z.string().optional().or(z.literal('')),
  pincode: z.string().optional().or(z.literal('')),
  gstin:   z.string().optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

// ── Hooks ───────────────────────────────────────────────────────────────────

function useWorkspace() {
  return useQuery({
    queryKey: ['workspace'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any }>('/api/workspaces/me')
      return res.data.data
    },
    staleTime: 60_000,
  })
}

function useUpdateWorkspace() {
  const qc = useQueryClient()
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace)
  return useMutation({
    mutationFn: async (payload: Partial<FormValues>) => {
      const res = await api.patch<{ success: boolean; data: any }>('/api/workspaces/me', payload)
      return res.data.data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['workspace'] })
      setWorkspace(data)
      toast.success('Firm settings saved')
    },
    onError: () => toast.error('Failed to save settings'),
  })
}

// ── Field ───────────────────────────────────────────────────────────────────

function Field({ label, error, hint, required, children }: {
  label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-[600]"
        style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11.5px] font-[500]" style={{ color: '#DC2626' }}>{error}</p>}
      {hint && !error && <p className="text-[11px]" style={{ color: '#A09890' }}>{hint}</p>}
    </div>
  )
}

const inputCls = 'h-10 w-full rounded-xl border px-3.5 text-[13.5px] outline-none transition-all duration-150 bg-white'
const inputStyle = { borderColor: '#EDE8E1', color: '#1A1512' }
const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#C84B0F'
    e.target.style.boxShadow = '0 0 0 3px rgba(200,75,15,0.12)'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#EDE8E1'
    e.target.style.boxShadow = 'none'
  },
}

// ── Section card ────────────────────────────────────────────────────────────

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'white', border: '1px solid #EDE8E1', boxShadow: '0 1px 4px rgba(26,21,18,0.05)' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid #F5F2EE' }}>
        <p className="text-[14px] font-[700]" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
          {title}
        </p>
        {desc && <p className="mt-0.5 text-[12.5px]" style={{ color: '#6B6258' }}>{desc}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function FirmSettingsPage() {
  const { data: workspace, isLoading } = useWorkspace()
  const { mutate: save, isPending } = useUpdateWorkspace()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', email: '', phone: '', website: '',
      address: '', city: '', state: '', pincode: '', gstin: '',
    },
  })

  useEffect(() => {
    if (workspace) {
      reset({
        name:    workspace.name ?? '',
        email:   workspace.email ?? '',
        phone:   workspace.phone ?? '',
        website: workspace.website ?? '',
        address: workspace.address ?? '',
        city:    workspace.city ?? '',
        state:   workspace.state ?? '',
        pincode: workspace.pincode ?? '',
        gstin:   workspace.gstin ?? '',
      })
    }
  }, [workspace, reset])

  const onSubmit = (values: FormValues) => {
    save(values, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        reset(values)
      },
    })
  }

  return (
    <div className="flex h-full flex-col" style={{ background: '#F9F7F4' }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-[800] tracking-tight"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
              Firm Settings
            </h1>
            <p className="mt-0.5 text-[13px]" style={{ color: '#6B6258' }}>
              Manage your practice's profile and preferences
            </p>
          </div>

          {isDirty && (
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isPending}
              className="flex h-9 items-center gap-2 rounded-xl px-4 text-[13px] font-[700] text-white transition-all duration-150 disabled:opacity-60"
              style={{
                background: saved ? '#16A34A' : 'linear-gradient(135deg, #C84B0F 0%, #F97316 100%)',
                boxShadow: '0 4px 14px rgba(200,75,15,0.30)',
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              }}
            >
              {isPending
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                : saved
                ? <><CheckCircle2 className="h-3.5 w-3.5" /> Saved</>
                : <><Save className="h-3.5 w-3.5" /> Save Changes</>
              }
            </button>
          )}
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="flex-1 overflow-auto px-6 pb-8">
        {isLoading ? (
          <div className="flex flex-col gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl" style={{ background: 'white', border: '1px solid #EDE8E1' }} />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            {/* Firm Identity */}
            <Section title="Firm Identity" desc="Your practice's public-facing information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Firm / Practice Name" required error={errors.name?.message}>
                    <div className="relative flex items-center">
                      <Building2 className="pointer-events-none absolute left-3.5 h-4 w-4" style={{ color: '#A09890' }} />
                      <input className={inputCls} style={{ ...inputStyle, paddingLeft: 36 }}
                        {...register('name')} {...focusHandlers} />
                    </div>
                  </Field>
                </div>

                <Field label="Business Email" error={errors.email?.message}>
                  <div className="relative flex items-center">
                    <Mail className="pointer-events-none absolute left-3.5 h-4 w-4" style={{ color: '#A09890' }} />
                    <input type="email" className={inputCls} style={{ ...inputStyle, paddingLeft: 36 }}
                      {...register('email')} {...focusHandlers} />
                  </div>
                </Field>

                <Field label="Phone" error={errors.phone?.message}>
                  <div className="relative flex items-center">
                    <Phone className="pointer-events-none absolute left-3.5 h-4 w-4" style={{ color: '#A09890' }} />
                    <input type="tel" className={inputCls} style={{ ...inputStyle, paddingLeft: 36 }}
                      {...register('phone')} {...focusHandlers} />
                  </div>
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Website" error={errors.website?.message}>
                    <div className="relative flex items-center">
                      <Globe className="pointer-events-none absolute left-3.5 h-4 w-4" style={{ color: '#A09890' }} />
                      <input type="url" placeholder="https://" className={inputCls} style={{ ...inputStyle, paddingLeft: 36 }}
                        {...register('website')} {...focusHandlers} />
                    </div>
                  </Field>
                </div>
              </div>
            </Section>

            {/* Office Address */}
            <Section title="Office Address" desc="Used on invoices and client-facing documents">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Street Address">
                    <div className="relative flex items-center">
                      <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4" style={{ color: '#A09890' }} />
                      <input className={inputCls} style={{ ...inputStyle, paddingLeft: 36 }}
                        placeholder="123, Gandhi Nagar…" {...register('address')} {...focusHandlers} />
                    </div>
                  </Field>
                </div>

                <Field label="City">
                  <input className={inputCls} style={inputStyle} placeholder="Ahmedabad"
                    {...register('city')} {...focusHandlers} />
                </Field>

                <Field label="Pincode">
                  <input className={inputCls} style={inputStyle} placeholder="380001" maxLength={6}
                    {...register('pincode')} {...focusHandlers} />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="State">
                    <input className={inputCls} style={inputStyle} placeholder="Gujarat"
                      {...register('state')} {...focusHandlers} />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Tax Info */}
            <Section title="Tax Information" desc="GSTIN for invoice generation">
              <div className="max-w-sm">
                <Field label="GSTIN" hint="15-character GST Identification Number" error={errors.gstin?.message}>
                  <input className={`${inputCls} uppercase font-mono tracking-wider`} style={inputStyle}
                    placeholder="27ABCDE1234F1Z5" {...register('gstin')} {...focusHandlers} />
                </Field>
              </div>
            </Section>

            {/* Save button at bottom for convenience */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending || !isDirty}
                className="flex h-9 items-center gap-2 rounded-xl px-5 text-[13px] font-[700] text-white transition-all duration-150 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #C84B0F 0%, #F97316 100%)',
                  boxShadow: isDirty ? '0 4px 14px rgba(200,75,15,0.30)' : 'none',
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                }}
              >
                {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</> : <><Save className="h-3.5 w-3.5" /> Save Changes</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
