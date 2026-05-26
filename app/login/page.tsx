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
  { icon: '🔔', text: 'Recordatorios inteligentes para no perder ninguna oportunidad' },
]

export default function LoginPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const bullets = locale === 'es' ? BULLETS_ES : BULLETS_EN

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.refresh()
    router.push('/dashboard')
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
            {locale === 'es' ? 'Consigue el trabajo de tus sueños,' : 'Land your dream job,'}<br />
            {locale === 'es' ? 'más rápido.' : 'faster.'}
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
            <h1 className="text-2xl font-bold tracking-tight">{t.auth.login_title}</h1>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              {t.auth.no_account}{' '}
              <Link href="/signup" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                {t.auth.signup_link}
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
              />
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
              {loading ? t.auth.signing_in : t.auth.login_button}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs text-zinc-400">{locale === 'es' ? 'o' : 'or'}</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <DemoButton className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}
