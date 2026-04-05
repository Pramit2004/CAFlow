import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Briefcase, Calendar, IndianRupee } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useCreateCase } from './useCases'
import { useClients } from '@/modules/clients/useClients'

// ── Schema ─────────────────────────────────────────────────────────────────

const schema = z.object({
  clientId: z.string().uuid('Please select a client'),
  title: z.string().min(2, 'Title too short').max(255),
  serviceType: z.enum(['ITR', 'GST', 'TDS', 'ROC', 'AUDIT', 'ADVANCE_TAX', 'OTHER']),
  financialYear: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Format: YYYY-YY (e.g. 2024-25)')
    .optional()
    .or(z.literal('')),
  deadline: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  feeQuoted: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined)),
})

type FormValues = z.infer<typeof schema>

// ── Options ────────────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  { value: 'ITR',          label: 'ITR — Income Tax Return' },
  { value: 'GST',          label: 'GST Filing' },
  { value: 'TDS',          label: 'TDS Return' },
  { value: 'ROC',          label: 'ROC Filing' },
  { value: 'AUDIT',        label: 'Audit' },
  { value: 'ADVANCE_TAX',  label: 'Advance Tax' },
  { value: 'OTHER',        label: 'Other' },
]

// Generate current + last 4 FYs
function getFYOptions() {
  const now = new Date()
  const curYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  return Array.from({ length: 5 }).map((_, i) => {
    const y = curYear - i
    const label = `${y}-${String(y + 1).slice(-2)}`
    return { value: label, label }
  })
}

// ── Component ──────────────────────────────────────────────────────────────

interface CreateCaseModalProps {
  open: boolean
  onClose: () => void
  defaultClientId?: string
}

export function CreateCaseModal({ open, onClose, defaultClientId }: CreateCaseModalProps) {
  const { mutate: createCase, isPending } = useCreateCase()

  // Fetch clients for dropdown
  const { data: clientsData } = useClients({ limit: 200 })
  const clientOptions = (clientsData?.data ?? []).map((c) => ({
    value: c.id,
    label: `${c.name}${c.pan ? ` · ${c.pan}` : ''}`,
  }))

  const {
    register, handleSubmit, control, reset, watch, setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceType: 'ITR',
      financialYear: getFYOptions()[0].value,
      clientId: defaultClientId ?? '',
    },
  })

  // Auto-set title when service type changes
  const serviceType = watch('serviceType')
  const clientId = watch('clientId')
  const client = clientsData?.data.find((c) => c.id === clientId)

  useEffect(() => {
    if (client && serviceType) {
      setValue('title', `${serviceType} — ${client.name}`)
    }
  }, [serviceType, client?.id])

  const handleClose = () => { reset(); onClose() }

  const onSubmit = (values: FormValues) => {
    const payload = {
      clientId: values.clientId,
      title: values.title,
      serviceType: values.serviceType,
      financialYear: values.financialYear || undefined,
      deadline: values.deadline || undefined,
      description: values.description || undefined,
      feeQuoted: typeof values.feeQuoted === 'number' ? values.feeQuoted : undefined,
    }
    createCase(payload, { onSuccess: handleClose })
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Case"
      description="Create a new case for a client service."
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" loading={isPending} onClick={handleSubmit(onSubmit)}>
            Create Case
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Client */}
        <Controller
          name="clientId"
          control={control}
          render={({ field }) => (
            <Select
              label="Client"
              required
              options={clientOptions}
              value={field.value}
              onChange={field.onChange}
              placeholder="Search and select client…"
              error={errors.clientId?.message}
            />
          )}
        />

        {/* Service Type */}
        <Controller
          name="serviceType"
          control={control}
          render={({ field }) => (
            <Select
              label="Service Type"
              required
              options={SERVICE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.serviceType?.message}
            />
          )}
        />

        {/* Title */}
        <Input
          label="Case Title"
          required
          placeholder="e.g. ITR — Rajesh Shah"
          leftIcon={<Briefcase className="h-3.5 w-3.5" />}
          error={errors.title?.message}
          {...register('title')}
        />

        {/* FY + Deadline row */}
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="financialYear"
            control={control}
            render={({ field }) => (
              <Select
                label="Financial Year"
                options={getFYOptions()}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.financialYear?.message}
              />
            )}
          />
          <Input
            label="Deadline"
            type="date"
            leftIcon={<Calendar className="h-3.5 w-3.5" />}
            error={errors.deadline?.message}
            {...register('deadline')}
          />
        </div>

        {/* Fee */}
        <Input
          label="Fee Quoted (₹)"
          type="number"
          placeholder="5000"
          leftIcon={<IndianRupee className="h-3.5 w-3.5" />}
          hint="Internal use only — not shown to client"
          {...register('feeQuoted')}
        />

        {/* Description */}
        <Textarea
          label="Notes / Description"
          placeholder="Any internal notes about this case…"
          {...register('description')}
        />

      </form>
    </Modal>
  )
}
