import api from '../../lib/api-client';

export interface Schedule {
  id: string;
  medicine_id: string;
  frequency_type: 'DAILY' | 'WEEKDAYS' | 'CUSTOM_DAYS' | 'EVERY_X_DAYS' | 'EVERY_X_HOURS' | 'AS_NEEDED';
  times_of_day: string[];
  days_of_week?: number[];
  interval_days?: number;
  interval_hours?: number;
  start_date: string;
  end_date?: string;
  dosage_amount: number;
  dosage_unit: string;
  max_dose_per_day?: number;
  max_dose_per_intake?: number;
  created_at?: string;
  updated_at?: string;
}

export const schedulesService = {
  async getAll(): Promise<{ schedules: Schedule[] }> {
    return await api.get('/api/schedules');
  },

  async getByMedicineId(medicineId: string): Promise<{ schedules: Schedule[] }> {
    return await api.get(`/api/schedules/medicine/${medicineId}`);
  },

  async getById(id: string): Promise<{ schedule: Schedule }> {
    return await api.get(`/api/schedules/${id}`);
  },

  async create(data: Partial<Schedule>): Promise<{ schedule: Schedule }> {
    return await api.post('/api/schedules', data);
  },

  async update(id: string, data: Partial<Schedule>): Promise<{ schedule: Schedule }> {
    return await api.put(`/api/schedules/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return await api.delete(`/api/schedules/${id}`);
  },
};
