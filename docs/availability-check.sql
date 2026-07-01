-- ============================================================================
-- Availability cross-check query for the "Check every unit at once" search.
-- Mirrors src/lib/db.ts -> searchAvailability() and /api/search-availability.
--
-- Logic replicated:
--   * Calendar convention: a calendar entry's date = the CHECKOUT night for
--     that night's stay. A stay check_in -> check_out occupies the nights
--     keyed (check_in, check_out]  ==  check_in+1 .. check_out.
--   * A unit is BLOCKED only if one of those nights has an explicit calendar
--     row with is_available <> 1. A MISSING calendar row = treated as open
--     (same as the property detail calendar).
--   * Guest sizing: person_capacity >= min_guests.
--   * Scope: Pensacola units, visible_on_website (override) not false.
--   * Price per night = calendar price if > 0, else fallback base price
--     (website override price, else properties.base_price, else 65).
--   * total = subtotal + $65 cleaning fee (hardcoded, per CLAUDE.md).
--
-- HOW TO USE: edit the three values in the params CTE, run in your Postgres
-- client, and compare against what the site returns for the same inputs.
-- (Today is 2026-07-01, so "this Thu-Sun" = 2026-07-02 -> 2026-07-05.)
-- ============================================================================

WITH params AS (
  SELECT
    DATE '2026-07-02' AS check_in,     -- <-- edit
    DATE '2026-07-05' AS check_out,    -- <-- edit
    2                AS min_guests     -- <-- edit
),

-- Eligible units (Pensacola, visible, big enough) with their fallback price.
units AS (
  SELECT
    pr.id,
    COALESCE(o.website_name, pr.name)                 AS unit,
    pr.hostaway_property_id                           AS listing_id,
    pr.person_capacity,
    COALESCE(o.website_base_price, pr.base_price, 65)  AS fallback_price
  FROM properties pr
  LEFT JOIN website_property_overrides o ON o.property_id = pr.id
  CROSS JOIN params p
  WHERE pr.city = 'Pensacola'
    AND (o.visible_on_website IS DISTINCT FROM FALSE)
    AND COALESCE(pr.person_capacity, 2) >= p.min_guests
),

-- The window nights = calendar keys check_in+1 .. check_out (one per night).
nights AS (
  SELECT generate_series(check_in + 1, check_out, INTERVAL '1 day')::date AS night_key
  FROM params
),

-- One row per unit per night, with resolved availability + price.
grid AS (
  SELECT
    u.id,
    u.unit,
    u.person_capacity,
    n.night_key,
    -- price the code would use for this night
    CASE WHEN COALESCE(c.price, 0) > 0 THEN c.price ELSE u.fallback_price END AS night_price,
    -- blocked only if a row EXISTS and is_available <> 1
    (c.hostaway_listing_id IS NOT NULL AND c.is_available IS DISTINCT FROM 1)  AS is_blocked
  FROM units u
  CROSS JOIN nights n
  LEFT JOIN hostaway_calendar c
         ON c.hostaway_listing_id = u.listing_id
        AND c.date = n.night_key
)

SELECT
  id,
  unit,
  person_capacity,
  COUNT(*)                                   AS nights,
  SUM(night_price)                           AS subtotal,
  ROUND(SUM(night_price) / COUNT(*))         AS nightly,
  SUM(night_price) + 65                      AS total,
  BOOL_OR(is_blocked)                        AS has_blocked_night,
  CASE WHEN BOOL_OR(is_blocked) THEN 'BLOCKED' ELSE 'AVAILABLE' END AS status
FROM grid
GROUP BY id, unit, person_capacity
-- Uncomment the next line to show ONLY the units the site displays:
-- HAVING BOOL_OR(is_blocked) = FALSE
ORDER BY status, subtotal;


-- ============================================================================
-- OPTIONAL: per-night detail for ONE unit (debug why it's blocked / its price).
-- Set the property id and dates.
-- ============================================================================
-- WITH p AS (SELECT DATE '2026-07-02' AS check_in, DATE '2026-07-05' AS check_out, 10 AS pid)
-- SELECT n.night_key,
--        c.is_available,
--        c.price AS calendar_price,
--        COALESCE(o.website_base_price, pr.base_price, 65) AS fallback_price,
--        CASE WHEN COALESCE(c.price,0) > 0 THEN c.price
--             ELSE COALESCE(o.website_base_price, pr.base_price, 65) END AS night_price_used,
--        (c.hostaway_listing_id IS NOT NULL AND c.is_available IS DISTINCT FROM 1) AS is_blocked
-- FROM p
-- JOIN properties pr ON pr.id = p.pid
-- LEFT JOIN website_property_overrides o ON o.property_id = pr.id
-- CROSS JOIN LATERAL generate_series(p.check_in + 1, p.check_out, INTERVAL '1 day') AS n(night_key)
-- LEFT JOIN hostaway_calendar c
--        ON c.hostaway_listing_id = pr.hostaway_property_id
--       AND c.date = n.night_key::date
-- ORDER BY n.night_key;
