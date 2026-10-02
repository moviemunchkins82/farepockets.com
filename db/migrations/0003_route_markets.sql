-- Routes outside the US: each route has a country on both ends and a pricing
-- currency (its origin market's, e.g. GBP for flights from the UK).
-- cheapest_price_usd is the same fare in USD, used only to rank routes in
-- different currencies against each other; prices are shown in `currency`.
ALTER TABLE routes
  ADD COLUMN origin_country      CHAR(2) NOT NULL DEFAULT 'US',
  ADD COLUMN destination_country CHAR(2) NOT NULL DEFAULT 'US',
  ADD COLUMN currency            CHAR(3) NOT NULL DEFAULT 'USD',
  ADD COLUMN cheapest_price_usd  NUMERIC(10,2);

-- Existing routes are all US domestic, priced in USD.
UPDATE routes SET cheapest_price_usd = cheapest_price WHERE cheapest_currency = 'USD';
