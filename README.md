# FarePockets

US flight-search affiliate site. No own booking/payment/support — every search/booking flow redirects to a
Travelpayouts partner; we earn commission on the resulting booking. See `C:\Users\Developer\.claude\plans\snazzy-bouncing-puffin.md` for the full build plan this repo implements.

## Setup

There is no database. Routes and prices are files in `data/`, bundled into the site at build time.

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `TRAVELPAYOUTS_TOKEN`, `TRAVELPAYOUTS_MARKER` — from your Travelpayouts affiliate account. The token is
     only used by the price refresh.
   - `TRAVELPAYOUTS_WIDGET_SRC_TEMPLATE`, `TRAVELPAYOUTS_DEEPLINK_TEMPLATE` — exact embed/deep-link formats from
     the Travelpayouts dashboard once the account is approved. Until these are set, affiliate links render as
     `#` locally with a console warning (see `lib/travelpayouts/affiliateLinks.ts`) — this only blocks a real
     production build (`NEXT_PUBLIC_ALLOW_INDEXING=true`), not local dev.
   - `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_MIXPANEL_TOKEN` — analytics, optional during build.
3. `npm run dev`.

## Routes

`data/routes.csv` is the list of routes (121: US domestic; UK routes to Europe, the US, the Middle East and Asia;
and the focus region, Turkey, the Caucasus and Central Asia, from the UK and the US, listed in `lib/regions.ts`,
which builds `/destinations` and the country pages; these group routes by departure country, each in its own
currency, so a new departure country needs no page changes). Use metro codes where a city has several airports (NYC, CHI, WAS, LON,
ROM, PAR, YTO). Each row also sets `origin_country`/`destination_country` (ISO codes like `US`, `GB`) and
`currency` — the origin market's currency (`USD` from the US, `GBP` from the UK, `EUR` from Ireland). Prices
are fetched and shown in that currency; a USD copy is stored only to rank routes against each other.

Before every `dev` and `build`, `scripts/build-routes.ts` checks the CSV and writes `data/routes.json` (commit
it with the CSV). Adding a row creates its route page and adds it to the city hub pages (`/flights-to/[city]`,
`/flights-from/[city]`); removing one removes its page. A new route has no prices until the next refresh. Add a
photo for any new city in `lib/cityImages.ts` (optional; pages fall back to a gradient header).

## Refreshing prices

`npm run refresh:prices` (`scripts/refresh-prices.ts`) fetches fresh fares for every route and rewrites
`data/prices.json`. The GitHub Actions workflow `.github/workflows/refresh-prices.yml` runs it twice a day (05:17 and
17:17 UTC) and commits the file, and the push rebuilds the site with the new prices. It needs the repository secret
`TRAVELPAYOUTS_TOKEN`; run it by hand from the Actions tab ("Refresh prices" → "Run workflow"). Run locally, commit
and push the file yourself. Each route makes 5–6
Data API calls: its cheapest fares (which also feed the route facts: stops, airlines, airports), a nonstop-only
search for the "Good to know" panel, 3 months of daily fares for the calendar, and for non-USD routes a USD price
used only for ranking. 114 routes take about 12 minutes; it grows linearly with routes. A route whose lookup fails
keeps its previous prices. `npm run backfill:prices` sanity-checks the Data API response shape against a couple of
routes.

## Deploying to Cloudflare Workers

The site runs on Cloudflare Workers through [OpenNext](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare`;
config in `wrangler.jsonc` and `open-next.config.ts`). Cloudflare builds it from GitHub on every push to `main`
(Workers Builds, Linux). Local OpenNext builds don't work on Windows without Developer Mode, and OpenNext doesn't
fully support Windows anyway.

- Build command `npx @opennextjs/cloudflare build`, deploy command `npx @opennextjs/cloudflare deploy`,
  preview command `npx @opennextjs/cloudflare upload`. Live test URL: https://farepockets.themasculinemind82.workers.dev
- Every page is prerendered at build and served from Workers static assets (read-only cache), which keeps requests
  well under the free plan's 10 ms CPU limit.
- The build needs `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ALLOW_INDEXING` and the three `TRAVELPAYOUTS_*` link settings
  as **build variables**. The Worker's runtime settings are in `wrangler.jsonc` `vars` (a deploy replaces plain
  variables set in the dashboard). No secrets are needed.
- City photos are pre-made in fixed widths by `scripts/build-images.ts` (runs before `dev`/`build`) and served by
  `lib/imageLoader.ts`; no image optimisation service is used.

## Clicks and bookings

Clicks and bookings per link are in the Travelpayouts dashboard: every affiliate link carries a page-specific
`sub_id` (e.g. `route-london-to-istanbul`). `components/AffiliateLink.tsx` also sends clicks to GA4 and Mixpanel
once they're set up.

## Pre-launch

The site is public but hidden from search engines while `NEXT_PUBLIC_ALLOW_INDEXING=false` (every page sends
`noindex` and robots.txt disallows crawling). Set it to `true` to launch. The old HTTP Basic Auth gate
(`proxy.ts`) was removed: it was the only middleware, and Cloudflare's support for Node.js middleware is
experimental and costs CPU on every request.

## Deploy targets

- **Cloudflare Workers** — the live test site (see above).
- **Hostinger Business (Node.js)** — possible later production target: `next start` on a persistent process,
  GitHub-integration deploy. Nothing here depends on Cloudflare except `wrangler.jsonc` and `open-next.config.ts`.
- **Vercel (Hobby)** — UI/UX review only. No custom domain attached there, default `*.vercel.app` URLs, never
  treated as a live/production site.
