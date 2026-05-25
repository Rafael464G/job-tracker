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
import { Application, Status, STATUS_LABELS, STATUS_COLORS } from '@/types/application'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ApplicationForm from './ApplicationForm'

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

function KanbanCard({ app, onEdit }: { app: Application; onEdit: () => void }) {
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
      <p className="font-medium text-sm leading-tight">{app.company}</p>
      <p className="mt-0.5 text-xs text-zinc-500 leading-tight">{app.position}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-zinc-400">{formatDate(app.applied_at)}</span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="rounded px-1.5 py-0.5 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700"
        >
          Editar
        </button>
      </div>
    </div>
  )
}

function KanbanColumn({ status, apps, onEdit }: { status: Status; apps: Application[]; onEdit: (app: Application) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className={`mb-3 rounded-t-lg border-t-2 pt-1 ${COLUMN_COLORS[status]}`}>
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-semibold">{STATUS_LABELS[status]}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
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
          <KanbanCard key={app.id} app={app} onEdit={() => onEdit(app)} />
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function refresh() {
    startTransition(() => { router.refresh() })
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
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col}
              status={col}
              apps={grouped[col]}
              onEdit={setEditing}
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
