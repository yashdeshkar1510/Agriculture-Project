import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Landmark,
  LoaderCircle,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
  Wheat,
} from 'lucide-react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const roleOptions = [
  { value: 'farmer', label: 'Farmer', icon: Wheat },
  { value: 'bank', label: 'Bank Officer', icon: Wallet },
]

const initialFormState = {
  fullName: '',
  email: '',
  mobileNumber: '',
  password: '',
  confirmPassword: '',
  userRole: 'farmer',
}

const initialErrors = {
  fullName: '',
  email: '',
  mobileNumber: '',
  password: '',
  confirmPassword: '',
  userRole: '',
}

function App() {
  const [mode, setMode] = useState('signup')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('idle')
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState(initialErrors)

  const activeRole = useMemo(
    () => roleOptions.find((option) => option.value === formData.userRole) ?? roleOptions[0],
    [formData.userRole],
  )

  const validate = () => {
    const nextErrors = { ...initialErrors }

    if (mode === 'signup' && formData.fullName.trim().length < 3) {
      nextErrors.fullName = 'Enter at least 3 characters for the full name.'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (mode === 'signup' && !/^\+?[0-9]{7,15}$/.test(formData.mobileNumber.trim())) {
      nextErrors.mobileNumber = 'Use a valid mobile number with 7 to 15 digits.'
    }

    if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters long.'
    }

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (!formData.userRole) {
      nextErrors.userRole = 'Choose a user role.'
    }

    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setMessage('')
  }

  const submitForm = async (event) => {
    event.preventDefault()

    if (!validate()) {
      setMessageType('error')
      setMessage('Please fix the highlighted fields.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    const endpoint = mode === 'signup' ? '/auth/register' : '/auth/login'
    const payload =
      mode === 'signup'
        ? {
            fullName: formData.fullName,
            email: formData.email,
            mobileNumber: formData.mobileNumber,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            userRole: formData.userRole,
          }
        : {
            email: formData.email,
            password: formData.password,
            userRole: formData.userRole,
          }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication request failed.')
      }

      localStorage.setItem('agro_auth_token', data.accessToken ?? data.access_token)
      localStorage.setItem('agro_auth_user', JSON.stringify(data.user))

      setMessageType('success')
      setMessage(
        mode === 'signup'
          ? 'Registration completed. Your account is ready.'
          : 'Login successful. Token saved for API access.',
      )

      if (mode === 'login') {
        setFormData((current) => ({
          ...current,
          password: '',
          confirmPassword: '',
        }))
      } else {
        setFormData(initialFormState)
      }
    } catch (error) {
      setMessageType('error')
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#04141f] text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.24),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_24%),linear-gradient(180deg,rgba(4,20,31,0.4),rgba(4,20,31,1))]" />
        <div className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-drift-slower" />

        <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-blue-500 text-slate-950 shadow-lg shadow-emerald-500/30">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">
                  Agro Platform
                </p>
                <p className="text-sm text-slate-300">Authentication module</p>
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span className="text-sm text-slate-300">JWT + bcrypt + role-based access</span>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <section className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl lg:min-h-[720px]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                <Sparkles className="h-4 w-4" />
                Secure access for farmers and bank officers
              </div>

              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  Sign in to a trusted Agri-FinTech workflow.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Create farmer accounts, authenticate bank officers, and protect every request with
                  hashed passwords, JWT tokens, and role-based authorization.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  'Farmer registration and login',
                  'Bank officer access control',
                  'MongoDB-backed user storage',
                  'API-ready token responses',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 text-sm text-slate-200"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-5 shadow-lg shadow-black/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Active role</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{activeRole.label}</p>
                </div>
                <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                  {mode === 'signup' ? 'Registration' : 'Login'}
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                {roleOptions.map((option) => {
                  const Icon = option.icon
                  const selected = formData.userRole === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('userRole', option.value)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        selected
                          ? 'border-emerald-400/40 bg-emerald-400/15 text-white'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 lg:p-8">
            <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setMessage('')
                }}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  mode === 'login'
                    ? 'bg-white text-slate-950 shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setMessage('')
                }}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-emerald-400 to-blue-500 text-slate-950 shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={submitForm} noValidate>
              {mode === 'signup' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="fullName">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(event) => updateField('fullName', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-11 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-white/10"
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && <p className="mt-2 text-sm text-rose-300">{errors.fullName}</p>}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-11 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-white/10"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-rose-300">{errors.email}</p>}
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="mobileNumber">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={(event) => updateField('mobileNumber', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-11 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-white/10"
                      placeholder="+254700000000"
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p className="mt-2 text-sm text-rose-300">{errors.mobileNumber}</p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-11 py-4 pr-14 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-white/10"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-rose-300">{errors.password}</p>}
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(event) => updateField('confirmPassword', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-11 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-white/10"
                      placeholder="Repeat your password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-rose-300">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-slate-200">Selected Role</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('userRole', option.value)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        formData.userRole === option.value
                          ? 'border-emerald-400/40 bg-emerald-400/15 text-white'
                          : 'border-white/10 bg-slate-950/40 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.userRole && <p className="mt-2 text-sm text-rose-300">{errors.userRole}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-blue-500 px-5 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : mode === 'signup' ? (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {message && (
                <div
                  className={`rounded-2xl border px-4 py-4 text-sm ${
                    messageType === 'success'
                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                      : 'border-rose-400/30 bg-rose-400/10 text-rose-200'
                  }`}
                >
                  {message}
                </div>
              )}

              <p className="pt-2 text-center text-sm text-slate-400">
                API base URL: <span className="text-slate-200">{API_BASE_URL}</span>
              </p>
            </form>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App