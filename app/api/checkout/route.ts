import { NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'
import { LTD_PRICE_UYU } from '@/lib/config'
import { getFounderSpotsLeft } from '@/lib/entitlements'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || (user as { is_anonymous?: boolean }).is_anonymous) {
    return NextResponse.json({ error: 'Must be signed in to purchase' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    console.error('[checkout] NEXT_PUBLIC_APP_URL is not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  // MP rejects auto_return when back_urls.success is not publicly reachable.
  // For local dev, set NEXT_PUBLIC_APP_URL to your tunnel URL (ngrok/cloudflared).
  const isLocalhost = appUrl.includes('localhost')
  if (isLocalhost) {
    console.warn('[checkout] NEXT_PUBLIC_APP_URL points to localhost — MP will reject auto_return. Use a tunnel URL.')
  }

  const spotsLeft = await getFounderSpotsLeft(supabase)
  if (spotsLeft <= 0) {
    return NextResponse.json({ error: 'Sold out' }, { status: 410 })
  }

  try {
    const preference = new Preference(mp)
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'job-tracker-ltd',
            title: 'Job Tracker — Founder Lifetime Deal',
            quantity: 1,
            unit_price: LTD_PRICE_UYU,
            currency_id: 'UYU',
          },
        ],
        external_reference: user.id,
        notification_url: `${appUrl}/api/webhook/mercadopago`,
        back_urls: {
          success: `${appUrl}/upgrade?payment=success`,
          failure: `${appUrl}/upgrade?payment=failure`,
          pending: `${appUrl}/upgrade?payment=pending`,
        },
        ...(!isLocalhost && { auto_return: 'approved' }),
      },
    })

    const isSandbox = process.env.MERCADOPAGO_SANDBOX === 'true'
    const checkoutUrl = isSandbox ? result.sandbox_init_point : result.init_point

    return NextResponse.json({ checkout_url: checkoutUrl })
  } catch (err) {
    console.error('[checkout] MP preference error:', err)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 502 })
  }
}
