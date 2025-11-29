/**
 * Authentication Error Handling
 * 
 * Provides structured error handling for authentication operations
 * with user-friendly error messages and error codes for debugging.
 */

export type AuthErrorCode =
  | 'SIGNUP_FAILED'
  | 'SIGNIN_FAILED'
  | 'INVALID_CREDENTIALS'
  | 'PROFILE_NOT_FOUND'
  | 'PROFILE_CREATE_FAILED'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR'
  | 'RLS_VIOLATION'
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_EMAIL'
  | 'WEAK_PASSWORD'
  | 'EMAIL_NOT_CONFIRMED'
  | 'UNKNOWN_ERROR';

/**
 * Custom error class for authentication operations
 */
export class AuthError extends Error {
  public readonly code: AuthErrorCode;
  public readonly originalError?: unknown;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: AuthErrorCode,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.originalError = originalError;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }

  /**
   * Get user-friendly error message based on error code
   */
  getUserMessage(): string {
    switch (this.code) {
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password. Please try again.';
      
      case 'SIGNUP_FAILED':
        return 'Unable to create account. Please try again.';
      
      case 'DUPLICATE_EMAIL':
        return 'An account with this email already exists. Please sign in instead.';
      
      case 'WEAK_PASSWORD':
        return 'Password must be at least 6 characters long.';
      
      case 'EMAIL_NOT_CONFIRMED':
        return 'Please confirm your email address before signing in.';
      
      case 'PROFILE_NOT_FOUND':
        return 'Account setup incomplete. Please contact support.';
      
      case 'PROFILE_CREATE_FAILED':
        return 'Failed to create user profile. Please try again.';
      
      case 'SESSION_EXPIRED':
        return 'Your session has expired. Please sign in again.';
      
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection and try again.';
      
      case 'RLS_VIOLATION':
        return 'Permission denied. Please sign in again.';
      
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      
      case 'SIGNIN_FAILED':
        return 'Unable to sign in. Please try again.';
      
      case 'UNKNOWN_ERROR':
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    const retryableCodes: AuthErrorCode[] = [
      'NETWORK_ERROR',
      'PROFILE_NOT_FOUND', // Might be timing issue with trigger
      'UNKNOWN_ERROR',
    ];
    return retryableCodes.includes(this.code);
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Parse Supabase error into AuthError
 */
export function parseSupabaseError(error: any): AuthError {
  // Handle PostgreSQL errors
  if (error?.code) {
    // Unique violation (duplicate email)
    if (error.code === '23505') {
      return new AuthError(
        'Email already exists',
        'DUPLICATE_EMAIL',
        error
      );
    }
    
    // RLS policy violation
    if (error.code === '42501' || error.code === 'PGRST301') {
      return new AuthError(
        'Row level security policy violation',
        'RLS_VIOLATION',
        error
      );
    }
    
    // Check constraint violation
    if (error.code === '23514') {
      return new AuthError(
        'Validation failed',
        'VALIDATION_ERROR',
        error
      );
    }
  }

  // Handle Supabase Auth errors
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid login credentials') || 
        message.includes('invalid email or password')) {
      return new AuthError(
        'Invalid credentials',
        'INVALID_CREDENTIALS',
        error
      );
    }
    
    if (message.includes('email not confirmed')) {
      return new AuthError(
        'Email not confirmed',
        'EMAIL_NOT_CONFIRMED',
        error
      );
    }
    
    if (message.includes('user already registered')) {
      return new AuthError(
        'Email already registered',
        'DUPLICATE_EMAIL',
        error
      );
    }
    
    if (message.includes('password') && message.includes('short')) {
      return new AuthError(
        'Password too short',
        'WEAK_PASSWORD',
        error
      );
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return new AuthError(
        'Network error',
        'NETWORK_ERROR',
        error
      );
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AuthError(
      'Network request failed',
      'NETWORK_ERROR',
      error
    );
  }

  // Default unknown error
  return new AuthError(
    error?.message || 'Unknown error occurred',
    'UNKNOWN_ERROR',
    error
  );
}

/**
 * Error code constants for easy reference
 */
export const AUTH_ERROR_CODES = {
  SIGNUP_FAILED: 'SIGNUP_FAILED' as const,
  SIGNIN_FAILED: 'SIGNIN_FAILED' as const,
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS' as const,
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND' as const,
  PROFILE_CREATE_FAILED: 'PROFILE_CREATE_FAILED' as const,
  SESSION_EXPIRED: 'SESSION_EXPIRED' as const,
  NETWORK_ERROR: 'NETWORK_ERROR' as const,
  RLS_VIOLATION: 'RLS_VIOLATION' as const,
  VALIDATION_ERROR: 'VALIDATION_ERROR' as const,
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL' as const,
  WEAK_PASSWORD: 'WEAK_PASSWORD' as const,
  EMAIL_NOT_CONFIRMED: 'EMAIL_NOT_CONFIRMED' as const,
  UNKNOWN_ERROR: 'UNKNOWN_ERROR' as const,
} as const;
