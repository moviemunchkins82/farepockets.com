# FarePockets

US flight-search affiliate site. No own booking/payment/support — every search/booking flow redirects to a
Travelpayouts partner; we earn commission on the resulting booking. See `C:\Users\Developer\.claude\plans\snazzy-bouncing-puffin.md` for the full build plan this repo implements.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` — Supabase Postgres connection string.
   - `TRAVELPAYOUTS_TOKEN`, `TRAVELPAYOUTS_MARKER` — from your Travelpayouts affiliate account.
   - `TRAVELPAYOUTS_WIDGET_SRC_TEMPLATE`, `TRAVELPAYOUTS_DEEPLINK_TEMPLATE` — exact embed/deep-link formats from
     the Travelpayouts dashboard once the account is approved. Until these are set, affiliate links render as
     `#` locally with a console warning (see `lib/travelpayouts/affiliateLinks.ts`) — this only blocks a real
     production build (`NEXT_PUBLIC_ALLOW_INDEXING=true`), not local dev.
   - `CRON_SECRET` — any random string, protects the manual-trigger/revalidate endpoints.
   - `BASIC_AUTH_USER`, `BASIC_AUTH_PASS` — pre-launch access gate. Set both during the entire build phase; blank
     both only in the launch-flip deploy, together with flipping `NEXT_PUBLIC_ALLOW_INDEXING` to `true`.
   - `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_MIXPANEL_TOKEN` — analytics, optional during build.
3. Run the migration in `db/migrations/0001_init.sql` against the Supabase instance (SQL editor or `psql`).
4. `npm run seed:routes` — seeds `data/routes.csv` (currently 6 placeholder routes; SEO's real 30-50 route list
   replaces this file directly, no code change needed).
5. `npm run backfill:prices` — sanity-checks the Travelpayouts Data API response shape against a couple of routes
   before trusting the unattended cron.
6. `npm run dev`.

## Cron

Production price refresh is `npm run refresh:prices` (`scripts/refresh-prices.ts`), run on a Hostinger hPanel
crontab entry twice daily — **not** a Vercel/serverless cron. `app/api/cron/refresh-prices/route.ts` exists only
as a manual/admin trigger fallback (`CRON_SECRET`-protected).

## Pre-launch

Site is access-gated by HTTP Basic Auth (`middleware.ts`) and `noindex` (`NEXT_PUBLIC_ALLOW_INDEXING=false`) by
default. Both flip together in one deploy at launch — see the plan's Build Phases / Verification sections for the
exact checks to run before and after that flip.

## Deploy targets

- **Hostinger Business (Node.js)** — the only production target. US data center region, `next start` on a
  persistent process, GitHub-integration deploy.
- **Vercel (Hobby)** — UI/UX review only. No custom domain attached there, default `*.vercel.app` URLs, never
  treated as a live/production site.
