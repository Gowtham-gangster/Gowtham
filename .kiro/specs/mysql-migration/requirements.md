# Requirements Document

## Introduction

This document outlines the requirements for migrating the MedReminder Pro application from Supabase (PostgreSQL) to MySQL Workbench with a Node.js/Express backend API. The migration will replace all Supabase client-side database calls with REST API calls to a custom backend server that connects to MySQL.

## Glossary

- **MySQL Workbench**: A visual database design tool for MySQL databases
- **Express Server**: A Node.js web application framework for building REST APIs
- **REST API**: Representational State Transfer Application Programming Interface
- **ORM**: Object-Relational Mapping library (e.g., Sequelize, TypeORM)
- **Frontend Client**: The React application that consumes the API
- **Backend Server**: The Express server that handles database operations
- **Migration Script**: SQL scripts to create MySQL database schema
- **Authentication Middleware**: Server-side code that validates user sessions

## Requirements

### Requirement 1

**User Story:** As a developer, I want to remove all Supabase dependencies, so that the application no longer relies on Supabase services.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL NOT import or initialize any Supabase client libraries
2. WHEN reviewing the package.json THEN the system SHALL NOT include @supabase/supabase-js as a dependency
3. WHEN the application runs THEN the system SHALL NOT attempt to connect to Supabase endpoints
4. WHEN examining the codebase THEN the system SHALL NOT contain any references to Supabase configuration files
5. WHEN the src/lib/supabase.ts file is accessed THEN the system SHALL return a file not found error

### Requirement 2

**User Story:** As a developer, I want to create a MySQL database schema, so that all application data can be stored in MySQL.

#### Acceptance Criteria

1. WHEN the MySQL schema is created THEN the system SHALL include tables for profiles, medicines, schedules, dose_logs, disease_profiles, prescriptions, notifications, caregiver_links, and orders
2. WHEN defining table relationships THEN the system SHALL enforce foreign key constraints between related tables
3. WHEN creating the profiles table THEN the system SHALL include fields for id, name, email, role, elderly_mode, timezone, and notification settings
4. WHEN creating the medicines table THEN the system SHALL include fields for user_id, name, strength, form, stock_count, and refill_threshold
5. WHEN creating indexes THEN the system SHALL add indexes on frequently queried columns such as user_id and medicine_id

### Requirement 3

**User Story:** As a developer, I want to create a Node.js/Express backend server, so that the frontend can communicate with the MySQL database through REST APIs.

#### Acceptance Criteria

1. WHEN the backend server starts THEN the system SHALL listen on a configurable port (default 3001)
2. WHEN the server initializes THEN the system SHALL establish a connection pool to the MySQL database
3. WHEN a database connection fails THEN the system SHALL log the error and retry with exponential backoff
4. WHEN the server receives a request THEN the system SHALL parse JSON request bodies
5. WHEN the server responds THEN the system SHALL include appropriate CORS headers for the frontend origin

### Requirement 4

**User Story:** As a developer, I want to implement authentication middleware, so that API endpoints are protected and user sessions are validated.

#### Acceptance Criteria

1. WHEN a user logs in with valid credentials THEN the system SHALL generate a JWT token with user information
2. WHEN a protected endpoint receives a request THEN the system SHALL validate the JWT token in the Authorization header
3. WHEN a JWT token is invalid or expired THEN the system SHALL return a 401 Unauthorized response
4. WHEN a JWT token is valid THEN the system SHALL attach the user information to the request object
5. WHEN a user logs out THEN the system SHALL invalidate the session token

### Requirement 5

**User Story:** As a developer, I want to create REST API endpoints for all data operations, so that the frontend can perform CRUD operations on all entities.

#### Acceptance Criteria

1. WHEN implementing medicine endpoints THEN the system SHALL provide GET, POST, PUT, and DELETE operations at /api/medicines
2. WHEN implementing schedule endpoints THEN the system SHALL provide CRUD operations at /api/schedules
3. WHEN implementing dose log endpoints THEN the system SHALL provide CRUD operations at /api/dose-logs
4. WHEN implementing disease profile endpoints THEN the system SHALL provide CRUD operations at /api/disease-profiles
5. WHEN implementing prescription endpoints THEN the system SHALL provide CRUD operations at /api/prescriptions
6. WHEN implementing order endpoints THEN the system SHALL provide CRUD operations at /api/orders
7. WHEN implementing notification endpoints THEN the system SHALL provide CRUD operations at /api/notifications
8. WHEN implementing caregiver link endpoints THEN the system SHALL provide CRUD operations at /api/caregiver-links

### Requirement 6

**User Story:** As a developer, I want to replace all frontend Supabase calls with API calls, so that the frontend communicates with the MySQL backend.

#### Acceptance Criteria

1. WHEN the frontend needs to fetch medicines THEN the system SHALL call GET /api/medicines with authentication headers
2. WHEN the frontend creates a new medicine THEN the system SHALL call POST /api/medicines with the medicine data
3. WHEN the frontend updates a medicine THEN the system SHALL call PUT /api/medicines/:id with updated data
4. WHEN the frontend deletes a medicine THEN the system SHALL call DELETE /api/medicines/:id
5. WHEN an API call fails THEN the system SHALL display an appropriate error message to the user

### Requirement 7

**User Story:** As a developer, I want to implement proper error handling, so that the application gracefully handles database and network errors.

#### Acceptance Criteria

1. WHEN a database query fails THEN the system SHALL log the error details and return a 500 Internal Server Error response
2. WHEN a resource is not found THEN the system SHALL return a 404 Not Found response
3. WHEN request validation fails THEN the system SHALL return a 400 Bad Request response with validation errors
4. WHEN a user attempts unauthorized access THEN the system SHALL return a 403 Forbidden response
5. WHEN the frontend receives an error response THEN the system SHALL display a user-friendly error message

### Requirement 8

**User Story:** As a developer, I want to configure environment variables, so that database credentials and API settings can be managed securely.

#### Acceptance Criteria

1. WHEN the backend server starts THEN the system SHALL read MySQL connection settings from environment variables
2. WHEN the frontend makes API calls THEN the system SHALL use the API base URL from environment variables
3. WHEN environment variables are missing THEN the system SHALL provide clear error messages indicating which variables are required
4. WHEN storing sensitive data THEN the system SHALL NOT commit credentials to version control
5. WHEN providing example configuration THEN the system SHALL include .env.example files with placeholder values

### Requirement 9

**User Story:** As a developer, I want to implement database connection pooling, so that the application efficiently manages database connections.

#### Acceptance Criteria

1. WHEN the server initializes THEN the system SHALL create a connection pool with configurable min and max connections
2. WHEN a query is executed THEN the system SHALL acquire a connection from the pool
3. WHEN a query completes THEN the system SHALL release the connection back to the pool
4. WHEN the connection pool is exhausted THEN the system SHALL queue requests until a connection becomes available
5. WHEN the server shuts down THEN the system SHALL gracefully close all pooled connections

### Requirement 10

**User Story:** As a developer, I want to implement request validation, so that invalid data is rejected before reaching the database.

#### Acceptance Criteria

1. WHEN creating a medicine THEN the system SHALL validate that name and strength are non-empty strings
2. WHEN creating a schedule THEN the system SHALL validate that times_of_day is a non-empty array
3. WHEN updating a user profile THEN the system SHALL validate that email follows a valid email format
4. WHEN validation fails THEN the system SHALL return detailed error messages indicating which fields are invalid
5. WHEN all validations pass THEN the system SHALL proceed with the database operation
