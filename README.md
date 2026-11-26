# Fail Buddy — Zero Fail GTU Passing Kit

Mobile-first GTU exam survival kit with high-probability IMPs, verified assignment answers, an Anti-Panic Daily Tracker, and zero-login barter unlock.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase credentials configured, the app automatically serves verified fallback mock data from `src/data/mockData.ts`.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://fail-buddy.vercel.app
```

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL Editor and run [`src/data/seed.sql`](src/data/seed.sql) (idempotent; creates `subjects`, `materials`, `contributions`, RLS policies, constraints, and starter GTU seed data).
3. Restart `npm run dev` so Next.js picks up `.env.local`.

## Quality Checks

```bash
npx tsc --noEmit
npm run lint
```
