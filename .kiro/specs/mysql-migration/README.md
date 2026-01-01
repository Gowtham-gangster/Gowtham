# MySQL Migration Spec

## Overview

This spec outlines the complete migration of MedReminder Pro from Supabase (PostgreSQL) to MySQL Workbench with a custom Node.js/Express backend API.

## Status

📋 **Planning Complete** - Ready for implementation

## Architecture Change

**Before:**
```
React Frontend → Supabase Client → PostgreSQL (Supabase)
```

**After:**
```
React Frontend → REST API → Express Backend → MySQL Database
```

## Key Changes

### Backend (New)
- Node.js/Express REST API server
- JWT-based authentication
- MySQL connection pooling
- Comprehensive error handling
- Request validation middleware

### Frontend (Updated)
- Remove all Supabase dependencies
- API client for REST calls
- Updated Zustand store to use API services
- Token-based authentication

### Database (Migrated)
- MySQL 8.0+ database
- Complete schema with all tables
- Foreign key constraints
- Optimized indexes

## Files

- `requirements.md` - 10 requirements with 50 acceptance criteria
- `design.md` - Complete architecture and design with 18 correctness properties
- `tasks.md` - 23 implementation tasks with property-based tests

## Quick Start

To begin implementation:

1. Open `tasks.md` in Kiro
2. Click "Start task" next to Task 1
3. Follow the implementation plan sequentially

## Testing Strategy

- **18 Property-Based Tests** using fast-check
- Unit tests for all repositories and controllers
- Integration tests for API endpoints
- Frontend integration tests with API mocking

## Dependencies

### Backend (New)
- express
- mysql2
- jsonwebtoken
- bcrypt
- cors
- dotenv
- express-validator

### Frontend (Changes)
- Remove: @supabase/supabase-js
- Keep: All existing dependencies

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=medreminder
JWT_SECRET=your_secret_key
PORT=3001
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3001
```

## Implementation Order

1. **Backend Setup** (Tasks 1-5) - Database, server core, authentication
2. **API Endpoints** (Tasks 6-13) - All CRUD operations
3. **Frontend Migration** (Tasks 15-19) - Remove Supabase, add API client
4. **Configuration & Validation** (Tasks 20-21) - Environment setup, validation
5. **Testing & Documentation** (Tasks 2.1-21.2, 23) - Comprehensive testing

## Estimated Timeline

- Backend setup: 2-3 days
- API implementation: 3-4 days
- Frontend migration: 2-3 days
- Testing & polish: 2-3 days

**Total: 9-13 days**

## Next Steps

Ready to start? Execute:
```
Task 1: Set up MySQL database and backend project structure
```

This will create the MySQL database schema and initialize the Node.js backend project.
