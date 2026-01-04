import { supabase, DEMO_MODE } from '../services/supabase';
import { Post, Reaction } from '../types/database.types';

/**
 * Posts API
 * Handles creating, reading, updating, and deleting posts
 */

export const postsAPI = {
  /**
   * Get all posts from friends (today's posts)
   */
  getFeedPosts: async (): Promise<{ posts: Post[]; error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Using mock posts');
      return { posts: [], error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    // Get posts from today only (BeReal style)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(*),
        reactions(*)
      `)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    return { posts: data || [], error };
  },

  /**
   * Create a new post
   */
  createPost: async (
    frontPhotoUrl: string,
    backPhotoUrl: string,
    postedLate: boolean = false,
    location?: string
  ): Promise<{ post: Post | null; error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock post creation');
      return { post: null, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { post: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        front_camera_url: frontPhotoUrl,
        back_camera_url: backPhotoUrl,
        posted_late: postedLate,
        moment_time: new Date().toISOString(),
        location,
      })
      .select(`
        *,
        user:users(*)
      `)
      .single();

    return { post: data, error };
  },

  /**
   * Delete a post
   */
  deletePost: async (postId: string): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock post deletion');
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    return { error };
  },

  /**
   * Add a reaction (emoji) to a post
   */
  addReaction: async (postId: string, emoji: string): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock reaction');
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    // Upsert reaction (update if exists, insert if not)
    const { error } = await supabase
      .from('reactions')
      .upsert({
        post_id: postId,
        user_id: user.id,
        emoji,
      }, {
        onConflict: 'post_id,user_id'
      });

    return { error };
  },

  /**
   * Remove a reaction from a post
   */
  removeReaction: async (postId: string): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock reaction removal');
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    return { error };
  },

  /**
   * Get reactions for a specific post
   */
  getPostReactions: async (postId: string): Promise<{ reactions: Reaction[]; error: any }> => {
    if (DEMO_MODE) {
      return { reactions: [], error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('reactions')
      .select(`
        *,
        user:users(*)
      `)
      .eq('post_id', postId);

    return { reactions: data || [], error };
  },

  /**
   * Upload photo to storage
   */
  uploadPhoto: async (
    uri: string,
    bucket: 'posts' | 'reactions' | 'profiles',
    filename: string
  ): Promise<{ url: string | null; error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock photo upload');
      return { url: uri, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    try {
      // Convert image URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        return { url: null, error };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  },

  /**
   * Subscribe to new posts (real-time)
   */
  subscribeToNewPosts: (callback: (post: Post) => void) => {
    if (DEMO_MODE || !supabase) {
      return () => {}; // Return no-op unsubscribe function
    }

    const channel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        async (payload) => {
          // Fetch full post data with user and reactions
          const { data } = await supabase
            .from('posts')
            .select(`
              *,
              user:users(*),
              reactions(*)
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            callback(data as Post);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Track post view
   */
  trackPostView: async (postId: string): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    // Upsert view (insert if not exists, ignore if exists)
    const { error } = await supabase
      .from('post_views')
      .upsert({
        post_id: postId,
        user_id: user.id,
      }, {
        onConflict: 'post_id,user_id',
        ignoreDuplicates: true,
      });

    return { error };
  },

  /**
   * Get view count for a post
   */
  getPostViewCount: async (postId: string): Promise<{ count: number; error: any }> => {
    if (DEMO_MODE) {
      return { count: 0, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { count, error } = await supabase
      .from('post_views')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    return { count: count || 0, error };
  },
};
