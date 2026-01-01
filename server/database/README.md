# Database Schema and Tests

## Overview

This directory contains the MySQL database schema and property-based tests to verify database constraints.

## Files

- `schema.sql` - Complete MySQL database schema with all tables, foreign keys, and indexes
- `schema.test.js` - Property-based tests for database constraints

## Setup Instructions

### 1. Install MySQL

Ensure MySQL 8.0+ is installed and running on your system.

### 2. Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cd server
cp .env.example .env
```

Edit `.env` and update the database password:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=medreminder
```

### 3. Create Database Schema

Open MySQL Workbench and execute the `schema.sql` file:

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open `server/database/schema.sql`
4. Execute the entire script (Ctrl+Shift+Enter or click the lightning bolt icon)

This will create:
- The `medreminder` database
- All tables (profiles, medicines, schedules, dose_logs, disease_profiles, prescriptions, notifications, caregiver_links, orders)
- Foreign key constraints between related tables
- Indexes on frequently queried columns

## Running Tests

### Property-Based Tests

The property tests verify that database constraints are properly enforced:

```bash
# From the workspace root
node --test server/database/schema.test.js
```

Or from the server directory:

```bash
cd server
node --test database/schema.test.js
```

### Test Coverage

**Property 1: Foreign key constraint enforcement**
- Validates that all foreign key constraints properly reject invalid references
- Tests all 8 tables with foreign key relationships
- Runs 100 iterations with randomly generated invalid foreign keys

## Database Schema

### Tables

1. **profiles** - User accounts (patients and caregivers)
2. **medicines** - Medication information
3. **schedules** - Medication schedules
4. **dose_logs** - Dose tracking history
5. **disease_profiles** - Chronic disease profiles
6. **prescriptions** - Uploaded prescription files
7. **notifications** - User notifications
8. **caregiver_links** - Caregiver-patient relationships
9. **orders** - Medication orders

### Foreign Key Relationships

```
profiles (id)
  ├─> medicines (user_id)
  │     └─> schedules (medicine_id)
  │     └─> dose_logs (medicine_id)
  │     └─> notifications (medicine_id) [nullable]
  ├─> dose_logs (user_id)
  ├─> disease_profiles (user_id)
  ├─> prescriptions (user_id)
  ├─> notifications (user_id)
  ├─> caregiver_links (caregiver_id)
  ├─> caregiver_links (patient_id)
  └─> orders (user_id)
```

## Troubleshooting

### Connection Errors

If you see "Access denied" errors:
1. Verify MySQL is running
2. Check your .env file has the correct password
3. Ensure the MySQL user has proper permissions

### Schema Errors

If tables don't exist:
1. Execute the schema.sql script in MySQL Workbench
2. Verify the database was created: `SHOW DATABASES;`
3. Verify tables exist: `USE medreminder; SHOW TABLES;`

### Test Failures

If property tests fail:
1. Ensure the schema.sql has been executed
2. Verify foreign key constraints exist: `SHOW CREATE TABLE medicines;`
3. Check MySQL error logs for constraint violations
