import { Application, Status, STATUS_LABELS, STATUS_COLORS } from '@/types/application'

const STATUSES: Status[] = ['applied', 'interview', 'offer', 'rejected']

export default function StatsBar({ applications }: { applications: Application[] }) {
  const counts = STATUSES.reduce<Record<Status, number>>(
    (acc, s) => ({ ...acc, [s]: applications.filter((a) => a.status === s).length }),
    { applied: 0, interview: 0, rejected: 0, offer: 0 }
  )

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATUSES.map((status) => (
        <div
          key={status}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-2xl font-bold">{counts[status]}</p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>
      ))}
    </div>
  )
}
