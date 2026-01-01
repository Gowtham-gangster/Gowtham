import api from '../../lib/api-client';

export interface DoseLog {
  id: string;
  user_id: string;
  medicine_id: string;
  scheduled_time: string;
  taken_time?: string;
  status: 'PENDING' | 'TAKEN' | 'MISSED' | 'SKIPPED';
  notes?: string;
  created_at?: string;
}

export interface DoseLogFilters {
  status?: string;
  medicine_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export const doseLogsService = {
  async getAll(filters?: DoseLogFilters): Promise<{ doseLogs: DoseLog[] }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/api/dose-logs${query}`);
  },

  async getById(id: string): Promise<{ doseLog: DoseLog }> {
    return await api.get(`/api/dose-logs/${id}`);
  },

  async create(data: Partial<DoseLog>): Promise<{ doseLog: DoseLog }> {
    return await api.post('/api/dose-logs', data);
  },

  async update(id: string, data: Partial<DoseLog>): Promise<{ doseLog: DoseLog }> {
    return await api.put(`/api/dose-logs/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return await api.delete(`/api/dose-logs/${id}`);
  },
};
