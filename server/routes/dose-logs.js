import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import * as doseLogsModel from '../models/dose-logs.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      medicine_id: req.query.medicine_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit
    };

    const doseLogs = await doseLogsModel.findByUserId(req.user.id, filters);
    res.json({ doseLogs });
  } catch (error) {
    console.error('Get dose logs error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch dose logs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doseLog = await doseLogsModel.findById(req.params.id, req.user.id);
    if (!doseLog) {
      return res.status(404).json({ error: 'Not found', message: 'Dose log not found' });
    }
    res.json({ doseLog });
  } catch (error) {
    console.error('Get dose log error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch dose log' });
  }
});

router.post(
  '/',
  [
    body('medicine_id').notEmpty().withMessage('Medicine ID is required'),
    body('scheduled_time').notEmpty().withMessage('Scheduled time is required'),
    body('status').isIn(['PENDING', 'TAKEN', 'MISSED', 'SKIPPED']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const doseLogData = {
        id: uuidv4(),
        user_id: req.user.id,
        ...req.body
      };

      const doseLog = await doseLogsModel.create(doseLogData);
      res.status(201).json({ doseLog });
    } catch (error) {
      console.error('Create dose log error:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to create dose log' });
    }
  }
);

router.put('/:id', async (req, res) => {
  try {
    const doseLog = await doseLogsModel.update(req.params.id, req.user.id, req.body);
    if (!doseLog) {
      return res.status(404).json({ error: 'Not found', message: 'Dose log not found' });
    }
    res.json({ doseLog });
  } catch (error) {
    console.error('Update dose log error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to update dose log' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await doseLogsModel.remove(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Not found', message: 'Dose log not found' });
    }
    res.json({ message: 'Dose log deleted successfully' });
  } catch (error) {
    console.error('Delete dose log error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete dose log' });
  }
});

export default router;
