# Unsaid — first user-testing build

A complete, account-free experience-sharing site built from the selected “Human Archive” wireframe.

## What works

- Browse eight human-experience topics
- Search human-written entries
- Read focused story pages
- Leave one of three supportive reactions
- Add a moderated reply of up to 280 characters
- Privately report an entry
- Submit through topic, writing, and privacy-review stages
- Receive a random alias for each post or reply
- Block direct private details and obvious spam
- Hold ambiguous privacy or safety cases for review
- Rate-limit posts, replies, reactions, reports, and recovery attempts
- Remove a contribution with its one-time recovery code

There are no accounts, profiles, followers, rankings, direct messages, or AI-generated advice.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Supabase/PostgreSQL
- Vercel-compatible deployment

Exact installed versions are pinned in `package.json` and `package-lock.json`.

## Run immediately in demo mode

```bash
npm install
npm run dev
```

With no environment file, the app uses in-memory seeded data. Demo posts, replies, and reactions reset when the server restarts.

## Enable Supabase persistence

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor.
3. Optionally run `supabase/seed.sql`.
4. Copy `.env.example` to `.env.local`.
5. Add `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a long random `UNSAID_SERVER_SECRET`.
6. Restart the development server.

The service-role key is used only by Next.js route handlers. Never expose it in browser code or give it a `NEXT_PUBLIC_` prefix.

## Verify

```bash
npm run typecheck
npm run test
npm run build
```

Or run all three:

```bash
npm run verify
```

## Deploy to Vercel

Import the project into Vercel, add the same environment variables, and deploy. Vercel automatically supplies a free generated address ending in `.vercel.app`, which is sufficient for a small private test.

## Research and testing

`RESEARCH.md` contains the project introduction, audience research, content themes, sample entries, features, priority evaluation, journey map, UX guidance, submission research and rules, categories, wireframes, revisions, architecture, user-testing script, feedback questions, and future-improvement decision rules.

## Before a public launch

This is a first-testing build, not a finished public moderation operation. Add a real moderator dashboard, audit and appeal workflows, regional privacy/legal review, maintained outside-support routes, retention controls, and stronger distributed rate limiting before accepting unrestricted public submissions.
