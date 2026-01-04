import { supabase, DEMO_MODE } from '../services/supabase';
import { JournalEntry } from '../types/database.types';

/**
 * Journal API
 * Handles journal entries with voice recordings
 */

export const journalAPI = {
  /**
   * Get all journal entries for current user
   */
  getEntries: async (): Promise<{ entries: JournalEntry[]; error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Using mock journal entries');
      return { entries: [], error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { entries: [], error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { entries: data || [], error };
  },

  /**
   * Create a new journal entry
   */
  createEntry: async (
    text: string,
    duration: string,
    audioUrl?: string
  ): Promise<{ entry: JournalEntry | null; error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock journal entry creation');
      return { entry: null, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { entry: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        text,
        duration,
        audio_url: audioUrl,
      })
      .select()
      .single();

    return { entry: data, error };
  },

  /**
   * Update a journal entry
   */
  updateEntry: async (entryId: string, text: string): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock journal entry update');
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('journal_entries')
      .update({ text })
      .eq('id', entryId);

    return { error };
  },

  /**
   * Delete a journal entry
   */
  deleteEntry: async (entryId: string): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock journal entry deletion');
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId);

    return { error };
  },

  /**
   * Upload audio file to storage
   */
  uploadAudio: async (
    uri: string,
    filename: string
  ): Promise<{ url: string | null; error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock audio upload');
      return { url: uri, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    try {
      // Convert audio URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('journal')
        .upload(filename, blob, {
          contentType: 'audio/m4a',
          upsert: false,
        });

      if (error) {
        return { url: null, error };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('journal')
        .getPublicUrl(data.path);

      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  },
};

