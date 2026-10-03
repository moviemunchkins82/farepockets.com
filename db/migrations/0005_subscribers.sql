-- Deal-alert sign-ups. Stored here until an email provider is chosen; the
-- consent columns record exactly what each person agreed to (UK GDPR).
CREATE TABLE subscribers (
  id                BIGSERIAL PRIMARY KEY,
  email             TEXT UNIQUE NOT NULL,          -- trimmed and lowercased
  home_airport      TEXT,                          -- optional city name, e.g. "London"
  status            TEXT NOT NULL DEFAULT 'subscribed', -- subscribed | unsubscribed
  consent_text      TEXT NOT NULL,                 -- the wording shown next to the button
  consent_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_path       TEXT,                          -- page the form was on
  ip_hash           TEXT,                          -- salted hash, only for rate limiting
  unsubscribe_token TEXT UNIQUE NOT NULL,          -- for the link in future emails
  unsubscribed_at   TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscribers_status ON subscribers (status);
CREATE INDEX idx_subscribers_ip_recent ON subscribers (ip_hash, updated_at);

-- Same as the other tables: block Supabase's public API; the app connects as owner.
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
