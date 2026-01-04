import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { getTodaysPosts, checkUserPostedToday } from '../api/posts';
import { Post } from '../types';

/**
 * Custom hook for managing feed state and operations
 */
export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const user = useStore((state) => state.user);
  const hasPostedToday = useStore((state) => state.hasPostedToday);
  const setHasPostedToday = useStore((state) => state.setHasPostedToday);
  
  useEffect(() => {
    loadFeed();
  }, [hasPostedToday]);
  
  const loadFeed = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Check if user has posted today
    const posted = await checkUserPostedToday(user.id);
    setHasPostedToday(posted);
    
    if (posted) {
      // Load feed posts
      const feedPosts = await getTodaysPosts(user.id);
      setPosts(feedPosts);
    }
    
    setLoading(false);
  };
  
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, [user]);
  
  return {
    posts,
    loading,
    refreshing,
    hasPostedToday,
    refresh,
    reload: loadFeed,
  };
};

