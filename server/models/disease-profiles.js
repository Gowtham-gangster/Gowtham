import database from '../config/database.js';

export const findByUserId = async (userId) => {
  const profiles = await database.query(
    'SELECT * FROM disease_profiles WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return profiles.map(p => ({
    ...p,
    personal_info: p.personal_info ? JSON.parse(p.personal_info) : {},
    symptoms: p.symptoms ? JSON.parse(p.symptoms) : null,
    lifestyle: p.lifestyle ? JSON.parse(p.lifestyle) : null
  }));
};

export const findById = async (id, userId) => {
  const profiles = await database.query(
    'SELECT * FROM disease_profiles WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (profiles.length === 0) return null;
  
  const p = profiles[0];
  return {
    ...p,
    personal_info: p.personal_info ? JSON.parse(p.personal_info) : {},
    symptoms: p.symptoms ? JSON.parse(p.symptoms) : null,
    lifestyle: p.lifestyle ? JSON.parse(p.lifestyle) : null
  };
};

export const create = async (profile) => {
  const { id, user_id, disease_id, disease_name, personal_info, symptoms, lifestyle, medication_history } = profile;

  await database.query(
    `INSERT INTO disease_profiles (id, user_id, disease_id, disease_name, personal_info, symptoms, lifestyle, medication_history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, user_id, disease_id, disease_name,
      JSON.stringify(personal_info),
      symptoms ? JSON.stringify(symptoms) : null,
      lifestyle ? JSON.stringify(lifestyle) : null,
      medication_history || null
    ]
  );

  return findById(id, user_id);
};

export const update = async (id, userId, updates) => {
  const allowedFields = ['disease_name', 'personal_info', 'symptoms', 'lifestyle', 'medication_history'];
  const updateFields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      if (['personal_info', 'symptoms', 'lifestyle'].includes(key)) {
        values.push(value ? JSON.stringify(value) : null);
      } else {
        values.push(value);
      }
    }
  }

  if (updateFields.length === 0) return findById(id, userId);

  values.push(id, userId);
  await database.query(
    `UPDATE disease_profiles SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  );

  return findById(id, userId);
};

export const remove = async (id, userId) => {
  const result = await database.query(
    'DELETE FROM disease_profiles WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result.affectedRows > 0;
};
