import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, User, Award, MapPin } from 'lucide-react'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { useWorkspaceStore } from '@/store/workspace.store'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { token, clearAuth, setAuth } = useAuthStore()
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace)

  const [form, setForm] = useState({ firmName: '', name: '', icaiNumber: '', city: '', state: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firmName.trim()) { setError('Firm name is required'); return }
    if (!form.name.trim()) { setError('Your name is required'); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/onboarding', form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const { token: newToken, user, workspace } = res.data.data
      setAuth(user, newToken)
      setWorkspace(workspace)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const InputField = ({ icon: Icon, label, field, placeholder, optional = false }: {
    icon: React.ElementType; label: string; field: keyof typeof form; placeholder: string; optional?: boolean
  }) => (
    <div>
      <label
        className="mb-1.5 block text-[12.5px] font-[600] text-[#1A1512]"
        style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
      >
        {label} {optional && <span style={{ color: '#A09890', fontWeight: 400 }}>(optional)</span>}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-[15px] w-[15px]" style={{ color: '#C9BFB3' }} strokeWidth={1.8} />
        <input
          type="text"
          value={form[field]}
          onChange={set(field)}
          placeholder={placeholder}
          className="w-full rounded-xl py-3 pl-10 pr-4 text-[14px] outline-none transition-all duration-150"
          style={{ border: '1.5px solid #EDE8E1', background: '#FFFFFF', color: '#1A1512' }}
          onFocus={(e) => { e.target.style.borderColor = '#C84B0F'; e.target.style.boxShadow = '0 0 0 3px rgba(200,75,15,0.12)' }}
          onBlur={(e) => { e.target.style.borderColor = '#EDE8E1'; e.target.style.boxShadow = 'none' }}
        />
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F7F4] px-4 py-12">
      <div className="w-full max-w-[440px] animate-fade-in">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="9" fill="url(#onbLG)" />
            <path d="M8 21C8 21 10.5 14.5 16.5 11.5C22.5 8.5 24.5 12.5 24.5 12.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M11.5 25C11.5 25 13.5 19 19.5 16.5C22.5 15 24.5 16 24.5 16" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="24.5" cy="12.5" r="2.5" fill="white" />
            <defs>
              <linearGradient id="onbLG" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7D2D09" /><stop offset="1" stopColor="#F97316" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-[21px] font-[800] tracking-tight text-[#1A1512]" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
            CA<span className="text-brand-600">Flow</span>
          </span>
        </div>

        <div className="rounded-2xl bg-white p-8" style={{ border: '1px solid #EDE8E1', boxShadow: '0 4px 24px rgba(26,21,18,0.08)' }}>
          {/* Progress indicator */}
          <div className="mb-6 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-brand-600" />
            <div className="h-1.5 flex-1 rounded-full" style={{ background: '#EDE8E1' }} />
            <div className="h-1.5 flex-1 rounded-full" style={{ background: '#EDE8E1' }} />
          </div>

          <h1
            className="text-[24px] font-[800] tracking-tight text-[#1A1512]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          >
            Set up your practice
          </h1>
          <p className="mt-1.5 mb-7 text-[13.5px]" style={{ color: '#6B6258' }}>
            Just a few details to get your CAFlow workspace ready.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField icon={Building2} label="Firm / Practice name" field="firmName" placeholder="e.g. Shah & Associates" />
            <InputField icon={User} label="Your full name" field="name" placeholder="e.g. Rajesh Shah" />
            <InputField icon={Award} label="ICAI Membership No." field="icaiNumber" placeholder="e.g. 123456" optional />

            <div className="grid grid-cols-2 gap-3">
              <InputField icon={MapPin} label="City" field="city" placeholder="e.g. Surat" optional />
              <InputField icon={MapPin} label="State" field="state" placeholder="e.g. Gujarat" optional />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-2.5 text-[12.5px]" style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-[14px] font-[700] text-white transition-all duration-150 disabled:opacity-60"
              style={{
                background: '#C84B0F',
                boxShadow: '0 4px 16px rgba(200,75,15,0.30)',
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#A33A0C' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#C84B0F' }}
            >
              {loading ? (
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              ) : (
                <>Launch my workspace <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" /></>
              )}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => { clearAuth(); navigate('/login', { replace: true }) }}
          className="mt-4 w-full text-center text-[12px] transition-colors duration-150 hover:underline"
          style={{ color: '#A09890' }}
        >
          ← Back to sign in
        </button>
      </div>
    </div>
  )
}
