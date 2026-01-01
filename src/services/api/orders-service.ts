import api from '../../lib/api-client';

export interface Order {
  id: string;
  user_id: string;
  vendor: any;
  items: any[];
  notes?: string;
  delivery: any;
  created_at?: string;
  updated_at?: string;
}

export const ordersService = {
  async getAll(): Promise<{ orders: Order[] }> {
    return await api.get('/api/orders');
  },

  async getById(id: string): Promise<{ order: Order }> {
    return await api.get(`/api/orders/${id}`);
  },

  async create(data: Partial<Order>): Promise<{ order: Order }> {
    return await api.post('/api/orders', data);
  },

  async update(id: string, data: Partial<Order>): Promise<{ order: Order }> {
    return await api.put(`/api/orders/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return await api.delete(`/api/orders/${id}`);
  },
};
