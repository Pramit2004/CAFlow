import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Shield, Zap, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

/* ── Floating blob for parallax bg ─────────────────────────────────────── */
function ParallaxBlob({
  x, y, size, color, delay = 0,
}: { x: string; y: string; size: number; color: string; delay?: number }) {
  return (
    <div
      className="pointer-events-none absolute rounded-full opacity-[0.35] blur-[80px] dark:opacity-[0.2]"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: color,
        animationDelay: `${delay}s`,
      }}
    />
  )
}

/* ── Floating card preview ───────────────────────────────────────────────── */
function FloatingPreviewCard({
  title, value, sub, icon: Icon, color, style, className,
}: {
  title: string; value: string; sub: string; icon: React.ElementType
  color: string; style?: React.CSSProperties; className?: string
}) {
  return (
    <div
      className={cn(
        'absolute rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl px-4 py-3 shadow-xl',
        'animate-float',
        className,
      )}
      style={style}
    >
      <div className="flex items-center gap-3">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-white', color)}>
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-[10px] font-[500] text-[var(--text-tertiary)]">{title}</p>
          <p className="text-[14px] font-[700] text-[var(--text-primary)]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
            {value}
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)]">{sub}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Logo ────────────────────────────────────────────────────────────────── */
function LogoFull() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="9" fill="url(#loginLogoGrad)" />
        <path d="M8 20C8 20 10 14 16 11C22 8 24 12 24 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M11 24C11 24 13 18 19 16C22 15 24 16 24 16" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="12" r="2.5" fill="white" />
        <defs>
          <linearGradient id="loginLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F5538" />
            <stop offset="1" stopColor="#3BBE87" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[20px] font-[800] tracking-tight text-[var(--text-primary)]"
        style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
        CA<span className="text-brand-600 dark:text-brand-400">Flow</span>
      </span>
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  /* Parallax on mouse move */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setStep('otp')
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`)
      next?.focus()
    }
    if (newOtp.every((d) => d) && newOtp.join('').length === 6) {
      handleOtpVerify(newOtp.join(''))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleOtpVerify = async (_code: string) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[var(--bg)]">

      {/* ── Left panel — Hero ──────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="relative hidden flex-1 items-center justify-center overflow-hidden lg:flex"
        style={{
          background: 'linear-gradient(145deg, #0a2e1e 0%, #0f4a30 40%, #1a7a4f 80%, #2da86a 100%)',
        }}
      >
        {/* Animated gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-30"
            style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(59,190,135,0.4) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 opacity-20"
            style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(249,158,11,0.3) 0%, transparent 55%)' }} />
        </div>

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Parallax blobs */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 10}px)` }}
        >
          <ParallaxBlob x="10%" y="15%" size={320} color="rgba(59,190,135,0.25)" />
          <ParallaxBlob x="60%" y="55%" size={280} color="rgba(18,110,71,0.3)" delay={1} />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -8}px)` }}
        >
          <ParallaxBlob x="70%" y="5%" size={200} color="rgba(249,158,11,0.2)" delay={2} />
          <ParallaxBlob x="5%" y="65%" size={240} color="rgba(59,190,135,0.15)" delay={0.5} />
        </div>

        {/* Floating preview cards */}
        <FloatingPreviewCard
          title="Cases this month"
          value="124"
          sub="↑ 18 from last month"
          icon={Zap}
          color="bg-brand-600"
          className="top-[18%] left-[8%] w-[210px]"
          style={{ animationDuration: '5s' }}
        />
        <FloatingPreviewCard
          title="Documents collected"
          value="2,840"
          sub="98.2% on time"
          icon={Shield}
          color="bg-emerald-600"
          className="bottom-[25%] right-[6%] w-[210px]"
          style={{ animationDuration: '6s', animationDelay: '1.5s' }}
        />
        <FloatingPreviewCard
          title="Active clients"
          value="312"
          sub="Across 3 staff members"
          icon={Users}
          color="bg-amber-500"
          className="bottom-[18%] left-[8%] w-[200px]"
          style={{ animationDuration: '4.5s', animationDelay: '0.8s' }}
        />

        {/* Hero content */}
        <div
          className="relative z-10 max-w-[400px] px-8 text-center"
          style={{ transform: `translate(${mousePos.x * -5}px, ${mousePos.y * -5}px)` }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-[12px] font-[500] text-white/90">
              India's #1 CA Practice Tool
            </span>
          </div>

          <h2
            className="mb-4 text-[38px] font-[800] leading-[1.1] tracking-tight text-white"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          >
            Replace the<br />
            <span className="text-[#7eeab8]">WhatsApp chaos</span><br />
            forever.
          </h2>

          <p className="text-[15px] leading-relaxed text-white/60">
            Structured document collection, case tracking, and client management — built for Indian CAs.
          </p>

          {/* Testimonial */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-[13px] italic leading-relaxed text-white/75">
              "CAFlow cut my document follow-up time by 70%. My clients love the upload portal."
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[10px] font-[700] text-white">
                RS
              </div>
              <div className="text-left">
                <p className="text-[11px] font-[600] text-white/90">Rajesh Shah, CA</p>
                <p className="text-[10px] text-white/50">Surat, Gujarat · 280 clients</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — Auth form ─────────────────────────────────── */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[460px] lg:flex-shrink-0">
        {/* Theme toggle top-right */}
        <div className="absolute right-6 top-6">
          <ThemeToggle variant="icon" />
        </div>

        <div className="w-full max-w-[360px] animate-fade-in">
          {/* Logo */}
          <div className="mb-8">
            <LogoFull />
          </div>

          {step === 'phone' ? (
            <>
              <div className="mb-6">
                <h1
                  className="text-[26px] font-[700] tracking-tight text-[var(--text-primary)]"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                >
                  Welcome back
                </h1>
                <p className="mt-1 text-[13.5px] text-[var(--text-secondary)]">
                  Enter your phone number to sign in.
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-[500] text-[var(--text-primary)]"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                    Mobile number
                  </label>
                  <div className="flex gap-2">
                    <div className={cn(
                      'flex h-8 w-[56px] flex-shrink-0 items-center justify-center rounded-lg border',
                      'border-[var(--border)] bg-[var(--bg-subtle)] text-[13px] font-[500] text-[var(--text-secondary)]',
                    )}>
                      +91
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className={cn(
                        'h-8 flex-1 rounded-lg border px-3 text-[13px] outline-none transition-all duration-150',
                        'bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                        'border-[var(--border)] focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(18,110,71,0.1)]',
                      )}
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Send OTP
                </Button>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-[11px] text-[var(--text-tertiary)]">or continue with</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>

                <button
                  type="button"
                  className={cn(
                    'flex h-9 w-full items-center justify-center gap-3 rounded-lg border transition-all duration-150',
                    'border-[var(--border)] bg-[var(--surface)] text-[13px] font-[500] text-[var(--text-primary)]',
                    'hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] active:scale-[0.98]',
                  )}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-[26px] font-[700] tracking-tight text-[var(--text-primary)]"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  Verify your number
                </h1>
                <p className="mt-1 text-[13.5px] text-[var(--text-secondary)]">
                  We sent a 6-digit code to{' '}
                  <span className="font-[600] text-[var(--text-primary)]">+91 {phone}</span>
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-3 block text-[12.5px] font-[500] text-[var(--text-primary)]"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                    Enter OTP
                  </label>
                  <div className="flex gap-2.5">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={cn(
                          'h-12 w-full rounded-xl border text-center text-[18px] font-[700] outline-none transition-all duration-150',
                          'bg-[var(--surface)] text-[var(--text-primary)]',
                          'border-[var(--border)] focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(18,110,71,0.12)] focus:bg-brand-50/30 dark:focus:bg-brand-950/20',
                          digit && 'border-brand-300 bg-brand-50/40 dark:border-brand-700 dark:bg-brand-950/30',
                        )}
                        style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  loading={loading}
                  onClick={() => handleOtpVerify(otp.join(''))}
                  disabled={otp.join('').length < 6}
                >
                  {loading ? 'Verifying…' : 'Verify & Sign in'}
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']) }}
                  className="w-full text-center text-[12.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
                >
                  ← Change number
                </button>
              </div>
            </>
          )}

          <p className="mt-8 text-center text-[11.5px] text-[var(--text-tertiary)]">
            By continuing, you agree to our{' '}
            <a href="#" className="text-brand-600 hover:underline dark:text-brand-400">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-brand-600 hover:underline dark:text-brand-400">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
