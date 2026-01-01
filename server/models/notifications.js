import database from '../config/database.js';

export const findByUserId = async (userId, filters = {}) => {
  let query = 'SELECT * FROM notifications WHERE user_id = ?';
  const params = [userId];

  if (filters.is_read !== undefined) {
    query += ' AND is_read = ?';
    params.push(filters.is_read);
  }

  if (filters.type) {
    query += ' AND type = ?';
    params.push(filters.type);
  }

  query += ' ORDER BY created_at DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(parseInt(filters.limit));
  }

  return await database.query(query, params);
};

export const findById = async (id, userId) => {
  const notifications = await database.query(
    'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return notifications.length > 0 ? notifications[0] : null;
};

export const create = async (notification) => {
  const { id, user_id, type, message, medicine_id, is_read } = notification;

  await database.query(
    `INSERT INTO notifications (id, user_id, type, message, medicine_id, is_read)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, user_id, type, message, medicine_id || null, is_read || false]
  );

  return findById(id, user_id);
};

export const markAsRead = async (id, userId) => {
  await database.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return findById(id, userId);
};

export const remove = async (id, userId) => {
  const result = await database.query(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result.affectedRows > 0;
};
