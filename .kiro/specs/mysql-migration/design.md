# Design Document

## Overview

This design document outlines the architecture for migrating MedReminder Pro from Supabase to MySQL Workbench. The migration involves creating a three-tier architecture: MySQL database, Node.js/Express REST API backend, and React frontend. The backend will handle all database operations, authentication, and business logic, while the frontend will communicate exclusively through REST API calls.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│  (Vite + TypeScript + Zustand State Management)            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     │ (JSON over HTTPS)
┌────────────────────▼────────────────────────────────────────┐
│              Node.js/Express Backend                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication Middleware (JWT)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  REST API Routes                                     │  │
│  │  /api/auth, /api/medicines, /api/schedules, etc.    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Business Logic Layer                                │  │
│  │  (Validation, Data Transformation)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database Access Layer (mysql2 + Connection Pool)    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ MySQL Protocol
┌────────────────────▼────────────────────────────────────────┐
│                   MySQL Database                            │
│  (Managed via MySQL Workbench)                             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Node.js (v18+)
- Express.js (REST API framework)
- mysql2 (MySQL client with Promise support)
- jsonwebtoken (JWT authentication)
- bcrypt (Password hashing)
- express-validator (Request validation)
- cors (Cross-origin resource sharing)
- dotenv (Environment configuration)

**Frontend Changes:**
- Remove @supabase/supabase-js
- Add axios or fetch wrapper for API calls
- Update Zustand store to use API calls instead of direct DB access

**Database:**
- MySQL 8.0+
- MySQL Workbench for schema management

## Components and Interfaces

### Backend Components

#### 1. Database Connection Module (`server/config/database.js`)

```javascript
// Manages MySQL connection pool
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  waitForConnections: boolean;
  queueLimit: number;
}

class Database {
  pool: mysql.Pool;
  connect(): Promise<void>;
  query(sql: string, params: any[]): Promise<any>;
  close(): Promise<void>;
}
```

#### 2. Authentication Module (`server/middleware/auth.js`)

```javascript
interface AuthMiddleware {
  generateToken(user: User): string;
  verifyToken(token: string): Promise<DecodedToken>;
  authenticate(req, res, next): void;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}
```

#### 3. API Routes

**Auth Routes (`server/routes/auth.js`):**
- POST /api/auth/signup - Register new user
- POST /api/auth/login - Authenticate user
- POST /api/auth/logout - Invalidate session
- GET /api/auth/me - Get current user

**Medicine Routes (`server/routes/medicines.js`):**
- GET /api/medicines - List all medicines for user
- GET /api/medicines/:id - Get single medicine
- POST /api/medicines - Create new medicine
- PUT /api/medicines/:id - Update medicine
- DELETE /api/medicines/:id - Delete medicine

**Schedule Routes (`server/routes/schedules.js`):**
- GET /api/schedules - List all schedules for user
- GET /api/schedules/medicine/:medicineId - Get schedules for medicine
- POST /api/schedules - Create schedule
- PUT /api/schedules/:id - Update schedule
- DELETE /api/schedules/:id - Delete schedule

**Dose Log Routes (`server/routes/dose-logs.js`):**
- GET /api/dose-logs - List dose logs with filters
- POST /api/dose-logs - Create dose log
- PUT /api/dose-logs/:id - Update dose log
- DELETE /api/dose-logs/:id - Delete dose log

**Disease Profile Routes (`server/routes/disease-profiles.js`):**
- GET /api/disease-profiles - List disease profiles
- GET /api/disease-profiles/:id - Get single profile
- POST /api/disease-profiles - Create profile
- PUT /api/disease-profiles/:id - Update profile
- DELETE /api/disease-profiles/:id - Delete profile

**Prescription Routes (`server/routes/prescriptions.js`):**
- GET /api/prescriptions - List prescriptions
- GET /api/prescriptions/:id - Get single prescription
- POST /api/prescriptions - Create prescription
- PUT /api/prescriptions/:id - Update prescription
- DELETE /api/prescriptions/:id - Delete prescription

**Order Routes (`server/routes/orders.js`):**
- GET /api/orders - List orders
- POST /api/orders - Create order
- PUT /api/orders/:id - Update order
- DELETE /api/orders/:id - Delete order

**Notification Routes (`server/routes/notifications.js`):**
- GET /api/notifications - List notifications
- PUT /api/notifications/:id/read - Mark as read
- DELETE /api/notifications/:id - Delete notification

**Caregiver Routes (`server/routes/caregiver-links.js`):**
- GET /api/caregiver-links - List caregiver links
- POST /api/caregiver-links - Create link
- DELETE /api/caregiver-links/:id - Delete link

#### 4. Controllers

Each route will have a corresponding controller that handles business logic:

```javascript
// Example: MedicineController
class MedicineController {
  async getAll(req, res): Promise<void>;
  async getById(req, res): Promise<void>;
  async create(req, res): Promise<void>;
  async update(req, res): Promise<void>;
  async delete(req, res): Promise<void>;
}
```

#### 5. Models/Repositories

Data access layer for each entity:

```javascript
// Example: MedicineRepository
class MedicineRepository {
  async findByUserId(userId: string): Promise<Medicine[]>;
  async findById(id: string): Promise<Medicine | null>;
  async create(medicine: Medicine): Promise<Medicine>;
  async update(id: string, updates: Partial<Medicine>): Promise<Medicine>;
  async delete(id: string): Promise<void>;
}
```

### Frontend Components

#### 1. API Client (`src/services/api-client.ts`)

```typescript
interface ApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data: any): Promise<T>;
  put<T>(endpoint: string, data: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
  setAuthToken(token: string): void;
  clearAuthToken(): void;
}
```

#### 2. API Service Modules

Replace Supabase services with API services:

- `src/services/api/auth-service.ts`
- `src/services/api/medicines-service.ts`
- `src/services/api/schedules-service.ts`
- `src/services/api/dose-logs-service.ts`
- `src/services/api/disease-profiles-service.ts`
- `src/services/api/prescriptions-service.ts`
- `src/services/api/orders-service.ts`
- `src/services/api/notifications-service.ts`
- `src/services/api/caregiver-service.ts`

#### 3. Updated Zustand Store

Modify store actions to use API calls:

```typescript
// Example: Medicine actions
addMedicine: async (medicine: Medicine) => {
  const created = await medicinesService.create(medicine);
  set((state) => ({
    medicines: [...state.medicines, created]
  }));
},
```

## Data Models

### MySQL Schema

#### profiles Table
```sql
CREATE TABLE profiles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('PATIENT', 'CAREGIVER') NOT NULL,
  elderly_mode BOOLEAN DEFAULT FALSE,
  timezone VARCHAR(50) DEFAULT 'UTC',
  caregiver_invite_code VARCHAR(8) UNIQUE,
  voice_reminders_enabled BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_settings JSON,
  age INT,
  phone VARCHAR(20),
  address TEXT,
  emergency_contact JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_caregiver_code (caregiver_invite_code)
);
```

#### medicines Table
```sql
CREATE TABLE medicines (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  nickname VARCHAR(255),
  strength VARCHAR(100) NOT NULL,
  form ENUM('tablet', 'capsule', 'liquid', 'injection', 'inhaler', 'other') NOT NULL,
  color_tag ENUM('red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'teal'),
  icon_key VARCHAR(50),
  stock_count INT DEFAULT 0,
  refill_threshold INT DEFAULT 10,
  instructions TEXT,
  frequency JSON,
  start_date DATE,
  end_date DATE,
  prescribed_by VARCHAR(255),
  refills_remaining INT,
  quantity INT,
  side_effects JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_name (name)
);
```

#### schedules Table
```sql
CREATE TABLE schedules (
  id VARCHAR(36) PRIMARY KEY,
  medicine_id VARCHAR(36) NOT NULL,
  frequency_type ENUM('DAILY', 'WEEKDAYS', 'CUSTOM_DAYS', 'EVERY_X_DAYS', 'EVERY_X_HOURS', 'AS_NEEDED') NOT NULL,
  times_of_day JSON NOT NULL,
  days_of_week JSON,
  interval_days INT,
  interval_hours INT,
  start_date DATE NOT NULL,
  end_date DATE,
  dosage_amount DECIMAL(10, 2) NOT NULL,
  dosage_unit VARCHAR(50) NOT NULL,
  max_dose_per_day DECIMAL(10, 2),
  max_dose_per_intake DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
  INDEX idx_medicine_id (medicine_id),
  INDEX idx_start_date (start_date)
);
```

#### dose_logs Table
```sql
CREATE TABLE dose_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  medicine_id VARCHAR(36) NOT NULL,
  scheduled_time TIMESTAMP NOT NULL,
  taken_time TIMESTAMP,
  status ENUM('PENDING', 'TAKEN', 'MISSED', 'SKIPPED') NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_medicine_id (medicine_id),
  INDEX idx_scheduled_time (scheduled_time),
  INDEX idx_status (status)
);
```

#### disease_profiles Table
```sql
CREATE TABLE disease_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  disease_id VARCHAR(100) NOT NULL,
  disease_name VARCHAR(255) NOT NULL,
  personal_info JSON NOT NULL,
  symptoms JSON,
  lifestyle JSON,
  medication_history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_disease_id (disease_id)
);
```

#### prescriptions Table
```sql
CREATE TABLE prescriptions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  parsed_medicines JSON,
  status ENUM('pending', 'processed', 'error') NOT NULL,
  analysis_result JSON,
  linked_disease_profiles JSON,
  is_analyzed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
```

#### notifications Table
```sql
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('DOSE_DUE', 'MISSED_DOSE', 'REFILL_WARNING', 'CAREGIVER_ALERT') NOT NULL,
  message TEXT NOT NULL,
  medicine_id VARCHAR(36),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);
```

#### caregiver_links Table
```sql
CREATE TABLE caregiver_links (
  id VARCHAR(36) PRIMARY KEY,
  caregiver_id VARCHAR(36) NOT NULL,
  patient_id VARCHAR(36) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caregiver_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_link (caregiver_id, patient_id),
  INDEX idx_caregiver_id (caregiver_id),
  INDEX idx_patient_id (patient_id)
);
```

#### orders Table
```sql
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  vendor JSON NOT NULL,
  items JSON NOT NULL,
  notes TEXT,
  delivery JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

## Error Handling

### Backend Error Handling

```javascript
// Centralized error handler middleware
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Error handler middleware
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details
    });
  }
  
  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Duplicate entry',
      details: err.message
    });
  }
  
  // Default error
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}
```

### Frontend Error Handling

```typescript
// API client error handling
class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

async function handleApiCall<T>(promise: Promise<Response>): Promise<T> {
  try {
    const response = await promise;
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.error, error.details);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error', error);
  }
}
```

## Testing Strategy

### Backend Testing

**Unit Tests:**
- Test individual repository methods
- Test controller logic
- Test authentication middleware
- Test validation functions

**Integration Tests:**
- Test API endpoints with test database
- Test authentication flow
- Test CRUD operations for each entity
- Test error handling

**Property-Based Tests:**
- Test that all API responses follow consistent structure
- Test that database queries handle edge cases (empty results, large datasets)
- Test that validation rejects invalid inputs

### Frontend Testing

**Unit Tests:**
- Test API service methods
- Test Zustand store actions
- Test component rendering with API data

**Integration Tests:**
- Test complete user flows (login, create medicine, log dose)
- Test error handling and retry logic
- Test authentication token refresh

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Foreign key constraint enforcement
*For any* attempt to insert a record with an invalid foreign key, the database should reject the operation with a foreign key constraint error
**Validates: Requirements 2.2**

### Property 2: Connection retry with exponential backoff
*For any* database connection failure, the system should retry with increasing delays between attempts
**Validates: Requirements 3.3**

### Property 3: JSON body parsing
*For any* valid JSON request body, the server should successfully parse it and make it available to route handlers
**Validates: Requirements 3.4**

### Property 4: CORS headers on all responses
*For any* HTTP response from the server, the response should include appropriate CORS headers
**Validates: Requirements 3.5**

### Property 5: JWT token generation
*For any* valid user credentials, successful login should generate a JWT token containing user information
**Validates: Requirements 4.1**

### Property 6: Protected endpoint authentication
*For any* protected API endpoint, requests without valid JWT tokens should be rejected with 401 status
**Validates: Requirements 4.2**

### Property 7: Invalid token rejection
*For any* invalid or expired JWT token, the system should return a 401 Unauthorized response
**Validates: Requirements 4.3**

### Property 8: User context attachment
*For any* authenticated request, the user information should be attached to the request object
**Validates: Requirements 4.4**

### Property 9: Frontend authentication headers
*For any* API call from the frontend, the request should include authentication headers when a user is logged in
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 10: Frontend error display
*For any* failed API call, the frontend should display a user-friendly error message to the user
**Validates: Requirements 6.5**

### Property 11: Database error handling
*For any* database query failure, the server should log the error and return a 500 Internal Server Error response
**Validates: Requirements 7.1**

### Property 12: Resource not found handling
*For any* request for a non-existent resource, the server should return a 404 Not Found response
**Validates: Requirements 7.2**

### Property 13: Validation error responses
*For any* request with invalid data, the server should return a 400 Bad Request response with detailed validation errors
**Validates: Requirements 7.3**

### Property 14: Unauthorized access prevention
*For any* attempt to access another user's resources, the server should return a 403 Forbidden response
**Validates: Requirements 7.4**

### Property 15: Frontend error message display
*For any* error response received by the frontend, a user-friendly error message should be displayed
**Validates: Requirements 7.5**

### Property 16: Connection pool stability
*For any* sequence of database queries, the connection pool should maintain stable size by releasing connections after use
**Validates: Requirements 9.3**

### Property 17: Email format validation
*For any* email string, the validation should correctly identify whether it follows valid email format
**Validates: Requirements 10.3**

### Property 18: Validation error details
*For any* validation failure, the error response should include details about which fields are invalid
**Validates: Requirements 10.4**

## Testing Strategy

### Backend Testing

**Unit Tests:**
- Test individual repository methods
- Test controller logic
- Test authentication middleware
- Test validation functions

**Integration Tests:**
- Test API endpoints with test database
- Test authentication flow
- Test CRUD operations for each entity
- Test error handling

**Property-Based Tests:**
- Property 1: Test foreign key constraints with random invalid references
- Property 2: Test retry logic with simulated connection failures
- Property 3: Test JSON parsing with randomly generated valid JSON
- Property 4: Test CORS headers on all endpoint responses
- Property 5: Test JWT generation with various user data
- Property 6-8: Test authentication middleware with valid/invalid tokens
- Property 9: Test frontend API calls include auth headers
- Property 10-15: Test error handling with various error scenarios
- Property 16: Test connection pool with concurrent queries
- Property 17: Test email validation with valid/invalid emails
- Property 18: Test validation error messages include field details

### Frontend Testing

**Unit Tests:**
- Test API service methods
- Test Zustand store actions
- Test component rendering with API data

**Integration Tests:**
- Test complete user flows (login, create medicine, log dose)
- Test error handling and retry logic
- Test authentication token refresh

