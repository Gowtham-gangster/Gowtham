import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import * as prescriptionsModel from '../models/prescriptions.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const prescriptions = await prescriptionsModel.findByUserId(req.user.id);
    res.json({ prescriptions });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch prescriptions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const prescription = await prescriptionsModel.findById(req.params.id, req.user.id);
    if (!prescription) {
      return res.status(404).json({ error: 'Not found', message: 'Prescription not found' });
    }
    res.json({ prescription });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch prescription' });
  }
});

router.post(
  '/',
  [
    body('file_name').notEmpty().withMessage('File name is required'),
    body('status').optional().isIn(['pending', 'processed', 'error']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const prescriptionData = {
        id: uuidv4(),
        user_id: req.user.id,
        ...req.body
      };

      const prescription = await prescriptionsModel.create(prescriptionData);
      res.status(201).json({ prescription });
    } catch (error) {
      console.error('Create prescription error:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to create prescription' });
    }
  }
);

router.put('/:id', async (req, res) => {
  try {
    const prescription = await prescriptionsModel.update(req.params.id, req.user.id, req.body);
    if (!prescription) {
      return res.status(404).json({ error: 'Not found', message: 'Prescription not found' });
    }
    res.json({ prescription });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to update prescription' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await prescriptionsModel.remove(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Not found', message: 'Prescription not found' });
    }
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete prescription' });
  }
});

export default router;
