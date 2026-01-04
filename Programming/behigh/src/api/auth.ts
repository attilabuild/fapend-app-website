import { supabase, DEMO_MODE } from '../services/supabase';
import { User } from '../types/database.types';

/**
 * Authentication API
 * Handles user signup, login, and session management
 */

export const authAPI = {
  /**
   * Sign up a new user with email and password
   */
  signUp: async (email: string, password: string, username: string, fullName: string) => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock sign up');
      return { user: { id: 'demo-user', email }, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    // Validate and clean email
    const trimmedEmail = email.trim().toLowerCase();
    console.log('📧 Attempting signup with email:', trimmedEmail);
    
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { user: null, error: new Error('Invalid email address') };
    }
    
    // Additional email validation
    const emailParts = trimmedEmail.split('@');
    if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1] || !emailParts[1].includes('.')) {
      return { user: null, error: new Error('Invalid email format') };
    }
    
    // 1. Create auth user with metadata (trigger will create profile automatically)
    console.log('🚀 Calling Supabase signUp...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
        emailRedirectTo: undefined, // Don't require email confirmation for now
      },
    });

    if (authError) {
      // Log the full error for debugging
      console.error('❌ Signup error details:', {
        message: authError.message,
        status: authError.status,
        name: authError.name,
        email: trimmedEmail,
      });
      
      // Check if it's an email validation error
      if (authError.message && authError.message.toLowerCase().includes('invalid')) {
        // This might be a Supabase configuration issue
        console.warn('⚠️ Supabase rejected email. Check Authentication settings in Supabase dashboard.');
        console.warn('   - Go to Authentication → Settings → Email Auth');
        console.warn('   - Make sure email validation is not too strict');
        console.warn('   - Check if email confirmation is required');
      }
      
      return { user: null, error: authError };
    }
    
    console.log('✅ Signup successful, user created:', authData.user?.id);
    
    if (!authData.user) {
      return { user: null, error: new Error('Failed to create user account') };
    }

    // 2. Wait for session to be established and trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Refresh session to ensure it's available
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('Session not available after signup, profile will be updated later');
      return { user: authData.user, error: null };
    }
    
    // Update profile with username and full_name
    // Use RPC or direct update with user ID
    const { error: profileError } = await supabase
      .from('users')
      .update({
        username,
        full_name: fullName,
      })
      .eq('id', authData.user.id);

    // If update fails, try insert as fallback (in case trigger didn't fire)
    if (profileError) {
      console.log('Update failed, trying insert:', profileError.message);
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username,
          full_name: fullName,
        });
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        // Don't fail signup if profile creation fails - user can update later
      }
    }

    return { user: authData.user, error: null };
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock sign in');
      return { user: { id: 'demo-user', email }, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data.user, error };
  },

  /**
   * Sign in with Apple (iOS)
   */
  signInWithApple: async () => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock Apple sign in');
      return { user: { id: 'demo-user' }, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    // This requires additional setup with Apple Developer account
    // For now, return a placeholder
    console.warn('Apple Sign In not fully implemented yet');
    return { user: null, error: new Error('Not implemented') };
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock sign out');
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Get the current user session
   */
  getSession: async () => {
    if (DEMO_MODE) {
      return { session: null, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  /**
   * Get the current user profile
   */
  getCurrentUser: async (): Promise<{ user: User | null; error: any }> => {
    if (DEMO_MODE) {
      return {
        user: {
          id: 'demo-user-1',
          username: 'demouser',
          full_name: 'Demo User',
          created_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return { user: null, error: null };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    return { user: data, error };
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates: Partial<User>) => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock profile update');
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    // Try to get user from session first
    let userId: string | null = null;
    
    // Method 1: Try getSession (more reliable immediately after signup)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      userId = session.user.id;
    } else {
      // Method 2: Try getUser
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }
    
    if (!userId) {
      console.error('No authenticated user found');
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    return { error };
  },

  /**
   * Check if username is available
   */
  checkUsernameAvailable: async (username: string): Promise<boolean> => {
    if (DEMO_MODE) {
      return true;
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    return !data && !error;
  },

  /**
   * Update push notification token
   */
  updatePushToken: async (token: string) => {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Mock push token update');
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    // Get current user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('users')
      .update({ push_token: token })
      .eq('id', authUser.id);

    if (error) {
      console.error('Error updating push token:', error);
    } else {
      console.log('✅ Push token updated for user:', authUser.id);
    }

    return { error };
  },
};
