"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from './LanguageProvider'

interface Props {
  onClose: () => void
}

export default function ConvertAccountModal({ onClose }: Props) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    // updateUser on an anonymous session upgrades it to a real account.
    // The user's UUID stays identical — all their applications are preserved automatically.
    const { error } = await supabase.auth.updateUser(
      { email: email.trim(), password },
      { emailRedirectTo: `${location.origin}/auth/callback` }
    )
    setLoading(false)
    if (error) { setError(error.message); return }
    try { localStorage.removeItem('demo_started_at') } catch {}
    setDone(true)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-zinc-900"
        >
          {done ? (
            <div className="px-8 py-10 text-center">
              <div className="mb-5 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-4xl dark:bg-indigo-950/40">
                  📬
                </div>
              </div>
              <h2 className="mb-2 text-xl font-bold">{t.convert.success_title}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.convert.success_body}</p>
              <button
                onClick={onClose}
                className="mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                OK
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <div>
                  <h2 className="font-semibold">{t.convert.modal_title}</h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-5">
                <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
                  {t.convert.modal_subtitle}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t.convert.email_label}</label>
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
                    <label className="mb-1.5 block text-sm font-medium">{t.convert.password_label}</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="field"
                    />
                    <p className="mt-1 text-xs text-zinc-400">{t.convert.password_hint}</p>
                  </div>

                  {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {loading ? t.convert.submitting : t.convert.submit}
                  </button>
                </form>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
