import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import * as medicinesModel from '../models/medicines.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/medicines
 * Get all medicines for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const medicines = await medicinesModel.findByUserId(req.user.id);
    res.json({ medicines });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch medicines'
    });
  }
});

/**
 * GET /api/medicines/:id
 * Get a single medicine by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const medicine = await medicinesModel.findById(req.params.id, req.user.id);

    if (!medicine) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medicine not found'
      });
    }

    res.json({ medicine });
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch medicine'
    });
  }
});

/**
 * POST /api/medicines
 * Create a new medicine
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('strength').trim().notEmpty().withMessage('Strength is required'),
    body('form')
      .isIn(['tablet', 'capsule', 'liquid', 'injection', 'inhaler', 'other'])
      .withMessage('Invalid form'),
    body('stock_count').optional().isInt({ min: 0 }).withMessage('Stock count must be a positive integer'),
    body('refill_threshold').optional().isInt({ min: 0 }).withMessage('Refill threshold must be a positive integer')
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

      const medicineData = {
        id: uuidv4(),
        user_id: req.user.id,
        ...req.body
      };

      const medicine = await medicinesModel.create(medicineData);

      res.status(201).json({ medicine });
    } catch (error) {
      console.error('Create medicine error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create medicine'
      });
    }
  }
);

/**
 * PUT /api/medicines/:id
 * Update a medicine
 */
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('strength').optional().trim().notEmpty().withMessage('Strength cannot be empty'),
    body('form')
      .optional()
      .isIn(['tablet', 'capsule', 'liquid', 'injection', 'inhaler', 'other'])
      .withMessage('Invalid form'),
    body('stock_count').optional().isInt({ min: 0 }).withMessage('Stock count must be a positive integer'),
    body('refill_threshold').optional().isInt({ min: 0 }).withMessage('Refill threshold must be a positive integer')
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

      const medicine = await medicinesModel.update(
        req.params.id,
        req.user.id,
        req.body
      );

      if (!medicine) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Medicine not found'
        });
      }

      res.json({ medicine });
    } catch (error) {
      console.error('Update medicine error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update medicine'
      });
    }
  }
);

/**
 * DELETE /api/medicines/:id
 * Delete a medicine
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await medicinesModel.remove(req.params.id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medicine not found'
      });
    }

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete medicine'
    });
  }
});

export default router;
