# Implementation Plan

- [x] 1. Create database trigger for automatic profile creation


  - Create SQL migration file with trigger function
  - Use SECURITY DEFINER to bypass RLS
  - Extract user metadata from auth.users.raw_user_meta_data
  - Generate unique invite codes for patients
  - Set sensible defaults for all profile fields
  - _Requirements: 1.1, 1.2, 5.1, 5.2, 5.4_



- [ ] 2. Create custom error handling classes
  - Define AuthErrorCode type with all error categories
  - Implement AuthError class with code and user message mapping
  - Add getUserMessage() method for user-friendly error messages

  - Add error code constants for consistency
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 3. Enhance auth service with improved signup flow
  - Update signUp method to pass metadata in options.data
  - Implement waitForProfile method with exponential backoff retry
  - Add proper error handling with AuthError classes
  - Return complete AuthResult with user, profile, and session
  - Handle duplicate email errors gracefully
  - _Requirements: 1.1, 1.3, 1.5, 2.1_

- [ ] 3.1 Write property test for profile creation atomicity
  - **Property 1: Profile Creation Atomicity**
  - **Validates: Requirements 1.1, 1.4**

- [ ] 3.2 Write property test for email uniqueness
  - **Property 4: Email Uniqueness**
  - **Validates: Requirements 1.5, 8.1**

- [ ] 4. Enhance auth service signin and session management
  - Update signIn method with better error handling
  - Distinguish between invalid credentials and system errors
  - Implement getSession with proper error handling
  - Add refreshSession method for token refresh
  - Implement getCurrentUser with profile retrieval
  - _Requirements: 3.1, 3.2, 3.3, 7.1, 7.2_

- [ ] 4.1 Write property test for session persistence
  - **Property 5: Session Persistence**
  - **Validates: Requirements 7.1, 7.2**

- [ ] 4.2 Write property test for auth state consistency
  - **Property 6: Auth State Consistency**
  - **Validates: Requirements 4.2, 3.1**

- [ ] 5. Add profile management methods to auth service
  - Implement getProfile with proper error handling
  - Add updateProfile with validation
  - Implement proper type mapping between database and app types
  - Add validation for profile data before updates
  - _Requirements: 2.1, 8.1, 8.2, 8.3, 8.4, 8.5_



- [ ] 5.1 Write property test for profile retrieval idempotency
  - **Property 10: Profile Retrieval Idempotency**
  - **Validates: Requirements 3.1**

- [ ] 6. Create service role client for fallback profile creation
  - Create supabase-admin.ts with service role client
  - Implement createProfileWithServiceRole function
  - Add proper error handling and validation

  - Document when to use service role vs trigger
  - Add environment variable checks
  - _Requirements: 1.2, 2.2, 2.3_

- [ ] 7. Add retry logic utility function
  - Create withRetry helper function with exponential backoff


  - Configure max attempts and backoff timing
  - Skip retry for validation errors
  - Add proper error propagation
  - _Requirements: 3.4, 6.4_

- [-] 8. Update Login component with enhanced error handling

  - Use enhanced authService.signIn method
  - Display user-friendly error messages from AuthError
  - Add loading states during authentication
  - Handle network errors with retry option
  - Show specific messages for different error types
  - _Requirements: 3.1, 3.2, 6.1, 6.2, 6.3_

- [ ] 9. Update Signup component with enhanced flow
  - Pass all user data in signUp call
  - Add timezone detection and passing


  - Display loading state during profile creation
  - Handle errors with user-friendly messages
  - Show success message on completion
  - Add validation before submission
  - _Requirements: 1.1, 1.3, 1.5, 8.1, 8.2, 8.3, 8.4, 8.5_



- [ ] 9.1 Write property test for invite code uniqueness
  - **Property 8: Invite Code Uniqueness**
  - **Validates: Requirements 2.3**

- [x] 10. Add database constraints for data validation


  - Add email format validation constraint
  - Add phone format validation constraint
  - Add age range constraint (0-150)
  - Add unique constraint on email
  - Add check constraints for role values
  - _Requirements: 8.1, 8.3, 8.4, 8.5_



- [ ] 11. Update RLS policies for optimal performance
  - Verify all policies use indexed columns
  - Add indexes on frequently queried columns
  - Test policy performance with EXPLAIN ANALYZE
  - Document policy behavior for each table


  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 12. Implement session persistence in app
  - Add session restoration on app load
  - Implement token refresh before expiration
  - Handle session expiration gracefully
  - Add multi-tab session synchronization
  - Clear session data on logout
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 13. Add comprehensive error logging
  - Log all authentication events (signup, signin, signout)
  - Log RLS violations with context
  - Log profile creation success/failure
  - Add structured logging with user context
  - Ensure no sensitive data in logs
  - _Requirements: 4.5, 6.5_

- [ ] 14. Create migration script for database changes
  - Create SQL file with all schema changes
  - Include trigger creation
  - Add new constraints
  - Add new indexes
  - Include rollback instructions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Write unit tests for auth service
  - Test signUp with valid data
  - Test signUp with duplicate email
  - Test signIn with valid credentials
  - Test signIn with invalid credentials
  - Test waitForProfile retry logic
  - Test session management methods
  - Test profile retrieval and updates
  - _Requirements: All_

- [ ] 17. Write unit tests for error handling
  - Test AuthError class instantiation
  - Test getUserMessage for all error codes



  - Test error code mapping from Supabase errors
  - Test error handling in auth service methods
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 18. Write integration tests for signup flow
  - Test complete signup flow end-to-end
  - Test profile creation via trigger
  - Test RLS policy enforcement
  - Test concurrent signup attempts
  - Test error recovery scenarios
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 19. Write integration tests for session management
  - Test session persistence across reloads
  - Test token refresh
  - Test session expiration handling
  - Test multi-tab synchronization
  - Test logout cleanup
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 20. Update documentation
  - Document new authentication flow
  - Add troubleshooting guide for RLS issues
  - Document error codes and meanings
  - Add setup instructions for service role
  - Create migration guide for existing users
  - _Requirements: All_

- [ ] 21. Final checkpoint - Verify all functionality
  - Ensure all tests pass, ask the user if questions arise.
