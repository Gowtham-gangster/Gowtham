import api from '../../lib/api-client';

export interface Notification {
  id: string;
  user_id: string;
  type: 'DOSE_DUE' | 'MISSED_DOSE' | 'REFILL_WARNING' | 'CAREGIVER_ALERT';
  message: string;
  medicine_id?: string;
  is_read: boolean;
  created_at?: string;
}

export interface NotificationFilters {
  is_read?: boolean;
  type?: string;
  limit?: number;
}

export const notificationsService = {
  async getAll(filters?: NotificationFilters): Promise<{ notifications: Notification[] }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/api/notifications${query}`);
  },

  async getById(id: string): Promise<{ notification: Notification }> {
    return await api.get(`/api/notifications/${id}`);
  },

  async markAsRead(id: string): Promise<{ notification: Notification }> {
    return await api.put(`/api/notifications/${id}/read`);
  },

  async delete(id: string): Promise<{ message: string }> {
    return await api.delete(`/api/notifications/${id}`);
  },
};
