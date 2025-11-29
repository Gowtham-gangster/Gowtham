import { supabase } from '@/lib/supabase';
import type { Schedule } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

class SchedulesService {
  /**
   * Create a new schedule
   */
  async create(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('schedules')
      .insert({
        medicine_id: schedule.medicineId,
        frequency_type: schedule.frequencyType,
        times_of_day: schedule.timesOfDay,
        days_of_week: schedule.daysOfWeek,
        interval_days: schedule.intervalDays,
        interval_hours: schedule.intervalHours,
        start_date: schedule.startDate,
        end_date: schedule.endDate,
        dosage_amount: schedule.dosageAmount,
        dosage_unit: schedule.dosageUnit,
        max_dose_per_day: schedule.maxDosePerDay,
        max_dose_per_intake: schedule.maxDosePerIntake,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToSchedule(data);
  }

  /**
   * Get all schedules for a medicine
   */
  async getByMedicineId(medicineId: string): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('medicine_id', medicineId);

    if (error) throw error;
    return data.map(this.mapToSchedule);
  }

  /**
   * Get schedule by ID
   */
  async getById(id: string): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.mapToSchedule(data);
  }

  /**
   * Update a schedule
   */
  async update(id: string, updates: Partial<Schedule>) {
    const { data, error } = await supabase
      .from('schedules')
      .update({
        frequency_type: updates.frequencyType,
        times_of_day: updates.timesOfDay,
        days_of_week: updates.daysOfWeek,
        interval_days: updates.intervalDays,
        interval_hours: updates.intervalHours,
        start_date: updates.startDate,
        end_date: updates.endDate,
        dosage_amount: updates.dosageAmount,
        dosage_unit: updates.dosageUnit,
        max_dose_per_day: updates.maxDosePerDay,
        max_dose_per_intake: updates.maxDosePerIntake,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToSchedule(data);
  }

  /**
   * Delete a schedule
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Subscribe to real-time changes
   */
  subscribe(medicineId: string, callback: (payload: any) => void): RealtimeChannel {
    const channel = supabase
      .channel('schedules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules',
          filter: `medicine_id=eq.${medicineId}`,
        },
        callback
      )
      .subscribe();

    return channel;
  }

  /**
   * Map database row to Schedule type
   */
  private mapToSchedule(data: any): Schedule {
    return {
      id: data.id,
      medicineId: data.medicine_id,
      frequencyType: data.frequency_type,
      timesOfDay: data.times_of_day,
      daysOfWeek: data.days_of_week,
      intervalDays: data.interval_days,
      intervalHours: data.interval_hours,
      startDate: data.start_date,
      endDate: data.end_date,
      dosageAmount: data.dosage_amount,
      dosageUnit: data.dosage_unit,
      maxDosePerDay: data.max_dose_per_day,
      maxDosePerIntake: data.max_dose_per_intake,
    };
  }
}

export const schedulesService = new SchedulesService();
