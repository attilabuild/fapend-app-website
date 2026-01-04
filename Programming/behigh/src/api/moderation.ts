import { supabase, DEMO_MODE } from '../services/supabase';

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_post_id: string | null;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

/**
 * Content Moderation API
 * Handles reporting posts and users
 */
export const moderationAPI = {
  /**
   * Report a user
   */
  reportUser: async (
    userId: string,
    reason: string,
    description?: string
  ): Promise<{ report: Report | null; error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock user report');
      return { report: null, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { report: null, error: new Error('Not authenticated') };
    }

    // Prevent self-reporting
    if (user.id === userId) {
      return { report: null, error: new Error('Cannot report yourself') };
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_user_id: userId,
        reason,
        description: description || null,
        status: 'pending',
      })
      .select()
      .single();

    return { report: data, error };
  },

  /**
   * Report a post
   */
  reportPost: async (
    postId: string,
    reason: string,
    description?: string
  ): Promise<{ report: Report | null; error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock post report');
      return { report: null, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { report: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_post_id: postId,
        reason,
        description: description || null,
        status: 'pending',
      })
      .select()
      .single();

    return { report: data, error };
  },

  /**
   * Get user's reports
   */
  getMyReports: async (): Promise<{ reports: Report[]; error: any }> => {
    if (DEMO_MODE) {
      return { reports: [], error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { reports: [], error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false });

    return { reports: data || [], error };
  },
};
