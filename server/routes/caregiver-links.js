import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import * as caregiverLinksModel from '../models/caregiver-links.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    // Get links where user is either caregiver or patient
    const asCaregiver = await caregiverLinksModel.findByCaregiverId(req.user.id);
    const asPatient = await caregiverLinksModel.findByPatientId(req.user.id);
    
    res.json({ 
      caregiverLinks: asCaregiver,
      patientLinks: asPatient
    });
  } catch (error) {
    console.error('Get caregiver links error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch caregiver links' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const link = await caregiverLinksModel.findById(req.params.id, req.user.id);
    if (!link) {
      return res.status(404).json({ error: 'Not found', message: 'Caregiver link not found' });
    }
    res.json({ link });
  } catch (error) {
    console.error('Get caregiver link error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch caregiver link' });
  }
});

router.post(
  '/',
  [
    body('patient_id').notEmpty().withMessage('Patient ID is required'),
    body('patient_name').notEmpty().withMessage('Patient name is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const linkData = {
        id: uuidv4(),
        caregiver_id: req.user.id,
        patient_id: req.body.patient_id,
        patient_name: req.body.patient_name
      };

      const link = await caregiverLinksModel.create(linkData);
      res.status(201).json({ link });
    } catch (error) {
      console.error('Create caregiver link error:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Conflict', message: 'Caregiver link already exists' });
      }

      res.status(500).json({ error: 'Internal server error', message: 'Failed to create caregiver link' });
    }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await caregiverLinksModel.remove(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Not found', message: 'Caregiver link not found' });
    }
    res.json({ message: 'Caregiver link deleted successfully' });
  } catch (error) {
    console.error('Delete caregiver link error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete caregiver link' });
  }
});

export default router;
