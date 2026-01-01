import database from '../config/database.js';

/**
 * Schedule Repository
 * Handles all database operations for schedules
 */

/**
 * Find all schedules for a user's medicines
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of schedules
 */
export const findByUserId = async (userId) => {
  const schedules = await database.query(
    `SELECT s.id, s.medicine_id, s.frequency_type, s.times_of_day, s.days_of_week,
            s.interval_days, s.interval_hours, s.start_date, s.end_date,
            s.dosage_amount, s.dosage_unit, s.max_dose_per_day, s.max_dose_per_intake,
            s.created_at, s.updated_at
     FROM schedules s
     INNER JOIN medicines m ON s.medicine_id = m.id
     WHERE m.user_id = ?
     ORDER BY s.created_at DESC`,
    [userId]
  );

  return schedules.map(schedule => ({
    ...schedule,
    times_of_day: schedule.times_of_day ? JSON.parse(schedule.times_of_day) : [],
    days_of_week: schedule.days_of_week ? JSON.parse(schedule.days_of_week) : null
  }));
};

/**
 * Find schedules by medicine ID
 * @param {string} medicineId - Medicine ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Array>} Array of schedules
 */
export const findByMedicineId = async (medicineId, userId) => {
  const schedules = await database.query(
    `SELECT s.id, s.medicine_id, s.frequency_type, s.times_of_day, s.days_of_week,
            s.interval_days, s.interval_hours, s.start_date, s.end_date,
            s.dosage_amount, s.dosage_unit, s.max_dose_per_day, s.max_dose_per_intake,
            s.created_at, s.updated_at
     FROM schedules s
     INNER JOIN medicines m ON s.medicine_id = m.id
     WHERE s.medicine_id = ? AND m.user_id = ?
     ORDER BY s.created_at DESC`,
    [medicineId, userId]
  );

  return schedules.map(schedule => ({
    ...schedule,
    times_of_day: schedule.times_of_day ? JSON.parse(schedule.times_of_day) : [],
    days_of_week: schedule.days_of_week ? JSON.parse(schedule.days_of_week) : null
  }));
};

/**
 * Find schedule by ID
 * @param {string} id - Schedule ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} Schedule object or null
 */
export const findById = async (id, userId) => {
  const schedules = await database.query(
    `SELECT s.id, s.medicine_id, s.frequency_type, s.times_of_day, s.days_of_week,
            s.interval_days, s.interval_hours, s.start_date, s.end_date,
            s.dosage_amount, s.dosage_unit, s.max_dose_per_day, s.max_dose_per_intake,
            s.created_at, s.updated_at
     FROM schedules s
     INNER JOIN medicines m ON s.medicine_id = m.id
     WHERE s.id = ? AND m.user_id = ?`,
    [id, userId]
  );

  if (schedules.length === 0) {
    return null;
  }

  const schedule = schedules[0];
  return {
    ...schedule,
    times_of_day: schedule.times_of_day ? JSON.parse(schedule.times_of_day) : [],
    days_of_week: schedule.days_of_week ? JSON.parse(schedule.days_of_week) : null
  };
};

/**
 * Create a new schedule
 * @param {Object} schedule - Schedule data
 * @returns {Promise<Object>} Created schedule
 */
export const create = async (schedule) => {
  const {
    id,
    medicine_id,
    frequency_type,
    times_of_day,
    days_of_week,
    interval_days,
    interval_hours,
    start_date,
    end_date,
    dosage_amount,
    dosage_unit,
    max_dose_per_day,
    max_dose_per_intake
  } = schedule;

  // Get user_id from medicine to verify ownership
  const medicines = await database.query(
    'SELECT user_id FROM medicines WHERE id = ?',
    [medicine_id]
  );

  if (medicines.length === 0) {
    throw new Error('Medicine not found');
  }

  await database.query(
    `INSERT INTO schedules (
      id, medicine_id, frequency_type, times_of_day, days_of_week,
      interval_days, interval_hours, start_date, end_date,
      dosage_amount, dosage_unit, max_dose_per_day, max_dose_per_intake
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      medicine_id,
      frequency_type,
      JSON.stringify(times_of_day),
      days_of_week ? JSON.stringify(days_of_week) : null,
      interval_days || null,
      interval_hours || null,
      start_date,
      end_date || null,
      dosage_amount,
      dosage_unit,
      max_dose_per_day || null,
      max_dose_per_intake || null
    ]
  );

  return findById(id, medicines[0].user_id);
};

/**
 * Update a schedule
 * @param {string} id - Schedule ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated schedule or null
 */
export const update = async (id, userId, updates) => {
  const allowedFields = [
    'frequency_type', 'times_of_day', 'days_of_week', 'interval_days',
    'interval_hours', 'start_date', 'end_date', 'dosage_amount',
    'dosage_unit', 'max_dose_per_day', 'max_dose_per_intake'
  ];

  const updateFields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      
      if (key === 'times_of_day' || key === 'days_of_week') {
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
    `UPDATE schedules s
     INNER JOIN medicines m ON s.medicine_id = m.id
     SET ${updateFields.join(', ')}
     WHERE s.id = ? AND m.user_id = ?`,
    values
  );

  return findById(id, userId);
};

/**
 * Delete a schedule
 * @param {string} id - Schedule ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} True if deleted
 */
export const remove = async (id, userId) => {
  const result = await database.query(
    `DELETE s FROM schedules s
     INNER JOIN medicines m ON s.medicine_id = m.id
     WHERE s.id = ? AND m.user_id = ?`,
    [id, userId]
  );

  return result.affectedRows > 0;
};
