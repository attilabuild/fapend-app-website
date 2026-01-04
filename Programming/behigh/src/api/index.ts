/**
 * API Index
 * Central export for all API modules
 */

export { authAPI } from './auth';
export { postsAPI } from './posts';
export { friendsAPI } from './friends';
export { chatAPI } from './chat';
export { journalAPI } from './journal';
export { moderationAPI } from './moderation';

// Re-export types for convenience
export type {
  User,
  Post,
  Reaction,
  Friendship,
  ChatMessage,
  JournalEntry,
  DailyMoment,
} from '../types/database.types';

// Re-export Supabase client and DEMO_MODE flag
export { supabase, DEMO_MODE } from '../services/supabase';

