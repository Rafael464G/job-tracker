"use client"

import { useState, useTransition } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Application, Status, STATUS_COLORS, STATUS_BG } from '@/types/application'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ApplicationForm from './ApplicationForm'
import { useLanguage } from './LanguageProvider'

const COLUMNS: Status[] = ['applied', 'interview', 'offer', 'rejected']

const COLUMN_COLORS: Record<Status, string> = {
  applied: 'border-t-blue-400',
  interview: 'border-t-amber-400',
  offer: 'border-t-green-400',
  rejected: 'border-t-red-400',
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function KanbanColumnTitle({ status }: { status: Status }) {
  const { t } = useLanguage()
  return <span className="text-sm font-semibold">{t.status[status]}</span>
}

function KanbanCardButtons({ onEdit, onDelete, deleting }: {
  onEdit: () => void; onDelete: () => void; deleting: boolean
}) {
  const { t } = useLanguage()
  return (
    <>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onEdit() }}
        className="rounded px-1.5 py-0.5 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700"
      >
        {t.kanban.edit}
      </button>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        disabled={deleting}
        className="rounded px-1.5 py-0.5 text-xs text-red-400 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950/30"
      >
        {deleting ? '…' : t.kanban.delete}
      </button>
    </>
  )
}

function KanbanCard({ app, onEdit, onDelete, deleting }: {
  app: Application
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app.id })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`cursor-grab rounded-lg border border-zinc-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-800 ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${STATUS_BG[app.status]}`}>
          {app.company.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="font-medium text-sm leading-tight truncate">{app.company}</p>
          <p className="mt-0.5 text-xs text-zinc-500 leading-tight truncate">{app.position}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-zinc-400">{formatDate(app.applied_at)}</span>
        <div className="flex gap-1">
          <KanbanCardButtons onEdit={onEdit} onDelete={onDelete} deleting={deleting} />
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ status, apps, onEdit, onDelete, deletingId }: {
  status: Status
  apps: Application[]
  onEdit: (app: Application) => void
  onDelete: (id: string) => void
  deletingId: string | null
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex min-w-[260px] flex-1 flex-col sm:min-w-0">
      <div className={`mb-3 rounded-t-lg border-t-2 pt-2 ${COLUMN_COLORS[status]}`}>
        <div className="flex items-center justify-between px-1 pb-1">
          <KanbanColumnTitle status={status} />
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[status]}`}>
            {apps.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 rounded-xl p-2 transition-colors min-h-[200px] ${
          isOver ? 'bg-indigo-50 dark:bg-indigo-950/30' : 'bg-zinc-50 dark:bg-zinc-800/40'
        }`}
      >
        {apps.map((app) => (
          <KanbanCard
            key={app.id}
            app={app}
            onEdit={() => onEdit(app)}
            onDelete={() => onDelete(app.id)}
            deleting={deletingId === app.id}
          />
        ))}
      </div>
    </div>
  )
}

export default function KanbanBoard({ applications }: { applications: Application[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [apps, setApps] = useState(applications)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Application | null | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function refresh() {
    startTransition(() => { router.refresh() })
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta postulación?')) return
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('applications').delete().eq('id', id)
    setApps((prev) => prev.filter((a) => a.id !== id))
    setDeletingId(null)
    refresh()
  }

  function handleDragStart(e: DragStartEvent) {
    setDraggingId(e.active.id as string)
  }

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setDraggingId(null)
    if (!over) return

    const newStatus = over.id as Status
    const app = apps.find((a) => a.id === active.id)
    if (!app || app.status === newStatus) return

    setApps((prev) => prev.map((a) => a.id === active.id ? { ...a, status: newStatus } : a))

    const supabase = createClient()
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', active.id)

    if (error) {
      setApps(apps)
    } else {
      refresh()
    }
  }

  const draggingApp = draggingId ? apps.find((a) => a.id === draggingId) : null

  const grouped = COLUMNS.reduce<Record<Status, Application[]>>((acc, col) => {
    acc[col] = apps.filter((a) => a.status === col)
    return acc
  }, {} as Record<Status, Application[]>)

  return (
    <>
      {editing !== undefined && (
        <ApplicationForm
          application={editing}
          onClose={() => {
            setEditing(undefined)
            refresh()
          }}
        />
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col}
              status={col}
              apps={grouped[col]}
              onEdit={setEditing}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          ))}
        </div>

        <DragOverlay>
          {draggingApp && (
            <div className="cursor-grabbing rounded-lg border border-indigo-300 bg-white p-3 shadow-lg dark:border-indigo-700 dark:bg-zinc-800">
              <p className="font-medium text-sm">{draggingApp.company}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{draggingApp.position}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  )
}
