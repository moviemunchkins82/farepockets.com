-- Run this against the Supabase Postgres instance (SQL editor or psql).

CREATE TABLE routes (
  id                SERIAL PRIMARY KEY,
  slug              TEXT UNIQUE NOT NULL,
  origin_iata       CHAR(3) NOT NULL,
  destination_iata  CHAR(3) NOT NULL,
  origin_city       TEXT NOT NULL,
  destination_city  TEXT NOT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  target_keyword    TEXT,
  cheapest_price    NUMERIC(10,2),
  cheapest_currency CHAR(3) DEFAULT 'USD',
  cheapest_depart_date DATE,
  price_calendar    JSONB,
  last_refreshed_at TIMESTAMPTZ,
  refresh_status    TEXT DEFAULT 'pending', -- ok | stale | error
  refresh_error     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_routes_active ON routes (is_active);

CREATE TABLE click_events (
  id            BIGSERIAL PRIMARY KEY,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  route_slug    TEXT,
  page_path     TEXT NOT NULL,
  marker        TEXT NOT NULL,
  sub_id        TEXT NOT NULL,
  target_url    TEXT NOT NULL,
  session_id    TEXT,
  referrer      TEXT,
  user_agent    TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT
);
CREATE INDEX idx_click_events_route_slug ON click_events (route_slug);
CREATE INDEX idx_click_events_occurred_at ON click_events (occurred_at);
CREATE INDEX idx_click_events_sub_id ON click_events (sub_id);
