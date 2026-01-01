import database from '../config/database.js';

export const findByUserId = async (userId) => {
  const prescriptions = await database.query(
    'SELECT * FROM prescriptions WHERE user_id = ? ORDER BY uploaded_at DESC',
    [userId]
  );
  return prescriptions.map(p => ({
    ...p,
    parsed_medicines: p.parsed_medicines ? JSON.parse(p.parsed_medicines) : null,
    analysis_result: p.analysis_result ? JSON.parse(p.analysis_result) : null,
    linked_disease_profiles: p.linked_disease_profiles ? JSON.parse(p.linked_disease_profiles) : null
  }));
};

export const findById = async (id, userId) => {
  const prescriptions = await database.query(
    'SELECT * FROM prescriptions WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (prescriptions.length === 0) return null;
  
  const p = prescriptions[0];
  return {
    ...p,
    parsed_medicines: p.parsed_medicines ? JSON.parse(p.parsed_medicines) : null,
    analysis_result: p.analysis_result ? JSON.parse(p.analysis_result) : null,
    linked_disease_profiles: p.linked_disease_profiles ? JSON.parse(p.linked_disease_profiles) : null
  };
};

export const create = async (prescription) => {
  const { id, user_id, file_name, parsed_medicines, status, analysis_result, linked_disease_profiles, is_analyzed } = prescription;

  await database.query(
    `INSERT INTO prescriptions (id, user_id, file_name, parsed_medicines, status, analysis_result, linked_disease_profiles, is_analyzed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, user_id, file_name,
      parsed_medicines ? JSON.stringify(parsed_medicines) : null,
      status || 'pending',
      analysis_result ? JSON.stringify(analysis_result) : null,
      linked_disease_profiles ? JSON.stringify(linked_disease_profiles) : null,
      is_analyzed || false
    ]
  );

  return findById(id, user_id);
};

export const update = async (id, userId, updates) => {
  const allowedFields = ['parsed_medicines', 'status', 'analysis_result', 'linked_disease_profiles', 'is_analyzed'];
  const updateFields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      if (['parsed_medicines', 'analysis_result', 'linked_disease_profiles'].includes(key)) {
        values.push(value ? JSON.stringify(value) : null);
      } else {
        values.push(value);
      }
    }
  }

  if (updateFields.length === 0) return findById(id, userId);

  values.push(id, userId);
  await database.query(
    `UPDATE prescriptions SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  );

  return findById(id, userId);
};

export const remove = async (id, userId) => {
  const result = await database.query(
    'DELETE FROM prescriptions WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result.affectedRows > 0;
};
