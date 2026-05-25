"use client"

import { useState } from 'react'
import { Application } from '@/types/application'
import StatsBar from './StatsBar'
import ActivityChart from './ActivityChart'
import ApplicationList from './ApplicationList'
import KanbanBoard from './KanbanBoard'

export default function DashboardContent({ applications }: { applications: Application[] }) {
  const [view, setView] = useState<'list' | 'kanban'>('list')

  return (
    <div className="space-y-6">
      <StatsBar applications={applications} />
      <ActivityChart applications={applications} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          {applications.length} {applications.length !== 1 ? 'postulaciones' : 'postulación'}
        </p>
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 text-xs font-medium transition ${
              view === 'list'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`px-3 py-1.5 text-xs font-medium transition ${
              view === 'kanban'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Kanban
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <ApplicationList applications={applications} />
      ) : (
        <KanbanBoard applications={applications} />
      )}
    </div>
  )
}
