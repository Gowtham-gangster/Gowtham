import database from '../config/database.js';

export const findByCaregiverId = async (caregiverId) => {
  return await database.query(
    'SELECT * FROM caregiver_links WHERE caregiver_id = ? ORDER BY created_at DESC',
    [caregiverId]
  );
};

export const findByPatientId = async (patientId) => {
  return await database.query(
    'SELECT * FROM caregiver_links WHERE patient_id = ? ORDER BY created_at DESC',
    [patientId]
  );
};

export const findById = async (id, userId) => {
  const links = await database.query(
    'SELECT * FROM caregiver_links WHERE id = ? AND (caregiver_id = ? OR patient_id = ?)',
    [id, userId, userId]
  );
  return links.length > 0 ? links[0] : null;
};

export const create = async (link) => {
  const { id, caregiver_id, patient_id, patient_name } = link;

  await database.query(
    `INSERT INTO caregiver_links (id, caregiver_id, patient_id, patient_name)
     VALUES (?, ?, ?, ?)`,
    [id, caregiver_id, patient_id, patient_name]
  );

  return findById(id, caregiver_id);
};

export const remove = async (id, userId) => {
  const result = await database.query(
    'DELETE FROM caregiver_links WHERE id = ? AND (caregiver_id = ? OR patient_id = ?)',
    [id, userId, userId]
  );
  return result.affectedRows > 0;
};
