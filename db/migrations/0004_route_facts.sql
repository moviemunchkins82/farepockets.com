-- Per-route facts gathered at refresh time from the same fare searches:
-- nonstop availability and price, airlines, stops and airports on the cheapest
-- fares. Shown on route pages and in their FAQs (see lib/travelpayouts/types.ts).
ALTER TABLE routes ADD COLUMN route_facts JSONB;
