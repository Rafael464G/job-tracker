"use client"

import { useState } from 'react'
import { useLanguage } from './LanguageProvider'
import { LTD_PRICE_UYU } from '@/lib/config'

interface Props {
  spotsLeft: number
  isFounder: boolean
}

export default function BuyFounderButton({ spotsLeft, isFounder }: Props) {
  const { locale } = useLanguage()
  const isEs = locale === 'es'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const price = LTD_PRICE_UYU.toLocaleString(isEs ? 'es-UY' : 'en-US')

  if (isFounder) {
    return (
      <div className="rounded-xl border border-indigo-800/50 bg-indigo-950/30 px-6 py-3 text-center text-sm font-semibold text-indigo-300">
        {isEs ? '✓ Eres Fundador' : '✓ You\'re a Founder'}
      </div>
    )
  }

  if (spotsLeft <= 0) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-zinc-500">
        {isEs ? 'Cupos agotados' : 'Sold out'}
      </div>
    )
  }

  async function handleClick() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      window.location.href = data.checkout_url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading
          ? (isEs ? 'Redirigiendo…' : 'Redirecting…')
          : (isEs ? `Acceso de por vida — UYU ${price}` : `Lifetime access — UYU ${price}`)}
      </button>
      {spotsLeft <= 20 && (
        <p className="text-center text-xs text-amber-400">
          {isEs ? `Solo ${spotsLeft} cupos restantes` : `Only ${spotsLeft} spots left`}
        </p>
      )}
      {error && (
        <p className="text-center text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
