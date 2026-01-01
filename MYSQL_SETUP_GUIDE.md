# MySQL Migration Setup Guide

This guide will help you set up the MySQL backend for MedReminder Pro.

## Step 1: Install MySQL

### Windows
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run the installer and choose "Developer Default"
3. Follow the installation wizard
4. Set a root password (remember this!)
5. Install MySQL Workbench (included in the installer)

### macOS
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

## Step 2: Create the Database

### Option A: Using MySQL Workbench (Recommended)

1. Open MySQL Workbench
2. Click on your local MySQL connection
3. Enter your root password
4. Click "File" → "Open SQL Script"
5. Navigate to `server/database/schema.sql`
6. Click the lightning bolt icon to execute the script
7. Verify tables were created in the "Schemas" panel

### Option B: Using MySQL CLI

```bash
# Navigate to the server directory
cd server/database

# Execute the schema
mysql -u root -p < schema.sql

# Enter your MySQL password when prompted
```

### Verify Database Creation

```sql
-- In MySQL Workbench or CLI
USE medreminder;
SHOW TABLES;

-- You should see 9 tables:
-- profiles, medicines, schedules, dose_logs, disease_profiles,
-- prescriptions, notifications, caregiver_links, orders
```

## Step 3: Configure Backend Environment

1. Navigate to the server directory:
```bash
cd server
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Edit `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=medreminder

PORT=3001
NODE_ENV=development

JWT_SECRET=change_this_to_a_random_secure_string
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

**Important Security Notes:**
- Replace `your_mysql_password_here` with your actual MySQL root password
- Change `JWT_SECRET` to a long random string (at least 32 characters)
- Never commit the `.env` file to version control

## Step 4: Install Backend Dependencies

```bash
# Make sure you're in the server directory
cd server

# Install dependencies
npm install
```

This will install:
- express (REST API framework)
- mysql2 (MySQL client)
- jsonwebtoken (JWT authentication)
- bcrypt (password hashing)
- cors (CORS middleware)
- dotenv (environment variables)
- express-validator (request validation)

## Step 5: Start the Backend Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

You should see:
```
✅ MySQL database connected successfully
🚀 Server running on http://localhost:3001
📊 Environment: development
🔗 CORS enabled for: http://localhost:5173
```

## Step 6: Test the Backend

Open your browser or use curl to test:

```bash
# Health check
curl http://localhost:3001/health

# API info
curl http://localhost:3001/api
```

You should receive JSON responses confirming the server is running.

## Step 7: Configure Frontend

1. Update the root `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3001
```

2. The frontend will be updated in later tasks to use this API URL

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"

**Solution:** Check your MySQL password in `server/.env`

```bash
# Test MySQL connection
mysql -u root -p

# If you forgot your password, reset it:
# (Instructions vary by OS - search "reset MySQL root password")
```

### Error: "Cannot find module 'express'"

**Solution:** Install dependencies

```bash
cd server
npm install
```

### Error: "Port 3001 is already in use"

**Solution:** Change the port in `server/.env`

```env
PORT=3002
```

Then update frontend `.env`:
```env
VITE_API_BASE_URL=http://localhost:3002
```

### Error: "Unknown database 'medreminder'"

**Solution:** Run the schema.sql script again

```bash
cd server/database
mysql -u root -p < schema.sql
```

### Error: "Connection refused"

**Solution:** Ensure MySQL server is running

```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql

# Windows
# Start MySQL service from Services app
```

## Verify Everything Works

1. ✅ MySQL server is running
2. ✅ Database `medreminder` exists with 9 tables
3. ✅ Backend server starts without errors
4. ✅ Health check endpoint responds
5. ✅ No connection errors in server logs

## Next Steps

Once the backend is running successfully:

1. Continue with Task 2: Create MySQL database schema (already done!)
2. Move to Task 3: Implement database connection module (already done!)
3. Proceed to Task 4: Implement authentication system

## Database Management Tips

### View Data in MySQL Workbench

1. Open MySQL Workbench
2. Connect to your server
3. Expand "medreminder" database
4. Right-click any table → "Select Rows"
5. View and edit data visually

### Backup Your Database

```bash
mysqldump -u root -p medreminder > backup_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
mysql -u root -p medreminder < backup_20240101.sql
```

### Monitor Queries

In MySQL Workbench:
1. Go to "Performance" → "Dashboard"
2. View active connections and queries
3. Monitor server health

## Security Checklist

- [ ] Changed default JWT_SECRET
- [ ] Using strong MySQL password
- [ ] .env file is in .gitignore
- [ ] CORS_ORIGIN matches your frontend URL
- [ ] MySQL user has minimum required permissions
- [ ] Firewall configured (production only)

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify MySQL credentials
3. Ensure all dependencies are installed
4. Review the troubleshooting section above
5. Check the server/README.md for additional help

---

**Congratulations!** Your MySQL backend is now set up and ready for development. 🎉
