"use client"

import { useState, useTransition, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Application, Status, STATUS_LABELS, STATUS_COLORS, STATUS_BORDER, STATUS_BG } from '@/types/application'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ApplicationForm from './ApplicationForm'
import { useToast } from './Toast'
import { useLanguage } from './LanguageProvider'

const STATUSES: Status[] = ['applied', 'interview', 'offer', 'rejected']

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Postulado', value: 'applied' },
  { label: 'Entrevista', value: 'interview' },
  { label: 'Oferta', value: 'offer' },
  { label: 'Rechazado', value: 'rejected' },
]

const SORT_OPTIONS = [
  { label: 'Fecha (reciente)', value: 'date_desc' },
  { label: 'Fecha (antigua)', value: 'date_asc' },
  { label: 'Empresa (A-Z)', value: 'company_asc' },
  { label: 'Estado', value: 'status' },
]

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function exportJSON(applications: Application[]) {
  const data = applications.map(({ id: _id, user_id: _uid, created_at: _c, updated_at: _u, ...rest }) => rest)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `postulaciones-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function exportCSV(applications: Application[]) {
  const headers = ['Empresa', 'Puesto', 'Fecha', 'Estado', 'Enlace', 'Notas']
  const rows = applications.map((a) => [
    `"${a.company.replace(/"/g, '""')}"`,
    `"${a.position.replace(/"/g, '""')}"`,
    a.applied_at,
    STATUS_LABELS[a.status],
    a.url ?? '',
    `"${(a.notes ?? '').replace(/"/g, '""')}"`,
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `postulaciones-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ApplicationList({ applications }: { applications: Application[] }) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('date_desc')
  const [editing, setEditing] = useState<Application | null | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [statusPickerId, setStatusPickerId] = useState<string | null>(null)
  const pickerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!statusPickerId) return
    function handleOutsideClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setStatusPickerId(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [statusPickerId])

  const visible = useMemo(() => {
    let list = filter === 'all' ? applications : applications.filter((a) => a.status === filter)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) => a.company.toLowerCase().includes(q) || a.position.toLowerCase().includes(q)
      )
    }

    return [...list].sort((a, b) => {
      if (sort === 'date_desc') return b.applied_at.localeCompare(a.applied_at)
      if (sort === 'date_asc') return a.applied_at.localeCompare(b.applied_at)
      if (sort === 'company_asc') return a.company.localeCompare(b.company)
      if (sort === 'status') return a.status.localeCompare(b.status)
      return 0
    })
  }, [applications, filter, search, sort])

  function refresh() {
    startTransition(() => { router.refresh() })
  }

  async function handleDelete(id: string) {
    if (!confirm(t.list.confirm_delete)) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('applications').delete().eq('id', id)
    setDeletingId(null)
    if (error) { toast(t.toast.delete_error, 'error'); return }
    toast(t.toast.deleted)
    refresh()
  }

  async function handleStatusUpdate(id: string, newStatus: Status) {
    setStatusPickerId(null)
    const supabase = createClient()
    const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', id)
    if (error) { toast(t.toast.delete_error, 'error'); return }
    refresh()
  }

  return (
    <>
      {editing !== undefined && (
        <ApplicationForm
          application={editing}
          onClose={() => { setEditing(undefined); refresh() }}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as 'all' | Status)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              filter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {f.value === 'all' ? t.filters.all : t.status[f.value as Status]}
            <span className="ml-1.5 text-xs opacity-70">
              {f.value === 'all'
                ? applications.length
                : applications.filter((a) => a.status === f.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Sort + Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.list.search_placeholder}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{t.sort[o.value as keyof typeof t.sort]}</option>
          ))}
        </select>

        <button
          onClick={() => exportCSV(applications)}
          title="Exportar CSV"
          className="shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          {t.list.export_csv}
        </button>
        <button
          onClick={() => exportJSON(applications)}
          title="Export JSON"
          className="shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          {t.list.export_json}
        </button>

        <button
          onClick={() => setEditing(null)}
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t.list.new_button}
        </button>
      </div>

      {/* Refresh indicator */}
      {isPending && (
        <p className="text-center text-xs text-zinc-400 animate-pulse">{t.list.updating}</p>
      )}

      {search && (
        <p className="text-xs text-zinc-400">{t.list.results(visible.length, search)}</p>
      )}

      {/* Empty state */}
      {visible.length === 0 ? (
        <div className="mt-10 text-center text-zinc-400">
          {search ? (
            <p>{t.list.no_results(search)}</p>
          ) : filter === 'all' ? (
            <>
              <p className="text-lg font-medium">{t.list.empty_title}</p>
              <p className="mt-1 text-sm">{t.list.empty_subtitle}</p>
            </>
          ) : (
            <p>{t.list.empty_filter(t.status[filter as Status])}</p>
          )}
        </div>
      ) : (
        <AnimatePresence initial={false}>
        <div className="space-y-3">
          {visible.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18, delay: i * 0.03 }}
              className={`flex items-start justify-between gap-4 rounded-xl border border-l-4 border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 ${STATUS_BORDER[app.status]}`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${STATUS_BG[app.status]}`}>
                {app.company.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{app.company}</p>
                  <div className="relative" ref={statusPickerId === app.id ? pickerRef : null}>
                    <button
                      onClick={() => setStatusPickerId(statusPickerId === app.id ? null : app.id)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium transition hover:opacity-80 ${STATUS_COLORS[app.status]}`}
                      title={t.list.change_status}
                    >
                      {t.status[app.status]} ▾
                    </button>
                    {statusPickerId === app.id && (
                      <div className="absolute left-0 top-full z-20 mt-1 w-36 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusUpdate(app.id, s)}
                            disabled={s === app.status}
                            className={`w-full rounded px-2.5 py-1.5 text-left text-xs font-medium transition ${STATUS_COLORS[s]} ${s === app.status ? 'opacity-40 cursor-default' : 'hover:opacity-80'}`}
                          >
                            {t.status[s]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-0.5 text-sm text-zinc-500">{app.position}</p>
                {app.salary && (
                  <p className="mt-0.5 text-xs text-zinc-400">💰 {app.salary}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <span>{formatDate(app.applied_at)}</span>
                  {app.follow_up_at && (() => {
                    const today = new Date().toISOString().split('T')[0]
                    const isOverdue = app.follow_up_at < today
                    const isToday = app.follow_up_at === today
                    return (
                      <span className={`flex items-center gap-1 font-medium ${
                        isOverdue ? 'text-red-500' : isToday ? 'text-amber-500' : 'text-zinc-400'
                      }`}>
                        🔔 {isOverdue ? t.followup.badge_overdue : isToday ? t.followup.badge_today : t.followup.badge_upcoming(formatDate(app.follow_up_at))}
                      </span>
                    )
                  })()}
                  {app.url && (
                    <a href={app.url} target="_blank" rel="noopener noreferrer"
                      className="text-indigo-500 hover:underline">
                      Ver oferta ↗
                    </a>
                  )}
                </div>
                {app.notes && (
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{app.notes}</p>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                <button
                  onClick={() => setEditing(app)}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {t.list.edit}
                </button>
                <button
                  onClick={() => handleDelete(app.id)}
                  disabled={deletingId === app.id}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950/30"
                >
                  {deletingId === app.id ? '…' : t.list.delete}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        </AnimatePresence>
      )}
    </>
  )
}
