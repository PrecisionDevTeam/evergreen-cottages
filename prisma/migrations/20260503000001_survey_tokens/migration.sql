-- survey_tokens: pre-filled guest data per survey send
CREATE TABLE IF NOT EXISTS survey_tokens (
  id              SERIAL PRIMARY KEY,
  token           VARCHAR(64) UNIQUE NOT NULL,
  guest_id        INTEGER,
  reservation_id  INTEGER,
  review_id       VARCHAR(100),
  segment         VARCHAR(1) NOT NULL,
  review_rating   NUMERIC(3,1),
  guest_name      VARCHAR(100),
  guest_email     VARCHAR(254),
  guest_phone     VARCHAR(20),
  unit            VARCHAR(100),
  check_in        DATE,
  check_out       DATE,
  origin_city     VARCHAR(200),
  referral_code   VARCHAR(20),
  used_at         TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS survey_tokens_token_idx ON survey_tokens (token);

-- New columns on guest_surveys
ALTER TABLE guest_surveys
  ADD COLUMN IF NOT EXISTS token               VARCHAR(64),
  ADD COLUMN IF NOT EXISTS review_rating       NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS wash_fold_price_bucket INTEGER,
  ADD COLUMN IF NOT EXISTS gift_card_choice    VARCHAR(20),
  ADD COLUMN IF NOT EXISTS referral_code       VARCHAR(20),
  ADD COLUMN IF NOT EXISTS airport_method      VARCHAR(50),
  ADD COLUMN IF NOT EXISTS airport_cost        VARCHAR(20),
  ADD COLUMN IF NOT EXISTS airport_interest    VARCHAR(20),
  ADD COLUMN IF NOT EXISTS book_direct_reason  TEXT,
  ADD COLUMN IF NOT EXISTS five_star_fix       TEXT;

-- Unique index on token so ON CONFLICT (token) works in survey.ts
CREATE UNIQUE INDEX IF NOT EXISTS guest_surveys_token_idx
  ON guest_surveys (token) WHERE token IS NOT NULL;
