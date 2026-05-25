export type Status = 'applied' | 'interview' | 'rejected' | 'offer'

export interface Application {
  id: string
  user_id: string
  company: string
  position: string
  applied_at: string
  status: Status
  url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export const STATUS_LABELS: Record<Status, string> = {
  applied: 'Postulado',
  interview: 'Entrevista',
  rejected: 'Rechazado',
  offer: 'Oferta',
}

export const STATUS_COLORS: Record<Status, string> = {
  applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  interview: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  offer: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}
