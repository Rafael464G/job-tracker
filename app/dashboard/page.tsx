import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'
import StatsBar from '@/components/StatsBar'
import ApplicationList from '@/components/ApplicationList'
import { Application } from '@/types/application'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: applications, error } = await supabase
    .from('applications')
    .select('*')
    .order('applied_at', { ascending: false })

  if (error) {
    console.error(error)
  }

  const apps: Application[] = applications ?? []

  return (
    <div className="min-h-full">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="font-semibold tracking-tight">Job Tracker</h1>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-400 sm:block">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <StatsBar applications={apps} />
        <ApplicationList applications={apps} />
      </main>
    </div>
  )
}
