"use client"

import { Application, Status, STATUS_COLORS, STATUS_BG } from '@/types/application'
import { useLanguage } from './LanguageProvider'

const STATUSES: Status[] = ['applied', 'interview', 'offer', 'rejected']

const STAT_ICONS: Record<Status, string> = {
  applied: '📤',
  interview: '💬',
  offer: '🎉',
  rejected: '✕',
}

const STAT_BORDER: Record<Status, string> = {
  applied: 'border-t-blue-400',
  interview: 'border-t-amber-400',
  offer: 'border-t-green-400',
  rejected: 'border-t-red-400',
}

export default function StatsBar({ applications }: { applications: Application[] }) {
  const { t } = useLanguage()
  const counts = STATUSES.reduce<Record<Status, number>>(
    (acc, s) => ({ ...acc, [s]: applications.filter((a) => a.status === s).length }),
    { applied: 0, interview: 0, rejected: 0, offer: 0 }
  )

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATUSES.map((status) => (
        <div
          key={status}
          className={`rounded-xl border border-zinc-200 border-t-2 bg-white p-4 dark:border-zinc-800 dark:border-t-2 dark:bg-zinc-900 ${STAT_BORDER[status]}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold tabular-nums">{counts[status]}</p>
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${STATUS_BG[status]}`}>
              {STAT_ICONS[status]}
            </span>
          </div>
          <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
            {t.status[status]}
          </span>
        </div>
      ))}
    </div>
  )
}
