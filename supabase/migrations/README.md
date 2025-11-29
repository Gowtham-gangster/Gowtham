# Database Migrations

This directory contains SQL migration files for the MedReminder Pro database.

## Migration Files

### 001_create_profile_trigger.sql
**Purpose**: Creates automatic profile creation trigger to solve RLS chicken-and-egg problem

**What it does**:
- Creates `handle_new_user()` function with SECURITY DEFINER
- Automatically creates profile when auth.users record is inserted
- Extracts metadata from `raw_user_meta_data`
- Generates unique invite codes for patients
- Bypasses RLS policies for profile creation

**Run this first**: This is the core fix for the "new row violates row level security" error

### 002_add_validation_constraints.sql
**Purpose**: Adds database-level validation constraints

**What it does**:
- Email format validation
- Phone number format validation (E.164)
- Age range validation (0-150)
- Stock count non-negative constraints
- Dosage amount positive constraints
- Date range validations
- Unique indexes on email and invite codes

### 003_optimize_rls_policies.sql
**Purpose**: Optimizes RLS policies for performance

**What it does**:
- Adds performance indexes on frequently queried columns
- Adds caregiver access policies
- Adds composite indexes for common query patterns
- Runs ANALYZE on all tables
- Documents policy performance characteristics

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file in order (001, 002, 003)
4. Run each migration
5. Verify no errors in the output

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 3: Manual psql

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"

# Run each migration
\i supabase/migrations/001_create_profile_trigger.sql
\i supabase/migrations/002_add_validation_constraints.sql
\i supabase/migrations/003_optimize_rls_policies.sql
```

## Verification

After applying migrations, verify they worked:

```sql
-- Check if trigger exists
SELECT tgname, tgrelid::regclass, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check if function exists
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check constraints
SELECT conname, contype, conrelid::regclass 
FROM pg_constraint 
WHERE conname LIKE 'valid_%';

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

## Testing the Fix

After applying migrations, test the signup flow:

1. Create a new user via the signup page
2. The profile should be created automatically
3. No "row level security" errors should occur
4. Check the profiles table to verify the profile exists

```sql
-- Check if profile was created
SELECT id, name, email, role, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;
```

## Rollback Instructions

If you need to rollback the migrations:

```sql
-- Rollback 003: Remove optimizations
DROP INDEX IF EXISTS idx_dose_logs_user_status;
DROP INDEX IF EXISTS idx_notifications_user_read;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_orders_created_at;
DROP POLICY IF EXISTS "Caregivers can view linked patients medicines" ON public.medicines;
DROP POLICY IF EXISTS "Caregivers can view linked patients schedules" ON public.schedules;
DROP POLICY IF EXISTS "Caregivers can view linked patients dose logs" ON public.dose_logs;
DROP POLICY IF EXISTS "Caregivers can view linked patients disease profiles" ON public.disease_profiles;

-- Rollback 002: Remove constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_email;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_phone;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_age;
ALTER TABLE public.medicines DROP CONSTRAINT IF EXISTS valid_stock_count;
ALTER TABLE public.medicines DROP CONSTRAINT IF EXISTS valid_refill_threshold;
ALTER TABLE public.medicines DROP CONSTRAINT IF EXISTS valid_quantity;
ALTER TABLE public.medicines DROP CONSTRAINT IF EXISTS valid_refills;
ALTER TABLE public.schedules DROP CONSTRAINT IF EXISTS valid_dosage_amount;
ALTER TABLE public.schedules DROP CONSTRAINT IF EXISTS valid_max_dose_per_day;
ALTER TABLE public.schedules DROP CONSTRAINT IF EXISTS valid_max_dose_per_intake;
ALTER TABLE public.schedules DROP CONSTRAINT IF EXISTS valid_date_range;
ALTER TABLE public.schedules DROP CONSTRAINT IF EXISTS valid_interval_days;
ALTER TABLE public.schedules DROP CONSTRAINT IF EXISTS valid_interval_hours;
ALTER TABLE public.schedules DROP CONSTRAINT IF EXISTS valid_times_of_day;
ALTER TABLE public.dose_logs DROP CONSTRAINT IF EXISTS valid_taken_time;
ALTER TABLE public.disease_profiles DROP CONSTRAINT IF EXISTS valid_diagnosis_date;
ALTER TABLE public.disease_profiles DROP CONSTRAINT IF EXISTS valid_checkup_dates;
DROP INDEX IF EXISTS idx_profiles_email_unique;
DROP INDEX IF EXISTS idx_profiles_invite_code_unique;

-- Rollback 001: Remove trigger (WARNING: This will break signup!)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

## Troubleshooting

### Error: "permission denied for schema auth"

**Solution**: Make sure you're running the migrations as a superuser or with proper permissions. In Supabase dashboard, the SQL Editor runs with appropriate permissions.

### Error: "trigger already exists"

**Solution**: The migrations use `DROP TRIGGER IF EXISTS` to handle this. If you still see errors, manually drop the trigger first:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

### Profile still not being created

**Check**:
1. Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Check function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`
3. Look for errors in Supabase logs
4. Try creating a user and check the logs immediately

### RLS violations still occurring

**Check**:
1. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
2. Check policies exist: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
3. Verify the trigger is firing: Add a test user and check if profile is created
4. Check Supabase logs for detailed error messages

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Review the error messages carefully
3. Verify all migrations were applied successfully
4. Test with a new user signup
5. Check the GitHub issues for similar problems

## Notes

- These migrations are idempotent (safe to run multiple times)
- They use `IF EXISTS` and `IF NOT EXISTS` clauses
- Existing data is not affected
- The trigger only affects new user signups
- Existing users can continue using the app normally
