import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User, Mail, Hash, Building2, MapPin, Tag,
  ChevronRight, CheckCircle2, Loader2,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { useCreateClient } from './useClients'

// ── Schema ─────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN').optional().or(z.literal('')),
  gstin: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GSTIN').optional().or(z.literal('')),
  aadhaarLast4: z.string().length(4, 'Enter last 4 digits').optional().or(z.literal('')),
  entityType: z.enum(['individual', 'huf', 'partnership', 'llp', 'pvt_ltd', 'public_ltd', 'trust', 'other']).optional(),
  businessName: z.string().max(255).optional().or(z.literal('')),
  spousePan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN').optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pincode: z.string().optional().or(z.literal('')),
  preferredLanguage: z.enum(['en', 'gu', 'hi']).default('en'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

// ── Steps config ───────────────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: 'Basic Info',   icon: User },
  { id: 1, label: 'Tax IDs',      icon: Hash },
  { id: 2, label: 'Address',      icon: MapPin },
  { id: 3, label: 'Preferences',  icon: Tag },
]

const ENTITY_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'huf',        label: 'HUF' },
  { value: 'pvt_ltd',    label: 'Pvt. Limited' },
  { value: 'partnership',label: 'Partnership' },
  { value: 'llp',        label: 'LLP' },
  { value: 'public_ltd', label: 'Public Limited' },
  { value: 'trust',      label: 'Trust / NGO' },
  { value: 'other',      label: 'Other' },
]

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
]

const TAG_OPTIONS = ['itr','gst','tds','audit','roc','priority','new-client','salaried','business','nri']

// ── Reusable field components ───────────────────────────────────────────────
function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-[600]" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
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

function StyledInput({ hasError, leftEl, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean; leftEl?: React.ReactNode }) {
  return (
    <div className="relative flex items-center">
      {leftEl && <span className="pointer-events-none absolute left-3.5" style={{ color: '#A09890' }}>{leftEl}</span>}
      <input
        className={inputCls}
        style={{ ...inputStyle, paddingLeft: leftEl ? 36 : undefined }}
        onFocus={(e) => { e.target.style.borderColor = hasError ? '#DC2626' : '#C84B0F'; e.target.style.boxShadow = hasError ? '0 0 0 3px rgba(220,38,38,0.10)' : '0 0 0 3px rgba(200,75,15,0.12)' }}
        onBlur={(e) => { e.target.style.borderColor = hasError ? '#FCA5A5' : '#EDE8E1'; e.target.style.boxShadow = 'none' }}
        {...props}
      />
    </div>
  )
}

function StyledSelect({ value, onChange, options, placeholder }: {
  value?: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; placeholder?: string
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
      style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23A09890' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      onFocus={(e) => { e.target.style.borderColor = '#C84B0F'; e.target.style.boxShadow = '0 0 0 3px rgba(200,75,15,0.12)' }}
      onBlur={(e) => { e.target.style.borderColor = '#EDE8E1'; e.target.style.boxShadow = 'none' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export function AddClientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [tagInput, setTagInput] = useState('')
  const { mutate: createClient, isPending } = useCreateClient()

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { preferredLanguage: 'en', tags: [] },
  })

  const tags = watch('tags') ?? []
  const entityType = watch('entityType')

  const handleClose = () => { reset(); setStep(0); setTagInput(''); onClose() }

  const onSubmit = (values: FormValues) => {
    const cleaned = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === '' ? undefined : v]),
    ) as FormValues
    createClient(cleaned, { onSuccess: handleClose })
  }

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase()
    if (t && !tags.includes(t)) setValue('tags', [...tags, t])
    setTagInput('')
  }
  const removeTag = (t: string) => setValue('tags', tags.filter((x) => x !== t))

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="lg"
      title="Add New Client"
      description="Enter client details to onboard them into your practice."
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5">
            {STEPS.map((s) => (
              <button
                key={s.id} type="button" onClick={() => setStep(s.id)}
                className="flex h-2 rounded-full transition-all duration-200"
                style={{ width: step === s.id ? 20 : 8, background: step === s.id ? '#C84B0F' : '#EDE8E1' }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)}
                className="h-9 px-4 rounded-xl text-[13px] font-[600] transition-all duration-150"
                style={{ border: '1.5px solid #EDE8E1', color: '#1A1512' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F9F7F4' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep(step + 1)}
                className="flex h-9 items-center gap-2 px-5 rounded-xl text-[13px] font-[700] text-white transition-all duration-150"
                style={{ background: 'linear-gradient(135deg, #C84B0F 0%, #F97316 100%)', boxShadow: '0 4px 14px rgba(200,75,15,0.28)', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(200,75,15,0.38)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(200,75,15,0.28)' }}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit(onSubmit)} disabled={isPending}
                className="flex h-9 items-center gap-2 px-5 rounded-xl text-[13px] font-[700] text-white transition-all duration-150 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #C84B0F 0%, #F97316 100%)', boxShadow: '0 4px 14px rgba(200,75,15,0.28)', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
              >
                {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Add Client</>}
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Step indicator */}
      <div className="mb-6 grid grid-cols-4 gap-2">
        {STEPS.map((s) => {
          const Icon = s.icon
          const isActive = step === s.id
          const isDone = step > s.id
          return (
            <button key={s.id} type="button" onClick={() => setStep(s.id)}
              className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-all duration-150"
              style={{ background: isActive ? '#FFF4EE' : isDone ? '#F0FDF4' : '#F9F7F4', border: `1.5px solid ${isActive ? '#C84B0F' : isDone ? '#BBF7D0' : '#EDE8E1'}` }}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: isActive ? '#C84B0F' : isDone ? '#16A34A' : '#EDE8E1' }}>
                {isDone
                  ? <CheckCircle2 className="h-4 w-4 text-white" />
                  : <Icon className="h-3.5 w-3.5" style={{ color: isActive ? 'white' : '#A09890' }} />
                }
              </div>
              <span className="text-[10.5px] font-[600] text-center leading-tight"
                style={{ color: isActive ? '#C84B0F' : isDone ? '#16A34A' : '#A09890', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                {s.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Step content */}
      <div style={{ minHeight: 280 }}>

        {/* ── Step 0: Basic Info ── */}
        {step === 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Full Name" required error={errors.name?.message}>
                <StyledInput placeholder="e.g. Rajesh Kumar Shah" hasError={!!errors.name} {...register('name')} />
              </Field>
            </div>

            <div className="col-span-2">
              <Field label="Mobile Number" required error={errors.phone?.message}>
                <div className="flex">
                  <span className="flex h-10 items-center rounded-l-xl border border-r-0 px-3.5 text-[13px] font-[600] select-none"
                    style={{ borderColor: '#EDE8E1', background: '#F9F7F4', color: '#6B6258' }}>
                    +91
                  </span>
                  <input
                    type="tel" maxLength={10} placeholder="9876543210"
                    className="h-10 flex-1 rounded-r-xl border px-3.5 text-[13.5px] outline-none transition-all duration-150 bg-white"
                    style={{ borderColor: errors.phone ? '#FCA5A5' : '#EDE8E1', color: '#1A1512' }}
                    onFocus={(e) => { e.target.style.borderColor = '#C84B0F'; e.target.style.boxShadow = '0 0 0 3px rgba(200,75,15,0.12)' }}
                    {...register('phone', { onBlur: (e) => { e.target.style.borderColor = errors.phone ? '#FCA5A5' : '#EDE8E1'; e.target.style.boxShadow = 'none' } })}
                  />
                </div>
              </Field>
            </div>

            <div className="col-span-2">
              <Field label="Email Address" error={errors.email?.message}>
                <StyledInput type="email" placeholder="rajesh@example.com" leftEl={<Mail className="h-4 w-4" />} {...register('email')} />
              </Field>
            </div>

            <Field label="Entity Type">
              <Controller name="entityType" control={control} render={({ field }) => (
                <StyledSelect value={field.value} onChange={field.onChange} options={ENTITY_OPTIONS} placeholder="Select type" />
              )} />
            </Field>

            <Field label="Date of Birth">
              <StyledInput type="date" {...register('dob')} />
            </Field>

            {(entityType === 'pvt_ltd' || entityType === 'public_ltd' || entityType === 'partnership' || entityType === 'llp' || entityType === 'trust') && (
              <div className="col-span-2">
                <Field label="Business / Trade Name">
                  <StyledInput placeholder="ABC Enterprises Pvt. Ltd." leftEl={<Building2 className="h-4 w-4" />} {...register('businessName')} />
                </Field>
              </div>
            )}
          </div>
        )}

        {/* ── Step 1: Tax IDs ── */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="PAN (Permanent Account Number)" error={errors.pan?.message} hint="10-character PAN e.g. ABCDE1234F">
                <StyledInput placeholder="ABCDE1234F" hasError={!!errors.pan} className="uppercase font-mono tracking-widest"
                  {...register('pan', { onChange: (e) => { e.target.value = e.target.value.toUpperCase() } })} />
              </Field>
            </div>

            <Field label="Aadhaar (Last 4 digits)" error={errors.aadhaarLast4?.message}>
              <StyledInput placeholder="1234" maxLength={4} hasError={!!errors.aadhaarLast4} {...register('aadhaarLast4')} />
            </Field>

            <Field label="Spouse PAN" error={errors.spousePan?.message} hint="For HUF / joint filings">
              <StyledInput placeholder="FGHIJ5678K" className="uppercase tracking-widest" hasError={!!errors.spousePan}
                {...register('spousePan', { onChange: (e) => { e.target.value = e.target.value.toUpperCase() } })} />
            </Field>

            <div className="col-span-2">
              <Field label="GSTIN" error={errors.gstin?.message} hint="15-character GST Identification Number">
                <StyledInput placeholder="27ABCDE1234F1Z5" className="uppercase font-mono tracking-wider" hasError={!!errors.gstin}
                  {...register('gstin', { onChange: (e) => { e.target.value = e.target.value.toUpperCase() } })} />
              </Field>
            </div>

            {/* Visual hint box */}
            <div className="col-span-2 rounded-xl p-4" style={{ background: '#FFF4EE', border: '1px solid #FFE4D0' }}>
              <p className="text-[12px] font-[600]" style={{ color: '#C84B0F' }}>💡 All tax IDs are optional</p>
              <p className="mt-1 text-[11.5px]" style={{ color: '#7D2D09' }}>You can always add or update them later from the client's profile page.</p>
            </div>
          </div>
        )}

        {/* ── Step 2: Address ── */}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Street / Locality">
                <StyledInput placeholder="123, Gandhi Nagar, Near City Center" {...register('address')} />
              </Field>
            </div>

            <Field label="City">
              <StyledInput placeholder="Ahmedabad" {...register('city')} />
            </Field>

            <Field label="Pincode">
              <StyledInput placeholder="380001" maxLength={6} {...register('pincode')} />
            </Field>

            <div className="col-span-2">
              <Field label="State">
                <Controller name="state" control={control} render={({ field }) => (
                  <StyledSelect value={field.value} onChange={field.onChange}
                    options={STATES.map((s) => ({ value: s, label: s }))} placeholder="Select state" />
                )} />
              </Field>
            </div>
          </div>
        )}

        {/* ── Step 3: Preferences ── */}
        {step === 3 && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Preferred Language">
              <Controller name="preferredLanguage" control={control} render={({ field }) => (
                <StyledSelect value={field.value} onChange={field.onChange}
                  options={[{ value: 'en', label: 'English' }, { value: 'gu', label: 'Gujarati (ગુજરાતી)' }, { value: 'hi', label: 'Hindi (हिंदी)' }]} />
              )} />
            </Field>

            <div />

            <div className="col-span-2">
              <Field label="Tags">
                <div className="flex flex-wrap gap-1.5 rounded-xl border p-2.5 min-h-[44px]"
                  style={{ borderColor: '#EDE8E1', background: '#FAFAF8' }}
                  onClick={() => document.getElementById('tag-input')?.focus()}
                >
                  {tags.map((t) => (
                    <span key={t} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11.5px] font-[600]"
                      style={{ background: '#FFF4EE', color: '#C84B0F', border: '1px solid #FFE4D0' }}>
                      {t}
                      <button type="button" onClick={() => removeTag(t)} className="text-[10px] leading-none opacity-60 hover:opacity-100">×</button>
                    </span>
                  ))}
                  <input
                    id="tag-input" value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
                      if (e.key === 'Backspace' && !tagInput && tags.length) removeTag(tags[tags.length - 1])
                    }}
                    placeholder={tags.length ? '' : 'Type a tag and press Enter…'}
                    className="flex-1 bg-transparent text-[12.5px] outline-none min-w-[120px]"
                    style={{ color: '#1A1512' }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {TAG_OPTIONS.filter((t) => !tags.includes(t)).map((t) => (
                    <button key={t} type="button" onClick={() => addTag(t)}
                      className="rounded-lg px-2.5 py-1 text-[11px] font-[500] transition-colors duration-100"
                      style={{ background: '#F5F2EE', color: '#6B6258', border: '1px solid #EDE8E1' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF4EE'; e.currentTarget.style.color = '#C84B0F'; e.currentTarget.style.borderColor = '#FFE4D0' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F2EE'; e.currentTarget.style.color = '#6B6258'; e.currentTarget.style.borderColor = '#EDE8E1' }}
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="col-span-2">
              <Field label="Internal Notes">
                <textarea
                  placeholder="Any private notes about this client (not visible to client)…"
                  rows={3}
                  className="w-full resize-none rounded-xl border px-3.5 py-2.5 text-[13px] outline-none transition-all duration-150 bg-white"
                  style={{ borderColor: '#EDE8E1', color: '#1A1512' }}
                  onFocus={(e) => { e.target.style.borderColor = '#C84B0F'; e.target.style.boxShadow = '0 0 0 3px rgba(200,75,15,0.12)' }}
                  {...register('notes', { onBlur: (e) => { e.target.style.borderColor = '#EDE8E1'; e.target.style.boxShadow = 'none' } })}
                />
              </Field>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
