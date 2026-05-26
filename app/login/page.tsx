"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/LanguageProvider'
import DemoButton from '@/components/DemoButton'

const BULLETS_EN = [
  { icon: '📋', text: 'Track every application in one place' },
  { icon: '📊', text: 'Visual Kanban pipeline to see your progress' },
  { icon: '🔔', text: 'Smart reminders so no opportunity goes cold' },
]
const BULLETS_ES = [
  { icon: '📋', text: 'Todas tus postulaciones en un solo lugar' },
  { icon: '📊', text: 'Pipeline Kanban para ver tu avance de un vistazo' },
  { icon: '🔔', text: 'Recordatorios para no perder ninguna oportunidad' },
]

type Mode = 'login' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const bullets = locale === 'es' ? BULLETS_ES : BULLETS_EN
  const isEs = locale === 'es'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.refresh()
    router.push('/dashboard')
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${location.origin}/auth/callback?type=recovery`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setResetSent(true)
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-indigo-600 p-14 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/40" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-700/50" />

        <Link href="/" className="relative z-10 flex items-center gap-2 text-indigo-200 hover:text-white transition text-sm font-medium">
          <span>←</span>
          <span>Job Tracker</span>
        </Link>

        <div className="relative z-10">
          <p className="mb-3 text-indigo-300 text-sm font-medium uppercase tracking-widest">
            {isEs ? 'Tu búsqueda de empleo' : 'Your job search'}
          </p>
          <h2 className="text-4xl font-bold leading-tight">
            {isEs ? 'Consigue el trabajo\nde tus sueños,\nmás rápido.' : 'Land your\ndream job,\nfaster.'}
          </h2>
          <ul className="mt-10 space-y-5">
            {bullets.map((b) => (
              <li key={b.icon} className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
                  {b.icon}
                </span>
                <span className="mt-1.5 text-sm leading-snug text-indigo-100">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-indigo-300/70">
          {isEs ? 'Gratis para siempre · Sin tarjeta de crédito' : 'Free forever · No credit card required'}
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-zinc-950 px-6 py-16">
        <Link href="/" className="mb-10 self-start text-sm text-zinc-500 hover:text-zinc-200 transition lg:hidden">
          ← {isEs ? 'Inicio' : 'Home'}
        </Link>

        <div className="w-full max-w-md">
          {/* Logo mark */}
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <span className="text-base font-bold text-white">J</span>
            </div>
            <span className="font-semibold text-white">Job Tracker</span>
          </div>

          {/* ── Forgot password mode ── */}
          {mode === 'forgot' ? (
            <>
              <h1 className="text-2xl font-bold text-white">{t.forgot_password.title}</h1>
              <p className="mt-2 text-sm text-zinc-400">{t.forgot_password.subtitle}</p>

              {resetSent ? (
                <div className="mt-8 rounded-xl border border-green-800/40 bg-green-950/30 px-4 py-3">
                  <p className="text-sm text-green-400">✓ {t.forgot_password.success}</p>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="mt-8 space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-300">{t.auth.email}</label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.forgot_password.placeholder}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  {error && (
                    <p className="rounded-xl border border-red-800/50 bg-red-950/60 px-4 py-2.5 text-sm text-red-400">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {loading ? t.forgot_password.submitting : t.forgot_password.button}
                  </button>
                </form>
              )}

              <button
                onClick={() => { setMode('login'); setError(''); setResetSent(false) }}
                className="mt-5 text-sm text-zinc-500 hover:text-zinc-200 transition"
              >
                {t.forgot_password.back}
              </button>
            </>
          ) : (
            /* ── Login mode ── */
            <>
              <h1 className="text-2xl font-bold text-white">{t.auth.login_title}</h1>
              <p className="mt-2 text-sm text-zinc-400">
                {t.auth.no_account}{' '}
                <Link href="/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition">
                  {t.auth.signup_link}
                </Link>
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">{t.auth.email}</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-300">{t.auth.password}</label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError('') }}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                    >
                      {t.forgot_password.link}
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {error && (
                  <p className="rounded-xl border border-red-800/50 bg-red-950/60 px-4 py-2.5 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                >
                  {loading ? t.auth.signing_in : t.auth.login_button}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-xs text-zinc-600">{isEs ? 'o' : 'or'}</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              <DemoButton className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-60" />
            </>
          )}
        </div>
      </div>

    </div>
  )
}
