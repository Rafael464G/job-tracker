import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DemoButton from '@/components/DemoButton'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="font-semibold tracking-tight">Job Tracker</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
        <p className="mb-3 inline-block rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
          Free · No credit card required
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Land your dream job,{' '}
          <span className="text-indigo-600">faster.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
          Track every application, set smart follow-ups, and visualize your pipeline — all in one calm dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 dark:shadow-none"
          >
            Start tracking for free →
          </Link>
          <DemoButton className="rounded-xl border border-zinc-200 px-6 py-3 font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900" />
          <Link
            href="/login"
            className="rounded-xl border border-zinc-200 px-6 py-3 font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* App Preview */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          {/* Fake header bar */}
          <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-300" />
              <div className="h-3 w-3 rounded-full bg-amber-300" />
              <div className="h-3 w-3 rounded-full bg-green-300" />
            </div>
            <span className="text-xs font-medium text-zinc-400">job-tracker.app/dashboard</span>
            <div />
          </div>

          <div className="p-5">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Applied', count: 24, border: 'border-t-blue-400', bg: 'bg-blue-100 text-blue-700' },
                { label: 'Interview', count: 8, border: 'border-t-amber-400', bg: 'bg-amber-100 text-amber-700' },
                { label: 'Offer', count: 2, border: 'border-t-green-400', bg: 'bg-green-100 text-green-700' },
                { label: 'Rejected', count: 6, border: 'border-t-red-400', bg: 'bg-red-100 text-red-600' },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border border-t-2 border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 ${s.border}`}>
                  <p className="text-xl font-bold tabular-nums">{s.count}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${s.bg}`}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Insight + follow-up bar */}
            <div className="mt-3 flex gap-3">
              <div className="flex-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/20">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">🔔 2 applications need follow-up today</p>
              </div>
              <div className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800/40 dark:bg-indigo-950/20">
                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">🚀 Great momentum! You added 5 applications this week.</p>
              </div>
            </div>

            {/* Kanban preview */}
            <div className="mt-3 grid grid-cols-4 gap-3">
              {[
                {
                  label: 'Applied', color: 'border-t-blue-400', badge: 'bg-blue-100 text-blue-700',
                  cards: [{ c: 'Stripe', p: 'Frontend Dev', star: true }, { c: 'Vercel', p: 'Software Engineer' }, { c: 'GitHub', p: 'Engineer II' }],
                },
                {
                  label: 'Interview', color: 'border-t-amber-400', badge: 'bg-amber-100 text-amber-700',
                  cards: [{ c: 'Shopify', p: 'Full Stack Dev' }, { c: 'Airbnb', p: 'React Engineer' }],
                },
                {
                  label: 'Offer', color: 'border-t-green-400', badge: 'bg-green-100 text-green-700',
                  cards: [{ c: 'Linear', p: 'Engineer', star: true }],
                },
                {
                  label: 'Rejected', color: 'border-t-red-400', badge: 'bg-red-100 text-red-600',
                  cards: [{ c: 'Meta', p: 'Frontend' }],
                },
              ].map((col) => (
                <div key={col.label}>
                  <div className={`mb-2 rounded-t-md border-t-2 pt-1.5 ${col.color}`}>
                    <div className="flex items-center justify-between px-1 pb-1">
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{col.label}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${col.badge}`}>{col.cards.length}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {col.cards.map(({ c, p, star }) => (
                      <div
                        key={c}
                        className={`rounded-lg border p-2 ${
                          star
                            ? 'border-amber-200 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-950/20'
                            : 'border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium leading-tight">{c}</p>
                          {star && <span className="text-xs text-amber-400">★</span>}
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-400 leading-tight truncate">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-zinc-50 py-20 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-2 text-center text-2xl font-bold">Everything you need. Nothing you don&apos;t.</h2>
          <p className="mb-12 text-center text-zinc-500 dark:text-zinc-400">Built for real job hunters, not enterprise HR teams.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: '📋',
                title: 'Track Everything',
                desc: 'Company, position, salary, notes, links, and status — all in one place.',
              },
              {
                icon: '📊',
                title: 'Visual Pipeline',
                desc: 'Kanban board, conversion rates, activity charts. See your search at a glance.',
              },
              {
                icon: '🔔',
                title: 'Smart Reminders',
                desc: 'Set follow-up dates. Get nudged before an opportunity goes cold.',
              },
              {
                icon: '⭐',
                title: 'Priority Jobs',
                desc: 'Star your dream roles. They float to the top and stand out in gold.',
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extra features list */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            '🌐 English & Spanish',
            '🌙 Dark mode',
            '📅 Calendar view',
            '💡 Smart insights',
            '↓ CSV & JSON export',
            '🔒 Private & secure',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 rounded-xl border border-zinc-100 px-4 py-3 text-sm dark:border-zinc-800">
              {f}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-20 text-center text-white">
        <h2 className="text-2xl font-bold">Start tracking smarter today.</h2>
        <p className="mt-2 text-indigo-200">Free forever. No credit card.</p>
        <Link
          href="/signup"
          className="mt-6 inline-block rounded-xl bg-white px-8 py-3 font-semibold text-indigo-600 hover:bg-indigo-50"
        >
          Create your free account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
        Job Tracker · 2025 · Built for job seekers
      </footer>
    </div>
  )
}
