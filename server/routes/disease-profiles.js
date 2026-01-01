import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import * as diseaseProfilesModel from '../models/disease-profiles.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const profiles = await diseaseProfilesModel.findByUserId(req.user.id);
    res.json({ profiles });
  } catch (error) {
    console.error('Get disease profiles error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch disease profiles' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profile = await diseaseProfilesModel.findById(req.params.id, req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Not found', message: 'Disease profile not found' });
    }
    res.json({ profile });
  } catch (error) {
    console.error('Get disease profile error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch disease profile' });
  }
});

router.post(
  '/',
  [
    body('disease_id').notEmpty().withMessage('Disease ID is required'),
    body('disease_name').notEmpty().withMessage('Disease name is required'),
    body('personal_info').isObject().withMessage('Personal info must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const profileData = {
        id: uuidv4(),
        user_id: req.user.id,
        ...req.body
      };

      const profile = await diseaseProfilesModel.create(profileData);
      res.status(201).json({ profile });
    } catch (error) {
      console.error('Create disease profile error:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to create disease profile' });
    }
  }
);

router.put('/:id', async (req, res) => {
  try {
    const profile = await diseaseProfilesModel.update(req.params.id, req.user.id, req.body);
    if (!profile) {
      return res.status(404).json({ error: 'Not found', message: 'Disease profile not found' });
    }
    res.json({ profile });
  } catch (error) {
    console.error('Update disease profile error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to update disease profile' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await diseaseProfilesModel.remove(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Not found', message: 'Disease profile not found' });
    }
    res.json({ message: 'Disease profile deleted successfully' });
  } catch (error) {
    console.error('Delete disease profile error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete disease profile' });
  }
});

export default router;
