import { supabase } from '@/lib/supabase';
import type { DoseLog } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

class DoseLogsService {
  /**
   * Create a new dose log
   */
  async create(log: Omit<DoseLog, 'id'>) {
    const { data, error } = await supabase
      .from('dose_logs')
      .insert({
        user_id: log.odcUserId,
        medicine_id: log.medicineId,
        scheduled_time: log.scheduledTime,
        taken_time: log.takenTime,
        status: log.status,
        notes: log.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToDoseLog(data);
  }

  /**
   * Get all dose logs for a user
   */
  async getAll(userId: string): Promise<DoseLog[]> {
    const { data, error } = await supabase
      .from('dose_logs')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_time', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToDoseLog);
  }

  /**
   * Get dose logs by date range
   */
  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<DoseLog[]> {
    const { data, error } = await supabase
      .from('dose_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_time', startDate)
      .lte('scheduled_time', endDate)
      .order('scheduled_time', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToDoseLog);
  }

  /**
   * Get dose logs for a specific medicine
   */
  async getByMedicineId(medicineId: string): Promise<DoseLog[]> {
    const { data, error } = await supabase
      .from('dose_logs')
      .select('*')
      .eq('medicine_id', medicineId)
      .order('scheduled_time', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToDoseLog);
  }

  /**
   * Update a dose log
   */
  async update(id: string, updates: Partial<DoseLog>) {
    const { data, error } = await supabase
      .from('dose_logs')
      .update({
        taken_time: updates.takenTime,
        status: updates.status,
        notes: updates.notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToDoseLog(data);
  }

  /**
   * Delete a dose log
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('dose_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Subscribe to real-time changes
   */
  subscribe(userId: string, callback: (payload: any) => void): RealtimeChannel {
    const channel = supabase
      .channel('dose-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dose_logs',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return channel;
  }

  /**
   * Map database row to DoseLog type
   */
  private mapToDoseLog(data: any): DoseLog {
    return {
      id: data.id,
      odcUserId: data.user_id,
      medicineId: data.medicine_id,
      scheduledTime: data.scheduled_time,
      takenTime: data.taken_time,
      status: data.status,
      notes: data.notes,
    };
  }
}

export const doseLogsService = new DoseLogsService();
