# Set List

A deploy-ready Next.js 15 app for gigging musicians and music teachers to create, share, reorder, print, and export setlists.

## Stack

- Next.js 15 App Router
- TypeScript strict
- Tailwind v4
- shadcn-style UI primitives
- Drizzle ORM with Neon Postgres
- NextAuth v5 Google provider
- @dnd-kit sortable setlist editor
- react-to-print for print/PDF workflow
- Zod validation

## Environment

Create `.env.local` with:

```bash
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
```

Auth is optional. Anonymous setlists work with a random share slug and can be edited by anyone with the URL.

## Commands

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

## Vercel

Set the same environment variables in Vercel. The app expects a Neon-compatible Postgres URL in `DATABASE_URL`.
