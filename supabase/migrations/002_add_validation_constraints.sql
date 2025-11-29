-- Migration: Add Data Validation Constraints
-- Adds database-level validation for data integrity

-- ============================================
-- PROFILES TABLE CONSTRAINTS
-- ============================================

-- Email format validation
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS valid_email;

ALTER TABLE public.profiles
ADD CONSTRAINT valid_email 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Phone format validation (E.164 format)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS valid_phone;

ALTER TABLE public.profiles
ADD CONSTRAINT valid_phone 
CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$');

-- Age range validation
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS valid_age;

ALTER TABLE public.profiles
ADD CONSTRAINT valid_age 
CHECK (age IS NULL OR (age >= 0 AND age <= 150));

-- Role validation (already exists in schema but ensuring it's there)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('PATIENT', 'CAREGIVER'));

-- Ensure email is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique 
ON public.profiles(LOWER(email));

-- Ensure caregiver invite code is unique when not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_invite_code_unique 
ON public.profiles(caregiver_invite_code) 
WHERE caregiver_invite_code IS NOT NULL;

-- ============================================
-- MEDICINES TABLE CONSTRAINTS
-- ============================================

-- Ensure stock count is non-negative
ALTER TABLE public.medicines
DROP CONSTRAINT IF EXISTS valid_stock_count;

ALTER TABLE public.medicines
ADD CONSTRAINT valid_stock_count 
CHECK (stock_count >= 0);

-- Ensure refill threshold is non-negative
ALTER TABLE public.medicines
DROP CONSTRAINT IF EXISTS valid_refill_threshold;

ALTER TABLE public.medicines
ADD CONSTRAINT valid_refill_threshold 
CHECK (refill_threshold >= 0);

-- Ensure quantity is positive when set
ALTER TABLE public.medicines
DROP CONSTRAINT IF EXISTS valid_quantity;

ALTER TABLE public.medicines
ADD CONSTRAINT valid_quantity 
CHECK (quantity IS NULL OR quantity > 0);

-- Ensure refills remaining is non-negative
ALTER TABLE public.medicines
DROP CONSTRAINT IF EXISTS valid_refills;

ALTER TABLE public.medicines
ADD CONSTRAINT valid_refills 
CHECK (refills_remaining IS NULL OR refills_remaining >= 0);

-- ============================================
-- SCHEDULES TABLE CONSTRAINTS
-- ============================================

-- Ensure dosage amount is positive
ALTER TABLE public.schedules
DROP CONSTRAINT IF EXISTS valid_dosage_amount;

ALTER TABLE public.schedules
ADD CONSTRAINT valid_dosage_amount 
CHECK (dosage_amount > 0);

-- Ensure max doses are positive when set
ALTER TABLE public.schedules
DROP CONSTRAINT IF EXISTS valid_max_dose_per_day;

ALTER TABLE public.schedules
ADD CONSTRAINT valid_max_dose_per_day 
CHECK (max_dose_per_day IS NULL OR max_dose_per_day > 0);

ALTER TABLE public.schedules
DROP CONSTRAINT IF EXISTS valid_max_dose_per_intake;

ALTER TABLE public.schedules
ADD CONSTRAINT valid_max_dose_per_intake 
CHECK (max_dose_per_intake IS NULL OR max_dose_per_intake > 0);

-- Ensure end date is after start date
ALTER TABLE public.schedules
DROP CONSTRAINT IF EXISTS valid_date_range;

ALTER TABLE public.schedules
ADD CONSTRAINT valid_date_range 
CHECK (end_date IS NULL OR end_date >= start_date);

-- Ensure interval values are positive when set
ALTER TABLE public.schedules
DROP CONSTRAINT IF EXISTS valid_interval_days;

ALTER TABLE public.schedules
ADD CONSTRAINT valid_interval_days 
CHECK (interval_days IS NULL OR interval_days > 0);

ALTER TABLE public.schedules
DROP CONSTRAINT IF EXISTS valid_interval_hours;

ALTER TABLE public.schedules
ADD CONSTRAINT valid_interval_hours 
CHECK (interval_hours IS NULL OR interval_hours > 0);

-- Ensure times_of_day array is not empty
ALTER TABLE public.schedules
DROP CONSTRAINT IF EXISTS valid_times_of_day;

ALTER TABLE public.schedules
ADD CONSTRAINT valid_times_of_day 
CHECK (array_length(times_of_day, 1) > 0);

-- ============================================
-- DOSE LOGS TABLE CONSTRAINTS
-- ============================================

-- Ensure taken time is not in the future (with 5 minute grace period)
ALTER TABLE public.dose_logs
DROP CONSTRAINT IF EXISTS valid_taken_time;

ALTER TABLE public.dose_logs
ADD CONSTRAINT valid_taken_time 
CHECK (taken_time IS NULL OR taken_time <= NOW() + INTERVAL '5 minutes');

-- ============================================
-- DISEASE PROFILES TABLE CONSTRAINTS
-- ============================================

-- Ensure diagnosis date is not in the future
ALTER TABLE public.disease_profiles
DROP CONSTRAINT IF EXISTS valid_diagnosis_date;

ALTER TABLE public.disease_profiles
ADD CONSTRAINT valid_diagnosis_date 
CHECK (diagnosis_date IS NULL OR diagnosis_date <= CURRENT_DATE);

-- Ensure next checkup is after last checkup
ALTER TABLE public.disease_profiles
DROP CONSTRAINT IF EXISTS valid_checkup_dates;

ALTER TABLE public.disease_profiles
ADD CONSTRAINT valid_checkup_dates 
CHECK (
  (last_checkup IS NULL OR next_checkup IS NULL) OR 
  next_checkup >= last_checkup
);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON CONSTRAINT valid_email ON public.profiles IS 
  'Ensures email addresses follow standard format';

COMMENT ON CONSTRAINT valid_phone ON public.profiles IS 
  'Ensures phone numbers follow E.164 international format';

COMMENT ON CONSTRAINT valid_age ON public.profiles IS 
  'Ensures age is within reasonable range (0-150)';

COMMENT ON CONSTRAINT valid_stock_count ON public.medicines IS 
  'Ensures stock count cannot be negative';

COMMENT ON CONSTRAINT valid_dosage_amount ON public.schedules IS 
  'Ensures dosage amount is positive';

COMMENT ON CONSTRAINT valid_date_range ON public.schedules IS 
  'Ensures end date is not before start date';
