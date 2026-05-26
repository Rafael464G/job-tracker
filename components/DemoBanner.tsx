"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from './LanguageProvider'
import ConvertAccountModal from './ConvertAccountModal'

const DEMO_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours
const WARN_THRESHOLD_MS = 2 * 60 * 60 * 1000  // show warning when < 2h left

function formatRemaining(ms: number): string {
  if (ms <= 0) return '0m'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function DemoBanner() {
  const { t } = useLanguage()
  const [showModal, setShowModal] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    function compute() {
      try {
        const raw = localStorage.getItem('demo_started_at')
        if (!raw) { setRemaining(null); return }
        const elapsed = Date.now() - parseInt(raw, 10)
        setRemaining(Math.max(0, DEMO_DURATION_MS - elapsed))
      } catch {
        setRemaining(null)
      }
    }
    compute()
    const id = setInterval(compute, 60_000)
    return () => clearInterval(id)
  }, [])

  const isExpired = remaining !== null && remaining === 0
  const isWarn = remaining !== null && remaining > 0 && remaining <= WARN_THRESHOLD_MS

  const urgent = isExpired || isWarn

  return (
    <>
      {showModal && <ConvertAccountModal onClose={() => setShowModal(false)} />}

      <div className={`rounded-xl border px-4 py-3 ${
        urgent
          ? 'border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20'
          : 'border-indigo-200 bg-indigo-50 dark:border-indigo-800/40 dark:bg-indigo-950/20'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: status text */}
          <div className="flex flex-col gap-0.5">
            <p className={`text-sm font-medium ${
              urgent
                ? 'text-amber-800 dark:text-amber-200'
                : 'text-indigo-800 dark:text-indigo-200'
            }`}>
              {isExpired
                ? t.demo_timer.expired
                : isWarn
                  ? t.demo_timer.expires_soon
                  : `👋 ${t.demo.banner}`}
              {remaining !== null && !isExpired && (
                <span className="ml-2 font-normal opacity-75">
                  · {t.demo_timer.expires_in(formatRemaining(remaining))}
                </span>
              )}
            </p>
            {!urgent && (
              <p className="text-xs text-indigo-600/70 dark:text-indigo-300/70">
                {t.demo.banner_cta}
              </p>
            )}
            {urgent && (
              <p className="text-xs text-amber-700/80 dark:text-amber-300/70">
                {t.demo.banner_cta}{' '}
                <Link href="/signup" className="underline underline-offset-2 hover:opacity-80">
                  {t.auth.signup_link}
                </Link>
              </p>
            )}
          </div>

          {/* Right: CTA button */}
          <button
            onClick={() => setShowModal(true)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition ${
              urgent
                ? 'bg-amber-500 hover:bg-amber-400'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {t.convert.banner_button}
          </button>
        </div>
      </div>
    </>
  )
}
