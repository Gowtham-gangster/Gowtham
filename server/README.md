# MedReminder Pro Backend API

Node.js/Express REST API server for MedReminder Pro application with MySQL database.

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed
- MySQL Workbench (recommended for database management)

## Setup Instructions

### 1. Create MySQL Database

Open MySQL Workbench and execute the SQL script:

```bash
# Navigate to the database directory
cd server/database

# Execute schema.sql in MySQL Workbench
# Or use MySQL CLI:
mysql -u root -p < schema.sql
```

This will create:
- `medreminder` database
- All required tables with proper relationships
- Indexes for optimized queries

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=medreminder

PORT=3001
NODE_ENV=development

JWT_SECRET=your_secure_random_string_here
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## Project Structure

```
server/
├── config/
│   └── database.js          # MySQL connection pool
├── controllers/             # Business logic
├── middleware/              # Authentication & validation
├── models/                  # Data access layer (repositories)
├── routes/                  # API route definitions
├── utils/                   # Helper functions
├── database/
│   └── schema.sql          # MySQL database schema
├── server.js               # Main application entry point
├── package.json
├── .env.example
└── README.md
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Medicines
- `GET /api/medicines` - List all medicines
- `GET /api/medicines/:id` - Get single medicine
- `POST /api/medicines` - Create medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Schedules
- `GET /api/schedules` - List all schedules
- `GET /api/schedules/medicine/:medicineId` - Get schedules for medicine
- `POST /api/schedules` - Create schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

### Dose Logs
- `GET /api/dose-logs` - List dose logs
- `POST /api/dose-logs` - Create dose log
- `PUT /api/dose-logs/:id` - Update dose log
- `DELETE /api/dose-logs/:id` - Delete dose log

### Disease Profiles
- `GET /api/disease-profiles` - List disease profiles
- `GET /api/disease-profiles/:id` - Get single profile
- `POST /api/disease-profiles` - Create profile
- `PUT /api/disease-profiles/:id` - Update profile
- `DELETE /api/disease-profiles/:id` - Delete profile

### Prescriptions
- `GET /api/prescriptions` - List prescriptions
- `GET /api/prescriptions/:id` - Get single prescription
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Caregiver Links
- `GET /api/caregiver-links` - List caregiver links
- `POST /api/caregiver-links` - Create link
- `DELETE /api/caregiver-links/:id` - Delete link

## Testing

Run tests:
```bash
npm test
```

## Database Management

### Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Select the `medreminder` database
4. Use the visual tools to:
   - View table structures
   - Run queries
   - Manage data
   - Monitor performance

### Backup Database

```bash
mysqldump -u root -p medreminder > backup.sql
```

### Restore Database

```bash
mysql -u root -p medreminder < backup.sql
```

## Troubleshooting

### Connection Refused

If you see "Connection refused" errors:
1. Ensure MySQL server is running
2. Check MySQL credentials in `.env`
3. Verify MySQL is listening on port 3306

### Authentication Failed

If you see "Access denied" errors:
1. Verify MySQL username and password
2. Ensure the user has permissions on `medreminder` database
3. Try connecting with MySQL Workbench to test credentials

### Port Already in Use

If port 3001 is already in use:
1. Change `PORT` in `.env` to another port
2. Update frontend `VITE_API_BASE_URL` accordingly

## Security Notes

- Never commit `.env` file to version control
- Use strong passwords for MySQL
- Change `JWT_SECRET` to a secure random string
- Enable HTTPS in production
- Implement rate limiting for production
- Use prepared statements (already implemented via mysql2)

## Next Steps

1. ✅ Database schema created
2. ✅ Server structure set up
3. ⏳ Implement authentication middleware
4. ⏳ Create API routes and controllers
5. ⏳ Add request validation
6. ⏳ Write tests
7. ⏳ Update frontend to use API

## Support

For issues or questions, refer to the main project documentation.
