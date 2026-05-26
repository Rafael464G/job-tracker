import { SupabaseClient } from '@supabase/supabase-js'

export async function seedDemoData(supabase: SupabaseClient, userId: string) {
  const today = new Date()

  function daysAgo(n: number) {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return d.toISOString().split('T')[0]
  }

  function daysFromNow(n: number) {
    const d = new Date(today)
    d.setDate(d.getDate() + n)
    return d.toISOString().split('T')[0]
  }

  const apps = [
    {
      company: 'Stripe',
      position: 'Frontend Engineer',
      applied_at: daysAgo(3),
      status: 'interview',
      salary: '$120k – $150k',
      is_starred: true,
      follow_up_at: daysFromNow(2),
      url: null,
      notes: 'Had a great first call. Next step: technical round.',
    },
    {
      company: 'Vercel',
      position: 'Software Engineer',
      applied_at: daysAgo(7),
      status: 'applied',
      salary: '$110k – $140k',
      is_starred: false,
      follow_up_at: daysAgo(1),
      url: null,
      notes: null,
    },
    {
      company: 'Linear',
      position: 'Full Stack Developer',
      applied_at: daysAgo(14),
      status: 'offer',
      salary: '$130k',
      is_starred: true,
      follow_up_at: null,
      url: null,
      notes: 'Offer received! Evaluating compensation package.',
    },
    {
      company: 'GitHub',
      position: 'Engineer II',
      applied_at: daysAgo(10),
      status: 'applied',
      salary: null,
      is_starred: false,
      follow_up_at: null,
      url: null,
      notes: null,
    },
    {
      company: 'Shopify',
      position: 'React Developer',
      applied_at: daysAgo(21),
      status: 'rejected',
      salary: '$100k – $120k',
      is_starred: false,
      follow_up_at: null,
      url: null,
      notes: 'Rejected after take-home challenge.',
    },
    {
      company: 'Airbnb',
      position: 'Senior Frontend',
      applied_at: daysAgo(5),
      status: 'interview',
      salary: '$150k+',
      is_starred: false,
      follow_up_at: daysFromNow(1),
      url: null,
      notes: 'Behavioral interview scheduled for tomorrow.',
    },
    {
      company: 'Notion',
      position: 'Product Engineer',
      applied_at: daysAgo(2),
      status: 'applied',
      salary: '$105k – $130k',
      is_starred: false,
      follow_up_at: null,
      url: null,
      notes: null,
    },
    {
      company: 'Figma',
      position: 'Frontend Developer',
      applied_at: daysAgo(18),
      status: 'rejected',
      salary: '$115k',
      is_starred: false,
      follow_up_at: null,
      url: null,
      notes: null,
    },
  ]

  await supabase.from('applications').insert(apps.map((a) => ({ ...a, user_id: userId })))
}
