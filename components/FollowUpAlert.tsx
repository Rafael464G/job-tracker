"use client"

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Application, STATUS_LABELS, STATUS_COLORS } from '@/types/application'

function today() {
  return new Date().toISOString().split('T')[0]
}

function parseLocal(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(dateStr: string) {
  return parseLocal(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

export default function FollowUpAlert({ applications, onEdit }: {
  applications: Application[]
  onEdit: (app: Application) => void
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const todayStr = today()

  const { overdue, dueToday, upcoming } = useMemo(() => {
    const pending = applications.filter(
      (a) => a.follow_up_at && !dismissed.has(a.id) && a.status !== 'rejected' && a.status !== 'offer'
    )
    return {
      overdue: pending.filter((a) => a.follow_up_at! < todayStr),
      dueToday: pending.filter((a) => a.follow_up_at === todayStr),
      upcoming: pending.filter((a) => a.follow_up_at! > todayStr).slice(0, 3),
    }
  }, [applications, dismissed, todayStr])

  const urgent = [...overdue, ...dueToday]

  if (urgent.length === 0 && upcoming.length === 0) return null

  function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]))
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        {urgent.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-base">🔔</span>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {urgent.length === 1
                  ? '1 postulación requiere seguimiento'
                  : `${urgent.length} postulaciones requieren seguimiento`}
              </p>
            </div>
            <div className="space-y-2">
              {urgent.map((app) => {
                const isOverdue = app.follow_up_at! < todayStr
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white/70 px-3 py-2 dark:bg-zinc-900/50"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`text-xs font-bold ${isOverdue ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>
                        {isOverdue ? `Vencido ${formatDate(app.follow_up_at!)}` : 'Hoy'}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-600">·</span>
                      <p className="truncate text-sm font-medium">{app.company}</p>
                      <span className={`hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline ${STATUS_COLORS[app.status]}`}>
                        {STATUS_LABELS[app.status]}
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => onEdit(app)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40"
                      >
                        Actualizar
                      </button>
                      <button
                        onClick={() => dismiss(app.id)}
                        aria-label="Descartar"
                        className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {upcoming.length > 0 && urgent.length === 0 && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <span className="text-sm">📅</span>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Próximo seguimiento:{' '}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {upcoming[0].company}
                </span>{' '}
                el {formatDate(upcoming[0].follow_up_at!)}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
