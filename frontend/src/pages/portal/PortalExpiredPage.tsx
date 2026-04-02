import { useState } from 'react'
import { Clock, Phone } from 'lucide-react'

const STRINGS = {
  en: {
    title: 'This link has expired',
    desc: 'The document upload link is no longer valid.',
    contact: 'Please contact your CA to get a new link.',
    poweredBy: 'Powered by CAFlow',
  },
  gu: {
    title: 'આ લિંક એક્સ્પાયર થઈ ગઈ છે',
    desc: 'દસ્તાવેજ અપલોડ કરવાની લિંક હવે માન્ય નથી.',
    contact: 'નવી લિંક મેળવવા માટે કૃપા કરીને તમારા CA નો સંપર્ક કરો.',
    poweredBy: 'CAFlow દ્વારા',
  },
  hi: {
    title: 'यह लिंक एक्सपायर हो गई है',
    desc: 'दस्तावेज़ अपलोड करने की लिंक अब मान्य नहीं है।',
    contact: 'नई लिंक के लिए कृपया अपने CA से संपर्क करें।',
    poweredBy: 'CAFlow द्वारा',
  },
}
type Lang = keyof typeof STRINGS

export default function PortalExpiredPage() {
  const [lang, setLang] = useState<Lang>('en')
  const t = STRINGS[lang]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
      {/* Language selector */}
      <div className="absolute right-4 top-4">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] outline-none"
        >
          <option value="en">English</option>
          <option value="gu">ગુજરાતી</option>
          <option value="hi">हिंदी</option>
        </select>
      </div>

      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
        <Clock className="h-9 w-9 text-amber-500" />
      </div>

      {/* Brand mark */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-[12px] font-[800] text-white">
          CA
        </div>
        <span
          className="text-[15px] font-[800] text-[var(--text-primary)]"
          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
        >
          CAFlow
        </span>
      </div>

      <h1
        className="text-[24px] font-[800] tracking-tight text-[var(--text-primary)]"
        style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
      >
        {t.title}
      </h1>

      <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-[var(--text-secondary)]">
        {t.desc}
      </p>

      {/* Contact pill */}
      <div className="mt-6 inline-flex items-center gap-2.5 rounded-2xl border border-amber-200/80 bg-amber-50 px-5 py-3.5 dark:border-amber-800/40 dark:bg-amber-950/20">
        <Phone className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-[13px] font-[500] text-amber-700 dark:text-amber-300">
          {t.contact}
        </p>
      </div>

      {/* Decorative gradient blob */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(22,138,88,0.15) 0%, transparent 70%)',
        }}
      />

      <p className="absolute bottom-6 text-[11px] text-[var(--text-tertiary)]/50">
        {t.poweredBy}
      </p>
    </div>
  )
}
