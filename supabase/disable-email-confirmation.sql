-- Disable Email Confirmation in Supabase
-- Run this in your Supabase SQL Editor to allow instant signup without email verification

-- Note: This is done through Supabase Dashboard, not SQL
-- Go to: Authentication > Settings > Email Auth
-- Uncheck "Enable email confirmations"

-- However, if you want to keep email confirmation enabled,
-- the app now handles it properly by showing a message to check email.

-- To manually confirm a user's email (for testing):
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'your-test-email@example.com';
