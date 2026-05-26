"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from './LanguageProvider'

export default function WaitlistForm() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    const supabase = createClient()
    const { error } = await supabase
      .from('waitlist')
      .insert({ email: email.trim().toLowerCase() })
    // 23505 = unique_violation (already on list) — treat as success
    if (error && error.code !== '23505') {
      setState('error')
      return
    }
    setState('done')
  }

  if (state === 'done') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 dark:border-green-800/40 dark:bg-green-950/20">
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          ✓ {t.waitlist.success}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.waitlist.placeholder}
        className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {state === 'loading' ? t.waitlist.submitting : t.waitlist.button}
      </button>
      {state === 'error' && (
        <p className="w-full text-xs text-red-500">{t.waitlist.error}</p>
      )}
    </form>
  )
}
