import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import database from './config/database.js';
import authRoutes from './routes/auth.js';
import medicinesRoutes from './routes/medicines.js';
import schedulesRoutes from './routes/schedules.js';
import doseLogsRoutes from './routes/dose-logs.js';
import diseaseProfilesRoutes from './routes/disease-profiles.js';
import prescriptionsRoutes from './routes/prescriptions.js';
import ordersRoutes from './routes/orders.js';
import notificationsRoutes from './routes/notifications.js';
import caregiverLinksRoutes from './routes/caregiver-links.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MedReminder API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/dose-logs', doseLogsRoutes);
app.use('/api/disease-profiles', diseaseProfilesRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/caregiver-links', caregiverLinksRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'MedReminder Pro API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      medicines: '/api/medicines',
      schedules: '/api/schedules',
      doseLogs: '/api/dose-logs',
      diseaseProfiles: '/api/disease-profiles',
      prescriptions: '/api/prescriptions',
      orders: '/api/orders',
      notifications: '/api/notifications',
      caregiverLinks: '/api/caregiver-links'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await database.close();
  process.exit(0);
});

startServer();
