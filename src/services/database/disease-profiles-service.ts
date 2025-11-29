import { supabase } from '@/lib/supabase';
import type { DiseaseProfile } from '@/types/chronic-disease';
import type { RealtimeChannel } from '@supabase/supabase-js';

class DiseaseProfilesService {
  /**
   * Create a new disease profile
   */
  async create(profile: Omit<DiseaseProfile, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('disease_profiles')
      .insert({
        user_id: profile.userId,
        disease_id: profile.diseaseId,
        disease_name: profile.diseaseName,
        diagnosis_date: profile.diagnosisDate,
        severity: profile.severity,
        status: profile.status,
        symptoms: profile.symptoms,
        medications: profile.medications,
        last_checkup: profile.lastCheckup,
        next_checkup: profile.nextCheckup,
        doctor_name: profile.doctorName,
        doctor_contact: profile.doctorContact,
        notes: profile.notes,
        guidelines: profile.guidelines,
        precautions: profile.precautions,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToDiseaseProfile(data);
  }

  /**
   * Get all disease profiles for a user
   */
  async getAll(userId: string): Promise<DiseaseProfile[]> {
    const { data, error } = await supabase
      .from('disease_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToDiseaseProfile);
  }

  /**
   * Get disease profile by ID
   */
  async getById(id: string): Promise<DiseaseProfile> {
    const { data, error } = await supabase
      .from('disease_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.mapToDiseaseProfile(data);
  }

  /**
   * Update a disease profile
   */
  async update(id: string, updates: Partial<DiseaseProfile>) {
    const { data, error } = await supabase
      .from('disease_profiles')
      .update({
        disease_name: updates.diseaseName,
        diagnosis_date: updates.diagnosisDate,
        severity: updates.severity,
        status: updates.status,
        symptoms: updates.symptoms,
        medications: updates.medications,
        last_checkup: updates.lastCheckup,
        next_checkup: updates.nextCheckup,
        doctor_name: updates.doctorName,
        doctor_contact: updates.doctorContact,
        notes: updates.notes,
        guidelines: updates.guidelines,
        precautions: updates.precautions,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToDiseaseProfile(data);
  }

  /**
   * Delete a disease profile
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('disease_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Subscribe to real-time changes
   */
  subscribe(userId: string, callback: (payload: any) => void): RealtimeChannel {
    const channel = supabase
      .channel('disease-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'disease_profiles',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return channel;
  }

  /**
   * Map database row to DiseaseProfile type
   */
  private mapToDiseaseProfile(data: any): DiseaseProfile {
    return {
      id: data.id,
      userId: data.user_id,
      diseaseId: data.disease_id,
      diseaseName: data.disease_name,
      diagnosisDate: data.diagnosis_date,
      severity: data.severity,
      status: data.status,
      symptoms: data.symptoms,
      medications: data.medications,
      lastCheckup: data.last_checkup,
      nextCheckup: data.next_checkup,
      doctorName: data.doctor_name,
      doctorContact: data.doctor_contact,
      notes: data.notes,
      guidelines: data.guidelines,
      precautions: data.precautions,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const diseaseProfilesService = new DiseaseProfilesService();
