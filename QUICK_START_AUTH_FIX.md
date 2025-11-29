# Quick Start: Fix RLS Authentication Error

## The Problem

Getting this error when users sign up?
```
new row violates row level security policy for table "profiles"
```

## The Solution (5 Minutes)

### Step 1: Apply Database Trigger (2 minutes)

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste this file: `supabase/migrations/001_create_profile_trigger.sql`
4. Click **Run**
5. ✅ You should see "Success. No rows returned"

### Step 2: Verify It Worked (1 minute)

Run this in SQL Editor:

```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

✅ You should see: `on_auth_user_created`

### Step 3: Test Signup (2 minutes)

1. Clear your browser cache
2. Go to `/signup` page
3. Create a new account
4. ✅ No errors! You're redirected to dashboard

### Step 4: Verify Profile Created

Run this in SQL Editor:

```sql
SELECT id, name, email, role FROM public.profiles ORDER BY created_at DESC LIMIT 1;
```

✅ You should see your new profile!

## What Just Happened?

The database trigger automatically creates profiles when users sign up, bypassing RLS policies safely. Your app code didn't change - it just works now!

## Optional: Apply Additional Improvements

### Add Validation Constraints (Recommended)

```bash
# In SQL Editor, run:
supabase/migrations/002_add_validation_constraints.sql
```

This adds email/phone validation, age constraints, etc.

### Add Performance Optimizations (Recommended)

```bash
# In SQL Editor, run:
supabase/migrations/003_optimize_rls_policies.sql
```

This adds indexes and caregiver access policies.

## Still Having Issues?

### Check Trigger Status

```sql
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

Should show: `tgenabled = O` (enabled)

### Check Recent Signups

```sql
SELECT u.id, u.email, p.name, p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;
```

All users should have matching profiles.

### View Logs

1. Go to Supabase Dashboard
2. Click **Logs** → **Postgres Logs**
3. Look for trigger execution or errors

## Need More Help?

See the full guide: `AUTH_RLS_FIX_GUIDE.md`

## Summary

✅ Database trigger installed
✅ Profiles created automatically
✅ RLS errors fixed
✅ Existing users unaffected
✅ No code changes needed

Your authentication is now working correctly!
