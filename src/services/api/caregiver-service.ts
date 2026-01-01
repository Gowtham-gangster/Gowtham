import api from '../../lib/api-client';

export interface CaregiverLink {
  id: string;
  caregiver_id: string;
  patient_id: string;
  patient_name: string;
  created_at?: string;
}

export const caregiverService = {
  async getAll(): Promise<{ caregiverLinks: CaregiverLink[]; patientLinks: CaregiverLink[] }> {
    return await api.get('/api/caregiver-links');
  },

  async getById(id: string): Promise<{ link: CaregiverLink }> {
    return await api.get(`/api/caregiver-links/${id}`);
  },

  async create(data: { patient_id: string; patient_name: string }): Promise<{ link: CaregiverLink }> {
    return await api.post('/api/caregiver-links', data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return await api.delete(`/api/caregiver-links/${id}`);
  },
};
