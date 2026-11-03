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

## Deploying to Cloudflare Workers

The site runs on Cloudflare Workers through [OpenNext](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare`;
config in `wrangler.jsonc` and `open-next.config.ts`). Cloudflare builds it from GitHub on every push to `main`
(Workers Builds, Linux). Local OpenNext builds don't work on Windows without Developer Mode, and OpenNext doesn't
fully support Windows anyway.

- Build command `npx @opennextjs/cloudflare build`, deploy command `npx @opennextjs/cloudflare deploy`,
  preview command `npx @opennextjs/cloudflare upload`. Live test URL: https://farepockets.themasculinemind82.workers.dev
- Pages are prerendered at build and served from Workers static assets (read-only cache), which keeps requests
  well under the free plan's 10 ms CPU limit. Prices on pages therefore update by **redeploying** after
  `npm run refresh:prices` (re-run the latest build in the dashboard, or push a commit).
- The build needs `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ALLOW_INDEXING` and the three
  `TRAVELPAYOUTS_*` link settings as **build variables**. The running Worker needs `DATABASE_URL` and `CRON_SECRET`
  as **secrets** (dashboard → Settings → Variables and Secrets, type Secret); its plain `TRAVELPAYOUTS_*` settings
  are in `wrangler.jsonc` `vars`, because a deploy replaces plain variables set in the dashboard. `TRAVELPAYOUTS_TOKEN` is only used by the refresh script, not the Worker.
- City photos are pre-made in fixed widths by `scripts/build-images.ts` (runs before `dev`/`build`) and served by
  `lib/imageLoader.ts`; no image optimisation service is used.
- On Workers each request gets its own database connection (`lib/db/client.ts`).

## Cron

Production price refresh is `npm run refresh:prices` (`scripts/refresh-prices.ts`), run on a Hostinger hPanel
crontab entry twice daily — **not** a Vercel/serverless cron. Each route makes 5–6 Data API calls: its cheapest
fares (which also feed the route facts: stops, airlines, airports), a nonstop-only search for the "Good to know"
panel, 3 months of daily fares for the calendar, and for non-USD routes a USD price used only for ranking. 114 routes
take about 12 minutes; it grows linearly with routes. Each run also deletes click events older than 13 months
(`lib/db/queries/clicks.ts`). `app/api/cron/refresh-prices/route.ts` exists only as a manual/admin trigger fallback (`CRON_SECRET`-protected)
and can exceed serverless time limits at this size.

## Pre-launch

The site is public but hidden from search engines while `NEXT_PUBLIC_ALLOW_INDEXING=false` (every page sends
`noindex` and robots.txt disallows crawling). Set it to `true` to launch. The old HTTP Basic Auth gate
(`proxy.ts`) was removed: it was the only middleware, and Cloudflare's support for Node.js middleware is
experimental and costs CPU on every request.

## Deploy targets

- **Hostinger Business (Node.js)** — the only production target. US data center region, `next start` on a
  persistent process, GitHub-integration deploy.
- **Vercel (Hobby)** — UI/UX review only. No custom domain attached there, default `*.vercel.app` URLs, never
  treated as a live/production site.
