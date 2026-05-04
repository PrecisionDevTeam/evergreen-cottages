ALTER TABLE guest_surveys
  ADD COLUMN IF NOT EXISTS return_intent VARCHAR(10);
