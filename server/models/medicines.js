import database from '../config/database.js';

/**
 * Medicine Repository
 * Handles all database operations for medicines
 */

/**
 * Find all medicines for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of medicines
 */
export const findByUserId = async (userId) => {
  const medicines = await database.query(
    `SELECT id, user_id, name, nickname, strength, form, color_tag, icon_key,
            stock_count, refill_threshold, instructions, frequency, start_date,
            end_date, prescribed_by, refills_remaining, quantity, side_effects,
            created_at, updated_at
     FROM medicines
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  // Parse JSON fields
  return medicines.map(medicine => ({
    ...medicine,
    frequency: medicine.frequency ? JSON.parse(medicine.frequency) : null,
    side_effects: medicine.side_effects ? JSON.parse(medicine.side_effects) : null
  }));
};

/**
 * Find medicine by ID
 * @param {string} id - Medicine ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} Medicine object or null
 */
export const findById = async (id, userId) => {
  const medicines = await database.query(
    `SELECT id, user_id, name, nickname, strength, form, color_tag, icon_key,
            stock_count, refill_threshold, instructions, frequency, start_date,
            end_date, prescribed_by, refills_remaining, quantity, side_effects,
            created_at, updated_at
     FROM medicines
     WHERE id = ? AND user_id = ?`,
    [id, userId]
  );

  if (medicines.length === 0) {
    return null;
  }

  const medicine = medicines[0];
  return {
    ...medicine,
    frequency: medicine.frequency ? JSON.parse(medicine.frequency) : null,
    side_effects: medicine.side_effects ? JSON.parse(medicine.side_effects) : null
  };
};

/**
 * Create a new medicine
 * @param {Object} medicine - Medicine data
 * @returns {Promise<Object>} Created medicine
 */
export const create = async (medicine) => {
  const {
    id,
    user_id,
    name,
    nickname,
    strength,
    form,
    color_tag,
    icon_key,
    stock_count,
    refill_threshold,
    instructions,
    frequency,
    start_date,
    end_date,
    prescribed_by,
    refills_remaining,
    quantity,
    side_effects
  } = medicine;

  await database.query(
    `INSERT INTO medicines (
      id, user_id, name, nickname, strength, form, color_tag, icon_key,
      stock_count, refill_threshold, instructions, frequency, start_date,
      end_date, prescribed_by, refills_remaining, quantity, side_effects
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      user_id,
      name,
      nickname || null,
      strength,
      form,
      color_tag || null,
      icon_key || null,
      stock_count || 0,
      refill_threshold || 10,
      instructions || null,
      frequency ? JSON.stringify(frequency) : null,
      start_date || null,
      end_date || null,
      prescribed_by || null,
      refills_remaining || null,
      quantity || null,
      side_effects ? JSON.stringify(side_effects) : null
    ]
  );

  return findById(id, user_id);
};

/**
 * Update a medicine
 * @param {string} id - Medicine ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated medicine or null
 */
export const update = async (id, userId, updates) => {
  // Build dynamic update query
  const allowedFields = [
    'name', 'nickname', 'strength', 'form', 'color_tag', 'icon_key',
    'stock_count', 'refill_threshold', 'instructions', 'frequency',
    'start_date', 'end_date', 'prescribed_by', 'refills_remaining',
    'quantity', 'side_effects'
  ];

  const updateFields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      
      // Stringify JSON fields
      if (key === 'frequency' || key === 'side_effects') {
        values.push(value ? JSON.stringify(value) : null);
      } else {
        values.push(value);
      }
    }
  }

  if (updateFields.length === 0) {
    return findById(id, userId);
  }

  values.push(id, userId);

  await database.query(
    `UPDATE medicines 
     SET ${updateFields.join(', ')}
     WHERE id = ? AND user_id = ?`,
    values
  );

  return findById(id, userId);
};

/**
 * Delete a medicine
 * @param {string} id - Medicine ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} True if deleted
 */
export const remove = async (id, userId) => {
  const result = await database.query(
    'DELETE FROM medicines WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  return result.affectedRows > 0;
};
