import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import database from '../config/database.js';
import { 
  generateToken, 
  hashPassword, 
  comparePassword,
  authenticate 
} from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['PATIENT', 'CAREGIVER'])
      .withMessage('Role must be PATIENT or CAREGIVER')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { name, email, password, role = 'PATIENT' } = req.body;

      // Check if user already exists
      const existingUser = await database.query(
        'SELECT id FROM profiles WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Generate user ID
      const userId = uuidv4();

      // Generate caregiver invite code if role is CAREGIVER
      const caregiverInviteCode = role === 'CAREGIVER' 
        ? Math.random().toString(36).substring(2, 10).toUpperCase()
        : null;

      // Insert user into database
      await database.query(
        `INSERT INTO profiles (
          id, name, email, password_hash, role, caregiver_invite_code
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, name, email, passwordHash, role, caregiverInviteCode]
      );

      // Generate JWT token
      const token = generateToken({ id: userId, email, role });

      // Return user data and token
      res.status(201).json({
        user: {
          id: userId,
          name,
          email,
          role,
          caregiverInviteCode
        },
        token
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create user'
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const users = await database.query(
        'SELECT id, name, email, password_hash, role, caregiver_invite_code FROM profiles WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password'
        });
      }

      const user = users[0];

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Return user data and token
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          caregiverInviteCode: user.caregiver_invite_code
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to authenticate'
      });
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a JWT-based system, logout is primarily handled client-side
    // by removing the token from storage
    // This endpoint can be used for logging or additional cleanup if needed
    
    res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to logout'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    // Get user details from database
    const users = await database.query(
      `SELECT id, name, email, role, elderly_mode, timezone, 
              caregiver_invite_code, voice_reminders_enabled, 
              notifications_enabled, notification_settings, 
              age, phone, address, emergency_contact, 
              created_at, updated_at
       FROM profiles 
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    const user = users[0];

    // Parse JSON fields
    if (user.notification_settings) {
      user.notification_settings = JSON.parse(user.notification_settings);
    }
    if (user.emergency_contact) {
      user.emergency_contact = JSON.parse(user.emergency_contact);
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user'
    });
  }
});

export default router;
