# Design Document: Authentication and RLS Enhancement

## Overview

This design addresses the critical Row Level Security (RLS) policy violation that occurs during user signup in MedReminder Pro. The root cause is a chicken-and-egg problem: RLS policies require `auth.uid()` to match the profile `id` for INSERT operations, but the profile doesn't exist yet during signup. 

The solution involves three complementary approaches:
1. **Database Trigger Approach**: Automatic profile creation via PostgreSQL trigger when auth.users record is created
2. **Service Role Approach**: Using elevated permissions for initial profile creation
3. **Enhanced Auth Service**: Improved error handling, session management, and validation

## Architecture

### Current Flow (Problematic)
```
User Signup → Supabase Auth (creates auth.users) → App tries to INSERT profile → RLS blocks (no matching auth.uid()) → ERROR
```

### New Flow (Fixed)
```
User Signup → Supabase Auth (creates auth.users) → Database Trigger fires → Profile auto-created → App retrieves profile → SUCCESS
```

**Alternative Flow (Service Role)**:
```
User Signup → App uses Service Role client → Creates auth.users → Creates profile (bypasses RLS) → Switches to user session → SUCCESS
```

## Components and Interfaces

### 1. Database Trigger Function

**Purpose**: Automatically create profile when auth.users record is created

**Location**: `supabase/migrations/create_profile_trigger.sql`

**Interface**:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    notification_settings
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'PATIENT'),
    false,
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'PATIENT') = 'PATIENT' 
      THEN upper(substring(md5(random()::text) from 1 for 8))
      ELSE NULL
    END,
    true,
    true,
    '{"doseReminders": true, "missedDoseAlerts": true, "refillWarnings": true, "orderNotifications": true, "emailEnabled": false}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Key Features**:
- `SECURITY DEFINER`: Runs with creator's privileges, bypassing RLS
- Extracts metadata from `raw_user_meta_data` passed during signup
- Generates invite codes for patients
- Sets sensible defaults for all fields

### 2. Enhanced Auth Service

**Location**: `src/services/database/auth-service.ts`

**Interface**:
```typescript
interface EnhancedAuthService {
  // Core authentication
  signUp(data: SignUpData): Promise<AuthResult>;
  signIn(data: SignInData): Promise<AuthResult>;
  signOut(): Promise<void>;
  
  // Session management
  getSession(): Promise<Session | null>;
  refreshSession(): Promise<Session>;
  getCurrentUser(): Promise<User | null>;
  
  // Profile management
  getProfile(userId: string): Promise<User>;
  updateProfile(userId: string, updates: Partial<User>): Promise<User>;
  waitForProfile(userId: string, maxAttempts?: number): Promise<User>;
  
  // Password management
  resetPassword(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  
  // Event handling
  onAuthStateChange(callback: (user: User | null) => void): Subscription;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  role?: 'PATIENT' | 'CAREGIVER';
  age?: number;
  phone?: string;
  timezone?: string;
}

interface AuthResult {
  user: SupabaseUser;
  profile: User;
  session: Session;
}
```

**Key Methods**:

1. **signUp**: Enhanced with metadata passing and profile waiting
```typescript
async signUp(data: SignUpData): Promise<AuthResult> {
  // Create auth user with metadata for trigger
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        role: data.role || 'PATIENT',
        age: data.age,
        phone: data.phone,
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    }
  });

  if (authError) throw new AuthError(authError.message, 'SIGNUP_FAILED');
  if (!authData.user) throw new AuthError('No user returned', 'SIGNUP_FAILED');

  // Wait for trigger to create profile (with retry logic)
  const profile = await this.waitForProfile(authData.user.id);

  return {
    user: authData.user,
    profile,
    session: authData.session!,
  };
}
```

2. **waitForProfile**: Retry logic for profile creation
```typescript
async waitForProfile(userId: string, maxAttempts = 10): Promise<User> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const profile = await this.getProfile(userId);
      return profile;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new AuthError('Profile creation timeout', 'PROFILE_NOT_FOUND');
      }
      // Exponential backoff: 100ms, 200ms, 400ms, 800ms...
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
    }
  }
  throw new AuthError('Profile creation failed', 'PROFILE_NOT_FOUND');
}
```

3. **signIn**: Enhanced with profile retrieval
```typescript
async signIn(data: SignInData): Promise<AuthResult> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (authError) {
    if (authError.message.includes('Invalid')) {
      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }
    throw new AuthError(authError.message, 'SIGNIN_FAILED');
  }

  if (!authData.user || !authData.session) {
    throw new AuthError('Authentication failed', 'SIGNIN_FAILED');
  }

  const profile = await this.getProfile(authData.user.id);

  return {
    user: authData.user,
    profile,
    session: authData.session,
  };
}
```

### 3. Custom Error Classes

**Location**: `src/services/database/auth-errors.ts`

```typescript
export type AuthErrorCode =
  | 'SIGNUP_FAILED'
  | 'SIGNIN_FAILED'
  | 'INVALID_CREDENTIALS'
  | 'PROFILE_NOT_FOUND'
  | 'PROFILE_CREATE_FAILED'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR'
  | 'RLS_VIOLATION'
  | 'VALIDATION_ERROR';

export class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AuthError';
  }

  getUserMessage(): string {
    switch (this.code) {
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password. Please try again.';
      case 'SIGNUP_FAILED':
        return 'Unable to create account. Please try again.';
      case 'PROFILE_NOT_FOUND':
        return 'Account setup incomplete. Please contact support.';
      case 'SESSION_EXPIRED':
        return 'Your session has expired. Please sign in again.';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection.';
      case 'RLS_VIOLATION':
        return 'Permission denied. Please sign in again.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}
```

### 4. Service Role Client (Fallback)

**Location**: `src/lib/supabase-admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Only use for profile creation during signup
export async function createProfileWithServiceRole(userId: string, profileData: any) {
  if (!supabaseAdmin) {
    throw new Error('Service role not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      ...profileData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

## Data Models

### Profile Table (Enhanced)

```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('PATIENT', 'CAREGIVER')),
    elderly_mode BOOLEAN DEFAULT false,
    timezone TEXT DEFAULT 'UTC',
    caregiver_invite_code TEXT UNIQUE,
    voice_reminders_enabled BOOLEAN DEFAULT true,
    notifications_enabled BOOLEAN DEFAULT true,
    notification_settings JSONB DEFAULT '{
        "doseReminders": true,
        "missedDoseAlerts": true,
        "refillWarnings": true,
        "orderNotifications": true,
        "emailEnabled": false
    }'::jsonb,
    age INTEGER CHECK (age >= 0 AND age <= 150),
    phone TEXT,
    address TEXT,
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$')
);
```

### Session State

```typescript
interface SessionState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}
```

## 
## C
orrectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Profile Creation Atomicity
*For any* valid signup data, when a user account is created, a corresponding profile MUST be created in the same transaction, ensuring both exist or neither exists.
**Validates: Requirements 1.1, 1.4**

### Property 2: RLS Bypass for Profile Creation
*For any* new user signup, the profile creation operation MUST bypass RLS policies through either database trigger with SECURITY DEFINER or service role credentials.
**Validates: Requirements 1.2, 2.2**

### Property 3: Profile Data Completeness
*For any* created profile, all required fields (id, name, email, role) MUST be populated with valid values before the signup operation completes.
**Validates: Requirements 1.3, 2.1**

### Property 4: Email Uniqueness
*For any* two user accounts, their email addresses MUST be unique, preventing duplicate account creation.
**Validates: Requirements 1.5, 8.1**

### Property 5: Session Persistence
*For any* authenticated user, when the application reloads, the session MUST be restored from stored tokens if they are still valid.
**Validates: Requirements 7.1, 7.2**

### Property 6: Auth State Consistency
*For any* user session, the auth.uid() value MUST always match the profile.id value, ensuring RLS policies work correctly.
**Validates: Requirements 4.2, 3.1**

### Property 7: Error Message Clarity
*For any* authentication error, the system MUST provide a user-friendly error message that explains the issue without exposing sensitive system details.
**Validates: Requirements 6.1, 6.2, 6.3**

### Property 8: Invite Code Uniqueness
*For any* patient profile, if a caregiver invite code is generated, it MUST be unique across all profiles.
**Validates: Requirements 2.3**

### Property 9: Password Complexity
*For any* password submission, the system MUST enforce minimum complexity requirements (minimum 6 characters) before account creation.
**Validates: Requirements 8.2**

### Property 10: Profile Retrieval Idempotency
*For any* user ID, calling getProfile multiple times MUST return the same profile data (assuming no updates occurred between calls).
**Validates: Requirements 3.1**

## Error Handling

### Error Categories

1. **Authentication Errors**
   - Invalid credentials
   - Account already exists
   - Email not confirmed
   - Password too weak

2. **RLS Errors**
   - Permission denied
   - Row not found
   - Policy violation

3. **Network Errors**
   - Connection timeout
   - Server unavailable
   - Request failed

4. **Validation Errors**
   - Invalid email format
   - Invalid phone format
   - Age out of range
   - Missing required fields

### Error Handling Strategy

```typescript
// Centralized error handler
function handleAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  if (error instanceof PostgrestError) {
    if (error.code === '42501') {
      return new AuthError('Permission denied', 'RLS_VIOLATION', error);
    }
    if (error.code === '23505') {
      return new AuthError('Account already exists', 'SIGNUP_FAILED', error);
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('network')) {
      return new AuthError('Network error', 'NETWORK_ERROR', error);
    }
  }

  return new AuthError('Unknown error occurred', 'SIGNIN_FAILED', error);
}
```

### Retry Logic

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  backoffMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      // Don't retry on validation errors
      if (error instanceof AuthError && error.code === 'VALIDATION_ERROR') {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, backoffMs * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error('Retry failed');
}
```

## Testing Strategy

### Unit Testing

**Framework**: Vitest with jsdom

**Test Files**:
- `src/services/database/auth-service.test.ts`
- `src/services/database/auth-errors.test.ts`
- `src/lib/supabase-admin.test.ts`

**Key Test Cases**:

1. **Profile Creation**
   - Test successful signup with trigger
   - Test profile creation with service role fallback
   - Test concurrent signup attempts
   - Test profile creation timeout

2. **Authentication Flow**
   - Test successful signin
   - Test invalid credentials
   - Test session restoration
   - Test token refresh

3. **Error Handling**
   - Test RLS violation handling
   - Test network error recovery
   - Test validation error messages
   - Test error code mapping

4. **Session Management**
   - Test session persistence
   - Test session expiration
   - Test multi-tab synchronization
   - Test logout cleanup

### Property-Based Testing

**Framework**: fast-check

**Library**: fast-check (already installed)

**Configuration**: Minimum 100 iterations per property test

**Test Files**:
- `src/services/database/auth-service.pbt.test.ts`

**Property Tests**:

1. **Property Test 1: Profile Creation Atomicity**
```typescript
/**
 * Feature: auth-rls-enhancement, Property 1: Profile Creation Atomicity
 * Validates: Requirements 1.1, 1.4
 */
it('profile creation is atomic - both user and profile exist or neither exists', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        email: fc.emailAddress(),
        password: fc.string({ minLength: 6, maxLength: 20 }),
        name: fc.string({ minLength: 1, maxLength: 100 }),
        role: fc.constantFrom('PATIENT', 'CAREGIVER'),
      }),
      async (signupData) => {
        try {
          const result = await authService.signUp(signupData);
          
          // Both should exist
          expect(result.user).toBeDefined();
          expect(result.profile).toBeDefined();
          expect(result.profile.id).toBe(result.user.id);
          
          // Cleanup
          await authService.signOut();
        } catch (error) {
          // If signup fails, neither should exist
          const userExists = await checkUserExists(signupData.email);
          const profileExists = await checkProfileExists(signupData.email);
          
          expect(userExists).toBe(false);
          expect(profileExists).toBe(false);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

2. **Property Test 2: Email Uniqueness**
```typescript
/**
 * Feature: auth-rls-enhancement, Property 4: Email Uniqueness
 * Validates: Requirements 1.5, 8.1
 */
it('email addresses are unique across all users', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.array(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6 }),
          name: fc.string({ minLength: 1 }),
        }),
        { minLength: 2, maxLength: 5 }
      ),
      async (users) => {
        const createdEmails = new Set<string>();
        
        for (const userData of users) {
          try {
            await authService.signUp(userData);
            createdEmails.add(userData.email);
          } catch (error) {
            // If email already exists, should fail
            if (createdEmails.has(userData.email)) {
              expect(error).toBeInstanceOf(AuthError);
              expect((error as AuthError).code).toBe('SIGNUP_FAILED');
            }
          }
        }
        
        // All created emails should be unique
        const profiles = await getAllProfiles();
        const profileEmails = profiles.map(p => p.email);
        expect(new Set(profileEmails).size).toBe(profileEmails.length);
      }
    ),
    { numRuns: 100 }
  );
});
```

3. **Property Test 3: Session Persistence**
```typescript
/**
 * Feature: auth-rls-enhancement, Property 5: Session Persistence
 * Validates: Requirements 7.1, 7.2
 */
it('sessions persist across application reloads', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        email: fc.emailAddress(),
        password: fc.string({ minLength: 6 }),
        name: fc.string({ minLength: 1 }),
      }),
      async (userData) => {
        // Create and sign in
        await authService.signUp(userData);
        const { session: originalSession } = await authService.signIn({
          email: userData.email,
          password: userData.password,
        });
        
        // Simulate app reload
        const restoredSession = await authService.getSession();
        
        expect(restoredSession).toBeDefined();
        expect(restoredSession?.user.id).toBe(originalSession.user.id);
        expect(restoredSession?.access_token).toBe(originalSession.access_token);
        
        await authService.signOut();
      }
    ),
    { numRuns: 100 }
  );
});
```

4. **Property Test 4: Auth State Consistency**
```typescript
/**
 * Feature: auth-rls-enhancement, Property 6: Auth State Consistency
 * Validates: Requirements 4.2, 3.1
 */
it('auth.uid() always matches profile.id', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        email: fc.emailAddress(),
        password: fc.string({ minLength: 6 }),
        name: fc.string({ minLength: 1 }),
      }),
      async (userData) => {
        const { user, profile } = await authService.signUp(userData);
        
        expect(user.id).toBe(profile.id);
        
        // Verify through database query
        const { data: authUser } = await supabase.auth.getUser();
        expect(authUser.user?.id).toBe(profile.id);
        
        await authService.signOut();
      }
    ),
    { numRuns: 100 }
  );
});
```

5. **Property Test 5: Invite Code Uniqueness**
```typescript
/**
 * Feature: auth-rls-enhancement, Property 8: Invite Code Uniqueness
 * Validates: Requirements 2.3
 */
it('caregiver invite codes are unique for all patients', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.array(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6 }),
          name: fc.string({ minLength: 1 }),
          role: fc.constant('PATIENT'),
        }),
        { minLength: 2, maxLength: 10 }
      ),
      async (patients) => {
        const inviteCodes = new Set<string>();
        
        for (const patientData of patients) {
          try {
            const { profile } = await authService.signUp(patientData);
            
            if (profile.caregiverInviteCode) {
              expect(inviteCodes.has(profile.caregiverInviteCode)).toBe(false);
              inviteCodes.add(profile.caregiverInviteCode);
            }
          } catch (error) {
            // Ignore duplicate email errors
          }
        }
        
        // Verify uniqueness in database
        const { data: profiles } = await supabase
          .from('profiles')
          .select('caregiver_invite_code')
          .not('caregiver_invite_code', 'is', null);
        
        const codes = profiles?.map(p => p.caregiver_invite_code) || [];
        expect(new Set(codes).size).toBe(codes.length);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

**Test Scenarios**:

1. **End-to-End Signup Flow**
   - User fills signup form
   - Submits with valid data
   - Profile created automatically
   - User redirected to dashboard
   - Session persists on refresh

2. **RLS Policy Verification**
   - User A cannot access User B's data
   - Caregiver can access linked patient data
   - Service role can create profiles
   - Regular users cannot bypass RLS

3. **Error Recovery**
   - Network failure during signup
   - Database timeout during profile creation
   - Concurrent signup attempts
   - Invalid data submission

## Security Considerations

### 1. Service Role Key Protection

- Store service role key in environment variables only
- Never expose in client-side code
- Use only for profile creation during signup
- Implement rate limiting on service role operations

### 2. RLS Policy Enforcement

- All tables must have RLS enabled
- Policies must check `auth.uid()` for ownership
- Caregiver access requires explicit link verification
- Admin operations require service role

### 3. Session Security

- Use httpOnly cookies for token storage
- Implement CSRF protection
- Rotate tokens on privilege escalation
- Clear all session data on logout

### 4. Data Validation

- Validate all inputs on client and server
- Sanitize user-provided data
- Enforce constraints at database level
- Use parameterized queries to prevent SQL injection

## Performance Optimization

### 1. Database Indexes

```sql
-- Already exist, but verify
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_invite_code ON public.profiles(caregiver_invite_code);
```

### 2. Query Optimization

- Use `.single()` for single-row queries
- Select only needed columns
- Use `.select('*')` sparingly
- Implement pagination for large result sets

### 3. Caching Strategy

- Cache user profile in memory after signin
- Invalidate cache on profile updates
- Use Supabase realtime for cache invalidation
- Implement stale-while-revalidate pattern

### 4. Connection Pooling

- Supabase handles connection pooling automatically
- Configure appropriate pool size in Supabase dashboard
- Monitor connection usage in production

## Migration Strategy

### Phase 1: Database Changes

1. Create trigger function for profile creation
2. Test trigger with new signups
3. Verify existing users unaffected
4. Monitor for errors

### Phase 2: Code Updates

1. Update auth-service.ts with enhanced methods
2. Add error handling classes
3. Update Login/Signup components
4. Add loading states and error displays

### Phase 3: Testing

1. Run unit tests
2. Run property-based tests
3. Perform manual testing
4. Test with existing accounts

### Phase 4: Deployment

1. Deploy database migration
2. Deploy code changes
3. Monitor error logs
4. Verify signup flow works
5. Test with real users

## Monitoring and Logging

### Metrics to Track

- Signup success rate
- Profile creation latency
- RLS policy violation count
- Session restoration success rate
- Error frequency by type

### Logging Strategy

```typescript
// Log authentication events
logger.info('User signup initiated', { email: data.email });
logger.info('Profile created', { userId: user.id, role: profile.role });
logger.error('Signup failed', { error: error.code, email: data.email });

// Log RLS violations
logger.warn('RLS violation detected', { 
  userId: auth.uid(), 
  table: 'profiles', 
  operation: 'INSERT' 
});
```

### Alerting

- Alert on high RLS violation rate
- Alert on profile creation failures
- Alert on session restoration failures
- Alert on unusual signup patterns

## Rollback Plan

If issues occur after deployment:

1. **Immediate**: Disable new signups via feature flag
2. **Short-term**: Revert code changes, keep database trigger
3. **Long-term**: Investigate root cause, fix, and redeploy

The database trigger is safe to keep as it only affects new users and doesn't impact existing functionality.
