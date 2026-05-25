"use client"

import { useState, useMemo } from 'react'
import { Application, STATUS_COLORS } from '@/types/application'
import { useLanguage } from './LanguageProvider'

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_HEADERS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface DayEvents {
  applied: Application[]
  followup: Application[]
}

export default function CalendarView({ applications }: { applications: Application[] }) {
  const { t } = useLanguage()
  const isEs = t.dashboard.calendar === 'Calendario'

  const [current, setCurrent] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selected, setSelected] = useState<string | null>(null)

  const { year, month } = current
  const todayStr = new Date().toISOString().split('T')[0]

  const dayMap = useMemo<Record<string, DayEvents>>(() => {
    const map: Record<string, DayEvents> = {}
    const pad = (n: number) => String(n).padStart(2, '0')
    const prefix = `${year}-${pad(month + 1)}`

    for (const app of applications) {
      if (app.applied_at.startsWith(prefix)) {
        if (!map[app.applied_at]) map[app.applied_at] = { applied: [], followup: [] }
        map[app.applied_at].applied.push(app)
      }
      if (app.follow_up_at?.startsWith(prefix)) {
        if (!map[app.follow_up_at]) map[app.follow_up_at] = { applied: [], followup: [] }
        map[app.follow_up_at].followup.push(app)
      }
    }
    return map
  }, [applications, year, month])

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function pad(n: number) { return String(n).padStart(2, '0') }

  const cells: Array<null | { day: number; dateStr: string; events: DayEvents | undefined }> = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1
      const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`
      return { day: d, dateStr, events: dayMap[dateStr] }
    }),
  ]

  function prevMonth() {
    setCurrent(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    )
    setSelected(null)
  }
  function nextMonth() {
    setCurrent(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    )
    setSelected(null)
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
    month: 'long', year: 'numeric',
  })

  const selectedEvents = selected ? dayMap[selected] : undefined
  const dayHeaders = isEs ? DAY_HEADERS_ES : DAY_HEADERS

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg px-2.5 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {t.calendar.prev}
        </button>
        <p className="text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-300">{monthLabel}</p>
        <button
          onClick={nextMonth}
          className="rounded-lg px-2.5 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {t.calendar.next}
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {dayHeaders.map((d) => (
          <div key={d} className="py-1 text-xs font-medium text-zinc-400">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) =>
          cell === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <button
              key={cell.dateStr}
              onClick={() => setSelected(selected === cell.dateStr ? null : cell.dateStr)}
              className={`relative flex flex-col items-center rounded-lg py-2 transition hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                cell.dateStr === todayStr
                  ? 'ring-2 ring-indigo-400'
                  : ''
              } ${
                selected === cell.dateStr
                  ? 'bg-indigo-50 dark:bg-indigo-950/30'
                  : ''
              }`}
            >
              <span className={`text-xs font-medium ${
                cell.dateStr === todayStr
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}>
                {cell.day}
              </span>
              {cell.events && (
                <div className="mt-0.5 flex gap-0.5">
                  {cell.events.applied.length > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  )}
                  {cell.events.followup.length > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                </div>
              )}
            </button>
          )
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex gap-4">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          {t.calendar.applied_on}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          {t.calendar.followup_on}
        </div>
      </div>

      {/* Selected day panel */}
      {selected && (
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {!selectedEvents || (selectedEvents.applied.length === 0 && selectedEvents.followup.length === 0) ? (
            <p className="text-center text-sm text-zinc-400">{t.calendar.no_events}</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.applied.map((app) => (
                <div key={`a-${app.id}`} className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950/20">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{app.company}</p>
                    <p className="truncate text-xs text-zinc-400">{app.position} · {t.calendar.applied_on}</p>
                  </div>
                  <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                    {t.status[app.status]}
                  </span>
                </div>
              ))}
              {selectedEvents.followup.map((app) => (
                <div key={`f-${app.id}`} className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950/20">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{app.company}</p>
                    <p className="truncate text-xs text-zinc-400">{app.position} · {t.calendar.followup_on}</p>
                  </div>
                  <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                    {t.status[app.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
