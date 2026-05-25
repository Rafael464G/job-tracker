"use client"

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Application } from '@/types/application'
import { useLanguage } from './LanguageProvider'

type InsightType = 'offer' | 'stale_applied' | 'interview_stale' | 'low_response' | 'no_followup' | 'momentum'

interface Insight {
  id: string
  type: InsightType
  priority: number
  icon: string
  message: string
  color: string
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function daysAgo(dateStr: string) {
  const diff = new Date().getTime() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}

function startOfWeek() {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  return d.toISOString().split('T')[0]
}

export default function InsightsPanel({ applications }: { applications: Application[] }) {
  const { t } = useLanguage()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const todayStr = today()

  const insights = useMemo<Insight[]>(() => {
    const all: Insight[] = []

    const offers = applications.filter((a) => a.status === 'offer')
    if (offers.length > 0) {
      all.push({
        id: 'offer',
        type: 'offer',
        priority: 1,
        icon: '🎉',
        message: t.insights.offer(offers[0].company),
        color: 'border-green-200 bg-green-50 dark:border-green-800/40 dark:bg-green-950/20',
      })
    }

    const weekAgo = startOfWeek()
    const recentCount = applications.filter((a) => a.applied_at >= weekAgo).length
    if (recentCount >= 3) {
      all.push({
        id: 'momentum',
        type: 'momentum',
        priority: 2,
        icon: '🚀',
        message: t.insights.momentum(recentCount),
        color: 'border-indigo-200 bg-indigo-50 dark:border-indigo-800/40 dark:bg-indigo-950/20',
      })
    }

    const staleApplied = applications.filter(
      (a) => a.status === 'applied' && daysAgo(a.applied_at) > 14
    )
    if (staleApplied.length > 0) {
      all.push({
        id: 'stale_applied',
        type: 'stale_applied',
        priority: 3,
        icon: '⏳',
        message: t.insights.stale_applied(staleApplied.length),
        color: 'border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20',
      })
    }

    const staleInterview = applications.filter(
      (a) => a.status === 'interview' && daysAgo(a.applied_at) > 7
    )
    if (staleInterview.length > 0) {
      all.push({
        id: 'interview_stale',
        type: 'interview_stale',
        priority: 4,
        icon: '💬',
        message: t.insights.interview_stale(staleInterview.length),
        color: 'border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20',
      })
    }

    const total = applications.length
    const interviews = applications.filter((a) => a.status === 'interview' || a.status === 'offer').length
    if (total >= 8 && interviews / total < 0.15) {
      all.push({
        id: 'low_response',
        type: 'low_response',
        priority: 5,
        icon: '📊',
        message: t.insights.low_response,
        color: 'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50',
      })
    }

    const noFollowup = applications.filter(
      (a) => (a.status === 'applied' || a.status === 'interview') && !a.follow_up_at
    )
    if (noFollowup.length >= 3) {
      all.push({
        id: 'no_followup',
        type: 'no_followup',
        priority: 6,
        icon: '🔔',
        message: t.insights.no_followup(noFollowup.length),
        color: 'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50',
      })
    }

    return all
      .filter((i) => !dismissed.has(i.id))
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3)
  }, [applications, dismissed, t, todayStr])

  if (insights.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{t.insights.title}</p>
      <AnimatePresence initial={false}>
        {insights.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 ${insight.color}`}>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 text-base">{insight.icon}</span>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{insight.message}</p>
              </div>
              <button
                onClick={() => setDismissed((prev) => new Set([...prev, insight.id]))}
                className="shrink-0 rounded p-0.5 text-xs text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label={t.insights.dismiss}
              >
                {t.insights.dismiss}
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
