import { supabase } from '@/lib/supabase';
import type { Medicine } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

class MedicinesService {
  /**
   * Create a new medicine
   */
  async create(medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('medicines')
      .insert({
        user_id: medicine.userId,
        name: medicine.name,
        nickname: medicine.nickname,
        strength: medicine.strength,
        form: medicine.form,
        color_tag: medicine.colorTag,
        icon_key: medicine.iconKey,
        stock_count: medicine.stockCount || 0,
        refill_threshold: medicine.refillThreshold || 10,
        instructions: medicine.instructions,
        frequency: medicine.frequency,
        start_date: medicine.startDate,
        end_date: medicine.endDate,
        prescribed_by: medicine.prescribedBy,
        refills_remaining: medicine.refillsRemaining,
        quantity: medicine.quantity,
        side_effects: medicine.sideEffects,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToMedicine(data);
  }

  /**
   * Get all medicines for a user
   */
  async getAll(userId: string): Promise<Medicine[]> {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToMedicine);
  }

  /**
   * Get a single medicine by ID
   */
  async getById(id: string): Promise<Medicine> {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.mapToMedicine(data);
  }

  /**
   * Update a medicine
   */
  async update(id: string, updates: Partial<Medicine>) {
    const { data, error } = await supabase
      .from('medicines')
      .update({
        name: updates.name,
        nickname: updates.nickname,
        strength: updates.strength,
        form: updates.form,
        color_tag: updates.colorTag,
        icon_key: updates.iconKey,
        stock_count: updates.stockCount,
        refill_threshold: updates.refillThreshold,
        instructions: updates.instructions,
        frequency: updates.frequency,
        start_date: updates.startDate,
        end_date: updates.endDate,
        prescribed_by: updates.prescribedBy,
        refills_remaining: updates.refillsRemaining,
        quantity: updates.quantity,
        side_effects: updates.sideEffects,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToMedicine(data);
  }

  /**
   * Delete a medicine
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('medicines')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Decrement stock count
   */
  async decrementStock(id: string, amount: number) {
    // Get current stock
    const medicine = await this.getById(id);
    const newStock = Math.max(0, (medicine.stockCount || 0) - amount);

    // Update stock
    return this.update(id, { stockCount: newStock });
  }

  /**
   * Subscribe to real-time changes
   */
  subscribe(userId: string, callback: (payload: any) => void): RealtimeChannel {
    const channel = supabase
      .channel('medicines-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medicines',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return channel;
  }

  /**
   * Unsubscribe from real-time changes
   */
  unsubscribe(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  }

  /**
   * Map database row to Medicine type
   */
  private mapToMedicine(data: any): Medicine {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      nickname: data.nickname,
      strength: data.strength,
      form: data.form,
      colorTag: data.color_tag,
      iconKey: data.icon_key,
      stockCount: data.stock_count,
      refillThreshold: data.refill_threshold,
      instructions: data.instructions,
      frequency: data.frequency,
      startDate: data.start_date,
      endDate: data.end_date,
      prescribedBy: data.prescribed_by,
      refillsRemaining: data.refills_remaining,
      quantity: data.quantity,
      sideEffects: data.side_effects,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const medicinesService = new MedicinesService();
