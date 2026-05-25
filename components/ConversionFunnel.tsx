"use client"

import { useMemo } from 'react'
import { Application } from '@/types/application'
import { useLanguage } from './LanguageProvider'

export default function ConversionFunnel({ applications }: { applications: Application[] }) {
  const { t } = useLanguage()

  const stats = useMemo(() => {
    const total = applications.length
    const interviews = applications.filter((a) => a.status === 'interview' || a.status === 'offer').length
    const offers = applications.filter((a) => a.status === 'offer').length
    const rejected = applications.filter((a) => a.status === 'rejected').length

    return {
      total,
      interviewRate: total > 0 ? Math.round((interviews / total) * 100) : 0,
      offerRate: total > 0 ? Math.round((offers / total) * 100) : 0,
      rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
      interviewCount: interviews,
      offerCount: offers,
      rejectedCount: rejected,
    }
  }, [applications])

  if (applications.length < 3) return null

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.funnel.title}</p>
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label={t.funnel.interview_rate}
          value={stats.interviewRate}
          sub={`${stats.interviewCount} / ${stats.total}`}
          barColor="bg-amber-400"
          textColor="text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          label={t.funnel.offer_rate}
          value={stats.offerRate}
          sub={`${stats.offerCount} / ${stats.total}`}
          barColor="bg-green-400"
          textColor="text-green-600 dark:text-green-400"
        />
        <MetricCard
          label={t.funnel.rejection_rate}
          value={stats.rejectionRate}
          sub={`${stats.rejectedCount} / ${stats.total}`}
          barColor="bg-red-400"
          textColor="text-red-500 dark:text-red-400"
        />
      </div>
    </div>
  )
}

function MetricCard({
  label, value, sub, barColor, textColor,
}: {
  label: string
  value: number
  sub: string
  barColor: string
  textColor: string
}) {
  return (
    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
      <p className={`text-2xl font-bold tabular-nums ${textColor}`}>{value}%</p>
      <p className="mt-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
      <p className="mt-0.5 text-xs text-zinc-400">{sub}</p>
      <div className="mt-2 h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-1 rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}
