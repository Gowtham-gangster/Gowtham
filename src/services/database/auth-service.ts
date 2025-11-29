import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import { AuthError, parseSupabaseError, AUTH_ERROR_CODES } from './auth-errors';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { logAuthEvent, logAuthError, logProfileEvent, logSessionEvent, logRLSViolation } from '@/lib/logger';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role?: 'PATIENT' | 'CAREGIVER';
  age?: number;
  phone?: string;
  timezone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: SupabaseUser;
  profile: User;
  session: Session;
}

class AuthService {
  /**
   * Sign up a new user with enhanced error handling and automatic profile creation
   */
  async signUp(data: SignUpData): Promise<AuthResult> {
    const startTime = Date.now();
    
    try {
      const { email, password, name, role = 'PATIENT', age, phone, timezone } = data;

      logAuthEvent('Signup initiated', { email, role });

      // Validate input
      if (!email || !password || !name) {
        throw new AuthError(
          'Email, password, and name are required',
          AUTH_ERROR_CODES.VALIDATION_ERROR
        );
      }

      if (password.length < 6) {
        throw new AuthError(
          'Password must be at least 6 characters',
          AUTH_ERROR_CODES.WEAK_PASSWORD
        );
      }

      // Detect timezone if not provided
      const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Create auth user with metadata for trigger
      // The database trigger will automatically create the profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            age,
            phone,
            timezone: userTimezone,
            elderly_mode: false,
            voice_reminders_enabled: true,
            notifications_enabled: true,
          },
        },
      });

      if (authError) {
        logAuthError('Signup failed', authError, { email });
        throw parseSupabaseError(authError);
      }

      if (!authData.user) {
        logAuthError('Signup failed - no user returned', null, { email });
        throw new AuthError(
          'No user returned from signup',
          AUTH_ERROR_CODES.SIGNUP_FAILED
        );
      }

      logAuthEvent('Auth user created', { userId: authData.user.id, email });

      // Create profile using the SECURITY DEFINER function
      const { data: profileData, error: profileError } = await supabase.rpc('create_profile_for_user', {
        user_id: authData.user.id,
        user_name: name,
        user_email: email,
        user_role: role,
        user_age: age || null,
        user_phone: phone || null,
        user_timezone: userTimezone,
      });

      if (profileError) {
        logAuthError('Profile creation failed', profileError, { userId: authData.user.id });
        throw parseSupabaseError(profileError);
      }

      if (!profileData) {
        throw new AuthError(
          'Profile creation failed',
          AUTH_ERROR_CODES.PROFILE_CREATE_FAILED
        );
      }

      const profile = this.mapProfileToUser(profileData);

      const duration = Date.now() - startTime;
      logAuthEvent('Signup completed', { userId: authData.user.id, role, duration });

      // If no session (email confirmation required), return with null session
      if (!authData.session) {
        logAuthEvent('Email confirmation required', { userId: authData.user.id });
        return {
          user: authData.user,
          profile,
          session: null as any, // Will be null until email is confirmed
        };
      }

      return {
        user: authData.user,
        profile,
        session: authData.session,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logAuthError('Signup error', error, { email: data.email, duration });
      
      if (error instanceof AuthError) {
        throw error;
      }
      throw parseSupabaseError(error);
    }
  }

  /**
   * Wait for profile to be created by database trigger
   * Uses exponential backoff retry logic
   */
  private async waitForProfile(userId: string, maxAttempts = 10): Promise<User> {
    logProfileEvent('Waiting for profile creation', { userId });
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const profile = await this.getProfile(userId);
        logProfileEvent('Profile found', { userId, attempt });
        return profile;
      } catch (error) {
        if (attempt === maxAttempts) {
          logAuthError('Profile creation timeout', error, { userId, attempts: maxAttempts });
          throw new AuthError(
            'Profile creation timeout - please contact support',
            AUTH_ERROR_CODES.PROFILE_NOT_FOUND,
            error
          );
        }
        
        // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms...
        const delay = 100 * Math.pow(2, attempt - 1);
        logProfileEvent('Profile not found, retrying', { userId, attempt, delay });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    logAuthError('Profile creation failed', null, { userId });
    throw new AuthError(
      'Profile creation failed',
      AUTH_ERROR_CODES.PROFILE_CREATE_FAILED
    );
  }

  /**
   * Sign in existing user with enhanced error handling
   */
  async signIn(data: SignInData): Promise<AuthResult> {
    const startTime = Date.now();
    
    try {
      const { email, password } = data;

      logAuthEvent('Signin initiated', { email });

      // Validate input
      if (!email || !password) {
        throw new AuthError(
          'Email and password are required',
          AUTH_ERROR_CODES.VALIDATION_ERROR
        );
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        logAuthError('Signin failed', authError, { email });
        throw parseSupabaseError(authError);
      }

      if (!authData.user || !authData.session) {
        logAuthError('Signin failed - no user or session', null, { email });
        throw new AuthError(
          'Authentication failed',
          AUTH_ERROR_CODES.SIGNIN_FAILED
        );
      }

      // Get profile
      const profile = await this.getProfile(authData.user.id);

      const duration = Date.now() - startTime;
      logAuthEvent('Signin completed', { userId: authData.user.id, duration });

      return {
        user: authData.user,
        profile,
        session: authData.session,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logAuthError('Signin error', error, { email: data.email, duration });
      
      if (error instanceof AuthError) {
        throw error;
      }
      throw parseSupabaseError(error);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      logAuthEvent('Signout initiated');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        logAuthError('Signout failed', error);
        throw parseSupabaseError(error);
      }
      
      logAuthEvent('Signout completed');
    } catch (error) {
      logAuthError('Signout error', error);
      
      if (error instanceof AuthError) {
        throw error;
      }
      throw parseSupabaseError(error);
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logSessionEvent('Get session failed', { error: error.message });
        throw parseSupabaseError(error);
      }
      
      if (session) {
        logSessionEvent('Session retrieved', { userId: session.user.id });
      } else {
        logSessionEvent('No active session');
      }
      
      return session;
    } catch (error) {
      logAuthError('Get session error', error);
      
      if (error instanceof AuthError) {
        throw error;
      }
      throw parseSupabaseError(error);
    }
  }

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<Session> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        throw parseSupabaseError(error);
      }
      if (!session) {
        throw new AuthError(
          'Session expired',
          AUTH_ERROR_CODES.SESSION_EXPIRED
        );
      }
      return session;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw parseSupabaseError(error);
    }
  }

  /**
   * Get current user with profile
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        throw parseSupabaseError(error);
      }
      if (!user) return null;

      const profile = await this.getProfile(user.id);
      return profile;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw parseSupabaseError(error);
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Check if it's an RLS violation
        if (error.code === '42501' || error.code === 'PGRST301') {
          logRLSViolation('profiles', 'SELECT', { userId });
        }
        
        logAuthError('Get profile failed', error, { userId });
        throw parseSupabaseError(error);
      }

      if (!data) {
        logProfileEvent('Profile not found', { userId });
        throw new AuthError(
          'Profile not found',
          AUTH_ERROR_CODES.PROFILE_NOT_FOUND
        );
      }

      logProfileEvent('Profile retrieved', { userId });
      return this.mapProfileToUser(data);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw parseSupabaseError(error);
    }
  }

  /**
   * Update user profile with validation
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Validate updates
      if (updates.age !== undefined && (updates.age < 0 || updates.age > 150)) {
        throw new AuthError(
          'Age must be between 0 and 150',
          AUTH_ERROR_CODES.VALIDATION_ERROR
        );
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          elderly_mode: updates.elderlyMode,
          voice_reminders_enabled: updates.voiceRemindersEnabled,
          notifications_enabled: updates.notificationsEnabled,
          notification_settings: updates.notificationSettings,
          age: updates.age,
          phone: updates.phone,
          address: updates.address,
          emergency_contact: updates.emergencyContact,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw parseSupabaseError(error);
      }

      if (!data) {
        throw new AuthError(
          'Profile not found',
          AUTH_ERROR_CODES.PROFILE_NOT_FOUND
        );
      }

      return this.mapProfileToUser(data);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw parseSupabaseError(error);
    }
  }

  /**
   * Reset password via email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      if (!email) {
        throw new AuthError(
          'Email is required',
          AUTH_ERROR_CODES.VALIDATION_ERROR
        );
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw parseSupabaseError(error);
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw parseSupabaseError(error);
    }
  }

  /**
   * Update password for current user
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new AuthError(
          'Password must be at least 6 characters',
          AUTH_ERROR_CODES.WEAK_PASSWORD
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        throw parseSupabaseError(error);
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw parseSupabaseError(error);
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const profile = await this.getProfile(session.user.id);
          callback(profile);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        callback(null);
      }
    });
  }

  /**
   * Retry operation with exponential backoff
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts = 3,
    backoffMs = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }

        // Don't retry validation errors
        if (error instanceof AuthError && error.code === AUTH_ERROR_CODES.VALIDATION_ERROR) {
          throw error;
        }

        // Don't retry invalid credentials
        if (error instanceof AuthError && error.code === AUTH_ERROR_CODES.INVALID_CREDENTIALS) {
          throw error;
        }

        // Exponential backoff
        const delay = backoffMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new AuthError(
      'Operation failed after retries',
      AUTH_ERROR_CODES.UNKNOWN_ERROR
    );
  }

  /**
   * Map Supabase profile to app User type
   */
  private mapProfileToUser(profile: any): User {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      elderlyMode: profile.elderly_mode,
      timezone: profile.timezone,
      caregiverInviteCode: profile.caregiver_invite_code,
      voiceRemindersEnabled: profile.voice_reminders_enabled,
      notificationsEnabled: profile.notifications_enabled,
      notificationSettings: profile.notification_settings,
      age: profile.age,
      phone: profile.phone,
      address: profile.address,
      emergencyContact: profile.emergency_contact,
      createdAt: profile.created_at,
    };
  }
}

export const authService = new AuthService();
