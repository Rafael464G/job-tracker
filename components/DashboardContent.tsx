"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Application } from '@/types/application'
import { useLanguage } from './LanguageProvider'
import StatsBar from './StatsBar'
import ConversionFunnel from './ConversionFunnel'
import InsightsPanel from './InsightsPanel'
import ActivityChart from './ActivityChart'
import CalendarView from './CalendarView'
import ApplicationList from './ApplicationList'
import KanbanBoard from './KanbanBoard'
import FollowUpAlert from './FollowUpAlert'
import ApplicationForm from './ApplicationForm'
import DemoBanner from './DemoBanner'

export default function DashboardContent({ applications, isAnonymous }: { applications: Application[]; isAnonymous?: boolean }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [view, setView] = useState<'list' | 'kanban' | 'calendar'>('list')
  const [alertEditing, setAlertEditing] = useState<Application | null | undefined>(undefined)

  return (
    <div className="space-y-6">
      {isAnonymous && <DemoBanner />}

      {alertEditing !== undefined && (
        <ApplicationForm
          application={alertEditing}
          onClose={() => { setAlertEditing(undefined); router.refresh() }}
        />
      )}

      <StatsBar applications={applications} />
      <ConversionFunnel applications={applications} />
      <InsightsPanel applications={applications} />
      <FollowUpAlert applications={applications} onEdit={setAlertEditing} />
      <ActivityChart applications={applications} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          {t.dashboard.count(applications.length)}
        </p>
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          {(['list', 'kanban', 'calendar'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium transition ${
                view === v
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {t.dashboard[v]}
            </button>
          ))}
        </div>
      </div>

      {view === 'list' && <ApplicationList applications={applications} />}
      {view === 'kanban' && <KanbanBoard applications={applications} />}
      {view === 'calendar' && <CalendarView applications={applications} />}
    </div>
  )
}
