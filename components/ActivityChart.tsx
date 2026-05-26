"use client"

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Application } from '@/types/application'
import { useLanguage } from './LanguageProvider'

function getWeekLabel(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const week = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
  return `S${week}`
}

function getMonthLabel(dateStr: string, locale: string) {
  const [y, m] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: 'short', year: '2-digit' })
}

export default function ActivityChart({ applications }: { applications: Application[] }) {
  const { t, locale } = useLanguage()
  const data = useMemo(() => {
    if (applications.length === 0) return []

    const sorted = [...applications].sort((a, b) => a.applied_at.localeCompare(b.applied_at))
    const oldest = sorted[0].applied_at
    const newest = sorted[sorted.length - 1].applied_at

    const diffDays = (new Date(newest).getTime() - new Date(oldest).getTime()) / 86400000
    const useMonths = diffDays > 60

    const counts: Record<string, number> = {}
    for (const app of applications) {
      const key = useMonths ? getMonthLabel(app.applied_at, locale) : getWeekLabel(app.applied_at)
      counts[key] = (counts[key] ?? 0) + 1
    }

    return Object.entries(counts).map(([label, count]) => ({ label, count }))
  }, [applications, locale])

  if (data.length < 2) return null

  const max = Math.max(...data.map((d) => d.count))

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t.dashboard.activity_title}
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            axisLine={false}
            tickLine={false}
            className="text-zinc-400"
          />
          <YAxis hide allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #e4e4e7',
              background: '#ffffff',
              color: '#18181b',
            }}
            formatter={(value) => [value, t.dashboard.activity_tooltip]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.count === max ? '#4f46e5' : '#c7d2fe'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
