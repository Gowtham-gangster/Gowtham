import api from '../../lib/api-client';

export interface Medicine {
  id: string;
  user_id: string;
  name: string;
  nickname?: string;
  strength: string;
  form: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'inhaler' | 'other';
  color_tag?: string;
  icon_key?: string;
  stock_count?: number;
  refill_threshold?: number;
  instructions?: string;
  frequency?: any;
  start_date?: string;
  end_date?: string;
  prescribed_by?: string;
  refills_remaining?: number;
  quantity?: number;
  side_effects?: any;
  created_at?: string;
  updated_at?: string;
}

export const medicinesService = {
  async getAll(): Promise<{ medicines: Medicine[] }> {
    return await api.get('/api/medicines');
  },

  async getById(id: string): Promise<{ medicine: Medicine }> {
    return await api.get(`/api/medicines/${id}`);
  },

  async create(data: Partial<Medicine>): Promise<{ medicine: Medicine }> {
    return await api.post('/api/medicines', data);
  },

  async update(id: string, data: Partial<Medicine>): Promise<{ medicine: Medicine }> {
    return await api.put(`/api/medicines/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return await api.delete(`/api/medicines/${id}`);
  },
};
