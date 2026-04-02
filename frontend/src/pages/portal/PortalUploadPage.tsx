import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  CheckCircle2, XCircle, FileText,
  AlertTriangle, ChevronDown, Camera,
  Check, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── i18n strings ───────────────────────────────────────────────────────────

const STRINGS = {
  en: {
    greeting: (name: string) => `Hello, ${name}`,
    caRequest: (caName: string) => `${caName} has requested the following documents`,
    uploadTitle: 'Upload Documents',
    uploadBtn: 'Choose File',
    uploadOr: 'or drag & drop',
    uploading: 'Uploading…',
    uploadSuccess: 'Uploaded successfully',
    allDone: 'All documents submitted!',
    allDoneMsg: 'Your CA will review them shortly.',
    required: 'Required',
    optional: 'Optional',
    pending: 'Awaiting Upload',
    uploaded: 'Uploaded',
    accepted: 'Accepted',
    rejected: 'Rejected — Please resubmit',
    tapToUpload: 'Tap to upload',
    dragHere: 'Drag file here',
    maxSize: 'Max 50 MB · PDF, JPG, PNG, HEIC',
    fileTypeErr: 'File type not supported',
    fileSizeErr: 'File too large (max 50 MB)',
    retry: 'Try again',
    reupload: 'Re-upload',
    poweredBy: 'Powered by CAFlow',
    expiresOn: (date: string) => `Link valid until ${date}`,
  },
  gu: {
    greeting: (name: string) => `નમસ્તે, ${name}`,
    caRequest: (caName: string) => `${caName} એ નીચેના દસ્તાવેજ માંગ્યા છે`,
    uploadTitle: 'દસ્તાવેજ અપલોડ કરો',
    uploadBtn: 'ફાઇલ પસંદ કરો',
    uploadOr: 'અથવા અહીં ખેંચો',
    uploading: 'અપલોડ થઈ રહ્યું છે…',
    uploadSuccess: 'સફળતાપૂર્વક અપલોડ થયું',
    allDone: 'બધા દસ્તાવેજ મોકલ્યા! ✅',
    allDoneMsg: 'તમારા CA ટૂંક સમયમાં તેની સમીક્ષા કરશે.',
    required: 'જરૂરી',
    optional: 'વૈકલ્પિક',
    pending: 'અપલોડ બાકી',
    uploaded: 'અપલોડ થયું',
    accepted: 'સ્વીકૃત',
    rejected: 'અસ્વીકૃત — ફરી મોકલો',
    tapToUpload: 'અપલોડ કરવા ટેપ કરો',
    dragHere: 'ફાઇલ અહીં ખેંચો',
    maxSize: 'મહત્તમ 50 MB · PDF, JPG, PNG, HEIC',
    fileTypeErr: 'ફાઇલ ફોર્મેટ સ્વીકૃત નથી',
    fileSizeErr: 'ફાઇલ ઘણી મોટી છે (મહત્તમ 50 MB)',
    retry: 'ફરી પ્રયાસ કરો',
    reupload: 'ફરી અપલોડ',
    poweredBy: 'CAFlow દ્વારા',
    expiresOn: (date: string) => `લિંક ${date} સુધી માન્ય`,
  },
  hi: {
    greeting: (name: string) => `नमस्ते, ${name}`,
    caRequest: (caName: string) => `${caName} ने निम्नलिखित दस्तावेज़ माँगे हैं`,
    uploadTitle: 'दस्तावेज़ अपलोड करें',
    uploadBtn: 'फ़ाइल चुनें',
    uploadOr: 'या यहाँ खींचें',
    uploading: 'अपलोड हो रहा है…',
    uploadSuccess: 'सफलतापूर्वक अपलोड हुआ',
    allDone: 'सभी दस्तावेज़ जमा हो गए! ✅',
    allDoneMsg: 'आपके CA जल्द ही समीक्षा करेंगे।',
    required: 'ज़रूरी',
    optional: 'वैकल्पिक',
    pending: 'अपलोड बाकी',
    uploaded: 'अपलोड हो गया',
    accepted: 'स्वीकृत',
    rejected: 'अस्वीकृत — फिर से भेजें',
    tapToUpload: 'अपलोड करने के लिए टैप करें',
    dragHere: 'फ़ाइल यहाँ खींचें',
    maxSize: 'अधिकतम 50 MB · PDF, JPG, PNG, HEIC',
    fileTypeErr: 'फ़ाइल प्रारूप समर्थित नहीं',
    fileSizeErr: 'फ़ाइल बहुत बड़ी है (अधिकतम 50 MB)',
    retry: 'पुनः प्रयास',
    reupload: 'फिर से अपलोड',
    poweredBy: 'CAFlow द्वारा',
    expiresOn: (date: string) => `लिंक ${date} तक वैध`,
  },
}

type Lang = keyof typeof STRINGS

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_BYTES = 50 * 1024 * 1024

// ── API base (no auth header) ──────────────────────────────────────────────

const portalApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

// ── Upload state per document ──────────────────────────────────────────────

type UploadState =
  | { phase: 'idle' }
  | { phase: 'error'; message: string }
  | { phase: 'uploading'; progress: number }
  | { phase: 'done' }

// ── Document card ──────────────────────────────────────────────────────────

function DocumentCard({
  doc,
  token,
  lang,
  onUploaded,
}: {
  doc: any
  token: string
  lang: Lang
  onUploaded: () => void
}) {
  const t = STRINGS[lang]
  const [state, setState] = useState<UploadState>({ phase: 'idle' })
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const alreadyUploaded = ['UPLOADED', 'ACCEPTED'].includes(doc.status)
  const isRejected = doc.status === 'REJECTED'
  const canUpload = doc.status === 'PENDING' || isRejected

  const handleFile = useCallback(async (file: File) => {
    // Validate
    if (!ALLOWED.includes(file.type)) {
      setState({ phase: 'error', message: t.fileTypeErr })
      return
    }
    if (file.size > MAX_BYTES) {
      setState({ phase: 'error', message: t.fileSizeErr })
      return
    }

    setState({ phase: 'uploading', progress: 0 })

    try {
      // 1. Get presigned URL
      const { data: presignData } = await portalApi.post(`/api/portal/${token}/presign`, {
        documentId: doc.id,
        fileName: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
      })

      const { presignedUrl, fileKey } = presignData.data

      // 2. PUT directly to R2
      await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (e) => {
          const pct = Math.round(((e.loaded ?? 0) / (e.total ?? 1)) * 100)
          setState({ phase: 'uploading', progress: pct })
        },
      })

      // 3. Confirm with backend
      await portalApi.post(`/api/portal/${token}/confirm`, {
        documentId: doc.id,
        fileKey,
        fileName: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
      })

      setState({ phase: 'done' })
      onUploaded()
    } catch (err: any) {
      setState({
        phase: 'error',
        message: err?.response?.data?.error ?? 'Upload failed. Please try again.',
      })
    }
  }, [token, doc.id, lang])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const isDone = state.phase === 'done' || alreadyUploaded

  return (
    <div className={cn(
      'overflow-hidden rounded-2xl border transition-all duration-200',
      isDone && !isRejected
        ? 'border-green-200 bg-green-50/50 dark:border-green-800/40 dark:bg-green-950/10'
        : isRejected
        ? 'border-red-200 bg-red-50/50 dark:border-red-800/40 dark:bg-red-950/10'
        : isDragOver
        ? 'border-brand-400/80 bg-brand-50/50 shadow-[0_0_0_3px_rgba(18,110,71,0.12)]'
        : 'border-[var(--border)] bg-[var(--surface)]',
    )}>
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl mt-0.5',
          isDone && !isRejected ? 'bg-green-100 dark:bg-green-950/40'
          : isRejected ? 'bg-red-100 dark:bg-red-950/40'
          : 'bg-brand-50 dark:bg-brand-950/40',
        )}>
          {isDone && !isRejected
            ? <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            : isRejected
            ? <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            : <FileText className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-[700] leading-snug text-[var(--text-primary)]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
            {doc.label}
          </p>
          <p className={cn(
            'mt-0.5 text-[12px] font-[500]',
            isDone && !isRejected ? 'text-green-600 dark:text-green-400'
            : isRejected ? 'text-red-600 dark:text-red-400'
            : 'text-[var(--text-tertiary)]',
          )}>
            {isDone && !isRejected ? t.uploaded
            : isRejected ? t.rejected
            : doc.isRequired ? t.required
            : t.optional}
          </p>
          {isRejected && doc.rejectionNote && (
            <p className="mt-1 rounded-lg bg-red-100 px-2.5 py-1.5 text-[12px] text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {doc.rejectionNote}
            </p>
          )}
        </div>
      </div>

      {/* Upload zone — only show if can upload */}
      {(canUpload || state.phase !== 'idle') && !isDone && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          className={cn(
            'mx-4 mb-4 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-5 transition-all duration-150',
            isDragOver
              ? 'border-brand-400 bg-brand-50/80 dark:bg-brand-950/20'
              : state.phase === 'error'
              ? 'border-red-300 bg-red-50/50 dark:bg-red-950/10'
              : 'border-[var(--border)] hover:border-brand-300 hover:bg-brand-50/30 dark:hover:bg-brand-950/10',
          )}
        >
          {state.phase === 'uploading' ? (
            <>
              <div className="relative flex h-12 w-12 items-center justify-center">
                <svg className="absolute inset-0 h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="3" />
                  <circle
                    cx="24" cy="24" r="20" fill="none"
                    stroke="rgb(22,138,88)"
                    strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - (state as any).progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                <span className="text-[12px] font-[700] text-brand-600">{(state as any).progress}%</span>
              </div>
              <p className="text-[13px] font-[500] text-[var(--text-secondary)]">{t.uploading}</p>
            </>
          ) : state.phase === 'error' ? (
            <>
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <p className="text-center text-[13px] font-[500] text-red-600 dark:text-red-400">
                {(state as any).message}
              </p>
              <button
                type="button"
                onClick={() => setState({ phase: 'idle' })}
                className="rounded-lg bg-red-100 px-4 py-2 text-[13px] font-[600] text-red-700 transition-colors hover:bg-red-200 dark:bg-red-950/40 dark:text-red-300"
              >
                {t.retry}
              </button>
            </>
          ) : (
            <>
              {/* Camera / upload icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950/40">
                <Camera className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-[600] text-[var(--text-primary)]">
                  {t.tapToUpload}
                </p>
                <p className="mt-0.5 text-[11.5px] text-[var(--text-tertiary)]">{t.maxSize}</p>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-[14px] font-[700] text-white shadow-sm transition-all active:scale-95 hover:bg-brand-700"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
              >
                {t.uploadBtn}
              </button>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                  e.target.value = ''
                }}
              />
            </>
          )}
        </div>
      )}

      {/* Already uploaded state */}
      {isDone && !isRejected && (
        <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl bg-green-100/60 px-4 py-3 dark:bg-green-950/20">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <p className="text-[13px] font-[600] text-green-700 dark:text-green-300">
              {t.uploadSuccess}
            </p>
            {doc.fileName && (
              <p className="text-[11.5px] text-green-600/70 dark:text-green-400/70 truncate">{doc.fileName}</p>
            )}
          </div>
          {/* Allow re-upload */}
          <button
            type="button"
            onClick={() => { setState({ phase: 'idle' }); /* Reset doc status locally */ }}
            className="text-[11.5px] font-[500] text-green-600 underline dark:text-green-400"
          >
            {t.reupload}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Language selector ──────────────────────────────────────────────────────

function LangSelector({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const [open, setOpen] = useState(false)
  const labels = { en: 'English', gu: 'ગુજરાતી', hi: 'हिंदी' }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-3 py-1.5 text-[12.5px] font-[500] text-[var(--text-secondary)] backdrop-blur-sm transition-colors hover:border-[var(--border-strong)]"
      >
        {labels[lang]}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
            {(Object.entries(labels) as [Lang, string][]).map(([l, label]) => (
              <button
                key={l}
                type="button"
                onClick={() => { onChange(l); setOpen(false) }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2.5 text-[13px] transition-colors',
                  l === lang
                    ? 'bg-brand-50 font-[600] text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
                )}
              >
                {label}
                {l === lang && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function PortalUploadPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [lang, setLang] = useState<Lang>('en')
  const [uploadedIds, setUploadedIds] = useState<Set<string>>(new Set())

  const { data, isLoading, error } = useQuery({
    queryKey: ['portal', token],
    queryFn: async () => {
      const res = await portalApi.get(`/api/portal/${token}`)
      return res.data.data
    },
    retry: false,
  })

  // Set language from client preference
  useState(() => {
    if (data?.client?.preferredLanguage) {
      setLang(data.client.preferredLanguage as Lang)
    }
  })

  // Redirect to expired page
  if (error) {
    const msg = (error as any)?.response?.data?.error
    if (msg === 'EXPIRED') {
      navigate('/c/expired', { replace: true })
      return null
    }
  }

  const t = STRINGS[lang]

  const docs = data?.documents ?? []
  const requiredDocs = docs.filter((d: any) => d.isRequired)
  const optionalDocs = docs.filter((d: any) => !d.isRequired)

  const allRequiredUploaded = requiredDocs.every(
    (d: any) => uploadedIds.has(d.id) || ['UPLOADED', 'ACCEPTED'].includes(d.status),
  )
  const totalUploaded = docs.filter(
    (d: any) => uploadedIds.has(d.id) || ['UPLOADED', 'ACCEPTED'].includes(d.status),
  ).length

  const expiresFormatted = data?.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[var(--border)] border-t-brand-600" />
          <p className="text-[13px] text-[var(--text-tertiary)]">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          {/* CA Logo + Name */}
          <div className="flex items-center gap-2.5">
            {data?.workspace?.logoUrl ? (
              <img src={data.workspace.logoUrl} className="h-7 w-7 rounded-lg object-cover" alt="" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-[11px] font-[800] text-white">
                {data?.workspace?.name?.charAt(0) ?? 'CA'}
              </div>
            )}
            <span className="text-[13px] font-[700] text-[var(--text-primary)]"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
              {data?.workspace?.name}
            </span>
          </div>

          <LangSelector lang={lang} onChange={setLang} />
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pb-24">

        {/* ── Hero greeting ── */}
        <div className="py-7">
          <p className="text-[26px] font-[800] leading-tight text-[var(--text-primary)]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
            {t.greeting(data?.client?.name?.split(' ')[0] ?? '')}
          </p>
          <p className="mt-1.5 text-[14.5px] text-[var(--text-secondary)] leading-relaxed">
            {t.caRequest(data?.workspace?.name ?? 'Your CA')}
          </p>

          {/* Case info pill */}
          {data?.case && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[12px]">
              <span className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-[700]',
                'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
              )}>
                {data.case.serviceType}
              </span>
              <span className="font-[500] text-[var(--text-primary)]">{data.case.title}</span>
              {data.case.financialYear && (
                <span className="font-mono text-[var(--text-tertiary)]">FY {data.case.financialYear}</span>
              )}
            </div>
          )}
        </div>

        {/* ── Progress bar ── */}
        {docs.length > 0 && (
          <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12.5px] font-[600] text-[var(--text-primary)]"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                {totalUploaded}/{docs.length} uploaded
              </span>
              <span className="text-[12px] font-[700] text-brand-600 dark:text-brand-400">
                {Math.round((totalUploaded / docs.length) * 100)}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-700 ease-out"
                style={{ width: `${(totalUploaded / docs.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── All done banner ── */}
        {allRequiredUploaded && requiredDocs.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-brand-500 p-5 text-white shadow-lg">
            <p className="text-[18px] font-[800] leading-snug"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
              {t.allDone}
            </p>
            <p className="mt-1 text-[13px] text-white/80">{t.allDoneMsg}</p>
          </div>
        )}

        {/* ── Required documents ── */}
        {requiredDocs.length > 0 && (
          <section className="mb-6">
            <p className="mb-3 text-[11px] font-[700] uppercase tracking-wider text-[var(--text-tertiary)]"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
              {t.required} ({requiredDocs.length})
            </p>
            <div className="flex flex-col gap-3">
              {requiredDocs.map((doc: any) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  token={token!}
                  lang={lang}
                  onUploaded={() => setUploadedIds((s) => new Set([...s, doc.id]))}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Optional documents ── */}
        {optionalDocs.length > 0 && (
          <section className="mb-6">
            <p className="mb-3 text-[11px] font-[700] uppercase tracking-wider text-[var(--text-tertiary)]"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
              {t.optional} ({optionalDocs.length})
            </p>
            <div className="flex flex-col gap-3">
              {optionalDocs.map((doc: any) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  token={token!}
                  lang={lang}
                  onUploaded={() => setUploadedIds((s) => new Set([...s, doc.id]))}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <div className="mt-8 flex flex-col items-center gap-1 text-center">
          {expiresFormatted && (
            <p className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-tertiary)]">
              <Clock className="h-3 w-3" />
              {t.expiresOn(expiresFormatted)}
            </p>
          )}
          <p className="text-[11px] text-[var(--text-tertiary)]/60">{t.poweredBy}</p>
        </div>
      </div>
    </div>
  )
}
