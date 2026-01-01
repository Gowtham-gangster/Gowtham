import database from '../config/database.js';

/**
 * Dose Log Repository
 */

export const findByUserId = async (userId, filters = {}) => {
  let query = `
    SELECT id, user_id, medicine_id, scheduled_time, taken_time, status, notes, created_at
    FROM dose_logs
    WHERE user_id = ?
  `;
  const params = [userId];

  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters.medicine_id) {
    query += ' AND medicine_id = ?';
    params.push(filters.medicine_id);
  }

  if (filters.start_date) {
    query += ' AND scheduled_time >= ?';
    params.push(filters.start_date);
  }

  if (filters.end_date) {
    query += ' AND scheduled_time <= ?';
    params.push(filters.end_date);
  }

  query += ' ORDER BY scheduled_time DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(parseInt(filters.limit));
  }

  return await database.query(query, params);
};

export const findById = async (id, userId) => {
  const logs = await database.query(
    'SELECT * FROM dose_logs WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return logs.length > 0 ? logs[0] : null;
};

export const create = async (doseLog) => {
  const { id, user_id, medicine_id, scheduled_time, taken_time, status, notes } = doseLog;

  await database.query(
    `INSERT INTO dose_logs (id, user_id, medicine_id, scheduled_time, taken_time, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, user_id, medicine_id, scheduled_time, taken_time || null, status, notes || null]
  );

  return findById(id, user_id);
};

export const update = async (id, userId, updates) => {
  const allowedFields = ['taken_time', 'status', 'notes'];
  const updateFields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updateFields.length === 0) {
    return findById(id, userId);
  }

  values.push(id, userId);

  await database.query(
    `UPDATE dose_logs SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  );

  return findById(id, userId);
};

export const remove = async (id, userId) => {
  const result = await database.query(
    'DELETE FROM dose_logs WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result.affectedRows > 0;
};
