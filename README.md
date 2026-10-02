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
3. `npm run db:migrate` — applies `db/migrations/*.sql` in order (tracked in `schema_migrations`, so it's safe
   to re-run on every deploy). Use the Supabase **Transaction pooler** (port 6543) connection string for `DATABASE_URL`.
4. `npm run seed:routes` — seeds `data/routes.csv` (105 routes: US domestic; UK routes to Europe, the US,
   the Middle East and Asia; and the focus region, Turkey, the Caucasus and Central Asia, listed in
   `lib/regions.ts`, which builds `/destinations` and the country pages). Use metro codes where a city has several airports (NYC, CHI, WAS, LON, ROM, PAR, YTO).
   Each row also sets `origin_country`/`destination_country` (ISO codes like `US`, `GB`) and `currency` — the
   origin market's currency (`USD` from the US, `GBP` from the UK, `EUR` from Ireland). Prices are fetched and
   shown in that currency; a USD copy is stored only to rank routes against each other. Adding a row creates its route page and adds it to the city hub pages
   (`/flights-to/[city]`, `/flights-from/[city]`) automatically; removed rows are deactivated. Add a photo for any new
   city in `lib/cityImages.ts` (optional; pages fall back to a gradient header).
5. `npm run backfill:prices` — sanity-checks the Travelpayouts Data API response shape against a couple of routes
   before trusting the unattended cron.
6. `npm run dev`.

## Cron

Production price refresh is `npm run refresh:prices` (`scripts/refresh-prices.ts`), run on a Hostinger hPanel
crontab entry twice daily — **not** a Vercel/serverless cron. Each route makes 4 Data API calls (cheapest fare plus
3 months of daily fares for the route page calendar), so 40 routes take about 2.5 minutes; it grows linearly with
routes. `app/api/cron/refresh-prices/route.ts` exists only as a manual/admin trigger fallback (`CRON_SECRET`-protected)
and can exceed serverless time limits at this size.

## Pre-launch

Site is access-gated by HTTP Basic Auth (`proxy.ts`) and `noindex` (`NEXT_PUBLIC_ALLOW_INDEXING=false`) by
default. Both flip together in one deploy at launch — see the plan's Build Phases / Verification sections for the
exact checks to run before and after that flip.

## Deploy targets

- **Hostinger Business (Node.js)** — the only production target. US data center region, `next start` on a
  persistent process, GitHub-integration deploy.
- **Vercel (Hobby)** — UI/UX review only. No custom domain attached there, default `*.vercel.app` URLs, never
  treated as a live/production site.
