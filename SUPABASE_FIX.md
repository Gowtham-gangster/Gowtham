# 🔧 Supabase Schema Fix

## ❌ Problem
Error: "Could not find the table 'public.profiles' in the schema cache"

## ✅ Solution

### Option 1: Use Simplified Schema (RECOMMENDED)

I've created a simplified schema that's easier to run:

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/nmuqhacsihguqxlthwnv
   - Click "SQL Editor" in left sidebar
   - Click "New query"

2. **Use the Simplified Schema**
   - Open `supabase/schema-simple.sql` (NEW FILE)
   - Copy ALL the code
   - Paste into SQL Editor
   - Click "Run"

3. **Verify Success**
   - Should see: "Schema created successfully!"
   - Click "Table Editor"
   - Should see all 9 tables

4. **Try Signup Again**
   - Refresh your app
   - Try creating account
   - Should work now! ✅

---

### Option 2: Run Schema in Sections

If Option 1 doesn't work, run the schema in smaller parts:

#### Part 1: Create Tables
```sql
-- Copy and run just the table creation sections
-- From "PROFILES TABLE" to "ORDERS TABLE"
```

#### Part 2: Create Indexes
```sql
-- Copy and run just the indexes section
```

#### Part 3: Enable RLS
```sql
-- Copy and run just the "ENABLE ROW LEVEL SECURITY" section
```

#### Part 4: Create Policies
```sql
-- Copy and run policies one table at a time
```

---

### Option 3: Disable RLS Temporarily (For Testing Only)

If you just want to test quickly:

```sql
-- Disable RLS on all tables (NOT FOR PRODUCTION!)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warning**: This removes security! Only for testing. Re-enable RLS before production.

---

## 🎯 Recommended Steps

1. **Use `schema-simple.sql`** (it's cleaner and has better error handling)
2. Run it in Supabase SQL Editor
3. Verify tables are created
4. Try signup again
5. Should work perfectly!

---

## 📋 Checklist

- [ ] Open Supabase SQL Editor
- [ ] Copy `supabase/schema-simple.sql`
- [ ] Paste and run
- [ ] See success message
- [ ] Check Table Editor for tables
- [ ] Refresh app
- [ ] Try signup
- [ ] Success! ✅

---

## 🆘 Still Having Issues?

### Check These:

1. **Are you in the right project?**
   - URL should be: nmuqhacsihguqxlthwnv.supabase.co

2. **Did the SQL run completely?**
   - Check for any red error messages
   - Make sure you copied the ENTIRE file

3. **Are tables visible?**
   - Go to Table Editor
   - Should see 9 tables

4. **Is RLS enabled?**
   - Click on a table
   - Should see "RLS enabled" badge

---

## 💡 Quick Test

After running the schema, test in SQL Editor:

```sql
-- Test query
SELECT * FROM public.profiles LIMIT 1;
```

If this works, your schema is good!

---

**Use `schema-simple.sql` and let me know if it works!** 🚀
