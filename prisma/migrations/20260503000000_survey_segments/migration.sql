-- Add segment-specific columns to guest_surveys
ALTER TABLE guest_surveys
  ADD COLUMN IF NOT EXISTS segment VARCHAR(1),
  ADD COLUMN IF NOT EXISTS highlight TEXT,
  ADD COLUMN IF NOT EXISTS would_recommend VARCHAR(20),
  ADD COLUMN IF NOT EXISTS referral_email VARCHAR(254),
  ADD COLUMN IF NOT EXISTS return_intent VARCHAR(10),
  ADD COLUMN IF NOT EXISTS five_star_improvement TEXT,
  ADD COLUMN IF NOT EXISTS complaint_categories TEXT,
  ADD COLUMN IF NOT EXISTS complaint_detail TEXT,
  ADD COLUMN IF NOT EXISTS wants_callback BOOLEAN DEFAULT FALSE;

-- Dedup guard: one submission per guest+property per day
CREATE UNIQUE INDEX IF NOT EXISTS guest_surveys_dedup
  ON guest_surveys (guest_email, property_name, (created_at::date));
