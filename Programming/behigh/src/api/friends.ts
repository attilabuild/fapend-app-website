import { supabase, DEMO_MODE } from '../services/supabase';
import { User, Friendship } from '../types/database.types';

/**
 * Friends API
 * Handles friend requests, friendships, and friend searches
 */

export const friendsAPI = {
  /**
   * Get all accepted friends
   */
  getFriends: async (): Promise<{ friends: User[]; error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Using mock friends');
      return { friends: [], error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { friends: [], error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        friend:friend_id(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    const friends = data?.map((f: any) => f.friend) || [];
    return { friends, error };
  },

  /**
   * Get pending friend requests (received)
   */
  getFriendRequests: async (): Promise<{ requests: Friendship[]; error: any }> => {
    if (DEMO_MODE) {
      return { requests: [], error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { requests: [], error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        user:user_id(*)
      `)
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    return { requests: data || [], error };
  },

  /**
   * Get sent friend requests
   */
  getSentRequests: async (): Promise<{ requests: Friendship[]; error: any }> => {
    if (DEMO_MODE) {
      return { requests: [], error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { requests: [], error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        friend:friend_id(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'pending');

    return { requests: data || [], error };
  },

  /**
   * Send a friend request
   */
  sendFriendRequest: async (friendId: string): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock friend request');
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending',
      });

    return { error };
  },

  /**
   * Accept a friend request
   */
  acceptFriendRequest: async (friendshipId: string): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock accept request');
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    // Also create reverse friendship for easy querying
    if (!error) {
      const { data: friendship } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .eq('id', friendshipId)
        .single();

      if (friendship) {
        await supabase
          .from('friendships')
          .insert({
            user_id: friendship.friend_id,
            friend_id: friendship.user_id,
            status: 'accepted',
          });
      }
    }

    return { error };
  },

  /**
   * Decline a friend request
   */
  declineFriendRequest: async (friendshipId: string): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock decline request');
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    return { error };
  },

  /**
   * Remove a friend
   */
  removeFriend: async (friendId: string): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock remove friend');
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    // Delete both friendship records
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

    return { error };
  },

  /**
   * Search for users by username
   */
  searchUsers: async (query: string): Promise<{ users: User[]; error: any }> => {
    if (DEMO_MODE) {
      return { users: [], error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20);

    return { users: data || [], error };
  },

  /**
   * Get user by username
   */
  getUserByUsername: async (username: string): Promise<{ user: User | null; error: any }> => {
    if (DEMO_MODE) {
      return { user: null, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    return { user: data, error };
  },

  /**
   * Get suggested/popular users
   */
  getPopularUsers: async (): Promise<{ users: User[]; error: any }> => {
    if (DEMO_MODE) {
      return { users: [], error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { users: [], error: new Error('Not authenticated') };
    }

    // Get users who are not friends and not self
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .neq('id', user.id)
      .limit(10);

    return { users: data || [], error };
  },
};
