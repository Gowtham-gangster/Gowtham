# Implementation Plan

- [x] 1. Set up MySQL database and backend project structure
  - Create MySQL database using MySQL Workbench
  - Initialize Node.js backend project in `server/` directory
  - Install required dependencies (express, mysql2, jsonwebtoken, bcrypt, cors, dotenv, express-validator)
  - Create directory structure for routes, controllers, models, middleware, and config
  - Set up environment configuration files (.env, .env.example)
  - _Requirements: 2.1, 3.1, 8.1, 8.5_

- [x] 2. Create MySQL database schema
  - Write SQL migration script to create all tables (profiles, medicines, schedules, dose_logs, disease_profiles, prescriptions, notifications, caregiver_links, orders)
  - Define foreign key constraints between related tables
  - Create indexes on frequently queried columns
  - Execute migration script in MySQL Workbench
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 Write property test for foreign key constraints


  - **Property 1: Foreign key constraint enforcement**
  - **Validates: Requirements 2.2**

- [x] 3. Implement database connection module
  - Create database configuration module with connection pooling
  - Implement connection initialization with retry logic
  - Add connection health check functionality
  - Configure pool settings (min/max connections, queue limits)
  - _Requirements: 3.2, 9.1, 9.3, 9.4, 9.5_

- [x] 3.1 Write property test for connection retry logic






  - **Property 2: Connection retry with exponential backoff**
  - **Validates: Requirements 3.3**

- [x]* 3.2 Write property test for connection pool stability



  - **Property 16: Connection pool stability**
  - **Validates: Requirements 9.3**

- [x] 4. Implement Express server core
  - Create Express application with middleware setup
  - Configure CORS for frontend origin
  - Add JSON body parser middleware
  - Implement centralized error handling middleware
  - Set up server to listen on configurable port
  - _Requirements: 3.1, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4_

- [ ]* 4.1 Write property test for JSON body parsing
  - **Property 3: JSON body parsing**
  - **Validates: Requirements 3.4**

- [ ]* 4.2 Write property test for CORS headers
  - **Property 4: CORS headers on all responses**
  - **Validates: Requirements 3.5**

- [ ]* 4.3 Write property test for database error handling
  - **Property 11: Database error handling**
  - **Validates: Requirements 7.1**

- [ ]* 4.4 Write property test for resource not found handling
  - **Property 12: Resource not found handling**
  - **Validates: Requirements 7.2**

- [ ]* 4.5 Write property test for validation error responses
  - **Property 13: Validation error responses**
  - **Validates: Requirements 7.3**

- [ ]* 4.6 Write property test for unauthorized access prevention
  - **Property 14: Unauthorized access prevention**
  - **Validates: Requirements 7.4**

- [x] 5. Implement authentication system


  - Create authentication middleware for JWT validation
  - Implement password hashing with bcrypt
  - Create JWT token generation and verification functions
  - Implement authentication route handlers (signup, login, logout, me)
  - Wire authentication routes into Express server
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 5.1 Write property test for JWT token generation
  - **Property 5: JWT token generation**
  - **Validates: Requirements 4.1**

- [ ]* 5.2 Write property test for protected endpoint authentication
  - **Property 6: Protected endpoint authentication**
  - **Validates: Requirements 4.2**

- [ ]* 5.3 Write property test for invalid token rejection
  - **Property 7: Invalid token rejection**
  - **Validates: Requirements 4.3**

- [ ]* 5.4 Write property test for user context attachment
  - **Property 8: User context attachment**
  - **Validates: Requirements 4.4**

- [x] 6. Implement medicines API



  - Create medicine repository with database queries
  - Implement medicine controller with business logic
  - Create medicine routes (GET, POST, PUT, DELETE)
  - Add request validation for medicine endpoints
  - Wire medicine routes into Express server
  - _Requirements: 5.1, 10.1_

- [x] 7. Implement schedules API


  - Create schedule repository with database queries
  - Implement schedule controller with business logic
  - Create schedule routes (GET, POST, PUT, DELETE)
  - Add request validation for schedule endpoints
  - Wire schedule routes into Express server
  - _Requirements: 5.2, 10.2_

- [x] 8. Implement dose logs API


  - Create dose log repository with database queries
  - Implement dose log controller with business logic
  - Create dose log routes (GET, POST, PUT, DELETE)
  - Add request validation for dose log endpoints
  - Wire dose log routes into Express server
  - _Requirements: 5.3_

- [x] 9. Implement disease profiles API

  - Create disease profile repository with database queries
  - Implement disease profile controller with business logic
  - Create disease profile routes (GET, POST, PUT, DELETE)
  - Add request validation for disease profile endpoints
  - Wire disease profile routes into Express server
  - _Requirements: 5.4_

- [x] 10. Implement prescriptions API

  - Create prescription repository with database queries
  - Implement prescription controller with business logic
  - Create prescription routes (GET, POST, PUT, DELETE)
  - Add request validation for prescription endpoints
  - Wire prescription routes into Express server
  - _Requirements: 5.5_

- [x] 11. Implement orders API

  - Create order repository with database queries
  - Implement order controller with business logic
  - Create order routes (GET, POST, PUT, DELETE)
  - Add request validation for order endpoints
  - Wire order routes into Express server
  - _Requirements: 5.6_

- [x] 12. Implement notifications API

  - Create notification repository with database queries
  - Implement notification controller with business logic
  - Create notification routes (GET, PUT, DELETE)
  - Add request validation for notification endpoints
  - Wire notification routes into Express server
  - _Requirements: 5.7_

- [x] 13. Implement caregiver links API

  - Create caregiver link repository with database queries
  - Implement caregiver link controller with business logic
  - Create caregiver link routes (GET, POST, DELETE)
  - Add request validation for caregiver link endpoints
  - Wire caregiver link routes into Express server
  - _Requirements: 5.8_

- [ ]* 14. Implement request validation property tests
  - **Property 17: Email format validation**
  - **Validates: Requirements 10.3**
  - **Property 18: Validation error details**
  - **Validates: Requirements 10.4**

- [x] 15. Checkpoint - Backend API complete


  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Create frontend API client


  - Create API client module at src/lib/api-client.ts with fetch wrapper
  - Implement request/response interceptors
  - Add authentication token management (attach JWT from localStorage)
  - Implement error handling and retry logic
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 16.1 Write property test for frontend authentication headers
  - **Property 9: Frontend authentication headers**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ]* 16.2 Write property test for frontend error display
  - **Property 10: Frontend error display**
  - **Validates: Requirements 6.5**
  - **Property 15: Frontend error message display**
  - **Validates: Requirements 7.5**

- [x] 17. Create frontend API service modules



  - Create src/services/api/auth-service.ts for authentication API calls
  - Create src/services/api/medicines-service.ts for medicine API calls
  - Create src/services/api/schedules-service.ts for schedule API calls
  - Create src/services/api/dose-logs-service.ts for dose log API calls
  - Create src/services/api/disease-profiles-service.ts for disease profile API calls
  - Create src/services/api/prescriptions-service.ts for prescription API calls
  - Create src/services/api/orders-service.ts for order API calls
  - Create src/services/api/notifications-service.ts for notification API calls
  - Create src/services/api/caregiver-service.ts for caregiver link API calls
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 18. Update Zustand store to use API services


  - Update authentication actions to use auth API service
  - Update medicine actions to use medicines API service
  - Update schedule actions to use schedules API service
  - Update dose log actions to use dose logs API service
  - Update disease profile actions to use disease profiles API service
  - Update prescription actions to use prescriptions API service
  - Update order actions to use orders API service
  - Update notification actions to use notifications API service
  - Update caregiver link actions to use caregiver API service
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 19. Update authentication flow


  - Update Login page to use auth API service
  - Update Signup page to use auth API service
  - Update logout functionality to use auth API service
  - Implement token storage in localStorage
  - Add token refresh logic
  - _Requirements: 4.1, 4.5_

- [x] 20. Remove Supabase dependencies from frontend


  - Uninstall @supabase/supabase-js package
  - Delete src/lib/supabase.ts file
  - Delete src/lib/supabase-admin.ts file
  - Remove all Supabase imports from codebase
  - Delete src/services/database/ directory
  - Update .env.example to remove Supabase variables
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 21. Update environment configuration


  - Verify VITE_API_BASE_URL exists in frontend .env.example
  - Add MySQL connection variables to backend .env (if not present)
  - Add JWT_SECRET to backend .env (if not present)
  - Remove Supabase variables from .env files
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 22. Final checkpoint - Make sure all tests are passing



  - Ensure all tests pass, ask the user if questions arise.

- [x] 23. Update documentation
  - Create README for backend server with setup instructions
  - Document API endpoints and request/response formats
  - Update main README with new architecture information
  - Create database migration guide
  - Document environment variables
  - _Requirements: 8.3, 8.5_
