import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import * as notificationsModel from '../models/notifications.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const filters = {
      is_read: req.query.is_read === 'true' ? true : req.query.is_read === 'false' ? false : undefined,
      type: req.query.type,
      limit: req.query.limit
    };

    const notifications = await notificationsModel.findByUserId(req.user.id, filters);
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch notifications' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const notification = await notificationsModel.findById(req.params.id, req.user.id);
    if (!notification) {
      return res.status(404).json({ error: 'Not found', message: 'Notification not found' });
    }
    res.json({ notification });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch notification' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const notification = await notificationsModel.markAsRead(req.params.id, req.user.id);
    if (!notification) {
      return res.status(404).json({ error: 'Not found', message: 'Notification not found' });
    }
    res.json({ notification });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to update notification' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await notificationsModel.remove(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Not found', message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete notification' });
  }
});

export default router;
