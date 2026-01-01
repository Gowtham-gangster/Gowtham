import api from '../../lib/api-client';

export interface DiseaseProfile {
  id: string;
  user_id: string;
  disease_id: string;
  disease_name: string;
  personal_info: any;
  symptoms?: any;
  lifestyle?: any;
  medication_history?: string;
  created_at?: string;
  updated_at?: string;
}

export const diseaseProfilesService = {
  async getAll(): Promise<{ profiles: DiseaseProfile[] }> {
    return await api.get('/api/disease-profiles');
  },

  async getById(id: string): Promise<{ profile: DiseaseProfile }> {
    return await api.get(`/api/disease-profiles/${id}`);
  },

  async create(data: Partial<DiseaseProfile>): Promise<{ profile: DiseaseProfile }> {
    return await api.post('/api/disease-profiles', data);
  },

  async update(id: string, data: Partial<DiseaseProfile>): Promise<{ profile: DiseaseProfile }> {
    return await api.put(`/api/disease-profiles/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return await api.delete(`/api/disease-profiles/${id}`);
  },
};
