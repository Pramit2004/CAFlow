import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, Mail, Sparkles, BarChart3, Users, FileCheck } from 'lucide-react'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { useWorkspaceStore } from '@/store/workspace.store'

/* ─── Floating stat card ──────────────────────────────────────────────────── */
function StatCard({
  icon: Icon, label, value, sub, color, style, className,
}: {
  icon: React.ElementType; label: string; value: string; sub: string
  color: string; style?: React.CSSProperties; className?: string
}) {
  return (
    <div
      className={`absolute rounded-2xl px-4 py-3 animate-float ${className ?? ''}`}
      style={{
        background: 'rgba(255,255,255,0.050)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        ...style,
      }}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white ${color}`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[10px] font-[500] text-white">{label}</p>
          <p
            className="text-[15px] font-[800] text-white leading-tight"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          >
            {value}
          </p>
          <p className="text-[10px] text-white">{sub}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Animated blob ───────────────────────────────────────────────────────── */
function Blob({ x, y, size, color, delay = 0 }: {
  x: string; y: string; size: number; color: string; delay?: number
}) {
  return (
    <div
      className="pointer-events-none absolute rounded-full animate-blob"
      style={{
        left: x, top: y, width: size, height: size,
        background: color,
        filter: `blur(${Math.round(size * 0.22)}px)`,
        animationDelay: `${delay}s`,
        opacity: 0.5,
        willChange: 'transform',
      }}
    />
  )
}

/* ─── Loading dots ─────────────────────────────────────────────────────────── */
function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth, isAuthenticated } = useAuthStore()
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace)

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const from = (location.state as any)?.from?.pathname ?? '/dashboard'

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated])

  useEffect(() => {
    const h = (e: MouseEvent) =>
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 })
    window.addEventListener('mousemove', h, { passive: true })
    return () => window.removeEventListener('mousemove', h)
  }, [])

  const startCooldown = useCallback(() => {
    setResendCooldown(60)
    cooldownRef.current = setInterval(() => {
      setResendCooldown((v) => { if (v <= 1) { clearInterval(cooldownRef.current!); return 0 } return v - 1 })
    }, 1000)
  }, [])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/auth/send-otp', { email: email.toLowerCase().trim() })
      setStep('otp')
      startCooldown()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/send-otp', { email })
      startCooldown()
      setOtp(['', '', '', '', '', ''])
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to resend.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
    if (next.every((d) => d)) handleVerifyOtp(next.join(''))
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) document.getElementById(`otp-${index - 1}`)?.focus()
  }

  const handleVerifyOtp = async (code: string) => {
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/verify-otp', { email, otp: code })
      const { needsOnboarding, token, user, workspace } = res.data.data
      if (needsOnboarding) {
        useAuthStore.getState().setAuth({ id: 'pending', name: '', email, role: 'owner', workspaceId: '' }, token)
        navigate('/onboarding', { replace: true })
      } else {
        setAuth(user, token)
        if (workspace) setWorkspace(workspace)
        navigate(from, { replace: true })
      }
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => document.getElementById('otp-0')?.focus(), 0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-white">

      {/* ─ Left hero ─────────────────────────────────────────────── */}
      <div
        className="relative hidden flex-1 items-center justify-center overflow-hidden lg:flex"
        style={{ background: 'linear-gradient(145deg, #1A0D06 0%, #3D1F0A 30%, #7D2D09 65%, #C84B0F 100%)' }}
      >
        {/* Blobs layer 1 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ transform: `translate(${mousePos.x * 18}px, ${mousePos.y * 12}px)`, willChange: 'transform', transition: 'transform 0.1s linear' }}
        >
          <Blob x="8%" y="12%" size={340} color="rgba(249,115,22,0.30)" />
          <Blob x="55%" y="50%" size={280} color="rgba(200,75,15,0.28)" delay={1.5} />
        </div>
        {/* Blobs layer 2 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -9}px)`, willChange: 'transform', transition: 'transform 0.1s linear' }}
        >
          <Blob x="65%" y="5%" size={200} color="rgba(245,166,35,0.22)" delay={0.8} />
          <Blob x="3%" y="62%" size={240} color="rgba(249,115,22,0.18)" delay={2.2} />
        </div>

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.6]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />

        {/* Floating cards */}
        <StatCard label="Active cases" value="124" sub="↑ 18 this month" icon={BarChart3}
          color="bg-brand-400" className="top-[16%] left-[7%] w-[200px]" style={{ animationDuration: '5.5s' }} />
        <StatCard label="Documents collected" value="2,840" sub="98.2% on time" icon={FileCheck}
          color="bg-brand-400" className="bottom-[22%] right-[7%] w-[210px]" style={{ animationDuration: '6.5s', animationDelay: '1.2s' }} />
        <StatCard label="Active clients" value="312" sub="Across 3 staff" icon={Users}
          color="bg-brand-400" className="bottom-[16%] left-[7%] w-[196px]" style={{ animationDuration: '4.8s', animationDelay: '0.6s' }} />

        {/* Hero copy */}
        <div
          className="relative z-10 max-w-[380px] px-8 text-center"
          style={{ transform: `translate(${mousePos.x * -5}px, ${mousePos.y * -4}px)`, willChange: 'transform', transition: 'transform 0.1s linear' }}
        >
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
          >
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#FBBF24' }} />
            <span className="text-[11.5px]  text-white">India's #1 CA Practice Tool</span>
          </div>

          <h2
            className="mb-4 text-[40px] font-[800] leading-[1.08] tracking-tight text-white"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          >
            Replace the<br />
            <span style={{ color: '#0df700ba' }}>WhatsApp chaos</span><br />
            forever.
          </h2>

          <p className="text-[14.5px] leading-relaxed" style={{ color: 'rgba(255, 255, 255, 255)' }}>
            Structured document collection, case tracking and client management — built for Indian CAs.
          </p>

          <div
            className="mt-8 rounded-2xl p-4 text-left"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
          >
            <p className="text-[13px] italic leading-relaxed" style={{ color: 'white' }}>
              "CAFlow cut my document follow-up time by 70%. My clients love the upload portal."
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-[700] text-white"
                style={{ background: 'linear-gradient(135deg,#C84B0F,#F97316)' }}
              >RS</div>
              <div>
                <p className="text-[11.5px] font-[600] text-white">Rajesh Shah, CA</p>
                <p className="text-[10.5px]" style={{ color: 'white' }}>Surat, Gujarat · 280 clients</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─ Right auth panel ─────────────────────────────────────── */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[460px] lg:flex-shrink-0">
        {/* Subtle warm glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 70% 10%, rgba(249,115,22,0.04) 0%, transparent 55%), radial-gradient(ellipse at 20% 90%, rgba(245,166,35,0.04) 0%, transparent 55%)' }}
        />

        <div className="relative w-full max-w-[360px] animate-fade-in">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="9" fill="url(#authPanelLG)" />
              <path d="M8 21C8 21 10.5 14.5 16.5 11.5C22.5 8.5 24.5 12.5 24.5 12.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M11.5 25C11.5 25 13.5 19 19.5 16.5C22.5 15 24.5 16 24.5 16" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="24.5" cy="12.5" r="2.5" fill="white" />
              <defs>
                <linearGradient id="authPanelLG" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7D2D09" />
                  <stop offset="1" stopColor="#F97316" />
                </linearGradient>
              </defs>
            </svg>
            <span
              className="text-[21px] font-[800] tracking-tight text-[#1A1512]"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
            >
              CA<span className="text-brand-600">Flow</span>
            </span>
          </div>

          {step === 'email' ? (
            /* ── Email step ─────────────────────────────────── */
            <>
              <div className="mb-7">
                <h1
                  className="text-[28px] font-[800] tracking-tight text-[#1A1512]"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                >Welcome back</h1>
                <p className="mt-1.5 text-[14px]" style={{ color: '#6B6258' }}>
                  Enter your email to receive a sign-in code.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label
                    className="mb-1.5 block text-[12.5px] font-[600] text-[#1A1512]"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                  >Email address</label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-[15px] w-[15px]"
                      style={{ color: '#C9BFB3' }}
                      strokeWidth={1.8}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@yourfirm.com"
                      autoFocus
                      autoComplete="email"
                      className="w-full rounded-xl py-3 pl-10 pr-4 text-[14px] outline-none transition-all duration-150"
                      style={{ border: '1.5px solid #EDE8E1', background: '#FFFFFF', color: '#1A1512' }}
                      onFocus={(e) => { e.target.style.borderColor = '#C84B0F'; e.target.style.boxShadow = '0 0 0 3px rgba(200,75,15,0.12)' }}
                      onBlur={(e) => { e.target.style.borderColor = '#EDE8E1'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl px-4 py-2.5 text-[12.5px]"
                    style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-[14px] font-[700] text-white transition-all duration-150 disabled:opacity-60"
                  style={{
                    background: '#C84B0F',
                    boxShadow: '0 4px 16px rgba(200,75,15,0.30)',
                    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                  }}
                  onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = '#A33A0C') }}
                  onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = '#C84B0F') }}
                >
                  {loading ? <LoadingDots /> : (
                    <>Send sign-in code <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── OTP step ───────────────────────────────────── */
            <>
              <div className="mb-7">
                <h1
                  className="text-[28px] font-[800] tracking-tight text-[#1A1512]"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                >Check your email</h1>
                <p className="mt-1.5 text-[14px]" style={{ color: '#6B6258' }}>
                  We sent a 6-digit code to{' '}
                  <span className="font-[600] text-[#1A1512]">{email}</span>
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    className="mb-3 block text-[12.5px] font-[600] text-[#1A1512]"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                  >Enter 6-digit code</label>
                  <div className="grid grid-cols-6 gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        disabled={loading}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        autoFocus={i === 0}
                        className="aspect-square w-full rounded-xl text-center text-[20px] font-[800] outline-none transition-all duration-150 disabled:opacity-50"
                        style={{
                          border: `1.5px solid ${digit ? '#C84B0F' : '#EDE8E1'}`,
                          background: digit ? '#FFF4EE' : '#FFFFFF',
                          color: '#1A1512',
                          boxShadow: digit ? '0 0 0 2px rgba(200,75,15,0.10)' : 'none',
                          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#C84B0F'; e.target.style.boxShadow = '0 0 0 3px rgba(200,75,15,0.14)' }}
                        onBlur={(e) => { e.target.style.borderColor = digit ? '#C84B0F' : '#EDE8E1'; e.target.style.boxShadow = digit ? '0 0 0 2px rgba(200,75,15,0.10)' : 'none' }}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl px-4 py-2.5 text-[12.5px]"
                    style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                    {error}
                  </div>
                )}

                {loading && (
                  <div className="flex items-center justify-center gap-2 py-1" style={{ color: '#A09890' }}>
                    <LoadingDots />
                    <span className="text-[13px]">Verifying…</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[12.5px]">
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError('') }}
                    className="transition-colors duration-150 hover:underline"
                    style={{ color: '#6B6258' }}
                  >
                    ← Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="font-[600] transition-colors duration-150 disabled:opacity-50"
                    style={{ color: resendCooldown > 0 ? '#A09890' : '#C84B0F' }}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </div>
            </>
          )}

          <p className="mt-8 text-center text-[11.5px]" style={{ color: '#A09890' }}>
            By continuing, you agree to our{' '}
            <a href="#" className="text-brand-600 hover:underline">Terms</a>{' '}and{' '}
            <a href="#" className="text-brand-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
