-- Supabase exposes the public schema through its REST/GraphQL API (anon and
-- authenticated roles). The app connects directly as the table owner, which
-- bypasses RLS, so enabling it with no policies blocks API access without
-- affecting the site.
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;
