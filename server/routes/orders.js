import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import * as ordersModel from '../models/orders.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const orders = await ordersModel.findByUserId(req.user.id);
    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch orders' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await ordersModel.findById(req.params.id, req.user.id);
    if (!order) {
      return res.status(404).json({ error: 'Not found', message: 'Order not found' });
    }
    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch order' });
  }
});

router.post(
  '/',
  [
    body('vendor').isObject().withMessage('Vendor must be an object'),
    body('items').isArray().withMessage('Items must be an array'),
    body('delivery').isObject().withMessage('Delivery must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const orderData = {
        id: uuidv4(),
        user_id: req.user.id,
        ...req.body
      };

      const order = await ordersModel.create(orderData);
      res.status(201).json({ order });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to create order' });
    }
  }
);

router.put('/:id', async (req, res) => {
  try {
    const order = await ordersModel.update(req.params.id, req.user.id, req.body);
    if (!order) {
      return res.status(404).json({ error: 'Not found', message: 'Order not found' });
    }
    res.json({ order });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to update order' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await ordersModel.remove(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Not found', message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete order' });
  }
});

export default router;
