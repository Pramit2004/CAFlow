import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Phone, Mail, Hash, Building2, MapPin, Tag, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Drawer } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select, TagInput } from '@/components/ui/select'
import { useCreateClient } from './useClients'

// ── Validation schema ──────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN (e.g. ABCDE1234F)')
    .optional()
    .or(z.literal('')),
  gstin: z
    .string()
    .regex(
      /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
      'Invalid GSTIN format',
    )
    .optional()
    .or(z.literal('')),
  aadhaarLast4: z
    .string()
    .length(4, 'Enter last 4 digits of Aadhaar')
    .optional()
    .or(z.literal('')),
  entityType: z
    .enum(['individual', 'huf', 'partnership', 'llp', 'pvt_ltd', 'public_ltd', 'trust', 'other'])
    .optional(),
  businessName: z.string().max(255).optional().or(z.literal('')),
  spousePan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN')
    .optional()
    .or(z.literal('')),
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

// ── Options ────────────────────────────────────────────────────────────────

const ENTITY_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'huf', label: 'HUF' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'LLP' },
  { value: 'pvt_ltd', label: 'Private Limited' },
  { value: 'public_ltd', label: 'Public Limited' },
  { value: 'trust', label: 'Trust / NGO' },
  { value: 'other', label: 'Other' },
]

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'hi', label: 'Hindi' },
]

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
]

const TAG_SUGGESTIONS = [
  'itr', 'gst', 'tds', 'audit', 'new-client', 'priority',
  'business', 'salaried', 'nri', 'senior',
]

// ── Section wrapper ────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]/40">
      <button
        type="button"
        onClick={() => collapsible && setOpen((o) => !o)}
        className={`flex w-full items-center gap-2.5 px-4 py-3 ${collapsible ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span
          className="flex-1 text-left text-[12.5px] font-[600] uppercase tracking-wider text-[var(--text-secondary)]"
          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
        >
          {title}
        </span>
        {collapsible && (
          open ? <ChevronUp className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
               : <ChevronDown className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
        )}
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

function FullRow({ children }: { children: React.ReactNode }) {
  return <div className="col-span-2">{children}</div>
}

// ── Main Component ─────────────────────────────────────────────────────────

interface AddClientModalProps {
  open: boolean
  onClose: () => void
}

export function AddClientModal({ open, onClose }: AddClientModalProps) {
  const { mutate: createClient, isPending } = useCreateClient()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      preferredLanguage: 'en',
      tags: [],
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (values: FormValues) => {
    // Clean empty strings to undefined
    const cleaned = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === '' ? undefined : v]),
    ) as FormValues

    createClient(cleaned, {
      onSuccess: () => handleClose(),
    })
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="Add New Client"
      description="Fill in the client's details. You can edit these anytime."
      width="w-[520px]"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Add Client
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* ── Basic Info ── */}
        <Section title="Basic Information" icon={User}>
          <FullRow>
            <Input
              label="Full Name"
              required
              placeholder="e.g. Rajesh Kumar Shah"
              error={errors.name?.message}
              {...register('name')}
            />
          </FullRow>

          {/* Phone with +91 prefix */}
          <FullRow>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-[500] text-[var(--text-primary)]"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-0">
                <span className="flex h-8 items-center rounded-l-lg border border-r-0 border-[var(--border)] bg-[var(--bg-subtle)] px-3 text-[12.5px] font-[500] text-[var(--text-secondary)]">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  className="h-8 flex-1 rounded-r-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] text-[var(--text-primary)] outline-none transition-all duration-150 placeholder:text-[var(--text-tertiary)] focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(18,110,71,0.1)]"
                  {...register('phone')}
                />
              </div>
              {errors.phone && (
                <p className="text-[11.5px] text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </FullRow>

          <FullRow>
            <Input
              label="Email Address"
              type="email"
              placeholder="rajesh@example.com"
              leftIcon={<Mail className="h-3.5 w-3.5" />}
              error={errors.email?.message}
              {...register('email')}
            />
          </FullRow>

          <Controller
            name="entityType"
            control={control}
            render={({ field }) => (
              <Select
                label="Entity Type"
                options={ENTITY_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select type"
              />
            )}
          />

          <Input
            label="Date of Birth"
            type="date"
            error={errors.dob?.message}
            {...register('dob')}
          />
        </Section>

        {/* ── Tax IDs ── */}
        <Section title="Tax Identifiers" icon={Hash} collapsible defaultOpen>
          <Input
            label="PAN"
            placeholder="ABCDE1234F"
            className="uppercase"
            hint="10-character Permanent Account Number"
            error={errors.pan?.message}
            {...register('pan', {
              onChange: (e) => { e.target.value = e.target.value.toUpperCase() },
            })}
          />

          <Input
            label="Aadhaar (last 4)"
            placeholder="1234"
            maxLength={4}
            error={errors.aadhaarLast4?.message}
            {...register('aadhaarLast4')}
          />

          <FullRow>
            <Input
              label="GSTIN"
              placeholder="27ABCDE1234F1Z5"
              className="uppercase font-mono"
              hint="15-character GST Identification Number"
              error={errors.gstin?.message}
              {...register('gstin', {
                onChange: (e) => { e.target.value = e.target.value.toUpperCase() },
              })}
            />
          </FullRow>

          <Input
            label="Business / Trade Name"
            placeholder="ABC Enterprises"
            leftIcon={<Building2 className="h-3.5 w-3.5" />}
            error={errors.businessName?.message}
            {...register('businessName')}
          />

          <Input
            label="Spouse PAN"
            placeholder="FGHIJ5678K"
            className="uppercase"
            hint="For HUF / joint filings"
            error={errors.spousePan?.message}
            {...register('spousePan', {
              onChange: (e) => { e.target.value = e.target.value.toUpperCase() },
            })}
          />
        </Section>

        {/* ── Address ── */}
        <Section title="Address" icon={MapPin} collapsible defaultOpen={false}>
          <FullRow>
            <Input
              label="Street / Locality"
              placeholder="123, Gandhi Nagar"
              error={errors.address?.message}
              {...register('address')}
            />
          </FullRow>

          <Input
            label="City"
            placeholder="Ahmedabad"
            error={errors.city?.message}
            {...register('city')}
          />

          <Input
            label="Pincode"
            placeholder="380001"
            maxLength={6}
            error={errors.pincode?.message}
            {...register('pincode')}
          />

          <FullRow>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  label="State"
                  options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select state"
                />
              )}
            />
          </FullRow>
        </Section>

        {/* ── Preferences ── */}
        <Section title="Preferences & Notes" icon={Tag} collapsible defaultOpen>
          <Controller
            name="preferredLanguage"
            control={control}
            render={({ field }) => (
              <Select
                label="Preferred Language"
                options={LANGUAGE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <div className="col-span-1" />

          <FullRow>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TagInput
                  label="Tags"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type and press Enter…"
                  suggestions={TAG_SUGGESTIONS}
                />
              )}
            />
          </FullRow>

          <FullRow>
            <Textarea
              label="Internal Notes"
              placeholder="Any internal notes about this client…"
              {...register('notes')}
            />
          </FullRow>
        </Section>

      </form>
    </Drawer>
  )
}
