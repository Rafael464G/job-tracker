"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Application, Status, STATUS_LABELS } from '@/types/application'

const STATUSES: Status[] = ['applied', 'interview', 'rejected', 'offer']

interface Props {
  application?: Application | null
  onClose: () => void
}

const empty = {
  company: '',
  position: '',
  applied_at: new Date().toISOString().split('T')[0],
  status: 'applied' as Status,
  url: '',
  notes: '',
}

export default function ApplicationForm({ application, onClose }: Props) {
  const router = useRouter()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (application) {
      setForm({
        company: application.company,
        position: application.position,
        applied_at: application.applied_at,
        status: application.status,
        url: application.url ?? '',
        notes: application.notes ?? '',
      })
    } else {
      setForm(empty)
    }
  }, [application])

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const payload = {
      company: form.company.trim(),
      position: form.position.trim(),
      applied_at: form.applied_at,
      status: form.status,
      url: form.url.trim() || null,
      notes: form.notes.trim() || null,
    }

    const { error } = application
      ? await supabase.from('applications').update(payload).eq('id', application.id)
      : await supabase.from('applications').insert(payload)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="font-semibold">
            {application ? 'Editar postulación' : 'Nueva postulación'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Empresa</label>
              <input
                required
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="Ej. Stripe"
                className="field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Puesto</label>
              <input
                required
                value={form.position}
                onChange={(e) => set('position', e.target.value)}
                placeholder="Ej. Frontend Developer"
                className="field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Fecha</label>
              <input
                type="date"
                required
                value={form.applied_at}
                onChange={(e) => set('applied_at', e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Estado</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as Status)}
                className="field"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Enlace a la oferta <span className="text-zinc-400">(opcional)</span>
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => set('url', e.target.value)}
              placeholder="https://..."
              className="field"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Notas <span className="text-zinc-400">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Contacto, siguiente paso, impresiones..."
              className="field resize-none"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Guardando…' : application ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
