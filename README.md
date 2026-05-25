# Job Tracker

Track your job applications in one place — built as a real portfolio project during an active job search.

**[Live demo →](https://job-tracker-iota-ten.vercel.app)**

## What it does

- Add, edit, and delete job applications with company, position, date, status, link, and notes
- Filter by status: Postulado / Entrevista / Oferta / Rechazado
- Dashboard with counts per status at a glance
- Each user sees only their own data (Row Level Security)
- Dark mode with system preference detection and manual toggle

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — Postgres database, Row Level Security, Auth (email/password)
- **Vercel** — deployment

## Getting Started

```bash
git clone https://github.com/Rafael464G/job-tracker.git
cd job-tracker
npm install
```

Create `.env.local` from the example:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run the SQL below in your Supabase SQL Editor, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Schema

```sql
create table public.applications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  company     text not null,
  position    text not null,
  applied_at  date not null default current_date,
  status      text not null default 'applied'
                check (status in ('applied', 'interview', 'rejected', 'offer')),
  url         text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.applications enable row level security;

create policy "Users can select own applications" on public.applications
  for select using (auth.uid() = user_id);
create policy "Users can insert own applications" on public.applications
  for insert with check (auth.uid() = user_id);
create policy "Users can update own applications" on public.applications
  for update using (auth.uid() = user_id);
create policy "Users can delete own applications" on public.applications
  for delete using (auth.uid() = user_id);
```

## Author

**Rafael González** — [GitHub](https://github.com/Rafael464G) · [LinkedIn](https://www.linkedin.com/in/rafael-gonzalez-86a037370/) · [Workana](https://www.workana.com/freelancer/1de0dbb7abee74488ea4a8210811c022)

## License

MIT
