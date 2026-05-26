"use client"

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/LanguageProvider'
import DemoButton from '@/components/DemoButton'

const BULLETS_EN = [
  { icon: '⭐', text: 'Star your dream roles so they always stand out' },
  { icon: '📅', text: 'Calendar view to manage all your follow-up dates' },
  { icon: '💡', text: 'Insights that tell you exactly when to act' },
]
const BULLETS_ES = [
  { icon: '⭐', text: 'Marca tus empleos soñados para destacarlos siempre' },
  { icon: '📅', text: 'Vista de calendario para gestionar todos tus seguimientos' },
  { icon: '💡', text: 'Sugerencias que te dicen exactamente cuándo actuar' },
]

export default function SignupPage() {
  const { t, locale } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const bullets = locale === 'es' ? BULLETS_ES : BULLETS_EN
  const isEs = locale === 'es'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 text-4xl">
              📬
            </div>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">
            {isEs ? 'Revisa tu email' : 'Check your email'}
          </h2>
          <p className="text-sm text-zinc-400">
            {isEs
              ? `Enviamos un enlace de confirmación a `
              : `We sent a confirmation link to `}
            <strong className="text-zinc-200">{email}</strong>
            {isEs ? '. Haz clic en él para activar tu cuenta.' : '. Click it to activate your account.'}
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300 transition"
          >
            ← {t.auth.login_link}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-indigo-600 p-14 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/40" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-700/50" />

        <Link href="/" className="relative z-10 flex items-center gap-2 text-indigo-200 hover:text-white transition text-sm font-medium">
          <span>←</span>
          <span>Job Tracker</span>
        </Link>

        <div className="relative z-10">
          <p className="mb-3 text-indigo-300 text-sm font-medium uppercase tracking-widest">
            {isEs ? 'Empieza gratis hoy' : 'Start free today'}
          </p>
          <h2 className="text-4xl font-bold leading-tight">
            {isEs ? '¿Listo para organizar\ntu búsqueda\nde empleo?' : 'Ready to organize\nyour job\nsearch?'}
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
        {/* Mobile back link */}
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

          <h1 className="text-2xl font-bold text-white">{t.auth.signup_title}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {t.auth.have_account}{' '}
            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition">
              {t.auth.login_link}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">{t.auth.password}</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="mt-1.5 text-xs text-zinc-600">
                {isEs ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}
              </p>
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
              {loading ? t.auth.signing_up : t.auth.signup_button}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-600">{isEs ? 'o prueba primero' : 'or try first'}</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <DemoButton className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-60" />
        </div>
      </div>

    </div>
  )
}
