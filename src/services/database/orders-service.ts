import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';

class OrdersService {
  /**
   * Create a new order
   */
  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: order.userId,
        vendor: order.vendor,
        items: order.items,
        notes: order.notes,
        delivery: order.delivery,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToOrder(data);
  }

  /**
   * Get all orders for a user
   */
  async getAll(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToOrder);
  }

  /**
   * Get order by ID
   */
  async getById(id: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.mapToOrder(data);
  }

  /**
   * Update an order
   */
  async update(id: string, updates: Partial<Order>) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        vendor: updates.vendor,
        items: updates.items,
        notes: updates.notes,
        delivery: updates.delivery,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToOrder(data);
  }

  /**
   * Delete an order
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Map database row to Order type
   */
  private mapToOrder(data: any): Order {
    return {
      id: data.id,
      userId: data.user_id,
      vendor: data.vendor,
      items: data.items,
      notes: data.notes,
      delivery: data.delivery,
      createdAt: data.created_at,
    };
  }
}

export const ordersService = new OrdersService();
