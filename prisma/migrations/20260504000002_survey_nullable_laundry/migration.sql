-- used_laundry and would_pay_wash_fold were NOT NULL BOOLEAN.
-- Segments that never see these screens should store NULL, not false.
ALTER TABLE guest_surveys
  ALTER COLUMN used_laundry DROP NOT NULL,
  ALTER COLUMN would_pay_wash_fold DROP NOT NULL;
