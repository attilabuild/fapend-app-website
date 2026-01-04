import { create } from 'zustand';
import { User, Post, Friendship } from '../types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Post state
  hasPostedToday: boolean;
  setHasPostedToday: (posted: boolean) => void;
  
  // Daily moment notification time
  todaysMomentTime: Date | null;
  setTodaysMomentTime: (time: Date | null) => void;
  
  // Feed posts
  feedPosts: Post[];
  setFeedPosts: (posts: Post[]) => void;
  
  // Friends
  friends: User[];
  setFriends: (friends: User[]) => void;
  
  // Friend requests (pending)
  friendRequests: Friendship[];
  setFriendRequests: (requests: Friendship[]) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Camera capture state (temporary storage before upload)
  frontPhoto: string | null;
  backPhoto: string | null;
  setFrontPhoto: (uri: string | null) => void;
  setBackPhoto: (uri: string | null) => void;
  clearPhotos: () => void;
  
  // User's post history (last 14 days)
  myPostHistory: Post[];
  setMyPostHistory: (posts: Post[]) => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  hasPostedToday: false,
  todaysMomentTime: null,
  feedPosts: [],
  friends: [],
  friendRequests: [],
  isLoading: false,
  frontPhoto: null,
  backPhoto: null,
  myPostHistory: [],
  
  // Setters
  setUser: (user) => set({ user }),
  setHasPostedToday: (posted) => set({ hasPostedToday: posted }),
  setTodaysMomentTime: (time) => set({ todaysMomentTime: time }),
  setFeedPosts: (posts) => set({ feedPosts: posts }),
  setFriends: (friends) => set({ friends }),
  setFriendRequests: (requests) => set({ friendRequests: requests }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setFrontPhoto: (uri) => set({ frontPhoto: uri }),
  setBackPhoto: (uri) => set({ backPhoto: uri }),
  clearPhotos: () => set({ frontPhoto: null, backPhoto: null }),
  setMyPostHistory: (posts) => set({ myPostHistory: posts }),
}));

