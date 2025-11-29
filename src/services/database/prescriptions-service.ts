import { supabase } from '@/lib/supabase';
import type { Prescription } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

class PrescriptionsService {
  /**
   * Upload prescription file to Supabase Storage
   */
  async uploadFile(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('prescriptions')
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('prescriptions')
      .getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Create a new prescription
   */
  async create(prescription: Omit<Prescription, 'id' | 'uploadedAt'>) {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        user_id: prescription.userId,
        file_name: prescription.fileName,
        file_url: prescription.fileUrl,
        parsed_medicines: prescription.parsedMedicines,
        status: prescription.status,
        analysis_result: prescription.analysisResult,
        linked_disease_profiles: prescription.linkedDiseaseProfiles,
        is_analyzed: prescription.isAnalyzed,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToPrescription(data);
  }

  /**
   * Get all prescriptions for a user
   */
  async getAll(userId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToPrescription);
  }

  /**
   * Get prescription by ID
   */
  async getById(id: string): Promise<Prescription> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.mapToPrescription(data);
  }

  /**
   * Update a prescription
   */
  async update(id: string, updates: Partial<Prescription>) {
    const { data, error } = await supabase
      .from('prescriptions')
      .update({
        parsed_medicines: updates.parsedMedicines,
        status: updates.status,
        analysis_result: updates.analysisResult,
        linked_disease_profiles: updates.linkedDiseaseProfiles,
        is_analyzed: updates.isAnalyzed,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToPrescription(data);
  }

  /**
   * Delete a prescription and its file
   */
  async delete(id: string) {
    // Get prescription to find file path
    const prescription = await this.getById(id);

    // Delete from database
    const { error: dbError } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    // Delete file from storage if exists
    if (prescription.fileUrl) {
      const filePath = prescription.fileUrl.split('/prescriptions/')[1];
      if (filePath) {
        await supabase.storage
          .from('prescriptions')
          .remove([filePath]);
      }
    }
  }

  /**
   * Subscribe to real-time changes
   */
  subscribe(userId: string, callback: (payload: any) => void): RealtimeChannel {
    const channel = supabase
      .channel('prescriptions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prescriptions',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return channel;
  }

  /**
   * Map database row to Prescription type
   */
  private mapToPrescription(data: any): Prescription {
    return {
      id: data.id,
      userId: data.user_id,
      fileName: data.file_name,
      uploadedAt: data.uploaded_at,
      parsedMedicines: data.parsed_medicines,
      status: data.status,
      analysisResult: data.analysis_result,
      linkedDiseaseProfiles: data.linked_disease_profiles,
      isAnalyzed: data.is_analyzed,
    };
  }
}

export const prescriptionsService = new PrescriptionsService();
