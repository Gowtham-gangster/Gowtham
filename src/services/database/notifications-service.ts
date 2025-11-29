import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

class NotificationsService {
  /**
   * Create a new notification
   */
  async create(notification: Omit<Notification, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.userId,
        type: notification.type,
        message: notification.message,
        medicine_id: notification.medicineId,
        read: notification.read,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToNotification(data);
  }

  /**
   * Get all notifications for a user
   */
  async getAll(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToNotification);
  }

  /**
   * Get unread notifications
   */
  async getUnread(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data.map(this.mapToNotification);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToNotification(data);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  /**
   * Delete a notification
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('read', true);

    if (error) throw error;
  }

  /**
   * Subscribe to real-time changes
   */
  subscribe(userId: string, callback: (payload: any) => void): RealtimeChannel {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return channel;
  }

  /**
   * Map database row to Notification type
   */
  private mapToNotification(data: any): Notification {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      message: data.message,
      medicineId: data.medicine_id,
      read: data.read,
      createdAt: data.created_at,
    };
  }
}

export const notificationsService = new NotificationsService();
