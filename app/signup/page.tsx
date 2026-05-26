"use client"

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/LanguageProvider'
import DemoButton from '@/components/DemoButton'

const BULLETS_EN = [
  { icon: '⭐', text: 'Star your dream roles so they stand out' },
  { icon: '📅', text: 'Calendar view to manage follow-up dates' },
  { icon: '💡', text: 'Insights that tell you when to act' },
]
const BULLETS_ES = [
  { icon: '⭐', text: 'Marca tus empleos soñados para destacarlos' },
  { icon: '📅', text: 'Vista de calendario para gestionar seguimientos' },
  { icon: '💡', text: 'Sugerencias que te dicen cuándo actuar' },
]

export default function SignupPage() {
  const { t, locale } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const bullets = locale === 'es' ? BULLETS_ES : BULLETS_EN

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
      <div className="flex min-h-full flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 text-5xl">📬</div>
          <h2 className="mb-2 text-xl font-bold">{locale === 'es' ? 'Revisa tu email' : 'Check your email'}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t.auth.check_email.replace('su', 'tu')}{' '}
            <strong className="text-zinc-900 dark:text-zinc-100">{email}</strong>
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← {t.auth.login_link}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex lg:w-[420px] lg:shrink-0 flex-col justify-between bg-indigo-600 p-12 text-white">
        <Link href="/" className="text-sm font-medium text-indigo-200 hover:text-white transition">
          ← Job Tracker
        </Link>

        <div>
          <h2 className="text-3xl font-bold leading-snug">
            {locale === 'es' ? '¿Listo para organizar\ntu búsqueda?' : 'Ready to organize\nyour job search?'}
          </h2>
          <ul className="mt-8 space-y-4">
            {bullets.map((b) => (
              <li key={b.icon} className="flex items-start gap-3 text-indigo-100">
                <span className="mt-0.5 text-xl leading-none">{b.icon}</span>
                <span className="text-sm leading-relaxed">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-indigo-300">
          {locale === 'es' ? 'Gratis para siempre · Sin tarjeta de crédito' : 'Free forever · No credit card required'}
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile back link */}
        <Link href="/" className="mb-8 self-start text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 lg:hidden">
          ← {locale === 'es' ? 'Inicio' : 'Home'}
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{t.auth.signup_title}</h1>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              {t.auth.have_account}{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                {t.auth.login_link}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.auth.email}</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="field"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.auth.password}</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
              />
              <p className="mt-1 text-xs text-zinc-400">
                {locale === 'es' ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}
              </p>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? t.auth.signing_up : t.auth.signup_button}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs text-zinc-400">{locale === 'es' ? 'o prueba primero' : 'or try first'}</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <DemoButton className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}
