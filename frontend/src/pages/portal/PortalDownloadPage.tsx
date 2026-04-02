import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Download, FileText } from 'lucide-react'

const portalApi = axios.create({ baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000' })

const STRINGS = {
  en: { title: 'Your Documents', from: (n: string) => `From ${n}`, download: 'Download', downloading: 'Getting link…', noFiles: 'No documents shared yet.', poweredBy: 'Powered by CAFlow' },
  gu: { title: 'તમારા દસ્તાવેજ', from: (n: string) => `${n} તરફથી`, download: 'ડાઉનલોડ', downloading: 'લિંક…', noFiles: 'હજી કોઈ દસ્તાવેજ નથી.', poweredBy: 'CAFlow દ્વારા' },
  hi: { title: 'आपके दस्तावेज़', from: (n: string) => `${n} की ओर से`, download: 'डाउनलोड', downloading: 'लिंक मिल रही है…', noFiles: 'अभी कोई दस्तावेज़ नहीं।', poweredBy: 'CAFlow द्वारा' },
}
type Lang = keyof typeof STRINGS

function fmtSize(b: number | null) {
  if (!b) return ''
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`
}

export default function PortalDownloadPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [lang, setLang] = useState<Lang>('en')
  const [downloading, setDownloading] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['portal-download', token],
    queryFn: async () => { const r = await portalApi.get(`/api/portal/${token}`); return r.data.data },
    retry: false,
  })

  if ((error as any)?.response?.data?.error === 'EXPIRED') { navigate('/c/expired', { replace: true }); return null }

  const t = STRINGS[lang]
  const docs = (data?.documents ?? []).filter((d: any) => d.fileKey)

  const handleDownload = async (docId: string) => {
    setDownloading(docId)
    try {
      const res = await portalApi.get(`/api/portal/${token}/download/${docId}`)
      const { url, fileName } = res.data.data
      const a = document.createElement('a'); a.href = url; a.download = fileName ?? 'document'; a.click()
    } finally { setDownloading(null) }
  }

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-brand-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-[11px] font-[800] text-white">{data?.workspace?.name?.charAt(0) ?? 'CA'}</div>
            <span className="text-[13px] font-[700] text-[var(--text-primary)]" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>{data?.workspace?.name}</span>
          </div>
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[12px] text-[var(--text-secondary)] outline-none">
            <option value="en">English</option><option value="gu">ગુજરાતી</option><option value="hi">हिंदी</option>
          </select>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-1 text-[24px] font-[800] text-[var(--text-primary)]" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>{t.title}</h1>
        <p className="mb-7 text-[13.5px] text-[var(--text-secondary)]">{t.from(data?.workspace?.name ?? '')}</p>

        {docs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-subtle)]"><FileText className="h-7 w-7 text-[var(--text-tertiary)]" /></div>
            <p className="text-[13.5px] font-[500] text-[var(--text-tertiary)]">{t.noFiles}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {docs.map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/40">
                  <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-[700] text-[var(--text-primary)] truncate">{doc.label}</p>
                  {doc.fileName && <p className="text-[11.5px] text-[var(--text-tertiary)]">{doc.fileName}{fmtSize(doc.fileSizeBytes) ? ` · ${fmtSize(doc.fileSizeBytes)}` : ''}</p>}
                </div>
                <button type="button" disabled={downloading === doc.id} onClick={() => handleDownload(doc.id)}
                  className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-[700] text-white transition-all hover:bg-brand-700 active:scale-95 disabled:opacity-60"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  {downloading === doc.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Download className="h-4 w-4" />}
                  {downloading === doc.id ? t.downloading : t.download}
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-10 text-center text-[11px] text-[var(--text-tertiary)]/60">{t.poweredBy}</p>
      </div>
    </div>
  )
}
