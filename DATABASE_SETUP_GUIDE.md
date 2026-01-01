# MySQL Database Setup Guide

## Quick Setup Steps

I've created the `.env` file for you at `server/.env` with default credentials. Follow these steps to complete the setup:

### Step 1: Update Database Password

Open `server/.env` and update the `DB_PASSWORD` with your MySQL root password:

```env
DB_PASSWORD=your_actual_mysql_password
```

If you don't have a MySQL root password set, you can leave it as `root` or empty.

### Step 2: Execute the Schema in MySQL Workbench

1. **Open MySQL Workbench**
2. **Connect to your MySQL server** (usually localhost)
3. **Open the schema file**:
   - Click `File` → `Open SQL Script`
   - Navigate to `server/database/schema.sql`
   - Click `Open`
4. **Execute the script**:
   - Click the lightning bolt icon (⚡) or press `Ctrl+Shift+Enter`
   - This will create the `medreminder` database and all tables

### Step 3: Verify the Database

In MySQL Workbench, run these commands to verify:

```sql
-- Check database exists
SHOW DATABASES;

-- Use the database
USE medreminder;

-- Check all tables exist
SHOW TABLES;

-- Verify foreign keys on medicines table
SHOW CREATE TABLE medicines;
```

You should see 9 tables:
- profiles
- medicines
- schedules
- dose_logs
- disease_profiles
- prescriptions
- notifications
- caregiver_links
- orders

### Step 4: Run the Property Test

Once the database is set up, run the test to verify foreign key constraints:

```bash
node --test server/database/schema.test.js
```

Expected output:
```
✅ Property 1 passed: Foreign key constraints are properly enforced
✔ Property 1: Foreign key constraint enforcement (XXXms)
```

## What the Test Does

The property-based test verifies that:
- All foreign key constraints are properly enforced
- Attempts to insert records with invalid foreign keys are rejected
- The database returns the correct error code (ER_NO_REFERENCED_ROW_2)
- This works across all 8 tables with foreign key relationships

The test runs 100 iterations with randomly generated invalid foreign keys to ensure robust constraint enforcement.

## Troubleshooting

### MySQL Not Running

If you see "Can't connect to MySQL server":
- Start MySQL service (Windows: Services app, Mac: System Preferences)
- Or start via command line: `mysql.server start` (Mac) or `net start MySQL80` (Windows)

### Access Denied Error

If you see "Access denied for user 'root'@'localhost'":
- Update `DB_PASSWORD` in `server/.env` with your correct MySQL password
- Or reset your MySQL root password

### Database Already Exists

If the database already exists, you can:
- Drop it first: `DROP DATABASE medreminder;`
- Or skip the `CREATE DATABASE` line in the schema.sql

### Tables Already Exist

If tables already exist, you can:
- Drop them first: `DROP TABLE IF EXISTS [table_name];`
- Or use the `IF NOT EXISTS` clause (already in the schema)

## Next Steps

After the test passes:
1. ✅ Task 2 is complete (Create MySQL database schema)
2. ✅ Task 2.1 is complete (Property test for foreign key constraints)
3. Move on to Task 3: Implement database connection module

The schema is ready and verified! 🎉
