import { SupabaseClient } from '@supabase/supabase-js'
import { FOUNDER_CAP } from './config'

// Counts ALL sold founder spots regardless of status.
// A refunded spot stays consumed — prevents the refund-and-rebuy exploit.
export async function getFounderSpotsLeft(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from('entitlements')
    .select('*', { count: 'exact', head: true })
    .eq('plan_type', 'lifetime_founder')
  return FOUNDER_CAP - (count ?? 0)
}

// Separate query for access gating — only active entitlements grant access.
export async function getIsActiveFounder(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_type', 'lifetime_founder')
    .eq('status', 'active')
    .maybeSingle()
  return !!data
}
