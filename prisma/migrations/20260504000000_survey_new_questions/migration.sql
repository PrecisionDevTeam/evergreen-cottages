-- New survey questions: travel origin, airport future interest, price willingness
ALTER TABLE guest_surveys
  ADD COLUMN IF NOT EXISTS travel_origin           VARCHAR(20),   -- drove | flew | other
  ADD COLUMN IF NOT EXISTS travel_city             VARCHAR(200),  -- free text
  ADD COLUMN IF NOT EXISTS airport_future_interest VARCHAR(5),    -- yes | no
  ADD COLUMN IF NOT EXISTS airport_price           VARCHAR(100);  -- free text dollar amount
