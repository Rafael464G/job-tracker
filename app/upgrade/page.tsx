import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BuyFounderButton from '@/components/BuyFounderButton'
import { FOUNDER_CAP, LTD_PRICE_UYU } from '@/lib/config'
import { getFounderSpotsLeft, getIsActiveFounder } from '@/lib/entitlements'

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [spotsLeft, isFounder] = await Promise.all([
    getFounderSpotsLeft(supabase),
    getIsActiveFounder(supabase, user.id),
  ])

  const { payment } = await searchParams

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/dashboard" className="mb-10 block text-sm text-zinc-500 hover:text-zinc-300 transition">
          ← Dashboard
        </Link>

        {payment === 'pending' && (
          <div className="mb-6 rounded-xl border border-amber-800/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-400">
            ⏳ Pago pendiente — activamos tu cuenta cuando se confirme.
          </div>
        )}
        {payment === 'failure' && (
          <div className="mb-6 rounded-xl border border-red-800/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            ✗ El pago falló. Intentá de nuevo abajo.
          </div>
        )}
        {payment === 'success' && !isFounder && (
          <div className="mb-6 rounded-xl border border-green-800/40 bg-green-950/30 px-4 py-3 text-sm text-green-400">
            ✓ Pago recibido — confirmando tu acceso…
          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Founder&apos;s Deal
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">
            UYU {LTD_PRICE_UYU.toLocaleString('es-UY')}
            <span className="ml-2 text-base font-normal text-zinc-500">pago único</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Acceso de por vida · Primeros {FOUNDER_CAP} fundadores
          </p>

          <ul className="mt-6 space-y-2 text-sm text-zinc-300">
            {[
              '✓ Todo el tracker gratuito',
              '✓ Calculadora USD → UYU / salarios',
              '✓ Extensión de Chrome (próximamente)',
              '✓ Todas las funciones futuras',
            ].map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          <div className="mt-8">
            <BuyFounderButton spotsLeft={spotsLeft} isFounder={isFounder} />
          </div>

          <p className="mt-4 text-center text-xs text-zinc-600">
            {spotsLeft} de {FOUNDER_CAP} cupos disponibles
          </p>
        </div>
      </div>
    </div>
  )
}
