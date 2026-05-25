"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Application, Status, STATUS_LABELS } from '@/types/application'
import { applicationSchema } from '@/lib/validations'
import { useToast } from './Toast'
import { useLanguage } from './LanguageProvider'

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
  salary: '',
  url: '',
  notes: '',
  follow_up_at: '',
}

export default function ApplicationForm({ application, onClose }: Props) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (application) {
      setForm({
        company: application.company,
        position: application.position,
        applied_at: application.applied_at,
        status: application.status,
        salary: application.salary ?? '',
        url: application.url ?? '',
        notes: application.notes ?? '',
        follow_up_at: application.follow_up_at ?? '',
      })
    } else {
      setForm(empty)
    }
    setErrors({})
  }, [application])

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const result = applicationSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const key = issue.path[0]
        if (key) fieldErrors[key as string] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast(t.form.session_expired, 'error')
      setLoading(false)
      return
    }

    const payload = {
      company: form.company.trim(),
      position: form.position.trim(),
      applied_at: form.applied_at,
      status: form.status,
      salary: form.salary.trim() || null,
      url: form.url.trim() || null,
      notes: form.notes.trim() || null,
      follow_up_at: form.follow_up_at || null,
    }

    const { error } = application
      ? await supabase.from('applications').update(payload).eq('id', application.id)
      : await supabase.from('applications').insert({ ...payload, user_id: user.id })

    setLoading(false)
    if (error) {
      toast(error.message, 'error')
      return
    }

    toast(application ? t.toast.updated : t.toast.added)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18 }}
          className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-zinc-900"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h2 className="font-semibold">
              {application ? t.form.title_edit : t.form.title_new}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t.form.company}</label>
                <input
                  aria-required="true"
                  aria-invalid={!!errors.company}
                  value={form.company}
                  onChange={(e) => set('company', e.target.value)}
                  placeholder={t.form.company_placeholder}
                  className="field"
                />
                {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t.form.position}</label>
                <input
                  aria-required="true"
                  aria-invalid={!!errors.position}
                  value={form.position}
                  onChange={(e) => set('position', e.target.value)}
                  placeholder={t.form.position_placeholder}
                  className="field"
                />
                {errors.position && <p className="mt-1 text-xs text-red-500">{errors.position}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t.form.date}</label>
                <input
                  type="date"
                  aria-required="true"
                  value={form.applied_at}
                  onChange={(e) => set('applied_at', e.target.value)}
                  className="field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t.form.status}</label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as Status)}
                  className="field"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{t.status[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t.form.salary} <span className="text-zinc-400">{t.form.salary_optional}</span>
              </label>
              <input
                type="text"
                value={form.salary}
                onChange={(e) => set('salary', e.target.value)}
                placeholder={t.form.salary_placeholder}
                className="field"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t.form.url} <span className="text-zinc-400">{t.form.url_optional}</span>
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => set('url', e.target.value)}
                placeholder={t.form.url_placeholder}
                className="field"
              />
              {errors.url && <p className="mt-1 text-xs text-red-500">{errors.url}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t.form.notes} <span className="text-zinc-400">{t.form.notes_optional}</span>
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder={t.form.notes_placeholder}
                className="field resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t.form.follow_up} <span className="text-zinc-400">{t.form.follow_up_optional}</span>
              </label>
              <input
                type="date"
                value={form.follow_up_at}
                onChange={(e) => set('follow_up_at', e.target.value)}
                className="field"
              />
              <p className="mt-1 text-xs text-zinc-400">{t.form.follow_up_hint}</p>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {t.form.cancel}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? t.form.saving : application ? t.form.save : t.form.add}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
