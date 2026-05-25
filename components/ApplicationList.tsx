"use client"

import { useState } from 'react'
import { Application, Status, STATUS_LABELS, STATUS_COLORS } from '@/types/application'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ApplicationForm from './ApplicationForm'

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Postulado', value: 'applied' },
  { label: 'Entrevista', value: 'interview' },
  { label: 'Oferta', value: 'offer' },
  { label: 'Rechazado', value: 'rejected' },
]

export default function ApplicationList({ applications }: { applications: Application[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [editing, setEditing] = useState<Application | null | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const visible = filter === 'all' ? applications : applications.filter((a) => a.status === filter)

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta postulación?')) return
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('applications').delete().eq('id', id)
    router.refresh()
    setDeletingId(null)
  }

  return (
    <>
      {/* Form modal */}
      {editing !== undefined && (
        <ApplicationForm
          application={editing}
          onClose={() => setEditing(undefined)}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">
                {f.value === 'all'
                  ? applications.length
                  : applications.filter((a) => a.status === f.value).length}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setEditing(null)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nueva postulación
        </button>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="mt-8 text-center text-zinc-400">
          {filter === 'all' ? (
            <>
              <p className="text-lg">Sin postulaciones aún</p>
              <p className="mt-1 text-sm">Agrega tu primera con el botón de arriba</p>
            </>
          ) : (
            <p>Sin postulaciones en estado &ldquo;{STATUS_LABELS[filter as Status]}&rdquo;</p>
          )}
        </div>
      ) : (
        <div className="mt-2 space-y-3">
          {visible.map((app) => (
            <div
              key={app.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{app.company}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-zinc-500">{app.position}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <span>{new Date(app.applied_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  {app.url && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:underline"
                    >
                      Ver oferta ↗
                    </a>
                  )}
                </div>
                {app.notes && (
                  <p className="mt-2 text-sm text-zinc-500 line-clamp-2">{app.notes}</p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setEditing(app)}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(app.id)}
                  disabled={deletingId === app.id}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950/30"
                >
                  {deletingId === app.id ? '…' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
