import { supabase, DEMO_MODE } from '../services/supabase';
import { ChatMessage } from '../types/database.types';

/**
 * Chat API
 * Handles direct messages between users
 */

export const chatAPI = {
  /**
   * Get all messages with a specific user
   */
  getMessages: async (friendId: string): Promise<{ messages: ChatMessage[]; error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Using mock messages');
      return { messages: [], error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { messages: [], error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:sender_id(*)
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    return { messages: data || [], error };
  },

  /**
   * Send a message
   */
  sendMessage: async (receiverId: string, message: string): Promise<{ message: ChatMessage | null; error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock send message');
      return { message: null, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { message: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message,
        read: false,
      })
      .select(`
        *,
        sender:sender_id(*)
      `)
      .single();

    return { message: data, error };
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (friendId: string): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('sender_id', friendId)
      .eq('receiver_id', user.id)
      .eq('read', false);

    return { error };
  },

  /**
   * Get unread message count
   */
  getUnreadCount: async (): Promise<{ count: number; error: any }> => {
    if (DEMO_MODE) {
      return { count: 0, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { count: 0, error: new Error('Not authenticated') };
    }

    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false);

    return { count: count || 0, error };
  },

  /**
   * Subscribe to new messages (real-time)
   */
  subscribeToMessages: (friendId: string, callback: (message: ChatMessage) => void) => {
    if (DEMO_MODE || !supabase) {
      return { unsubscribe: () => {} };
    }

    const channel = supabase
      .channel(`chat:${friendId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        channel.unsubscribe();
      },
    };
  },
};

