import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import * as schedulesModel from '../models/schedules.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/schedules
 * Get all schedules for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const schedules = await schedulesModel.findByUserId(req.user.id);
    res.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch schedules'
    });
  }
});

/**
 * GET /api/schedules/medicine/:medicineId
 * Get schedules for a specific medicine
 */
router.get('/medicine/:medicineId', async (req, res) => {
  try {
    const schedules = await schedulesModel.findByMedicineId(
      req.params.medicineId,
      req.user.id
    );
    res.json({ schedules });
  } catch (error) {
    console.error('Get medicine schedules error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch schedules'
    });
  }
});

/**
 * GET /api/schedules/:id
 * Get a single schedule by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const schedule = await schedulesModel.findById(req.params.id, req.user.id);

    if (!schedule) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Schedule not found'
      });
    }

    res.json({ schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch schedule'
    });
  }
});

/**
 * POST /api/schedules
 * Create a new schedule
 */
router.post(
  '/',
  [
    body('medicine_id').notEmpty().withMessage('Medicine ID is required'),
    body('frequency_type')
      .isIn(['DAILY', 'WEEKDAYS', 'CUSTOM_DAYS', 'EVERY_X_DAYS', 'EVERY_X_HOURS', 'AS_NEEDED'])
      .withMessage('Invalid frequency type'),
    body('times_of_day')
      .isArray({ min: 1 })
      .withMessage('Times of day must be a non-empty array'),
    body('start_date').notEmpty().withMessage('Start date is required'),
    body('dosage_amount').isFloat({ min: 0 }).withMessage('Dosage amount must be a positive number'),
    body('dosage_unit').notEmpty().withMessage('Dosage unit is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const scheduleData = {
        id: uuidv4(),
        ...req.body
      };

      const schedule = await schedulesModel.create(scheduleData);

      res.status(201).json({ schedule });
    } catch (error) {
      console.error('Create schedule error:', error);
      
      if (error.message === 'Medicine not found') {
        return res.status(404).json({
          error: 'Not found',
          message: 'Medicine not found'
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create schedule'
      });
    }
  }
);

/**
 * PUT /api/schedules/:id
 * Update a schedule
 */
router.put('/:id', async (req, res) => {
  try {
    const schedule = await schedulesModel.update(
      req.params.id,
      req.user.id,
      req.body
    );

    if (!schedule) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Schedule not found'
      });
    }

    res.json({ schedule });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update schedule'
    });
  }
});

/**
 * DELETE /api/schedules/:id
 * Delete a schedule
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await schedulesModel.remove(req.params.id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Schedule not found'
      });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete schedule'
    });
  }
});

export default router;
