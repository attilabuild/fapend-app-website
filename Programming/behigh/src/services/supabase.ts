import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get Supabase credentials from environment variables or app config
// You can set these in:
// 1. .env file (recommended for development)
// 2. app.json extra field
// 3. Hardcode them here (not recommended for production)

// Lazy initialization to avoid native module errors at import time
let supabaseClient: SupabaseClient | null = null;
let _demoMode: boolean | null = null;
let _initialized = false;

// Safely get config values (only called when needed, not at module load)
// NOTE: We avoid using expo-constants at import time to prevent native module errors in Expo Go
function getConfigValue(key: 'supabaseUrl' | 'supabaseAnonKey'): string {
  // Try to get from process.env first (safer, no native module)
  try {
    if (typeof process !== 'undefined' && process.env) {
      const envKey = key === 'supabaseUrl' ? 'EXPO_PUBLIC_SUPABASE_URL' : 'EXPO_PUBLIC_SUPABASE_ANON_KEY';
      const value = process.env[envKey];
      if (value && value !== 'placeholder-key' && value !== 'https://placeholder.supabase.co') {
        return value;
      }
    }
  } catch (e) {
    // process.env not available
  }
  
  // Try to get from expo-constants (lazy load to avoid errors)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require('expo-constants');
    // Try multiple paths for expoConfig
    const config = Constants?.expoConfig || Constants?.default?.expoConfig;
    const value = config?.extra?.[key];
    if (value && value !== 'placeholder-key' && value !== 'https://placeholder.supabase.co') {
      console.log(`✅ Found ${key} from expo-constants`);
      return value;
    }
  } catch (e) {
    // Constants not available (e.g., in Expo Go)
    console.log('⚠️ expo-constants not available:', e.message);
  }
  
  // Temporary direct fallback for testing (remove in production)
  // TODO: Remove this and use proper config reading
  if (key === 'supabaseUrl') {
    return 'https://qtydvrvgxsfkoapbcpgh.supabase.co';
  } else {
    return 'sb_publishable_iJPIbC8OqY5XkuW6nW9UQQ_PzyUNgty';
  }
  
  // Return placeholder (will be configured via app.json or .env in production)
  // return key === 'supabaseUrl' ? 'https://placeholder.supabase.co' : 'placeholder-key';
}

function initializeSupabase(): SupabaseClient | null {
  if (_initialized) {
    return supabaseClient;
  }
  _initialized = true;

  const SUPABASE_URL = getConfigValue('supabaseUrl');
  const SUPABASE_ANON_KEY = getConfigValue('supabaseAnonKey');

  // Debug logging
  console.log('🔍 Supabase Config Check:');
  console.log('  URL:', SUPABASE_URL.substring(0, 30) + '...');
  console.log('  Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

  // Check if credentials are configured
  const isConfigured = 
    SUPABASE_URL !== 'https://placeholder.supabase.co' && 
    SUPABASE_ANON_KEY !== 'placeholder-key';

  _demoMode = !isConfigured;

  if (isConfigured) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
      console.log('✅ Supabase client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
      _demoMode = true;
    }
  } else {
    console.warn('⚠️ Supabase not configured. Running in DEMO MODE.');
    console.warn('📝 To enable Supabase:');
    console.warn('   1. Get your credentials from https://app.supabase.com');
    console.warn('   2. Update app.json with your credentials');
    console.warn('   3. Run the SQL schema from supabase-schema.sql in Supabase SQL editor');
  }

  return supabaseClient;
}

// Lazy getter - only initializes when first accessed
function getSupabaseClient(): SupabaseClient | null {
  return initializeSupabase();
}

// Export supabase - lazy initialization on first property access
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = getSupabaseClient();
    if (client === null) {
      // Return a no-op function for methods, null for properties
      if (typeof prop === 'string' && prop !== 'then') {
        return () => Promise.resolve({ data: null, error: { message: 'DEMO MODE: Supabase not configured' } });
      }
      return null;
    }
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
}) as SupabaseClient;

// Lazy getter for DEMO_MODE
export function getDemoMode(): boolean {
  if (_demoMode === null) {
    initializeSupabase();
  }
  return _demoMode ?? true;
}

// For backward compatibility - lazy getter
// Accessing this will trigger initialization, but only when actually used
let _demoModeExport: boolean | null = null;
export const DEMO_MODE = (() => {
  if (_demoModeExport === null) {
    _demoModeExport = getDemoMode();
  }
  return _demoModeExport;
})();

/*
 * SUPABASE DATABASE SCHEMA
 * 
 * Run these SQL commands in your Supabase SQL editor:
 * 
 * -- Enable UUID extension
 * CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
 * 
 * -- Users table (extends Supabase auth.users)
 * CREATE TABLE public.users (
 *   id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
 *   username TEXT UNIQUE NOT NULL,
 *   full_name TEXT NOT NULL,
 *   profile_picture_url TEXT,
 *   push_token TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Posts table
 * CREATE TABLE public.posts (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
 *   front_camera_url TEXT NOT NULL,
 *   back_camera_url TEXT NOT NULL,
 *   posted_late BOOLEAN DEFAULT false,
 *   moment_time TIMESTAMPTZ NOT NULL,
 *   location TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Reactions table (RealMoji)
 * CREATE TABLE public.reactions (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   post_id UUID REFERENCES public.posts ON DELETE CASCADE NOT NULL,
 *   user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
 *   emoji_image_url TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   UNIQUE(post_id, user_id)
 * );
 * 
 * -- Friendships table
 * CREATE TABLE public.friendships (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
 *   friend_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
 *   status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   UNIQUE(user_id, friend_id)
 * );
 * 
 * -- Daily moments table (tracks notification times)
 * CREATE TABLE public.daily_moments (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   date DATE UNIQUE NOT NULL,
 *   notification_time TIMESTAMPTZ NOT NULL
 * );
 * 
 * -- Indexes for performance
 * CREATE INDEX idx_posts_user_id ON public.posts(user_id);
 * CREATE INDEX idx_posts_created_at ON public.posts(created_at);
 * CREATE INDEX idx_reactions_post_id ON public.reactions(post_id);
 * CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
 * CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);
 * 
 * -- Row Level Security (RLS) Policies
 * ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
 * 
 * -- Users policies
 * CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
 * CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
 * CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
 * 
 * -- Posts policies
 * CREATE POLICY "Users can view friends' posts" ON public.posts FOR SELECT USING (
 *   user_id = auth.uid() OR 
 *   EXISTS (
 *     SELECT 1 FROM public.friendships 
 *     WHERE (user_id = auth.uid() AND friend_id = public.posts.user_id AND status = 'accepted')
 *     OR (friend_id = auth.uid() AND user_id = public.posts.user_id AND status = 'accepted')
 *   )
 * );
 * CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
 * CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);
 * 
 * -- Reactions policies
 * CREATE POLICY "Users can view reactions on visible posts" ON public.reactions FOR SELECT USING (true);
 * CREATE POLICY "Users can add reactions" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
 * CREATE POLICY "Users can delete own reactions" ON public.reactions FOR DELETE USING (auth.uid() = user_id);
 * 
 * -- Friendships policies
 * CREATE POLICY "Users can view own friendships" ON public.friendships FOR SELECT USING (
 *   user_id = auth.uid() OR friend_id = auth.uid()
 * );
 * CREATE POLICY "Users can create friendships" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
 * CREATE POLICY "Users can update friendships they're part of" ON public.friendships FOR UPDATE USING (
 *   user_id = auth.uid() OR friend_id = auth.uid()
 * );
 * 
 * -- Storage buckets for images
 * -- Create these in Supabase Storage dashboard:
 * -- 1. "posts" bucket (public)
 * -- 2. "reactions" bucket (public)
 * -- 3. "profiles" bucket (public)
 */

