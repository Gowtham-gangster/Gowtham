import api from '../../lib/api-client';

export interface Prescription {
  id: string;
  user_id: string;
  file_name: string;
  uploaded_at?: string;
  parsed_medicines?: any;
  status: 'pending' | 'processed' | 'error';
  analysis_result?: any;
  linked_disease_profiles?: any;
  is_analyzed?: boolean;
  created_at?: string;
}

export const prescriptionsService = {
  async getAll(): Promise<{ prescriptions: Prescription[] }> {
    return await api.get('/api/prescriptions');
  },

  async getById(id: string): Promise<{ prescription: Prescription }> {
    return await api.get(`/api/prescriptions/${id}`);
  },

  async create(data: Partial<Prescription>): Promise<{ prescription: Prescription }> {
    return await api.post('/api/prescriptions', data);
  },

  async update(id: string, data: Partial<Prescription>): Promise<{ prescription: Prescription }> {
    return await api.put(`/api/prescriptions/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return await api.delete(`/api/prescriptions/${id}`);
  },
};
