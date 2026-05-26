"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { seedDemoData } from '@/lib/demo-seed'
import { useLanguage } from './LanguageProvider'

export default function DemoButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  async function handleDemo() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error || !data.user) {
      setLoading(false)
      return
    }
    await seedDemoData(supabase, data.user.id)
    router.push('/dashboard')
  }

  return (
    <button
      onClick={handleDemo}
      disabled={loading}
      className={className}
    >
      {loading ? t.demo.loading : t.demo.button}
    </button>
  )
}
