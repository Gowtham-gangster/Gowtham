-- Alternative Profile Creation Solution
-- Since we can't create triggers on auth.users, we'll handle profile creation in the app
-- But we need to temporarily disable RLS for profile INSERT during signup

-- ============================================
-- OPTION 1: Create a function that bypasses RLS
-- ============================================
CREATE OR REPLACE FUNCTION public.create_profile_for_user(
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  user_role TEXT DEFAULT 'PATIENT',
  user_age INTEGER DEFAULT NULL,
  user_phone TEXT DEFAULT NULL,
  user_timezone TEXT DEFAULT 'UTC'
)
RETURNS public.profiles
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_profile public.profiles;
  invite_code TEXT;
BEGIN
  -- Generate invite code for patients
  IF user_role = 'PATIENT' THEN
    invite_code := upper(substring(md5(random()::text || user_id::text) from 1 for 8));
  ELSE
    invite_code := NULL;
  END IF;

  -- Insert profile (bypasses RLS because of SECURITY DEFINER)
  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    elderly_mode,
    timezone,
    caregiver_invite_code,
    voice_reminders_enabled,
    notifications_enabled,
    notification_settings,
    age,
    phone,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    user_name,
    user_email,
    user_role,
    false,
    user_timezone,
    invite_code,
    true,
    true,
    '{"doseReminders": true, "missedDoseAlerts": true, "refillWarnings": true, "orderNotifications": true, "emailEnabled": false}'::jsonb,
    user_age,
    user_phone,
    NOW(),
    NOW()
  )
  RETURNING * INTO new_profile;

  RETURN new_profile;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile_for_user TO authenticated, anon;

-- ============================================
-- OPTION 2: Modify RLS policy to allow INSERT during signup
-- ============================================

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create new policy that allows INSERT if the user is creating their own profile
-- OR if they're not authenticated yet (during signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id OR 
    auth.uid() IS NULL
  );

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION public.create_profile_for_user IS 
  'Creates a profile for a user, bypassing RLS. Used during signup process.';
