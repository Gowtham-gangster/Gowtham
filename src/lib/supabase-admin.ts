/**
 * Supabase Admin Client
 * 
 * This client uses the service role key to bypass RLS policies.
 * ONLY use for operations that require elevated permissions, such as:
 * - Creating profiles during signup (fallback if trigger fails)
 * - Admin operations
 * 
 * NEVER expose the service role key in client-side code in production.
 * This is only for development/fallback scenarios.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthError, AUTH_ERROR_CODES } from '@/services/database/auth-errors';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

/**
 * Admin client with service role permissions
 * Returns null if service role key is not configured
 */
export const supabaseAdmin: SupabaseClient | null = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Check if admin client is available
 */
export function isAdminClientAvailable(): boolean {
  return supabaseAdmin !== null;
}

/**
 * Create profile using service role (bypasses RLS)
 * This is a fallback method if the database trigger fails
 * 
 * @param userId - The auth user ID
 * @param profileData - Profile data to insert
 * @returns The created profile
 */
export async function createProfileWithServiceRole(
  userId: string,
  profileData: {
    name: string;
    email: string;
    role: 'PATIENT' | 'CAREGIVER';
    age?: number;
    phone?: string;
    timezone?: string;
    elderly_mode?: boolean;
    voice_reminders_enabled?: boolean;
    notifications_enabled?: boolean;
  }
): Promise<any> {
  if (!supabaseAdmin) {
    throw new AuthError(
      'Service role not configured',
      AUTH_ERROR_CODES.PROFILE_CREATE_FAILED
    );
  }

  try {
    // Generate invite code for patients
    const inviteCode = profileData.role === 'PATIENT'
      ? Math.random().toString(36).substring(2, 10).toUpperCase()
      : undefined;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        elderly_mode: profileData.elderly_mode ?? false,
        timezone: profileData.timezone ?? 'UTC',
        caregiver_invite_code: inviteCode,
        voice_reminders_enabled: profileData.voice_reminders_enabled ?? true,
        notifications_enabled: profileData.notifications_enabled ?? true,
        notification_settings: {
          doseReminders: true,
          missedDoseAlerts: true,
          refillWarnings: true,
          orderNotifications: true,
          emailEnabled: false,
        },
        age: profileData.age,
        phone: profileData.phone,
      })
      .select()
      .single();

    if (error) {
      throw new AuthError(
        `Failed to create profile: ${error.message}`,
        AUTH_ERROR_CODES.PROFILE_CREATE_FAILED,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError(
      'Failed to create profile with service role',
      AUTH_ERROR_CODES.PROFILE_CREATE_FAILED,
      error
    );
  }
}

/**
 * Delete profile using service role (for cleanup in tests)
 * 
 * @param userId - The user ID to delete
 */
export async function deleteProfileWithServiceRole(userId: string): Promise<void> {
  if (!supabaseAdmin) {
    throw new AuthError(
      'Service role not configured',
      AUTH_ERROR_CODES.UNKNOWN_ERROR
    );
  }

  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new AuthError(
        `Failed to delete profile: ${error.message}`,
        AUTH_ERROR_CODES.UNKNOWN_ERROR,
        error
      );
    }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError(
      'Failed to delete profile with service role',
      AUTH_ERROR_CODES.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Get profile using service role (bypasses RLS)
 * Useful for admin operations or testing
 * 
 * @param userId - The user ID
 * @returns The profile data
 */
export async function getProfileWithServiceRole(userId: string): Promise<any> {
  if (!supabaseAdmin) {
    throw new AuthError(
      'Service role not configured',
      AUTH_ERROR_CODES.UNKNOWN_ERROR
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new AuthError(
        `Failed to get profile: ${error.message}`,
        AUTH_ERROR_CODES.PROFILE_NOT_FOUND,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError(
      'Failed to get profile with service role',
      AUTH_ERROR_CODES.PROFILE_NOT_FOUND,
      error
    );
  }
}

/**
 * Warning: Only use service role operations when absolutely necessary
 * The database trigger should handle profile creation automatically
 * This is only a fallback mechanism
 */
export const SERVICE_ROLE_WARNING = 
  'Service role operations bypass all RLS policies. Use with extreme caution.';
