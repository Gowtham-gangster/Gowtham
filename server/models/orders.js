import database from '../config/database.js';

export const findByUserId = async (userId) => {
  const orders = await database.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return orders.map(o => ({
    ...o,
    vendor: o.vendor ? JSON.parse(o.vendor) : {},
    items: o.items ? JSON.parse(o.items) : [],
    delivery: o.delivery ? JSON.parse(o.delivery) : {}
  }));
};

export const findById = async (id, userId) => {
  const orders = await database.query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (orders.length === 0) return null;
  
  const o = orders[0];
  return {
    ...o,
    vendor: o.vendor ? JSON.parse(o.vendor) : {},
    items: o.items ? JSON.parse(o.items) : [],
    delivery: o.delivery ? JSON.parse(o.delivery) : {}
  };
};

export const create = async (order) => {
  const { id, user_id, vendor, items, notes, delivery } = order;

  await database.query(
    `INSERT INTO orders (id, user_id, vendor, items, notes, delivery)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id, user_id,
      JSON.stringify(vendor),
      JSON.stringify(items),
      notes || null,
      JSON.stringify(delivery)
    ]
  );

  return findById(id, user_id);
};

export const update = async (id, userId, updates) => {
  const allowedFields = ['vendor', 'items', 'notes', 'delivery'];
  const updateFields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      if (['vendor', 'items', 'delivery'].includes(key)) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    }
  }

  if (updateFields.length === 0) return findById(id, userId);

  values.push(id, userId);
  await database.query(
    `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  );

  return findById(id, userId);
};

export const remove = async (id, userId) => {
  const result = await database.query(
    'DELETE FROM orders WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result.affectedRows > 0;
};
